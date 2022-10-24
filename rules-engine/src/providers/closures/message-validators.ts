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
      return Validator.validateJson(
        context.parameters.data,
        context.parameters.schema
      );
    }
  ),
  /**
   * Is message header valid
   */
  closureGenerator('is-valid-message-header', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageHeader,
    },
  ]),
  /**
   * Is Valid Clear Slot Message
   */
  closureGenerator('is-valid-clearslot-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageClearSlot,
    },
  ]),
  /**
   * Is Valid Clear Slot Message
   */
  closureGenerator('is-valid-endgame-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageEndGame,
    },
  ]),
  /**
   * Is Valid Game Mode Message
   */
  closureGenerator('is-valid-gamemode-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageGameMode,
    },
  ]),
  /**
   * Is Valid Game Reset Message
   */
  closureGenerator('is-valid-gamereset-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageGameReset,
    },
  ]),
  /**
   * Is Valid Game Start Message
   */
  closureGenerator('is-valid-gamestart-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageGameStart,
    },
  ]),
  /**
   * Is Valid Player Action Message
   */
  closureGenerator('is-valid-playeractions-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessagePlayerActions,
    },
  ]),
  /**
   * Is Valid Player Checkin Message
   */
  closureGenerator('is-valid-playercheckin-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessagePlayerCheckin,
    },
  ]),
  /**
   * Is Valid Turn Start Message (From show control)
   */
  closureGenerator('is-valid-turnstart-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageTurnStartShowControl,
    },
  ]),
  /**
   * Is Valid ConfigSet message
   */
  closureGenerator('is-valid-configset-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageConfigSet,
    },
  ]),
  /**
   * Is Valid ConfigGet message
   */
  closureGenerator('is-valid-configget-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageConfigGet,
    },
  ]),
  /**
   * Is Valid GameStateGetLast message
   */
  closureGenerator('is-valid-gamestategetlast-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageGameStateGetLast,
    },
  ]),
  /**
   * Is Valid GameStateGetLast message
   */
  closureGenerator('is-valid-leaderboardget-message', [
    {
      closure: 'is-schema-valid',
      '^data': 'message',
      schema: MessageLeaderboardGet,
    },
  ]),
];

export default closures;
