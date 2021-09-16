type resources = [url: string, name: string][];
type textures = { [url: string]: Texture };

export class TextureLoader {
  gl: WebGLRenderingContext;
  resources: resources = [];
  textures: textures = {};
  onCompleteHandler: (resources: textures) => void;

  constructor(
    gl: WebGLRenderingContext,
    onCompleteHandler: (resources: textures) => void
  ) {
    this.gl = gl;
    this.onCompleteHandler = onCompleteHandler;
  }

  add(url: string, name: string) {
    this.resources.push([url, name]);
  }

  load() {
    let count = 0;

    const resourceLoaded = (image: HTMLImageElement, name: string) => {
      console.log("resource loaded");

      const gl = this.gl;
      const texture = new Texture(gl, image);

      this.textures[name] = texture;

      count = count + 1;
      console.log(count, this.resources.length);
      if (count == this.resources.length) this.onCompleteHandler(this.textures);
    };

    this.resources.forEach(([url, name]) => {
      const image = new Image();
      image.onload = (e) => resourceLoaded(<HTMLImageElement>e.target, name);
      image.src = url;
    });
  }
}

export default class Texture {
  glTexture: WebGLTexture;

  constructor(gl: WebGLRenderingContext, image: HTMLImageElement) {
    this.glTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    // set image filtering
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    function isPowerOf2(value: number) {
      return (value & (value - 1)) == 0;
    }
  }
}
