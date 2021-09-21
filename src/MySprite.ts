import { Sprite, Texture } from "./spritegl";
import spritegl from "./spriteRenderer";

class MySprite extends Sprite {
  gravity: number = 0.1;
  name: string;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number = 0,
    texture: Texture,
    atlasRect: [number, number, number, number] = null,
    name?: string
  ) {
    super(x, y, width, height, depth, texture, atlasRect);
    // console.log(atlasRect);
    this.name = name;
  }

  update() {
    this.vel.y += this.gravity;
    this.x += this.vel.x;
    this.y += this.vel.y;

    const width = spritegl.canvas.width - this.width;
    const height = spritegl.canvas.height - this.height;

    if (this.x < 0) {
      this.x = 0;
      this.vel.x *= -1;
    }
    if (this.x > width) {
      this.x = width;
      this.vel.x *= -1;
    }
    if (this.y < 0) {
      this.y = 0;
      this.vel.y *= -1;
    }
    if (this.y > height) {
      this.y = height - (this.y - height);
      // this.vel.y = -this.vel.y;
      this.vel.y = -Math.random() * 14;
    }
  }
}

export default MySprite;
