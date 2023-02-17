const config = require("../../config");
const { v4: uuid } = require("uuid");

function search(request, reply) {
  const { title } = request.query;

  this.channel.publish(config.exchange, "search", Buffer.from(title), {
    correlationId: uuid(),
    replyTo: config.rpcResponseQueue,
  });

  return { title };
}

function title(request, reply) {
  const { id } = request.params;

  this.channel.publish(config.exchange, "title", Buffer.from(id), {
    correlationId: uuid(),
    replyTo: config.rpcResponseQueue,
  });

  return { id };
}

module.exports = { search, title };
