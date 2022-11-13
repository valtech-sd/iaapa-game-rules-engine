import { AppFacts, AppContext } from '../../types';
import { closureGenerator, ICoreAmqpPublishAction } from 'rule-harvester';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs';
import path from 'path';
import conf from '../../conf';

let debugMessageCounter = 0;

export default [
  closureGenerator('logFacts', (facts: AppFacts, context: AppContext) => {
    context.logger.info('Facts', facts);
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
  /*
   * debug-message-to-file
   * Log debug message to a file (Used when we recieve udp or amqp messages)
   * Do this by...
   * 1. If debug log file is enabled in configuration then do the rest of the stuff
   * 2. Get context parameters (message and filePrefix)
   * 3. Calculated padded string from an incrementing counter;
   * 4. Set fileName string by combining passed in filePrefix + padded counter+ timestamp + message type
   * 5. write file
   */
  closureGenerator(
    'debug-message-to-file',
    async function (facts: AppFacts, context: AppContext) {
      // 1. If debug log file is enabled in configuration then do the rest of the stuff
      if (conf.logger.enableDebugFileLog) {
        // 2. Get context parameters (message and filePrefix)
        const message = context.parameters.message;
        const filePrefix = context.parameters.filePrefix;
        // 3. Calculated padded string from an incrementing counter;
        const paddedCounter = `${debugMessageCounter++}`.padStart(5, '0');
        // 4. Set fileName string by combining passed in filePrefix + padded counter+ timestamp + message type
        const fileName = `${path.resolve(
          __dirname
        )}/../../../../message_logs/${filePrefix}-Tm-${
          message.timestamp
        }-RxCnt-${paddedCounter}-${message.type}.json`;

        context.logger.info(`START: Writing file: ${fileName}`);
        // 5. write file
        writeFile(fileName, JSON.stringify(message, null, 2), (err) => {
          if (err) {
            context.logger.error(`ERROR: Writing file: ${fileName}`, err);
          }
          context.logger.info(`SUCCESS: Writing file: ${fileName}`);
        });
      }
      return facts;
    },
    {}
  ),
];
