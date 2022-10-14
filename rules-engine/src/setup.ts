// Bring in Package Dependencies
import RulesHarvester, {
  ILogger,
  CoreInputAmqp,
  CoreOutputAmqp,
  CoreInputUdp,
} from 'rule-harvester';
import conf from './conf';
import ruleClosures from './providers/closures';
import ruleCorpus from './providers/corpus';
import AmqpCacoon from 'amqp-cacoon';
import { MongoClient, Db } from 'mongodb';

/**
 * setup
 * Setup the rules engine application
 * do this by..
 * 1. Setup mongodb
 * 2. Setup udp input provider to listen for show control messages
 * 3. Setup the amqp input + output provider
 * 4. Setup the rule harvester by connecting the providers to it
 * 5. Start the rule harvester
 **/
export const setup = async ({ logger }: { logger: ILogger }) => {
  // 1. Setup mongodb
  let { mongoDatabase } = await setupMongoDB({ logger });

  // 2. Setup udp input provider to listen for show control messages
  let { coreUdpInput } = await setupUdp({ logger });

  // 3. Setup the amqp input + output provider
  let { coreInputAmqpProvider, coreOutputAmqpProvider } = await setupAmqp({
    logger,
  });

  // 4. Setup the rule harvester by connecting the providers to it
  let rulesHarvester = new RulesHarvester({
    providers: {
      inputs: [coreInputAmqpProvider, coreUdpInput],
      outputs: [coreOutputAmqpProvider],
      corpus: ruleCorpus,
      closures: ruleClosures,
      logger: logger,
    },
    extraContext: {
      mongoDatabase,
    },
  });

  // 5. Start the rule harvester
  rulesHarvester.start();
};

// Setup UDP Server input provider
async function setupUdp({ logger }: { logger: ILogger }) {
  logger.info('Setup UDP Input Provider');
  const coreUdpInput = new CoreInputUdp([conf.server.port], logger, {});
  return { coreUdpInput };
}

// Setup MongoDB Connection
async function setupMongoDB({ logger }: { logger: ILogger }) {
  let mongoDatabase: Db;
  try {
    // Build connection string
    let authString =
      conf.mongodb.username && conf.mongodb.password
        ? `${conf.mongodb.username}:${encodeURIComponent(
            conf.mongodb.password
          )}@`
        : '';
    let clientString = `mongodb://${authString}${conf.mongodb.host}:${conf.mongodb.port}/${conf.mongodb.database}`;

    logger.info('MongoDB: Setup started', clientString);
    // Create MongoDB client
    let client = new MongoClient(clientString, {
      maxPoolSize: conf.mongodb.poolSize,
      minPoolSize: Math.min(5, conf.mongodb.poolSize),
    });
    // Connect Client
    await client.connect();
    // Get database
    mongoDatabase = client.db();
    // Initiate databse
    // Setup leaderboard config
    await mongoDatabase
      .collection(conf.mongodb.collections.Config)
      .findOneAndUpdate(
        { _id: 'leaderboardupdate' },
        {
          $setOnInsert: {
            _id: 'leaderboardupdate',
            value: true,
          },
        },
        {
          upsert: true,
        }
      );
    // Set initial ShowMode config ( Start in idle mode )
    await mongoDatabase
      .collection(conf.mongodb.collections.Config)
      .findOneAndUpdate(
        { _id: 'showmode' },
        {
          $setOnInsert: {
            _id: 'showmode',
            value: 'idle',
          },
        },
        {
          upsert: true,
        }
      );
    logger.info('MongoDB: Connected to MongoDB');
    logger.info('MongoDB: Setup Done');
  } catch (e) {
    logger.error('MongoDB: Unable to start database connection', e);
    throw e;
  }
  return { mongoDatabase };
}

// Setup amqp input/output providers
async function setupAmqp({ logger }: { logger: ILogger }) {
  logger.info('Connecting to AMQP');
  // Since the AMQP Input requires an AMQP Cacoon object, let's start by creating that.
  // AMQP Cacoon is a library that makes it easy to connect to RabbitMQ.
  let amqpCacoon = new AmqpCacoon({
    connectionString: conf.amqp.connectionString,
    amqp_opts: conf.amqp.amqp_opts,
    providers: {
      logger: logger,
    },
    onBrokerConnect: async (_connection, _url) => {
      // Log a connection
      logger.info(`Connected to broker`);
    },
    onBrokerDisconnect: async (err) => {
      // Log a disconnect
      logger.error(
        `ERROR: Setup AmqpCacoon.onBrokerConnect - Broker disconnected`,
        err
      );
    },
    // Important - onChannelConnect will ensure a certain configuration exists in RMQ.
    // This might not be needed in environments where RMQ is set up by some other process!
    onChannelConnect: async (channel) => {
      try {
        logger.info('Connected to AMQP');
        // Notice all of these are done in sequence with AWAIT. This is so that each
        // operation can depend on the prior operation having finished. This is important
        // when binding Queues to Exchanges, for example, because you need both the
        // Exchange and Queue to exist prior to trying to bind them together.
        // Make sure we have our queues
        await channel.assertQueue(conf.amqp.rulesEngineQueue, {
          autoDelete: true,
          durable: false,
        });
        await channel.assertQueue(conf.amqp.gamestateQueue, {
          autoDelete: true,
          durable: false,
        });
        await channel.assertQueue(conf.amqp.leaderboardQueue, {
          autoDelete: true,
          durable: false,
        });
        // Make sure we have our main exchange
        await channel.assertExchange(conf.amqp.mainExchange, 'topic', {
          autoDelete: true,
          durable: false,
        });
        // Bind the new Exchange and Queues together
        await channel.bindQueue(
          conf.amqp.rulesEngineQueue,
          conf.amqp.mainExchange,
          '#'
        );
        await channel.bindQueue(
          conf.amqp.gamestateQueue,
          conf.amqp.mainExchange,
          '#.gamestate'
        );
        await channel.bindQueue(
          conf.amqp.leaderboardQueue,
          conf.amqp.mainExchange,
          '#.leaderboard'
        );
      } catch (ex) {
        logger.error(`ERROR: Setup - AmqpCacoon.onChannelConnect`, ex);
      }
    },
  });

  // Setup the AMQP Input Provider
  logger.info('Setup AMQP Input Provider');
  const coreInputAmqpProvider = new CoreInputAmqp(
    amqpCacoon, // Our amqpCacoon object manages RMQ connections
    conf.amqp.rulesEngineQueue, // This is the queue you're going to be consuming from
    logger, // This is the logger the libraries will use when logging anything.
    { requeueOnNack: false }
  );

  const coreOutputAmqpProvider = new CoreOutputAmqp(amqpCacoon, logger);

  return { amqpCacoon, coreInputAmqpProvider, coreOutputAmqpProvider };
}
