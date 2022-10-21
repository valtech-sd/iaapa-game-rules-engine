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
   * all-fields-falsy - Returns true if all parameter fields are falsy - null, undefeind, "", false
   * example {closure: 'all-fields-falsy', fields: ['something.name']} - If something.name is falsy
   * @param any number of params
   * @return boolean
   **/
  closureGenerator(
    'all-fields-falsy',
    (facts: any, context: any) => {
      let ret = true;
      for (let field of context.parameters.fields) {
        ret = !_.get(facts, field);
        if (!ret) break;
      }
      return ret;
    },
    { required: ['fields'] }
  ),
];

export default closures;
