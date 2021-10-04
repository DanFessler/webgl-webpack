import Texture from "./Texture";
import Renderer from "./Renderer";

type vec4 = [number, number, number, number];

class Sprite {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  vel: { x: number; y: number } = { x: 0, y: 0 };
  depth: number = 0;
  texture: Texture;
  atlasRect: vec4 | null;
  renderer: Renderer;
  index: number;
  gravity: number = 0.1;
  color: vec4;
  angle: number = 0.0;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number = 0,
    texture: Texture,
    atlasRect: vec4,
    color: vec4 = [1, 1, 1, 1]
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
    this.color = color;
  }

  getPosition() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  getUvs() {}

  update(deltatime: number) {}
}

export default Sprite;
