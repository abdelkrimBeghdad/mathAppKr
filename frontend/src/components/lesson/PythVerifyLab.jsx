import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function PythVerifyContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [problem, setProblem] = useState({ a: 3, b: 4, c: 5, isRight: true });
    const [step, setStep] = useState(0); // 0: اختيار، 1: تم
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'متى يكون المثلث قائماً؟',
            detail: 'المثلث قائم إذا وفقط إذا كان مربع أطول ضلع يساوي مجموع مربعي الضلعين الآخرين.',
            math: 'AC² = AB² + BC² ؟',
        },
        {
            title: 'خطوات التحقق',
            detail: 'حدد أطول ضلع (AC)، احسب AC² ثم AB² + BC²، وقارن: إذا تساويا → قائم، وإلا → ليس قائماً.',
            math: 'AC² = AB² + BC² → 25 = 25 ✓',
        },
    ];

    const problems = [
        { a: 3, b: 4, c: 5, isRight: true }, { a: 5, b: 12, c: 13, isRight: true },
        { a: 8, b: 15, c: 17, isRight: true }, { a: 3, b: 5, c: 7, isRight: false },
        { a: 4, b: 6, c: 8, isRight: false }, { a: 7, b: 24, c: 25, isRight: true },
        { a: 2, b: 3, c: 4, isRight: false }, { a: 6, b: 8, c: 10, isRight: true },
    ];

    const generateProblem = () => {
        const p = problems[Math.floor(Math.random() * problems.length)];
        setProblem(p);
        setPhase('practice');
        setStep(0);
        setError(false);
        setFeedback(null);
        setReward(null);
    };

    const handleAnswer = (userAnswer) => {
        if (userAnswer === problem.isRight) {
            setStep(1);
            setFeedback({ type: 'success', text: 'إجابة صحيحة! تحققت من الخاصية بدقة.' });
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            rewardService.claimLabReward('pyth-verify').then(d => d.status === 'success' && setReward(d)).catch(console.error);
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع الحساب: قارن AC² مع AB² + BC².' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>شرط المثلث القائم:</h3>
                <div className={`p-3 rounded-xl border text-center mb-3 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-rose-50 border-rose-100'}`}>
                    <div className={`text-base font-black font-mono ${theme.textMain}`} dir="ltr">
                        AC² = AB² + BC² <span className="text-rose-400">?</span>
                    </div>
                </div>
                <p className={`text-sm ${theme.textSub}`}>إذا تحقق الشرط → المثلث قائم.</p>
                <button
                    onClick={() => setPhase('learn')}
                    className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'}`}
                >
                    تعلّم الطريقة
                </button>
            </div>
            <motion.button
                onClick={generateProblem}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-rose-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Triangle size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">ابدأ التحقق</span>
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
                        <div className={`p-5 rounded-2xl border-2 border-rose-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-rose-50'}`}>
                            <span className="font-mono font-black text-rose-400" dir="ltr">{learnPages[learnStep].math}</span>
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
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black">التالي</button>
                    : <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">ابدأ التحقق</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge بنوع choice ───────────────────────────
    return (
        <LabChallenge
            type="choice"
            current={1}
            total={1}
            level={1}
            question="هل هذا المثلث قائم الزاوية؟"
            hint="قارن AC² مع مجموع AB² + BC². إذا تساويا فالمثلث قائم."
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">

                {/* رسم المثلث */}
                <svg width="150" height="105" viewBox="0 0 200 140">
                    <path d="M40 120 L40 30 L160 120 Z" fill="none" stroke={isDarkMode ? '#f43f5e' : '#e11d48'} strokeWidth="3" strokeLinejoin="round" />
                    <path d="M40 105 L55 105 L55 120" fill="none" stroke={isDarkMode ? '#f43f5e' : '#e11d48'} strokeWidth="2" />
                    <text x="25" y="25" fontSize="14" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>A</text>
                    <text x="25" y="135" fontSize="14" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>B</text>
                    <text x="165" y="135" fontSize="14" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>C</text>
                    <text x="15" y="80" fontSize="12" fill={isDarkMode ? '#94a3b8' : '#64748b'} fontWeight="bold">AB={problem.a}</text>
                    <text x="90" y="138" fontSize="12" fill={isDarkMode ? '#94a3b8' : '#64748b'} fontWeight="bold">BC={problem.b}</text>
                    <text x="110" y="65" fontSize="13" fill="#fbbf24" fontWeight="bold">AC={problem.c}</text>
                </svg>

                {/* عرض الحساب */}
                <div className={`w-full p-3 rounded-xl border font-mono text-sm text-center ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} ${theme.textMain}`} dir="ltr">
                    <div>AC² = {problem.c * problem.c}</div>
                    <div>AB² + BC² = {problem.a * problem.a} + {problem.b * problem.b} = {problem.a * problem.a + problem.b * problem.b}</div>
                    <div className="mt-1 font-black text-rose-400">
                        {problem.c * problem.c} {problem.c * problem.c === problem.a * problem.a + problem.b * problem.b ? '=' : '≠'} {problem.a * problem.a + problem.b * problem.b}
                    </div>
                </div>

                {/* أزرار نعم/لا */}
                <div className="flex gap-3 w-full" role="group" aria-label="هل المثلث قائم">
                    <button
                        onClick={() => handleAnswer(true)}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white ${error ? 'opacity-60' : ''}`}
                    >
                        <Check size={18} /> نعم، قائم
                    </button>
                    <button
                        onClick={() => handleAnswer(false)}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white ${error ? 'opacity-60' : ''}`}
                    >
                        <X size={18} /> لا، ليس قائماً
                    </button>
                </div>
            </div>
        </LabChallenge>
    );
}

export default function PythVerifyLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="pyth-verify"
            phase={phase}
            title="هل المثلث قائم الزاوية؟"
            badgeText="فيثاغورس — التحقق"
            badgeIcon={Triangle}
            accentColor="rose"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <PythVerifyContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
