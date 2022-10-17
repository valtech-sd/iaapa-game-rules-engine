import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
// import { AppFacts, AppContext } from '../../types';
import conf from '../../conf';

export default [
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
            closure: 'mongodb-save',
            collection: conf.mongodb.collections.GameActivity,
            '^document': 'item',
          },
        ],
      },
    },
  ]),
];
