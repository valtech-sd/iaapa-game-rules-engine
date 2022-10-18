import { IClosure, closureGenerator } from 'rule-harvester';
import { AppFacts, AppContext } from '../../types';
import _ from 'lodash';

const closures: IClosure[] = [
  /**
   * parmaeter
   * Pulls a parmeter into the facts object for use elsewhere
   *
   * @param context.parameters.parameterKey - field that is part of existing parameters to pull into the facts object
   * @param context.parameters.outputKey - Optional, Where to store parameter value in facts - Defaults to parameterKey
   * @param context.parameters.defaultValue - Optional default value if the parameter was undefined 

   * @return facts object with {[outputKey]: context.parameter[parameterKey]} merged into fact object
   */
  closureGenerator(
    'parameter',
    async (facts: AppFacts, context: AppContext) => {
      // Get value from parameters
      let value = _.get(context.parameters, context.parameters.parameterKey);
      // Default the value
      value = value === undefined ? context.parameters.defaultValue : value;
      // Set the value
      _.set(
        facts,
        context.parameters.outputKey || context.parameters.parameterKey,
        value
      );
      return facts;
    },
    { require: ['parameterKey', 'outputKey'] }
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
  /**
   * map
   * Map object or array of objects
   * Does this by...
   * 1. Create mapper lambda
   * 2. If array loop over array items calling mapper for each item
   * 3. If object call mapper for single item
   * 4. In mapper lambda map values to new item using mapDef
   * 5. Call mapFn closure that is passed into this closure ... passing item parameters as facts to parameter function
   * 6. Clear original item and replace with keys from new mapped item
   */
  closureGenerator(
    'map',
    async function (facts: AppFacts, context: AppContext) {
      let { key: path } = context.parameters;
      let input = _.get(facts, path) || [];
      // 1. Create mapper lambda
      let mapper = async (item: any) => {
        let newObj = {};
        if (context.parameters.mapDef) {
          // 4. In mapper lambda map values to new item using mapDef
          for (let field of Object.keys(context.parameters.mapDef || {})) {
            _.set(
              newObj,
              field,
              _.get(
                { item, $root: facts },
                (context.parameters.mapDef || {})[field]
              )
            );
          }
        }
        if (context.parameters.mapFn) {
          // 5. Call mapFn closure that is passed into this closure ... passing item parameters as facts to parameter function
          let { item: mappedItem } = await context.parameters.mapFn.process(
            { $root: facts, item: newObj, oldItem: item },
            context
          );
          newObj = mappedItem;
        }
        // 6. Clear original item and replace with keys from new mapped item
        for (const key in item) {
          delete item[key];
        }
        return newObj;
      };
      if (_.isArray(input)) {
        // 2. If array loop over array items calling mapper for each item
        let newInput = [];
        for (let item of input) {
          let obj = await mapper(item);
          if (obj) {
            newInput.push(obj);
          }
        }
        _.set(facts, path, newInput);
      } else if (_.isObject(input)) {
        // 3. If object call mapper for single item
        let obj = await mapper(input);
        _.set(facts, path, obj);
      }
      return facts;
    },
    { require: ['key'], closureParameters: ['mapFn'] }
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
  closureGenerator(
    'set-timestamp-epoch',
    (facts: AppFacts, context: AppContext) => {
      _.set(facts, context.parameters.key, Date.now());
      return facts;
    }
  ),
  closureGenerator(
    'convert-timestamp-to-epoch',
    (facts: AppFacts, context: AppContext) => {
      _.set(
        facts,
        context.parameters.key,
        new Date(_.get(facts, context.parameters.key)).getTime()
      );
      return facts;
    }
  ),
];

export default closures;
