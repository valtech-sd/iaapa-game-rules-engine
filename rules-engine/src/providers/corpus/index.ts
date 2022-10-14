import { ICorpusRuleGroup } from 'rule-harvester';

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
          {
            when: ['is-valid-playercheckin-message'],
            then: [
              {
                closure: 'players-get-from-rfid',
                '^playerRfid': 'message.data.playerRfid',
                outputKey: 'playerInfo',
              },
              'gamestate-add-player',
              'publish-gamestate-message',
            ],
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
              // TODO
              {
                closure: 'log',
                level: 'info',
                '^args': ['closure:gamestate-apply-actions'],
              },
              {
                closure: 'log',
                level: 'info',
                '^args': ['closure:gameactivity-insert-player-actions'],
              },
              {
                closure: 'log',
                level: 'info',
                '^args': ['closure:send-gamestate-message'],
              },
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
        ],
      },
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
