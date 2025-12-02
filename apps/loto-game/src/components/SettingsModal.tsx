import React, { useState, useEffect } from 'react';
import { LETTERS } from '../utils/gameLogic';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (pairCount: number, selectedLetters: string[]) => void;
    initialPairCount: number;
    initialSelectedLetters: string[];
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialPairCount,
    initialSelectedLetters,
}) => {
    const [pairCount, setPairCount] = useState(initialPairCount);
    const [selectedLetters, setSelectedLetters] = useState<string[]>(initialSelectedLetters);

    useEffect(() => {
        if (isOpen) {
            setPairCount(initialPairCount);
            setSelectedLetters(initialSelectedLetters);
        }
    }, [isOpen, initialPairCount, initialSelectedLetters]);

    if (!isOpen) return null;

    const handleLetterToggle = (letter: string) => {
        setSelectedLetters((prev) =>
            prev.includes(letter)
                ? prev.filter((l) => l !== letter)
                : [...prev, letter]
        );
    };

    const handleSelectAll = () => {
        setSelectedLetters([...LETTERS]);
    };

    const handleDeselectAll = () => {
        setSelectedLetters([]);
    };

    const handleSave = () => {
        // Validation: Ensure at least 2 letters are selected
        if (selectedLetters.length < 2) {
            alert('יש לבחור לפחות 2 אותיות');
            return;
        }

        // Validation: Ensure pair count is not more than available letters
        const maxPairs = selectedLetters.length;
        const finalPairCount = Math.min(pairCount, maxPairs);

        onSave(finalPairCount, selectedLetters);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-bold">הגדרות משחק</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">&times;</button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-grow space-y-8">
                    {/* Pair Count Section */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">מספר זוגות ({pairCount})</h3>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="2"
                                max={Math.min(20, selectedLetters.length)}
                                value={pairCount}
                                onChange={(e) => setPairCount(parseInt(e.target.value))}
                                className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <span className="font-bold text-indigo-600 min-w-[2rem] text-center">{pairCount}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            מקסימום הזוגות מוגבל על ידי מספר האותיות שנבחרו.
                        </p>
                    </section>

                    {/* Letters Selection Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">בחירת אותיות ({selectedLetters.length})</h3>
                            <div className="space-x-2 space-x-reverse text-sm">
                                <button
                                    onClick={handleSelectAll}
                                    className="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50"
                                >
                                    בחר הכל
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={handleDeselectAll}
                                    className="text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded hover:bg-gray-100"
                                >
                                    נקה הכל
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                            {LETTERS.map((letter) => {
                                const isSelected = selectedLetters.includes(letter);
                                return (
                                    <button
                                        key={letter}
                                        onClick={() => handleLetterToggle(letter)}
                                        className={`
                                            aspect-square rounded-lg font-bold text-lg flex items-center justify-center transition-all
                                            ${isSelected
                                                ? 'bg-indigo-600 text-white shadow-md scale-105'
                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
                                        `}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                    >
                        שמור והתחל מחדש
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
