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
  atlasRect: [number, number, number, number] | null;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number = 0,
    texture: Texture,
    atlasRect: [number, number, number, number]
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vel = {
      x: Math.sin(this.angle) * 6,
      y: Math.cos(this.angle) * 6,
    };
    this.depth = depth;
    this.texture = texture;
    this.atlasRect = atlasRect;
  }

  getUvs() {}

  update() {}
}

export default Sprite;
