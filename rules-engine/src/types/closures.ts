import {
  ICoreUdpRequest,
  ICoreAmqpMessage,
  ILogger,
  ICoreAmqpPublishAction,
} from 'rule-harvester';
import { Db } from 'mongodb';
import { messages } from './messages/index';

// Used as a helper type for our closures
export interface AppFacts {
  udpRequest?: ICoreUdpRequest; // Incoming udp requests are stored here
  amqpMessage?: ICoreAmqpMessage; // Incoming amqp messages are stored here
  amqpPublishAction: Array<ICoreAmqpPublishAction>; // We push onto this array to publish amqp messages
  message: messages.MessageAllTypeUnion; // Incoming messages / requests are parsed into this field
  [key: string]: any;
}

// App Context in our closures will contain the following fields
export interface AppContext {
  parameters: any;
  mongoDatabase: Db;
  logger: ILogger;
}
