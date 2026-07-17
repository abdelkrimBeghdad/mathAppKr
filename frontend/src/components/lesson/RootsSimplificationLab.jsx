import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Target, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { rewardService } from '../../utils/rewardService';

function RootsSimplificationContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(1);
    const [step, setStep] = useState(0); // 0: تفكيك، 1: تحرير الجذر
    const [practicePair, setPracticePair] = useState({ n: 50, square: 25, root: 5, remainder: 2 });
    const [inputA, setInputA] = useState('');
    const [inputB, setInputB] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const options = [
        { n: 50, square: 25, root: 5, remainder: 2 }, { n: 75, square: 25, root: 5, remainder: 3 },
        { n: 32, square: 16, root: 4, remainder: 2 }, { n: 20, square: 4, root: 2, remainder: 5 },
        { n: 45, square: 9, root: 3, remainder: 5 }, { n: 72, square: 36, root: 6, remainder: 2 },
        { n: 8, square: 4, root: 2, remainder: 2 }, { n: 12, square: 4, root: 2, remainder: 3 },
        { n: 18, square: 9, root: 3, remainder: 2 }, { n: 24, square: 4, root: 2, remainder: 6 },
        { n: 27, square: 9, root: 3, remainder: 3 }, { n: 28, square: 4, root: 2, remainder: 7 },
    ];

    const generateProblem = () => {
        const newProb = options[Math.floor(Math.random() * options.length)];
        setPracticePair(newProb);
        setPhase('practice');
        setStep(0);
        setInputA(''); setInputB('');
        setError(false); setFeedback(null); setReward(null);
        labProgressService.update('roots-simplification', 'practice').catch(() => { });
    };

    const handleCheck = async () => {
        const isStep0Correct = parseInt(inputA) === practicePair.square && parseInt(inputB) === practicePair.remainder;
        const isStep1Correct = parseInt(inputA) === practicePair.root && parseInt(inputB) === practicePair.remainder;
        const isCorrect = step === 0 ? isStep0Correct : isStep1Correct;

        if (isCorrect) {
            setError(false);
            if (step === 0) {
                setFeedback({ type: 'success', text: 'صحيح! الآن استخرج الجذر التربيعي للمربع التام.' });
                setInputA(''); setInputB('');
                setTimeout(() => { setStep(1); setFeedback(null); }, 900);
            } else {
                setFeedback({ type: 'success', text: 'تفكيك مثالي! وصلت لأبسط صورة للجذر.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('roots-simplification', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('roots-simplification-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: step === 0 ? 'ابحث عن مربع تام يقسم العدد بدون باقٍ.' : 'استخرج الجذر التربيعي للمربع التام الذي وجدته.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>قانون التبسيط:</h3>
                <div className={`p-4 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-rose-50 border-rose-100'}`}>
                    <div className="text-sm font-black font-mono flex flex-wrap items-center justify-center gap-2" dir="ltr">
                        <span className={theme.textMain}>√n</span>
                        <span className={theme.textMain}>=</span>
                        <span className="text-emerald-400">√(a²×b)</span>
                        <span className={theme.textMain}>=</span>
                        <span className="text-orange-400">a√b</span>
                    </div>
                </div>
                <button onClick={() => { setPhase('learn'); setLearnStep(1); }} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'}`}>
                    مشاهدة الشرح
                </button>
            </div>
            <motion.button onClick={generateProblem} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-rose-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Target size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء التحدي</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <div className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}>
                <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>خطوات التبسيط</h3>
                <div className="flex flex-col gap-3 items-center">
                    <div className={`p-4 rounded-2xl border w-full max-w-xs ${isDarkMode ? 'bg-black/40 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                        <span className="font-mono font-black text-rose-400 text-xl" dir="ltr">√50</span>
                    </div>
                    <ArrowRight className="rotate-90 text-rose-400" size={18} />
                    <div className={`p-4 rounded-2xl border w-full max-w-xs ${isDarkMode ? 'bg-black/40 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                        <span className="font-mono font-black text-xl" dir="ltr">
                            <span className="text-rose-400">√(</span>
                            <span className="text-emerald-400">25</span>
                            <span className={theme.textMain}> × </span>
                            <span className="text-orange-400">2</span>
                            <span className="text-rose-400">)</span>
                        </span>
                    </div>
                    <ArrowRight className="rotate-90 text-rose-400" size={18} />
                    <div className={`p-4 rounded-2xl border w-full max-w-xs ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="font-mono font-black text-xl" dir="ltr">
                            <span className={theme.textMain}>5</span>
                            <span className="text-rose-400">√</span>
                            <span className="text-orange-400">2</span>
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>السابق</button>
                <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">ابدأ التحدي</button>
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={step + 1}
            total={2}
            level={2}
            question={`√${practicePair.n}`}
            hint={step === 0 ? 'ابحث عن مربع تام (4، 9، 16، 25...) يقسم العدد بدون باقٍ.' : 'استخرج الجذر التربيعي للمربع التام الذي وجدته.'}
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            <div className="flex flex-wrap items-center justify-center gap-3 font-mono font-black text-lg" dir="ltr">
                {step === 0 ? (
                    <>
                        <span className="text-rose-500">√(</span>
                        <input type="number" value={inputA} onChange={e => setInputA(e.target.value)} aria-label="المربع التام" autoFocus
                            className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="a²" />
                        <span className={`opacity-40 ${theme.textMain}`}>×</span>
                        <input type="number" value={inputB} onChange={e => setInputB(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheck()} aria-label="الباقي تحت الجذر"
                            className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-orange-500/50 text-orange-400' : 'bg-white border-orange-200 text-orange-700'}`} placeholder="b" />
                        <span className="text-rose-500">)</span>
                    </>
                ) : (
                    <>
                        <input type="number" value={inputA} onChange={e => setInputA(e.target.value)} aria-label="جذر المربع التام" autoFocus
                            className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-700'}`} placeholder="a" />
                        <span className="text-rose-500">√</span>
                        <input type="number" value={inputB} onChange={e => setInputB(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheck()} aria-label="الباقي تحت الجذر"
                            className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-orange-500/50 text-orange-400' : 'bg-white border-orange-200 text-orange-700'}`} placeholder="b" />
                    </>
                )}
            </div>
            <button onClick={handleCheck} className="mt-4 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <CheckCircle2 size={18} /> {step === 0 ? 'تأكيد التفكيك' : 'تأكيد التحرير'}
            </button>
        </LabChallenge>
    );
}

export default function RootsSimplificationLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="roots-simplification"
            phase={phase}
            title="تبسيط الجذور التربيعية"
            badgeText="بروتوكول تحويل الجذور"
            badgeIcon={Target}
            accentColor="rose"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <RootsSimplificationContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
