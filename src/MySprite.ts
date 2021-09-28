import { Renderer, Sprite, Texture } from "./spritegl";
import spritegl from "./spriteRenderer";

class MySprite extends Sprite {
  gravity: number = 0.1;
  gl: WebGLRenderingContext;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number = 0,
    texture: Texture,
    atlasRect: [number, number, number, number] = null,
    gl?: WebGLRenderingContext
  ) {
    super(x, y, width, height, depth, texture, atlasRect);
    // console.log(atlasRect);
    this.gl = gl ? gl : spritegl.gl;
  }

  update(deltatime: number) {
    let { x, y } = this.getPosition();

    this.vel.y += (this.gravity * deltatime) / 20;
    x += (this.vel.x * deltatime) / 20;
    y += (this.vel.y * deltatime) / 20;

    const width = this.gl.canvas.width - this.width;
    const height = this.gl.canvas.height - this.height;

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

export default MySprite;
