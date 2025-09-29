import { getGameConfig } from "//dev-server.dev/src/lib/get-game-config.ts";
import { initializeConfig } from "//dev-server.dev/src/lib/config-manager.ts";

async function checkGameConfigFn() {
  const config = await initializeConfig();

  const gameConfig = getGameConfig(config);

  console.log(gameConfig);

  return gameConfig;
}

window.checkGameConfigFn = checkGameConfigFn;
