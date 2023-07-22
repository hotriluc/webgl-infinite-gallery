import App from './three-way/App';

new App();

const images = document.querySelectorAll('img');
let imagesIndex = 0;

Array.from(images).forEach((element) => {
  const image = new Image();

  image.src = element.src;
  image.onload = () => {
    imagesIndex += 1;

    if (imagesIndex === images.length) {
      document.documentElement.classList.remove('loading');
      document.documentElement.classList.add('loaded');
    }
  };
});
