import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import { rewardService } from '../../utils/rewardService';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function ExpansionSimpleContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [level, setLevel] = useState(1);
    const [practiceStep, setPracticeStep] = useState(1);
    const [problem, setProblem] = useState({ a: 5, b: 3, op: '+' });
    const [inputs, setInputs] = useState({ term1: '', term2: '' });
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('expansion-simple')
            .then(progress => { if (progress) setLevel(difficultyEngine.getLevel(progress)); })
            .catch(() => { });
    }, []);

    const learnContent = [
        { title: 'بروتوكول التوزيع', detail: 'النشر البسيط هو عملية توزيع الضرب على الجمع أو الطرح داخل الأقواس لإزالة الحواجز الجبرية.', math: 'a(x + b) = ax + ab', icon: <Rocket size={20} /> },
        { title: 'خوارزمية الإسقاط', detail: 'نقوم بضرب العامل الخارجي (a) في الحد الأول (x)، ثم في الحد الثاني (b).', math: 'a × x → ax', icon: <Target size={20} /> },
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('expansion', level);
        const maxA = params.maxCoeff ? Math.min(params.maxCoeff, 7) : 6;
        const a = Math.floor(Math.random() * maxA) + 2;
        const b = Math.floor(Math.random() * 8) + 1;
        const op = Math.random() > 0.5 ? '+' : '-';
        setProblem({ a, b, op });
        setPhase('practice');
        setPracticeStep(1);
        setInputs({ term1: '', term2: '' });
        setError(false); setFeedback(null); setReward(null);
        labProgressService.update('expansion-simple', 'practice').catch(() => { });
    };

    const handleCheck = async () => {
        const targetTerm2 = problem.op === '+' ? problem.a * problem.b : -(problem.a * problem.b);
        if (parseInt(inputs.term1) === problem.a && parseInt(inputs.term2) === targetTerm2) {
            setPracticeStep(5);
            setFeedback({ type: 'success', text: 'نشر مثالي! وزّعت العامل الخارجي بدقة.' });
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            await labProgressService.update('expansion-simple', 'completed', 100).catch(() => { });
            try {
                const res = await rewardService.claimLabReward('expansion-simple');
                if (res.status === 'success') setReward(res);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: اضرب العامل الخارجي في كل حد داخل القوس.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>القاعدة الأساسية:</h3>
                <div className={`p-4 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-50 border-indigo-100'}`}>
                    <span className="font-mono font-black text-indigo-400 text-base" dir="ltr">a(x + b) = ax + ab</span>
                </div>
                <button onClick={() => setPhase('learn')} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}>
                    الشرح النظري
                </button>
            </div>
            <motion.button onClick={generateProblem} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Rocket size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء التدريب</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">{learnContent[learnStep].icon}</div>
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnContent[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnContent[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <span className="font-mono font-black text-indigo-400" dir="ltr">{learnContent[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >السابق</button>
                {learnStep < learnContent.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">دخول التجربة</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    const hints = [
        'اضغط على العامل الخارجي للبدء بالتوزيع.',
        'اضغط على الحد الأول داخل القوسين لضربه.',
        'اضغط على الحد الثاني لضربه وكتابة النتيجة النهائية.',
        'أدخل نتيجتي الضرب: العامل × x، ثم العامل × الحد الثاني.',
    ];

    return (
        <LabChallenge
            type="visual"
            current={1}
            total={1}
            level={level}
            hint={hints[Math.min(practiceStep - 1, 3)]}
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                {/* عرض المسألة مع أقواس التوزيع البصرية */}
                <div className="relative">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 100" preserveAspectRatio="xMidYMid meet">
                        <AnimatePresence>
                            {practiceStep >= 2 && (
                                <motion.path d="M 120 50 Q 160 5, 200 50" fill="none" stroke="url(#g1)" strokeWidth="2.5" strokeLinecap="round"
                                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.7 }} />
                            )}
                        </AnimatePresence>
                        <AnimatePresence>
                            {practiceStep >= 3 && (
                                <motion.path d="M 120 50 Q 190 -10, 280 50" fill="none" stroke="url(#g2)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4"
                                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.15 }} />
                            )}
                        </AnimatePresence>
                        <defs>
                            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#38bdf8" /></linearGradient>
                            <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
                        </defs>
                    </svg>

                    <div className="text-2xl md:text-3xl font-black font-mono flex justify-center items-center gap-2 relative" dir="ltr">
                        <motion.span
                            className={`px-2 py-1 rounded-lg cursor-pointer ${practiceStep >= 2 ? 'text-indigo-400 bg-indigo-500/10' : theme.textMain}`}
                            animate={practiceStep === 1 ? { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] } : {}}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            onClick={() => practiceStep === 1 && setPracticeStep(2)}
                        >{problem.a}</motion.span>
                        <span className={`opacity-30 ${theme.textMain}`}>(</span>
                        <motion.span
                            className={`px-2 py-1 rounded-lg cursor-pointer ${practiceStep >= 3 ? 'text-sky-400 bg-sky-500/10' : practiceStep === 2 ? theme.textMain : `${theme.textMain} opacity-30`}`}
                            animate={practiceStep === 2 ? { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] } : {}}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            onClick={() => practiceStep === 2 && setPracticeStep(3)}
                        >x</motion.span>
                        <span className={`opacity-30 ${theme.textMain}`}>{problem.op}</span>
                        <motion.span
                            className={`px-2 py-1 rounded-lg cursor-pointer ${practiceStep >= 4 ? 'text-emerald-400 bg-emerald-500/10' : practiceStep === 3 ? theme.textMain : `${theme.textMain} opacity-30`}`}
                            animate={practiceStep === 3 ? { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] } : {}}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            onClick={() => practiceStep === 3 && setPracticeStep(4)}
                        >{problem.b}</motion.span>
                        <span className={`opacity-30 ${theme.textMain}`}>)</span>
                    </div>
                </div>

                {/* Input Form */}
                {practiceStep === 4 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
                        <div className="flex items-center justify-center gap-2 font-mono font-black text-lg" dir="ltr">
                            <input type="number" value={inputs.term1} onChange={e => setInputs({ ...inputs, term1: e.target.value })} aria-label="حاصل ضرب الحد الأول" autoFocus
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400' : 'bg-white border-indigo-200 text-indigo-700'}`} placeholder="؟" />
                            <span className={theme.textMain}>x</span>
                            <span className={theme.textMain}>{problem.op}</span>
                            <input type="number" value={inputs.term2} onChange={e => setInputs({ ...inputs, term2: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleCheck()} aria-label="حاصل ضرب الحد الثاني"
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="؟" />
                        </div>
                        <button onClick={handleCheck} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                            <CheckCircle2 size={18} /> تحقق من النشر
                        </button>
                    </motion.div>
                )}

                {/* Result */}
                {practiceStep === 5 && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-2xl border-2 font-mono font-black text-lg ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
                        dir="ltr"
                    >
                        {problem.a}x {problem.op} {problem.a * problem.b}
                    </motion.div>
                )}
            </div>
        </LabChallenge>
    );
}

export default function ExpansionSimpleLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="expansion-simple"
            phase={phase}
            title="مفاعل النشر البسيط"
            badgeText="تحدي التوزيع الجبري"
            badgeIcon={Rocket}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <ExpansionSimpleContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
