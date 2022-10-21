import AmqpCacoon from 'amqp-cacoon';
import conf from '../config';

// Setup amqp input/output providers
export async function setupAmqp() {
  console.info('Connecting to AMQP');
  // Since the AMQP Input requires an AMQP Cacoon object, let's start by creating that.
  // AMQP Cacoon is a library that makes it easy to connect to RabbitMQ.
  let amqpCacoon = new AmqpCacoon({
    connectionString: conf.amqp.connectionString,
    amqp_opts: conf.amqp.amqp_opts,
    providers: {
      //logger: console,
    },
    onBrokerConnect: async (_connection, _url) => {
      // Log a connection
      console.info(`Connected to broker`);
    },
    onBrokerDisconnect: async (err) => {
      // Log a disconnect
      console.error(
        `ERROR: Setup AmqpCacoon.onBrokerDisconnect - Broker disconnected`,
        err
      );
    },
    // Important - onChannelConnect will ensure a certain configuration exists in RMQ.
    // This might not be needed in environments where RMQ is set up by some other process!
    onChannelConnect: async (channel) => {
      try {
        console.info('Connected to AMQP');
        channel.prefetch(1);
        await channel.assertQueue(conf.amqp.tempGamestateQueue, {
          autoDelete: true,
          durable: false,
        });
        await channel.assertQueue(conf.amqp.tempLeaderboardQueue, {
          autoDelete: true,
          durable: false,
        });
        // Make sure we have our main exchange
        await channel.assertExchange(conf.amqp.mainExchange, 'topic', {
          autoDelete: false,
          durable: false,
        });
        // Bind the new Exchange and Queues together
        await channel.bindQueue(
          conf.amqp.tempGamestateQueue,
          conf.amqp.mainExchange,
          '#.gamestate'
        );
        await channel.bindQueue(
          conf.amqp.tempGamestateQueue,
          conf.amqp.mainExchange,
          '#.turnstart'
        );
        await channel.bindQueue(
          conf.amqp.tempLeaderboardQueue,
          conf.amqp.mainExchange,
          '#.leaderboard'
        );
      } catch (ex) {
        console.error(`ERROR: Setup - AmqpCacoon.onChannelConnect`, ex);
      }
    },
  });

  return amqpCacoon;
}
