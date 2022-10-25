import { ChannelWrapper, ConsumeMessage } from 'amqp-cacoon';
import { setupAmqp } from './utils/amqp';
import conf from './config';

const timeout = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

async function start() {
  let amqpCacoon = await setupAmqp();
  await timeout(3000);
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
          gameEndTimestamp,
          gameLengthMs,
          flags: { leaderboardEnabled },
        } = state.gamestate.data;
        console.table({
          gameId,
          gameStatus,
          gameStartTimestamp,
          gameEndTimestamp,
          gameLengthMs,
          leaderboardEnabled,
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
