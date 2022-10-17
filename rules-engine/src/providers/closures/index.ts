import { CoreClosures } from 'rule-harvester';
import Actions from './actions';
import Transformers from './transformers';
import Conditions from './conditions';
import MongoDB from './mongodb';
import Config from './config';
import Players from './players';
import MessageValidators from './message-validators';
import GameMode from './gamemode';
import GameState from './gamestate';
import GameActivity from './gameactivity';

export default [
  ...CoreClosures,
  ...Transformers,
  ...MongoDB,
  ...Config,
  ...Players,
  ...Conditions,
  ...MessageValidators,
  ...GameMode,
  ...GameState,
  ...Actions,
  ...GameActivity,
];
