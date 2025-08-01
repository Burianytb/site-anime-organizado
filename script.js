import {
  buscarTopAvaliados,
  buscarMaisVistos,
  buscarTemporadaAtual,
  buscarPorNome,
  buscarPorGenero,
  buscarSinopsePT
} from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  const paginaAtual = window.location.pathname.split("/").pop();
  const paginasPublicas = ["", "index.html", "login.html", "registro.html", "anime.html"];
  const usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado"));

  let listaWatchlist = [];
  if (sessionStorage.getItem("watchlist")) {
    listaWatchlist = JSON.parse(sessionStorage.getItem("watchlist"));
  }

  // Redirecionamento condicional
  if (!usuarioLogado && !paginasPublicas.includes(paginaAtual)) {
    window.location.href = "login.html";
    return;
  }

  if (usuarioLogado && ["login.html", "registro.html"].includes(paginaAtual)) {
    window.location.href = "index.html";
    return;
  }

  const loginBtn = document.querySelector(".login-btn");
  const registerBtn = document.querySelector(".register-btn");

  if (usuarioLogado && loginBtn && registerBtn) {
    loginBtn.textContent = `${usuarioLogado.username}`;
    loginBtn.href = "watchlist.html";
    loginBtn.removeAttribute("onclick");
    loginBtn.addEventListener("click", e => e.stopImmediatePropagation());

    registerBtn.textContent = "Sair";
    registerBtn.href = "#";
    registerBtn.removeAttribute("onclick");
    registerBtn.addEventListener("click", e => {
      e.preventDefault();
      sessionStorage.removeItem("usuarioLogado");
      window.location.reload();
    });
  }

  const submenuGeneros = document.querySelector(".dropdown .submenu-generos");
  const mapaGeneros = {
    "Ação": 1, "Aventura": 2, "Comédia": 4, "Drama": 8,
    "Fantasia": 10, "Horror": 14, "Mecha": 18, "Música": 19,
    "Mistério": 7, "Romance": 22, "Ficção Científica": 24,
    "Slice of Life": 36, "Esportes": 30, "Sobrenatural": 37,
    "Suspense": 41
  };

  if (submenuGeneros && submenuGeneros.parentElement.classList.contains("dropdown")) {
    Object.keys(mapaGeneros).forEach(gen => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = gen;
      link.addEventListener("click", e => {
        e.preventDefault();
        window.location.href = `resultado.html?genero=${encodeURIComponent(gen)}`;
      });
      li.append(link);
      submenuGeneros.append(li);
    });
  }

  const searchInput = document.getElementById("search");
  const searchResults = document.getElementById("search-results");

  if (searchInput) {
    let debounceTimer;

    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      const q = searchInput.value.trim();
      if (q.length < 2) {
        searchResults.style.display = "none";
        return;
      }

      debounceTimer = setTimeout(async () => {
        const resultados = await buscarPorNome(q);
        searchResults.innerHTML = "";

        if (resultados.length > 0) {
          for (const anime of resultados) {
            const titulo = anime.title_pt || anime.title || anime.title_english;
            const sinopsePT = await buscarSinopsePT(titulo);
            const sinopse = sinopsePT?.length > 140 ? sinopsePT.substring(0, 137) + "..." : sinopsePT || "Sinopse não disponível";

            const jaSalvo = listaWatchlist.includes(anime.mal_id);
            const textoBtn = jaSalvo ? "✔️ Salvo" : "➕ Adicionar";

            const a = document.createElement("a");
            a.className = "search-item";
            a.href = `anime.html?id=${anime.mal_id}`;
            a.innerHTML = `
              <img src="${anime.images.jpg?.image_url}" alt="${titulo}" />
              <div>
                <strong>${titulo}</strong>
                <span class="rating">Score: ${anime.score || "N/A"}</span>
                <p class="sinopse">${sinopse}</p>
              </div>
            `;

            const botao = document.createElement("button");
            botao.className = "btn-watchlist";
            botao.textContent = textoBtn;
            botao.addEventListener("click", e => {
              e.preventDefault();
              if (!listaWatchlist.includes(anime.mal_id)) {
                listaWatchlist.push(anime.mal_id);
                sessionStorage.setItem("watchlist", JSON.stringify(listaWatchlist));
                botao.textContent = "✔️ Salvo";
              }
            });

            a.appendChild(botao);
            searchResults.appendChild(a);
          }

          const verMais = document.createElement("a");
          verMais.className = "search-item ver-mais";
          verMais.href = `resultado.html?busca=${encodeURIComponent(q)}`;
          verMais.textContent = `🔍 Ver todos os resultados para "${q}"`;
          searchResults.appendChild(verMais);

          searchResults.style.display = "block";
        } else {
          searchResults.style.display = "none";
        }
      }, 400);
    });

    searchInput.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        const q = searchInput.value.trim();
        if (q) window.location.href = `resultado.html?busca=${encodeURIComponent(q)}`;
      }
    });

    document.addEventListener("click", e => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = "none";
      }
    });
  }

  const params = new URLSearchParams(window.location.search);
  const generoQuery = params.get("genero");
  const buscaQuery = params.get("busca");

  if (paginaAtual === "watchlist.html") {
    carregarWatchlist();
  } else if (generoQuery) {
    buscarPorGenero(generoQuery).then(animes => {
      preencherLista("resultado-genero", animes);
    });
  } else if (buscaQuery) {
    buscarPorNome(buscaQuery).then(animes => {
      preencherLista("resultado-busca", animes);
    });
  } else {
    carregarListas();
  }

  async function carregarListas() {
    preencherLista("mais-vistos-list", await buscarMaisVistos());
    preencherLista("top-avaliados-list", await buscarTopAvaliados(), true);
    preencherLista("temporada-atual-list", await buscarTemporadaAtual());
  }

  async function preencherLista(id, animes, mostrarNota = false) {
    const container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = "";

    let watchlist = [];
    if (sessionStorage.getItem("watchlist")) {
      watchlist = JSON.parse(sessionStorage.getItem("watchlist"));
    }

    for (const anime of animes) {
      const titulo = anime.title_pt || anime.title || anime.title_english;
      const sinopsePT = await buscarSinopsePT(titulo);
      const sinopse = sinopsePT?.length > 120 ? sinopsePT.substring(0, 117) + "..." : sinopsePT || "Sinopse não disponível";

      const jaSalvo = watchlist.includes(anime.mal_id);

      const li = document.createElement("li");
      li.classList.add("splide__slide");

      const card = document.createElement("div");
      card.classList.add("card-anime");

      card.innerHTML = `
        <a href="anime.html?id=${anime.mal_id}">
          <img src="${anime.images.jpg?.image_url}" alt="${titulo}" />
          <h3>${titulo}</h3>
          ${mostrarNota ? `<p class="rating">Nota: ${anime.score}/10</p>` : ""}
          <p class="descricao">${sinopse}</p>
        </a>
        <button class="btn-watchlist-icon ${jaSalvo ? 'ativo' : ''}" data-id="${anime.mal_id}">
          ${jaSalvo ? "✅" : "➕"}
        </button>
      `;

      const btn = card.querySelector(".btn-watchlist-icon");
      btn.addEventListener("click", e => {
        e.preventDefault();
        if (!watchlist.includes(anime.mal_id)) {
          watchlist.push(anime.mal_id);
          sessionStorage.setItem("watchlist", JSON.stringify(watchlist));
          btn.classList.add("ativo");
          btn.textContent = "✅";
        }
      });

      li.appendChild(card);
      container.appendChild(li);
    }

    if (!id.includes("resultado")) {
      new Splide(`#${id.replace("-list", "")}`, {
        type: 'loop',
        perPage: 5,
        gap: '0.5rem',
        perMove: 1,
        autoplay: window.innerWidth > 768,
        drag: false,
        trimSpace: false,
        breakpoints: {
          1200: { perPage: 4 },
          1024: { perPage: 3 },
          768: { perPage: 2.4 },
          480: { perPage: 2.1 },
          360: { perPage: 1.5 }
        }
      }).mount();
      // Delegação de eventos para botões de favoritos
      container.addEventListener("click", e => {
        const btn = e.target.closest(".btn-watchlist-icon");
        if (!btn) return;

        const animeId = btn.getAttribute("data-id");
        if (!watchlist.includes(Number(animeId))) {
          watchlist.push(Number(animeId));
          sessionStorage.setItem("watchlist", JSON.stringify(watchlist));
          btn.classList.add("ativo");
          btn.textContent = "✅";
        }
      });

    }
  }
});
