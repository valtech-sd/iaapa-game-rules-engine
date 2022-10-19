import { AppFacts, AppContext } from '../../types';
import { closureGenerator } from 'rule-harvester';
import { v4 as uuidv4 } from 'uuid';
import { Filter } from 'mongodb';
import _ from 'lodash';

export default [
  /**
   * mongodb-get
   * Get mongodb document from collection
   * Do this by...
   * 1. Validate parameters
   * 2. Create filter
   * 3. Find document
   * 4. Set document in facts object
   *
   * @param parameters.collection - The collection we want to fetch the document from
   * @param parameters._id - ID of the document we want to fetch
   * @param parameters.filter - Generic filter to use to get a document
   * @param parameters.outputKey - location in facts where we want to store the fetched document
   * @return facts - facts[outputKey] = document
   */
  closureGenerator(
    'mongodb-get',
    async (facts: AppFacts, context: AppContext) => {
      context.logger.trace('START: closure:mongodb-get');
      // 1. Validate parameters
      if (!context.parameters._id && !context.parameters.filter) {
        context.logger.error(
          'ERROR: closure:mongodb-get: _id or filter parameter not passed in'
        );
        throw new Error(
          'closure:mongodb-get: _id or filter parameter not passed in'
        );
      }
      if (!context.parameters.collection) {
        context.logger.error(
          'ERROR: closure:mongodb-get: Collection not passed into closure'
        );
        throw new Error(
          'closure:mongodb-get: Collection not passed into closure'
        );
      }
      // 2. Create filter
      let filter: Filter<any> = context.parameters._id
        ? { _id: context.parameters._id }
        : context.parameters.filter;

      context.logger.trace('QUERY: closure:mongodb-get', { findOne: filter });

      // 3. Find document
      let document = await context.mongoDatabase
        .collection(context.parameters.collection)
        .findOne(filter);

      // 4. Set document in facts object
      _.set(facts, context.parameters.outputKey || 'document', document);

      context.logger.trace('END: closure:mongodb-get');

      return facts;
    }
  ),
  /**
   * mongodb-save
   * Save mongodb document in collection using findOneAndUpdate
   *  If we have an _id then we update that document
   *  if we do not have an _id then we create an id that will be set on the inserted document
   * Do this by...
   * 1. Validate parameters
   * 2. Generate _id if not already set on document
   * 3. Upsert document using findOneAndUpdate
   *
   * @param parameters.collection - The collection we want to fetch the document from
   * @param parameters.document - Document we want to save
   */
  closureGenerator(
    'mongodb-save',
    async (facts: AppFacts, context: AppContext) => {
      context.logger.trace('START: closure:mongodb-save');
      // 1. Validate parameters
      let doc = context.parameters.document;
      if (!doc) {
        context.logger.error(
          'ERROR: closure:mongodb-save: Document not passed into closure to save'
        );
        throw new Error(
          'closure:mongodb-save: Document not passed into closure to save'
        );
      }
      if (!context.parameters.collection) {
        context.logger.error(
          'ERROR: closure:mongodb-save: Collection not passed into closure'
        );
        throw new Error(
          'closure:mongodb-save: Collection not passed into closure'
        );
      }
      // 2. Generate _id if not already set on document
      if (!doc._id) doc._id = uuidv4();
      // 3. Upsert document using findOneAndUpdate
      await context.mongoDatabase
        .collection(context.parameters.collection)
        .findOneAndUpdate(
          { _id: doc._id },
          {
            $set: _.omit(doc, '_id'),
          },
          {
            upsert: true,
          }
        );
      context.logger.trace('END: closure:mongodb-save');
      return facts;
    }
  ),
  /**
   * mongodb-aggregate
   * Run mongodb aggregate pipeline
   * Do this by...
   * 1. Validate parameters
   * 2. Run aggregate function
   * 3. Set documents in facts object
   *
   * @param parameters.collection - The collection we want to fetch the document from
   * @param parameters.pipeline
   * @param parameters.outputKey - location in facts where we want to store the fetched document
   * @return facts - facts[outputKey] = documents
   */
  closureGenerator(
    'mongodb-aggregate',
    async (facts: AppFacts, context: AppContext) => {
      context.logger.trace('START: closure:mongodb-aggregate');
      // 1. Validate parameters
      if (!context.parameters.pipeline) {
        context.logger.error(
          'ERROR: closure:mongodb-aggregate: _id or filter parameter not passed in'
        );
        throw new Error(
          'closure:mongodb-aggregate: _id or filter parameter not passed in'
        );
      }
      if (!context.parameters.collection) {
        context.logger.error(
          'ERROR: closure:mongodb-aggregate: Collection not passed into closure'
        );
        throw new Error(
          'closure:mongodb-aggregate: Collection not passed into closure'
        );
      }

      // 2. Run aggregate function
      let documents = await context.mongoDatabase
        .collection(context.parameters.collection)
        .aggregate(context.parameters.pipeline)
        .toArray();

      // 3. Set documents in facts object
      _.set(facts, context.parameters.outputKey || 'aggregate', documents);

      context.logger.trace('END: closure:mongodb-aggregate');

      return facts;
    }
  ),
];
