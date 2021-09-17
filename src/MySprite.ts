import { Sprite, Texture } from "./spritegl";
import spritegl from "./spriteRenderer";

class MySprite extends Sprite {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number = 0,
    texture: Texture
  ) {
    super(x, y, width, height, depth, texture);
  }

  update() {
    // this.x += this.vel.x;
    // this.y += this.vel.y;
    // const width = spritegl.canvas.width - this.width;
    // const height = spritegl.canvas.height - this.height;
    // if (this.x < 0) {
    //   this.x = 0;
    //   this.vel.x *= -1;
    // }
    // if (this.x > width) {
    //   this.x = width;
    //   this.vel.x *= -1;
    // }
    // if (this.y < 0) {
    //   this.y = 0;
    //   this.vel.y *= -1;
    // }
    // if (this.y > height) {
    //   this.y = height;
    //   this.vel.y *= -1;
    // }
  }
}

export default MySprite;
