/**
 * Single source of truth for test imports.
 * When source paths change during refactoring — update only this file.
 *
 * Usage:
 *   import { utils, configManager, profileManager } from '../src'
 *   import { sleep } from './src'
 */

// ─── utils (multi-file group) ──────────────────────────────────────────────
import * as _shuffleArray from '../src/lib/utils/shuffle-array'
import * as _msToTime from '../src/lib/utils/ms-to-time'
import * as _encryptDecrypt from '../src/lib/utils/encript-decrypt-text'
import * as _timer from '../src/lib/utils/timer'

export const utils = {
  ..._shuffleArray,
  ..._msToTime,
  ..._encryptDecrypt,
  ..._timer,
}

// ─── sleep (standalone) ────────────────────────────────────────────────────
export { sleep } from '../src/lib/sleep'

// ─── modules ───────────────────────────────────────────────────────────────
export * as configManager from '../src/lib/config-manager'
export * as defaultConfig from '../src/lib/default-config'
export * as profileManager from '../src/lib/profile-manager'
export * as videoLoader from '../src/lib/video-loader'
export * as watchdog from '../src/lib/watchdog/reward-watchdog'
export * as appList from '../src/lib/get-app-list'
