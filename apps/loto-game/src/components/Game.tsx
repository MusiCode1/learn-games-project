import React, { useState, useEffect } from 'react';
import Board from './Board';
import type { GameState } from '../types';
import { generateCards } from '../utils/gameLogic';
import { playSuccess, playError } from '../utils/sound';

const Game: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>({
        cards: [],
        selectedCards: [],
        matches: 0,
        isLocked: false,
    });

    const [won, setWon] = useState(false);

    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const newCards = generateCards(10); // 10 pairs = 20 cards
        setGameState({
            cards: newCards,
            selectedCards: [],
            matches: 0,
            isLocked: false,
        });
        setWon(false);
    };

    const handleCardClick = (id: number) => {
        if (gameState.isLocked) return;

        const clickedCardIndex = gameState.cards.findIndex((c) => c.id === id);
        if (clickedCardIndex === -1) return;

        const clickedCard = gameState.cards[clickedCardIndex];

        // Ignore if already matched or already selected
        if (clickedCard.isMatched || clickedCard.isSelected) {
            // Optional: Deselect if clicking the same card again? 
            // For now, let's say clicking a selected card deselects it.
            if (clickedCard.isSelected) {
                const newCards = [...gameState.cards];
                newCards[clickedCardIndex].isSelected = false;
                setGameState(prev => ({
                    ...prev,
                    cards: newCards,
                    selectedCards: prev.selectedCards.filter(cardId => cardId !== clickedCardIndex)
                }));
            }
            return;
        }

        // Select the card
        const newCards = [...gameState.cards];
        newCards[clickedCardIndex].isSelected = true;

        const newSelectedCards = [...gameState.selectedCards, clickedCardIndex];

        setGameState((prev) => ({
            ...prev,
            cards: newCards,
            selectedCards: newSelectedCards,
        }));

        // Check for match if 2 cards are selected
        if (newSelectedCards.length === 2) {
            setGameState((prev) => ({ ...prev, isLocked: true }));

            const firstCardIndex = newSelectedCards[0];
            const secondCardIndex = newSelectedCards[1];
            const firstCard = newCards[firstCardIndex];
            const secondCard = newCards[secondCardIndex];

            if (firstCard.content === secondCard.content) {
                // Match found
                playSuccess();
                setTimeout(() => {
                    const matchedCards = [...newCards];
                    matchedCards[firstCardIndex].isMatched = true;
                    matchedCards[secondCardIndex].isMatched = true;
                    matchedCards[firstCardIndex].isSelected = false;
                    matchedCards[secondCardIndex].isSelected = false;

                    setGameState((prev) => ({
                        ...prev,
                        cards: matchedCards,
                        selectedCards: [],
                        matches: prev.matches + 1,
                        isLocked: false,
                    }));

                    if (gameState.matches + 1 === 10) {
                        setWon(true);
                        playSuccess();
                    }
                }, 500);
            } else {
                // No match
                playError();
                const errorCards = [...newCards];
                errorCards[firstCardIndex].isError = true;
                errorCards[secondCardIndex].isError = true;

                setGameState((prev) => ({
                    ...prev,
                    cards: errorCards,
                }));

                setTimeout(() => {
                    const resetCards = [...newCards];
                    resetCards[firstCardIndex].isSelected = false;
                    resetCards[secondCardIndex].isSelected = false;
                    resetCards[firstCardIndex].isError = false;
                    resetCards[secondCardIndex].isError = false;

                    setGameState((prev) => ({
                        ...prev,
                        cards: resetCards,
                        selectedCards: [],
                        isLocked: false,
                    }));
                }, 1000);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
            <h1 className="text-4xl font-bold text-indigo-800 mb-8 font-sans">משחק לוטו אותיות</h1>

            <div className="mb-4 flex items-center gap-4">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md">
                    <span className="text-gray-600">זוגות: </span>
                    <span className="font-bold text-indigo-600">{gameState.matches}/10</span>
                </div>
                <button
                    onClick={startNewGame}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
                >
                    משחק חדש
                </button>
            </div>

            <Board
                cards={gameState.cards}
                onCardClick={handleCardClick}
                isLocked={gameState.isLocked}
            />

            {won && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-bounce-in">
                        <h2 className="text-4xl font-bold text-green-500 mb-4">כל הכבוד!</h2>
                        <p className="text-xl text-gray-600 mb-6">מצאת את כל הזוגות!</p>
                        <button
                            onClick={startNewGame}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg transition-transform hover:scale-105"
                        >
                            שחק שוב
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game;
