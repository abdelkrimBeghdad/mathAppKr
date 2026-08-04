/**
 * Shared small utilities used by every difficulty-domain generator module
 * (algebra.js, geometry.js, trig.js, vectors.js, stats.js).
 * Kept in one tiny file so all domains stay in sync on RNG helpers and
 * the shared Pythagorean-triple bank, without re-duplicating this code
 * (and without pulling in unrelated domain code just to get a helper).
 */

export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const round2 = (n) => Math.round(n * 100) / 100;

/** Greatest common divisor — used to build "nice" Pythagorean triples, fractions, etc. */
export function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

/** A small bank of Pythagorean triples (a² + b² = c²) reused across geometry/trig generators */
export const PYTHAGOREAN_TRIPLES = [
    [3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15],
    [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41],
];

/** Converts a (possibly negative) integer exponent to unicode superscript, e.g. -2 → ⁻² */
export function toSup(n) {
    const map = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
    return String(n).split('').map(ch => map[ch] ?? ch).join('');
}

/**
 * Builds a domain-scoped engine with the exact same shape/behavior as the
 * top-level difficultyEngine (getLevel, getParams, generateChallenge,
 * generateChallengeSet), backed only by that domain's own PARAMS/GENERATORS.
 *
 * Why: a lab component that only ever needs, say, the trig generators can
 * import trig.js directly and get a tiny bundle instead of pulling in every
 * other domain's code through the shared difficultyEngine.js entry point.
 * Each domain file calls this once and exports the result as `difficultyEngine`.
 */
export function createEngine(PARAMS, GENERATORS) {
    const engine = {
        getLevel: (progress) => {
            if (!progress || progress.attempts === 0) return 1;
            const score = progress.best_score || 0;
            if (score >= 90) return 3;
            if (score >= 60) return 2;
            return 1;
        },
        getParams: (labType, level) => {
            return PARAMS[labType]?.[level] || PARAMS[labType]?.[1] || { level };
        },
        generateChallenge: (labType, level = 1) => {
            const params = engine.getParams(labType, level);
            const generator = GENERATORS[labType];
            if (!generator) {
                throw new Error(`No challenge generator registered for labType "${labType}"`);
            }
            try {
                return generator(params);
            } catch (err) {
                console.error(`[difficultyEngine] generator for "${labType}" (level ${level}) threw:`, err);
                throw new Error(`Challenge generator for "${labType}" failed: ${err.message}`);
            }
        },
        generateChallengeSet: (labType, level = 1, count = 3) => {
            const set = [];
            for (let i = 0; i < count; i++) {
                const span = Math.max(1, count - 1);
                const escalation = Math.min(3, level + Math.round((i / span) * (3 - level)));
                set.push(engine.generateChallenge(labType, escalation));
            }
            return set;
        },
    };
    return engine;
}
