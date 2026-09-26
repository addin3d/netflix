function scrollToTop() {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
}

const htmlBody = document.querySelector("html, body");
const results = document.querySelector("#results");

const scrollToResults = () => {
  const resultsTop = results.offsetTop;
  htmlBody.scrollTo({
    top: resultsTop,
    behavior: "smooth",
  });
};


const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results");
const trendingResults = document.querySelector("#trending-results");
const searchResultsSection = document.querySelector("#search-results-section");
const headerSearch = document.querySelector("#header-search");

function tmdbFetch(path, params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetch(`/api/tmdb${path}${query ? `?${query}` : ""}`);
}

function openTrendingCard(element) {
  const iframe = document.getElementById("iframe");
  const video = document.getElementById("video");
  iframe.src = element.getAttribute("data-player-url");
  video.style.display = "block";
  document.title = `${element.getAttribute("data-title")} | Addin's Netflix`;
  video.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderTrendingCards(items) {
  trendingResults.innerHTML = "";

  items
    .filter((item) => item.poster_path && (item.media_type === "movie" || item.media_type === "tv"))
    .slice(0, 12)
    .forEach((item) => {
      const title = item.title || item.name;
      const releaseDate = item.release_date || item.first_air_date || "";
      const card = document.createElement("a");
      const image = document.createElement("img");
      const info = document.createElement("div");
      const heading = document.createElement("h3");
      const metadata = document.createElement("p");
      const rating = document.createElement("span");
      const playerPath = item.media_type === "movie"
        ? `https://vidsrc.su/embed/movie/${item.id}`
        : `https://vidsrc.su/embed/tv/${item.id}/1/1`;

      card.className = "movie-card";
      card.href = "#video";
      card.setAttribute("data-player-url", playerPath);
      card.setAttribute("data-title", title);
      card.addEventListener("click", (event) => {
        event.preventDefault();
        openTrendingCard(card);
      });

      image.src = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
      image.alt = `${title} poster`;
      info.className = "card-info";
      heading.textContent = title;
      metadata.textContent = `${releaseDate.slice(0, 4) || "New"} • ${item.media_type === "tv" ? "TV Show" : "Movie"}`;
      rating.className = "rating";
      rating.textContent = Number(item.vote_average || 0).toFixed(1);
      info.append(heading, metadata, rating);
      card.append(image, info);
      trendingResults.appendChild(card);
    });
}

function loadTrending() {
  tmdbFetch("/trending/all/day")
    .then((response) => response.json())
    .then((data) => renderTrendingCards(data.results || []))
    .catch(() => {
      trendingResults.innerHTML = `<p class="empty-state">Trending titles are unavailable right now.</p>`;
    });
}

headerSearch.addEventListener("click", () => {
  document.getElementById("search-input").focus();
  document.getElementById("search-input").scrollIntoView({ behavior: "smooth", block: "center" });
});

// Fetch and Show Cards

function fetchAndShow() {
  const query = searchInput.value.trim();
  Pace.restart();

  tmdbFetch("/search/multi", { query, include_adult: "false" })
    .then((response) => response.json())
    .then((data) => {
      resultsContainer.innerHTML = "";
      searchResultsSection.classList.add("has-results");

      data.results
        .filter((result) => result.poster_path && (result.media_type === "movie" || result.media_type === "tv"))
        .forEach((result) => {
          const title = result.title || result.name;
          const isWebSeries = result.media_type === "tv";
          const resultElem = document.createElement("div");
          const link = document.createElement("a");
          const image = document.createElement("img");
          const info = document.createElement("div");
          const heading = document.createElement("h3");
          const metadata = document.createElement("p");

          resultElem.className = "result";
          resultElem.setAttribute("TMDB", result.id);
          link.className = "links";
          link.href = isWebSeries
            ? PLAYER_CONFIG.embedTvUrl(result.id, 1, 1)
            : PLAYER_CONFIG.embedMovieUrl(result.id);
          link.setAttribute("url", `tmdb=${result.id}&type=${isWebSeries ? "tv" : "movie"}`);
          link.setAttribute("TMDB", result.id);
          link.setAttribute("title", title);
          link.setAttribute("isWebSeries", String(isWebSeries));
          link.addEventListener("click", (event) => {
            event.preventDefault();
            setUrl(link);
            setVideo(link);
          });
          image.src = `https://image.tmdb.org/t/p/w500${result.poster_path}`;
          image.alt = `${title} poster`;
          info.className = "info";
          heading.textContent = title;
          metadata.textContent = result.media_type === "tv" ? "TV Show" : "Movie";
          info.append(heading, metadata);
          link.append(image, info);
          resultElem.appendChild(link);
          resultsContainer.appendChild(resultElem);
        });
    });
}

// A function which will set the player url and page url by imitating a anchor tag click

// fetch titile of movie/webseries by its imdb id

const fetchTitle = async (imdbID) => {
  const response = await tmdbFetch(`/find/${imdbID}`);
  const data = await response.json();
    const result = data.movie_results[0] || data.tv_results[0];
  return result?.title || result?.name;
};

const fetchMediaTitle = async (tmdbID, type) => {
  const response = await tmdbFetch(`/${type === "tv" ? "tv" : "movie"}/${tmdbID}`);
  const data = await response.json();
  return data.title || data.name;
};

function setAllTmdb(tmdbID, title, season = "1", episode = "1", type) {
  const link = document.createElement("a");
  const isWebSeries = type === "tv";
  link.setAttribute("url", `tmdb=${tmdbID}&type=${type}&season=${season}&episode=${episode}`);
  link.setAttribute("TMDB", tmdbID);
  link.setAttribute("title", title);
  link.setAttribute("isWebSeries", String(isWebSeries));
  link.setAttribute("class", "links");
  link.setAttribute(
    "href",
    isWebSeries
      ? PLAYER_CONFIG.embedTvUrl(tmdbID, season, episode)
      : PLAYER_CONFIG.embedMovieUrl(tmdbID)
  );
  setUrl(link);
  setVideo(link);
}

// set url of element by getting its custom url attirbute

function setUrl(element) {
  let search = element.getAttribute("url");
  window.history.replaceState({}, "", `?${search.replace(/%20/g, "+")}`);
}

// insert search query in search box from url and set contents from url

function fillSearchInput() {
  let searchParams = new URLSearchParams(window.location.search);
  let search = searchParams.get("search");
  let season = searchParams.get("season");
  let episode = searchParams.get("episode");
  let imdb = searchParams.get("imdb");
  let type = searchParams.get("type");

  // It will set search query in search box from url

  if (search && !season && !episode && !imdb && !tmdb) {
    search = search.replace(/\+/g, "%20");
    const searchInput = document.querySelector("#search-input");
    searchInput.value = search;
    fetchAndShow();
  }

  // It will set the contents according to url data
  else if (tmdb && type && !search) {
    fetchMediaTitle(tmdb, type)
      .then((title) => setAllTmdb(tmdb, title, season || "1", episode || "1", type))
      .catch((error) => console.error(error));

    // It will set the contents according to the legacy IMDb URL data
  } else if (imdb && type && !search && !episode && !season) {
    fetchTitle(imdb)
      .then((title) => setAll(imdb, title, season, episode, type))
      .catch((error) => console.error(error));

    // It will set the contents according to url data
  } else if (imdb && !search && episode && season) {
    console.log("season", season, "episode", episode);

    fetchTitle(imdb)
      .then((title) => setAll(imdb, title, season, episode, type))
      .catch((error) => console.error(error));
    console.log("season", season, "episode", episode);
  }
}

fillSearchInput();
loadTrending();

// update url by search query

function updateURL(input) {
  let search = input.value;
  if (search) {
    window.history.replaceState(
      {},
      "",
      `?search=${encodeURIComponent(search).replace(/%20/g, "+")}`
    );
  } else {
    window.history.replaceState({}, "", window.location.pathname);
  }
}

// Highlighting Selected Card

function highlightCards() {
  let searchParams = new URLSearchParams(window.location.search);
  let media_id = searchParams.get("tmdb") || searchParams.get("imdb");
  try {
    document.querySelectorAll(".result").forEach(function (card) {
      card.className = "result";
    });
    document.querySelector(`div[TMDB=${media_id}], div[IMDB=${media_id}]`).className =
      "result hoverClass";
  } catch (error) {
    // will throw error only if the class is not present
  }
}

// Listen for the onpopstate event and update the display of elements with the class "information"
window.onpopstate = function () {
  let searchParams = new URLSearchParams(window.location.search);
  let search = searchParams.get("search");
  let imdb = searchParams.get("imdb");
  let tmdb = searchParams.get("tmdb");

  if (search || imdb || tmdb) {
    let elements = document.getElementsByClassName("information");

    for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = "none";
    }
  } else {
    let elements = document.getElementsByClassName("information");

    for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = "block";
    }
  }
};

