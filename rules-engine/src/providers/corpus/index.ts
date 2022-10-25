import { ICorpusRuleGroup } from 'rule-harvester';
import conf from '../..//conf';

export const ruleCorpus: ICorpusRuleGroup[] = [
  // Parse string content to JSON requets and move to facts.message
  {
    name: 'Normalize Requests',
    rules: [
      'transform-amqp-message',
      'transform-udp-message',
      'amqp-output-supress-no-message-error',
    ],
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
                when: 'is-message-gamemode-idle',
                then: ['gamemode-idle', 'gamestate-publish-message'],
              },
              // if message gamemode = load -> Switch to Run mode + publish gamestate message
              {
                when: 'is-message-gamemode-load',
                then: [
                  'gamemode-load',
                  'gamestate-reset-game',
                  'gamestate-publish-message',
                ],
              },
              // if message gamemode = run
              {
                when: 'is-message-gamemode-run',
                then: [
                  'gamemode-run',
                  'gamestate-start',
                  'gamestate-publish-message',
                ],
              },
              // if message gamemode = end -> End game / Get and publish leaderboard / Publish gamestate message
              {
                when: 'is-message-gamemode-end',
                then: [
                  'gamemode-end',
                  'gamestate-end', // Change game status to "end"
                  'gameactivity-get-daily-leaderboard', // Generate daily leaderboard
                  'gameactivity-publish-daily-leaderboard', // Publish daily leaderboard message
                  'gamestate-publish-message', // Publish game status message
                ],
              },
            ],
          },
          // Handle Game Reset Message
          // {
          //   when: ['is-valid-gamereset-message'],
          //   then: ['gamestate-reset-game', 'gamestate-publish-message'],
          // },
          // Handle Player Checkin message
          // TODO Create temporary player name if player does not exist
          {
            when: ['is-valid-playercheckin-message'],
            then: ['gamestate-add-player', 'gamestate-publish-message'],
          },
          // Depricated: Handle Clear Slot Message
          // {
          //   when: ['is-valid-clearslot-message'],
          //   then: [
          //     // TODO
          //     {
          //       closure: 'log',
          //       level: 'info',
          //       '^args': ['closure:get-player-info'],
          //     },
          //     {
          //       closure: 'log',
          //       level: 'info',
          //       '^args': ['closure:gamestate-remove-player'],
          //     },
          //     {
          //       closure: 'log',
          //       level: 'info',
          //       '^args': ['closure:send-gamestate-message'],
          //     },
          //   ],
          // },
          // Handle Game Start Message
          {
            when: ['is-valid-gamestart-message'],
            then: ['gamestate-prepare-to-start', 'gamestate-publish-message'],
          },
          // Handle Player Actions
          {
            when: ['is-valid-playeractions-message'],
            then: [
              'gamestate-apply-actions',
              'gameactivity-insert-player-actions',
              'gamestate-publish-message',
            ],
          },
          // Depricated: Handle End Game Message
          // {
          //   when: ['is-valid-endgame-message'],
          //   then: [
          //     'gamestate-end', // Change game status to "end"
          //     'gameactivity-get-daily-leaderboard', // Generate daily leaderboard
          //     'gameactivity-publish-daily-leaderboard', // Publish daily leaderboard message
          //     'gamestate-publish-message', // Publish game status message
          //   ],
          // },
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
                routingKey: 'game.turnstart',
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
  {
    name: 'Messages (Any Type)',
    rules: [
      {
        // Limit to udp requests with valid message header
        when: ['is-valid-message-header'],
        then: [
          {
            when: 'is-valid-configset-message',
            then: [
              'logFacts',
              {
                closure: 'config-save',
                '^key': 'message.data.key',
                '^value': 'message.data.value',
              },
              // Get config for key
              {
                closure: 'config-get',
                '^key': 'message.data.key',
                outputKey: 'configget',
              },
              {
                closure: 'publish-amqp-message',
                exchange: conf.amqp.mainExchange,
                routingKey: 'game.config',
                type: 'config',
                '^data': {
                  '^key': 'message.data.key',
                  '^value': 'configget',
                },
              },
            ],
          },
          {
            when: 'is-valid-configget-message',
            then: [
              // Get config for key
              {
                closure: 'config-get',
                '^key': 'message.data.key',
                outputKey: 'configget',
              },
              // Publish Config Message
              {
                closure: 'publish-amqp-message',
                exchange: conf.amqp.mainExchange,
                routingKey: 'game.config',
                type: 'config',
                '^data': {
                  '^key': 'message.data.key',
                  '^value': 'configget',
                },
              },
            ],
          },
          {
            when: 'is-valid-leaderboardget-message',
            then: [
              'gameactivity-get-daily-leaderboard', // Generate daily leaderboard
              'gameactivity-publish-daily-leaderboard', // Publish daily leaderboard message
            ],
          },
        ],
      },
      'logFacts',
    ],
  },
];

export default ruleCorpus;
