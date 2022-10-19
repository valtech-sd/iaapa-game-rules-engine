import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
import { AppFacts, AppContext } from '../../types';
import conf from '../../conf';

export default [
  /**
   * gamestate-start
   * Change the gamestate for the game identified in the incoming message to run - Triggered by gamestart message
   * Do this by...
   * 1. Convert show control message timestamp
   * 2. Save to GameState mongodb collection with the following info...
   *     - gameStartTimestamp - game start timestamp - using epoch time
   *     - gameLengthMs - This comes from show control
   *     - gameStatus - Change to "run"
   */
  closureGenerator('gamestate-start', [
    // 1. Convert show control message timestamp
    {
      closure: 'convert-timestamp-to-epoch',
      key: 'message.data.gameStartTimestamp',
    },
    // 2. Save to GameState c mongodbollection with the following info...
    //     - gameStartTimestamp - game start timestamp - using epoch time
    //     - gameLengthMs - This comes from show control
    //     - gameStatus - Change to "run"
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
  /**
   * gamestate-end
   * Change game status to "end" - triggered by endgame message
   * Do this by...
   * 1. Update mongodb GameState document with gameStatus="run"
   */
  closureGenerator('gamestate-end', [
    // 1. Update mongodb GameState document with gameStatus="run"
    {
      closure: 'mongodb-save',
      collection: conf.mongodb.collections.GameState,
      '^document': {
        '^_id': 'message.data.gameId',
        gameStatus: 'end',
      },
    },
  ]),
  /**
   * gamestate-reset-game
   * Reset all GameState fields
   */
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
  /**
   * gamestate-get
   * Get GameState
   * @param facts.message.data.gameId = id of the game we want to fetch
   * @return facts - facts.gameStateDoc = the GameState for the identified game
   */
  closureGenerator('gamestate-get', [
    {
      closure: 'mongodb-get',
      collection: conf.mongodb.collections.GameState,
      '^_id': 'message.data.gameId',
      outputKey: 'gameStateDoc',
    },
  ]),
  /**
   * gamestate-add-player
   * Add player to the gamestate. Triggered by playercheckin message
   * Do this by...
   * 1. Get player from database
   * 2. Get gamestate
   * 3. Push player info to locations array in the gamestate document with info about this player and his location
   * 4. Save the modified game state
   * @param facts.message.data.gameId = id of the game we want to fetch
   * @return facts - facts.gameStateDoc = the GameState for the identified game
   */
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
  /**
   * _gamestate-apply-actions-add-score-to-state
   * Internal use closure only. Not intented for use outside this file
   * This adds scores to the game state located in facts.gameStateDoc
   * Do this by...
   * 1. Check to ensure we are handling a playeractions message else we return
   * 2. Get scoring players rfid
   * 3. get the scoring player state info in the game state document (Used to add score to this object)
   * 4. Loop over the actions in the player action message
   * 5. If the action type is "hits" whlie looping then add action.count to the scoring players score from
   **/
  closureGenerator(
    '_gamestate-apply-actions-add-score-to-state',
    async (facts: AppFacts, context: AppContext) => {
      let playerActionsMessage = facts.message;
      // 1. Check to ensure we are handling a playeractions message else we return
      if (playerActionsMessage.type === 'playeractions') {
        // 2. Get scoring players rfid
        let scoringPlayerRfid = playerActionsMessage.data.scoringPlayerRfid;
        // 3. get the scoring player state info in the game state document (Used to add score to this object)
        let scoringPlayerLocationInfo = facts?.gameStateDoc?.locations?.find(
          (loc: any) => loc.playerRfid === scoringPlayerRfid
        );
        // 4. Loop over the actions in the player action message
        for (let action of playerActionsMessage?.data?.actions) {
          context.logger.trace('action', JSON.stringify(action, null, 2));
          if (action?.type === 'hits') {
            // 5. If the action type is "hits" whlie looping then add action.count to the scoring players score from
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
