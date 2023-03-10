const amqp = require("amqplib");
const search = require("./search");
const config = require("./config");

async function start() {
  try {
    const connection = await amqp.connect("amqp://rabbitMQ");
    const channel = await connection.createChannel();
    const workerQueue = "search_queue";

    await channel.assertExchange(config.exchange, "direct", { durable: false });
    await channel.assertQueue(workerQueue);
    await channel.bindQueue(workerQueue, config.exchange, "search");

    console.log("[search_service] Awaiting requests");
    channel.consume(
      workerQueue,
      (msg) => {
        const title = msg.content.toString();

        console.log("[search_service] rpc request recieved:", title);

        search(title)
          .then((results) => {
            const res = { status: 200, results };
            channel.publish(
              config.exchange,
              "response",
              Buffer.from(JSON.stringify(res)),
              {
                correlationId: msg.properties.correlationId,
              }
            );
          })
          .catch((error) => {
            console.log("service error:", error);
            const res = { status: 500, message: "some error occurred" };
            channel.publish(
              config.exchange,
              "response",
              Buffer.from(JSON.stringify(res)),
              {
                correlationId: msg.properties.correlationId,
              }
            );
          });

        console.log("[search_service] request processed");
        channel.ack(msg);
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.log(error);
  }
}

start();
