import * as THREE from 'three';

import mediaVertexShader from '../shaders/sketch/vertex.glsl';
import mediaFragmentShader from '../shaders/sketch/fragment.glsl';

export default class {
  constructor({ element, geometry, scene, tl, screen, viewport }) {
    this.element = element;
    this.image = this.element.querySelector('img');

    this.geometry = geometry;
    this.scene = scene;
    this.tl = tl;
    this.screen = screen;
    this.viewport = viewport;

    this.createMesh();
    this.createBounds();
    this.onResize();
  }

  createMesh() {
    const image = new Image();

    // Preloading image
    image.src = this.image.src;
    image.onload = () => {
      material.uniforms.u_image_size.value = new THREE.Vector2(
        image.naturalWidth,
        image.naturalHeight
      );

      const texture = this.tl.load(image.src);
      //   texture.minFilter = THREE.NearestFilter;

      material.uniforms.u_map.value = texture;
    };

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_map: { type: 't', value: null },
        u_plane_size: { value: new THREE.Vector2(0, 0) },
        u_image_size: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: mediaVertexShader,
      fragmentShader: mediaFragmentShader,
      transparent: true,
    });
    this.plane = new THREE.Mesh(this.geometry, material);
    this.scene.add(this.plane);
  }

  createBounds() {
    this.bounds = this.element.getBoundingClientRect();

    this.updateScale();
    this.updateX();
    this.updateY();

    this.plane.material.uniforms.u_plane_size.value = new THREE.Vector2(
      this.plane.scale.x,
      this.plane.scale.y
    );
  }

  // Use this formula to match mesh scale X and Y to img size (DOM)
  updateScale() {
    this.plane.scale.x =
      (this.viewport.width * this.bounds.width) / this.screen.width;
    this.plane.scale.y =
      (this.viewport.height * this.bounds.height) / this.screen.height;
  }

  // Translate img X offset to 3D
  updateX(x = 0) {
    this.plane.position.x =
      -(this.viewport.width / 2) +
      this.plane.scale.x / 2 +
      ((this.bounds.left - x) / this.screen.width) * this.viewport.width;
  }

  // Translate img Y offset to 3D
  updateY(y = 0) {
    this.plane.position.y =
      this.viewport.height / 2 -
      this.plane.scale.y / 2 -
      ((this.bounds.top - y) / this.screen.height) * this.viewport.height;
  }

  update(y) {
    this.updateScale();
    this.updateX();
    this.updateY(y);
  }

  // Update Bounds on window resize
  onResize(sizes) {
    if (sizes) {
      const { screen, viewport } = sizes;

      if (screen) this.screen = screen;
      if (viewport) this.viewport = viewport;
    }

    this.createBounds();
  }
}
