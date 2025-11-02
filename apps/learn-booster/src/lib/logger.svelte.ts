/* eslint-disable @typescript-eslint/no-explicit-any */
import { regex } from "arkregex";

// const fileNamePattern = regex("at\\s+(?<funcName>\\w+)\\s+\\((?<fullFileName>.+?/(?<fileName>[^/:]+\.ts)(.+)?:\\d+:\\d+)\\)?");

export function log(...args: any[]) {

    console.groupCollapsed('[gingim-booster]', ...args);
    console.trace("Stack trace:");
    console.log('page URL:', window.location.href);
    console.groupEnd();


    /*     try {
            throw new Error('log error');
        } catch (error) {
            const stack = (error as Error).stack;
            const stackLines = stack?.split('\n')?.slice(2) || [];
    
            const rowFileName = stackLines[0].replaceAll('\n', ' ').trim();
    
            const fileNameParts = fileNamePattern.exec(rowFileName);
    
            console.error('[gingim-booster]', ...args, '\n');
    
            //console.log('[gingim-booster]', ...args, '\n', '\t', 'fn:', fileNameParts?.groups?.funcName, '|', 'file:', fileNameParts?.groups?.fileName, '|', 'url:', fileNameParts?.groups?.fullFileName);
    
        } */




}