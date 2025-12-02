import React, { useState, useEffect } from 'react';
import Board from './Board';
import type { GameState } from '../types';
import { generateCards, LETTERS } from '../utils/gameLogic';
import { playSuccess, playError, playWin } from '../utils/sound';
import Confetti from 'react-confetti';
import SettingsModal from './SettingsModal';
import { gameEvents } from '../utils/gameEvents';
import { useGingimBooster } from '../hooks/useGingimBooster';
import winnerLogo from '../assets/winner_logo.png';

const Game: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>({
        cards: [],
        selectedCards: [],
        matches: 0,
        isLocked: false,
    });

    const [settings, setSettings] = useState({
        pairCount: 10,
        selectedLetters: LETTERS,
        loopMode: 'finite' as 'finite' | 'infinite',
        totalRounds: 1,
    });
    const [currentRound, setCurrentRound] = useState(1);
    const [nextRoundTimer, setNextRoundTimer] = useState<number | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [won, setWon] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const { triggerReward } = useGingimBooster();

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

    const startNewGame = (newSettings = settings, round = 1) => {
        const newCards = generateCards(newSettings.pairCount, newSettings.selectedLetters);
        setGameState({
            cards: newCards,
            selectedCards: [],
            matches: 0,
            isLocked: false,
        });
        setWon(false);
        setCurrentRound(round);
        setNextRoundTimer(null);
    };

    useEffect(() => {
        let interval: number;
        if (nextRoundTimer !== null && nextRoundTimer > 0) {
            interval = window.setInterval(() => {
                setNextRoundTimer((prev) => {
                    if (prev === null || prev <= 1) {
                        clearInterval(interval);
                        // Start next round
                        const nextRound = currentRound + 1;
                        startNewGame(settings, nextRound);
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [nextRoundTimer, settings, currentRound]);

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

                    if (gameState.matches + 1 === settings.pairCount) {
                        setWon(true);
                        playWin();
                        gameEvents.emit('gameComplete', {
                            matches: gameState.matches + 1,
                            totalPairs: settings.pairCount,
                            timestamp: new Date().toISOString()
                        });
                        triggerReward();

                        // Handle Loop Logic
                        const hasNextRound = settings.loopMode === 'infinite' || currentRound < settings.totalRounds;

                        if (hasNextRound) {
                            setNextRoundTimer(5); // 5 seconds countdown
                        }
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
                        <span className="font-bold text-indigo-600 text-xl">{gameState.matches}/{settings.pairCount}</span>
                    </div>
                    {settings.loopMode === 'finite' && settings.totalRounds > 1 && (
                        <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
                            <span className="text-gray-600 ml-2">סבב:</span>
                            <span className="font-bold text-purple-600 text-xl">{currentRound}/{settings.totalRounds}</span>
                        </div>
                    )}
                    {settings.loopMode === 'infinite' && (
                        <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
                            <span className="text-gray-600 ml-2">סבב:</span>
                            <span className="font-bold text-purple-600 text-xl">{currentRound}</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="bg-gray-100 hover:bg-gray-200 text-indigo-600 p-2 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
                        title="הגדרות"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => startNewGame()}
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
                    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-bounce-in relative z-50 max-w-md w-full mx-4">
                        <img src={winnerLogo} alt="Winner" className="w-32 h-32 mx-auto mb-4 object-contain drop-shadow-lg" />
                        <h2 className="text-5xl font-bold text-green-500 mb-4">כל הכבוד!</h2>
                        <p className="text-2xl text-gray-600 mb-8">מצאת את כל הזוגות!</p>

                        {nextRoundTimer !== null ? (
                            <div className="mb-6">
                                <p className="text-lg text-indigo-600 font-bold mb-2">הסבב הבא מתחיל בעוד:</p>
                                <div className="text-4xl font-mono font-bold text-indigo-800">{nextRoundTimer}</div>
                                <button
                                    onClick={() => setNextRoundTimer(1)} // Trigger immediate next round
                                    className="mt-4 text-sm text-gray-500 hover:text-indigo-600 underline"
                                >
                                    דלג והתחל מיד
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => startNewGame(settings, 1)}
                                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-xl font-bold shadow-lg transition-transform hover:scale-105 w-full"
                            >
                                שחק שוב
                            </button>
                        )}
                    </div>
                </div>
            )}

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={(pairCount, selectedLetters, loopMode, totalRounds) => {
                    const newSettings = { pairCount, selectedLetters, loopMode, totalRounds };
                    setSettings(newSettings);
                    setIsSettingsOpen(false);
                    startNewGame(newSettings, 1);
                }}
                initialPairCount={settings.pairCount}
                initialSelectedLetters={settings.selectedLetters}
                initialLoopMode={settings.loopMode}
                initialTotalRounds={settings.totalRounds}
            />
        </div>
    );
};

export default Game;
