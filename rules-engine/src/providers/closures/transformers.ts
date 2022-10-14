import { IClosure, closureGenerator } from 'rule-harvester';
import { AppFacts, AppContext } from '../../types';
import _ from 'lodash';

const closures: IClosure[] = [
  /**
   * parmaeter
   * Pulls a parmeter into the facts object for use elsewhere
   *
   * @param context.parameters.parameterKey - 
   * @param context.parameters.outputKey - Where to store parameter value in facts - Defaults to parameterKey

   * @return facts object with {[outputKey]: context.parameter[parameterKey]} merged into fact object
   */
  closureGenerator(
    'parameter',
    async (facts: AppFacts, context: AppContext) => {
      _.set(
        facts,
        context.parameters.outputKey || context.parameters.parameterKey,
        _.get(context.parameters, context.parameters.parameterKey)
      );
      return facts;
    }
  ),
  /**
   * parse-json
   * Parse JSON from a string to an object
   * Do this by
   * 1. Return immediatly if inputData is not defined (No parsing will be done)
   * 2. Throw error if closure parameters outputKey is not defined
   * 3. Parse JSON
   * 4. Store parsed json in facts object using the outputKey
   * 5. If there ws an error re-throw it
   *
   * @param context.parameters.inputData - Input data
   * @param context.parameters.outputKey - Key for where the resulting parsed json should be stored
   * @return facts object with {[outputKey]: parsed json} merged into fact object
   */
  closureGenerator(
    'parse-json',
    async (facts: AppFacts, context: AppContext) => {
      // 1. Return immediatly if inputData is not defined (No parsing will be done)
      if (!context.parameters.inputData) {
        return facts;
      }
      // 2. Throw error if closure parameters outputKey is not defined
      if (!context.parameters.outputKey) {
        throw new Error(
          'parse-json: Invalid closure parameters: inputData or outputKey is not defined'
        );
      }
      try {
        // 3. Parse JSON
        const messageContent = JSON.parse(context.parameters.inputData);
        // 4. Store parsed json in facts object using the outputKey
        facts = _.merge(facts, {
          [context.parameters.outputKey]: messageContent,
        });
      } catch (e) {
        context.logger?.error('ERROR: parse-json', e);
        // 5. If there ws an error re-throw it
        throw e;
      }
      return facts;
    }
  ),
  closureGenerator('transform-amqp-message', [
    {
      closure: 'parse-json',
      '^inputData': 'amqpMessage.amqpMessageContent',
      outputKey: 'message',
    },
  ]),
  closureGenerator('transform-udp-message', [
    {
      closure: 'parse-json',
      '^inputData': 'udpRequest.body',
      outputKey: 'message',
    },
  ]),
];

export default closures;
