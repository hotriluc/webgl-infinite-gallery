precision highp float;
 
uniform sampler2D u_map;
uniform vec2 u_image_size;
uniform vec2 u_plane_size;
 
varying vec2 vUv;
 
void main() {
  vec2 ratio = vec2(
    min((u_plane_size.x / u_plane_size.y) / (u_image_size.x / u_image_size.y), 1.0),
    min((u_plane_size.y / u_plane_size.x) / (u_image_size.y / u_image_size.x), 1.0)
  );
 
  vec2 st = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

   vec4 image = texture2D(u_map, st);

  gl_FragColor = image;
}