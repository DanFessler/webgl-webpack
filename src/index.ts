import "./index.css";
import css from "./canvas.module.css";
import vertShaderSrc from "./shaders/main.vert";
import fragShaderSrc from "./shaders/main.frag";
import { mat4, mat3 } from "gl-matrix";
// const mat4 = require("gl-mat4");

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

    if (this.x < 0 || this.x > spritegl.canvas.width - this.width)
      this.vel.x *= -1;
    if (this.y < 0 || this.y > spritegl.canvas.height - this.height)
      this.vel.y *= -1;
  }
}

class main {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  posBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
  posBufferLength: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", {
      alpha: false,
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

  setBuffer(positions: number[], uvs?: number[]) {
    // create a bugger and put points in it
    const posBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.DYNAMIC_DRAW
    );
    this.posBuffer = posBuffer;
    this.posBufferLength = positions.length;

    const uvBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(uvs),
      this.gl.DYNAMIC_DRAW
    );

    this.uvBuffer = uvBuffer;
  }

  draw() {
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
      this.gl.canvas.clientWidth,
      this.gl.canvas.clientHeight,
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
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuffer);
    this.gl.vertexAttribPointer(posAttribLocation, 2, this.gl.FLOAT, false, 0, 0); //prettier-ignore

    // bind texture coords
    this.gl.enableVertexAttribArray(uvAttribLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);
    this.gl.vertexAttribPointer(uvAttribLocation, 2, this.gl.FLOAT, true, 0, 0);

    // console.log(positions.length, positions.length / 2);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.posBufferLength / 2);
  }

  batchSprites(sprites: Sprite[]) {
    const points = sprites
      .map((sprite) => {
        return [
          // 3----2       3
          // |            |
          // |            |
          // 1       1----2

          // first triangle
          sprite.x,
          sprite.y + sprite.height,

          sprite.x + sprite.width,
          sprite.y,

          sprite.x,
          sprite.y,

          // second triangle
          sprite.x,
          sprite.y + sprite.height,

          sprite.x + sprite.width,
          sprite.y + sprite.height,

          sprite.x + sprite.width,
          sprite.y,
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

    // console.log(points);
    this.setBuffer(points, uvs);
    // this.draw();
  }
}

const spritegl = new main(canvasEl);

// spritegl.drawSprite(new Sprite(0.0, 0.0, 0.1, 0.1));

const size = 32;
const sprites: Sprite[] = [];
for (let i = 0; i < 3000; i++) {
  sprites.push(
    new Sprite(
      Math.floor(Math.random() * (spritegl.canvas.clientWidth - size)),
      Math.floor(Math.random() * (spritegl.canvas.clientHeight - size)),
      size,
      size
    )
  );
}
spritegl.batchSprites(sprites);

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

  // Batched draw
  spritegl.batchSprites(sprites);
  spritegl.draw();

  // Non-batched draw
  // sprites.forEach((sprite) => {
  //   spritegl.drawSprites([sprite]);
  //   spritegl.draw();
  // });

  const FPS = 1 / ((thisTime - lastTime) / 1000);
  smoothFPS = FPS * smoothing + smoothFPS * (1.0 - smoothing);

  // document.getElementById("fps").innerText =
  //   Math.round(FPS * 100) / 100 + "\n" + Math.round(smoothFPS);

  document.getElementById("fps").innerText = Math.round(smoothFPS) + "";
  window.requestAnimationFrame((nextTime) => draw(nextTime, thisTime));
}
