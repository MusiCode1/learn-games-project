declare global {
    interface Window {
        PIXI: {
            game: {
                state: {
                    states: {
                        game: {
                            [key: string]: any;
                        };
                    };
                };
            };
        };
    }
}

export {};
