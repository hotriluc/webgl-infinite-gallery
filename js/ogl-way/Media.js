import mediaVertexShader from '../../shaders/sketch-ogl/vertex.glsl';
import mediaFragmentShader from '../../shaders/sketch-ogl/fragment.glsl';
import { Mesh, Program, Texture } from 'ogl-typescript';

export default class {
  constructor({ element, geometry, scene, gl, height, screen, viewport }) {
    this.element = element;
    this.image = this.element.querySelector('img');

    this.geometry = geometry;
    this.scene = scene;
    this.gl = gl;

    this.extra = 0;
    this.height = height;
    this.screen = screen;
    this.viewport = viewport;

    // Creating mesh
    this.createMesh();
    // Calculating Mesh Bounds according to DOM element
    this.createBounds();
    // Updating screen and viewport fields
    this.onResize();
  }

  createMesh() {
    const image = new Image();
    const texture = new Texture(this.gl);

    // Image preload
    image.src = this.image.src;
    image.onload = () => {
      program.uniforms.u_image_size.value = [
        image.naturalWidth,
        image.naturalHeight,
      ];
      texture.image = image;
    };

    const program = new Program(this.gl, {
      vertex: mediaVertexShader,
      fragment: mediaFragmentShader,
      uniforms: {
        u_map: { value: texture },
        u_plane_size: { value: [0, 0] },
        u_image_size: { value: [0, 0] },
      },
      transparent: true,
    });

    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program,
    });

    this.plane.setParent(this.scene);
  }

  createBounds() {
    this.bounds = this.element.getBoundingClientRect();

    this.updateScale();
    this.updateX();
    this.updateY();

    console.log(this.viewport.height / 2);
    // console.log(this.image, this.plane.position, this.plane.scale);
    console.log(this.image, this.plane.position.y - this.plane.scale.y / 2);

    // Pass new plane size to shaders
    this.plane.program.uniforms.u_plane_size.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];
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
      ((this.bounds.top - y) / this.screen.height) * this.viewport.height -
      this.extra;
  }

  update(y, direction) {
    this.updateScale();
    this.updateX();
    this.updateY(y);

    const planeOffset = this.plane.scale.y / 2;
    const viewportOffset = this.viewport.height / 2;

    // if the new plane offset is lower than negative viewport offset
    // that means the plane is at the bottom and not in the viewport
    // so we have to place it at the beginning
    // we add planeOffset because we want to do things
    // only if the top half is out of view (bottom half is already out of view)
    this.isBefore = this.plane.position.y + planeOffset < -viewportOffset;

    // if the new plane offset is higher than viewport offset
    // that means the plane is on top and not in the viewport
    // so we have to place it at the bottom (after gallery end)
    // we extract planeOffset because we want to do things
    // only if the bottom half is out of view (top half is already out of view)
    this.isAfter = this.plane.position.y - planeOffset > viewportOffset;

    // Scroll up
    if (direction === -1 && this.isBefore) {
      this.extra -= this.height;
      this.isBefore = false;
      this.isAfter = false;
    }

    // Scroll down
    // The images that were at the top and are not in viewport anymore move them to the bottom
    if (direction === 1 && this.isAfter) {
      this.extra += this.height;
      this.isBefore = false;
      this.isAfter = false;
    }
  }

  // Update Bounds on window resize
  onResize(sizes) {
    this.extra = 0;

    if (sizes) {
      const { height, screen, viewport } = sizes;

      if (height) this.height = screen;
      if (screen) this.screen = screen;
      if (viewport) this.viewport = viewport;
    }

    this.createBounds();
  }
}
