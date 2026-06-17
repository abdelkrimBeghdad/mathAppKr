import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowDown, CheckCircle2, RotateCcw, Calculator, Zap as ZapIcon, Target, BookOpen, Layers, Coins, Award, ArrowRight, Send, Cpu, Binary, Sigma, Microscope, BrainCircuit, Box, Boxes, Rocket, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function VisualFactorizationLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [problem, setProblem] = useState({ a: 4, c: 3 }); 
    const [step, setStep] = useState(1); // 1: split, 2: select factor, 3: input result, 4: reward
    const [error, setError] = useState(false);
    const [term1Split, setTerm1Split] = useState(false);
    const [term2Split, setTerm2Split] = useState(false);
    const [selectedFactors, setSelectedFactors] = useState({ left: false, right: false });
    const [inputs, setInputs] = useState({ outer: '', inner: '' });
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'بروتوكول الاستخلاص الجبري',
            detail: 'التحليل هو العملية العكسية للنشر، حيث نبحث عن "العامل المشترك" الذي يتكرر في كل الحدود لسحبه خارجاً.',
            math: 'ax + ab = a(x + b)',
            icon: <Microscope size={20} />
        },
        {
            title: 'خوارزمية التفكيك',
            detail: 'نقوم بتفكيك كل حد لنرى بوضوح الأرقام المختبئة داخله، ثم نحدد العنصر المكرر بدقة.',
            math: '4x + 12 = (4 \u00d7 x) + (4 \u00d7 3)',
            icon: <Binary size={20} />
        }
    ];

    const generateProblem = () => {
        const a = Math.floor(Math.random() * 6) + 2; 
        const c = Math.floor(Math.random() * 7) + 2; 
        setProblem({ a, c });
        setPhase('practice');
        setStep(1);
        setTerm1Split(false);
        setTerm2Split(false);
        setSelectedFactors({ left: false, right: false });
        setInputs({ outer: '', inner: '' });
        setError(false);
        setReward(null);
    };

    const handleTerm1Click = () => {
        if (step === 1 && !term1Split) {
            setTerm1Split(true);
            if (term2Split) setTimeout(() => setStep(2), 800);
        }
    };

    const handleTerm2Click = () => {
        if (step === 1 && !term2Split) {
            setTerm2Split(true);
            if (term1Split) setTimeout(() => setStep(2), 800);
        }
    };

    const handleFactorClick = (side, factor) => {
        if (step !== 2 || factor !== problem.a) return;
        const newSelected = { ...selectedFactors, [side]: true };
        setSelectedFactors(newSelected);
        if (newSelected.left && newSelected.right) {
            setTimeout(() => setStep(3), 1000);
        }
    };

    const checkMastery = async () => {
        if (parseInt(inputs.outer) === problem.a && parseInt(inputs.inner) === problem.c) {
            setStep(4);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                const data = await rewardService.claimLabReward('fact-common-factor');
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
                                <Boxes size={14} /> وحدة الاستخلاص الجبري
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>التحليل بالعامل المشترك</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-600 border-cyan-100'}`}>
                                {step === 1 ? 'تفكيك الحدود' : step === 2 ? 'تحديد العامل' : step === 3 ? 'إعادة الهيكلة' : 'اكتمال التحليل'}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {step === 1 ? 'فكك الحدود لرؤية العوامل' : step === 2 ? 'حدد العامل المكرر' : step === 3 ? 'أعد صياغة العبارة' : 'تم التحليل بنجاح!'}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                             <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>مبدأ الاستخلاص:</h3>
                             <div className="p-4 rounded-xl bg-black/20 border border-white/5 font-mono text-center text-sm text-cyan-400">
                                ax + ab = a(x+b)
                             </div>
                             <button onClick={() => setPhase('learn')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">فتح دليل الاستخلاص</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group rounded-[1rem] shadow-2xl overflow-hidden">
                            <div className={`absolute inset-0 bg-cyan-600`} />
                            <div className="relative p-8 flex flex-col items-center justify-center text-white gap-2">
                                <Microscope size={40} />
                                <span className="font-black text-xl italic uppercase tracking-widest">بدء التحليل</span>
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
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black shadow-glow text-lg">التالي</button>
                             ) : (
                                 <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-glow text-lg">دخول التجربة</button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="flex flex-col items-center w-full max-w-5xl px-2">
                        <div className={`w-full p-6 md:p-5 rounded-[1.5rem] border backdrop-blur-3xl mb-3 text-center relative overflow-hidden transition-all duration-700 ${step === 4 ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                            <div className="relative flex flex-wrap items-center justify-center w-full text-base md:text-lg font-black font-mono z-20 gap-4 md:gap-4" dir="ltr">
                                <div className="relative">
                                    {!term1Split ? (
                                        <motion.div layoutId="t1" onClick={handleTerm1Click} className={`p-4 md:p-8 rounded-2xl border-2 cursor-pointer transition-all bg-black/40 border-cyan-500/30 text-white`}>{problem.a}x</motion.div>
                                    ) : (
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <motion.div onClick={() => handleFactorClick('left', problem.a)} className={`w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all ${selectedFactors.left ? 'bg-cyan-500 border-cyan-400 text-white shadow-glow-cyan -translate-y-2 scale-110' : 'bg-black/60 border-white/10 text-slate-500 hover:border-cyan-500/50'}`}>{problem.a}</motion.div>
                                            <span className="text-slate-800 opacity-40">×</span>
                                            <motion.div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-xl border-2 bg-transparent border-white/5 text-slate-800 opacity-20">x</motion.div>
                                        </div>
                                    )}
                                </div>
                                <div className="text-slate-800 opacity-40">+</div>
                                <div className="relative">
                                    {!term2Split ? (
                                        <motion.div layoutId="t2" onClick={handleTerm2Click} className={`p-4 md:p-8 rounded-2xl border-2 cursor-pointer transition-all bg-black/40 border-cyan-500/30 text-white`}>{problem.a * problem.c}</motion.div>
                                    ) : (
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <motion.div onClick={() => handleFactorClick('right', problem.a)} className={`w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all ${selectedFactors.right ? 'bg-cyan-500 border-cyan-400 text-white shadow-glow-cyan -translate-y-2 scale-110' : 'bg-black/60 border-white/10 text-slate-500 hover:border-cyan-500/50'}`}>{problem.a}</motion.div>
                                            <span className="text-slate-800 opacity-40">×</span>
                                            <motion.div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-xl border-2 bg-transparent border-white/5 text-slate-800 opacity-20">{problem.c}</motion.div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-2xl px-4">
                                    <div className={`p-4 md:p-5 rounded-[1rem] border shadow-2xl backdrop-blur-3xl mb-3 ${theme.card}`}>
                                        <div className="flex items-center justify-center gap-4 text-base md:text-lg font-black font-mono text-white" dir="ltr">
                                            <input type="number" value={inputs.outer} onChange={(e) => setInputs({...inputs, outer: e.target.value})} className={`w-20 md:w-28 bg-black/60 border-2 rounded-xl text-center p-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake' : 'border-cyan-500/50 text-cyan-400 focus:border-cyan-400'}`} placeholder="?" autoFocus />
                                            <span className="text-cyan-500">(</span>
                                            <span className={theme.textMain}>x</span>
                                            <span className="text-cyan-500 opacity-60">+</span>
                                            <input type="number" value={inputs.inner} onChange={(e) => setInputs({...inputs, inner: e.target.value})} className={`w-20 md:w-28 bg-black/60 border-2 rounded-xl text-center p-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake' : 'border-white/10 text-white'}`} placeholder="?" />
                                            <span className="text-cyan-500">)</span>
                                        </div>
                                    </div>
                                    <button onClick={checkMastery} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-xl shadow-glow-cyan flex items-center justify-center gap-4"><CheckCircle2 size={20} /> تأكيد الهيكلة</button>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-2xl px-2 overflow-y-auto max-h-[300px]">
                                    <div className="bg-emerald-500/10 border-2 border-emerald-500/50 rounded-[1.5rem] p-8 shadow-glow-emerald backdrop-blur-3xl">
                                        <div className="text-base md:text-lg font-mono font-black text-white flex items-center justify-center gap-3" dir="ltr">
                                            <span className="text-cyan-400">{problem.a}</span>
                                            <span className="text-emerald-500 opacity-60">(</span>
                                            <span className="text-white">x</span>
                                            <span className="text-emerald-500 opacity-40">+</span>
                                            <span className="text-white">{problem.c}</span>
                                            <span className="text-emerald-500 opacity-60">)</span>
                                        </div>
                                    </div>
                                    <MasteryRewardCard reward={reward} />
                                    <button onClick={generateProblem} className="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-xl shadow-3xl transition-all">تحدي جديد</button>
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
