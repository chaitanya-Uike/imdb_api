const fastify = require("fastify")({ logger: true });
const amqp = require("amqplib");
const config = require("./config");
const RequestManager = require("./lib/RequestManager");

fastify.register(require("./routes/imdb"));

const start = async () => {
  let rabbitMQConnection;
  try {
    rabbitMQConnection = await amqp.connect("amqp://rabbitMQ");
    const channel = await rabbitMQConnection.createChannel();
    const requestManager = new RequestManager();

    await channel.assertExchange(config.exchange, "direct", { durable: false });
    await channel.assertQueue(config.rpcResponseQueue, { exclusive: true });

    await channel.bindQueue(
      config.rpcResponseQueue,
      config.exchange,
      "response"
    );

    channel.consume(
      config.rpcResponseQueue,
      (message) => {
        const res = message.content.toString();
        const correlationId = message.properties.correlationId;

        requestManager.dispatch(correlationId, res);

        channel.ack(message);
      },
      {
        noAck: false,
      }
    );

    fastify.decorate("channel", channel);
    fastify.decorate("requestManager", requestManager);
    await fastify.listen({ port: 5000, host: "0.0.0.0" });
  } catch (error) {
    fastify.log.error(error);
    rabbitMQConnection && rabbitMQConnection.close();
    process.exit(1);
  }
};

start();
