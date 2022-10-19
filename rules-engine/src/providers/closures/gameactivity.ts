import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
// import { AppFacts, AppContext } from '../../types';
import conf from '../../conf';

export default [
  closureGenerator('gameactivity-publish-daily-leaderboard', [
    {
      closure: 'publish-amqp-message',
      exchange: conf.amqp.mainExchange,
      routingKey: 'game.state.gamestate',
      type: 'gamestate',
      '^data': {
        leaderboardType: 'daily',
        '^leaderboard': 'dailyLeaderboard',
      },
    },
  ]),
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
        { $sort: { rank: 1 } },
      ],
    },
  ]),
  closureGenerator('gameactivity-insert-player-actions', [
    {
      closure: 'config-get',
      key: 'leaderboardupdate',
      outputKey: 'leaderboardUpdateEnabled',
    },
    {
      closure: 'convert-timestamp-to-epoch',
      key: 'message.timestamp',
      outputKey: 'leaderboardUpdateEnabled',
    },
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
          {
            closure: 'players-get-from-rfid',
            '^playerRfid': 'item.scoringPlayerRfid',
            outputKey: 'scoringPlayerInfo',
          },
          {
            closure: 'players-get-from-rfid',
            '^playerRfid': 'item.actionPlayerRfid',
            outputKey: 'actionPlayerInfo',
          },
          'logFacts',
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
          'logFacts',
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
