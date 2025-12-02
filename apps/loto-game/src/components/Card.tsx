import React from 'react';
import type { Card as CardType } from '../types';

interface CardProps {
    card: CardType;
    onClick: (id: number) => void;
    disabled: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
    const handleClick = () => {
        if (!disabled && !card.isMatched) {
            onClick(card.id);
        }
    };

    // Base styles
    const baseClasses = "relative aspect-square cursor-pointer rounded-xl shadow-lg flex items-center justify-center text-[12vmin] font-bold transition-all duration-300 transform hover:scale-105 max-w-full max-h-full landscape:h-full landscape:w-auto portrait:w-full portrait:h-auto";

    // Dynamic styles based on state
    let stateClasses = "bg-white text-gray-800 border-2 border-blue-200";

    if (card.isMatched) {
        stateClasses = "bg-green-100 text-green-600 border-green-400 opacity-50 scale-95 cursor-default";
    } else if (card.isError) {
        stateClasses = "bg-red-100 text-red-600 border-4 border-red-400 animate-pulse";
    } else if (card.isSelected) {
        stateClasses = "bg-blue-100 text-blue-700 border-4 border-blue-500 scale-110 shadow-xl z-10";
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div
                className={`${baseClasses} ${stateClasses}`}
                onClick={handleClick}
            >
                {card.content}
            </div>
        </div>
    );
};

export default Card;
