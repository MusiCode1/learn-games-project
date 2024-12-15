import { gameConfigs } from "./game-config";


function pullGameConfig(path: string) {

    return gameConfigs.find((v) => path.includes(v.gameName))
}

export function getGameConfig() {

    const currentPath = window.location.pathname;

    const gameConfig = pullGameConfig(currentPath);

    if (!gameConfig) {

        return false;
    }

    return gameConfig;

}