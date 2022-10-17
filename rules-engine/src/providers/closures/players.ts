import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
import conf from '../../conf';

export default [
  closureGenerator('players-get-from-rfid', [
    {
      closure: 'parameter',
      parameterKey: 'playerRfid',
      outputKey: 'players-get-from-rfid.rfid',
    },
    {
      closure: 'parameter',
      parameterKey: 'outputKey',
      outputKey: 'players-get-from-rfid.outputKey',
    },
    {
      closure: 'mongodb-get',
      collection: conf.mongodb.collections.Players,
      '^filter': { '^rfid': 'players-get-from-rfid.rfid' },
      '^outputKey': 'players-get-from-rfid.outputKey',
    },
  ]),
];
