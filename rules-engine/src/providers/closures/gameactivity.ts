import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
// import { AppFacts, AppContext } from '../../types';
import conf from '../../conf';

export default [
  closureGenerator('gameactivity-get-leaderboard', [
    {
      closure: 'parameter',
      parameterKey: 'gameId',
      outputParameterTo: 'gameactivity-get-leaderboard.gameId',
      '^defaultValue': 'message.data.gameId',
    },
    {
      closure: 'mongodb-aggregate',
      '^pipeline': [
        { '^$match': { '^gameId': 'gameactivity-get-leaderboard.gameId' } },
        {
          $group: {
            _id: {
              scoringPlayerRfid: '$scoringPlayerRfid',
              scorePlayerId: '$scoringPlayerId',
            },
            score: { $sum: '$count' },
          },
        },
      ],
      // outputKey is implicitly pased through / mongodb-aggregate defaults to aggregate for the ouputKey if not defined
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
