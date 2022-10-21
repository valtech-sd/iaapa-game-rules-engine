import { ChannelWrapper, ConsumeMessage } from 'amqp-cacoon';
import { setupAmqp } from './utils/amqp';
import conf from './config';

async function start() {
  let amqpCacoon = await setupAmqp();
  amqpCacoon.registerConsumer(
    conf.amqp.tempLeaderboardQueue,
    async (channel: ChannelWrapper, msg: ConsumeMessage) => {
      try {
        let json: any = JSON.parse(msg.content.toString());
        if (json.type === 'leaderboard') {
          console.table(json.data.leaderboard);
        }
      } catch (e) {
        console.error(e);
      }
      channel.ack(msg);
    }
  );
}

start();
