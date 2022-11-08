import { ChannelWrapper, ConsumeMessage } from 'amqp-cacoon';
import { setupAmqp } from './utils/amqp';
import conf from './config';

async function start() {
  let amqpCacoon = await setupAmqp();
  let state: any = {};
  amqpCacoon.registerConsumer(
    conf.amqp.tempGamestateQueue,
    async (channel: ChannelWrapper, msg: ConsumeMessage) => {
      try {
        let json: any = JSON.parse(msg.content.toString());
        console.log(JSON.stringify(json, null, 2));
        if (json.type === 'gamestate') {
          state.gamestate = json;
        }
        if (json.type === 'turnstart') {
          state.turnstart = json;
        }
        let locations = state.gamestate.data.locations || [];
        locations.forEach((l: any) => {
          if (l.playerId === state?.turnstart?.data?.playerId) l.turn = true;
          else l.turn = false;
        });

        console.clear();
        let {
          gameId,
          gameStatus,
          gameStartTimestamp,
          gameLengthMs,
          flags: { leaderboardEnabled },
        } = state.gamestate.data;
        console.table({
          gameId,
          gameStatus,
          gameStartTimestamp,
          gameStartTimestampElapsed: (Date.now() - gameStartTimestamp) / 1000,
          gameLengthMs,
          leaderboardEnabled,
          currentTurnLengthMs: state?.turnstart?.data?.turnLengthMs,
        });
        // console.table(state?.turnstart?.data);
        console.table(locations);
      } catch (e) {
        console.error(e);
      }
      channel.ack(msg);
    }
  );
}

start();
