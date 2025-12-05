import type { PageServerLoad } from './$types';
import soundsData from '$lib/data/sounds.json';

export const load: PageServerLoad = async () => {
    return {
        sounds: soundsData
    };
};
