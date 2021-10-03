uniform mat4 u_projView;

attribute float index;
attribute vec3 position;
attribute vec2 size;
attribute float angle;
attribute vec4 region;
attribute vec4 color;
attribute float effect;

varying vec4 v_color;
varying vec2 v_texCoord;




void main() {
    angle;
    region;
    effect;

    vec2 point;
    vec2 uv;
    int i = int(floor(index));

    if (i == 0) {
      point = vec2( 0.0, 0.0 );
      uv = vec2(region.x, region.y);
    } 
    else if (i == 1) {
      point = vec2( 1.0, 0.0 );
      uv = vec2(region.z, region.y);
    } 
    else if (i == 2) {
      point = vec2( 0.0, 1.0 );
      uv = vec2(region.x, region.w);
    } 
    else if (i == 3) {
      point = vec2( 1.0, 1.0 );
      uv = vec2(region.z, region.w);
    }
    
    v_color = color;
    v_texCoord = uv;

    
    gl_Position = u_projView * vec4(position.xy + point * size, 0.0, 1.0);
}
