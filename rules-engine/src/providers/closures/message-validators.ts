import { IClosure, closureGenerator } from 'rule-harvester';
import { AppFacts, AppContext } from '../../types';
import _ from 'lodash';
import { Validator } from '../../utils/validator';
import MessageClearSlot from '../../schema/messages/MessageClearSlot.json';
import MessageEndGame from '../../schema/messages/MessageEndGame.json';
import MessageGameMode from '../../schema/messages/MessageGameMode.json';
import MessageGameReset from '../../schema/messages/MessageGameReset.json';
import MessageGameStart from '../../schema/messages/MessageGameStart.json';
import MessageHeader from '../../schema/messages/MessageHeader.json';
import MessagePlayerActions from '../../schema/messages/MessagePlayerActions.json';
import MessagePlayerCheckin from '../../schema/messages/MessagePlayerCheckin.json';
import MessageTurnStartShowControl from '../../schema/messages/MessageTurnStartShowControl.json';
import MessageConfigSet from '../../schema/messages/MessageConfigSet.json';
import MessageConfigGet from '../../schema/messages/MessageConfigGet.json';
import MessageLeaderboardGet from '../../schema/messages/MessageLeaderboardGet.json';
import MessageGameStateGetLast from '../../schema/messages/MessageGameStateGetLast.json';

