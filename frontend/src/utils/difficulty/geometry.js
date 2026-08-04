/**
 * Difficulty Engine — geometry domain module.
 * Auto-split from the former monolithic difficultyEngine.js so that:
 *  1) each domain file stays small and easy to review/edit safely,
 *  2) a mistake in one domain's generator can't break parsing of the others,
 *  3) Vite can code-split this by dynamic import if a route only needs one domain.
 * PARAMS holds the per-level parameter presets; GENERATORS holds the pure
 * challenge-building functions consumed by difficultyEngine.generateChallenge().
 */
import { randInt, pick, round2, gcd, PYTHAGOREAN_TRIPLES, toSup, createEngine } from './_shared.js';

export const PARAMS = {
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

    'pyth-visual': {
                    1: { bases: [[3, 4, 5]], multRange: [1, 4] },
                    2: { bases: [[3, 4, 5], [6, 8, 10], [5, 12, 13]], multRange: [1, 3] },
                    3: { bases: [[5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]], multRange: [1, 2] },
                },

    'pyth-problems': {
                    1: { triples: PYTHAGOREAN_TRIPLES.slice(0, 3) },
                    2: { triples: PYTHAGOREAN_TRIPLES.slice(2, 6) },
                    3: { triples: PYTHAGOREAN_TRIPLES.slice(4) },
                },

    'thales-verify': {
                    1: { baseRange: [2, 6], multRange: [2, 4] },
                    2: { baseRange: [3, 9], multRange: [2, 5] },
                    3: { baseRange: [4, 12], multRange: [2, 6] },
                },

    'thales-length': {
                    1: { adRange: [2, 6], kRange: [2, 4], mRange: [2, 6] },
                    2: { adRange: [3, 9], kRange: [2, 5], mRange: [3, 10] },
                    3: { adRange: [4, 12], kRange: [2, 6], mRange: [4, 15] },
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

    'div-discover': {
                    1: { targets: [12, 16, 18, 20, 24] },
                    2: { targets: [28, 30, 36, 40, 45] },
                    3: { targets: [48, 54, 60, 72, 84, 90] },
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

    'rotation-mastery': {
                    1: { anglesSign: [30, 45, 60, 90], anglesReduce: [], kinds: ['sign-only'] },
                    2: { anglesSign: [60, 90, 120, 135, 150], anglesReduce: [], kinds: ['sign-only'] },
                    3: { anglesSign: [90, 120, 135, 150, 180], anglesReduce: [200, 270, 300, 400], kinds: ['sign-only', 'reduce'] },
                },
};

export const GENERATORS = {
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

    'pyth-visual': ({ bases, multRange }) => {
            const [a0, b0, c0] = pick(bases);
            const m = randInt(multRange[0], multRange[1]);
            const a = a0 * m, b = b0 * m, c = c0 * m;
            return {
                type: 'pyth-visual', a, b, c,
                q: `في مثلث قائم الزاوية في A: طول AB = ${a} وطول AC = ${b}. ما طول الوتر BC؟`,
                hint: `BC² = AB² + AC² = ${a}² + ${b}² = ${a * a + b * b} ⟹ BC = ${c}`,
            };
        },

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

    'thales-verify': ({ baseRange, multRange }) => {
            const isParallel = Math.random() < 0.5;
            const ad = randInt(baseRange[0], baseRange[1]);
            const k = randInt(multRange[0], multRange[1]);
            const ab = ad * k;
            const ae = randInt(baseRange[0], baseRange[1]);
            let ac;
            if (isParallel) {
                ac = ae * k;
            } else {
                let k2 = randInt(multRange[0], multRange[1]);
                while (k2 === k) k2 = randInt(multRange[0], multRange[1]);
                ac = ae * k2;
            }
            return {
                type: 'thales-verify', ad, ab, ae, ac, isParallel,
                q: 'هل المستقيمان (DE) و (BC) متوازيان؟',
                hint: `قارن AD/AB = ${ad}/${ab} = ${(ad / ab).toFixed(2)} مع AE/AC = ${ae}/${ac} = ${(ae / ac).toFixed(2)}.`,
            };
        },

    'thales-length': ({ adRange, kRange, mRange }) => {
            const ad = randInt(adRange[0], adRange[1]);
            const k = randInt(kRange[0], kRange[1]);
            const ab = ad * k;
            const m = randInt(mRange[0], mRange[1]); // = AE (الجواب)
            const ac = m * k;
            return {
                type: 'thales-length', ad, ab, ac, ae: m,
                q: `المستقيمان (DE) و (BC) متوازيان. إذا كان AD = ${ad}، AB = ${ab}، AC = ${ac}، فما طول AE؟`,
                hint: `AD/AB = AE/AC ⟹ AE = (AD × AC) ÷ AB = (${ad} × ${ac}) ÷ ${ab} = ${m}`,
            };
        },

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

    'div-discover': ({ targets }) => {
            const target = pick(targets);
            const divisors = [];
            for (let i = 1; i <= target; i++) if (target % i === 0) divisors.push(i);
            return {
                type: 'div-discover', target, divisors,
                q: `اكتشف جميع قواسم العدد ${target}`,
                hint: `ابدأ بالعدد 1 وجرّب الأعداد بالتسلسل (2، 3، 4...) وابحث عن مكمّل كل عدد بالضرب.`,
            };
        },

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

    'rotation-mastery': ({ anglesSign, anglesReduce, kinds }) => {
            const kind = pick(kinds);
            if (kind === 'sign-only') {
                const mag = pick(anglesSign);
                const dir = Math.random() < 0.5 ? 1 : -1;
                const ans = dir * mag;
                const dirWord = dir === 1 ? 'الموجب (عكس عقارب الساعة)' : 'السالب (مع عقارب الساعة)';
                return {
                    type: 'rotation-mastery', kind, mag, dir, ans,
                    q: `دور الشكل بزاوية ${mag} درجة في الاتجاه ${dirWord}. ما القيمة الجبرية للزاوية؟`,
                    hint: 'الاتجاه الموجب عكس عقارب الساعة (+)، والسالب معها (−).',
                };
            }
            const mag = pick(anglesReduce);
            let ans = mag;
            if (ans > 180) ans -= 360;
            return {
                type: 'rotation-mastery', kind, mag, ans,
                q: `الزاوية ${mag}° تعادل أي زاوية جبرية ضمن المجال [-180°, 180°]؟`,
                hint: 'اطرح 360° من الزاوية إن كانت أكبر من 180°.',
            };
        },
};

// Domain-scoped engine — lets a lab component import just this file and get
// the full difficultyEngine API without pulling in the other domains' code.
export const difficultyEngine = createEngine(PARAMS, GENERATORS);
