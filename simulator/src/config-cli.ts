import AmqpCacoon, { ChannelWrapper, ConsumeMessage } from 'amqp-cacoon';
import inquirer from 'inquirer';
import { setupAmqp } from './utils/amqp';
import conf from './config';

const timeout = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

async function setConfig(amqpCacoon: AmqpCacoon, key: string, value: any) {
  await amqpCacoon.publish(
    conf.amqp.mainExchange,
    'game.configget',
    JSON.stringify({
      type: 'configset',
      timestamp: Date.now(),
      data: {
        key,
        value,
      },
    })
  );
}

async function getConfig(amqpCacoon: AmqpCacoon, key: string) {
  await amqpCacoon.publish(
    conf.amqp.mainExchange,
    'game.configget',
    JSON.stringify({
      type: 'configget',
      timestamp: Date.now(),
      data: {
        key,
      },
    })
  );
}

async function start() {
  let amqpCacoon = await setupAmqp();

  const prompt = inquirer.createPromptModule();
  await timeout(3000);
  await amqpCacoon.registerConsumer(
    conf.amqp.tempConfigQueue,
    async (channel: ChannelWrapper, msg: ConsumeMessage) => {
      try {
        let json: any = JSON.parse(msg.content.toString());
        console.log(JSON.stringify(json, null, 2));
        console.table(json?.data);
        let answers = await prompt({
          type: 'list',
          name: 'leaderboardupdate',
          message: 'Select config change',
          choices: [
            { name: 'Enable Leaderboard', value: true },
            { name: 'Disable Leaderboard', value: false },
          ],
        });
        console.log('Updating config');
        await setConfig(
          amqpCacoon,
          'leaderboardupdate',
          answers.leaderboardupdate
        );
      } catch (e) {
        console.error(e);
      }
      channel.ack(msg);
    }
  );
  await getConfig(amqpCacoon, 'leaderboardupdate');
}

start();
