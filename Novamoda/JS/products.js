// PRODUTOS MOCKADOS (troque depois pelo backend)
const produtos = [
  {
    id: 1,
    nome: "Camisa Oversized",
    preco: 129.90,
    img: "produtos/camisa1.jpg"
  },
  {
    id: 2,
    nome: "Moletom Premium",
    preco: 199.90,
    img: "produtos/moletom1.jpg"
  }
];

// LISTAR PRODUTOS
const container = document.querySelector(".produtos-lista");

if (container) {
  container.innerHTML = produtos.map(p => `
    <div class="produto-card animate">
      <img src="${p.img}" class="zoom">
      <h3>${p.nome}</h3>
      <p>R$ ${p.preco.toFixed(2)}</p>
      <button onclick='addToCart(${JSON.stringify(p)})' class="btn">Adicionar</button>
    </div>
  `).join("");
}

// EFEITO ZOOM
document.addEventListener("mousemove", (e) => {
  document.querySelectorAll(".zoom").forEach(img => {
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    img.style.transformOrigin = `${x}px ${y}px`;
  });
});

document.querySelectorAll(".zoom").forEach(img => {
  img.addEventListener("mouseenter", () => img.style.transform = "scale(1.3)");
  img.addEventListener("mouseleave", () => img.style.transform = "scale(1)");
});
