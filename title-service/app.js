const amqp = require("amqplib");
const config = require("./config");
const scrapeTitle = require("./scrapeTitle");

async function start() {
  try {
    const connection = await amqp.connect("amqp://rabbitMQ");
    const channel = await connection.createChannel();

    const workerQueue = "title_queue";

    await channel.assertExchange(config.exchange, "direct", { durable: false });
    await channel.assertQueue(workerQueue);
    await channel.bindQueue(workerQueue, config.exchange, "title");

    console.log("[title_service] Awaiting requests");
    channel.consume(
      workerQueue,
      (msg) => {
        const id = msg.content.toString();

        console.log("[title_service] rpc request recieved:", id);

        scrapeTitle(id)
          .then((result) => {
            const res = { status: 200, result };
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

        console.log("[title_service] request processed");
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