const closures: IClosure[] = [
  /**
   * is-schema-valid
   * Do this by
   * 1. Call validator function
   *
   * @param context.parameters.data: String -  data to validate
   * @param context.parameters.schema: String -  JSON Schema
   * @return true / valse
   */
  closureGenerator(
    'is-schema-valid',
    async (_facts: AppFacts, context: AppContext) => {
      // 1. Call validator function
      let valid = Validator.validateJson(
        context.parameters.data,
        context.parameters.schema,
        context
      );
      context?.logger.debug(
        `is-schema-valid - valid:${valid} - type: ${context.parameters.validationTags.type}`
      );
      return valid;
    }
  ),
  /**
   *
   */
  closureGenerator('set-validation-tracking-facts', [
    { closure: 'set', key: 'validation.headerValid', value: false },
    { closure: 'set', key: 'validation.typeValid', value: false },
    { closure: 'set', key: 'validation.type', value: null },
    { closure: 'set', key: 'validation.schemaValid', value: false },
  ]),
  /**
   * is-message-valid
   * Do this by
   * 1. Call validator function
   *
   * @param context.parameters.type: String   -  Message type string
   * @param context.parameters.schema: String -  JSON Schema
   * @param facts.message: object             - Contains message that will be validated
   * @return true / valse
   */
  closureGenerator('is-message-valid', [
    // Pull parameter into facts object so we can act on it
    {
      closure: 'parameter',
      parameterKey: 'type',
      outputParameterTo: 'isMessageValid.type',
    },

    // When we have already found a valid message type we will just shortcut this and return false
    {
      when: {
        closure: 'equal',
        '^value1': 'validation.typeValid',
        value2: true,
      },
      then: [
        {
          closure: 'log',
          level: 'debug',
          '^args': [
            'is-message-valid: ',
            '^isMessageValid.type',
            '- Skipping because we already found a valid message type',
          ],
        },
        { closure: 'not', notClosure: 'always' },
      ], // Return false
    },

    // When we have not already found a valid message type
    {
      when: {
        closure: 'equal',
        '^value1': 'validation.typeValid',
        value2: false,
      },
      then: [
        {
          when: {
            closure: 'equal',
            '^value1': 'isMessageValid.type',
            '^value2': 'message.type',
          },
          then: [
            {
              closure: 'log',
              level: 'debug',
              '^args': [
                'is-message-valid: Type match',
                '^message.type',
                '===',
                '^isMessageValid.type',
              ],
            },
            { closure: 'set', key: 'validation.typeValid', value: true },
            {
              closure: 'set',
              key: 'validation.type',
              '^value': 'isMessageValid.type',
            },
            {
              when: {
                closure: 'is-schema-valid',
                '^data': 'message',
                '^validationTags': { '^type': 'isMessageValid.type' },
                // context.parameters.schema is passed through implicitly
              },
              then: [
                {
                  closure: 'log',
                  level: 'debug',
                  '^args': [
                    'is-message-valid: ',
                    '^isMessageValid.type',
                    '- Valid message schema',
                  ],
                },
                {
                  closure: 'set',
                  key: 'validation.validSchema',
                  value: true,
                },
                {
                  closure: 'set',
                  key: 'validation.validType',
                  '^value': 'validation.type',
                },

                'always',
              ],
            },
          ],
        },
        // Message Type Not Found
        {
          when: {
            closure: 'not',
            notClosure: 'equal',
            '^value1': 'validation.type',
            '^value2': 'message.type',
          },
          then: [
            {
              closure: 'log',
              level: 'debug',
              '^args': [
                'is-message-valid: Type mismatch',
                '^message.type',
                '!==',
                '^isMessageValid.type',
              ],
            },
            { closure: 'not', notClosure: 'always' },
          ], // Return false
        },
      ],
    },
  ]),
  /**
   * Is message header valid
   */
  closureGenerator('is-valid-message-header', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageHeader,
      validationTags: {
        type: 'MessageHeader',
      },
    },
  ]),
  /**
   * Is Valid Clear Slot Message
   */
  closureGenerator('is-valid-clearslot-message', [
    {
      closure: 'is-message-valid',
      type: 'clearslot',
      schema: MessageClearSlot,
    },
  ]),
  /**
   * Is Valid Clear Slot Message
   */
  closureGenerator('is-valid-endgame-message', [
    {
      closure: 'is-message-valid',
      type: 'endgame',
      schema: MessageEndGame,
    },
  ]),
  /**
   * Is Valid Game Mode Message
   */
  closureGenerator('is-valid-gamemode-message', [
    {
      closure: 'is-message-valid',
      type: 'gamemode',
      schema: MessageGameMode,
    },
  ]),
  /**
   * Is Valid Game Reset Message
   */
  closureGenerator('is-valid-gamereset-message', [
    {
      closure: 'is-message-valid',
      type: 'gamereset',
      schema: MessageGameReset,
    },
  ]),
  /**
   * Is Valid Game Start Message
   */
  closureGenerator('is-valid-gamestart-message', [
    {
      closure: 'is-message-valid',
      type: 'gamestart',
      schema: MessageGameStart,
    },
  ]),
  /**
   * Is Valid Player Action Message
   */
  closureGenerator('is-valid-playeractions-message', [
    {
      closure: 'is-message-valid',
      type: 'playeractions',
      schema: MessagePlayerActions,
    },
  ]),
  /**
   * Is Valid Player Checkin Message
   */
  closureGenerator('is-valid-playercheckin-message', [
    {
      closure: 'is-message-valid',
      type: 'playercheckin',
      schema: MessagePlayerCheckin,
    },
  ]),
  /**
   * Is Valid Turn Start Message (From show control)
   */
  closureGenerator('is-valid-turnstart-message', [
    {
      closure: 'is-message-valid',
      type: 'turnstart',
      schema: MessageTurnStartShowControl,
    },
  ]),
  /**
   * Is Valid ConfigSet message
   */
  closureGenerator('is-valid-configset-message', [
    {
      closure: 'is-message-valid',
      type: 'configset',
      schema: MessageConfigSet,
    },
  ]),
  /**
   * Is Valid ConfigGet message
   */
  closureGenerator('is-valid-configget-message', [
    {
      closure: 'is-message-valid',
      type: 'configget',
      schema: MessageConfigGet,
    },
  ]),
  /**
   * Is Valid GameStateGetLast message
   */
  closureGenerator('is-valid-gamestategetlast-message', [
    {
      closure: 'is-message-valid',
      type: 'gamestategetlast',
      schema: MessageGameStateGetLast,
    },
  ]),
  /**
   * Is Valid GameStateGetLast message
   */
  closureGenerator('is-valid-leaderboardget-message', [
    {
      closure: 'is-message-valid',
      type: 'leaderboardget',
      schema: MessageLeaderboardGet,
    },
  ]),
];

export default closures;
