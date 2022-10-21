export namespace messages {
  export interface MessageHeader {
    // Message type
    type: string;
    // Some sort of utc timestamp
    timestamp: string;
  }

  export interface MessageGeneric {
    // Message type
    type: string;
    // Some sort of utc timestamp
    timestamp: string;
    // Generic Data
    data: any;
  }

  export interface MessageGameMode extends MessageHeader {
    type: 'gamemode';
    data: {
      gameId: string;
      mode: string;
    };
  }

  export interface MessageGameStart extends MessageHeader {
    type: 'gamestart';
    data: {
      gameId: string;
      gameStartTimestamp: string;
      gameEndTimestamp?: string;
      gameLengthMs: number;
    };
  }

  export interface MessagePlayerActions extends MessageHeader {
    type: 'playeractions';
    data: {
      gameId: string;
      scoringPlayerRfid: string;
      turnNumber: number;
      turnLengthMs: number;
      actions: Array<{
        type: string;
        playerRfid: string;
        count: number;
      }>;
    };
  }

  export interface MessageEndGame extends MessageHeader {
    type: 'endgame';
    data: {
      gameId: string;
    };
  }

  export interface MessagePlayerCheckin extends MessageHeader {
    type: 'playercheckin';
    data: {
      gameId: string;
      playerRfid: string;
      locationNumber: number;
    };
  }

  export interface MessageGameReset extends MessageHeader {
    type: 'gamereset';
    data: {
      gameId: string;
    };
  }

  export interface MessageClearSlot extends MessageHeader {
    type: 'clearslot';
    data: {
      gameId: string;
      locationNumber: number;
    };
  }

  export interface MessageLeaderboard extends MessageHeader {
    type: 'leaderboard';
    data: {
      // Leaderboard type  - 'daily' would be the daily leaderboard type
      leaderboardType: string;
      leaderboard: Array<{
        rank: number;
        score: number;
        playerName: string;
        playerId: string;
      }>;
    };
  }

  export interface MessageGameState extends MessageHeader {
    type: 'gamestate';
    data: {
      gameId: string;
      gameStatus: string;
      gameStartTimestamp: string;
      locations: Array<{
        location: number;
        score: number;
        layerName: number;
        playerId: number;
      }>;
    };
  }

  export interface MessageTurnStartRulesEngine extends MessageHeader {
    type: 'turnstart';
    data: {
      gameId: string;
      playerRfid: string;
      turnNumber: number;
      turnLengthMs: number;
    };
  }

  export interface MessageTurnStartShowControl extends MessageHeader {
    type: 'turnstart';
    data: {
      gameId: string;
      playerRfid: string;
      turnNumber: number;
      turnLengthMs: number;
    };
  }

  export type MessageAllTypeUnion =
    | MessageGameState
    | MessageLeaderboard
    | MessageClearSlot
    | MessagePlayerActions
    | MessagePlayerCheckin
    | MessageGameReset
    | MessageGameStart
    | MessageEndGame
    | MessageTurnStartShowControl
    | MessageTurnStartRulesEngine
    | MessageGameMode;
}
