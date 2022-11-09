import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
// import { AppFacts, AppContext } from '../../types';
import conf from '../../conf';

export default [
  /**
   * gameactivity-publish-daily-leaderboard
   * Publish daily leaderboard message
   * Do this by...
   * 1. Call publish-amqp-message closure with data from facts
   *
   * @param facts.dailyLeaderboard is expected to contain the dailyLeaderboard
   */
  closureGenerator('gameactivity-publish-daily-leaderboard', [
    {
      closure: 'publish-amqp-message',
      exchange: conf.amqp.mainExchange,
      routingKey: 'daily.leaderboard',
      type: 'leaderboard',
      '^data': {
        leaderboardType: 'daily',
        '^leaderboard': 'dailyLeaderboard',
      },
    },
  ]),
  /**
   * gameactivity-get-daily-leaderboard
   * Get the daily leaderboard from mongodb GameActivity using mongodb aggregate pipeline
   * Do this by...
   * 1. Get timestamp range time since epoch at start and end of the day to be able to filter game activity by the current day
   * 2. Get the gameId parameter  - Default to facts.messagte.data.gameId value
   * 3. Run mongodb aggregate pipeline to generate leaderboard
   *
   * @param facts.gameId - Optional, defaults to the value in facts.message.data.gameId
   * @return facts - facts.dailyleaderboard contains the daily leaderboard with a list of players and the score and rank
   */
  closureGenerator('gameactivity-get-daily-leaderboard', [
    'get-timestamp-range-of-today', // Fills timestampRange with todays start and end timestamp
    {
      closure: 'parameter',
      parameterKey: 'gameId',
      outputParameterTo: 'gameactivity-get-leaderboard.gameId',
      '^defaultValue': 'message.data.gameId',
    },
    {
      closure: 'mongodb-aggregate',
      collection: conf.mongodb.collections.GameActivity,
      outputKey: 'dailyLeaderboard',
      '^pipeline': [
        {
          '^$match': {
            loaderboardEnabled: true,
            actionType: 'hits',
            // '^timestamp': {
            //   // Current day rnage
            //   '^$gte': 'timestampRange.start',
            //   '^$lte': 'timestampRange.end',
            // },
          },
        },
        {
          $group: {
            _id: { gameId: '$gameId', scoringPlayerId: '$scoringPlayerId' },
            score: { $sum: '$count' },
          },
        },
        {
          $group: {
            _id: { scoringPlayerId: '$_id.scoringPlayerId' },
            score: { $max: '$score' },
          },
        },
        {
          $lookup: {
            from: conf.mongodb.collections.Players,
            localField: '_id.scoringPlayerId',
            foreignField: '_id',
            as: 'players',
          },
        },
        { $unwind: '$players' },
        {
          $project: {
            playerId: '$_id.scoringPlayerId',
            score: '$score',
            _id: 0,
            playerName: '$players.name',
          },
        },
        {
          $setWindowFields: {
            sortBy: { score: -1 },
            output: {
              rank: {
                $rank: {},
              },
            },
          },
        },
        { $sort: { rank: 1, playerName: 1 } },
      ],
    },
  ]),
  /**
   * gameactivity-insert-player-actions
   * Insert player actions that come from the playeractions message into the GameActivity collection
   * Do this by...
   * 1. Get leaderboard update config state
   * 2. Convert the message tiemstamp for use when we insert the actions
   * 3. Map the actions in the message to some output. Providing a mapDef
   * 4. In the Mapfn closure section of the top level map closure, we lookup scoring player info
   * 5. In the Mapfn closure section of the top level map closure, we lookup action player info
   * 6. In the Mapfn closure section of the top level map closure, we set the scoring and action player id
   * 7. In the Mapfn closure section of the top level map closure, we save each action to the database
   */
  closureGenerator('gameactivity-insert-player-actions', [
    // 1. Get leaderboard update config state
    {
      closure: 'config-get',
      key: 'leaderboardupdate',
      outputKey: 'leaderboardUpdateEnabled',
    },
    // 2. Convert the message tiemstamp for use when we insert the actions
    {
      closure: 'convert-timestamp-to-epoch',
      key: 'message.timestamp',
    },
    // 3. Map the actions in the message to some output. Providing a mapDef
    {
      closure: 'map',
      key: 'message.data.actions',
      mapDef: {
        timestamp: '$root.message.timestamp',
        gameId: '$root.message.data.gameId',
        loaderboardEnabled: '$root.leaderboardUpdateEnabled',
        scoringPlayerRfid: '$root.message.data.scoringPlayerRfid',
        actionPlayerRfid: 'item.playerRfid',
        actionType: 'item.type',
        count: 'item.count',
        turnNumber: '$root.message.turnNumber',
        turnLengthMs: '$root.message.turnLengthMs',
      },
      mapFn: {
        rules: [
          // 4. In the Mapfn closure section of the top level map closure, we lookup scoring player info
          {
            closure: 'players-get-from-rfid',
            '^playerRfid': 'item.scoringPlayerRfid',
            outputKey: 'scoringPlayerInfo',
          },
          // 5. In the Mapfn closure section of the top level map closure, we lookup action player info
          {
            closure: 'players-get-from-rfid',
            '^playerRfid': 'item.actionPlayerRfid',
            outputKey: 'actionPlayerInfo',
          },
          // 6. In the Mapfn closure section of the top level map closure, we set the scoring and action player id
          {
            closure: 'set',
            key: 'item.scoringPlayerId',
            '^value': 'scoringPlayerInfo._id',
          },
          {
            closure: 'set',
            key: 'item.actionPlayerId',
            '^value': 'actionPlayerInfo._id',
          },
          // 7. In the Mapfn closure section of the top level map closure, we save each action to the database
          {
            closure: 'mongodb-save',
            collection: conf.mongodb.collections.GameActivity,
            '^document': 'item',
          },
        ],
      },
    },
  ]),
];