// auto search by input which will execute when user stops typing for 500ms

let timer;

searchInput.addEventListener("keyup", function () {
  let inputQuery = this;
  clearTimeout(timer);
  timer = setTimeout(function () {
    updateURL(inputQuery);
    fetchAndShow();
    window.dispatchEvent(new PopStateEvent("popstate"));
    scrollToResults();
  }, 500); // wait for 500ms before executing the function
});

// button click search

searchButton.addEventListener("click", function () {
  fetchAndShow();
  scrollToResults();
  // hide information
  window.dispatchEvent(new PopStateEvent("popstate"));
});

// higlight episodes of webseries

function episodeHighlight(cssidentification = "s1e1") {
  document.querySelectorAll(".episodes").forEach(function (episode) {
    episode.className = "episodes";
  });
  document.querySelector(
    `.episodes[cssidentification='${cssidentification}']`
  ).className = "episodes selected";
}

// === GLOBAL PLAYER CONFIGURATION ===
const PLAYER_CONFIG = {
  iframeId: "iframe",
  videoContainerId: "video",
  embedMovieUrl: (tmdb) => `https://vidsrc.su/embed/movie/${tmdb}`,
  embedTvUrl: (tmdb, season, episode) =>
    `https://vidsrc.su/embed/tv/${tmdb}/${season}/${episode}`,
};

