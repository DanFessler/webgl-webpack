import "./index.css";
import css from "./canvas.module.css";
import vertShaderSrc from "./shaders/main.vert";
import fragShaderSrc from "./shaders/main.frag";
import { mat4, mat3 } from "gl-matrix";
// const mat4 = require("gl-mat4");

import image from "./images/newportrait.gif";

// Create canvas
const canvasEl = document.createElement("canvas");
canvasEl.className = css.appCanvas;
document.getElementById("root").appendChild(canvasEl);
canvasEl.width = 1440;
canvasEl.height = 789;

// Update canvas size on resize
const resizer = new ResizeObserver(([element]) => {
  canvasEl.width = element.contentRect.width;
  canvasEl.height = element.contentRect.height;
  // render();
});

resizer.observe(document.getElementById("root"));

function loadTexture(gl: WebGLRenderingContext, url: string) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be downloaded over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );

  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value: number) {
  return (value & (value - 1)) == 0;
}

class Sprite {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  vel: { x: number; y: number } = { x: 0, y: 0 };
  angle: number = Math.random() * Math.PI * 2;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vel = {
      x: Math.sin(this.angle),
      y: Math.cos(this.angle),
    };
  }

  update() {
    this.x += this.vel.x;
    this.y += this.vel.y;

    if (this.x < 0) {
      this.x = 0;
      this.vel.x *= -1;
    }
    if (this.x > spritegl.canvas.width - this.width) {
      this.x = spritegl.canvas.width - this.width;
      this.vel.x *= -1;
    }
    if (this.y < 0) {
      this.y = 0;
      this.vel.y *= -1;
    }
    if (this.y > spritegl.canvas.height - this.height) {
      this.y = spritegl.canvas.height - this.height;
      this.vel.y *= -1;
    }
  }
}

type bufferData = {
  posBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
  bufferLength: number;
};

class main {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  texture: WebGLTexture;

