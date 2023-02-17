const config = require("../../config");
const { v4: uuid } = require("uuid");

function search(request, reply) {
  const { title } = request.query;

  const correlationId = uuid();
  this.channel.publish(config.exchange, "search", Buffer.from(title), {
    correlationId,
    replyTo: config.rpcResponseQueue,
  });

  this.requestManager.on(correlationId, (res) => {
    reply.send(JSON.parse(res));
  });
}

function title(request, reply) {
  const { id } = request.params;

  const correlationId = uuid();
  this.channel.publish(config.exchange, "title", Buffer.from(id), {
    correlationId,
    replyTo: config.rpcResponseQueue,
  });

  this.requestManager.on(correlationId, (res) => {
    reply.send(JSON.parse(res));
  });
}

module.exports = { search, title };
