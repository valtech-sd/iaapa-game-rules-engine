import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
import { AppFacts, AppContext } from '../../types';
import conf from '../../conf';

export default [
  closureGenerator(
    '_players-generate-name',
    async (facts: AppFacts, _context: AppContext) => {
      facts.generatedName = `Player_${Math.floor(Math.random() * 1000)}`;
      return facts;
    }
  ),
  closureGenerator('players-get-from-rfid', [
    {
      closure: 'parameter',
      parameterKey: 'playerRfid',
      outputKey: 'players-get-from-rfid.rfid',
      '^defaultValue': 'message.data.playerRfid',
    },
    {
      closure: 'mongodb-get',
      collection: conf.mongodb.collections.Players,
      '^filter': { '^rfid': 'players-get-from-rfid.rfid' },
      outputKey: 'players-get-from-rfid.playerInfo',
    },
    {
      when: {
        closure: 'all-fields-falsy',
        fields: ['players-get-from-rfid.playerInfo'],
      },
      then: [
        '_players-generate-name',
        {
          closure: 'mongodb-save',
          collection: conf.mongodb.collections.Players,
          '^document': {
            '^name': 'generatedName',
            '^rfid': 'players-get-from-rfid.rfid',
          },
        },
        {
          closure: 'mongodb-get',
          collection: conf.mongodb.collections.Players,
          '^filter': { '^rfid': 'players-get-from-rfid.rfid' },
          outputKey: 'players-get-from-rfid.playerInfo',
        },
      ],
    },
    {
      closure: 'set',
      key: 'playerInfo',
      '^value': 'players-get-from-rfid.playerInfo',
    },
  ]),
];
