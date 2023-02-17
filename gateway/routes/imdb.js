const { searchSchema, titleSchema } = require("../controllers/schema/imdb");
const { search, title } = require("../controllers/handlers/imdb");

function imdb(fastify, opts, done) {
  fastify.get("/title/:id", { schema: titleSchema, handler: title });
  fastify.get("/search/title", { schema: searchSchema, handler: search });

  done();
}

module.exports = imdb;
