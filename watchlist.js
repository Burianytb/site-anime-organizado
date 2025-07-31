import { buscarPorId } from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("watchlist-list");

  let watchlist = [];
  if (sessionStorage.getItem("watchlist")) {
    watchlist = JSON.parse(sessionStorage.getItem("watchlist"));
  }

  if (watchlist.length === 0) {
    container.innerHTML = "<p>Sua watchlist está vazia.</p>";
    return;
  }

  for (const id of watchlist) {
    const anime = await buscarPorId(id);
    if (!anime) continue;

    const card = document.createElement("div");
    card.classList.add("anime-card");
    card.innerHTML = `
      <a href="anime.html?id=${anime.mal_id}">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
        <h3>${anime.title}</h3>
      </a>
      <button class="remove-btn">Remover</button>
    `;

    const removeBtn = card.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => {
      card.remove();

      const index = watchlist.indexOf(anime.mal_id);
      if (index !== -1) {
        watchlist.splice(index, 1); // altera diretamente o array original
        sessionStorage.setItem("watchlist", JSON.stringify(watchlist));
      }

      // Se a lista ficou vazia após a remoção, mostra uma mensagem
      if (watchlist.length === 0) {
        container.innerHTML = "<p>Sua watchlist está vazia.</p>";
      }
    });
    container.appendChild(card);
  }
});
