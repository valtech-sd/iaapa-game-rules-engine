import { ICorpusRuleGroup } from 'rule-harvester';

export const ruleCorpus: ICorpusRuleGroup[] = [
  {
    name: 'AMQP Input Transformer',
    rules: ['logFacts'],
  },
  {
    name: 'UDP Input Transformer',
    rules: ['logFacts'],
  },
  {
    name: 'Message Handler',
    rules: ['logFacts'],
  },
];

export default ruleCorpus;
