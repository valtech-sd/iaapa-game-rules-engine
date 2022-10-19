import { IClosure, closureGenerator } from 'rule-harvester';
import { AppFacts, AppContext } from '../../types';
import _ from 'lodash';

const closures: IClosure[] = [
  /**
   * parmaeter
   * Pulls a parmeter into the facts object for use elsewhere
   *
   * @param context.parameters.parameterKey - field that is part of existing parameters to pull into the facts object
   * @param context.parameters.outputParameterTo - Optional, Where to store parameter value in facts - Defaults to parameterKey
   * @param context.parameters.defaultValue - Optional default value if the parameter was undefined 

   * @return facts object with {[outputParameterTo]: context.parameter[parameterKey]} merged into fact object
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
        context.parameters.outputParameterTo || context.parameters.parameterKey,
        value
      );
      return facts;
    },
    { require: ['parameterKey', 'outputParameterTo'] }
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
  /**
   * transform-amqp-message
   * Parse json data from amqp message into the facts.message location.
   * do nothing if amqpMessage does not exist
   */
  closureGenerator('transform-amqp-message', [
    {
      closure: 'parse-json',
      '^inputData': 'amqpMessage.amqpMessageContent',
      outputKey: 'message',
    },
  ]),
  /**
   * transform-udp-message
   * Parse json data from udp request into the facts.message location.
   * do nothing if udpRequest does not exist
   */
  closureGenerator('transform-udp-message', [
    {
      closure: 'parse-json',
      '^inputData': 'udpRequest.body',
      outputKey: 'message',
    },
  ]),
  /**
   * set-timestamp-epoch
   * Set the timestamp for now in a location in facts specified by the "key" parmaeter
   *
   * @param parameters.key - location in facts where we should put an epoch timestamp
   * @return facts - facts[parameters.key] = ms since epoch
   */
  closureGenerator(
    'set-timestamp-epoch',
    (facts: AppFacts, context: AppContext) => {
      _.set(facts, context.parameters.key, Date.now());
      return facts;
    }
  ),
  /**
   * convert-timestamp-to-epoch
   * Convert a string timestamp to epoch time
   *
   * @param parameters.key - location in facts where we should location the timestamp string
   * @return facts - facts[parameters.key] = ms since epoch for the timestamp that was a string formated time
   */
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
  /**
   * get-timestamp-range-of-today
   * Generate a timestamp range for the current day. {start: ms since epoch from start of the day, end: ms since epoch for the end of the current day}
   * Do this by...
   * 1. Get start timestamp for the very beginning of the day
   * 2. Set end timestamp for the very end of the day
   * 3. Set facts.timestampRange
   *
   * @return facts - facts.timestampRange = {start:number, end:number} - {start: "ms since epoch from start of the day", end: "ms since epoch for the end of the current day"}
   */
  closureGenerator('get-timestamp-range-of-today', (facts: AppFacts) => {
    // Get start timestamp for the very beginning of the day
    let start = new Date();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    // Set end timestamp for the very end of the day
    let end = new Date();
    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);
    end.setMilliseconds(999);
    // Set facts
    facts.timestampRange = { start: start.getTime(), end: end.getTime() };
    return facts;
  }),
];

export default closures;
