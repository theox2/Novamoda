// menu toggle, produtos demo, newsletter, header hide on scroll

const hamburger = document.getElementById('hamburger');
const menuList = document.getElementById('menuList');

hamburger && hamburger.addEventListener('click', () => {
  if (!menuList) return;
  menuList.style.display = menuList.style.display === 'flex' ? 'none' : 'flex';
});

/* hide menu on small screens when clicking outside */
document.addEventListener('click', (e) => {
  if (!e.target.closest('#menu') && window.matchMedia('(max-width:980px)').matches) {
    if (menuList) menuList.style.display = 'none';
  }
});

/* produtos demo */
const produtos = [
  {id:1,name:'Camiseta Nova',price:'R$129,90',img:'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=1200'},
  {id:2,name:'Moletom Premium',price:'R$249,90',img:'https://images.unsplash.com/photo-1528701800489-20be0e7e75ca?q=80&w=1200'},
  {id:3,name:'Jaqueta Street',price:'R$399,90',img:'https://images.unsplash.com/photo-1521336575822-6da63fb45455?q=80&w=1200'},
  {id:4,name:'Tênis Runner',price:'R$599,90',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200'},
  {id:5,name:'Calça Cargo',price:'R$199,90',img:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200'},
  {id:6,name:'Boné Classic',price:'R$79,90',img:'https://images.unsplash.com/photo-1542060740-2a4f9f9f0b1f?q=80&w=1200'}
];

function renderProdutos() {
  const grid = document.getElementById('produtosGrid');
  if (!grid) return;
  grid.innerHTML = produtos.map(p => `
    <article class="produto" onclick="openProduto(${p.id})">
      <img src="${p.img}" alt="${p.name}">
      <div class="info">
        <div>${p.name}</div>
        <p>${p.price}</p>
      </div>
    </article>
  `).join('');
}
window.openProduto = function(id){
  window.location.href = `produto.html?id=${id}`;
}

renderProdutos();

/* newsletter */
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    if (!email || !email.includes('@')) {
      alert('Digite um email válido');
      return;
    }
    alert('Obrigado! Você será notificado por email.');
    newsletterForm.reset();
  });
}

/* hide header on scroll */
let lastScroll = 0;
const header = document.getElementById('menu');
window.addEventListener('scroll', () => {
  const st = window.pageYOffset || document.documentElement.scrollTop;
  if (st > lastScroll && st > 100) {
    header.style.top = '-90px';
  } else {
    header.style.top = '0';
  }
  lastScroll = st <= 0 ? 0 : st;
});

// LOADER INTELIGENTE
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");

    // esperar só um pequeno delay para suavidade
    setTimeout(() => {
        loader.classList.add("hidden");
    }, 300);
});

// SCROLL SUAVE
document.querySelectorAll("[data-scroll]").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.dataset.scroll);
    target && target.scrollIntoView({ behavior: "smooth" });
  });
});

// LOADER INTELIGENTE
window.addEventListener("load", () => {
  setTimeout(() => {
    document.querySelector(".loader").classList.add("hide");
  }, 800); // espere um pouquinho para parecer natural
});

