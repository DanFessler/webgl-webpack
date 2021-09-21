import vertShaderSrc from "./shaders/main.vert";
import fragShaderSrc from "./shaders/main.frag";
import { mat4 } from "gl-matrix";
import Texture from "./Texture";
import Sprite from "./Sprite";

const constPositions = new Array(20000).fill([0, 0]).flat();

type bufferData = {
  posBuffer: WebGLBuffer;
  bufferLength: number;
  texture: Texture;
  rectBuffer: WebGLBuffer;
};

type constructorTypes = {
  canvas?: HTMLCanvasElement;
  width?: number;
  height?: number;
  className?: string;
};

class Material {
  gl: WebGLRenderingContext;
  shader: WebGLProgram;

  locations: {
    attributes: {
      points: number;
      coords: number;
      position: number;
      rect: number;
    };
    uniforms: {
      matrix: WebGLUniformLocation;
      sampler: WebGLUniformLocation;
    };
  } = { attributes: null, uniforms: null };

  constructor(
    gl: WebGLRenderingContext,
    vertShader: string,
    fragShader: string
  ) {
    this.gl = gl;

    this.shader = this.createProgram(vertShader, fragShader);

    this.locations = {
      attributes: {
        points: this.gl.getAttribLocation(this.shader, "a_point"),
        coords: this.gl.getAttribLocation(this.shader, "a_texCoord"),
        position: this.gl.getAttribLocation(this.shader, "a_position"),
        rect: this.gl.getAttribLocation(this.shader, "a_uvRect"),
      },
      uniforms: {
        matrix: this.gl.getUniformLocation(this.shader, "u_viewMatrix"),
        sampler: this.gl.getUniformLocation(this.shader, "uSampler"),
      },
    };
  }

  createProgram(vertShaderSrc: string, fragShaderSrc: string) {
    const gl = this.gl;
    var program = gl.createProgram();

    gl.attachShader(
      program,
      this.createShader(gl.VERTEX_SHADER, vertShaderSrc)
    );
    gl.attachShader(
      program,
      this.createShader(gl.FRAGMENT_SHADER, fragShaderSrc)
    );

    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  createShader(type: number, source: string) {
    const gl = this.gl;

    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }
}

class Renderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  texture: Texture;
  pointBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
  material: Material;

  buffers: {
    [key: string]: bufferData;
  } = {
    DEFAULT: null,
  };

  constructor({ canvas, width, height, className }: constructorTypes) {
    // Set up canvas
    this.canvas = canvas ? canvas : document.createElement("canvas");
    this.canvas.width = width || 640;
    this.canvas.height = height || 480;
    if (className) this.canvas.className = className;

    // keep canvas size pixel perfect
    const resizer = new ResizeObserver(([element]) => {
      this.canvas.width = element.contentRect.width;
      this.canvas.height = element.contentRect.height;
    });
    resizer.observe(this.canvas);

    // get webgl context
    this.gl = this.canvas.getContext("webgl", {
      premultipliedAlpha: false, // Ask for non-premultiplied alpha
    });

    // Flip texture Y default
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    // Set up alpha blend
    // this.gl.enable(this.gl.BLEND);
    // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    // this.gl.enable(this.gl.DEPTH_TEST);

    // Set up quad vert buffer
    this.pointBuffer = this.createStaticBuffer([
      0, 100, 100, 0, 0, 0, 0, 100, 100, 100, 100, 0,
    ]);

    // set up quad UV buffer
    this.uvBuffer = this.createStaticBuffer([
      0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,
    ]);

    this.material = new Material(this.gl, vertShaderSrc, fragShaderSrc);
    // this.setMaterial();
  }

  setMaterial() {
    // create shader program
    // this.shaderProgram = this.createProgram(vertShaderSrc, fragShaderSrc);
  }

  drawSprite(sprite: Sprite) {
    this.batchSprites([sprite]);
    this.draw(this.buffers.DEFAULT);
  }

  drawSprites(sprites: Sprite[]) {
    if (!sprites.length) return;
    this.batchSprites(sprites);
    this.draw(this.buffers.DEFAULT);
  }

