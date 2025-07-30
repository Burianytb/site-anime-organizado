import {
  buscarPorId,
  buscarSinopsePT,
  buscarDetalhesSerie
} from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
  const id = parseInt(new URLSearchParams(window.location.search).get("id"));
  if (!id) return;

  const img = document.getElementById("anime-img");
  const titleEl = document.getElementById("anime-title");
  const sinopseEl = document.getElementById("anime-sinopse");
  const listaEps = document.getElementById("lista-episodios");

  const anime = await buscarPorId(id);
  if (!anime) return;

  const titulos = [anime.title, anime.title_english, anime.title_japanese].filter(Boolean);
  titleEl.textContent = anime.title;
  img.src = anime.images.jpg.large_image_url;

  const sinopsePT = await buscarSinopsePT(titulos[0]); // tenta com o primeiro título válido
  sinopseEl.textContent = sinopsePT || anime.synopsis || "Sinopse não encontrada.";

  const detalhes = await buscarDetalhesSerie(titulos[0]);
  if (!detalhes || !detalhes.temporadas) return;

  for (const temporada of detalhes.temporadas) {
    const tituloTemporada = document.createElement("h4");
    tituloTemporada.textContent = `📅 ${temporada.nome}`;
    tituloTemporada.classList.add("temporada-toggle");
    tituloTemporada.style.cursor = "pointer";

    const listaTemporada = document.createElement("ul");
    listaTemporada.style.display = "none";
    listaTemporada.style.marginBottom = "20px";

    tituloTemporada.addEventListener("click", () => {
      listaTemporada.style.display =
        listaTemporada.style.display === "none" ? "block" : "none";
    });

    listaEps.appendChild(tituloTemporada);
    listaEps.appendChild(listaTemporada);

    temporada.episodios.forEach(ep => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.gap = "10px";
      li.style.marginBottom = "10px";

      if (ep.imagem) {
        const thumb = document.createElement("img");
        thumb.src = ep.imagem;
        thumb.alt = ep.nome;
        thumb.style.borderRadius = "4px";
        thumb.style.width = "100px";
        thumb.style.objectFit = "cover";
        li.appendChild(thumb);
      }

      const texto = document.createElement("span");
      texto.textContent = `Ep ${ep.numero} — ${ep.nome}`;
      texto.style.fontWeight = "bold";
      li.appendChild(texto);

      listaTemporada.appendChild(li);
    });
  }
});
