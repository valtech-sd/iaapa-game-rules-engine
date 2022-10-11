export default {
  logger: {
    style: process.env.LOG_STYLE || 'colored',
    level: process.env.LOG_LEVEL || 'trace',
    appName: 'IAAPA_BACKEND',
  },
  server: {
    port: parseInt(process.env.UDP_PORT || '3333'),
  },
  amqp: {
    connectionString: process.env.AMQP_CONNECTION_STRING,
    amqp_opts: {},
    mainExchange: 'ex.iaapa-topic',
    rulesEngineQueue: 'qu.iaapa-rules-engine',
    unityQueue: 'qu.iaapa-unity',
  },
  mongodb: {
    host: process.env.MONGODB_HOST || 'localhost',
    port: parseInt(process.env.MONGODB_PORT || '27017'),
    database: process.env.MONGODB_DATABASE || 'default',
    username: process.env.MONGODB_USERNAME || '',
    password: process.env.MONGODB_PASSWORD || '',
    poolSize: 5,
  },
};
