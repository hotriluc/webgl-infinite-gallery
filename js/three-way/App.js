import normalizeWheel from 'normalize-wheel';
import Media from './Media';

import * as THREE from 'three';
import { lerp } from 'three/src/math/MathUtils';

class App {
  constructor() {
    this.speed = 2;
    this.scroll = {
      ease: 0.05,
      current: 0,
      target: 0,
      last: 0,
    };

    this.speed = 2;

    this.createTextureLoader();
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.createGallery();

    this.onResize();

    this.createGeometry();
    this.createMedias();

    this.update();

    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector('.canvas'),
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera();
    this.camera.fov = 45;
    this.camera.position.z = 5;
  }

  createScene() {
    this.scene = new THREE.Scene();
  }

  createTextureLoader() {
    this.tl = new THREE.TextureLoader();
  }

  createGeometry() {
    this.planeGeometry = new THREE.PlaneGeometry();
  }

  createGallery() {
    this.gallery = document.querySelector('.gallery');
  }

  createMedias() {
    this.mediasElements = document.querySelectorAll('.gallery__figure');
    this.medias = Array.from(this.mediasElements).map((element) => {
      let media = new Media({
        element,
        geometry: this.planeGeometry,
        tl: this.tl,
        height: this.galleryHeight,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
      });

      return media;
    });
  }

  // Wheel Events
  onWheel(event) {
    const normalized = normalizeWheel(event);
    const speed = normalized.pixelY;

    this.scroll.target += speed * 0.5;
  }

  // Touch events
  onTouchDown(event) {
    // Mouse Button / Finger is down
    this.isDown = true;

    // Save current position
    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientY : event.clientY;
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    // Calculate drag offset along Y
    const y = event.touches ? event.touches[0].clientY : event.clientY;
    const distance = (this.start - y) * 2;

    // Set scroll new target
    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    // Mouse Button / Finger is up => no more execution
    this.isDown = false;
  }

  onResize() {
    this.screen = {
      height: window.innerHeight,
      width: window.innerWidth,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.updateProjectionMatrix();

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    // 1px in viewport = 1unit in canvas
    this.viewport = {
      height,
      width,
    };

    this.galleryBounds = this.gallery.getBoundingClientRect();
    this.galleryHeight =
      (this.viewport.height * this.galleryBounds.height) / this.screen.height;

    if (this.medias) {
      this.medias.forEach((media) =>
        media.onResize({
          height: this.galleryHeight,
          screen: this.screen,
          viewport: this.viewport,
        })
      );
    }
  }

  /**
   * Tick method
   */
  update() {
    // auto scrolling
    this.scroll.target += this.speed;

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    if (this.scroll.current > this.scroll.last) {
      this.speed = 2;
      this.direction = 'down';
    } else if (this.scroll.current < this.scroll.last) {
      this.direction = 'up';
      this.speed = -2;
    }

    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, this.direction));
    }

    // Updating last position
    this.scroll.last = this.scroll.current;

    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.update.bind(this));
  }

  /**
   * Add handlers method
   */
  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousewheel', this.onWheel.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this));

    window.addEventListener('mousedown', this.onTouchDown.bind(this));
    window.addEventListener('mousemove', this.onTouchMove.bind(this));
    window.addEventListener('mouseup', this.onTouchUp.bind(this));

    window.addEventListener('touchstart', this.onTouchDown.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this));
    window.addEventListener('touchend', this.onTouchUp.bind(this));
  }
}

new App();
