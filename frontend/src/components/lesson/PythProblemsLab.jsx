import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function PythProblemsContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [problem, setProblem] = useState(null);
    const [step, setStep] = useState(0); // 0: إدخال، 1: تم
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ترييض مشكل هندسي',
            detail: 'تستخدم نظرية فيثاغورس لحل مسائل من الواقع تتضمن أطوالاً مجهولة في مسارات متعامدة.',
            math: 'تخيل الموقف وارسم مثلثاً',
        },
        {
            title: 'خطوات الحل',
            detail: 'اقرأ المسألة وارسم شكلاً تقريبياً، حدد الزاوية القائمة والوتر، ثم طبّق نظرية فيثاغورس لإيجاد المجهول.',
            math: 'c² = a² + b²',
        },
    ];

    const problems = [
        { q: 'سلم طوله 5m متكئ على حائط. إذا كانت المسافة بين أسفل السلم والحائط 3m، فما هو ارتفاع قمة السلم عن الأرض؟', ans: 4 },
        { q: 'مشى سعيد 6km شرقاً ثم 8km شمالاً. كم المسافة المباشرة بين نقطة البداية والنهاية؟', ans: 10 },
        { q: 'شجرة انكسرت، قمتها تلامس الأرض على بعد 5m من الجذع. إذا كان ارتفاع الجزء المتبقي 12m، فما طول الجزء المنكسر؟', ans: 13 },
        { q: 'طائرة ورقية تحلق بخيط طوله 25m. إذا كانت المسافة الأفقية بين الطفل والطائرة 24m، فما ارتفاع الطائرة؟', ans: 7 },
    ];

    const generateProblem = () => {
        const p = problems[Math.floor(Math.random() * problems.length)];
        setProblem(p);
        setPhase('practice');
        setStep(0);
        setInputVal('');
        setError(false);
        setFeedback(null);
        setReward(null);
    };

    const handleCheck = () => {
        if (parseInt(inputVal) === problem.ans) {
            setStep(1);
            setFeedback({ type: 'success', text: 'ممتاز! حللت المسألة الهندسية بدقة.' });
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            rewardService.claimLabReward('pyth-problems').then(d => d.status === 'success' && setReward(d)).catch(console.error);
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'حاول رسم المسألة كمثلث، وحدد الوتر والضلعين القائمين.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>سر النجاح:</h3>
                <div className={`p-3 rounded-xl border text-center mb-3 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-amber-50 border-amber-100'}`}>
                    <div className={`text-base font-black ${theme.textMain}`}>حوّل النص إلى رسم هندسي</div>
                </div>
                <p className={`text-sm ${theme.textSub}`}>بمجرد تحديد الوتر والضلعين القائمين، تصبح المسألة عملية حسابية بسيطة.</p>
                <button
                    onClick={() => setPhase('learn')}
                    className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'}`}
                >
                    كيف أبدأ؟
                </button>
            </div>
            <motion.button
                onClick={generateProblem}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-amber-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Map size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">اكتشف مسألة</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={learnStep}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl ${theme.card}`}
                >
                    <div className="flex flex-col items-center text-center">
                        <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-amber-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-amber-50'}`}>
                            <span className="font-mono font-black text-amber-400" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button
                    onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    السابق
                </button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black">التالي</button>
                    : <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">أرني مسألة</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    if (!problem) return null;
    return (
        <LabChallenge
            type="text"
            current={1}
            total={1}
            level={2}
            question={`"${problem.q}"`}
            hint="ارسم المسألة كمثلث قائم، وحدد الوتر والضلعين القائمين قبل التطبيق."
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <span className={`text-sm font-bold ${theme.textSub}`}>اكتب الجواب النهائي (رقم فقط):</span>
                <input
                    type="number"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCheck()}
                    aria-label="أدخل الجواب"
                    dir="ltr"
                    className={`w-32 rounded-xl text-center p-3 text-xl font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400 focus:border-amber-400' : 'bg-white border-amber-200 text-amber-700 focus:border-amber-500'
                        }`}
                    placeholder="?"
                    autoFocus
                />
                <button
                    onClick={handleCheck}
                    className="px-8 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black flex items-center gap-2 transition-all"
                >
                    <CheckCircle2 size={18} /> تحقق من الإجابة
                </button>
            </div>
        </LabChallenge>
    );
}

export default function PythProblemsLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="pyth-problems"
            phase={phase}
            title="مسائل فيثاغورس التطبيقية"
            badgeText="تطبيقات واقعية"
            badgeIcon={Map}
            accentColor="amber"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <PythProblemsContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
