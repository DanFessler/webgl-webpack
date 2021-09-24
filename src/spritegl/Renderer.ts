import Material from "./Material";
import vertShaderSrc from "./shaders/main.vert";
import fragShaderSrc from "./shaders/main.frag";
import { mat4 } from "gl-matrix";
import Texture from "./Texture";
import Sprite from "./Sprite";

const SPRITECOUNT = 100000;

type bufferData = {
  bufferLength: number;
  texture: Texture;
  pointBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
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

  spritePositionBuffer: number[] = [];
  spriteRectBuffer: number[] = [];

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

    // set material texture
    this.material.setTexture(buffer.texture.glTexture);

    // set sprite positions
    this.material.setAttribute("points", buffer.pointBuffer, 2, this.gl.FLOAT);

    // set sprite positions
    this.material.setAttribute("coords", buffer.uvBuffer, 2, this.gl.FLOAT);

    // draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, buffer.bufferLength);
  }

  batchSprites(sprites: Sprite[], key: string = "DEFAULT") {
    // let posBuffer: number[] = [];
    // let rectBuffer: number[] = [];
    // sprites.forEach((sprite) => {
    //   posBuffer.push(sprite.x, sprite.y);
    //   rectBuffer.push(...sprite.atlasRect);
    // });

    const { pointBuffer, uvBuffer } = sprites.reduce(
      (buffers, sprite) => {
        // prettier-ignore
        // build vert buffer
        buffers.pointBuffer.push(
          0 + sprite.x, 100 + sprite.y,
          100 + sprite.x, 0 + sprite.y,
          0 + sprite.x, 0 + sprite.y,

          0 + sprite.x, 100 + sprite.y,
          100 + sprite.x, 100 + sprite.y,
          100 + sprite.x, 0 + sprite.y
        );

        // prettier-ignore
        // build uv buffer
        buffers.uvBuffer.push(
          sprite.atlasRect[0], sprite.atlasRect[1], 
          sprite.atlasRect[0] + sprite.atlasRect[2], sprite.atlasRect[1] + sprite.atlasRect[3], 
          sprite.atlasRect[0], sprite.atlasRect[1] + sprite.atlasRect[3], 

          sprite.atlasRect[0], sprite.atlasRect[1], 
          sprite.atlasRect[0] + sprite.atlasRect[2],sprite.atlasRect[1], 
          sprite.atlasRect[0] + sprite.atlasRect[2], sprite.atlasRect[1] + sprite.atlasRect[3], 
        );
        return buffers;
      },
      { pointBuffer: [], uvBuffer: [] }
    );

    this.createDynamicBuffers(key, pointBuffer, uvBuffer, sprites[0].texture);
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
    points: number[],
    uvs: number[],
    texture: Texture
  ) {
    if (!this.buffers[key]) {
      this.buffers[key] = {
        pointBuffer: this.gl.createBuffer(),
        uvBuffer: this.gl.createBuffer(),
        texture: null,
        bufferLength: 0,
      };
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[key].pointBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(points),
      this.gl.DYNAMIC_DRAW
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[key].uvBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(uvs),
      this.gl.DYNAMIC_DRAW
    );

    // console.log(points.length / 2, positions.length / 2);
    this.buffers[key].texture = texture;
    this.buffers[key].bufferLength = points.length / 2;
  }
}

export default Renderer;
