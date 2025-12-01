const darkBtn = document.querySelector("#darkToggle");
const body = document.body;

// carregar modo salvo
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
}

// alternar
darkBtn?.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark"))
    localStorage.setItem("theme", "dark");
  else
    localStorage.setItem("theme", "light");
});
