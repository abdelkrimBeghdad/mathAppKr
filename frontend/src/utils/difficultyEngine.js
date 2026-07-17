/**
 * Dynamic Difficulty Engine
 * Adjusts problem parameters based on student performance history,
 * and generates randomized challenges so each attempt is unique.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Small utilities used by generators below
// ─────────────────────────────────────────────────────────────────────────────
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const round2 = (n) => Math.round(n * 100) / 100;

/** Greatest common divisor — used to build "nice" Pythagorean triples, fractions, etc. */
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

/** A small bank of Pythagorean triples (a² + b² = c²) reused across geometry/trig generators */
const PYTHAGOREAN_TRIPLES = [
    [3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15],
    [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41],
];

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
        const configs = {
            expansion: {
                1: { maxCoeff: 5, useNegative: false, terms: 1 },
                2: { maxCoeff: 10, useNegative: true, terms: 1 },
                3: { maxCoeff: 15, useNegative: true, terms: 2 },
            },
            roots: {
                1: { maxSquare: 100, complexity: 'simple' },
                2: { maxSquare: 400, complexity: 'medium' },
                3: { maxSquare: 900, complexity: 'complex' },
            },
            pgcd: {
                1: { pairs: [[12, 18], [15, 25], [14, 21], [27, 18]] },
                2: { pairs: [[24, 36], [20, 30], [32, 48], [45, 30]] },
                3: { pairs: [[40, 60], [48, 72], [54, 81], [64, 96]] },
            },

            // ── newly added configs ───────────────────────────────────────────────
            'stat-mean': {
                1: { count: 3, max: 20 },
                2: { count: 5, max: 50 },
                3: { count: 7, max: 100 },
            },
            'stat-freq': {
                1: { count: 8, distinct: 3, max: 12 },
                2: { count: 12, distinct: 4, max: 20 },
                3: { count: 16, distinct: 5, max: 30 },
            },
            'stat-cumulative': {
                1: { terms: 3, max: 8 },
                2: { terms: 4, max: 12 },
                3: { terms: 5, max: 20 },
            },
            'stat-chart': {
                1: { totalRange: [10, 20] },
                2: { totalRange: [20, 50] },
                3: { totalRange: [50, 100] },
            },
            trig: {
                1: { triples: PYTHAGOREAN_TRIPLES.slice(0, 3) }, // 3-4-5, 6-8-10, 5-12-13
                2: { triples: PYTHAGOREAN_TRIPLES.slice(2, 6) },
                3: { triples: PYTHAGOREAN_TRIPLES.slice(4) },
            },
            'trig-angle': {
                1: { angles: [30, 45, 60] },
                2: { angles: [0, 90, 30, 45, 60] },
                3: { angles: [0, 30, 45, 60, 90, 120, 135, 150] },
            },
            powers: {
                1: { maxExp: 4, maxBase: 5, ops: ['mul', 'pow'] },
                2: { maxExp: 8, maxBase: 10, ops: ['mul', 'div', 'pow'] },
                3: { maxExp: 10, maxBase: 10, ops: ['mul', 'div', 'pow'], allowNegativeExp: true },
            },
            fraction: {
                1: { maxVal: 30, minFactor: 2 },
                2: { maxVal: 80, minFactor: 2 },
                3: { maxVal: 150, minFactor: 3 },
            },
            'scientific-notation': {
                1: { magnitudeRange: [2, 4] },
                2: { magnitudeRange: [-3, 5] },
                3: { magnitudeRange: [-6, 8] },
            },
            coprime: {
                1: { max: 20 },
                2: { max: 50 },
                3: { max: 100 },
            },
        };

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
        return generator(params);
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
            // Escalate difficulty slightly across the set: first third at `level`,
            // middle third at level+1 (capped at 3), last third at level+2 (capped at 3)
            const escalation = Math.min(3, level + Math.floor((i / count) * 2));
            set.push(difficultyEngine.generateChallenge(labType, escalation));
        }
        return set;
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Generators — one function per labType, each returns a full challenge object
// matching the shape the existing lab components already expect.
// ─────────────────────────────────────────────────────────────────────────────

