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
  ...Actions,
  ...Conditions,
  ...Transformers,
  ...MongoDB,
  ...Config,
  ...Players,
  ...MessageValidators,
  ...GameMode,
  ...GameState,
  ...GameActivity,
];
