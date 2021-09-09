import "./index.css";
import css from "./canvas.module.css";
import vertShaderSrc from "./shaders/main.vert";
import fragShaderSrc from "./shaders/main.frag";

// Create canvas
const canvasEl = document.createElement("canvas");
canvasEl.className = css.appCanvas;
document.getElementById("root").appendChild(canvasEl);
canvasEl.width = 640;
canvasEl.height = 480;

// Update canvas size on resize
const resizer = new ResizeObserver(([element]) => {
  canvasEl.width = element.contentRect.width;
  canvasEl.height = element.contentRect.height;
  // render();
});

class Sprite {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

class main {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  buffer: WebGLBuffer;
  bufferLength: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl");

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

  setBuffer(positions: number[]) {
    // create a bugger and put points in it
    const posBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.STATIC_DRAW
    );
    this.buffer = posBuffer;
    this.bufferLength = positions.length;
  }

  draw() {
    // look up where the vertex data needs to go.
    let posAttribLocation = this.gl.getAttribLocation(
      this.shaderProgram,
      "a_position"
    );

    // actually draw now
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // clear
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.useProgram(this.shaderProgram);

    this.gl.enableVertexAttribArray(posAttribLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.vertexAttribPointer(
      posAttribLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // console.log(positions.length, positions.length / 2);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.bufferLength / 2);
  }

  drawSprites(sprites: Sprite[]) {
    const points = sprites
      .map((sprite) => {
        return [
          // 3----2       3
          // |            |
          // |            |
          // 1       1----2

          // first triangle
          sprite.x,
          sprite.y,
          sprite.x + sprite.width,
          sprite.y,
          sprite.x + sprite.width,
          sprite.y + sprite.height,

          // second triangle
          sprite.x,
          sprite.y,
          sprite.x + sprite.width,
          sprite.y + sprite.height,
          sprite.x,
          sprite.y + sprite.height,
        ];
      })
      .flat();

    // console.log(points);
    this.draw();
  }
}

const spritegl = new main(canvasEl);

// spritegl.drawSprite(new Sprite(0.0, 0.0, 0.1, 0.1));

const sprites = [];
for (let i = 0; i < 500000; i++) {
  sprites.push(
    new Sprite(Math.random() * 2 - 1, Math.random() * 2 - 1, 0.01, 0.01)
  );
}

const points = sprites
  .map((sprite) => {
    return [
      // 3----2       3
      // |            |
      // |            |
      // 1       1----2

      // first triangle
      sprite.x,
      sprite.y,
      sprite.x + sprite.width,
      sprite.y,
      sprite.x + sprite.width,
      sprite.y + sprite.height,

      // second triangle
      sprite.x,
      sprite.y,
      sprite.x + sprite.width,
      sprite.y + sprite.height,
      sprite.x,
      sprite.y + sprite.height,
    ];
  })
  .flat();

spritegl.setBuffer(points);

const smoothing = 0.02;
let smoothFPS = 60;

window.requestAnimationFrame((t) => {
  draw(t, t + 1);
});

function draw(thisTime: DOMHighResTimeStamp, lastTime: DOMHighResTimeStamp) {
  // spritegl.drawSprites(sprites);
  spritegl.draw();

  const FPS = 1 / ((thisTime - lastTime) / 1000);
  smoothFPS = FPS * smoothing + smoothFPS * (1.0 - smoothing);

  // document.getElementById("fps").innerText =
  //   Math.round(FPS * 100) / 100 + "\n" + Math.round(smoothFPS);

  document.getElementById("fps").innerText = Math.round(smoothFPS) + "";
  window.requestAnimationFrame((nextTime) => draw(nextTime, thisTime));
}
