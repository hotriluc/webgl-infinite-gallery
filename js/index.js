import '/scss/styles.scss';
import Lenis from '@studio-freight/lenis';

/**
 * Smooth scroll
 */
const lenis = new Lenis();

lenis.on('scroll', (e) => {
  console.log(e);
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
