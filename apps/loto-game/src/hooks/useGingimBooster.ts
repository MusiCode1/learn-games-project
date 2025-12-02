import { useEffect, useRef } from 'react';
import { GingimBoosterLib } from 'gingim-booster';

export function useGingimBooster() {
    const boosterRef = useRef<GingimBoosterLib | null>(null);

    useEffect(() => {
        // Initialize booster
        const booster = new GingimBoosterLib();
        booster.init().catch(err => console.error('Failed to init booster:', err));
        boosterRef.current = booster;

        return () => {
            if (boosterRef.current) {
                boosterRef.current.cleanup();
                boosterRef.current = null;
            }
        };
    }, []);

    const triggerReward = async () => {
        if (boosterRef.current) {
            await boosterRef.current.triggerReward();
        } else {
            console.warn('Booster not initialized yet');
        }
    };

    return { triggerReward };
}
