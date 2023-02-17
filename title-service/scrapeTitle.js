const cheerio = require("cheerio");
const axios = require("axios");

async function scrapeTitle(id) {
  let { data } = await axios.get(`https://www.imdb.com/title/${id}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
    },
  });
  const $ = cheerio.load(data);

  const title = $('[data-testid="hero-title-block__title"]').text().trim();
  const datePublished = $(
    '[data-testid="title-details-releasedate"] .ipc-metadata-list-item__content-container a'
  )
    .text()
    .trim();
  const runtime = $('[data-testid="hero-title-block__metadata"] li')
    .last()
    .text()
    .trim();
  const genre = $('[data-testid="genres"] a')
    .map(function () {
      return $(this).text();
    })
    .toArray();
  const description = $('[data-testid="plot"]').first().text().trim();
  const director = getDirector($);
  const stars = getStars($);
  const poster = $("[data-testid=hero-media__poster] img").attr("src");
  const metascore = $(".score-meta").text().trim() || null;
  const imdbRating = $(
    '[data-testid="hero-rating-bar__aggregate-rating__score"] > span'
  )
    .first()
    .text()
    .trim();
  const imdbID = $('[property="imdb:pageConst"]').attr("content");
  const type = $('[property="og:type"]').attr("content")?.replace("video.", "");
  const language = $('[data-testid="title-details-languages"] li')
    .map(function () {
      return $(this).text().trim();
    })
    .toArray();
  const budget = $('[data-testid="title-boxoffice-budget"] label')
    .text()
    .trim();
  const grossWorldwide = $(
    '[data-testid="title-boxoffice-cumulativeworldwidegross"] label'
  )
    .text()
    .trim();
  const cast = getCast($);
  const seasons = getSeasons($);
  return {
    title,
    datePublished,
    runtime,
    genre,
    description,
    director,
    stars,
    poster,
    metascore,
    imdbRating,
    imdbID,
    type,
    language,
    budget,
    grossWorldwide,
    cast,
    seasons,
  };
}

function getCast($) {
  const cast = $('[data-testid="title-cast-item"]')
    .map(function () {
      return {
        img: $(this).find("img").attr("src"),
        name: $(this)
          .find('[data-testid="title-cast-item__actor"]')
          .text()
          .trim(),
        character: $(this)
          .find('[data-testid="cast-item-characters-link"] span')
          .text()
          .trim(),
      };
    })
    .toArray();

  return cast;
}

function getDirector($) {
  const directors = $(
    'li[data-testid="title-pc-principal-credit"]:first-child li'
  )
    .map(function () {
      return $(this).text().trim();
    })
    .toArray()
    .filter(filterDistinct);
  return directors;
}

function getStars($) {
  const stars = $('li[data-testid="title-pc-principal-credit"]:last-child li')
    .map(function () {
      return $(this).text().trim();
    })
    .toArray()
    .filter(filterDistinct);
  return stars;
}

function getSeasons($) {
  const seasons = $("#browse-episodes-season option")
    .filter(function () {
      return parseInt($(this).attr("value") || "0") >= 1;
    })
    .map(function () {
      return Number($(this).attr("value"));
    })
    .toArray()
    .filter((x) => x)
    .sort();

  return seasons;
}

function filterDistinct(value, index, self) {
  return self.indexOf(value) === index;
}

module.exports = scrapeTitle;
