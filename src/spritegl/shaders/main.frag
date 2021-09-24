// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying highp vec2 v_texCoord;
// varying highp vec2 v_position;
uniform sampler2D uSampler;

void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting

  // gl_FragColor = vec4(v_texCoord, 0, 1); // return uv color


  vec4 texColor = texture2D(uSampler, v_texCoord);
  
  if (texColor.a < 0.1) discard;

  gl_FragColor = texColor;
}