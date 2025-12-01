let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Adicionar item ao carrinho
function addToCart(product) {
  const exists = cart.find(item => item.id === product.id);

  if (exists) {
    exists.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Atualizar contador visual
function updateCartCount() {
  const count = cart.reduce((t, i) => t + i.qty, 0);
  const badge = document.querySelector(".cart-count");
  if (badge) badge.textContent = count;
}

updateCartCount();