  buffers: {
    [key: string]: bufferData;
  } = {
    DEFAULT: null,
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", {
      premultipliedAlpha: false, // Ask for non-premultiplied alpha
    });

    const vertShader = this.createShader(
      this.gl,
      this.gl.VERTEX_SHADER,
      vertShaderSrc
    );

    const fragShader = this.createShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      fragShaderSrc
    );

    this.shaderProgram = this.createProgram(this.gl, vertShader, fragShader);

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.texture = loadTexture(this.gl, image);
    // console.log(this.texture);
  }

  createShader(gl: WebGLRenderingContext, type: number, source: string) {
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

  createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  createBuffer(key: string, positions: number[], uvs?: number[]) {
    const posBuffer: WebGLBuffer = this.gl.createBuffer();
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
      bufferLength: positions.length,
      uvBuffer: uvBuffer,
    };
  }

  drawSprite(sprite: Sprite, buffer: string = "DEFAULT") {
    const [pos, uvs] = this.buildSpriteAttributes([sprite]);
    this.createBuffer(buffer, pos, uvs);
    this.draw(this.buffers[buffer]);
  }

  drawSprites(sprites: Sprite[]) {
    this.batchSprites(sprites);
    this.draw(this.buffers.DEFAULT);
  }

  draw(buffer: bufferData = this.buffers.DEFAULT) {
    if (!buffer) return;

    // look up where the vertex data needs to go.
    let posAttribLocation = this.gl.getAttribLocation(
      this.shaderProgram,
      "a_position"
    );

    let uvAttribLocation = this.gl.getAttribLocation(
      this.shaderProgram,
      "a_texCoord"
    );

    const viewMatrix = mat4.create();
    mat4.ortho(
      viewMatrix,
      0,
      this.gl.canvas.width,
      this.gl.canvas.height,
      0,
      0,
      1
    );
    // mat4.translate(viewMatrix, viewMatrix, [100, 100, 0]);

    // get matrix uniform location
    let matrixUniformLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "u_viewMatrix"
    );

    let uSamplerLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "uSampler"
    );

    // set uniform matrix
    this.gl.uniformMatrix4fv(matrixUniformLocation, false, viewMatrix);

    // actually draw now
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // clear
    this.gl.clearColor(0, 0, 0, 0);
    // this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.useProgram(this.shaderProgram);

    // bind vert positions
    this.gl.enableVertexAttribArray(posAttribLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.posBuffer);
    this.gl.vertexAttribPointer(posAttribLocation, 2, this.gl.FLOAT, false, 0, 0); //prettier-ignore

    // bind texture coords
    this.gl.enableVertexAttribArray(uvAttribLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.uvBuffer);
    this.gl.vertexAttribPointer(uvAttribLocation, 2, this.gl.FLOAT, true, 0, 0);

    // add texture
    // Tell WebGL we want to affect texture unit 0
    this.gl.activeTexture(this.gl.TEXTURE0);

    // Bind the texture to texture unit 0
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    // Tell the shader we bound the texture to texture unit 0
    this.gl.uniform1i(uSamplerLocation, 0);

    // console.log(positions.length, positions.length / 2);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, buffer.bufferLength / 2);
  }

  batchSprites(sprites: Sprite[], key: string = "DEFAULT") {
    const [points, uvs] = this.buildSpriteAttributes(sprites);

    // console.log(points);
    // this.setBuffer(points, uvs);
    this.createBuffer(key, points, uvs);
    // this.draw();
  }

  buildSpriteAttributes(sprites: Sprite[]) {
    const points = sprites
      .map((sprite) => {
        let x = Math.floor(sprite.x);
        let y = Math.floor(sprite.y);
        return [
          // 3----2       3
          // |            |
          // |            |
          // 1       1----2

          // first triangle
          x,
          y + sprite.height,

          x + sprite.width,
          y,

          x,
          y,

          // second triangle
          x,
          y + sprite.height,

          x + sprite.width,
          y + sprite.height,

          x + sprite.width,
          y,
        ];
      })
      .flat();

    const uvs = sprites
      .map((sprite) => {
        return [
          // 3----2       3
          // |            |
          // |            |
          // 1       1----2

          // first triangle
          0, 0, 1, 1, 0, 1,

          // second triangle
          0, 0, 1, 0, 1, 1,
        ];
      })
      .flat();

    return [points, uvs];
  }
}

const spritegl = new main(canvasEl);

// spritegl.drawSprite(new Sprite(0.0, 0.0, 0.1, 0.1));

const size = 100;
const sprites: Sprite[] = [];
for (let i = 0; i < 2500; i++) {
  sprites.push(
    new Sprite(
      Math.floor(Math.random() * (spritegl.canvas.clientWidth - size)),
      Math.floor(Math.random() * (spritegl.canvas.clientHeight - size)),
      size,
      size
    )
  );
}
// for (let y = 0; y < 64; y++) {
//   for (let x = 0; x < 128; x++) {
//     sprites.push(new Sprite(x * size, y * size, size, size));
//   }
// }

spritegl.batchSprites(sprites, "TEST");
// spritegl.createSpriteBatch(sprites);

const smoothing = 0.02;
let smoothFPS = 60;

window.requestAnimationFrame((t) => {
  draw(t, t + 1);
});

function draw(thisTime: DOMHighResTimeStamp, lastTime: DOMHighResTimeStamp) {
  // sprite update
  sprites.forEach((sprite) => {
    sprite.update();
  });

  // Static draw
  // spritegl.draw(spritegl.buffers.TEST);

  // Batched draw
  spritegl.drawSprites(sprites);

  // Non-batched draw
  // sprites.forEach((sprite) => spritegl.drawSprite(sprite));

  const FPS = 1 / ((thisTime - lastTime) / 1000);
  smoothFPS = FPS * smoothing + smoothFPS * (1.0 - smoothing);

  document.getElementById("fps").innerText = Math.round(smoothFPS) + "";
  window.requestAnimationFrame((nextTime) => draw(nextTime, thisTime));
}
