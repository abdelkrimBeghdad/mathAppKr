import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Divide, CheckCircle2, Send, Lightbulb, Sparkles, X, ArrowDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabStepsPanel from './LabStepsPanel';
import { useLabTheme } from './LabThemeContext';

// خوارزمية إقليدس — حساب خطوات القسمة المتتالية
function computeSteps(a, b) {
    const steps = [];
    let x = a, y = b;
    while (y !== 0) {
        const q = Math.floor(x / y);
        const r = x % y;
        steps.push({ a: x, b: y, q, r });
        x = y;
        y = r;
    }
    return { steps, pgcd: x };
}

// مصفوفات موثوقة من مسائل المنهاج الجزائري وشهادات التعليم المتوسط (BEM) للتوليد الذكي
const CURRICULUM_PAIRS = {
    1: [ // 2 إلى 3 خطوات
        [120, 48], [135, 75], [96, 56], [144, 60], [180, 75], [112, 42], [160, 64], [150, 65]
    ],
    2: [ // 3 إلى 4 خطوات
        [252, 140], [315, 126], [450, 168], [378, 162], [420, 175], [525, 210], [396, 144], [630, 245]
    ],
    3: [ // 4 إلى 5 خطوات كاملة (مستوى BEM)
        [1053, 832], [696, 406], [1224, 748], [882, 588], [945, 630], [1512, 616], [1248, 546], [2079, 891]
    ]
};

// مولّد ديناميكي ذكي يضمن دائماً أعداداً جديدة بعدد الخطوات المستهدف (من خطوتين حتى 5 خطوات)
function generateChallengeForLevel(lvl) {
    const minSteps = lvl === 1 ? 2 : lvl === 2 ? 3 : 4;
    const maxSteps = lvl === 1 ? 3 : lvl === 2 ? 4 : 5;

    // محاولة توليد عشوائي ديناميكي أولاً
    for (let i = 0; i < 400; i++) {
        const gChoices = lvl === 1 ? [4, 6, 8, 12, 15] : lvl === 2 ? [7, 9, 14, 18, 21] : [13, 17, 19, 23, 29, 31, 37];
        const g = gChoices[Math.floor(Math.random() * gChoices.length)];

        let m1, m2;
        if (lvl === 1) {
            m1 = Math.floor(Math.random() * 20) + 5;
            m2 = Math.floor(Math.random() * 10) + 3;
        } else if (lvl === 2) {
            m1 = Math.floor(Math.random() * 45) + 15;
            m2 = Math.floor(Math.random() * 22) + 7;
        } else {
            m1 = Math.floor(Math.random() * 85) + 30;
            m2 = Math.floor(Math.random() * 55) + 18;
        }

        if (m1 <= m2) continue;

        const a = g * m1;
        const b = g * m2;
        const { steps, pgcd } = computeSteps(a, b);

        if (steps.length >= minSteps && steps.length <= maxSteps && pgcd === g) {
            return { level: lvl, a, b, steps, pgcd };
        }
    }

    // استخدام الأزواج المعتمدة من المنهاج مع التبديل العشوائي
    const list = CURRICULUM_PAIRS[lvl] || CURRICULUM_PAIRS[1];
    const pair = list[Math.floor(Math.random() * list.length)];
    const { steps, pgcd } = computeSteps(pair[0], pair[1]);
    return { level: lvl, a: pair[0], b: pair[1], steps, pgcd };
}

// بناء الجولات الثلاث بالتدرج من المستوى 1 إلى 3
function buildProgressiveRounds() {
    return [
        generateChallengeForLevel(1), // المسألة 1: مبتدئ (2 - 3 خطوات)
        generateChallengeForLevel(2), // المسألة 2: متوسط (3 - 4 خطوات)
        generateChallengeForLevel(3), // المسألة 3: متقدم (4 - 5 خطوات)
    ];
}

const LEVEL_CONFIG = {
    1: { name: 'المستوى 1: مبتدئ (خطوتان - 3)', badge: 'مبتدئ (2 - 3 خطوات)' },
    2: { name: 'المستوى 2: متوسط (3 - 4 خطوات)', badge: 'متوسط (3 - 4 خطوات)' },
    3: { name: 'المستوى 3: متقدم (4 - 5 خطوات BEM)', badge: 'متقدم (4 - 5 خطوات)' }
};

function PGCDEuclideanContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [rounds, setRounds] = useState(() => buildProgressiveRounds());
    const [round, setRound] = useState(0); // 0 (المسألة 1), 1 (المسألة 2), 2 (المسألة 3)
    const [currentStep, setCurrentStep] = useState(0); // الخطوة الحالية داخل المسألة
    
    // مدخلات التلميذ لسطر القسمة:
    // في الخطوة 1: a و b معطيان. في الخطوات 2 فما فوق، يدخل التلميذ a و b بنفسه!
    const [userA, setUserA] = useState('');
    const [userB, setUserB] = useState('');
    const [userQ, setUserQ] = useState('');
    const [userR, setUserR] = useState('');
    
    // مدخل استنتاج الـ PGCD النهائي عند الوصول إلى باقي 0
    const [userPGCD, setUserPGCD] = useState('');
    const [isAwaitingPGCD, setIsAwaitingPGCD] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [completedRows, setCompletedRows] = useState([]);
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);
    const [showRuleModal, setShowRuleModal] = useState(false);

    const aInputRef = useRef(null);
    const bInputRef = useRef(null);
    const qInputRef = useRef(null);
    const rInputRef = useRef(null);
    const pgcdInputRef = useRef(null);

    const currentLevel = round + 1; // 1, 2, أو 3 دائماً بالتدرج
    const roundData = rounds[round] || rounds[0];
    const current = roundData?.steps ? roundData.steps[currentStep] : null;

    // التركيز التلقائي على الحقل المناسب
    useEffect(() => {
        if (isAwaitingPGCD) {
            setTimeout(() => pgcdInputRef.current?.focus(), 150);
        } else if (currentStep > 0) {
            // في الخطوات 2 فما فوق يركز أولاً على المقسوم a ليدخله التلميذ بنفسه
            setTimeout(() => aInputRef.current?.focus(), 150);
        } else {
            // في الخطوة الأولى يركز على الحاصل q
            setTimeout(() => qInputRef.current?.focus(), 150);
        }
    }, [currentStep, round, isAwaitingPGCD]);

    const resetAll = () => {
        setRounds(buildProgressiveRounds());
        setRound(0);
        setCurrentStep(0);
        setCompletedRows([]);
        setUserA('');
        setUserB('');
        setUserQ('');
        setUserR('');
        setUserPGCD('');
        setIsAwaitingPGCD(false);
        setIsSubmitting(false);
        setError(false);
        setFeedback(null);
        setReward(null);
    };

    const handleRefreshCurrent = () => {
        // توليد مسألة جديدة للمستوى الحالي
        setRounds(prev => {
            const next = [...prev];
            next[round] = generateChallengeForLevel(currentLevel);
            return next;
        });
        setCurrentStep(0);
        setCompletedRows([]);
        setUserA('');
        setUserB('');
        setUserQ('');
        setUserR('');
        setUserPGCD('');
        setIsAwaitingPGCD(false);
        setIsSubmitting(false);
        setFeedback(null);
    };

    // التحقق من سطر القسمة الإقليدية: a = b × q + r
    const handleStepSubmit = () => {
        if (!current || isAwaitingPGCD || isSubmitting) return;

        // استخراج القيم: في الخطوة 0 نأخذ a و b من current، وفي الخطوات 1+ نأخذها من مدخلات التلميذ
        const aVal = currentStep === 0 ? current.a : parseInt(userA, 10);
        const bVal = currentStep === 0 ? current.b : parseInt(userB, 10);
        const qVal = parseInt(userQ, 10);
        const rVal = parseInt(userR, 10);

        // التحقق من الحقول الفارغة
        if (currentStep > 0 && (isNaN(aVal) || isNaN(bVal))) {
            setError(true);
            setFeedback({ type: 'error', text: 'يرجى كتابة المقسوم (a) والمقسوم عليه (b).' });
            setTimeout(() => setError(false), 1200);
            return;
        }

        if (isNaN(qVal) || isNaN(rVal)) {
            setError(true);
            setFeedback({ type: 'error', text: 'يرجى كتابة الحاصل (q) والباقي (r).' });
            setTimeout(() => setError(false), 1200);
            return;
        }

        // تشخيص ترحيل المقسوم a
        if (currentStep > 0 && aVal !== current.a) {
            setError(true);
            setFeedback({
                type: 'error',
                text: `تنبيه: المقسوم (a) في هذه الخطوة يجب أن يكون هو المقسوم عليه في السطر السابق (${current.a})!`
            });
            setTimeout(() => setError(false), 2400);
            return;
        }

        // تشخيص ترحيل المقسوم عليه b
        if (currentStep > 0 && bVal !== current.b) {
            setError(true);
            setFeedback({
                type: 'error',
                text: `تنبيه: المقسوم عليه (b) في هذه الخطوة يجب أن يكون هو باقي السطر السابق (${current.b})!`
            });
            setTimeout(() => setError(false), 2400);
            return;
        }

        // تشخيص: هل الباقي أكبر من أو يساوي المقسوم عليه؟
        if (rVal >= current.b) {
            setError(true);
            setFeedback({
                type: 'error',
                text: `تنبيه: الباقي (${rVal}) يجب أن يكون دائماً أصغر تماماً من المقسوم عليه (${current.b})!`
            });
            setTimeout(() => setError(false), 2200);
            return;
        }

        // تشخيص: هل المعادلة a = b*q + r متطابقة حسابياً؟
        if (current.b * qVal + rVal !== current.a) {
            setError(true);
            setFeedback({
                type: 'error',
                text: `تحقق من الحساب: ${current.b} × ${qVal} + ${rVal} = ${current.b * qVal + rVal} (يجب أن يساوي ${current.a}).`
            });
            setTimeout(() => setError(false), 2200);
            return;
        }

        // إضافة السطر المكتمل
        const newRows = [...completedRows, { a: current.a, b: current.b, q: qVal, r: rVal }];
        setCompletedRows(newRows);
        setUserA('');
        setUserB('');
        setUserQ('');
        setUserR('');
        setError(false);

        // إذا كان الباقي 0، نغلق سطر القسمة وننتقل لطلب الـ PGCD
        if (current.r === 0) {
            setIsAwaitingPGCD(true);
            setFeedback({
                type: 'success',
                text: 'أحسنت! وصلنا إلى الباقي 0. الآن استنتج القاسم المشترك الأكبر (PGCD).'
            });
        } else {
            setIsSubmitting(true);
            setFeedback({ type: 'success', text: `خطوة صحيحة (${currentStep + 1} من ${roundData.steps.length})! انتقل للسطر التالي.` });
            setTimeout(() => {
                setCurrentStep(s => s + 1);
                setFeedback(null);
                setIsSubmitting(false);
            }, 600);
        }
    };

    // التحقق من تحديد الـ PGCD النهائي وختم الجولة
    const handlePGCDSubmit = async () => {
        if (!isAwaitingPGCD || isSubmitting) return;

        const pVal = parseInt(userPGCD, 10);
        if (isNaN(pVal)) {
            setError(true);
            setFeedback({ type: 'error', text: 'يرجى إدخال قيمة PGCD.' });
            setTimeout(() => setError(false), 1200);
            return;
        }

        if (pVal !== roundData.pgcd) {
            setError(true);
            setFeedback({
                type: 'error',
                text: `القيمة غير صحيحة. تذكر أن PGCD هو آخر باقٍ غير معدوم (أي ${roundData.pgcd}).`
            });
            setTimeout(() => setError(false), 2200);
            return;
        }

        // نجاح المسألة الحالية
        setError(false);
        setIsSubmitting(true);

        if (round < 2) {
            setFeedback({
                type: 'success',
                text: `إجابة صحيحة 🎯! أكملت ${LEVEL_CONFIG[currentLevel].name}. ننتقل للمستوى الموالي...`
            });
            setTimeout(() => {
                setRound(r => r + 1);
                setCurrentStep(0);
                setCompletedRows([]);
                setUserA('');
                setUserB('');
                setUserQ('');
                setUserR('');
                setUserPGCD('');
                setIsAwaitingPGCD(false);
                setIsSubmitting(false);
                setFeedback(null);
            }, 1400);
        } else {
            // إكمال كامل المسائل الثلاث
            await labProgressService.update('pgcd-euclidean', 'completed', 100).catch(() => { });
            confetti({ particleCount: 180, spread: 85, origin: { y: 0.6 } });
            try {
                const data = await rewardService.claimLabReward('pgcd-euclidean', {
                    type: 'pgcd',
                    a: roundData.a,
                    b: roundData.b,
                    result: roundData.pgcd,
                });
                if (data.status === 'success') setReward(data);
            } catch (err) {
                console.error(err);
            }
            setIsSubmitting(false);
        }
    };

    // ── سجل الخطوات الجانبي بصياغة رياضية متناسقة ──
    // ملاحظة بيداغوجية: لا نكشف قيمة PGCD قبل أن يكتبها التلميذ بنفسه!
    const stepsForPanel = [
        ...completedRows.map((row) => ({
            label: `${row.a} = ${row.b} × ${row.q} + ${row.r}`,
            done: true
        })),
        ...(current && !isAwaitingPGCD ? [{
            label: `${currentStep === 0 ? current.a : '?'} = ${currentStep === 0 ? current.b : '?'} × ? + ?`,
            active: true
        }] : []),
        ...(isAwaitingPGCD ? [{
            label: `PGCD(${roundData.a}, ${roundData.b}) = ?`, // علامة استفهام لمنع تسريب الجواب!
            active: true
        }] : [])
    ];

    return (
        <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center justify-center my-auto">
            {/* زر التذكير بالقاعدة في زاوية أنيقة دون حجب أو تداخل */}
            <div className="w-full flex justify-between items-center mb-1 px-1 shrink-0">
                <button
                    onClick={() => setShowRuleModal(true)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-xl border text-[11px] font-black transition-all cursor-pointer shadow-sm ${
                        isDarkMode
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                            : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                    }`}
                >
                    <Lightbulb size={13} className="text-amber-400 animate-pulse" />
                    <span>تذكير بالقاعدة 💡</span>
                </button>

                <div className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${isDarkMode ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                    PGCD({roundData.a}, {roundData.b})
                </div>
            </div>

            <LabChallenge
                type="text"
                current={round + 1}
                total={3}
                level={currentLevel}
                levelLabel={LEVEL_CONFIG[currentLevel].badge}
                counterPrefix="المسألة"
                question={
                    isAwaitingPGCD
                        ? `وصلت للخطوة الأخيرة! استنتج الآن قيمة PGCD(${roundData.a}, ${roundData.b}):`
                        : currentStep === 0
                        ? `الخطوة 1 من ${roundData.steps.length}: احسب الحاصل (q) والباقي (r) لقسمة ${current?.a} على ${current?.b}`
                        : `الخطوة ${currentStep + 1} من ${roundData.steps.length}: اكتب سطر القسمة الجديد برحيل (المقسوم a والمقسوم عليه b) ثم احسب (q و r)`
                }
                hint="خوارزمية إقليدس: a = b × q + r. المقسوم السابق (b) يصبح مقسوماً، والباقي (r) يصبح مقسوماً عليه حتى نصل للباقي 0."
                feedback={feedback}
                reward={reward}
                onRefresh={handleRefreshCurrent}
                onRestart={resetAll}
                sidePanel={<LabStepsPanel title="سجل القسمات الإقليدية" steps={stepsForPanel} />}
            >
                {/* ── واجهة التحدي التفاعلي ── */}
                <div className="w-full flex flex-col items-center justify-center gap-3">
                    {!isAwaitingPGCD && current && (
                        <div
                            className={`w-full p-4 sm:p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                                isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-indigo-50/40 border-indigo-100'
                            }`}
                        >
                            {/* سطر القسمة الإقليدية التفاعلي */}
                            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-base sm:text-xl font-mono font-black" dir="ltr">
                                
                                {/* خانة المقسوم a: معطى في الخطوة 1، وإدخال حر في الخطوات 2+ */}
                                <div className="flex flex-col items-center">
                                    {currentStep === 0 ? (
                                        <span className={`px-2.5 sm:px-3.5 py-1 rounded-xl border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white text-indigo-700 shadow-sm border-slate-200'}`}>
                                            {current.a}
                                        </span>
                                    ) : (
                                        <input
                                            ref={aInputRef}
                                            type="number"
                                            value={userA}
                                            onChange={e => setUserA(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') bInputRef.current?.focus();
                                            }}
                                            disabled={isSubmitting}
                                            aria-label="المقسوم a"
                                            placeholder="a"
                                            className={`w-16 sm:w-20 py-1 text-center text-lg sm:text-xl font-black rounded-xl border-2 outline-none transition-all ${
                                                error
                                                    ? 'border-rose-500 bg-rose-500/10'
                                                    : isDarkMode
                                                    ? 'bg-black/60 border-indigo-400 text-indigo-300 focus:border-indigo-300'
                                                    : 'bg-white border-indigo-300 text-indigo-800 focus:border-indigo-500'
                                            }`}
                                        />
                                    )}
                                    <span className="text-[9px] font-sans font-bold text-slate-400 mt-0.5">المقسوم (a)</span>
                                </div>

                                <span className="text-slate-400 mb-3">=</span>

                                {/* خانة المقسوم عليه b: معطى في الخطوة 1، وإدخال حر في الخطوات 2+ */}
                                <div className="flex flex-col items-center">
                                    {currentStep === 0 ? (
                                        <span className={`px-2.5 sm:px-3.5 py-1 rounded-xl border ${isDarkMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white text-purple-700 shadow-sm border-slate-200'}`}>
                                            {current.b}
                                        </span>
                                    ) : (
                                        <input
                                            ref={bInputRef}
                                            type="number"
                                            value={userB}
                                            onChange={e => setUserB(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') qInputRef.current?.focus();
                                            }}
                                            disabled={isSubmitting}
                                            aria-label="المقسوم عليه b"
                                            placeholder="b"
                                            className={`w-16 sm:w-20 py-1 text-center text-lg sm:text-xl font-black rounded-xl border-2 outline-none transition-all ${
                                                error
                                                    ? 'border-rose-500 bg-rose-500/10'
                                                    : isDarkMode
                                                    ? 'bg-black/60 border-purple-400 text-purple-300 focus:border-purple-300'
                                                    : 'bg-white border-purple-300 text-purple-800 focus:border-purple-500'
                                            }`}
                                        />
                                    )}
                                    <span className="text-[9px] font-sans font-bold text-slate-400 mt-0.5">المقسوم عليه (b)</span>
                                </div>

                                <span className="text-slate-400 mb-3">×</span>

                                {/* خانة إدخال الحاصل q */}
                                <div className="flex flex-col items-center">
                                    <input
                                        ref={qInputRef}
                                        type="number"
                                        value={userQ}
                                        onChange={e => setUserQ(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') rInputRef.current?.focus();
                                        }}
                                        disabled={isSubmitting}
                                        aria-label="الحاصل q"
                                        placeholder="q"
                                        className={`w-14 sm:w-16 py-1 text-center text-lg sm:text-xl font-black rounded-xl border-2 outline-none transition-all ${
                                            error
                                                ? 'border-rose-500 bg-rose-500/10'
                                                : isDarkMode
                                                ? 'bg-black/60 border-indigo-400 text-indigo-300 focus:border-indigo-300'
                                                : 'bg-white border-indigo-300 text-indigo-800 focus:border-indigo-500'
                                        }`}
                                    />
                                    <span className="text-[9px] font-sans font-bold text-slate-400 mt-0.5">الحاصل (q)</span>
                                </div>

                                <span className="text-slate-400 mb-3">+</span>

                                {/* خانة إدخال الباقي r */}
                                <div className="flex flex-col items-center">
                                    <input
                                        ref={rInputRef}
                                        type="number"
                                        value={userR}
                                        onChange={e => setUserR(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleStepSubmit();
                                        }}
                                        disabled={isSubmitting}
                                        aria-label="الباقي r"
                                        placeholder="r"
                                        className={`w-14 sm:w-16 py-1 text-center text-lg sm:text-xl font-black rounded-xl border-2 outline-none transition-all ${
                                            error
                                                ? 'border-rose-500 bg-rose-500/10'
                                                : isDarkMode
                                                ? 'bg-black/60 border-indigo-400 text-indigo-300 focus:border-indigo-300'
                                                : 'bg-white border-indigo-300 text-indigo-800 focus:border-indigo-500'
                                        }`}
                                    />
                                    <span className="text-[9px] font-sans font-bold text-slate-400 mt-0.5">الباقي (r)</span>
                                </div>
                            </div>

                            {/* زر تأكيد الخطوة الحالية */}
                            <button
                                onClick={handleStepSubmit}
                                disabled={isSubmitting}
                                className="w-full max-w-sm py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Send size={15} />
                                <span>تأكيد سطر القسمة</span>
                            </button>
                        </div>
                    )}

                    {/* ── مرحلة استنتاج الـ PGCD النهائي عند الوصول لباقي 0 ── */}
                    {isAwaitingPGCD && (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`w-full max-w-md p-4 sm:p-5 rounded-2xl border text-center flex flex-col items-center gap-3 ${
                                isDarkMode ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <Sparkles size={22} />
                            </div>

                            <div>
                                <h3 className={`text-sm sm:text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                    ما هو القاسم المشترك الأكبر؟
                                </h3>
                                <p className={`text-[11px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    وصلنا لباقٍ = 0. الـ PGCD هو آخر باقٍ غير معدوم.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-lg sm:text-xl font-black font-mono" dir="ltr">
                                <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}>
                                    PGCD({roundData.a}, {roundData.b}) =
                                </span>
                                <input
                                    ref={pgcdInputRef}
                                    type="number"
                                    value={userPGCD}
                                    onChange={e => setUserPGCD(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handlePGCDSubmit()}
                                    disabled={isSubmitting}
                                    placeholder="؟"
                                    className={`w-20 py-1 text-center text-xl font-black rounded-xl border-2 outline-none transition-all ${
                                        error
                                            ? 'border-rose-500 bg-rose-500/10'
                                            : isDarkMode
                                            ? 'bg-black/80 border-emerald-400 text-emerald-300 focus:border-emerald-300'
                                            : 'bg-white border-emerald-400 text-emerald-800 focus:border-emerald-600'
                                    }`}
                                />
                            </div>

                            <button
                                onClick={handlePGCDSubmit}
                                disabled={isSubmitting}
                                className="w-full max-w-sm py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <CheckCircle2 size={15} />
                                <span>تأكيد النتيجة والانتقال للمسألة التالية</span>
                            </button>
                        </motion.div>
                    )}
                </div>
            </LabChallenge>

            {/* ── نافذة التذكير السريع بالقاعدة (Quick Rule Modal) ── */}
            <AnimatePresence>
                {showRuleModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowRuleModal(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
                        dir="rtl"
                    >
                        <motion.div
                            initial={{ scale: 0.92, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.92, y: 15 }}
                            onClick={e => e.stopPropagation()}
                            className={`max-w-sm w-full p-5 rounded-2xl border shadow-2xl relative ${
                                isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                        >
                            <button
                                onClick={() => setShowRuleModal(false)}
                                className={`absolute top-3.5 left-3.5 p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                                }`}
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                    <Lightbulb size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black">قاعدة خوارزمية إقليدس</h3>
                                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>القسمات الإقليدية المتتالية</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs font-medium leading-relaxed">
                                <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                    <p className="font-bold text-[11px] text-indigo-400 mb-0.5">1. مساواة القسمة:</p>
                                    <p className="font-mono text-center text-sm font-black my-0.5" dir="ltr">a = b × q + r</p>
                                    <p className="text-[10px] text-slate-400 text-center">شرط الباقي: (0 ≤ r &lt; b)</p>
                                </div>

                                <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                    <p className="font-bold text-[11px] text-indigo-400 mb-0.5">2. ترحيل القيم:</p>
                                    <p className="text-[11px]">
                                        المقسوم عليه القديم <span className="font-bold text-purple-400">(b)</span> يصبح مقسوماً، والباقي القديم <span className="font-bold text-indigo-400">(r)</span> يصبح مقسوماً عليه.
                                    </p>
                                </div>

                                <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                                    <p className="font-bold text-[11px] mb-0.5">3. القاسم المشترك الأكبر:</p>
                                    <p className="text-[11px]">
                                        عند الوصول لـ <span className="font-black">الباقي = 0</span>، يكون <span className="font-black">PGCD</span> هو <strong>آخر باقٍ غير معدوم</strong>.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowRuleModal(false)}
                                className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs transition-all cursor-pointer"
                            >
                                فهمت، متابعة التمرين 🚀
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PGCDEuclideanLab() {
    return (
        <LabShell
            labId="pgcd-euclidean"
            phase="practice"
            title="خوارزمية إقليدس"
            badgeText="القسمات الإقليدية المتتالية"
            badgeIcon={Divide}
            accentColor="indigo"
        >
            <PGCDEuclideanContent phase="practice" setPhase={() => {}} />
        </LabShell>
    );
}
