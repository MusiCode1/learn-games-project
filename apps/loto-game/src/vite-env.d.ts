/// <reference types="vite/client" />

interface Window {
    GameEvents: {
        on: (event: string, handler: (data: any) => void) => void;
        off: (event: string, handler: (data: any) => void) => void;
        emit: (event: string, data: any) => void;
    };
}

declare module 'react-confetti' {
    import React from 'react';

    interface ConfettiProps {
        width?: number;
        height?: number;
        numberOfPieces?: number;
        recycle?: boolean;
        run?: boolean;
        colors?: string[];
        opacity?: number;
        initialVelocityX?: number;
        initialVelocityY?: number;
        gravity?: number;
        wind?: number;
        friction?: number;
        drawShape?: (ctx: CanvasRenderingContext2D) => void;
        confettiSource?: {
            x: number;
            y: number;
            w: number;
            h: number;
        };
        onConfettiComplete?: (confetti: any) => void;
    }

    export default class Confetti extends React.Component<ConfettiProps> { }
}
