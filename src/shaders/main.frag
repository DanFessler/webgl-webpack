// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying highp vec2 v_texCoord;
uniform sampler2D uSampler;

void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting

  // gl_FragColor = vec4(v_texCoord, 0, 1); // return uv color
  gl_FragColor = texture2D(uSampler, v_texCoord);
}