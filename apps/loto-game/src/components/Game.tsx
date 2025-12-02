import React, { useState, useEffect } from 'react';
import Board from './Board';
import type { GameState } from '../types';
import { generateCards } from '../utils/gameLogic';
import { playSuccess, playError } from '../utils/sound';
import Confetti from 'react-confetti';

const Game: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>({
        cards: [],
        selectedCards: [],
        matches: 0,
        isLocked: false,
    });

    const [won, setWon] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
            {won && <Confetti width={windowSize.width} height={windowSize.height} />}

            {/* Header Bar */}
            <header className="bg-white shadow-md p-4 flex justify-between items-center z-10 shrink-0">
                <h1 className="text-2xl font-bold text-indigo-800 font-sans">משחק לוטו אותיות</h1>

                <div className="flex items-center gap-4">
                    <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                        <span className="text-gray-600 ml-2">זוגות:</span>
                        <span className="font-bold text-indigo-600 text-xl">{gameState.matches}/10</span>
                    </div>
                    <button
                        onClick={startNewGame}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 font-bold"
                    >
                        משחק חדש
                    </button>
                </div>
            </header>

            {/* Main Game Area */}
            <main className="flex-grow flex items-center justify-center p-4 overflow-auto">
                <div className="w-full max-w-7xl h-full flex items-center justify-center">
                    <Board
                        cards={gameState.cards}
                        onCardClick={handleCardClick}
                        isLocked={gameState.isLocked}
                    />
                </div>
            </main>

            {won && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-bounce-in relative z-50">
                        <h2 className="text-5xl font-bold text-green-500 mb-4">כל הכבוד!</h2>
                        <p className="text-2xl text-gray-600 mb-8">מצאת את כל הזוגות!</p>
                        <button
                            onClick={startNewGame}
                            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-xl font-bold shadow-lg transition-transform hover:scale-105"
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
