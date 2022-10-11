import { setup } from './setup';
import conf from './conf';
import { getLogger } from './providers/logger';

const logger = getLogger(conf.logger, 'Backend');

logger.info('Rules Engine Starting');
setup({ logger })
  .then(() => {
    logger.info('Rules Engine Started');
  })
  .catch((err: any) => {
    logger.info('Error Starting Rules Engine', err);
  });
