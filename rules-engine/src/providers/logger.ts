import log4js, { Logger } from 'log4js';
import stringify from 'json-stringify-safe';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';

export { Logger };

const APP_INSTANCE_ID = uuidv4();
const loggers: any = {};
let defaultConfg: { style: string; level: string; appName: string };
let loggerSetup = false;

function setupLogger(conf: { style: string; level: string; appName: string }) {
  // Return immediatly if logger is already setup
  if (loggerSetup) return;

  log4js.addLayout('json', function (config) {
    return function (logEvent) {
      // If json is an instance of an error object then we need to
      // make the non-enumerable field in the error object enumerable
      // for proper logging
      const dataJson: any = {};
      if (logEvent && logEvent.data && logEvent.data.length > 0) {
        for (let i = 0; i < logEvent.data.length; i++) {
          if (logEvent.data[i] instanceof Error) {
            logEvent.data[i] = getErrorJSON(logEvent.data[i]);
          }
          if (
            !(typeof logEvent.data[i] === 'string') &&
            typeof logEvent.data[i] === 'object' &&
            logEvent.data[i] !== null
          ) {
            for (const key of Object.keys(logEvent.data[i])) {
              dataJson[key] = logEvent.data[i][key];
            }
          }
        }
        (logEvent as any).dataJson = dataJson;
      }
      return stringify(logEvent) + config.separator;
    };
  });

  // Choose the default log based on a config value, if present
  let defaultLogAppender: string;
  switch (conf.style) {
    case 'json':
      defaultLogAppender = 'console_json';
      break;
    default:
      defaultLogAppender = 'console_colored';
  }

  // Set Logger Settings
  // colored console output
  // file saved locally up to 10megs then backend up and log rolling
  // pm2 (boolean) (optional) - set this to true if you’re running your app using pm2, otherwise logs will not work
  // (you’ll also need to install pm2-intercom as pm2 module: pm2 install pm2-intercom)
  // pm2 ends up with duplicate log entries, so we disableClustering, but then we're careful to use named files per process!

  // Need to do addLevels here instead of passing to configure, because ts throws errors.
  log4js.levels.addLevels({
    alarm: {
      value: log4js.levels.ERROR.level + 5,
      colour: 'magenta',
    },
  });

  log4js.configure({
    pm2: false,
    disableClustering: true,
    appenders: {
      console_colored: {
        type: 'stdout',
        layout: { type: 'colored' },
      },
      console_json: {
        type: 'stdout',
        layout: { type: 'json', separator: '' },
      },
    },
    categories: {
      default: {
        appenders: [defaultLogAppender],
        level: 'debug',
      },
    },
  });

  loggerSetup = true;
}

export function getLogger(
  conf: { style: string; level: string; appName: string } | undefined,
  name = 'DEFAULT'
) {
  if (!conf) {
    conf = defaultConfg;
  }
  if (!conf) {
    throw new Error('Error getting logger (No configuration available)');
  }
  if (!defaultConfg && conf) {
    defaultConfg = conf;
  }
  setupLogger(conf); // Does nothing if already setup
  if (!loggers[name]) {
    const logger = log4js.getLogger(name);
    logger.level = conf.level;
    logger.addContext('appInstanceId', APP_INSTANCE_ID);
    logger.addContext('appName', conf.appName);
    loggers[name] = logger;
  }
  return loggers[name];
}

export const createLogger = getLogger; // Here for backwards compatibility

/**
 * Create temporray logger based on old logger
 * @param categoryName
 * @param context
 * @return logger
 */
export function createTemporaryLogger(
  categoryName: string,
  oldLogger: any
): Logger {
  const logger: any = log4js.getLogger(categoryName);
  logger.context = cloneDeep(oldLogger.context);
  logger.addContext('temporaryLogger', true);
  logger.level = oldLogger.level;
  return logger;
}

/***
 * The standard Error object fields (message and stack)
 * are not enumerable fields. This uses Object.getOwnPropertyNames instead of Object.keys
 * To copy all fields including non-enumerable fields to a new object where those fields
 * are enumerable
 ***/
export function getErrorJSON(error: any) {
  const alt: any = {};

  Object.getOwnPropertyNames(error).forEach(function (key: any) {
    alt[key] = error[key];
  });

  return alt;
}
