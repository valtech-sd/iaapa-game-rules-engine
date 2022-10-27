import { sendUdpMessage } from './utils/udp';
import { generators } from './utils/show-control-messages';
// @ts-ignore Ignore check that this is not in the root directory
import { messages } from '../../rules-engine/src/types/messages';

const timeout = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

const config = {
  startDelay: 5000,
  roundLengths: [5, 4, 1],
  gameLengthMs: 60000,
};

async function start() {
  const gameId = `game_${Date.now()}`;
  const playerRfids = [];
  for (let i = 0; i < 6; i++) {
    playerRfids.push(`playerRfid_${gameId}_${i}`);
  }
  console.log('Game Load Mode');
  // Change to loading mode
  await sendUdpMessage(
    generators.generateGameModeMessage({ gameId, mode: 'load' })
  );

  // Send checkin messages
  for (let i = 0; i < 6; i++) {
    await timeout(1000);
    console.log(`Player Checkin: ${i + 1} - ${playerRfids[i]}`);
    await sendUdpMessage(
      generators.generatePlayerCheckinMessage({
        gameId,
        playerRfid: playerRfids[i],
        locationNumber: i + 1,
      })
    );
  }
  await timeout(1000);
  let gameStartTimestamp = new Date();
  let gameLengthMs = config.gameLengthMs;
  let gameEndTimestamp = new Date();
  gameStartTimestamp.setTime(gameStartTimestamp.getTime() + config.startDelay);
  gameEndTimestamp.setTime(gameStartTimestamp.getTime() + gameLengthMs);
  // Game start message
  console.log(
    `Preparing to start: Sending gamestart message with start/end time`,
    JSON.stringify({
      currentTime: new Date().toISOString(),
      gameStartTimestamp: gameStartTimestamp.toISOString(),
      gameLengthMs: gameLengthMs,
      gameEndTimestamp: gameEndTimestamp.toISOString(),
    })
  );
  await sendUdpMessage(
    generators.generateGameStartMessage({
      gameId,
      gameStartTimestamp: gameStartTimestamp.toISOString(),
      gameEndTimestamp: gameEndTimestamp.toISOString(),
      gameLengthMs,
    })
  );

  await timeout(config.startDelay);
  console.log(`Start Game: Gamemode run`);
  await sendUdpMessage(
    generators.generateGameModeMessage({ gameId, mode: 'run' })
  );

  let turnNumber = 0;
  let lastPlayerRfid: string | undefined;
  for (let roundLength of config.roundLengths) {
    for (let playerRfid of playerRfids) {
      turnNumber++;
      let roundLengthMs = roundLength * 1000;
      console.log(`TurnStart: turnstart message`);
      await sendUdpMessage(
        generators.generateTurnStartMessageShowControl({
          gameId,
          playerRfid,
          turnNumber,
          turnLengthMs: roundLengthMs,
        })
      );
      await timeout(roundLengthMs);

      console.log(`Player Actions Message`);
      let actions: messages.MessagePlayerActions['data']['actions'] = [];
      actions.push({
        playerRfid,
        count: Math.floor(Math.random() * roundLength * 5), // Random number between zero and 5 times per second of round time
        type: 'hits',
      });
      if (lastPlayerRfid) {
        actions.push({
          playerRfid,
          count: Math.floor(Math.random() * roundLength * 5), // Random number between zero and 5 times per second of round time
          type: 'hits',
        });
      }
      await sendUdpMessage(
        generators.generatePlayerActionsMessage({
          gameId,
          scoringPlayerRfid: playerRfid,
          turnNumber,
          turnLengthMs: roundLengthMs,
          actions,
        })
      );
      lastPlayerRfid = playerRfid;
    }
  }

  console.log(`End Game: Gamemode end`);
  await sendUdpMessage(
    generators.generateGameModeMessage({ gameId, mode: 'end' })
  );

  await timeout(20000);

  console.log(`GameMode: Idle`);
  // Change to loading mode
  await sendUdpMessage(
    generators.generateGameModeMessage({ gameId, mode: 'idle' })
  );
}

start().catch((e: any) => console.log('Error', e));