  draw(buffer: bufferData = this.buffers.DEFAULT) {
    if (!buffer) return;

    const ext = this.gl.getExtension("ANGLE_instanced_arrays");
    const locations = this.material.locations;

    const viewMatrix = mat4.create();
    mat4.ortho(
      viewMatrix,
      0,
      this.gl.canvas.width,
      this.gl.canvas.height,
      0,
      0,
      100
    );
    // mat4.translate(viewMatrix, viewMatrix, [100, 100, 0]);

    // get matrix uniform location
    let matrixUniformLocation = this.gl.getUniformLocation(
      this.material.shader,
      "u_viewMatrix"
    );

    let uSamplerLocation = this.gl.getUniformLocation(
      this.material.shader,
      "uSampler"
    );

    // set uniform matrix
    this.gl.uniformMatrix4fv(locations.uniforms.matrix, false, viewMatrix);

    // actually draw now
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // clear
    this.gl.clearColor(0, 0, 0, 0);
    // this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.useProgram(this.material.shader);

    // bind vert positions
    this.gl.enableVertexAttribArray(locations.attributes.points);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointBuffer);
    this.gl.vertexAttribPointer(locations.attributes.points, 2, this.gl.FLOAT, false, 0, 0); //prettier-ignore

    // bind texture coords
    this.gl.enableVertexAttribArray(locations.attributes.coords);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);
    this.gl.vertexAttribPointer(
      locations.attributes.coords,
      2,
      this.gl.FLOAT,
      true,
      0,
      0
    );

    // add texture
    // Tell WebGL we want to affect texture unit 0
    this.gl.activeTexture(this.gl.TEXTURE0);

    // Bind the texture to texture unit 0
    this.gl.bindTexture(this.gl.TEXTURE_2D, buffer.texture.glTexture);

    // Tell the shader we bound the texture to texture unit 0
    this.gl.uniform1i(locations.uniforms.sampler, 0);

    const posAttribLocation = this.gl.getAttribLocation(
      this.material.shader,
      "a_position"
    );

    // bind positions
    this.gl.enableVertexAttribArray(posAttribLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.posBuffer);
    this.gl.vertexAttribPointer(
      posAttribLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    ext.vertexAttribDivisorANGLE(posAttribLocation, 1);

    const rectAttribLocation = this.gl.getAttribLocation(
      this.material.shader,
      "a_uvRect"
    );

    // bind uv rects
    this.gl.enableVertexAttribArray(rectAttribLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.rectBuffer);
    this.gl.vertexAttribPointer(
      rectAttribLocation,
      4,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    ext.vertexAttribDivisorANGLE(rectAttribLocation, 1);

    // console.log(positions.length, positions.length / 2);
    // this.gl.drawArrays(this.gl.TRIANGLES, 0, buffer.bufferLength / 2);
    ext.drawArraysInstancedANGLE(this.gl.TRIANGLES, 0, 6, buffer.bufferLength);
  }

  batchSprites(sprites: Sprite[], key: string = "DEFAULT") {
    let positions: number[] = [];
    let uvs: number[] = [];

    // console.log(sprites[0]);
    sprites.forEach((sprite) => {
      positions.push(sprite.x, sprite.y);
      // uvs.push(...[0, 0, 0.5, 1]);
      uvs.push(...sprite.atlasRect);
    });
    // console.log(uvs);

    this.createDynamicBuffers(key, positions, sprites[0].texture, uvs);
  }

  createStaticBuffer(array: number[]) {
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(array),
      this.gl.STATIC_DRAW
    );
    return buffer;
  }

  createDynamicBuffers(
    key: string,
    positions: number[],
    texture: Texture,
    uvs: number[]
  ) {
    const posBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.DYNAMIC_DRAW
    );

    const uvBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(uvs),
      this.gl.DYNAMIC_DRAW
    );

    this.buffers[key] = {
      posBuffer: posBuffer,
      bufferLength: positions.length / 2,
      texture: texture,
      rectBuffer: uvBuffer,
    };
  }
}

export default Renderer;
