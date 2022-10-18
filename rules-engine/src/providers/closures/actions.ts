import { AppFacts, AppContext } from '../../types';
import { closureGenerator, ICoreAmqpPublishAction } from 'rule-harvester';
import { v4 as uuidv4 } from 'uuid';
// import conf from '../../conf';

export default [
  closureGenerator('logFacts', (facts: AppFacts, context: AppContext) => {
    context.logger.info(facts);
    return facts;
  }),
  /**
   * log
   * Generic log message that is more flexible then the other log messages
   */
  closureGenerator(
    'log',
    function (facts: any, context: any) {
      context.logger[context.parameters.level || 'info'](
        ...context.parameters.args
      );
      return facts;
    },
    {}
  ),
  /*
   * Publish message to amqp message bus
   * Message format should be something like the following
   * interface IAmqpMessage {
   *   type: string;
   *   timestamp: number;// (UTC ms since unix epoch)
   *   data: any; // JSON object containing message type specific info
   * }
   *
   * Example for publishing to the identity service might be something like the following:
   *  {
   *    closure: 'publish-amqp-message',
   *    exchange: 'identity-exchange',
   *    routingKey: 'okta.profile.update',
   *    '^data': {
   *      '^oktaId': 'request.body.data.context.user.id',
   *      '^profile': {
   *        '^platformUserId': 'user.id',
   *      },
   *    },
   *  },
   *
   * @param parameters.exchange
   * @param parameters.routingKey
   * @param parameters.type - Message type
   * @param parameters.data - Data section of message
   */
  closureGenerator(
    'publish-amqp-message',
    async function (facts: AppFacts, context: AppContext) {
      let messageId = uuidv4();
      let amqpPublishAction: ICoreAmqpPublishAction = {
        amqpPublishExchange: context?.parameters?.exchange,
        amqpMessageContent: JSON.stringify({
          type: context?.parameters?.type,
          messageId,
          timestamp: Date.now(),
          data: context?.parameters?.data,
        }),
        amqpPublishRoutingKey: context?.parameters?.routingKey,
      };
      facts.amqpPublishAction ||= [];
      facts.amqpPublishAction.push(amqpPublishAction);
      return facts;
    },
    {}
  ),
  /*
   * Suppress amqp output provider error on blank message
   */
  closureGenerator(
    'amqp-output-supress-no-message-error',
    async function (facts: AppFacts, _context: AppContext) {
      facts.amqpPublishAction ||= [];
      return facts;
    },
    {}
  ),
];
