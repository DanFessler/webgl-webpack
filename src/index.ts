import spritegl from "./spriteRenderer";
import { Sprite, Texture, TextureLoader } from "./spritegl";
import MySprite from "./mySprite";

// image resources
import image from "./images/newportrait.gif";
import image2 from "./images/newportrait2.gif";

// Load textures
const loader = new TextureLoader(spritegl.gl, start);
loader.add(image, "myTexture");
loader.add(image2, "myTexture2");
loader.load();

// Run Engine
function start(textures: { [url: string]: Texture }) {
  const size = 100;
  const sprites: Sprite[] = [];

  // Randomly positioned sprites
  for (let i = 0; i < 2000; i++) {
    sprites.push(
      new MySprite(
        Math.random() * (spritegl.canvas.clientWidth - size),
        Math.random() * (spritegl.canvas.clientHeight - size),
        size,
        size,
        0,
        textures.myTexture
        // // randomly select between two textures
        // Math.floor(Math.random() * 2) === 0
        //   ? textures.myTexture
        //   : textures.myTexture2
      )
    );
  }

  // Create batch for static draw
  spritegl.batchSprites(sprites, "TEST");

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

// append canvas to document
document.getElementById("root").appendChild(spritegl.canvas);