const GENERATORS = {
    // ── StatMeanLab ───────────────────────────────────────────────────────────
    'stat-mean': ({ count, max }) => {
        const data = Array.from({ length: count }, () => randInt(1, max));
        const sum = data.reduce((a, b) => a + b, 0);
        const mean = round2(sum / count);
        return {
            type: 'mean',
            data,
            q: `احسب الوسط الحسابي للقيم التالية: ${data.join('، ')}`,
            ans: mean,
            hint: `(${data.join(' + ')}) ÷ ${count}`,
        };
    },

    // ── StatFreqLab ───────────────────────────────────────────────────────────
    'stat-freq': ({ count, distinct, max }) => {
        const values = Array.from({ length: distinct }, () => randInt(1, max));
        const uniqueValues = [...new Set(values)];
        while (uniqueValues.length < distinct) uniqueValues.push(randInt(1, max));

        const data = [];
        const correct = {};
        uniqueValues.forEach(v => { correct[v] = 0; });

        for (let i = 0; i < count; i++) {
            const v = pick(uniqueValues);
            data.push(v);
            correct[v] = (correct[v] || 0) + 1;
        }

        return {
            data,
            q: `رتب هذه النقاط في جدول تكراري. كم مرة تكرر كل رقم من: ${uniqueValues.join('، ')}؟`,
            correct,
            hint: 'قم بعدّ كل رقم بتركيز عالي.',
        };
    },

    // ── StatCumulativeLab ─────────────────────────────────────────────────────
    'stat-cumulative': ({ terms, max }) => {
        const freqs = Array.from({ length: terms }, () => randInt(1, max));
        const correct = [];
        let running = 0;
        for (const f of freqs) { running += f; correct.push(running); }
        return {
            freqs,
            q: 'احسب التكرار المجمع الصاعد لهذه السلسلة.',
            correct,
            hint: 'ابدأ بأول تكرار، ثم أضف إليه التكرار التالي وهكذا.',
        };
    },

    // ── StatChartLab (pie-chart angle) ───────────────────────────────────────
    'stat-chart': ({ totalRange }) => {
        const total = randInt(totalRange[0], totalRange[1]);
        // pick a value that divides evenly into a "nice" angle when possible
        const divisors = [1, 2, 4, 5, 8, 10].filter(d => total % d === 0 && total / d >= 1);
        const value = divisors.length
            ? total / pick(divisors)
            : randInt(1, total - 1);
        const ans = Math.round((value / total) * 360);
        return {
            q: `إذا كان التكرار الكلي هو ${total}، وتكرار القيمة هو ${value}. كم تكون زاوية قطاعها في الدائرة؟`,
            ans,
            hint: `(${value} ÷ ${total}) × 360 = ?`,
        };
    },

    // ── TrigSinLab / TrigCosLab / TrigTanLab share the same triple bank ──────
    'trig-sin': ({ triples }) => {
        const [opp, adj, hyp] = pick(triples);
        return {
            opp, hyp,
            ans: round2(opp / hyp),
            q: `إذا كان الضلع المقابل للزاوية ${opp}cm والوتر ${hyp}cm، احسب Sin الزاوية.`,
            triangle: { a: { x: 0, y: opp }, b: { x: adj, y: 0 }, c: { x: 0, y: 0 } },
        };
    },
    'trig-cos': ({ triples }) => {
        const [opp, adj, hyp] = pick(triples);
        return {
            adj, hyp,
            ans: round2(adj / hyp),
            q: `إذا كان طول المجاور ${adj}cm والوتر ${hyp}cm، احسب Cos الزاوية.`,
            triangle: { a: { x: 0, y: opp }, b: { x: adj, y: 0 }, c: { x: 0, y: 0 } },
        };
    },
    'trig-tan': ({ triples }) => {
        const [opp, adj] = pick(triples);
        return {
            opp, adj,
            ans: round2(opp / adj),
            q: `إذا كان المقابل ${opp}cm والمجاور ${adj}cm، احسب Tan الزاوية.`,
            triangle: { a: { x: 0, y: opp }, b: { x: adj, y: 0 }, c: { x: 0, y: 0 } },
        };
    },

    // ── TrigAngleLab ──────────────────────────────────────────────────────────
    'trig-angle': ({ angles }) => {
        const angle = pick(angles);
        const ratioFns = {
            sin: { fn: 'sin(α)', value: round2(Math.sin(angle * Math.PI / 180)) },
            cos: { fn: 'cos(α)', value: round2(Math.cos(angle * Math.PI / 180)) },
            tan: { fn: 'tan(α)', value: angle === 90 ? null : round2(Math.tan(angle * Math.PI / 180)) },
        };
        const validRatios = Object.entries(ratioFns).filter(([, r]) => r.value !== null);
        const [name, ratio] = pick(validRatios);
        return {
            q: `إذا كان ${ratio.fn} = ${ratio.value}، فما هو قيس الزاوية α بالدرجات؟`,
            ans: angle,
            hint: `استخدم القيم المثلثية الخاصة للزوايا الشهيرة (30°، 45°، 60°، 90°).`,
        };
    },

    // ── TrigLengthLab ─────────────────────────────────────────────────────────
    'trig-length': ({ angles }) => {
        const angle = pick(angles.filter(a => a > 0 && a < 90));
        const hyp = pick([10, 12, 15, 20]);
        const ratio = pick(['Sin', 'Cos']);
        const trigVal = ratio === 'Sin'
            ? Math.sin(angle * Math.PI / 180)
            : Math.cos(angle * Math.PI / 180);
        const ans = round2(hyp * trigVal);
        const side = ratio === 'Sin' ? 'مقابل' : 'مجاور';
        return {
            q: `احسب طول ال${side} x إذا كان الوتر ${hyp}cm والزاوية ${angle}° (علماً أن ${ratio.toLowerCase()} ${angle} = ${round2(trigVal)})`,
            given: `وتر = ${hyp}`,
            needed: `${side} = x`,
            correctRatio: ratio,
            ans,
        };
    },

    // ── PythHypotenuseLab / PythLegLab / PythVerifyLab ───────────────────────
    'pyth-hypotenuse': ({ triples }) => {
        const [a, b, c] = pick(triples);
        return {
            a, b, ans: c,
            q: `مثلث قائم الزاوية ضلعاه ${a}cm و${b}cm. احسب طول الوتر.`,
            hint: `الوتر² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}`,
        };
    },
    'pyth-leg': ({ triples }) => {
        const [a, b, c] = pick(triples);
        const knownIsA = Math.random() > 0.5;
        const known = knownIsA ? a : b;
        const unknown = knownIsA ? b : a;
        return {
            known, hyp: c, ans: unknown,
            q: `مثلث قائم الزاوية وتره ${c}cm وأحد ضلعيه ${known}cm. احسب طول الضلع الآخر.`,
            hint: `الضلع² = ${c}² − ${known}² = ${c * c} − ${known * known} = ${c * c - known * known}`,
        };
    },
    'pyth-verify': ({ triples }) => {
        const isRight = Math.random() > 0.4;
        let a, b, c;
        if (isRight) {
            [a, b, c] = pick(triples);
        } else {
            // perturb one side so it's NOT a right triangle
            [a, b, c] = pick(triples);
            c = c + pick([1, 2, -1, -2]);
        }
        return {
            a, b, c, ans: isRight ? 'نعم' : 'لا',
            q: `هل المثلث الذي أضلاعه ${a}cm، ${b}cm، ${c}cm قائم الزاوية؟`,
            hint: `تحقق هل ${a}² + ${b}² = ${c}²  →  ${a * a + b * b} مقابل ${c * c}`,
        };
    },

    // ── PowersLab ─────────────────────────────────────────────────────────────
    powers: ({ maxExp, maxBase, ops, allowNegativeExp }) => {
        const base = randInt(2, maxBase);
        const op = pick(ops);

        if (op === 'mul') {
            const e1 = randInt(1, maxExp);
            const e2 = allowNegativeExp && Math.random() > 0.7 ? -randInt(1, maxExp) : randInt(1, maxExp);
            return {
                q: `${base}${toSup(e1)} × ${base}${toSup(e2)} = ${base}^?`,
                a: String(e1 + e2),
                hint: `عند الضرب نجمع الأسس: ${e1} + (${e2}) = ?`,
            };
        }
        if (op === 'div') {
            const e2 = randInt(1, maxExp);
            const e1 = e2 + randInt(1, maxExp); // ensures e1 > e2, positive result
            return {
                q: `${base}${toSup(e1)} ÷ ${base}${toSup(e2)} = ${base}^?`,
                a: String(e1 - e2),
                hint: `عند القسمة نطرح الأسس: ${e1} − ${e2} = ?`,
            };
        }
        // power of a power
        const e1 = randInt(2, Math.max(2, Math.floor(maxExp / 2)));
        const e2 = randInt(2, Math.max(2, Math.floor(maxExp / 2)));
        return {
            q: `(${base}${toSup(e1)})${toSup(e2)} = ${base}^?`,
            a: String(e1 * e2),
            hint: `قوة القوة هي جداء الأسين: ${e1} × ${e2} = ?`,
        };
    },

    // ── FractionSimplifyLab ───────────────────────────────────────────────────
    fraction: ({ maxVal, minFactor }) => {
        const factor = randInt(minFactor, 6);
        const simplifiedNum = randInt(2, Math.floor(maxVal / factor));
        const simplifiedDen = randInt(2, Math.floor(maxVal / factor));
        if (gcd(simplifiedNum, simplifiedDen) !== 1) {
            // ensure already-simplified target fraction is coprime; retry simply by bumping den
            return GENERATORS.fraction({ maxVal, minFactor });
        }
        return {
            num: simplifiedNum * factor,
            den: simplifiedDen * factor,
        };
    },

    // ── ScientificNotationLab ─────────────────────────────────────────────────
    'scientific-notation': ({ magnitudeRange }) => {
        const exp = randInt(magnitudeRange[0], magnitudeRange[1]);
        const mantissa = round2(1 + Math.random() * 8.9); // 1.00–9.90
        const value = mantissa * Math.pow(10, exp);
        // Format the plain-number question string the way the lab expects (no exponent notation)
        const q = exp >= 0
            ? String(Math.round(value * Math.pow(10, Math.max(0, 2 - exp))) / Math.pow(10, Math.max(0, 2 - exp)))
            : value.toFixed(Math.abs(exp) + 2);
        return {
            q,
            a: String(mantissa),
            n: String(exp),
            hint: exp >= 0
                ? `حرك الفاصلة ${exp} مراتب لليسار حتى تصل لرقم بين 1 و10.`
                : `حرك الفاصلة ${Math.abs(exp)} مراتب لليمين، الأس سيكون سالباً.`,
        };
    },

    // ── CoprimeLab ────────────────────────────────────────────────────────────
    coprime: ({ max }) => {
        let a, b;
        do {
            a = randInt(2, max);
            b = randInt(2, max);
        } while (a === b);
        const isCoprime = gcd(a, b) === 1;
        return {
            a, b,
            ans: isCoprime ? 'نعم' : 'لا',
            q: `هل العددان ${a} و ${b} أوليان فيما بينهما؟`,
            hint: `احسب القاسم المشترك الأكبر لهما. إن كان 1 فهما أوليان فيما بينهما.`,
        };
    },
};

/** Converts a (possibly negative) integer exponent to unicode superscript, e.g. -2 → ⁻² */
function toSup(n) {
    const map = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
    return String(n).split('').map(ch => map[ch] ?? ch).join('');
}
