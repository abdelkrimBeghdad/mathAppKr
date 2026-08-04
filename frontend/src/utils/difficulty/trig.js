/**
 * Difficulty Engine — trig domain module.
 * Auto-split from the former monolithic difficultyEngine.js so that:
 *  1) each domain file stays small and easy to review/edit safely,
 *  2) a mistake in one domain's generator can't break parsing of the others,
 *  3) Vite can code-split this by dynamic import if a route only needs one domain.
 * PARAMS holds the per-level parameter presets; GENERATORS holds the pure
 * challenge-building functions consumed by difficultyEngine.generateChallenge().
 */
import { randInt, pick, round2, gcd, PYTHAGOREAN_TRIPLES, toSup, createEngine } from './_shared.js';

export const PARAMS = {
    trig: {
                    1: { triples: PYTHAGOREAN_TRIPLES.slice(0, 3) }, // 3-4-5, 6-8-10, 5-12-13
                    2: { triples: PYTHAGOREAN_TRIPLES.slice(2, 6) },
                    3: { triples: PYTHAGOREAN_TRIPLES.slice(4) },
                },

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

    'trig-length': {
                    1: { angles: [30, 45, 60] },
                    2: { angles: [0, 90, 30, 45, 60] },
                    3: { angles: [0, 30, 45, 60, 90, 120, 135, 150] },
                },

    'trig-naming': {
                    1: { kinds: ['adjacent', 'opposite'], targets: ['A'] },
                    2: { kinds: ['adjacent', 'opposite'], targets: ['A', 'B'] },
                    3: { kinds: ['adjacent', 'opposite', 'hypotenuse'], targets: ['A', 'B'] },
                },

    'trig-identities': {
                    1: { kinds: ['identity', 'tan-from-ratio'], triples: [[3, 4, 5]] },
                    2: { kinds: ['tan-from-ratio'], triples: [[3, 4, 5], [6, 8, 10]] },
                    3: { kinds: ['tan-from-ratio', 'find-cos-from-sin'], triples: [[5, 12, 13], [8, 15, 17], [7, 24, 25]] },
                },

    'trig-special': {
                    1: { kinds: ['value-forward'], funcs: ['sin'] },
                    2: { kinds: ['value-forward'], funcs: ['sin', 'cos', 'tan'] },
                    3: { kinds: ['value-forward', 'angle-reverse'], funcs: ['sin', 'cos', 'tan'] },
                },
};

export const GENERATORS = {
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

    'trig-naming': ({ kinds, targets }) => {
            const kind = pick(kinds); // 'adjacent' | 'opposite' | 'hypotenuse'
    
            if (kind === 'hypotenuse') {
                const options = ['المجاور', 'المقابل', 'الوتر'];
                for (let i = options.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [options[i], options[j]] = [options[j], options[i]];
                }
                return {
                    type: 'trig-naming', kind, target: 'A', correct: 'الوتر', options,
                    q: "ما اسم الضلع الأطول AB في هذا المثلث؟",
                    hint: 'الوتر هو دائماً الضلع الأطول المقابل للزاوية القائمة.',
                };
            }
    
            const target = pick(targets);
            const adjacentSide = target === 'A' ? 'AC' : 'BC';
            const oppositeSide = target === 'A' ? 'BC' : 'AC';
            const correct = kind === 'adjacent' ? adjacentSide : oppositeSide;
            const wrongOther = kind === 'adjacent' ? oppositeSide : adjacentSide;
            const options = [correct, wrongOther, 'AB'];
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }
            return {
                type: 'trig-naming', kind, target, correct, options,
                q: kind === 'adjacent' ? `في هذا المثلث، ما هو الضلع 'المجاور' للزاوية ${target}؟` : `ما هو الضلع 'المقابل' للزاوية ${target}؟`,
                hint: 'المقابل لا يلمس الزاوية المختارة، والمجاور يلمسها (وليس الوتر).',
            };
        },

    'trig-identities': ({ kinds, triples }) => {
            const kind = pick(kinds);
    
            if (kind === 'identity') {
                return {
                    type: 'trig-identities', kind, ans: 1,
                    q: 'احسب النتيجة: cos²(x) + sin²(x) =',
                    hint: 'هذه مطابقة رياضية دائمة الصحة لأي زاوية x، مستمدة من نظرية فيثاغورس.',
                };
            }
    
            const [a, b, c] = pick(triples);
            const cosX = Math.round((a / c) * 100) / 100;
            const sinX = Math.round((b / c) * 100) / 100;
    
            if (kind === 'tan-from-ratio') {
                const ans = Math.round((b / a) * 100) / 100;
                return {
                    type: 'trig-identities', kind, cosX, sinX, ans,
                    q: `إذا كان cos(x) = ${cosX} وsin(x) = ${sinX}، فكم يكون tan(x)؟ (قرّب لأقرب جزأين عشريين)`,
                    hint: 'tan(x) = sin(x) ÷ cos(x)',
                };
            }
    
            // find-cos-from-sin
            const ans = cosX;
            return {
                type: 'trig-identities', kind, sinX, ans,
                q: `إذا كان sin(x) = ${sinX} والزاوية x حادة، فكم يكون cos(x)؟ (قرّب لأقرب جزأين عشريين)`,
                hint: 'استخدم المطابقة: cos(x) = √(1 − sin²(x))',
            };
        },

    'trig-special': ({ kinds, funcs }) => {
            const TABLE = {
                30: { sin: '1/2', cos: '√3/2', tan: '√3/3' },
                45: { sin: '√2/2', cos: '√2/2', tan: '1' },
                60: { sin: '√3/2', cos: '1/2', tan: '√3' },
            };
            const funcLabel = { sin: 'sin', cos: 'cos', tan: 'tan' };
            const angles = [30, 45, 60];
            const kind = pick(kinds);
            const func = pick(funcs);
    
            const shuffle = (arr) => {
                const a = [...arr];
                for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
                return a;
            };
    
            if (kind === 'value-forward') {
                const angle = pick(angles);
                const correct = TABLE[angle][func];
                const options = shuffle(angles.map(a => TABLE[a][func]));
                return {
                    type: 'trig-special', kind, angle, func, correct, options,
                    q: `ما هي قيمة ${funcLabel[func]}(${angle}°)؟`,
                    hint: 'راجع جدول القيم الشهيرة: 30°، 45°، 60°.',
                };
            }
    
            // angle-reverse
            const angle = pick(angles);
            const correct = `${angle}°`;
            const options = shuffle(angles.map(a => `${a}°`));
            return {
                type: 'trig-special', kind, angle, func, correct, options,
                q: `أي زاوية شهيرة تحقق ${funcLabel[func]}(x) = ${TABLE[angle][func]}؟`,
                hint: 'راجع جدول القيم الشهيرة: 30°، 45°، 60°.',
            };
        },
};

// Domain-scoped engine — lets a lab component import just this file and get
// the full difficultyEngine API without pulling in the other domains' code.
export const difficultyEngine = createEngine(PARAMS, GENERATORS);
