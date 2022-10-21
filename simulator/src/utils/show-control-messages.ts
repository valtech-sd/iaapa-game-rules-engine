// @ts-ignore Ignore check that this is not in the root directory
import { messages } from '../../../rules-engine/src/types/messages';

export namespace generators {
  export interface IGenerateContext {
    gameId: string;
  }
  export function generateGameModeMessage(
    data: messages.MessageGameMode['data']
  ): messages.MessageGameMode {
    return {
      type: 'gamemode',
      timestamp: new Date().toISOString(),
      data: data,
    };
  }

  export function generatePlayerCheckinMessage(
    data: messages.MessagePlayerCheckin['data']
  ): messages.MessagePlayerCheckin {
    return {
      type: 'playercheckin',
      timestamp: new Date().toISOString(),
      data: data,
    };
  }

  export function generateGameStartMessage(
    data: messages.MessageGameStart['data']
  ): messages.MessageGameStart {
    return {
      type: 'gamestart',
      timestamp: new Date().toISOString(),
      data: data,
    };
  }

  export function generatePlayerActionsMessage(
    data: messages.MessagePlayerActions['data']
  ): messages.MessagePlayerActions {
    return {
      type: 'playeractions',
      timestamp: new Date().toISOString(),
      data: data,
    };
  }

  export function generateTurnStartMessageShowControl(
    data: messages.MessageTurnStartShowControl['data']
  ): messages.MessageTurnStartShowControl {
    return {
      type: 'turnstart',
      timestamp: new Date().toISOString(),
      data: data,
    };
  }
}
