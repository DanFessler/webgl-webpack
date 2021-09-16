import Texture from "./Texture";

class Sprite {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  vel: { x: number; y: number } = { x: 0, y: 0 };
  angle: number = Math.random() * Math.PI * 2;
  depth: number = 0;
  texture: Texture;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number = 0,
    texture: Texture
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vel = {
      x: Math.sin(this.angle),
      y: Math.cos(this.angle),
    };
    this.depth = depth;
    this.texture = texture;
  }

  update() {
    this.x += this.vel.x;
    this.y += this.vel.y;
    // const width = spritegl.canvas.width - this.width;
    // const height = spritegl.canvas.height - this.height;

    const width = 1024;
    const height = 768;

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
      this.y = height;
      this.vel.y *= -1;
    }
  }
}

export default Sprite;
