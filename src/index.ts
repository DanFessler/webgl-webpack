import "./index.css";
import css from "./canvas.module.css";
import vertShaderSrc from "./shaders/main.vert";
import fragShaderSrc from "./shaders/main.frag";
import { mat4 } from "gl-matrix";

import Sprite from "./Sprite";
import Texture, { TextureLoader } from "./Texture";

import image from "./images/newportrait.gif";
import image2 from "./images/newportrait2.gif";

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

type bufferData = {
  posBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
  bufferLength: number;
  texture: Texture;
};

class main {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  texture: Texture;

  buffers: {
    [key: string]: bufferData;
  } = {
    DEFAULT: null,
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", {
      premultipliedAlpha: false, // Ask for non-premultiplied alpha
      // alpha: false,
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
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    // this.gl.enable(this.gl.DEPTH_TEST);
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

  createBuffer(
    key: string,
    positions: number[],
    uvs: number[],
    texture: Texture
  ) {
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
      uvBuffer: uvBuffer,
      bufferLength: positions.length,
      texture: texture,
    };
  }

  drawSprite(sprite: Sprite, buffer: string = "DEFAULT") {
    const [pos, uvs] = this.buildSpriteAttributes([sprite]);
    this.createBuffer(buffer, pos, uvs, sprite.texture);
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
      100
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
    this.gl.vertexAttribPointer(posAttribLocation, 3, this.gl.FLOAT, false, 0, 0); //prettier-ignore

    // bind texture coords
    this.gl.enableVertexAttribArray(uvAttribLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.uvBuffer);
    this.gl.vertexAttribPointer(uvAttribLocation, 2, this.gl.FLOAT, true, 0, 0);

    // add texture
    // Tell WebGL we want to affect texture unit 0
    this.gl.activeTexture(this.gl.TEXTURE0);

    // Bind the texture to texture unit 0
    this.gl.bindTexture(this.gl.TEXTURE_2D, buffer.texture.glTexture);

    // Tell the shader we bound the texture to texture unit 0
    this.gl.uniform1i(uSamplerLocation, 0);

    // console.log(positions.length, positions.length / 2);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, buffer.bufferLength / 3);
  }

  batchSprites(sprites: Sprite[], key: string = "DEFAULT") {
    const [points, uvs] = this.buildSpriteAttributes(sprites);

    // console.log(points);
    // this.setBuffer(points, uvs);
    this.createBuffer(key, points, uvs, sprites[0].texture);
    // this.draw();
  }

  buildSpriteAttributes(sprites: Sprite[]) {
    let z = 0;
    const points = sprites
      // .sort((a, b) => b.depth - a.depth) // manual zdepth sort
      .map((sprite) => {
        let x = sprite.x;
        let y = sprite.y;
        // z = z - 0.01;
        return [
          // 3----2       3
          // |            |
          // |            |
          // 1       1----2

          // first triangle
          x,
          y + sprite.height,
          -sprite.depth,

          x + sprite.width,
          y,
          -sprite.depth,

          x,
          y,
          -sprite.depth,

          // second triangle
          x,
          y + sprite.height,
          -sprite.depth,

          x + sprite.width,
          y + sprite.height,
          -sprite.depth,

          x + sprite.width,
          y,
          -sprite.depth,
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
const loader = new TextureLoader(spritegl.gl, onLoad);
loader.add(image, "myTexture");
loader.add(image2, "myTexture2");
loader.load();

function onLoad(textures: { [url: string]: Texture }) {
  // spritegl.drawSprite(new Sprite(0.0, 0.0, 0.1, 0.1));

  const size = 100;
  const sprites: Sprite[] = [];
  for (let i = 0; i < 1000; i++) {
    sprites.push(
      new Sprite(
        Math.random() * (spritegl.canvas.clientWidth - size),
        Math.random() * (spritegl.canvas.clientHeight - size),
        size,
        size,
        0,
        Math.floor(Math.random() * 2) === 0
          ? textures.myTexture
          : textures.myTexture2
      )
    );
  }
  // for (let y = 0; y < 64; y++) {
  //   for (let x = 0; x < 128; x++) {
  //     sprites.push(new Sprite(x * size, y * size, size, size));
  //   }
  // }
  // sprites.push(new Sprite(0, 0, size, size, 0.5));
  // sprites.push(new Sprite(25, 25, size, size, 0));
  // sprites.push(new Sprite(50, 0, size, size, 10));

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
}
