/**
 * Difficulty Engine — vectors domain module.
 * Auto-split from the former monolithic difficultyEngine.js so that:
 *  1) each domain file stays small and easy to review/edit safely,
 *  2) a mistake in one domain's generator can't break parsing of the others,
 *  3) Vite can code-split this by dynamic import if a route only needs one domain.
 * PARAMS holds the per-level parameter presets; GENERATORS holds the pure
 * challenge-building functions consumed by difficultyEngine.generateChallenge().
 */
import { randInt, pick, round2, gcd, PYTHAGOREAN_TRIPLES, toSup, createEngine } from './_shared.js';

export const PARAMS = {
    'vec-concept': {
                    1: { coordRange: [1, 3], kinds: ['equal'] },
                    2: { coordRange: [1, 5], kinds: ['equal', 'opposite'] },
                    3: { coordRange: [2, 7], kinds: ['equal', 'opposite'] },
                },

    'vec-chasles': {
                    1: { chainLen: 2, shuffleOrder: false },
                    2: { chainLen: 3, shuffleOrder: false },
                    3: { chainLen: 3, shuffleOrder: true },
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
};

export const GENERATORS = {
    'vec-concept': ({ coordRange, kinds }) => {
            const kind = pick(kinds); // 'equal' | 'opposite'
            let dx = randInt(coordRange[0], coordRange[1]) * (Math.random() < 0.5 ? 1 : -1);
            let dy = randInt(coordRange[0], coordRange[1]) * (Math.random() < 0.5 ? 1 : -1);
            if (dx === 0 && dy === 0) dx = coordRange[0];
    
            const correctDx = kind === 'equal' ? dx : -dx;
            const correctDy = kind === 'equal' ? dy : -dy;
    
            const distractor1 = { dx: -correctDx, dy: correctDy }; // اتجاه معاكس جزئياً (منحى مختلف عادة)
            const distractor2 = { dx: correctDx * 2, dy: correctDy * 2 }; // نفس الاتجاه لكن طويلة مختلفة
    
            const rawOptions = [
                { id: '1', dx: correctDx, dy: correctDy, correct: true },
                { id: '2', dx: distractor1.dx, dy: distractor1.dy, correct: false },
                { id: '3', dx: distractor2.dx, dy: distractor2.dy, correct: false },
            ];
            // خلط الترتيب حتى لا يكون الجواب الصحيح دائماً في نفس المكان
            for (let i = rawOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
            }
    
            return {
                type: 'vec-concept', kind, dx, dy, correctDx, correctDy,
                q: kind === 'equal' ? 'اختر الشعاع الذي يساوي الشعاع المرجعي (نفس الطويلة والاتجاه والمنحى):' : 'اختر الشعاع المعاكس للشعاع المرجعي (نفس الطويلة والمنحى، لكن الاتجاه معكوس):',
                hint: kind === 'equal' ? 'يجب أن تتطابق ثلاث خصائص معاً: المنحى، الاتجاه، والطويلة.' : 'المعاكس له نفس الطول ونفس خط المنحى، لكنه يشير بعكس الجهة تماماً.',
                options: rawOptions,
            };
        },

    'vec-chasles': ({ chainLen, shuffleOrder }) => {
            const pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');
            // خلط الحروف واختيار نقاط مميزة
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            const points = pool.slice(0, chainLen + 1);
            let vectors = [];
            for (let i = 0; i < chainLen; i++) vectors.push(points[i] + points[i + 1]);
            if (shuffleOrder) {
                for (let i = vectors.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [vectors[i], vectors[j]] = [vectors[j], vectors[i]];
                }
            }
            return {
                type: 'vec-chasles', chain: points, vectors,
                ansStart: points[0], ansEnd: points[chainLen],
                hint: shuffleOrder
                    ? 'الجمع تبديلي — أعد ترتيب الأشعة ذهنياً حتى تتطابق الحروف المتكررة قبل الدمج.'
                    : "الحرف الأخير في كل شعاع يجب أن يطابق الحرف الأول في الشعاع الذي يليه، ثم نحذف الحروف المتكررة.",
            };
        },

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
};

// Domain-scoped engine — lets a lab component import just this file and get
// the full difficultyEngine API without pulling in the other domains' code.
export const difficultyEngine = createEngine(PARAMS, GENERATORS);
