import { mat4 } from "gl-matrix";

class Material {
  gl: WebGLRenderingContext;
  shader: WebGLProgram;

  locations: {
    attributes: {
      points: number;
      coords: number;
    };
    uniforms: {
      matrix: WebGLUniformLocation;
      sampler: WebGLUniformLocation;
    };
  } = { attributes: null, uniforms: null };

  constructor(
    gl: WebGLRenderingContext,
    vertShader: string,
    fragShader: string
  ) {
    this.gl = gl;

    this.shader = this.createProgram(vertShader, fragShader);

    this.locations = {
      attributes: {
        points: this.gl.getAttribLocation(this.shader, "a_point"),
        coords: this.gl.getAttribLocation(this.shader, "a_texCoord"),
      },
      uniforms: {
        matrix: this.gl.getUniformLocation(this.shader, "u_viewMatrix"),
        sampler: this.gl.getUniformLocation(this.shader, "uSampler"),
      },
    };
    this.gl.enableVertexAttribArray(this.locations.attributes.points);
    this.gl.enableVertexAttribArray(this.locations.attributes.coords);

    this.gl.useProgram(this.shader);

    const viewMatrix = mat4.create();
    this.gl.uniformMatrix4fv(this.locations.uniforms.matrix, false, viewMatrix);
  }

  createStaticBuffer(array: number[]) {
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(array),
      this.gl.STATIC_DRAW
    );
    return buffer;
  }

  setTexture(texture: WebGLTexture) {
    // Tell WebGL we want to affect texture unit 0
    this.gl.activeTexture(this.gl.TEXTURE0);

    // Bind the texture to texture unit 0
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // Tell the shader we bound the texture to texture unit 0
    this.gl.uniform1i(this.locations.uniforms.sampler, 0);
  }

  setAttribute(
    name: "points" | "coords",
    arrayBuffer: any,
    size: number,
    type: number
  ) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, arrayBuffer);

    this.gl.vertexAttribPointer(
      this.locations.attributes[name],
      size,
      type,
      false,
      0,
      0
    );
  }

  setUniform(name: string, value: any) {}

  createProgram(vertShaderSrc: string, fragShaderSrc: string) {
    const gl = this.gl;
    var program = gl.createProgram();

    gl.attachShader(
      program,
      this.createShader(gl.VERTEX_SHADER, vertShaderSrc)
    );
    gl.attachShader(
      program,
      this.createShader(gl.FRAGMENT_SHADER, fragShaderSrc)
    );

    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  createShader(type: number, source: string) {
    const gl = this.gl;

    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }
}

export default Material;
