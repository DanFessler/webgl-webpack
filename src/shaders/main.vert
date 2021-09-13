// an attribute will receive data from a buffer
attribute vec4 a_position;
attribute vec2 a_texCoord;

uniform mat4 u_viewMatrix;

varying highp vec2 v_texCoord;

// all shaders have a main function
void main() {
  // gl_Position is a special variable a vertex shader
  // is responsible for setting

  mat4 aMat4 = mat4(1.0, 0.0, 0.0, 0.0,  // 1. column
                    0.0, 1.0, 0.0, 0.0,  // 2. column
                    0.0, 0.0, 1.0, 0.0,  // 3. column
                    0.0, 0.0, 0.0, 1.0); // 4. column

  // gl_Position = a_position;
  // gl_Position = aMat4 * a_position;
  gl_Position = u_viewMatrix * a_position;

  v_texCoord = a_texCoord;
}