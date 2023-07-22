#define PI 3.1415926535897932384626433832795

uniform float u_strength;
uniform vec2 u_viewport_size;

varying vec2 vUv;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;

    vec4 newPosition = viewPosition;
    // Bend image sin(z) depends on u_strength (how much user have scrolled)
    newPosition.z += sin((newPosition.y / u_viewport_size.y ) * PI  - PI / 2.0) * - u_strength;

    vec4 projectedPosition = projectionMatrix * newPosition;

    gl_Position = projectedPosition;

    vUv = uv;
}