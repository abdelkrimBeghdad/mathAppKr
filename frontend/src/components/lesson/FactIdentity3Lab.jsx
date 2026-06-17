import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Zap, ArrowDown, Calculator, CheckCircle2, Zap as ZapIcon, Target, BookOpen, ArrowRight, Send, Cpu, Binary, Sigma, Layers, Scissors, Split, BrainCircuit, Rocket, ShieldCheck, Microscope } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function FactIdentity3Lab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [problem, setProblem] = useState({ b: 9 });
    const [step, setStep] = useState(1); // 1: root1, 2: root2, 3: build result, 4: reward
    const [error, setError] = useState(false);
    const [inputB, setInputB] = useState('');
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'بروتوكول الانشطار الجبري',
            detail: 'تحليل المتطابقة الثالثة هو تفكيك الفرق بين مربعين إلى قوسين متناظرين، أحدهما يمثل الفرق والآخر يمثل المجموع.',
            math: 'a\u00b2 - b\u00b2 = (a - b)(a + b)',
            icon: <Split size={20} />
        },
        {
            title: 'خوارزمية الجذور المتناظرة',
            detail: 'نستخرج جذري الحدين، ثم نضعهما في قوسين؛ أحدهما بعلامة (-) والآخر بعلامة (+). الترتيب لا يهم، لكن التناظر ضروري.',
            math: '\u221a(a\u00b2) \u2192 a , \u221a(b\u00b2) \u2192 b',
            icon: <Binary size={20} />
        }
    ];

    const generateProblem = () => {
        const b = Math.floor(Math.random() * 8) + 2; 
        setProblem({ b });
        setPhase('practice');
        setStep(1);
        setInputB('');
        setError(false);
        setReward(null);
    };

    const handleFirstTermClick = () => { if (step === 1) setStep(2); };
    const handleLastTermClick = () => { if (step === 2) setStep(3); };

    const checkMastery = async () => {
        if (parseInt(inputB) === problem.b) {
            setStep(4);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                const data = await rewardService.claimLabReward('fact-identity-3');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    const theme = {
        container: isDarkMode ? 'bg-slate-950 border-white/5 shadow-3xl' : 'bg-white border-slate-100 shadow-2xl',
        card: isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-100 shadow-xl',
        textMain: isDarkMode ? 'text-white' : 'text-slate-900',
        textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    };

    return (
        <div className={`w-full h-full min-h-[300px] max-h-[85vh] ${theme.container} rounded-[1rem] md:rounded-[1.5rem] p-4 md:p-6 relative overflow-hidden flex flex-col font-sans border transition-all duration-500`} dir="rtl">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-4 pt-2">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-600 border-cyan-100 shadow-sm'}`}>
                                <Split size={14} /> الانشطار الجبري #3
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>تحليل فرق المربعين</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-600 border-cyan-100'}`}>
                                {step < 3 ? 'رصد الجذور' : step === 3 ? 'الانشطار النهائي' : 'اكتمال المهمة'}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {step === 1 && 'استخرج جذر x²'}
                                {step === 2 && `استخرج جذر ${problem.b * problem.b}`}
                                {step === 3 && 'فكك العبارة إلى قوسين'}
                                {step === 4 && 'تم بنجاح!'}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                             <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>خوارزمية التفكيك:</h3>
                             <div className="p-4 rounded-xl bg-black/20 border border-white/5 font-mono text-center text-sm text-cyan-400">
                                a² - b² = (a - b)(a + b)
                             </div>
                             <button onClick={() => setPhase('learn')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">فتح دليل الانشطار</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group rounded-[1rem] shadow-2xl overflow-hidden">
                            <div className={`absolute inset-0 bg-cyan-600`} />
                            <div className="relative p-8 flex flex-col items-center justify-center text-white gap-2">
                                <Split size={40} />
                                <span className="font-black text-xl italic uppercase tracking-widest">تفعيل الانشطار</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="flex flex-col items-center text-center">
                                 <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                 <p className={`text-sm md:text-base ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                                 <div className={`p-6 rounded-2xl border-2 border-cyan-500/30 bg-black/40 mb-4 w-full`}>
                                     <span className="text-sm md:text-base font-mono font-black text-cyan-400" dir="ltr">{learnPages[learnStep].math}</span>
                                 </div>
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                             {learnStep < 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-cyan-500 hover:bg-indigo-600 text-white rounded-xl font-black shadow-glow text-lg">التالي</button>
                             ) : (
                                 <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-glow text-lg">دخول المختبر</button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="flex flex-col items-center w-full max-w-5xl px-2">
                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center relative overflow-hidden transition-all duration-700 ${step === 4 ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                            <div className="relative flex items-center justify-center w-full text-base md:text-lg font-black font-mono z-20 gap-4" dir="ltr">
                                <motion.div onClick={handleFirstTermClick} className={`px-4 py-2 rounded-xl cursor-pointer transition-all relative ${step >= 2 ? 'text-sky-400 bg-sky-500/10' : step === 1 ? theme.textMain + ' animate-pulse bg-white/5 shadow-glow-cyan' : 'text-slate-800 opacity-20'}`}>
                                    <span>x</span><span className="absolute -top-2 -right-2 text-xl italic">2</span>
                                </motion.div>
                                <span className="text-rose-500 italic opacity-80 animate-pulse font-black mx-4">-</span>
                                <motion.div onClick={handleLastTermClick} className={`px-4 py-2 rounded-xl cursor-pointer transition-all ${step >= 3 ? 'text-amber-500 bg-amber-500/10' : step === 2 ? theme.textMain + ' animate-pulse bg-white/5 shadow-glow-cyan' : 'text-slate-800 opacity-20'}`}>{problem.b * problem.b}</motion.div>
                            </div>

                            <div className="flex items-center justify-around w-full mt-6 pt-4 border-t border-white/5">
                                <AnimatePresence>
                                    {step >= 2 && (
                                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-1">
                                            <ArrowDown size={20} className="text-sky-500" />
                                            <div className={`px-4 py-2 rounded-xl border font-mono text-sm md:text-base ${isDarkMode ? 'bg-black/40 border-sky-500/30 text-sky-400' : 'bg-sky-50 text-sky-600'}`}>x</div>
                                        </motion.div>
                                    )}
                                    {step >= 3 && (
                                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-1">
                                            <ArrowDown size={20} className="text-amber-500" />
                                            <div className={`px-4 py-2 rounded-xl border font-mono text-sm md:text-base ${isDarkMode ? 'bg-black/40 border-amber-500/30 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>{problem.b}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <AnimatePresence>
                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-3xl px-4">
                                    <div className={`p-4 md:p-5 rounded-[1rem] border shadow-2xl backdrop-blur-3xl mb-4 ${theme.card}`}>
                                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base font-black font-mono text-white" dir="ltr">
                                            <div className="flex items-center gap-2 p-4 rounded-2xl bg-black/40 border border-white/5">
                                                <span className="text-slate-800 opacity-40 italic">(</span>
                                                <span className="text-sky-400">x</span>
                                                <span className="text-rose-500 italic">-</span>
                                                <input type="number" value={inputB} onChange={(e) => setInputB(e.target.value)} className={`w-20 md:w-28 bg-black/60 border-2 rounded-xl text-center p-2 outline-none transition-all ${error ? 'border-rose-500 animate-shake' : 'border-cyan-500/50 text-cyan-400 focus:border-cyan-400'}`} placeholder="?" autoFocus />
                                                <span className="text-slate-800 opacity-40 italic">)</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-4 rounded-2xl bg-black/40 border border-white/5 opacity-80 scale-95">
                                                <span className="text-slate-800 opacity-40 italic">(</span>
                                                <span className="text-sky-400">x</span>
                                                <span className="text-emerald-500 italic">+</span>
                                                <span className="text-amber-400">{inputB || '?'}</span>
                                                <span className="text-slate-800 opacity-40 italic">)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={checkMastery} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-xl shadow-glow-cyan flex items-center justify-center gap-4"><CheckCircle2 size={20} /> تأكيد الانشطار</button>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-2xl px-2 overflow-y-auto max-h-[300px]">
                                    <div className="bg-emerald-500/10 border-2 border-emerald-500/50 rounded-[1.5rem] p-8 shadow-glow-emerald backdrop-blur-3xl">
                                        <div className="text-xl md:text-2xl font-mono font-black text-white flex flex-wrap items-center justify-center gap-4 md:gap-4" dir="ltr">
                                            <div className="flex items-center"><span className="text-slate-800 opacity-40">(</span><span className="text-sky-400">x</span><span className="text-rose-500 mx-2">-</span><span className="text-amber-400">{problem.b}</span><span className="text-slate-800 opacity-40">)</span></div>
                                            <div className="flex items-center"><span className="text-slate-800 opacity-40">(</span><span className="text-sky-400">x</span><span className="text-emerald-500 mx-2">+</span><span className="text-amber-400">{problem.b}</span><span className="text-slate-800 opacity-40">)</span></div>
                                        </div>
                                    </div>
                                    <MasteryRewardCard reward={reward} />
                                    <button onClick={generateProblem} className="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-xl shadow-3xl transition-all">تحليل جديد</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {phase !== 'intro' && step < 4 && (
                <div className="absolute bottom-4 right-4 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={14} className="text-cyan-400" /> <span>الرجوع</span>
                    </button>
                </div>
            )}
        </div>
    );
}
