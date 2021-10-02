// import renderer from "./spriteRenderer";
import { Sprite, Texture, TextureLoader } from "./spritegl";
import MySprite from "./MySprite";

import { resizeCanvasToDisplaySize, createTexture } from "twgl.js";
import { createSpriteBatch } from "./spritebatch/sprite_batch_ts";

import css from "./canvas.module.css";

// image resources
import atlasURL from "./images/portrait_atlas.png";

type vec4 = [number, number, number, number];

const SPRITECOUNT = 4000;

// Run Engine
function start() {
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  canvas.className = css.appCanvas;

  // append canvas to document
  document.getElementById("root").appendChild(canvas);

  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: false, // Ask for non-premultiplied alpha
  });

  const resizer = new ResizeObserver(([element]) => {
    // set size of canvas element
    canvas.width = element.contentRect.width;
    canvas.height = element.contentRect.height;

    // actually draw now
    gl.viewport(0, 0, canvas.width, canvas.height);
  });
  resizer.observe(canvas);

  const size = 100;
  const sprites: Sprite[] = [];
  const spriteBatch = createSpriteBatch(gl);
  const myTexture = createTexture(gl, {
    src: atlasURL,
  });
  type rect = vec4;
  const atlasRects = [[0, 0, 0.5, 1] as rect, [0.5, 0, 1, 1] as rect];

  const fpsSmoothing = 0.02;
  let smoothFPS = 60;
  let thisTime = performance.now();
  let lastTime = thisTime - 1;

  let mousedown = false;
  let mousepos = { x: 0, y: 0 };
  let color: vec4 = [1, 1, 1, 1];

  // add a sprite just to make sure things are working
  for (let i = 0; i < SPRITECOUNT; i++) {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    // const x = i * 100 + 450;
    // const y = 400 + 50;
    // console.log("x,y", x, y);
    const color: vec4 = [
      Math.random() * 0.5 + 0.5,
      Math.random() * 0.5 + 0.5,
      Math.random() * 0.5 + 0.5,
      1,
    ];
    addSprite(x, y, color);
  }
  // sprites.forEach((sprite, i) => {
  //   sprite.update(thisTime - lastTime);
  //   console.log(i, sprite.x, sprite.y);
  // });

  // event listeners
  canvas.addEventListener("mousedown", (e) => {
    mousedown = true;
    newColor();
    mousepos = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener("mouseup", () => {
    mousedown = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    mousepos = { x: e.clientX, y: e.clientY };
  });

  window.requestAnimationFrame(tick);

  function tick() {
    // console.log(sprites);
    update();
    draw();
    updateFPS();
    window.requestAnimationFrame(tick);
  }

  function newColor() {
    color = [
      Math.random() * 0.75 + 0.25,
      Math.random() * 0.75 + 0.25,
      Math.random() * 0.75 + 0.25,
      1,
    ];
  }

  function update() {
    // add sprites on mouse down
    if (mousedown) {
      for (let i = 0; i < 100; i++) {
        if (sprites.length % 1000 === 0) newColor();
        addSprite(mousepos.x, mousepos.y, color);
      }
    }

    // sprite update
    for (let i = 0; i < sprites.length; i++) {
      sprites[i].update(thisTime - lastTime);
    }
  }

  function draw() {
    spriteBatch.resize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    spriteBatch.begin();
    sprites.forEach((sprite) => {
      spriteBatch.drawRegion(
        myTexture,
        sprite.x,
        sprite.y,
        100,
        100,
        sprite.atlasRect,
        sprite.color
      );
    });
    spriteBatch.end();
  }

  function updateFPS() {
    lastTime = thisTime;
    thisTime = performance.now();
    const FPS = 1 / ((thisTime - lastTime) / 1000);
    smoothFPS = FPS * fpsSmoothing + smoothFPS * (1.0 - fpsSmoothing);

    document.getElementById("fps").innerText =
      Math.round(FPS) + "\n" + Math.round(smoothFPS) + "\n" + sprites.length;
  }

  function addSprite(x = 0, y = 0, color: vec4 = [1, 1, 1, 1]) {
    // console.log(x, y);
    sprites.push(
      new MySprite(
        x - size / 2,
        y - size / 2,
        size,
        size,
        0,
        null,
        Math.floor(Math.random() * 2) === 0 ? atlasRects[0] : atlasRects[0],
        gl,
        color
      )
    );

    // set initial velocity
    let angle = Math.random() * Math.PI * 2;
    let speed = Math.random() * 2 + 4;
    sprites[sprites.length - 1].vel = {
      x: Math.sin(angle) * speed,
      y: Math.cos(angle) * speed,
    };
  }
}

start();
