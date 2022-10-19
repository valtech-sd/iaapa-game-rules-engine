import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
import { AppFacts, AppContext } from '../../types';
import conf from '../../conf';

export default [
  /**
   * _players-generate-name
   * Generate a random playername
   * Do this by...
   * 1. Generate a random number between 0 and 999
   * 2. Concatinate the string to "Player_"
   * 3. Set facts.generateName = concatinated string
   *
   * @return facts - facts.generateName in the format Player_XXX where XXX is a number between 0 and 999 inclusive
   */
  closureGenerator(
    '_players-generate-name',
    async (facts: AppFacts, _context: AppContext) => {
      // 1. Generate a random number between 0 and 999
      // 2. Concatinate the string to "Player_"
      // 3. Set facts.generateName = concatinated string
      facts.generatedName = `Player_${Math.floor(Math.random() * 1000)}`;
      return facts;
    }
  ),
  /**
   * players-get-from-rfid
   * Get player information from the players collection
   * Do this by...
   * 1. Pull passed in playerRfid parameter into the facts object
   * 2. Pull passed in outputKey parameter into the facts object
   * 3. Get player from players collection by rfid
   * 4. If player info was not found then ...
   *    4.1. generate a player name
   *    4.2. Save the generated player to the mongodb collection
   *    4.3. Get player info from collection
   * 5. Save player info into facts[outputKey]
   *
   * @return facts
   */
  closureGenerator('players-get-from-rfid', [
    // 1. Pull passed in playerRfid parameter into the facts object
    {
      closure: 'parameter',
      parameterKey: 'playerRfid',
      outputParameterTo: 'players-get-from-rfid.rfid',
      '^defaultValue': 'message.data.playerRfid',
    },
    // 2. Pull passed in outputKey parameter into the facts object
    {
      closure: 'parameter',
      parameterKey: 'outputKey',
      outputParameterTo: 'players-get-from-rfid.outputKey',
      defaultValue: 'playerInfo',
    },
    // 3. Get player from players collection by rfid
    {
      closure: 'mongodb-get',
      collection: conf.mongodb.collections.Players,
      '^filter': { '^rfid': 'players-get-from-rfid.rfid' },
      outputKey: 'players-get-from-rfid.playerInfo',
    },
    // 4. If player info was not found then ...
    {
      when: {
        closure: 'all-fields-falsy',
        fields: ['players-get-from-rfid.playerInfo'],
      },
      then: [
        //    4.1. generate a player name
        '_players-generate-name',
        //    4.2. Save the generated player to the mongodb collection
        {
          closure: 'mongodb-save',
          collection: conf.mongodb.collections.Players,
          '^document': {
            '^name': 'generatedName',
            '^rfid': 'players-get-from-rfid.rfid',
          },
        },
        //    4.3. Get player info from collection
        {
          closure: 'mongodb-get',
          collection: conf.mongodb.collections.Players,
          '^filter': { '^rfid': 'players-get-from-rfid.rfid' },
          outputKey: 'players-get-from-rfid.playerInfo',
        },
      ],
    },
    // 5. Save player info into facts[outputKey]
    {
      closure: 'set',
      '^key': 'players-get-from-rfid.outputKey',
      '^value': 'players-get-from-rfid.playerInfo',
    },
  ]),
];
