
import { defaultConfig, deepMerge } from "../config/config-manager";

import type { Config } from "../../types";


export function createConfigStore() {

    let config = $state(defaultConfig);

    function setConfig(newConfig: Config) {
        config = deepMerge({ ...config }, newConfig);
    }

    function getConfig(): Config {
        return { ...config };
    }

    return {
        setConfig,
        getConfig,
        config
    };


}
