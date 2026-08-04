/**
 * Dynamic Difficulty Engine
 * Adjusts problem parameters based on student performance history,
 * and generates randomized challenges so each attempt is unique.
 *
 * ARCHITECTURE NOTE (refactor):
 * This used to be a single ~1700-line file holding every lab's parameters
 * AND every generator function. That was risky in two concrete ways:
 *   1) A single syntax mistake anywhere in the file broke the build for
 *      EVERY lab in the app (all ~90 labs import this module).
 *   2) It was one large chunk every lab paid to download, even labs that
 *      only ever touch a handful of the ~60 generators inside it.
 * The params/generators are now split across small per-domain files under
 * ./difficulty/ (algebra, geometry, trig, vectors, stats). This file just
 * merges them and keeps the exact same public API (getLevel, getParams,
 * generateChallenge, generateChallengeSet) so no calling lab component
 * needs to change. Runtime errors thrown by an individual generator are
 * also now caught here and logged clearly instead of propagating as a
 * raw crash (React's LabErrorBoundary in MasteryWorld.jsx already isolates
 * a crash to the single lab being played — this just makes failures easier
 * to diagnose and guarantees a safe, typed error instead of a random throw).
 */

import * as Algebra from './difficulty/algebra.js';
import * as Geometry from './difficulty/geometry.js';
import * as Trig from './difficulty/trig.js';
import * as Vectors from './difficulty/vectors.js';
import * as Stats from './difficulty/stats.js';

const DOMAINS = [Algebra, Geometry, Trig, Vectors, Stats];

// Merge every domain's PARAMS/GENERATORS into the same flat maps the old
// monolithic file exposed, so labType lookups behave exactly as before.
const configs = Object.assign({}, ...DOMAINS.map(d => d.PARAMS));
const GENERATORS = Object.assign({}, ...DOMAINS.map(d => d.GENERATORS));

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
     * Get raw parameters for a specific lab type and level.
     * Kept for backward compatibility with labs that consume params directly.
     */
    getParams: (labType, level) => {
        return configs[labType]?.[level] || configs[labType]?.[1] || { level };
    },

    /**
     * Generate a ready-to-use challenge object for a given lab type and level.
     * This is the function labs should call directly — it returns the full
     * { q, a/ans, hint, ... } shape each lab already expects, but with
     * randomized numbers every time instead of a fixed array.
     *
     * @param {string} labType
     * @param {number} level
     * @returns {Object} challenge
     */
    generateChallenge: (labType, level = 1) => {
        const params = difficultyEngine.getParams(labType, level);
        const generator = GENERATORS[labType];
        if (!generator) {
            throw new Error(`No challenge generator registered for labType "${labType}"`);
        }
        try {
            return generator(params);
        } catch (err) {
            // A single broken generator must never take down the rest of the
            // app — surface a clear, labeled error (caught upstream by
            // LabErrorBoundary) instead of an opaque stack trace.
            console.error(`[difficultyEngine] generator for "${labType}" (level ${level}) threw:`, err);
            throw new Error(`Challenge generator for "${labType}" failed: ${err.message}`);
        }
    },

    /**
     * Generate N challenges at once (used for the "3-5 progressive challenges"
     * improvement — easy → medium → hard within a single lab session).
     * @param {string} labType
     * @param {number} level - base level; challenges escalate from level..min(level+1,3)
     * @param {number} count
     */
    generateChallengeSet: (labType, level = 1, count = 3) => {
        const set = [];
        for (let i = 0; i < count; i++) {
            // إصلاح: الصيغة القديمة (level + floor((i/count)*2)) لم تكن تصل أبداً
            // للمستوى 3 عندما يبدأ الطالب من level=1 مع count=3 (كانت تعطي [1,1,2] فقط).
            // الصيغة الجديدة تضمن تصاعداً حقيقياً: من `level` إلى 3 خلال آخر سؤال في المجموعة،
            // بغض النظر عن قيمة count أو level الابتدائية.
            const span = Math.max(1, count - 1);
            const escalation = Math.min(3, level + Math.round((i / span) * (3 - level)));
            set.push(difficultyEngine.generateChallenge(labType, escalation));
        }
        return set;
    },
};
