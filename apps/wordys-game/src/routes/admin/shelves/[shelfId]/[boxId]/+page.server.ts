import type { PageServerLoad } from './$types';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const load: PageServerLoad = async () => {
    // Note: This path logic works locally but may fail in Cloudflare if 'static' is not in the bundle
    const soundsDir = path.resolve('static/sounds');
    let sounds: string[] = [];

    console.log('Attempting to read sounds from:', soundsDir);

    try {
        if (fs.existsSync(soundsDir)) {
            sounds = fs.readdirSync(soundsDir).filter(file =>
                file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg')
            );
            console.log('Successfully read sounds:', sounds);
        } else {
            console.warn('Sounds directory does not exist at path:', soundsDir);
            // Try listing root to help debug where we are
            try {
                console.log('Root directory contents:', fs.readdirSync('/'));
                console.log('Current directory contents:', fs.readdirSync('.'));
            } catch (err) {
                console.log('Cannot list root/current dir:', err);
            }
        }
    } catch (e) {
        console.error('Error reading sounds directory:', e);
    }

    return {
        sounds
    };
};
