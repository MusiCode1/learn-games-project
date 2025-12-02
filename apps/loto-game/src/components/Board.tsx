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
        <div className="grid gap-0 p-[1.5vmin] bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl place-content-center
            grid-cols-4 grid-rows-5 landscape:grid-cols-5 landscape:grid-rows-4
            h-full w-auto max-w-full mx-auto
            aspect-[4/5] landscape:aspect-[5/4]
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
