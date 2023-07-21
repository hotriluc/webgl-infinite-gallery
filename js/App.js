import Lenis from '@studio-freight/lenis';
import Media from './Media';

import * as THREE from 'three';

class App {
  constructor() {
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.createSmoothScroller();
    this.createTextureLoader();
    this.onResize();

    this.createPlaneGeometry();
    this.createdMedias();

    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector('.canvas'),
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera();
    this.camera.fov = 45;
    this.camera.position.z = 5;
  }

  createScene() {
    this.scene = new THREE.Scene();
  }

  createSmoothScroller() {
    this.scroller = new Lenis();
  }

  createTextureLoader() {
    this.tl = new THREE.TextureLoader();
  }

  createPlaneGeometry() {
    this.planeGeometry = new THREE.PlaneGeometry();
  }

  createdMedias() {
    // Selecting from DOM
    this.mediasElements = document.querySelectorAll('.gallery__figure');

    // List of Medias
    this.medias = Array.from(this.mediasElements).map((element) => {
      let media = new Media({
        element,
        geometry: this.planeGeometry,
        scene: this.scene,
        tl: this.tl,
        screen: this.screen,
        viewport: this.viewport,
      });

      return media;
    });
  }

  /**
   * Handlers
   */
  onWheel() {}

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

    if (this.medias) {
      this.medias.forEach((media) =>
        media.onResize({ screen: this.screen, viewport: this.viewport })
      );
    }
  }

  /**
   * Tick method
   */
  update(time) {
    this.scroller.raf(time);
    window.requestAnimationFrame(this.update.bind(this));

    if (this.medias) {
      this.medias.forEach((media) => media.update());
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Add handlers method
   */
  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousewheel', this.onWheel.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this));
  }
}

new App();