// Helper to get TMDB ID from IMDb ID
async function fetchTmdbIdFromImdb(imdbID) {
  const url = `/api/tmdb/find/${imdbID}?language=en-US&external_source=imdb_id`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    // For movies, TMDB ID is in movie_results[0].id
    return data.movie_results && data.movie_results[0] ? data.movie_results[0].id : null;
  } catch (error) {
    console.error("Failed to fetch TMDB ID:", error);
    return null;
  }
}

// Helper to get TMDB ID from IMDb ID for TV shows
async function fetchTmdbTvIdFromImdb(imdbID) {
  const url = `/api/tmdb/find/${imdbID}?language=en-US&external_source=imdb_id`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    // For TV shows, TMDB ID is in tv_results[0].id
    return data.tv_results && data.tv_results[0] ? data.tv_results[0].id : null;
  } catch (error) {
    console.error("Failed to fetch TMDB ID for TV show:", error);
    return null;
  }
}

// setAll function updated to use TMDB ID for both movies and TV shows
async function setAll(imdb, title, season, episode, type) {
  if (imdb && title && !season && !episode && type) {
    // Movie: get TMDB ID first
    const tmdbId = await fetchTmdbIdFromImdb(imdb);
    if (!tmdbId) {
      alert("Could not find TMDB ID for this movie.");
      return;
    }
    let a = document.createElement("a");
    a.setAttribute("onClick", "setUrl(this); return setVideo(this);");
    a.setAttribute(
      "url",
      `imdb=${imdb}&type=movie&title=${title.replace(/ /g, "_")}`
    );
    a.setAttribute("isWebSeries", "false");
    a.setAttribute("title", title);
    a.setAttribute("class", "links");
    a.setAttribute("IMDB", imdb);
    a.setAttribute("href", PLAYER_CONFIG.embedMovieUrl(tmdbId));
    a.click();
  } else if (imdb && title && episode && !type) {
    // TV: get TMDB ID first
    const tmdbId = await fetchTmdbTvIdFromImdb(imdb);
    if (!tmdbId) {
      alert("Could not find TMDB ID for this TV show.");
      return;
    }
    let a = document.createElement("a");
    a.setAttribute("onClick", "setUrl(this); return setVideo(this);");
    console.log("season setall", season, "episode", episode);
    a.setAttribute("url", `imdb=${imdb}&season=${season}&episode=${episode}`);
    a.setAttribute("isWebSeries", "true");
    a.setAttribute("title", title);
    a.setAttribute("class", "links");
    a.setAttribute("IMDB", imdb);
    a.setAttribute(
      "href",
      PLAYER_CONFIG.embedTvUrl(tmdbId, season, episode)
    );
    a.click();
  }
}

