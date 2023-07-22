import Media from './Media';

import { Camera, Plane, Renderer, Transform } from 'ogl-typescript';
import Lenis from '@studio-freight/lenis';

class App {
  constructor() {
    this.scroll = {
      offsetY: 0,
      direction: 0,
    };

    this.createSmoothScroller();
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.createGallery();

    this.onResize();

    this.createPlaneGeometry();
    this.createdMedias();

    this.update();

    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({
      canvas: document.querySelector('.canvas'),
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true,
    });

    this.gl = this.renderer.gl;
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 5;
  }

  createScene() {
    this.scene = new Transform();
  }

  createSmoothScroller() {
    this.scroller = new Lenis({ infinite: true });
  }

  createPlaneGeometry() {
    this.planeGeometry = new Plane(this.gl);
  }

  createGallery() {
    this.gallery = document.querySelector('.gallery');
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
        gl: this.gl,
        height: this.galleryHeight,
        screen: this.screen,
        viewport: this.viewport,
      });

      return media;
    });
  }

  /**
   * Handlers
   */
  onWheel(e) {
    const { animatedScroll, direction } = e;
    this.scroll.offsetY = animatedScroll;
    this.scroll.direction = direction;
  }

  onResize() {
    this.screen = {
      height: window.innerHeight,
      width: window.innerWidth,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height,
    });

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
  update(time) {
    this.scroller.raf(time);
    window.requestAnimationFrame(this.update.bind(this));

    if (this.medias) {
      this.medias.forEach((media) =>
        media.update(this.scroll.offsetY, this.scroll.direction)
      );
    }

    this.renderer.render({
      scene: this.scene,
      camera: this.camera,
    });
  }

  /**
   * Add handlers method
   */
  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));
    // window.addEventListener('mousewheel', this.onWheel.bind(this));
    // window.addEventListener('wheel', this.onWheel.bind(this));

    this.scroller.on('scroll', this.onWheel.bind(this));
  }
}

new App();
