import { closureGenerator } from 'rule-harvester';
import _ from 'lodash';

export default [
  /**
   * Is The idle message gamemode run
   * @param parameter.mode = mode to check
   */
  closureGenerator('is-message-gamemode', [
    {
      closure: 'parameter',
      parameterKey: 'mode',
      outputParameterTo: 'is-message-gamemode.mode',
    },
    {
      closure: 'equal',
      '^value1': 'message.data.mode',
      '^value2': 'is-message-gamemode.mode',
    },
  ]),
  // Save the game mode of "idle" in a config value
  closureGenerator('gamemode-set', [
    {
      closure: 'parameter',
      parameterKey: 'mode',
      outputParameterTo: 'gamemode-set.mode',
    },
    { closure: 'config-save', key: 'showmode', '^value': 'gamemode-set.mode' },
  ]),
  closureGenerator('gamemode-idle', [
    { closure: 'gamemode-set', mode: 'idle' },
  ]),
  closureGenerator('gamemode-load', [
    { closure: 'gamemode-set', mode: 'load' },
  ]),
  closureGenerator('gamemode-run', [{ closure: 'gamemode-set', mode: 'run' }]),
  closureGenerator('gamemode-end', [{ closure: 'gamemode-set', mode: 'end' }]),
  closureGenerator('is-message-gamemode-idle', [
    { closure: 'is-message-gamemode', mode: 'idle' },
  ]),
  closureGenerator('is-message-gamemode-load', [
    { closure: 'is-message-gamemode', mode: 'load' },
  ]),
  closureGenerator('is-message-gamemode-run', [
    { closure: 'is-message-gamemode', mode: 'run' },
  ]),
  closureGenerator('is-message-gamemode-end', [
    { closure: 'is-message-gamemode', mode: 'end' },
  ]),
];
