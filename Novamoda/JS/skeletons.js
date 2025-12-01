function showSkeletons() {
  const container = document.querySelector(".produtos-lista");
  if (!container) return;

  container.innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;
}

function loadProducts() {
  showSkeletons();

  setTimeout(() => {
    // simulando processamento
    window.dispatchEvent(new Event("products-ready"));
  }, 1200);
}

window.addEventListener("products-ready", () => {
  // recarrega o script de produtos
  const script = document.createElement("script");
  script.src = "products.js";
  document.body.appendChild(script);
});

loadProducts();
