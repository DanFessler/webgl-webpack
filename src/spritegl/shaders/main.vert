// an attribute will receive data from a buffer
attribute vec4 a_point;
attribute vec2 a_texCoord;
attribute vec2 a_position;

uniform mat4 u_viewMatrix;

varying highp vec2 v_texCoord;
varying highp vec2 v_position;

// all shaders have a main function
void main() {
  // gl_Position is a special variable a vertex shader
  // is responsible for setting

  mat4 aMat4 = mat4(1.0, 0.0, 0.0, 0.0,  // 1. column
                    0.0, 1.0, 0.0, 0.0,  // 2. column
                    0.0, 0.0, 1.0, 0.0,  // 3. column
                    0.0, 0.0, 0.0, 1.0); // 4. column

  // gl_Position = a_point;
  // gl_Position = aMat4 * a_point;
  // gl_Position = u_viewMatrix * floor(a_point);
  gl_Position = u_viewMatrix * (a_point + vec4(a_position, 0, 0));

  v_texCoord = a_texCoord;
  v_position = a_position;
}