const cheerio = require("cheerio");
const axios = require("axios");
const qs = require("querystring");

async function search(title) {
  const options = {
    title,
    view: "advanced",
    count: 10,
  };

  let { data } = await axios.get(
    `https://www.imdb.com/search/title?${qs.stringify(options)}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
      },
    }
  );

  const $ = cheerio.load(data);
  const results = [];
  $(".lister-item").each((i, el) => {
    results.push(getResult($(el)));
  });

  return results;
}

function getResult(elem) {
  const title = elem.find(".lister-item-header a").text().trim();
  const year =
    elem.find(".lister-item-year").text().replace(/\(|\)/g, "").trim() || null;
  const poster = elem.find(".lister-item-image img").attr("loadlate") || null;
  const genre = elem.find(".genre").text().trim().split(", ") || null;
  const imdbRating = elem.find('[name="ir"]').attr("data-value") || null;
  const imdbVotes = elem.find('[name="nv"]').attr("data-value") || null;
  const imdbID = elem.find(".lister-item-header a").attr("href")?.split("/")[2];

  return {
    title,
    year,
    poster,
    genre,
    imdbRating,
    imdbVotes,
    imdbID,
  };
}

module.exports = search;
