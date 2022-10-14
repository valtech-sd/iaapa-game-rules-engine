import { IClosure, closureGenerator } from 'rule-harvester';
// import { AppFacts, AppContext } from '../../types';
import _ from 'lodash';

const closures: IClosure[] = [
  /**
   * Is udp message
   */
  closureGenerator('is-udp-request', [
    {
      closure: 'allFieldsDefined',
      fields: ['udpRequest'],
    },
  ]),
  /**
   * Is amqp request
   */
  closureGenerator('is-amqp-request', [
    {
      closure: 'allFieldsDefined',
      fields: ['udpRequest'],
    },
  ]),
  /**
   * Is The idle message gamemode idle
   */
  closureGenerator('is-gamemode-idle', [
    {
      closure: 'equal',
      '^value1': 'message.data.mode',
      value2: 'idle',
    },
  ]),
  /**
   * Is The idle message gamemode run
   */
  closureGenerator('is-gamemode-run', [
    {
      closure: 'equal',
      '^value1': 'message.data.mode',
      value2: 'run',
    },
  ]),
];

export default closures;
