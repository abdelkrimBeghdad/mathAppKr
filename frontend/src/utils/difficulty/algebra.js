/**
 * Difficulty Engine — algebra domain module.
 * Auto-split from the former monolithic difficultyEngine.js so that:
 *  1) each domain file stays small and easy to review/edit safely,
 *  2) a mistake in one domain's generator can't break parsing of the others,
 *  3) Vite can code-split this by dynamic import if a route only needs one domain.
 * PARAMS holds the per-level parameter presets; GENERATORS holds the pure
 * challenge-building functions consumed by difficultyEngine.generateChallenge().
 */
import { randInt, pick, round2, gcd, PYTHAGOREAN_TRIPLES, toSup, createEngine } from './_shared.js';

export const PARAMS = {
    expansion: {
                    1: { maxCoeff: 5, useNegative: false, terms: 1 },
                    2: { maxCoeff: 10, useNegative: true, terms: 1 },
                    3: { maxCoeff: 15, useNegative: true, terms: 2 },
                },

    linear: {
                    1: { maxCoeff: 4, maxInput: 5 },
                    2: { maxCoeff: 7, maxInput: 8 },
                    3: { maxCoeff: 10, maxInput: 12 },
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

    'eq-solve': {
                    1: { xRange: [1, 12], bRange: [1, 10], aRange: [2, 6], kinds: ['add', 'sub'], allowNegativeX: false },
                    2: { xRange: [1, 12], bRange: [1, 12], aRange: [2, 9], kinds: ['add', 'sub', 'mul'], allowNegativeX: false },
                    3: { xRange: [1, 15], bRange: [1, 15], aRange: [2, 9], kinds: ['two-step'], allowNegativeX: true },
                },

    'eq-product': {
                    1: { range: 4 },
                    2: { range: 6 },
                    3: { range: 9 },
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

    'fact-common': {
                    1: { aRange: [2, 6], cRange: [2, 7], allowNegative: false },
                    2: { aRange: [3, 9], cRange: [3, 12], allowNegative: false },
                    3: { aRange: [4, 12], cRange: [4, 15], allowNegative: true },
                },

    pgcd: {
                    1: { pairs: [[12, 18], [15, 25], [14, 21], [27, 18]] },
                    2: { pairs: [[24, 36], [20, 30], [32, 48], [45, 30]] },
                    3: { pairs: [[40, 60], [48, 72], [54, 81], [64, 96]] },
                },

    'pgcd-euclidean': {
                    1: { gcdChoices: [4, 6, 8], multMax: 4 },
                    2: { gcdChoices: [9, 12, 15], multMax: 6 },
                    3: { gcdChoices: [18, 21, 24, 27], multMax: 8 },
                },

    'divisor-props': {
                    1: { nChoices: [3, 4, 5], kMax: 5 },
                    2: { nChoices: [4, 5, 6, 7], kMax: 8 },
                    3: { nChoices: [6, 7, 8, 9], kMax: 12 },
                },

    roots: {
                    1: { maxSquare: 100, complexity: 'simple' },
                    2: { maxSquare: 400, complexity: 'medium' },
                    3: { maxSquare: 900, complexity: 'complex' },
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

    'roots-expression': {
                    1: { xChoices: [2, 3, 5], c1Range: [2, 4], c2Range: [1, 3], ops: ['add'] },
                    2: { xChoices: [2, 3, 5, 6, 7], c1Range: [3, 6], c2Range: [2, 5], ops: ['add', 'sub'] },
                    3: { xChoices: [2, 3, 5, 6, 7, 10, 11], c1Range: [4, 8], c2Range: [2, 6], ops: ['add', 'sub'] },
                },
};

export const GENERATORS = {
    powers: ({ maxExp, maxBase, ops, allowNegativeExp }) => {
            const base = randInt(2, maxBase);
            const op = pick(ops);
    
            if (op === 'mul') {
                const e1 = randInt(1, maxExp);
                const e2 = allowNegativeExp && Math.random() > 0.7 ? -randInt(1, maxExp) : randInt(1, maxExp);
                return {
                    base, op, e1, e2,
                    q: `${base}${toSup(e1)} × ${base}${toSup(e2)} = ${base}^?`,
                    a: String(e1 + e2),
                    hint: `عند الضرب نجمع الأسس: ${e1} + (${e2}) = ?`,
                };
            }
            if (op === 'div') {
                const e2 = randInt(1, maxExp);
                const e1 = e2 + randInt(1, maxExp); // ensures e1 > e2, positive result
                return {
                    base, op, e1, e2,
                    q: `${base}${toSup(e1)} ÷ ${base}${toSup(e2)} = ${base}^?`,
                    a: String(e1 - e2),
                    hint: `عند القسمة نطرح الأسس: ${e1} − ${e2} = ?`,
                };
            }
            // power of a power
            const e1 = randInt(2, Math.max(2, Math.floor(maxExp / 2)));
            const e2 = randInt(2, Math.max(2, Math.floor(maxExp / 2)));
            return {
                base, op, e1, e2,
                q: `(${base}${toSup(e1)})${toSup(e2)} = ${base}^?`,
                a: String(e1 * e2),
                hint: `قوة القوة هي جداء الأسين: ${e1} × ${e2} = ?`,
            };
        },

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

    'eq-solve': ({ xRange, bRange, aRange, kinds, allowNegativeX }) => {
            const kind = pick(kinds);
            let x = randInt(xRange[0], xRange[1]);
            if (allowNegativeX && Math.random() < 0.4) x = -x;
    
            if (kind === 'add') {
                const b = randInt(bRange[0], bRange[1]);
                const c = x + b;
                return { type: 'eq-solve', kind, x, a: 1, b, c, q: `x + ${b} = ${c}`, hint: `x = ${c} − ${b}` };
            }
            if (kind === 'sub') {
                const b = randInt(bRange[0], bRange[1]);
                const c = x - b;
                return { type: 'eq-solve', kind, x, a: 1, b: -b, c, q: `x - ${b} = ${c}`, hint: `x = ${c} + ${b}` };
            }
            if (kind === 'mul') {
                const a = randInt(aRange[0], aRange[1]);
                const c = a * x;
                return { type: 'eq-solve', kind, x, a, b: 0, c, q: `${a}x = ${c}`, hint: `x = ${c} ÷ ${a}` };
            }
            // two-step: a×x + b = c
            const a = randInt(aRange[0], aRange[1]);
            const b = randInt(bRange[0], bRange[1]) * (Math.random() < 0.5 ? 1 : -1);
            const c = a * x + b;
            return {
                type: 'eq-solve', kind, x, a, b, c,
                q: `${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${c}`,
                hint: `x = (${c} ${b >= 0 ? '−' : '+'} ${Math.abs(b)}) ÷ ${a}`,
            };
        },

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

    'fact-common': ({ aRange, cRange, allowNegative }) => {
            const a = randInt(aRange[0], aRange[1]);
            let c = randInt(cRange[0], cRange[1]);
            if (allowNegative && Math.random() < 0.5) c = -c;
            const term2 = a * c;
            return {
                type: 'fact-common',
                a, c,
                q: `${a}x ${term2 >= 0 ? '+' : '-'} ${Math.abs(term2)}`,
                hint: `العامل المشترك هو ${a}. اقسم كل حد على ${a} لتحصل على (x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}).`,
            };
        },

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

    'roots-combine': ({ coeffMax, xChoices }) => {
            const a = randInt(2, coeffMax);
            const b = randInt(1, coeffMax);
            const x = pick(xChoices);
            return {
                a, b, x, sum: a + b, diff: a - b,
                hint: `اجمع أو اطرح المعاملات (الأرقام الخارجية) فقط، والجذر يبقى كما هو دون تغيير.`,
            };
        },

    'roots-multiply': ({ numChoices }) => {
            const a = pick(numChoices);
            let b = pick(numChoices);
            while (b === a && numChoices.length > 1) b = pick(numChoices);
            return {
                a, b, res: a * b,
                hint: `اضرب العددين الموجودين تحت الجذرين، وضع الناتج تحت جذر واحد مشترك.`,
            };
        },

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

    'roots-expression': ({ xChoices, c1Range, c2Range, ops }) => {
            const x = pick(xChoices);
            const op = pick(ops);
            let c1 = randInt(c1Range[0], c1Range[1]);
            let c2 = randInt(c2Range[0], c2Range[1]);
            if (op === 'sub' && c2 >= c1) { const t = c1; c1 = c2 + randInt(1, 3); c2 = t; }
            const term1 = c1 * c1 * x;
            const term2 = c2 * c2 * x;
            const result = op === 'add' ? c1 + c2 : c1 - c2;
            const signWord = op === 'add' ? '+' : '−';
            return {
                type: 'roots-expression', x, c1, c2, op, result,
                q: `√${term1} ${signWord} √${term2}`,
                decomposeStep: `${c1}√${x} ${signWord} ${c2}√${x}`,
                finalStep: `${result}√${x}`,
                hint: `فكك كل جذر إلى مربع تام مضروب في ${x}، ثم اجمع/اطرح المعاملات لأن الجذر المشترك واحد.`,
            };
        },
};

// Domain-scoped engine — lets a lab component import just this file and get
// the full difficultyEngine API without pulling in the other domains' code.
export const difficultyEngine = createEngine(PARAMS, GENERATORS);
