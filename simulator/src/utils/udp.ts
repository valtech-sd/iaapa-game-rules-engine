import dgram from 'dgram';
import { Buffer } from 'buffer';

export async function sendUdpMessage(data: any) {
  const message = Buffer.from(JSON.stringify(data));
  const client = dgram.createSocket('udp4');

  client.send(message, 3333, 'localhost', (_err: any) => {
    client.close();
  });
}
