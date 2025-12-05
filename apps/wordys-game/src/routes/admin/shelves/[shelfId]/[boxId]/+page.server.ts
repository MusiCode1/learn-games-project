import type { PageServerLoad } from './$types';
import fs from 'fs';
import path from 'path';

export const load: PageServerLoad = async () => {
    const soundsDir = path.resolve('static/sounds');
    let sounds: string[] = [];

    try {
        if (fs.existsSync(soundsDir)) {
            sounds = fs.readdirSync(soundsDir).filter(file =>
                file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg')
            );
        }
    } catch (e) {
        console.error('Error reading sounds directory:', e);
    }

    return {
        sounds
    };
};
