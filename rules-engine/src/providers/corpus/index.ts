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
      // Set facts used for validation tracking
      'set-validation-tracking-facts',
    ],
  },
  {
    name: 'Debug Log Incoming Messages', // This corpus groups logs all incoming messages (UDP + AMQP)
    rules: [
      {
        when: ['is-udp-request'],
        then: [
          {
            closure: 'debug-message-to-file',
            '^message': 'message',
            filePrefix: 'udp/message',
          },
        ],
      },
      {
        when: ['is-amqp-request'],
        then: [
          // We log amqp messages when we recieve them because it is easier that way. We are setup to recieve all messages ... even if we sent them out too
          {
            closure: 'debug-message-to-file',
            '^message': 'message',
            filePrefix: 'amqp/message',
          },
        ],
      },
    ],
  },
  {
    name: 'Message Handler UDP Messages',
    rules: [
      {
        // Limit to udp requests with valid message header
        when: ['is-valid-message-header', 'is-udp-request'],
        then: [
          { closure: 'set', key: 'validation.headerValid', value: true },
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
              {
                when: 'is-gameid-in-message',
                then: 'set-last-gameid-config',
              },
              {
                when: 'is-gameid-missing-from-message',
                then: 'fill-in-gameid-from-config',
              },
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
          // Handle Player Checkin message
          {
            when: ['is-valid-playercheckin-message'],
            then: ['gamestate-add-player', 'gamestate-publish-message'],
          },
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
    name: 'Messages (Any Type)',
    rules: [
      {
        // Limit to udp requests with valid message header
        when: ['is-valid-message-header'],
        then: [
          { closure: 'set', key: 'validation.headerValid', value: true },
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
