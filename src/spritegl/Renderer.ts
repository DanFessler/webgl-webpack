import Material from "./Material";
import vertShaderSrc from "./shaders/main.vert";
import fragShaderSrc from "./shaders/main.frag";
import { mat4 } from "gl-matrix";
import Texture from "./Texture";
import Sprite from "./Sprite";

const SPRITECOUNT = 100000;

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
    // let posBuffer: number[] = [];
    // let rectBuffer: number[] = [];
    // sprites.forEach((sprite) => {
    //   posBuffer.push(sprite.x, sprite.y);
    //   rectBuffer.push(...sprite.atlasRect);
    // });

    const { posBuffer, rectBuffer } = sprites.reduce(
      (buffers, sprite) => {
        buffers.posBuffer.push(sprite.x, sprite.y);
        buffers.rectBuffer.push(...sprite.atlasRect);
        return buffers;
      },
      { posBuffer: [], rectBuffer: [] }
    );

    this.createDynamicBuffers(key, posBuffer, sprites[0].texture, rectBuffer);
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
    atlasRects: number[]
  ) {
    if (!this.buffers[key]) {
      this.buffers[key] = {
        posBuffer: this.gl.createBuffer(),
        rectBuffer: this.gl.createBuffer(),
        texture: null,
        bufferLength: 0,
      };
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[key].posBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.DYNAMIC_DRAW
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[key].rectBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(atlasRects),
      this.gl.DYNAMIC_DRAW
    );

    this.buffers[key].texture = texture;
    this.buffers[key].bufferLength = positions.length / 2;
  }
}

export default Renderer;
