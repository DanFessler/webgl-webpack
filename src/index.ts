import spritegl from "./spriteRenderer";
import { Sprite, Texture, TextureLoader } from "./spritegl";
import MySprite from "./MySprite";

// image resources
import atlasURL from "./images/portrait_atlas.png";

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
  addSprite();

  let mousedown = false;

  // initial setup
  spritegl.canvas.addEventListener("mousedown", () => {
    mousedown = true;
  });

  spritegl.canvas.addEventListener("mouseup", () => {
    mousedown = false;
  });

  // Create batch for static draw
  // spritegl.batchSprites(sprites, "TEST");

  const smoothing = 0.02;
  let smoothFPS = 60;

  window.requestAnimationFrame((t) => {
    tick(t, t + 1);
  });

  function addSprite() {
    sprites.push(
      new MySprite(
        0,
        0,
        size,
        size,
        0,
        textures.myAtlas,
        Math.floor(Math.random() * 2) === 0 ? atlas.rects[0] : atlas.rects[1]
      )
    );
    sprites[sprites.length - 1].angle = Math.PI / 2;
  }

  function tick(thisTime: DOMHighResTimeStamp, lastTime: DOMHighResTimeStamp) {
    // add sprites on mouse down
    if (mousedown) {
      for (let i = 0; i < 100; i++) {
        addSprite();
      }
    }

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

    document.getElementById("fps").innerText =
      Math.round(smoothFPS) + "\n" + sprites.length;
    window.requestAnimationFrame((nextTime) => tick(nextTime, thisTime));
  }
}

// append canvas to document
document.getElementById("root").appendChild(spritegl.canvas);
