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
];
