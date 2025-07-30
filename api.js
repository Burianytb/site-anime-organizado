// 🌐 Endpoints base
const JIKAN_BASE = 'https://api.jikan.moe/v4';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY = '7d779743f4eacd1de7ffc7882da6d63f'; // ⚠️ substitua pela sua chave válida da TMDB!

// 🔹 Buscar anime por nome (Jikan)
export async function buscarPorNome(nome) {
  const res = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(nome)}&order_by=popularity`);
  const json = await res.json();
  return json.data || [];
}

// 🔹 Buscar anime por ID (Jikan)
export async function buscarPorId(id) {
  const res = await fetch(`${JIKAN_BASE}/anime/${id}`);
  const json = await res.json();
  return json.data;
}

// 🔹 Buscar lista de gêneros (Jikan)
export async function buscarGeneros() {
  const res = await fetch(`${JIKAN_BASE}/genres/anime`);
  const json = await res.json();
  return json.data || [];
}

// 🔹 Buscar por nome de gênero (Jikan)
export async function buscarPorGenero(nomeGenero) {
  const generos = await buscarGeneros();
  const genero = generos.find(g => g.name.toLowerCase() === nomeGenero.toLowerCase());
  if (!genero) return [];

  const res = await fetch(`${JIKAN_BASE}/anime?genres=${genero.mal_id}&limit=20`);
  const json = await res.json();
  return json.data || [];
}

// 🔹 Buscar animes mais populares (Jikan)
export async function buscarMaisVistos(limit = 10) {
  const res = await fetch(`${JIKAN_BASE}/top/anime?filter=bypopularity&limit=${limit}`);
  const json = await res.json();
  return json.data || [];
}

// 🔹 Buscar top avaliados (Jikan)
export async function buscarTopAvaliados(limit = 10) {
  const res = await fetch(`${JIKAN_BASE}/top/anime?limit=${limit}`);
  const json = await res.json();
  return json.data || [];
}

// 🔹 Buscar temporada atual (Jikan)
export async function buscarTemporadaAtual() {
  const res = await fetch(`${JIKAN_BASE}/seasons/now`);
  const json = await res.json();
  return json.data || [];
}

// 🔸 Buscar sinopse em português (TMDB)
export async function buscarSinopsePT(tituloOriginal) {
  try {
    const res = await fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(tituloOriginal)}&language=pt-BR`);
    const json = await res.json();
    const serie = json.results?.[0];
    if (!serie) return null;

    const detalhes = await fetch(`${TMDB_BASE}/tv/${serie.id}?api_key=${TMDB_KEY}&language=pt-BR`);
    const jsonDetalhes = await detalhes.json();

    return jsonDetalhes.overview?.trim() || null;
  } catch (err) {
    console.error("Erro na sinopse PT:", err);
    return null;
  }
}

// 🔸 Buscar temporadas e episódios (TMDB)
export async function buscarDetalhesSerie(tituloOriginal) {
  try {
    const busca = await fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(tituloOriginal)}&language=pt-BR`);
    const jsonBusca = await busca.json();
    const serie = jsonBusca.results?.[0];
    if (!serie) return null;

    const detalhes = await fetch(`${TMDB_BASE}/tv/${serie.id}?api_key=${TMDB_KEY}&language=pt-BR`);
    const jsonDetalhes = await detalhes.json();

    const temporadas = [];

    for (const temporada of jsonDetalhes.seasons) {
      const epUrl = `${TMDB_BASE}/tv/${serie.id}/season/${temporada.season_number}?api_key=${TMDB_KEY}&language=pt-BR`;
      const resEps = await fetch(epUrl);
      const jsonEps = await resEps.json();

      const episodios = jsonEps.episodes.map(ep => ({
        numero: ep.episode_number,
        nome: ep.name,
        imagem: ep.still_path ? `https://image.tmdb.org/t/p/w185${ep.still_path}` : null
      }));

      temporadas.push({
        nome: temporada.name,
        numero: temporada.season_number,
        episodios
      });
    }

    return {
      temporadas,
      episodiosTotal: jsonDetalhes.number_of_episodes,
      nomeOriginal: jsonDetalhes.original_name,
      status: jsonDetalhes.status,
      primeiroEp: jsonDetalhes.first_air_date
    };
  } catch (err) {
    console.error("Erro nos detalhes da série:", err);
    return null;
  }
}
