/**
 * Dynamic Difficulty Engine
 * Adjusts problem parameters based on student performance history
 */

export const difficultyEngine = {
    /**
     * Calculate difficulty level based on lab progress data
     * @param {Object} progress - { best_score, attempts, completed_at }
     * @returns {number} Level (1: Easy, 2: Medium, 3: Hard)
     */
    getLevel: (progress) => {
        if (!progress || progress.attempts === 0) return 1;
        
        const score = progress.best_score || 0;
        
        if (score >= 90) return 3; // Mastery
        if (score >= 60) return 2; // Intermediate
        return 1; // Beginner
    },

    /**
     * Get parameters for a specific lab type and level
     * @param {string} labType - 'expansion', 'roots', etc.
     * @param {number} level - 1, 2, or 3
     */
    getParams: (labType, level) => {
        const configs = {
            'expansion': {
                1: { maxCoeff: 5, useNegative: false, terms: 1 },
                2: { maxCoeff: 10, useNegative: true, terms: 1 },
                3: { maxCoeff: 15, useNegative: true, terms: 2 }
            },
            'roots': {
                1: { maxSquare: 100, complexity: 'simple' },
                2: { maxSquare: 400, complexity: 'medium' },
                3: { maxSquare: 900, complexity: 'complex' }
            },
            'pgcd': {
                1: { pairs: [[12, 18], [15, 25], [14, 21], [27, 18]] },
                2: { pairs: [[24, 36], [20, 30], [32, 48], [45, 30]] },
                3: { pairs: [[40, 60], [48, 72], [54, 81], [64, 96]] }
            }
            // Add more lab types as needed
        };

        return configs[labType]?.[level] || configs[labType]?.[1] || { level };
    }
};