// fetch and set video

function setVideo(element) {
  const iframe = document.getElementById(PLAYER_CONFIG.iframeId);
  const video = document.getElementById(PLAYER_CONFIG.videoContainerId);
  iframe.removeAttribute("sandbox");
  iframe.src = element.getAttribute("href");
  video.style.display = "block";
  const webSeriesData = document.getElementById("webSeriesData");
  const imdbID = element.getAttribute("IMDB");
  const tmdbID = element.getAttribute("TMDB");
  Pace.restart();
  scrollToTop();

  // hide information
  window.dispatchEvent(new PopStateEvent("popstate"));

  // clearing episodes list box for another series

  if (
    element.getAttribute("isWebSeries") == "false" &&
    element.className == "links"
  ) {
    webSeriesData.innerHTML = "";
  }

  // setting page title

  if (element.getAttribute("title") !== "") {
    document.title = element.getAttribute("title");
  }

  // highlight selected webseries episode

  if (element.className.includes("episode")) {
    episodeHighlight(element.getAttribute("cssidentification"));
    console.log("clicked");
  }

  // Displaying webseries episode

  if (element.getAttribute("isWebSeries") == "true") {
    webSeriesData.innerHTML = "";
    async function printEpisodes() {
      let showId = tmdbID;
      if (!showId) {
        const response = await fetch(
          `/api/tmdb/find/${imdbID}?language=en-US&external_source=imdb_id`
        );
        const data = await response.json();
        showId = data.tv_results[0].id;
      }

      // Next, get information about the show's seasons
      const seasonsData = await fetch(
        `/api/tmdb/tv/${showId}?language=en-US`
      );
      const seasonsDataJSON = await seasonsData.json();
      const numberOfSeasons = seasonsDataJSON.number_of_seasons;

      webSeriesData.innerHTML += `<h2>Seasons:</h2>`;
      for (
        let seasonNumber = 1;
        seasonNumber <= numberOfSeasons;
        seasonNumber++
      ) {
        webSeriesData.innerHTML += `<h3>Season ${seasonNumber}:</h3><br>`;
        let episodeContainer = document.createElement("div");
        episodeContainer.classList.add("episode-container");
        let episodesData = "";

        // Get information about episodes in the season
        const episodesDataResponse = await fetch(
          `/api/tmdb/tv/${showId}/season/${seasonNumber}?language=en-US`
        );
        const episodesDataJSON = await episodesDataResponse.json();

        for (const episode of episodesDataJSON.episodes) {
          const episodeNumber = episode.episode_number;
          let formatedEpisodeNumber = episodeNumber.toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          });
          episodesData += `<a class="episodes" title="${seasonsDataJSON.name + ": E" + formatedEpisodeNumber + ". " + episode.name}" cssidentification="s${seasonNumber}e${episodeNumber}" url="imdb=${imdbID}&season=${seasonNumber}&episode=${episodeNumber}&title=${seasonsDataJSON.name.replace(/ /g, "_") + "_E" + formatedEpisodeNumber + "_" + episode.name.replace(/ /g, "_")}" onClick="event.preventDefault();setVideo(this);setUrl(this); " href="${PLAYER_CONFIG.embedTvUrl(showId, seasonNumber, episodeNumber)}">E${formatedEpisodeNumber}. ${episode.name}</a>`;
        }

        episodeContainer.innerHTML = episodesData;
        webSeriesData.appendChild(episodeContainer);
        episodeHighlight();
      }

      // Highlighting Selected Episodes as per url

      let searchParams = new URLSearchParams(window.location.search);
      let season = searchParams.get("season");
      let episode = searchParams.get("episode");

      if (season && episode) {
        document
          .querySelector(`a[cssIdentification="s${season}e${episode}"]`)
          .click();
      } else if (season && !episode) {
        document.querySelector(`a[cssIdentification="s${season}e1"]`).click();
      } else {
        document.querySelector(`a[cssIdentification="s1e1"]`).click();
      }
    }
    printEpisodes();
  } else {
  }

  // pushing data to analytics by gtag

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());

  gtag("config", "G-THTQ9GZQ0J");

  highlightCards();

  // returning false so that anchor tag do not work as link

  return false;
}
