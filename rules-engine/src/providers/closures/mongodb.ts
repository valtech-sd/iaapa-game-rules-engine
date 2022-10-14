import { AppFacts, AppContext } from '../../types';
import { closureGenerator } from 'rule-harvester';
import { v4 as uuidv4 } from 'uuid';
import { Filter } from 'mongodb';
import _ from 'lodash';

export default [
  closureGenerator(
    'mongodb-get',
    async (facts: AppFacts, context: AppContext) => {
      context.logger.trace(context.parameters);
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
      let filter: Filter<any> = context.parameters._id
        ? { _id: context.parameters._id }
        : context.parameters.filter;
      let document = await context.mongoDatabase
        .collection(context.parameters.collection)
        .findOne(filter);

      _.set(facts, context.parameters.outputKey || 'document', document);

      return facts;
    }
  ),
  closureGenerator(
    'mongodb-save',
    async (facts: AppFacts, context: AppContext) => {
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
      if (!doc._id) doc._id = uuidv4();
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
      return facts;
    }
  ),
];