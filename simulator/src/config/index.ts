export default {
  server: {
    host: process.env.UDP_HOST || 'localhost',
    port: parseInt(process.env.UDP_PORT || '3333'),
  },
  amqp: {
    connectionString: process.env.AMQP_CONNECTION_STRING,
    amqp_opts: {},
    mainExchange: 'ex.iaapa-topic',
    tempGamestateQueue: 'qu.iaapa-unity-gamestate-temp',
    tempLeaderboardQueue: 'qu.iaapa-unity-leaderboard-temp',
  },
};
