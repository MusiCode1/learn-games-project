import { gameConfigs, defaultGameConfig } from "./game-config";
import { getFunctionByPath } from "./inject-code-into-function";


function pullGameConfig(path: string) {

    return gameConfigs.find((v) => path.includes(v.gameName))
}

export function getGameConfig() {

    const currentPath = window.location.pathname;

    const gameConfig = pullGameConfig(currentPath);

    if (!gameConfig) {

        const triggerFuncObj = getFunctionByPath(defaultGameConfig.triggerFunc.path);

        if (!triggerFuncObj) return false;

        return defaultGameConfig;
    }

    return gameConfig;

}
