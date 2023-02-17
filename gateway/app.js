const fastify = require("fastify")({ logger: true });
const amqp = require("amqplib");
const config = require("./config");

fastify.register(require("./routes/imdb"));

const start = async () => {
  let rabbitMQConnection;
  try {
    rabbitMQConnection = await amqp.connect("amqp://localhost");
    const channel = await rabbitMQConnection.createChannel();

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

        console.log("response recieved", res);

        channel.ack(message);
      },
      {
        noAck: false,
      }
    );

    fastify.decorate("channel", channel);
    await fastify.listen({ port: 5000 });
  } catch (error) {
    fastify.log.error(error);
    rabbitMQConnection && rabbitMQConnection.close();
    process.exit(1);
  }
};

start();
