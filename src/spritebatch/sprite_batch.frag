precision highp float;
uniform sampler2D u_texture;
varying vec4 v_color;
varying vec2 v_texCoord;

void main() {
    vec4 texColor = texture2D(u_texture, v_texCoord);
    if (texColor.a < 0.1) discard;
    gl_FragColor = v_color * texColor;
}
