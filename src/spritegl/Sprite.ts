import Texture from "./Texture";
import Renderer from "./Renderer";

class Sprite {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  vel: { x: number; y: number } = { x: 0, y: 0 };
  depth: number = 0;
  texture: Texture;
  atlasRect: [number, number, number, number] | null;
  renderer: Renderer;
  index: number;
  gravity: number = 0.1;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number = 0,
    texture: Texture,
    atlasRect: [number, number, number, number],
    renderer: Renderer,
    index: number
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vel = {
      x: 0,
      y: 0,
    };
    this.depth = depth;
    this.texture = texture;
    this.atlasRect = atlasRect;
    this.renderer = renderer;
    this.index = index;
  }

  getPosition() {
    return {
      x: this.renderer.spritePositionBuffer[this.index],
      y: this.renderer.spritePositionBuffer[this.index + 1],
    };
  }

  setPosition(x: number, y: number) {
    // console.log("this.index");
    this.renderer.spritePositionBuffer[this.index] = x;
    this.renderer.spritePositionBuffer[this.index + 1] = y;
  }

  getUvs() {}

  update() {
    let { x, y } = this.getPosition();

    this.vel.y += this.gravity;
    x += this.vel.x;
    y += this.vel.y;

    const width = this.renderer.canvas.width - this.width;
    const height = this.renderer.canvas.height - this.height;

    if (x < 0) {
      x = 0;
      this.vel.x *= -1;
    }
    if (x > width) {
      x = width;
      this.vel.x *= -1;
    }
    if (y < 0) {
      y = 0;
      this.vel.y *= -1;
    }
    if (y > height) {
      y = height - (y - height);
      // this.vel.y = -this.vel.y;
      this.vel.y = -Math.random() * 14;
    }

    this.setPosition(x, y);
  }
}

export default Sprite;
