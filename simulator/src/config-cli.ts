import { ChannelWrapper, ConsumeMessage } from 'amqp-cacoon';
import { setupAmqp } from './utils/amqp';
import conf from './config';
// import inquirer from 'inquirer';

async function start() {
  let amqpCacoon = await setupAmqp();
  await amqpCacoon.publish(conf.amqp.mainExchange, '', {});
  amqpCacoon.registerConsumer(
    conf.amqp.tempConfigQueue,
    async (channel: ChannelWrapper, msg: ConsumeMessage) => {
      try {
        let json: any = JSON.parse(msg.content.toString());
        console.log(JSON.stringify(json, null, 2));
        console.table(json?.data);
      } catch (e) {
        console.error(e);
      }
      channel.ack(msg);
    }
  );
}

start();
