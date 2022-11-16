import { AppFacts, AppContext } from '../../types';
import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';
import conf from '../../conf';

export default [
  /**
   * config-get
   * Get config value from config collection
   * Do this by...
   * 1. Validate parameters
   * 2. Filter by key (key is the document _id)
   * 3. Set facts with configuration value
   *
   * @param parameters.key - key for the configuration
   * @param parameters.outputKey - location in facts where we want to store the fetched document
   * @return facts - facts[outputKey] = config value
   */
  closureGenerator(
    'config-get',
    async (facts: AppFacts, context: AppContext) => {
      context?.logger?.trace('START: closure:config-get', {
        key: context.parameters.key,
        outputKey: context.parameters.outputKey,
      });
      // 1. Validate parameters
      if (!context.parameters.key) {
        context.logger.error(
          'ERROR: closure:config-get: key parameter not passed in'
        );
        throw new Error('closure:config-get: key parameter not passed in');
      }

      // 2. Filter by key (key is the document _id)
      let document = await context.mongoDatabase
        .collection(conf.mongodb.collections.Config)
        .findOne({ _id: context.parameters.key });

      // 3. Set facts with configuration value
      _.set(facts, context.parameters.outputKey || 'config', document?.value);

      context?.logger?.trace('END: closure:config-get');
      return facts;
    }
  ),
  /**
   * config-save
   * Save configuration value
   * Do this by...
   * 1. Validate parameters
   * 2. Update configuration by calling mongodb updateOne function
   *
   * @param parameters.key - key for the configuration
   * @param parameters.value - Value to set
   * @param parameters.outputKey - location in facts where we want to store the fetched document
   * @return facts - facts[outputKey] = config value
   */
  closureGenerator(
    'config-save',
    async (facts: AppFacts, context: AppContext) => {
      context?.logger?.trace('START: closure:config-save', {
        key: context.parameters.key,
        value: context.parameters.value,
      });
      // 1. Validate parameters
      if (!context.parameters.key) {
        context.logger.error(
          'ERROR: closure:config-get: key parameter not passed in'
        );
        throw new Error('closure:config-get: key parameter not passed in');
      }

      // 2. Update configuration by calling mongodb updateOne function
      await context.mongoDatabase
        .collection(conf.mongodb.collections.Config)
        .updateOne(
          { _id: context.parameters.key },
          { $set: { value: context.parameters.value } },
          { upsert: true }
        );
      context?.logger?.trace('END: closure:config-save');
      return facts;
    }
  ),
];
