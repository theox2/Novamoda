let favs = JSON.parse(localStorage.getItem("favorites")) || [];

function toggleFavorite(id) {
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }

  localStorage.setItem("favorites", JSON.stringify(favs));
  updateFavIcons();
}

function updateFavIcons() {
  document.querySelectorAll("[data-fav]").forEach(btn => {
    const id = btn.dataset.fav;
    btn.classList.toggle("active", favs.includes(id));
  });
}

updateFavIcons();
