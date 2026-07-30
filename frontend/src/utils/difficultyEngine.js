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
            // إصلاح خلل حقيقي: كانت هذه المفاتيح غائبة فتتسبب في تعطل المختبرات الثلاثة
            // عند التشغيل الفعلي (getParams كان يرجع {level} بلا triples فيتعطل الجنريتر).
            'trig-sin': {
                1: { triples: PYTHAGOREAN_TRIPLES.slice(0, 3) },
                2: { triples: PYTHAGOREAN_TRIPLES.slice(2, 6) },
                3: { triples: PYTHAGOREAN_TRIPLES.slice(4) },
            },
            'trig-cos': {
                1: { triples: PYTHAGOREAN_TRIPLES.slice(0, 3) },
                2: { triples: PYTHAGOREAN_TRIPLES.slice(2, 6) },
                3: { triples: PYTHAGOREAN_TRIPLES.slice(4) },
            },
            'trig-tan': {
                1: { triples: PYTHAGOREAN_TRIPLES.slice(0, 3) },
                2: { triples: PYTHAGOREAN_TRIPLES.slice(2, 6) },
                3: { triples: PYTHAGOREAN_TRIPLES.slice(4) },
            },
            'trig-angle': {
                1: { angles: [30, 45, 60] },
                2: { angles: [0, 90, 30, 45, 60] },
                3: { angles: [0, 30, 45, 60, 90, 120, 135, 150] },
            },
            // إصلاح خلل حقيقي: trig-length كان بلا مفتاح مسجّل إطلاقاً (تعطل عند التشغيل)
            'trig-length': {
                1: { angles: [30, 45, 60] },
                2: { angles: [0, 90, 30, 45, 60] },
                3: { angles: [0, 30, 45, 60, 90, 120, 135, 150] },
            },
            // إصلاح خلل حقيقي: مختبرات فيثاغورس الثلاثة (Hypotenuse/Leg/Verify) لم يكن
            // لديها أي مفتاح إعدادات مسجّل إطلاقاً، فكانت تتعطل عند كل محاولة تشغيل.
            'pyth-hypotenuse': {
                1: { triples: PYTHAGOREAN_TRIPLES.slice(0, 3) },
                2: { triples: PYTHAGOREAN_TRIPLES.slice(2, 6) },
                3: { triples: PYTHAGOREAN_TRIPLES.slice(4) },
            },
            'pyth-leg': {
                1: { triples: PYTHAGOREAN_TRIPLES.slice(0, 3) },
                2: { triples: PYTHAGOREAN_TRIPLES.slice(2, 6) },
                3: { triples: PYTHAGOREAN_TRIPLES.slice(4) },
            },
            'pyth-verify': {
                1: { triples: PYTHAGOREAN_TRIPLES.slice(0, 3) },
                2: { triples: PYTHAGOREAN_TRIPLES.slice(2, 6) },
                3: { triples: PYTHAGOREAN_TRIPLES.slice(4) },
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

            // ── pilot batch: guided-step algebra & number-theory labs ─────────────
            'sys-addition': {
                1: { coeffMax: 3, valMax: 5, multipliers: [2] },
                2: { coeffMax: 5, valMax: 8, multipliers: [2, 3] },
                3: { coeffMax: 8, valMax: 10, multipliers: [2, 3, 4], allowNegative: true },
            },
            'sys-substitution': {
                1: { coeffMax: 3, valMax: 5 },
                2: { coeffMax: 5, valMax: 8 },
                3: { coeffMax: 8, valMax: 10, allowNegative: true },
            },
            'pgcd-euclidean': {
                1: { gcdChoices: [4, 6, 8], multMax: 4 },
                2: { gcdChoices: [9, 12, 15], multMax: 6 },
                3: { gcdChoices: [18, 21, 24, 27], multMax: 8 },
            },
            // إصلاح خلل حقيقي: مفتاح 'linear' لم يكن مسجّلاً إطلاقاً، فكانت مختبرات
            // LinearFormula/Graph/Image تستخدم نفس نطاق الصعوبة الثابت دائماً بلا أي تصاعد حقيقي.
            linear: {
                1: { maxCoeff: 4, maxInput: 5 },
                2: { maxCoeff: 7, maxInput: 8 },
                3: { maxCoeff: 10, maxInput: 12 },
            },
            'vec-parallelogram': {
                1: { range: 2 },
                2: { range: 3 },
                3: { range: 4 },
            },
            'vec-random-add': {
                1: { range: 2 },
                2: { range: 3 },
                3: { range: 4 },
            },
            'vec-read': {
                1: { range: 3 },
                2: { range: 4 },
                3: { range: 4 },
            },
            'vec-calc': {
                1: { range: 5 },
                2: { range: 8 },
                3: { range: 12 },
            },
            'vec-midpoint': {
                1: { range: 4 },
                2: { range: 6 },
                3: { range: 9 },
            },
            'vec-distance': {
                1: { triples: PYTHAGOREAN_TRIPLES.slice(0, 3), offsetRange: 3 },
                2: { triples: PYTHAGOREAN_TRIPLES.slice(2, 6), offsetRange: 5 },
                3: { triples: PYTHAGOREAN_TRIPLES.slice(4), offsetRange: 7 },
            },
            'vec-same-end': {
                1: { range: 2 },
                2: { range: 3 },
                3: { range: 4 },
            },
            'thales-shadow': {
                1: { stickMax: 3, ratioMax: 4 },
                2: { stickMax: 5, ratioMax: 8 },
                3: { stickMax: 8, ratioMax: 15 },
            },
            'thales-problems': {
                1: { maxBase: 4, maxRatio: 4 },
                2: { maxBase: 6, maxRatio: 6 },
                3: { maxBase: 9, maxRatio: 9 },
            },
            'ineq-solve': {
                1: { maxA: 3, maxB: 6, allowNegativeA: false },
                2: { maxA: 5, maxB: 10, allowNegativeA: true },
                3: { maxA: 8, maxB: 15, allowNegativeA: true },
            },
            'ineq-graph': {
                1: { range: 4 },
                2: { range: 5 },
                3: { range: 5 },
            },
            'divisor-props': {
                1: { nChoices: [3, 4, 5], kMax: 5 },
                2: { nChoices: [4, 5, 6, 7], kMax: 8 },
                3: { nChoices: [6, 7, 8, 9], kMax: 12 },
            },
            'eq-product': {
                1: { range: 4 },
                2: { range: 6 },
                3: { range: 9 },
            },
            'sys-graph': {
                1: { mRange: 2, bRange: 3 },
                2: { mRange: 3, bRange: 5 },
                3: { mRange: 4, bRange: 6 },
            },
            'sys-strategy': {
                1: { maxCoeff: 5 },
                2: { maxCoeff: 7 },
                3: { maxCoeff: 9 },
            },
            'geo-volume': {
                1: { range: 5 },
                2: { range: 8 },
                3: { range: 12 },
            },
            'geo-solids': { 1: { level: 1 }, 2: { level: 2 }, 3: { level: 3 } },
            'geo-net': {
                1: { range: 4 },
                2: { range: 6 },
                3: { range: 9 },
            },
            'geo-section': { 1: { level: 1 }, 2: { level: 2 }, 3: { level: 3 } },
            'geo-pyramid': {
                1: { range: 5 },
                2: { range: 8 },
                3: { range: 12 },
            },
            'pyth-problems': {
                1: { triples: PYTHAGOREAN_TRIPLES.slice(0, 3) },
                2: { triples: PYTHAGOREAN_TRIPLES.slice(2, 6) },
                3: { triples: PYTHAGOREAN_TRIPLES.slice(4) },
            },
            'roots-simplify': {
                1: { aRange: [2, 3], bChoices: [2, 3, 5] },
                2: { aRange: [3, 5], bChoices: [2, 3, 5, 6, 7] },
                3: { aRange: [4, 7], bChoices: [2, 3, 5, 6, 7, 10, 11] },
            },
            'roots-combine': {
                1: { coeffMax: 5, xChoices: [2, 3, 5] },
                2: { coeffMax: 9, xChoices: [2, 3, 5, 7, 10] },
                3: { coeffMax: 14, xChoices: [2, 3, 5, 7, 10, 11, 13] },
            },
            'roots-multiply': {
                1: { numChoices: [2, 3, 5, 7] },
                2: { numChoices: [2, 3, 5, 6, 7, 10, 11] },
                3: { numChoices: [2, 3, 5, 6, 7, 10, 11, 13, 14, 15] },
            },
            'roots-divide': {
                1: { resultRange: [2, 4], bChoices: [2, 3] },
                2: { resultRange: [3, 6], bChoices: [2, 3, 5] },
                3: { resultRange: [4, 9], bChoices: [2, 3, 5, 6, 7] },
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
            total, value,
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

    // ── SysAdditionLab — نظام معادلتين يُحل بطريقة الجمع ─────────────────────────
    // نبني eq1 و eq2 بحيث يكون معامل y في eq2 هو (-multiplier × b1)، بحيث ضرب
    // eq1 في multiplier يجعل معاملي y متعاكسين تماماً فيلغيان بعضهما عند الجمع.
    'sys-addition': ({ coeffMax, valMax, multipliers, allowNegative }) => {
        const range = allowNegative ? () => randInt(-valMax, valMax) : () => randInt(1, valMax);
        let x, y;
        do { x = range(); y = range(); } while (x === 0 || y === 0);

        const multiplier = pick(multipliers);
        const b1 = randInt(1, coeffMax);
        const a1 = randInt(1, coeffMax);
        const a2 = randInt(1, coeffMax);
        const b2 = -multiplier * b1; // يضمن الإلغاء التام بعد الضرب في multiplier

        const c1 = a1 * x + b1 * y;
        const c2 = a2 * x + b2 * y;

        // المعادلة الأولى بعد الضرب في multiplier
        const newA1 = a1 * multiplier;
        const newB1 = b1 * multiplier;
        const newC1 = c1 * multiplier;

        // مجموع المعادلتين بعد الضرب: (newA1+a2)x = newC1+c2
        const sumA = newA1 + a2;
        const sumC = newC1 + c2;

        return {
            type: 'system-addition',
            eq1: { a: a1, b: b1, c: c1 },
            eq2: { a: a2, b: b2, c: c2 },
            multiplier,
            newEq1: { a: newA1, b: newB1, c: newC1 },
            sumEq: { a: sumA, c: sumC },
            x, y,
            q: `حل الجملة بطريقة الجمع: ${a1}x + ${b1}y = ${c1}  و  ${a2}x ${b2 < 0 ? '-' : '+'} ${Math.abs(b2)}y = ${c2}`,
            hint: `اضرب المعادلة الأولى في ${multiplier} حتى يتماثل معامل y مع المعادلة الثانية ويتعاكس إشارة، ثم اجمع المعادلتين.`,
        };
    },

    // ── SysSubstitutionLab — معادلة أولى بمعامل x = 1 حتى يسهل عزل x ────────────
    'sys-substitution': ({ coeffMax, valMax, allowNegative }) => {
        const range = allowNegative ? () => randInt(-valMax, valMax) : () => randInt(1, valMax);
        let x, y;
        do { x = range(); y = range(); } while (x === 0 || y === 0);

        const b1 = randInt(1, coeffMax);   // eq1: x + b1*y = c1  (معامل x يساوي 1 عمداً)
        const a2 = randInt(2, coeffMax + 1);
        const b2 = randInt(1, coeffMax);

        const c1 = x + b1 * y;
        const c2 = a2 * x + b2 * y;

        return {
            type: 'system-substitution',
            eq1: { a: 1, b: b1, c: c1 },
            eq2: { a: a2, b: b2, c: c2 },
            isolated: { c: c1, b: b1 }, // x = c1 - b1*y
            x, y,
            q: `حل الجملة بطريقة التعويض: x + ${b1}y = ${c1}  و  ${a2}x + ${b2}y = ${c2}`,
            hint: `اعزل x من المعادلة الأولى: x = ${c1} - ${b1}y، ثم عوّض هذه العبارة مكان x في المعادلة الثانية.`,
        };
    },

    // ── PGCDEuclideanLab — يبني زوجاً (a,b) بقاسم مشترك أكبر معروف مسبقاً ────────
    'pgcd-euclidean': ({ gcdChoices, multMax }) => {
        const g = pick(gcdChoices);
        let m1, m2;
        do {
            m1 = randInt(2, multMax);
            m2 = randInt(2, multMax);
        } while (m1 === m2 || gcd(m1, m2) !== 1); // m1,m2 أوليان فيما بينهما لضمان أن g هو فعلاً القاسم المشترك الأكبر

        const a = g * m1;
        const b = g * m2;
        const [big, small] = a > b ? [a, b] : [b, a];

        return {
            type: 'pgcd-euclidean',
            a: big, b: small, ans: g,
            q: `أوجد القاسم المشترك الأكبر للعددين ${big} و ${small} باستخدام خوارزمية إقليدس.`,
            hint: `اقسم ${big} على ${small}، ثم كرر العملية على الباقي والمقسوم عليه حتى يصبح الباقي صفراً. آخر مقسوم عليه غير صفري هو القاسم المشترك الأكبر.`,
        };
    },

    // ── RootsSimplificationLab — يبني n = a²×b مع ضمان أن a² هو أكبر مربع تام ──
    // b عدد لا مربعي (squarefree)، فلا يوجد عامل مربّع أكبر يمكن إخراجه بعد a²
    'roots-simplify': ({ aRange, bChoices }) => {
        const a = randInt(aRange[0], aRange[1]);
        const b = pick(bChoices);
        const square = a * a;
        const n = square * b;
        return {
            n, square, root: a, remainder: b,
            q: `√${n}`,
            hint: `ابحث عن أكبر مربع تام (4، 9، 16، 25...) يقسم ${n} بدون باقٍ.`,
        };
    },

    // ── RootsAdditionLab / RootsSubtractionLab — a√x ± b√x ──────────────────────
    'roots-combine': ({ coeffMax, xChoices }) => {
        const a = randInt(2, coeffMax);
        const b = randInt(1, coeffMax);
        const x = pick(xChoices);
        return {
            a, b, x, sum: a + b, diff: a - b,
            hint: `اجمع أو اطرح المعاملات (الأرقام الخارجية) فقط، والجذر يبقى كما هو دون تغيير.`,
        };
    },

    // ── RootsMultiplicationLab — √a × √b = √(a×b) ────────────────────────────────
    'roots-multiply': ({ numChoices }) => {
        const a = pick(numChoices);
        let b = pick(numChoices);
        while (b === a && numChoices.length > 1) b = pick(numChoices);
        return {
            a, b, res: a * b,
            hint: `اضرب العددين الموجودين تحت الجذرين، وضع الناتج تحت جذر واحد مشترك.`,
        };
    },

    // ── RootsDivisionLab — √a ÷ √b = √(a÷b) مع ضمان أن الناتج مربع تام ──────────
    'roots-divide': ({ resultRange, bChoices }) => {
        const result = randInt(resultRange[0], resultRange[1]);
        const b = pick(bChoices);
        const quot = result * result;
        const a = quot * b;
        return {
            a, b, quot, result,
            hint: `اقسم ${a} على ${b} أولاً لتوحيدهما تحت جذر واحد، ثم استخرج الجذر التربيعي للناتج.`,
        };
    },

    // ── VecParallelogramLab — نقطة انطلاق مشتركة A، شعاعان AB وAD، والمحصلة AC ──
    // C = B + D - A (قاعدة متوازي الأضلاع). نبني مشتتين خاطئين بإزاحة بسيطة عن C.
    'vec-parallelogram': ({ range }) => {
        const a = { x: 0, y: 0 };
        let b, d;
        do {
            b = { x: randInt(-range, range), y: randInt(-range, range) };
            d = { x: randInt(-range, range), y: randInt(-range, range) };
        } while ((b.x === 0 && b.y === 0) || (d.x === 0 && d.y === 0) || (b.x === d.x && b.y === d.y));

        const c = { x: b.x + d.x - a.x, y: b.y + d.y - a.y };
        // مشتتات: منتصف b-d (خطأ شائع) ومضاعف b (خطأ شائع آخر)
        const distractor1 = { x: Math.round((b.x + d.x) / 2), y: Math.round((b.y + d.y) / 2) };
        const distractor2 = { x: b.x * 2, y: b.y * 2 };

        const options = [
            { ...c, correct: true },
            { ...distractor1, correct: false },
            { ...distractor2, correct: false },
        ].filter((opt, idx, arr) => arr.findIndex(o => o.x === opt.x && o.y === opt.y) === idx); // إزالة التكرار إن تطابقت المشتتات

        // ضمان وجود 3 خيارات دائماً حتى بعد إزالة التكرار
        while (options.length < 3) {
            const rx = randInt(-range * 2, range * 2), ry = randInt(-range * 2, range * 2);
            if (!options.some(o => o.x === rx && o.y === ry)) options.push({ x: rx, y: ry, correct: false });
        }

        return {
            a, b, d, c,
            options: options.sort(() => Math.random() - 0.5),
            q: `AB + AD = ?`,
            hint: `تخيل خطين وهميين يوازيان الشعاعين حتى يتقاطعا؛ نقطة التقاطع هي C = B + D − A.`,
        };
    },

    // ── VecRandomAddLab — شعاعان حرّان (منفصلان في الفضاء)، والمطلوب مجموعهما ──
    'vec-random-add': ({ range }) => {
        let u, v;
        do {
            u = { x: randInt(-range, range), y: randInt(-range, range) };
            v = { x: randInt(-range, range), y: randInt(-range, range) };
        } while ((u.x === 0 && u.y === 0) || (v.x === 0 && v.y === 0));

        const sum = { x: u.x + v.x, y: u.y + v.y };
        return {
            u, v, sum,
            hint: `بعد الانسحاب، اجمع المركبات كلاً على حدة: (${u.x}+${v.x}, ${u.y}+${v.y}).`,
        };
    },

    // ── VecReadLab — شعاع عشوائي (dx, dy) ينطلق من نقطة (startX, startY) ────────
    // نضمن بقاء نقطة النهاية ضمن نطاق الشبكة المرئية (-5..5) في كل الحالات.
    'vec-read': ({ range }) => {
        let dx, dy, startX, startY;
        do {
            dx = randInt(-range, range);
            dy = randInt(-range, range);
            startX = randInt(-2, 2);
            startY = randInt(-2, 2);
        } while ((dx === 0 && dy === 0) || Math.abs(startX + dx) > 4 || Math.abs(startY + dy) > 4);

        return {
            dx, dy, startX, startY,
            hint: `ابدأ من النقطة الخضراء، عد المربعات لليمين أو اليسار للوصول لـ x، ثم للأعلى أو الأسفل للوصول لـ y.`,
        };
    },

    // ── VecCalcLab — حساب مركبات AB جبرياً من إحداثيات A وB (النهاية ناقص البداية) ──
    'vec-calc': ({ range }) => {
        const ax = randInt(-range, range);
        const ay = randInt(-range, range);
        let bx, by;
        do {
            bx = randInt(-range, range);
            by = randInt(-range, range);
        } while (bx === ax && by === ay);

        return {
            ax, ay, bx, by,
            dx: bx - ax, dy: by - ay,
            hint: `AB = (Xᵦ − Xₐ, Yᵦ − Yₐ) = (${bx} − ${ax}, ${by} − ${ay}).`,
        };
    },

    // ── VecMidpointLab — نبني من المنتصف نفسه لضمان أن يكون عدداً صحيحاً دائماً ──
    // M(mx,my) عشوائية، ثم نبني A وB على طرفي نصف بعد (hx,hy) عن M فيبقى الناتج صحيحاً دوماً.
    'vec-midpoint': ({ range }) => {
        const mx = randInt(-range, range);
        const my = randInt(-range, range);
        let hx, hy;
        do {
            hx = randInt(-range, range);
            hy = randInt(-range, range);
        } while (hx === 0 && hy === 0);

        const ax = mx - hx, ay = my - hy;
        const bx = mx + hx, by = my + hy;

        return {
            ax, ay, bx, by, mx, my,
            sumX: ax + bx, sumY: ay + by,
            hint: `M = ((Xₐ+Xᵦ)/2, (Yₐ+Yᵦ)/2) = ((${ax}+${bx})/2, (${ay}+${by})/2).`,
        };
    },

    // ── VecDistanceLab — نستخدم ثلاثيات فيثاغورس لضمان أن المسافة عدد صحيح دائماً ──
    'vec-distance': ({ triples, offsetRange }) => {
        const [legA, legB, hyp] = pick(triples);
        // نبدّل عشوائياً أيّ الضلعين يمثل dx وأيّهما dy، ونعطي كلاً منهما إشارة عشوائية
        const swap = Math.random() > 0.5;
        let dx = swap ? legA : legB;
        let dy = swap ? legB : legA;
        if (Math.random() > 0.5) dx = -dx;
        if (Math.random() > 0.5) dy = -dy;

        const ax = randInt(-offsetRange, offsetRange);
        const ay = randInt(-offsetRange, offsetRange);
        const bx = ax + dx;
        const by = ay + dy;

        return {
            ax, ay, bx, by, dx, dy,
            sumSq: dx * dx + dy * dy, dist: hyp,
            hint: `AB = √[(Xᵦ-Xₐ)² + (Yᵦ-Yₐ)²] = √(${dx}² + ${dy}²).`,
        };
    },

    // ── VecSameEndLab — شعاعان ينتهيان عند نفس النقطة C (AC وBC)، والمطلوب مجموعهما ──
    'vec-same-end': ({ range }) => {
        const a = { x: randInt(-range, range), y: randInt(-range, range) };
        let b, c;
        do {
            b = { x: randInt(-range, range), y: randInt(-range, range) };
            c = { x: randInt(-range, range), y: randInt(-range, range) };
        } while ((a.x === c.x && a.y === c.y) || (b.x === c.x && b.y === c.y) || (a.x === b.x && a.y === b.y));

        const ac = { x: c.x - a.x, y: c.y - a.y };
        const bc = { x: c.x - b.x, y: c.y - b.y };
        const sum = { x: ac.x + bc.x, y: ac.y + bc.y };

        return {
            a, b, c, ac, bc, sum,
            hint: `AC + BC = (Xᴄ-Xₐ+Xᴄ-Xᵦ, Yᴄ-Yₐ+Yᴄ-Yᵦ) — احسب كل شعاع على حدة ثم اجمعهما.`,
        };
    },

    // ── ThalesInteractiveLab — عصا صغيرة وظلها، وجسم كبير (هرم/شجرة) وظله ──────
    // نبني الإجابة من ناتج ضرب صحيح (stickHeight × k) لضمان أن تكون النتيجة عدداً صحيحاً دائماً.
    'thales-shadow': ({ stickMax, ratioMax }) => {
        const stickHeight = randInt(1, stickMax);
        let stickShadow;
        do { stickShadow = randInt(1, stickMax); } while (stickShadow === stickHeight);
        const k = randInt(2, ratioMax);
        const tallShadow = stickShadow * k;
        const tallHeight = stickHeight * k;

        return {
            stickHeight, stickShadow, tallShadow, tallHeight,
            q: `عصا طولها ${stickHeight}م وظلها ${stickShadow}م. إذا كان ظل الجسم الكبير ${tallShadow}م، فما ارتفاعه؟`,
            hint: `(${stickHeight} / ${stickShadow}) = (؟ / ${tallShadow}) → ؟ = ${stickHeight} × ${tallShadow} / ${stickShadow}`,
        };
    },

    // ── ThalesProblemsLab — 3 صيغ قصصية مختلفة لنفس فكرة التناسب، كلها تضمن ناتجاً صحيحاً ──
    'thales-problems': ({ maxBase, maxRatio }) => {
        const archetype = pick(['shadow', 'scale', 'cone']);

        if (archetype === 'shadow') {
            const stick = randInt(1, maxBase);
            let stickShadow;
            do { stickShadow = randInt(1, maxBase); } while (stickShadow === stick);
            const k = randInt(2, maxRatio);
            const buildingShadow = stickShadow * k;
            const ans = stick * k;
            return {
                type: 'shadow', a: stick, b: stickShadow, c: buildingShadow, ans,
                q: `مبنى يلقي ظلاً طوله ${buildingShadow}m. في نفس الوقت، عصا طولها ${stick}m تلقي ظلاً طوله ${stickShadow}m. ما هو ارتفاع المبنى؟`,
            };
        }

        if (archetype === 'scale') {
            const ratioM = randInt(2, maxRatio); // 1cm يمثل ratioM متر على الواقع
            const drawnA = randInt(2, maxBase);
            const realA = drawnA * ratioM;
            const drawnB = randInt(2, maxBase);
            const realB = drawnB * ratioM;
            return {
                type: 'scale', a: realA, b: drawnA, c: realB, ans: drawnB,
                q: `في رسم هندسي، قطعة طولها الحقيقي ${realA}m رُسمت بطول ${drawnA}cm. قطعة أخرى طولها الحقيقي ${realB}m، كم سيكون طولها على الرسم بـ cm؟`,
            };
        }

        // archetype === 'cone' — نبني H كمضاعف لـ R (H = R×t) لضمان وجود h صحيح دائماً،
        // بدل التجربة العشوائية التي قد تدخل في حلقة لا نهائية مع أزواج غير متوافقة.
        const t = randInt(2, Math.max(2, maxRatio));
        const R = randInt(2, maxBase);
        const H = R * t;
        const r = randInt(1, R - 1);
        const h = r * t;
        return {
            type: 'cone', a: H, b: R, c: h, ans: r,
            q: `مخروط دائري ارتفاعه الكلي ${H}cm ونصف قطر قاعدته ${R}cm. قطعناه بمستوٍ يوازي القاعدة على ارتفاع ${h}cm من الرأس. ما هو نصف قطر الدائرة الناتجة؟`,
        };
    },

    // ── InequalitiesSolveLab — نبني من الحل نفسه (res) لضمان قسمة صحيحة تماماً دائماً ──
    'ineq-solve': ({ maxA, maxB, allowNegativeA }) => {
        let a;
        do {
            a = randInt(allowNegativeA ? -maxA : 1, maxA);
        } while (a === 0);
        const res = randInt(-maxB, maxB);
        const b = randInt(-maxB, maxB);
        const targetVal = a * res; // = c - b دائماً بالضبط
        const c = targetVal + b;

        const baseSym = pick(['>', '<', '≥', '≤']);
        const flipMap = { '>': '<', '<': '>', '≥': '≤', '≤': '≥' };
        const symFlip = a < 0 ? flipMap[baseSym] : baseSym;

        return {
            a, b, c, sym: baseSym, symFlip, res, targetVal,
            hint: 'انقل الثابت للطرف الآخر مع عكس إشارته، ثم اقسم على معامل x — واعكس الرمز إذا كان المعامل سالباً.',
        };
    },

    // ── InequalitiesGraphLab — يشتق اتجاه التظليل ونوع العارضة من الرمز مباشرة ──
    'ineq-graph': ({ range }) => {
        const boundary = randInt(-range, range);
        const sym = pick(['>', '<', '≥', '≤']);
        const dir = (sym === '>' || sym === '≥') ? 'right' : 'left';
        const inc = (sym === '≥' || sym === '≤');

        return {
            boundary, sym, dir, inc,
            q: `x ${sym} ${boundary}`,
        };
    },

    // ── DivisorPropertiesLab — n يقسم a وb دائماً بالبناء، فيقسم مجموعهما وفرقهما وباقي قسمتهما ──
    'divisor-props': ({ nChoices, kMax }) => {
        const n = pick(nChoices);
        let kBig, kSmall;
        do {
            const x = randInt(2, kMax);
            const y = randInt(2, kMax);
            kBig = Math.max(x, y);
            kSmall = Math.min(x, y);
        } while (kBig === kSmall || kBig % kSmall === 0); // نتجنب a%b=0 (حالة تافهة لمسار الباقي)

        const a = n * kBig;
        const b = n * kSmall;
        const sum = a + b;
        const diff = a - b;
        const remainder = a % b;

        return {
            n, a, b, sum, diff, remainder,
            sumQuot: sum / n, diffQuot: diff / n, remainderQuot: remainder / n,
        };
    },

    // ── EquationsProductLab — (x - root1)(x - root2) = 0، جذران مختلفان دائماً ──
    'eq-product': ({ range }) => {
        let root1, root2;
        do {
            root1 = randInt(-range, range);
            root2 = randInt(-range, range);
        } while (root1 === root2);

        const formatFactor = (r) => r === 0 ? 'x' : `(x ${r > 0 ? '-' : '+'} ${Math.abs(r)})`;
        const q = `${formatFactor(root1)}${formatFactor(root2)} = 0`;

        return {
            root1, root2, q,
            hint: `إما ${formatFactor(root1).replace(/[()]/g, '')} = 0 أو ${formatFactor(root2).replace(/[()]/g, '')} = 0.`,
        };
    },

    // ── PythProblemsLab — 4 قوالب نصية واقعية، جميعها تعتمد على ثلاثيات فيثاغورس ──
    // نضمن نتيجة صحيحة دائماً لأننا نبني من ثلاثية حقيقية (a,b,hyp) بدل أرقام عشوائية.
    'pyth-problems': ({ triples }) => {
        const [legA, legB, hyp] = pick(triples);
        const swap = Math.random() > 0.5;
        const a = swap ? legA : legB;
        const b = swap ? legB : legA;

        const templates = [
            { q: `سلم طوله ${hyp}m متكئ على حائط. إذا كانت المسافة بين أسفل السلم والحائط ${a}m، فما هو ارتفاع قمة السلم عن الأرض؟`, ans: b },
            { q: `مشى سعيد ${a}km شرقاً ثم ${b}km شمالاً. كم المسافة المباشرة بين نقطة البداية والنهاية؟`, ans: hyp },
            { q: `شجرة انكسرت، قمتها تلامس الأرض على بعد ${a}m من الجذع. إذا كان ارتفاع الجزء المتبقي ${b}m، فما طول الجزء المنكسر (من نقطة الكسر إلى القمة)؟`, ans: hyp },
            { q: `طائرة ورقية تحلق بخيط طوله ${hyp}m. إذا كانت المسافة الأفقية بين الطفل والطائرة ${a}m، فما ارتفاع الطائرة؟`, ans: b },
        ];
        const chosen = pick(templates);

        return {
            a, b, hyp, ans: chosen.ans, q: chosen.q,
            hint: 'ارسم المسألة كمثلث قائم، وحدد الوتر والضلعين القائمين قبل التطبيق.',
        };
    },

    // ── SystemsGraphLab — نبني من نقطة التقاطع نفسها لضمان مستقيمين متقاطعين عند عدد صحيح دائماً ──
    'sys-graph': ({ mRange, bRange }) => {
        const ansX = randInt(-4, 4);
        const ansY = randInt(-4, 4);
        let m1, m2;
        do {
            m1 = randInt(-mRange, mRange);
            m2 = randInt(-mRange, mRange);
        } while (m1 === m2 || m1 === 0 || m2 === 0);

        const b1 = ansY - m1 * ansX;
        const b2 = ansY - m2 * ansX;

        return {
            m1, b1, m2, b2, ansX, ansY,
            pt1_y1: b1, pt1_y2: m1 * 3 + b1, // قيم y عند x=0 وx=3 للمستقيم الأول
            pt2_y1: b2, pt2_y2: m2 * 3 + b2, // نفس الشيء للمستقيم الثاني
        };
    },

    // ── SysStrategyLab — يبني جملة تُفضّل بوضوح إما التعويض (معامل=1) أو الجمع (معاملات متطابقة/متعاكسة، بلا معامل=1) ──
    'sys-strategy': ({ maxCoeff }) => {
        const best = pick(['subst', 'add']);
        const sign = (n) => n >= 0 ? '+' : '-';

        if (best === 'subst') {
            // eq1: 1x + b1*y = c1  (معامل x يساوي 1 عمداً لضمان تفضيل التعويض بلا لبس)
            const b1 = randInt(2, maxCoeff);
            const a2 = randInt(2, maxCoeff);
            const b2 = randInt(2, maxCoeff);
            const x = randInt(1, 6), y = randInt(1, 6);
            const c1 = x + b1 * y;
            const c2 = a2 * x + b2 * y;
            return {
                best,
                sys: [`x ${sign(b1)} ${Math.abs(b1)}y = ${c1}`, `${a2}x ${sign(b2)} ${Math.abs(b2)}y = ${c2}`],
                reason: `المعامل x في المعادلة الأولى هو 1. عزله وتعويضه في المعادلة الثانية هو الأسرع هنا.`,
            };
        }

        // best === 'add' — نضمن تطابق (أو تعاكس) معامل y بين المعادلتين، وبلا أي معامل=1 لتفادي اللبس مع التعويض
        const a1 = randInt(2, maxCoeff);
        const a2 = randInt(2, maxCoeff);
        const bShared = randInt(2, maxCoeff);
        const b2Sign = pick([1, -1]);
        const x = randInt(1, 6), y = randInt(1, 6);
        const c1 = a1 * x + bShared * y;
        const c2 = a2 * x + (b2Sign * bShared) * y;
        return {
            best,
            sys: [`${a1}x ${sign(bShared)} ${Math.abs(bShared)}y = ${c1}`, `${a2}x ${sign(b2Sign * bShared)} ${Math.abs(bShared)}y = ${c2}`],
            reason: b2Sign === -1
                ? `معاملا y متعاكسان (+${bShared} و-${bShared})؛ الجمع يُلغيهما فوراً بخطوة واحدة.`
                : `معاملا y متطابقان (${bShared} في الاثنتين)؛ الطرح (أو الجمع بعد قلب إشارة) يُلغيهما بخطوة واحدة.`,
        };
    },

    // ── GeoVolumeLab — 3 أرشيتايبات (مكعب / متوازي مستطيلات / موشور مثلثي) كلها بحجوم صحيحة دائماً ──
    'geo-volume': ({ range }) => {
        const archetype = pick(['cube', 'rect', 'triangular']);

        if (archetype === 'cube') {
            const side = randInt(2, Math.min(range, 9));
            const ans = side * side * side;
            return {
                type: 'cube', side, ans,
                q: `مكعب طول ضلعه ${side}cm. احسب حجمه.`,
                formula: `V = ${side} × ${side} × ${side}`,
            };
        }

        if (archetype === 'rect') {
            const baseArea = randInt(2, range) * randInt(2, range);
            const height = randInt(2, range);
            const ans = baseArea * height;
            return {
                type: 'rect', baseArea, height, ans,
                q: `متوازي مستطيلات مساحة قاعدته ${baseArea}cm² وارتفاعه ${height}cm. ما هو حجمه؟`,
                formula: `V = ${baseArea} × ${height}`,
            };
        }

        // archetype === 'triangular' — موشور قاعدته مثلث؛ نضمن مساحة قاعدة صحيحة باختيار قاعدة/ارتفاع زوجيين
        const triBase = randInt(1, Math.ceil(range / 2)) * 2;
        const triHeight = randInt(2, range);
        const prismLength = randInt(2, range);
        const baseArea = (triBase * triHeight) / 2;
        const ans = baseArea * prismLength;
        return {
            type: 'triangular', triBase, triHeight, prismLength, baseArea, ans,
            q: `موشور ثلاثي القاعدة: قاعدة المثلث ${triBase}cm وارتفاعه ${triHeight}cm، وطول الموشور ${prismLength}cm. ما هو حجمه؟`,
            formula: `مساحة القاعدة = (${triBase} × ${triHeight}) ÷ 2 = ${baseArea}   ثم   V = ${baseArea} × ${prismLength}`,
        };
    },

    // ── GeoSolidsLab — بنك أسئلة تصاعدي الصعوبة لتمييز المجسمات من خصائصها ──────
    // كل مستوى له بنك أسئلة مستقل؛ المستوى الأصعب يتطلب تمييزاً أدق بين مجسمات متشابهة.
    'geo-solids': ({ level }) => {
        const pools = {
            1: [
                { q: 'ما هو المجسم الذي يملك 6 أوجه مربعة متطابقة؟', correct: 'المكعب', options: ['المكعب', 'متوازي المستطيلات', 'الهرم'], solidType: 'cube' },
                { q: 'مجسم قاعدتاه دائرتان متطابقتان ومتوازيتان. ما هو؟', correct: 'الأسطوانة', options: ['المخروط', 'الأسطوانة', 'الكرة'], solidType: 'cylinder' },
                { q: 'مجسم يملك رأساً واحداً (قمة) وقاعدة دائرية.', correct: 'المخروط', options: ['الهرم', 'المخروط', 'الكرة'], solidType: 'cone' },
            ],
            2: [
                { q: 'مجسم له 6 أوجه مستطيلة (وليست بالضرورة مربعة). ما هو؟', correct: 'متوازي المستطيلات', options: ['المكعب', 'متوازي المستطيلات', 'الموشور الثلاثي'], solidType: 'cube' },
                { q: 'مجسم له قاعدة واحدة مضلعة، وأوجه جانبية مثلثة تلتقي في قمة واحدة.', correct: 'الهرم', options: ['الهرم', 'الموشور', 'المخروط'], solidType: 'cone' },
                { q: 'مجسم كل نقطة على سطحه تبعد نفس المسافة عن مركزه.', correct: 'الكرة', options: ['الكرة', 'الأسطوانة', 'المخروط'], solidType: 'cylinder' },
            ],
            3: [
                { q: 'موشور قاعدتاه مثلثتان متطابقتان، وأوجهه الجانبية مستطيلات. ما هو؟', correct: 'الموشور الثلاثي', options: ['الموشور الثلاثي', 'الهرم الثلاثي', 'متوازي المستطيلات'], solidType: 'cube' },
                { q: 'الفرق الجوهري بين الهرم والمخروط هو شكل القاعدة: ما قاعدة الهرم عادة؟', correct: 'مضلع (مثلث أو مربع...)', options: ['مضلع (مثلث أو مربع...)', 'دائرة', 'قطع ناقص'], solidType: 'cone' },
                { q: 'مجسم ناتج عن دوران نصف دائرة حول قطرها. ما هو؟', correct: 'الكرة', options: ['الكرة', 'الأسطوانة', 'المخروط'], solidType: 'cylinder' },
            ],
        };
        const pool = pools[level] || pools[1];
        return pick(pool);
    },

    // ── GeoNetLab — نشر المجسم وحساب مساحته الكلية (مكعب أو متوازي مستطيلات) ──
    'geo-net': ({ range }) => {
        const archetype = pick(['cube', 'rect']);

        if (archetype === 'cube') {
            const side = randInt(2, range);
            const faceArea = side * side;
            const ans = 6 * faceArea;
            return {
                type: 'cube', side, faceArea, ans,
                q: `إذا كانت مساحة الوجه الواحد للمكعب هي ${faceArea}cm²، فكم تكون مساحته الكلية؟`,
                hint: 'المكعب يملك 6 أوجه متطابقة. اضرب مساحة الوجه في 6.',
            };
        }

        // archetype === 'rect' — متوازي مستطيلات بأبعاد l×w×h، المساحة الكلية = 2(lw+lh+wh)
        const l = randInt(2, range);
        const w = randInt(2, range);
        const h = randInt(2, range);
        const ans = 2 * (l * w + l * h + w * h);
        return {
            type: 'rect', l, w, h, ans,
            q: `متوازي مستطيلات أبعاده ${l}cm × ${w}cm × ${h}cm. ما هي مساحته الكلية؟`,
            hint: `مساحة كل زوج من الأوجه المتقابلة: (${l}×${w}) + (${l}×${h}) + (${w}×${h})، ثم اضرب المجموع في 2.`,
        };
    },

    // ── GeoSectionLab — بنك أسئلة تصاعدي الصعوبة للمقاطع المستوية للمجسمات ────
    'geo-section': ({ level }) => {
        const pools = {
            1: [
                { q: 'عند قطع أسطوانة بمستوٍ موازٍ لقاعدتها، ما هو شكل المقطع الناتج؟', correct: 'دائرة', options: ['مربع', 'دائرة', 'مثلث'] },
                { q: 'عند قطع مكعب بمستوٍ موازٍ لأحد أوجهه، ماذا نتحصل؟', correct: 'مربع', options: ['مربع', 'مستطيل', 'دائرة'] },
                { q: 'عند قطع كرة بأي مستوٍ يمر بمركزها، ما شكل المقطع؟', correct: 'دائرة', options: ['دائرة', 'قطع ناقص', 'مربع'] },
            ],
            2: [
                { q: 'عند قطع مخروط بمستوٍ موازٍ لقاعدته (وليس من الرأس)، ما هو شكل المقطع؟', correct: 'دائرة', options: ['دائرة', 'مثلث', 'قطع مكافئ'] },
                { q: 'عند قطع متوازي مستطيلات بمستوٍ موازٍ لأحد أوجهه المستطيلة، ماذا نتحصل؟', correct: 'مستطيل', options: ['مربع', 'مستطيل', 'دائرة'] },
                { q: 'عند قطع أسطوانة بمستوٍ عمودي على قاعدتها ويمر بمركزها، ما شكل المقطع؟', correct: 'مستطيل', options: ['مستطيل', 'دائرة', 'بيضاوي'] },
            ],
            3: [
                { q: 'عند قطع هرم رباعي بمستوٍ موازٍ لقاعدته (بين الرأس والقاعدة)، ما شكل المقطع؟', correct: 'مربع أصغر مشابه للقاعدة', options: ['مربع أصغر مشابه للقاعدة', 'مثلث', 'دائرة'] },
                { q: 'عند قطع مخروط بمستوٍ مائل يمر بقاعدته وأحد جوانبه (لا يوازي القاعدة ولا يمر بالرأس)، أي منحنى ينتج عادة؟', correct: 'قطع ناقص (شكل بيضاوي)', options: ['قطع ناقص (شكل بيضاوي)', 'دائرة تامة', 'مثلث'] },
                { q: 'عند قطع كرة بمستوٍ لا يمر بمركزها، ماذا يحدث لحجم الدائرة الناتجة مقارنة بمقطع يمر بالمركز؟', correct: 'أصغر', options: ['أصغر', 'أكبر', 'متساوٍ تماماً'] },
            ],
        };
        const pool = pools[level] || pools[1];
        return pick(pool);
    },

    // ── GeoPyramidLab — قانون الثلث: V = (1/3) × مساحة القاعدة × الارتفاع ──────
    // نبني مساحة القاعدة كمضاعف لـ 3 دائماً لضمان قسمة صحيحة تامة بلا كسور.
    'geo-pyramid': ({ range }) => {
        const archetype = pick(['cylinderCone', 'pyramid']);

        if (archetype === 'cylinderCone') {
            const k = randInt(2, range); // حجم المخروط النهائي (الجواب)
            const cylinderVol = 3 * k;
            return {
                type: 'cylinderCone', cylinderVol, ans: k,
                q: `إذا كان حجم أسطوانة هو ${cylinderVol}cm³، فكم يكون حجم مخروط له نفس القاعدة والارتفاع؟`,
                hint: 'اقسم حجم الأسطوانة على 3.',
            };
        }

        // archetype === 'pyramid' — مساحة القاعدة مضاعف لـ 3 مضمون
        const baseArea = randInt(2, range) * 3;
        const height = randInt(2, range);
        const ans = (baseArea * height) / 3;
        return {
            type: 'pyramid', baseArea, height, ans,
            q: `هرم مساحة قاعدته ${baseArea}cm² وارتفاعه ${height}cm. احسب حجمه.`,
            hint: `(${baseArea} × ${height}) ÷ 3`,
        };
    },
};

/** Converts a (possibly negative) integer exponent to unicode superscript, e.g. -2 → ⁻² */
function toSup(n) {
    const map = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
    return String(n).split('').map(ch => map[ch] ?? ch).join('');
}
