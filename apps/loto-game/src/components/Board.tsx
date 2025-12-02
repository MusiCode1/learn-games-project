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
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 p-4 bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl">
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
