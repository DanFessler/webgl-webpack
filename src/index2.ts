// import renderer from "./spriteRenderer";
import { Sprite, Texture, TextureLoader } from "./spritegl";
import MySprite from "./MySprite";

import { resizeCanvasToDisplaySize, createTexture } from "twgl.js";
import { createSpriteBatch } from "./spritebatch/index";

import css from "./canvas.module.css";

// image resources
import atlasURL from "./images/portrait_atlas.png";

const SPRITECOUNT = 100;

// Run Engine
function start() {
  const canvas: HTMLCanvasElement = document.createElement("canvas");
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
  type rect = [number, number, number, number];
  const atlasRects = [[0, 0, 0.5, 1] as rect, [0.5, 0, 1, 1] as rect];

  const fpsSmoothing = 0.02;
  let smoothFPS = 60;
  let thisTime = performance.now();
  let lastTime = thisTime;

  let mousedown = false;
  let mousepos = { x: 0, y: 0 };

  // add a sprite just to make sure things are working
  for (let i = 0; i < SPRITECOUNT; i++) {
    addSprite(Math.random() * 1000, Math.random() * 1000);
  }

  // event listeners
  canvas.addEventListener("mousedown", (e) => {
    mousedown = true;
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
    update();
    draw();
    updateFPS();
  }

  function update() {
    // add sprites on mouse down
    if (mousedown) {
      for (let i = 0; i < 100; i++) {
        addSprite(mousepos.x, mousepos.y);
      }
    }

    // sprite update
    sprites.forEach((sprite) => {
      sprite.update(thisTime - lastTime);
    });
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
        sprite.atlasRect
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
      Math.round(smoothFPS) + "\n" + sprites.length;
    window.requestAnimationFrame(tick);
  }

  function addSprite(x = 0, y = 0) {
    sprites.push(
      new MySprite(
        x - size / 2,
        y - size / 2,
        size,
        size,
        0,
        null,
        Math.floor(Math.random() * 2) === 0 ? atlasRects[0] : atlasRects[1],
        gl
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
