import { createProgramFromSources, m4 } from "twgl.js";

import fragmentShader from "./sprite_batch.frag";
import vertexShader from "./sprite_batch.vert";

const componentCount = 15;
const maxSpriteCount = 1024;
const fullTextureRegion: vec4 = [0, 0, 1, 1];

// type vec2 = [number, number];
// type vec3 = [number, number, number];
type vec4 = [number, number, number, number];
type sprite = {
  color: vec4;
  texture: WebGLTexture;
  x: number;
  y: number;
  width: number;
  height: number;
  region: vec4;
};

type attributes = {
  index: number;
  position: number;
  size: number;
  angle: number;
  region: number;
  color: number;
  effect: number;
};

class SpriteBatch {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  uniforms: any;
  attributes: attributes;
  buffer: WebGLBuffer;
  staticBuffer: WebGLBuffer;
  projView: m4.Mat4;
  bufferData: Float32Array;
  staticBufferData: Float32Array;
  spriteCounter: number;
  sprites: sprite[];
  color: vec4;
  isRendering: boolean = false;
  drawCallCount: number;

  constructor(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    uniforms: any,
    attributes: attributes,
    buffer: WebGLBuffer,
    staticBuffer: WebGLBuffer,
    projView: m4.Mat4
  ) {
    this.gl = gl;
    this.program = program;
    this.uniforms = uniforms;
    this.attributes = attributes;
    this.buffer = buffer;
    this.staticBuffer = staticBuffer;
    this.bufferData = new Float32Array(componentCount * maxSpriteCount).fill(1);
    this.staticBufferData = new Float32Array(
      [...new Array(maxSpriteCount)].map((sprite) => [0, 1, 2, 1, 2, 3]).flat()
    );
    this.spriteCounter = 0;
    this.sprites = [];
    this.color = [1, 1, 1, 1];
    this.projView = projView;
  }

  begin() {
    const { gl, attributes } = this;
    this.spriteCounter = 0;
    this.isRendering = true;
    this.drawCallCount = 0;

    gl.useProgram(this.program);
    gl.enableVertexAttribArray(attributes.index);
    gl.enableVertexAttribArray(attributes.position);
    gl.enableVertexAttribArray(attributes.size);
    gl.enableVertexAttribArray(attributes.angle);
    gl.enableVertexAttribArray(attributes.region);
    gl.enableVertexAttribArray(attributes.color);
    gl.enableVertexAttribArray(attributes.effect);
  }

  end() {
    const { gl, attributes } = this;
    this.flush();
    this.isRendering = false;

    // console.log(this.drawCallCount);

    gl.disableVertexAttribArray(attributes.index);
    gl.disableVertexAttribArray(attributes.position);
    gl.disableVertexAttribArray(attributes.size);
    gl.disableVertexAttribArray(attributes.angle);
    gl.disableVertexAttribArray(attributes.region);
    gl.disableVertexAttribArray(attributes.color);
    gl.disableVertexAttribArray(attributes.effect);
  }

  flush() {
    if (this.sprites.length > 0) {
      const { gl, bufferData } = this;
      const ext = gl.getExtension("ANGLE_instanced_arrays");

      this.drawCallCount += 1;

      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
        throw new Error("GLERROR " + error);
      }

      this.sprites.forEach((sprite, i) => {
        const index = i * componentCount;

        bufferData[index] = sprite.x;
        bufferData[index + 1] = sprite.y;
        bufferData[index + 2] = 1; //z
        bufferData[index + 3] = sprite.width;
        bufferData[index + 4] = sprite.height;
        bufferData[index + 5] = 1; //angle

        [
          bufferData[index + 6],
          bufferData[index + 7],
          bufferData[index + 8],
          bufferData[index + 9],
        ] = sprite.region;
        // console.log(sprite.region);

        [
          bufferData[index + 10],
          bufferData[index + 11],
          bufferData[index + 12],
          bufferData[index + 13],
        ] = sprite.color;

        bufferData[index + 14] = 0; //effect
      });

      const bufferWindow = this.bufferData.subarray(
        0,
        this.spriteCounter * componentCount
      );
      // console.log(bufferWindow);

      gl.bindTexture(gl.TEXTURE_2D, this.sprites[0].texture);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.staticBufferData, gl.STATIC_DRAW);
      gl.vertexAttribPointer(this.attributes.index, 1, gl.FLOAT, false, 0, 0);
      ext.vertexAttribDivisorANGLE(this.attributes.index, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, bufferWindow, gl.DYNAMIC_DRAW);

