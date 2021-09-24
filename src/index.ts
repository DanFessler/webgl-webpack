import spritegl from "./spriteRenderer";
import { Sprite, Texture, TextureLoader } from "./spritegl";
import MySprite from "./MySprite";

// image resources
import atlasURL from "./images/portrait_atlas.png";

const SPRITECOUNT = 50000;

type atlasType = {
  texture: string;
  width: number;
  height: number;
  rects: [number, number, number, number][];
};

// atlas
const atlas: atlasType = {
  texture: atlasURL,
  width: 200,
  height: 100,
  rects: [
    [0, 0, 0.5, 1],
    [0.5, 0, 0.5, 1],
  ],
};

// Load textures
const loader = new TextureLoader(spritegl.gl, start);
loader.add(atlasURL, "myAtlas");
loader.load();

// Run Engine
function start(textures: { [url: string]: Texture }) {
  const size = 100;
  const sprites: Sprite[] = [];

  // add a sprite just to make sure things are working
  for (let i = 0; i < SPRITECOUNT; i++) {
    addSprite(Math.random() * 1000, Math.random() * 1000);
  }

  let mousedown = false;
  let mousepos = { x: 0, y: 0 };

  // initial setup
  spritegl.canvas.addEventListener("mousedown", (e) => {
    mousedown = true;
    mousepos = { x: e.clientX, y: e.clientY };
  });

  spritegl.canvas.addEventListener("mouseup", () => {
    mousedown = false;
  });

  spritegl.canvas.addEventListener("mousemove", (e) => {
    mousepos = { x: e.clientX, y: e.clientY };
  });

  // Create batch for static draw
  spritegl.batchSprites(sprites, "TEST");

  const smoothing = 0.02;
  let smoothFPS = 60;

  window.requestAnimationFrame(tick);

  function addSprite(x = 0, y = 0) {
    sprites.push(
      new MySprite(
        x - size / 2,
        y - size / 2,
        size,
        size,
        0,
        textures.myAtlas,
        Math.floor(Math.random() * 2) === 0 ? atlas.rects[0] : atlas.rects[1]
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

  let thisTime = performance.now();
  let lastTime = thisTime;

  function tick() {
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

    // Static draw
    // spritegl.draw(spritegl.buffers.TEST);

    // Batched draw
    spritegl.drawSprites(sprites);

    // Non-batched draw
    // sprites.forEach((sprite) => spritegl.drawSprite(sprite));

    lastTime = thisTime;
    thisTime = performance.now();
    const FPS = 1 / ((thisTime - lastTime) / 1000);
    smoothFPS = FPS * smoothing + smoothFPS * (1.0 - smoothing);

    document.getElementById("fps").innerText =
      Math.round(smoothFPS) + "\n" + sprites.length;
    window.requestAnimationFrame(tick);
  }
}

// append canvas to document
document.getElementById("root").appendChild(spritegl.canvas);
