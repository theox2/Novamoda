// Exibir popup apenas 1x por dia
const popup = document.querySelector('.popup-cupom');
const btnClose = document.querySelector('.popup-close');

if (popup) {
    const ultimoPopup = localStorage.getItem('popup_visto');

    // Se nunca foi visto ou passaram 24h
    if (!ultimoPopup || Date.now() - ultimoPopup > 86400000) {
        setTimeout(() => {
            popup.classList.add('active');
        }, 1500); // aparece 1.5s após carregar
    }

    btnClose.addEventListener('click', () => {
        popup.classList.remove('active');
        localStorage.setItem('popup_visto', Date.now());
    });

    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('active');
            localStorage.setItem('popup_visto', Date.now());
        }
    });
}
