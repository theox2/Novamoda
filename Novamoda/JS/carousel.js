const carousel = document.querySelector(".carousel-track");
let index = 0;

function slideCarousel() {
  const items = document.querySelectorAll(".carousel-item");
  if (items.length === 0) return;

  index++;
  if (index >= items.length) index = 0;

  carousel.style.transform = `translateX(-${index * 100}%)`;
}

setInterval(slideCarousel, 3500);
