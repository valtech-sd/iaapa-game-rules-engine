import { closureGenerator } from 'rule-harvester';

export default [
  closureGenerator('logFacts', (facts: any, context: any) => {
    context.logger.info(facts);
    return facts;
  }),
];
