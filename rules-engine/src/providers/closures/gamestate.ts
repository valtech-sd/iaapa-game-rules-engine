import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
import { AppFacts, AppContext } from '../../types';
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
        gameStatus: 'load',
        gameStartTimestamp: null,
        gameLengthMs: null,
        locations: [],
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
  closureGenerator('gamestate-add-player', [
    // Get player from database
    {
      closure: 'players-get-from-rfid',
      '^playerRfid': 'message.data.playerRfid',
      outputKey: 'playerInfo',
    },
    // Get gamestate
    'gamestate-get', // Stores states in facts.gameStateDoc
    // Push player info to locations array
    {
      closure: 'push',
      key: 'gameStateDoc.locations',
      '^value': {
        '^name': 'playerInfo.name',
        '^location': 'message.data.locationNumber',
        score: 0,
        '^playerId': 'playerInfo._id',
        '^playerRfid': 'message.data.playerRfid',
      },
    },
    // Save game state in database
    {
      closure: 'mongodb-save',
      collection: conf.mongodb.collections.GameState,
      '^document': 'gameStateDoc',
    },
  ]),
  // Internal use closure only. Not intented for use outside this file
  closureGenerator(
    '_gamestate-apply-actions-add-score-to-state',
    async (facts: AppFacts, context: AppContext) => {
      let playerActionsMessage = facts.message;
      if (playerActionsMessage.type === 'playeractions') {
        let scoringPlayerRfid = playerActionsMessage.data.scoringPlayerRfid;
        let scoringPlayerLocationInfo = facts?.gameStateDoc?.locations?.find(
          (loc: any) => loc.playerRfid === scoringPlayerRfid
        );
        for (let action of playerActionsMessage?.data?.actions) {
          context.logger.trace('action', JSON.stringify(action, null, 2));
          if (action?.type === 'hits') {
            scoringPlayerLocationInfo.score += action.count;
          } else {
            context.logger.error(`Unknown action type: ${action?.type}`);
          }
        }
      }
      return facts;
    }
  ),
  closureGenerator('gamestate-apply-actions', [
    // Get gamestate
    'gamestate-get',
    '_gamestate-apply-actions-add-score-to-state',
    // Save game state in database
    {
      closure: 'mongodb-save',
      collection: conf.mongodb.collections.GameState,
      '^document': 'gameStateDoc',
    },
  ]),
  closureGenerator('gamestate-publish-message', [
    { closure: 'config-get', key: 'showmode', outputKey: 'showmode' },
    {
      when: { closure: 'equal', '^value1': 'showmode', value2: 'idle' },
      then: [
        {
          closure: 'publish-amqp-message',
          exchange: conf.amqp.mainExchange,
          routingKey: 'game.state.gamestate',
          type: 'gamestate',
          data: {
            gameStatus: 'idle',
          },
        },
      ],
    },
    {
      when: {
        closure: 'not',
        notClosure: 'equal',
        '^value1': 'showmode',
        value2: 'idle',
      },
      then: [
        'gamestate-get',
        {
          closure: 'publish-amqp-message',
          exchange: conf.amqp.mainExchange,
          routingKey: 'game.state.gamestate',
          type: 'gamestate',
          '^data': {
            '^gameId': 'gameStateDoc._id',
            '^gameStatus': 'gameStateDoc.gameStatus',
            '^gameStartTimestamp': 'gameStateDoc.gameStartTimestamp',
            '^gameLengthMs': 'gameStateDoc.gameLengthMs',
            '^locations': 'gameStateDoc.locations',
          },
        },
      ],
    },
  ]),
];
