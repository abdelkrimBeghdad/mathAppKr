import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

/**
 * useProgressiveMastery Hook
 * Core engine for adding serious, progressive difficulty to any lab.
 * 
 * @param {Object} config 
 * @param {number} config.maxLevels - Total number of difficulty levels (usually 3)
 * @param {number} config.streakToPass - Consecutive correct answers needed to level up
 * @param {number} config.mistakesToDrop - Consecutive mistakes that trigger a level drop
 */
export default function useProgressiveMastery({ 
    maxLevels = 3, 
    streakToPass = 2, 
    mistakesToDrop = 2 
} = {}) {
    const [level, setLevel] = useState(1);
    const [streak, setStreak] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [isMastered, setIsMastered] = useState(false);
    const [statusText, setStatusText] = useState(''); // 'LEVEL_UP', 'LEVEL_DROP', 'STREAK', 'MISTAKE'

    const handleSuccess = useCallback(() => {
        const newStreak = streak + 1;
        setMistakes(0); // Reset mistakes on success

        if (newStreak >= streakToPass) {
            if (level < maxLevels) {
                // Level Up
                setLevel(l => l + 1);
                setStreak(0);
                setStatusText('LEVEL_UP');
                // Mini celebration for level up
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#4ade80', '#fbbf24'] });
                return 'LEVEL_UP';
            } else {
                // Fully Mastered
                setIsMastered(true);
                setStreak(newStreak);
                setStatusText('MASTERED');
                // Huge celebration
                confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
                return 'MASTERED';
            }
        } else {
            // Streak Up
            setStreak(newStreak);
            setStatusText('STREAK_UP');
            return 'STREAK_UP';
        }
    }, [streak, level, maxLevels, streakToPass]);

    const handleFailure = useCallback(() => {
        const newMistakes = mistakes + 1;
        setStreak(0); // Brutal: any mistake resets the streak. Serious learning!

        if (newMistakes >= mistakesToDrop && level > 1) {
            // Drop a level due to poor performance
            setLevel(l => l - 1);
            setMistakes(0);
            setStatusText('LEVEL_DROP');
            return 'LEVEL_DROP';
        } else {
            setMistakes(newMistakes);
            setStatusText('MISTAKE');
            return 'MISTAKE';
        }
    }, [mistakes, level, mistakesToDrop]);

    const resetMastery = useCallback(() => {
        setLevel(1);
        setStreak(0);
        setMistakes(0);
        setIsMastered(false);
        setStatusText('');
    }, []);

    // Calculate overall progress percentage (0 to 100)
    // Formula: (completed levels * streakToPass + current streak) / total required
    const totalRequiredAnswers = maxLevels * streakToPass;
    const currentAbsoluteProgress = ((level - 1) * Math.max(1, streakToPass)) + Math.min(streak, streakToPass);
    const progressPercentage = Math.min(100, Math.max(0, (currentAbsoluteProgress / totalRequiredAnswers) * 100));

    return {
        level,
        streak,
        mistakes,
        isMastered,
        statusText,
        progressPercentage,
        handleSuccess,
        handleFailure,
        resetMastery,
        config: { maxLevels, streakToPass, mistakesToDrop }
    };
}
