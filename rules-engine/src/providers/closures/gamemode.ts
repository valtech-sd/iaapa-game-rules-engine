import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';

export default [
  closureGenerator('gamemode-idle', [
    { closure: 'config-save', key: 'showmode', value: 'idle' },
  ]),
  closureGenerator('gamemode-run', [
    { closure: 'config-save', key: 'showmode', value: 'run' },
  ]),
];
