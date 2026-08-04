/**
 * Difficulty Engine — stats domain module.
 * Auto-split from the former monolithic difficultyEngine.js so that:
 *  1) each domain file stays small and easy to review/edit safely,
 *  2) a mistake in one domain's generator can't break parsing of the others,
 *  3) Vite can code-split this by dynamic import if a route only needs one domain.
 * PARAMS holds the per-level parameter presets; GENERATORS holds the pure
 * challenge-building functions consumed by difficultyEngine.generateChallenge().
 */
import { randInt, pick, round2, gcd, PYTHAGOREAN_TRIPLES, toSup, createEngine } from './_shared.js';

export const PARAMS = {
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

    'prob-mastery': {
                    1: { totals: [10, 20], askComplement: false },
                    2: { totals: [10, 20, 25, 50], askComplement: false },
                    3: { totals: [4, 5, 10, 20, 25, 50], askComplement: true },
                },
};

export const GENERATORS = {
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

    'prob-mastery': ({ totals, askComplement }) => {
            const total = pick(totals);
            const red = randInt(1, total - 1);
            const blue = total - red;
            const askBlue = askComplement && Math.random() < 0.5;
            const target = askBlue ? blue : red;
            const ans = Math.round((target / total) * 100);
            return {
                type: 'prob-mastery', red, blue, total, askBlue, ans,
                q: askBlue
                    ? `كيس يحتوي على ${red} كرات حمراء و${blue} زرقاء. ما احتمال سحب كرة زرقاء؟ (أعطِ النتيجة كنسبة مئوية %)`
                    : `كيس يحتوي على ${red} كرات حمراء و${blue} زرقاء. ما احتمال سحب كرة حمراء؟ (أعطِ النتيجة كنسبة مئوية %)`,
                hint: `(${target} ÷ ${total}) × 100 = ?`,
            };
        },
};

// Domain-scoped engine — lets a lab component import just this file and get
// the full difficultyEngine API without pulling in the other domains' code.
export const difficultyEngine = createEngine(PARAMS, GENERATORS);
