import { AppFacts, AppContext } from '../../types';
import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
import conf from '../../conf';

export default [
  closureGenerator(
    'config-get',
    async (facts: AppFacts, context: AppContext) => {
      context?.logger?.trace('START: closure:config-get');
      if (!context.parameters.key) {
        context.logger.error(
          'ERROR: closure:config-get: key parameter not passed in'
        );
        throw new Error('closure:config-get: key parameter not passed in');
      }
      // Set showmode config
      let document = await context.mongoDatabase
        .collection(conf.mongodb.collections.Config)
        .findOne({ _id: context.parameters.key });

      _.set(facts, context.parameters.outputKey || 'config', document?.value);

      context?.logger?.trace('END: closure:config-get');
      return facts;
    }
  ),
  closureGenerator(
    'config-save',
    async (facts: AppFacts, context: AppContext) => {
      context?.logger?.trace('START: closure:config-save');
      if (!context.parameters.key) {
        context.logger.error(
          'ERROR: closure:config-get: key parameter not passed in'
        );
        throw new Error('closure:config-get: key parameter not passed in');
      }
      // Set showmode config
      await context.mongoDatabase
        .collection(conf.mongodb.collections.Config)
        .updateOne(
          { _id: context.parameters.key },
          { $set: { value: context.parameters.value } }
        );
      context?.logger?.trace('END: closure:config-save');
      return facts;
    }
  ),
];
