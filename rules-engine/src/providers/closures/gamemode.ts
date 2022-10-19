import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';

export default [
  // Save the game mode of "idle" in a config value
  closureGenerator('gamemode-idle', [
    { closure: 'config-save', key: 'showmode', value: 'idle' },
  ]),
  // Save the game mode of "run" in a config value
  closureGenerator('gamemode-run', [
    { closure: 'config-save', key: 'showmode', value: 'run' },
  ]),
];
