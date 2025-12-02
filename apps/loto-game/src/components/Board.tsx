import React from 'react';
import type { Card as CardType } from '../types';
import Card from './Card';

interface BoardProps {
    cards: CardType[];
    onCardClick: (id: number) => void;
    isLocked: boolean;
}

const Board: React.FC<BoardProps> = ({ cards, onCardClick, isLocked }) => {
    return (
        <div className="w-full h-full grid gap-2 sm:gap-4 p-2 sm:p-4 bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl place-content-center
            grid-cols-4 grid-rows-5 landscape:grid-cols-5 landscape:grid-rows-4
            max-w-full max-h-full mx-auto
        ">
            {cards.map((card) => (
                <Card
                    key={card.id}
                    card={card}
                    onClick={onCardClick}
                    disabled={isLocked}
                />
            ))}
        </div>
    );
};

export default Board;
