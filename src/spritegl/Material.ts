import { mat4 } from "gl-matrix";

class Material {
  gl: WebGLRenderingContext;
  shader: WebGLProgram;

  locations: {
    attributes: {
      points: number;
      coords: number;
      // position: number;
      // rect: number;
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
        // position: this.gl.getAttribLocation(this.shader, "a_position"),
        // rect: this.gl.getAttribLocation(this.shader, "a_uvRect"),
      },
      uniforms: {
        matrix: this.gl.getUniformLocation(this.shader, "u_viewMatrix"),
        sampler: this.gl.getUniformLocation(this.shader, "uSampler"),
      },
    };
    this.gl.enableVertexAttribArray(this.locations.attributes.points);
    this.gl.enableVertexAttribArray(this.locations.attributes.coords);
    // this.gl.enableVertexAttribArray(this.locations.attributes.position);
    // this.gl.enableVertexAttribArray(this.locations.attributes.rect);

    this.gl.useProgram(this.shader);

    const viewMatrix = mat4.create();
    this.gl.uniformMatrix4fv(this.locations.uniforms.matrix, false, viewMatrix);

    // this.setAttribute(
    //   "points",
    //   this.createStaticBuffer([0, 100, 100, 0, 0, 0, 0, 100, 100, 100, 100, 0]),
    //   2,
    //   this.gl.FLOAT
    // );

    // this.setAttribute(
    //   "coords",
    //   this.createStaticBuffer([0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1]),
    //   2,
    //   this.gl.FLOAT
    // );
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
    type: number,
    divisor?: number
  ) {
    // this.gl.enableVertexAttribArray(this.locations.attributes[name]);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, arrayBuffer);
    // if (name !== "points")
    this.gl.vertexAttribPointer(
      this.locations.attributes[name],
      size,
      type,
      false,
      0,
      0
    );

    // if (divisor) {
    //   const ext = this.gl.getExtension("ANGLE_instanced_arrays");
    //   ext.vertexAttribDivisorANGLE(this.locations.attributes[name], divisor);
    // }
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
