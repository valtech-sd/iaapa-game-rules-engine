import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
// import { AppFacts, AppContext } from '../../types';
import conf from '../../conf';

export default [
  closureGenerator('gamestate-start', [
    {
      closure: 'mongodb-save',
      collection: conf.mongodb.collections.GameState,
      '^document': {
        '^_id': 'message.data.gameId',
        gameStatus: 'run',
        '^gameStartTimestamp': 'message.data.gameStartTimestamp',
        '^gameLengthMs': 'message.data.gameLengthMs',
      },
    },
  ]),
  closureGenerator('gamestate-end', [
    {
      closure: 'mongodb-save',
      collection: conf.mongodb.collections.GameState,
      '^document': {
        '^_id': 'message.data.gameId',
        gameStatus: 'end',
      },
    },
  ]),
  closureGenerator('gamestate-reset-game', [
    {
      closure: 'mongodb-save',
      collection: conf.mongodb.collections.GameState,
      '^document': {
        '^_id': 'message.data.gameId',
        gameStatus: 'loading',
        gameStartTimestamp: null,
        gameLengthMs: null,
        location: [],
      },
    },
  ]),
  closureGenerator('gamestate-get', [
    {
      closure: 'mongodb-get',
      collection: conf.mongodb.collections.GameState,
      '^_id': 'message.data.gameId',
      outputKey: 'gameStateDoc',
    },
  ]),
];