      const stride = 4 * componentCount;
      gl.vertexAttribPointer(
        this.attributes.position,
        3,
        gl.FLOAT,
        false,
        stride,
        0 * 4
      );
      ext.vertexAttribDivisorANGLE(this.attributes.position, 1);

      gl.vertexAttribPointer(
        this.attributes.size,
        2,
        gl.FLOAT,
        false,
        stride,
        3 * 4
      );
      ext.vertexAttribDivisorANGLE(this.attributes.size, 1);

      gl.vertexAttribPointer(
        this.attributes.angle,
        1,
        gl.FLOAT,
        false,
        stride,
        5 * 4
      );
      ext.vertexAttribDivisorANGLE(this.attributes.angle, 1);

      gl.vertexAttribPointer(
        this.attributes.region,
        4,
        gl.FLOAT,
        false,
        stride,
        6 * 4
      );
      ext.vertexAttribDivisorANGLE(this.attributes.region, 1);

      gl.vertexAttribPointer(
        this.attributes.color,
        4,
        gl.FLOAT,
        false,
        stride,
        10 * 4
      );
      ext.vertexAttribDivisorANGLE(this.attributes.color, 1);

      gl.vertexAttribPointer(
        this.attributes.effect,
        1,
        gl.FLOAT,
        false,
        stride,
        14 * 4
      );
      ext.vertexAttribDivisorANGLE(this.attributes.effect, 1);

      gl.uniformMatrix4fv(this.uniforms.projView, false, this.projView);

      ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, this.spriteCounter);
      // gl.drawArrays(gl.TRIANGLES, 0, 6 * this.spriteCounter);

      this.spriteCounter = 0;
      this.sprites = [];
    }
  }

  drawRegion(
    texture: WebGLTexture,
    x: number,
    y: number,
    width: number,
    height: number,
    region: vec4,
    color = this.color
  ) {
    if (!this.isRendering) {
      throw new Error("Call SpriteBatch.begin before beginning to render.");
    } else if (
      this.spriteCounter === maxSpriteCount &&
      this.sprites.length > 0
    ) {
      this.flush();
    }

    if (this.spriteCounter >= this.sprites.length) {
      this.sprites.push({
        color: color,
        texture,
        x,
        y,
        width,
        height,
        region,
      });
    } else {
      const sprite = this.sprites[this.spriteCounter];
      sprite.color = color;
      sprite.texture = texture;
      sprite.x = x;
      sprite.y = y;
      sprite.width = width;
      sprite.height = height;
      sprite.region = region;
    }

    this.spriteCounter += 1;
  }

  draw(
    texture: WebGLTexture,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.drawRegion(texture, x, y, width, height, fullTextureRegion);
  }

  resize(width: number, height: number) {
    this.projView = m4.ortho(0, width, height, 0, 0, 1);
  }

  setColor(rgba: vec4) {
    this.color = rgba;
  }
}

function createSpriteBatch(
  gl: WebGLRenderingContext,
  width = 640,
  height = 480
) {
  console.log("max", gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
  const program = createProgramFromSources(gl, [vertexShader, fragmentShader]);
  const uniforms = {
    projView: gl.getUniformLocation(program, "u_projView"),
    texture: gl.getUniformLocation(program, "u_texture"),
  };

  const attributes: attributes = {
    index: gl.getAttribLocation(program, "index"),
    position: gl.getAttribLocation(program, "position"),
    size: gl.getAttribLocation(program, "size"),
    angle: gl.getAttribLocation(program, "angle"),
    region: gl.getAttribLocation(program, "region"),
    color: gl.getAttribLocation(program, "color"),
    effect: gl.getAttribLocation(program, "effect"),
  };

  const buffer = gl.createBuffer();
  const staticBuffer = gl.createBuffer();

  const projView = m4.ortho(0, width, height, 0, 0, 1);

  return new SpriteBatch(
    gl,
    program,
    uniforms,
    attributes,
    buffer,
    staticBuffer,
    projView
  );
}

export { createSpriteBatch, SpriteBatch };
