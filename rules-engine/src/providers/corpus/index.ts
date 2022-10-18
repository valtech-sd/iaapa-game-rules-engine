import { ICorpusRuleGroup } from 'rule-harvester';
import conf from '../..//conf';

export const ruleCorpus: ICorpusRuleGroup[] = [
  // Parse string content to JSON requets and move to facts.message
  {
    name: 'Normalize Requests',
    rules: ['transform-amqp-message', 'transform-udp-message'],
  },
  {
    name: 'Message Handler UDP Messages',
    rules: [
      {
        // Limit to udp requests with valid message header
        when: ['is-valid-message-header', 'is-udp-request'],
        then: [
          { closure: 'set', key: 'validation.messageValid', value: true },
          // Log Message Type
          {
            closure: 'log',
            level: 'info',
            '^args': ['Valid Message Header Received: ', '^message.type'],
          },
          // Handle GameMode Message
          {
            when: ['is-valid-gamemode-message'],
            then: [
              // If message gamemode = idle -> Switch to Idle mode a
              {
                when: 'is-gamemode-idle',
                then: ['gamemode-idle', 'publish-gamestate-message'],
              },
              // if message gamemode = run -> Switch to Run mode + publish gamestate message
              {
                when: 'is-gamemode-run',
                then: [
                  'gamemode-run',
                  'gamestate-reset-game',
                  'publish-gamestate-message',
                ],
              },
            ],
          },
          // Handle Game Reset Message
          {
            when: ['is-valid-gamereset-message'],
            then: ['gamestate-reset-game', 'publish-gamestate-message'],
          },
          // Handle Player Checkin message
          // TODO Create temporary player name if player does not exist
          {
            when: ['is-valid-playercheckin-message'],
            then: ['gamestate-add-player', 'publish-gamestate-message'],
          },
          // Handle Clear Slot Message
          {
            when: ['is-valid-clearslot-message'],
            then: [
              // TODO
              {
                closure: 'log',
                level: 'info',
                '^args': ['closure:get-player-info'],
              },
              {
                closure: 'log',
                level: 'info',
                '^args': ['closure:gamestate-remove-player'],
              },
              {
                closure: 'log',
                level: 'info',
                '^args': ['closure:send-gamestate-message'],
              },
            ],
          },
          // Handle Game Start Message
          {
            when: ['is-valid-gamestart-message'],
            then: ['gamestate-start', 'publish-gamestate-message'],
          },
          // Handle Player Actions
          {
            when: ['is-valid-playeractions-message'],
            then: [
              'gamestate-apply-actions',
              'gameactivity-insert-player-actions',
              'publish-gamestate-message',
            ],
          },
          // Handle End Game Message
          {
            when: ['is-valid-endgame-message'],
            then: [
              'gamestate-end',
              'publish-gamestate-message',
              // TODO
              {
                closure: 'log',
                level: 'info',
                '^args': ['closure:leaderboard-get-daily'],
              },
              {
                closure: 'log',
                level: 'info',
                '^args': ['closure:publish-leaderboard-daily'],
              },
            ],
          },
          // Handle Turn Start message
          {
            when: ['is-valid-turnstart-message'],
            then: [
              // Get player info from playerRfid
              {
                closure: 'players-get-from-rfid',
                '^playerRfid': 'message.data.playerRfid',
                outputKey: 'playerInfo',
              },
              // Publish turnstart message
              {
                closure: 'publish-amqp-message',
                type: 'turnstart',
                exchange: conf.amqp.mainExchange,
                '^data': {
                  '^gameId': 'message.data.gameId',
                  '^playerId': 'playerInfo._id',
                  '^turnNumber': 'message.data.turnNumber',
                  '^turnLengthMs': 'message.data.turnLengthMs',
                },
              },
            ],
          },
        ],
      },
      'logFacts',
    ],
  },
  {
    name: 'Message AMQP Config Messages',
    rules: [
      {
        // Limit to udp requests with valid message header
        when: ['is-valid-message-header', 'is-amqp-request'],
        then: [],
      },
    ],
  },
];

export default ruleCorpus;
