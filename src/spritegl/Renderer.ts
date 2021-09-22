import Material from "./Material";
import vertShaderSrc from "./shaders/main.vert";
import fragShaderSrc from "./shaders/main.frag";
import { mat4 } from "gl-matrix";
import Texture from "./Texture";
import Sprite from "./Sprite";

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

class Renderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  texture: Texture;
  pointBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
  material: Material;

  spritePositionBuffer: Float32Array = new Float32Array();

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

    // get webgl context
    this.gl = this.canvas.getContext("webgl", {
      premultipliedAlpha: false, // Ask for non-premultiplied alpha
    });

    // keep canvas size pixel perfect
    const resizer = new ResizeObserver(([element]) => {
      // set size of canvas element
      this.canvas.width = element.contentRect.width;
      this.canvas.height = element.contentRect.height;

      // set pixel resolution of the view matrix
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

      // update view matrix on shader
      this.gl.uniformMatrix4fv(
        this.material.locations.uniforms.matrix,
        false,
        viewMatrix
      );

      // actually draw now
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    });
    resizer.observe(this.canvas);

    // Flip texture Y default
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    // clear
    this.gl.clearColor(0, 0, 0, 0);
    // this.gl.clear(this.gl.COLOR_BUFFER_BIT);

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

  createSprite(
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number = 0,
    texture: Texture,
    atlasRect: [number, number, number, number]
  ) {
    const index = this.spritePositionBuffer.length;

    // TODO:
    // creating new float32 array is expensive!

    const newBuffer = new Float32Array(this.spritePositionBuffer.length + 2);
    // console.log(this.spritePositionBuffer);
    newBuffer.set(this.spritePositionBuffer);
    newBuffer.set([x, y], index);
    this.spritePositionBuffer = newBuffer;

    return new Sprite(
      x,
      y,
      width,
      height,
      depth,
      texture,
      atlasRect,
      this,
      index
    );
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

    // set material texture
    this.material.setTexture(buffer.texture.glTexture);

    // set sprite positions
    this.material.setAttribute(
      "position",
      buffer.posBuffer,
      2,
      this.gl.FLOAT,
      1
    );

    // set sprite's atlas rects
    this.material.setAttribute("rect", buffer.rectBuffer, 4, this.gl.FLOAT, 1);

    // draw sprite instances
    ext.drawArraysInstancedANGLE(this.gl.TRIANGLES, 0, 6, buffer.bufferLength);
  }

  batchSprites(sprites: Sprite[], key: string = "DEFAULT") {
    // let positions: number[] = [];
    let uvs: number[] = [];

    sprites.forEach((sprite) => {
      // positions.push(sprite.x, sprite.y);
      uvs.push(...sprite.atlasRect);
    });

    this.createDynamicBuffers(
      key,
      this.spritePositionBuffer,
      sprites[0].texture,
      uvs
    );
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
    positions: Float32Array,
    texture: Texture,
    uvs: number[]
  ) {
    const posBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.DYNAMIC_DRAW);

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
