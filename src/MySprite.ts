import { Renderer, Sprite, Texture } from "./spritegl";
import spritegl from "./spriteRenderer";

type vec4 = [number, number, number, number];

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
    atlasRect: vec4 = null,
    gl?: WebGLRenderingContext,
    color: vec4 = [1, 1, 1, 1]
  ) {
    super(x, y, width, height, depth, texture, atlasRect, color);
    // console.log(atlasRect);
    this.gl = gl ? gl : spritegl.gl;
  }

  update() {
    this.vel.y += this.gravity;
    this.x += this.vel.x;
    this.y += this.vel.y;

    const width = this.gl.canvas.width - this.width;
    const height = this.gl.canvas.height - this.height;

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
