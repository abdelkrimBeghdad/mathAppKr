import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, CheckCircle2, Calculator, BookOpen, Pencil, ArrowRight, Play, RefreshCw, Zap as ZapIcon, Sigma, Cpu, Binary, Target, Coins, Send, Rocket, ShieldCheck, Microscope, BrainCircuit, Star, Zap, AlertTriangle, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function InequalitiesSolveLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [step, setStep] = useState(0); // 0: input constant, 1: input final sym+val, 2: reward
    const [learnStep, setLearnStep] = useState(1);
    const [practicePair, setPracticePair] = useState({ a: 2, b: 6, c: 14, sym: '>', symFlip: '>', res: 4 });
    const [inputVal, setInputVal] = useState('');
    const [inputSym, setInputSym] = useState('');
    const [error, setError] = useState(false);
    const [reward, setReward] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [flightAnim, setFlightAnim] = useState(null);

    const containerRef = useRef(null);
    const elsRef = useRef({});
    const setRef = (id) => (el) => { if (el) elsRef.current[id] = el; };

    const learnPages = [
        {
            title: 'بروتوكول التوازن الجبري',
            detail: 'حل المتراجحة يشبه حل المعادلة؛ ننقل الثوابت للطرف الآخر مع تغيير إشارتها للحفاظ على توازن العبارة.',
            math: 'ax + b > c \u27f6 ax > c - b',
            icon: <Scale size={20} />
        },
        {
            title: 'قاعدة الانعكاس الحرج',
            detail: 'انتبه! عند القسمة على عدد سالب، يجب قلب اتجاه المتراجحة فوراً لضمان صحة المنطق الرياضي.',
            math: '-2x > 6 \u27f6 x < -3',
            icon: <AlertTriangle size={20} />
        }
    ];

    const generateProblem = () => {
        const options = [
            { a: 2, b: 6, c: 14, sym: '>', symFlip: '>', res: 4 },
            { a: 3, b: -5, c: 10, sym: '<', symFlip: '<', res: 5 },
            { a: -2, b: 4, c: 10, sym: '>', symFlip: '<', res: -3 },
            { a: -3, b: -1, c: 8, sym: '\u2264', symFlip: '\u2265', res: -3 },
            { a: 5, b: 10, c: 30, sym: '\u2265', symFlip: '\u2265', res: 4 },
            { a: -4, b: 8, c: 0, sym: '<', symFlip: '>', res: 2 }
        ];
        let newProb = options[Math.floor(Math.random() * options.length)];
        setPracticePair(newProb);
        setPhase('practice');
        setStep(0);
        setInputVal('');
        setInputSym('');
        setError(false);
        setReward(null);
    };

    const handleNextLearnStep = () => {
        if (isAnimating || learnStep >= 3) return;
        const nextStep = learnStep + 1;
        setIsAnimating(true);
        setLearnStep(nextStep);
        const container = containerRef.current.getBoundingClientRect();

        if (nextStep === 2) {
            const s = elsRef.current['learn-b']?.getBoundingClientRect();
            const t = elsRef.current['learn-rhs-calc']?.getBoundingClientRect();
            if (s && t) {
                setFlightAnim({
                    clone1: { text: '+4', start: { x: s.left - container.left, y: s.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } }
                });
            }
        } else if (nextStep === 3) {
            const s = elsRef.current['learn-a']?.getBoundingClientRect();
            const t = elsRef.current['learn-final-res']?.getBoundingClientRect();
            if (s && t) {
                setFlightAnim({
                    clone1: { text: '-2', start: { x: s.left - container.left, y: s.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } }
                });
            }
        }
        setTimeout(() => { setIsAnimating(false); setFlightAnim(null); }, 1000);
    };

    const handleCheck = () => {
        if (step === 0) {
            const targetVal = practicePair.c - practicePair.b;
            if (parseInt(inputVal) === targetVal) {
                setStep(1);
                setInputVal('');
                setError(false);
            } else {
                setError(true);
                setTimeout(() => setError(false), 1000);
            }
        } else if (step === 1) {
            const symMatch = inputSym === practicePair.symFlip || 
                           (inputSym === '>=' && practicePair.symFlip === '\u2265') || 
                           (inputSym === '<=' && practicePair.symFlip === '\u2264');
            
            if (symMatch && parseInt(inputVal) === practicePair.res) {
                setStep(2);
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                rewardService.claimLabReward('inequality-solve').then(data => data.status === 'success' && setReward(data)).catch(console.error);
                setError(false);
            } else {
                setError(true);
                setTimeout(() => setError(false), 1000);
            }
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-4 pt-2">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                <ShieldCheck size={14} /> بروتوكول الحماية الجبريّة
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>حل المتراجحات الخطية</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                {step === 0 ? 'نقل الثوابت' : step === 1 ? 'القسمة النهائية' : 'تم الحل بنجاح'}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {step === 2 ? 'مجموعة الحلول جاهزة!' : `حل: ${practicePair.a}x ${practicePair.b >= 0 ? '+' : ''}${practicePair.b} ${practicePair.sym} ${practicePair.c}`}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                             <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>خوارزمية الحل:</h3>
                             <div className="space-y-2">
                                 {learnPages.map((p, i) => (
                                     <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                         <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs">{i + 1}</div>
                                         <div>
                                             <h4 className="text-white font-bold text-sm">{p.title}</h4>
                                             <p className="text-slate-400 text-[10px] font-medium leading-relaxed">{p.detail}</p>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                             <button onClick={() => setPhase('learn')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">مشاهدة الخطوات</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group rounded-[1rem] shadow-2xl overflow-hidden">
                            <div className={`absolute inset-0 bg-blue-600`} />
                            <div className="relative p-8 flex flex-col items-center justify-center text-white gap-2">
                                <Scale size={40} />
                                <span className="font-black text-xl italic uppercase tracking-widest">بدء التحدي</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-4xl px-2" ref={containerRef}>
                        <div className={`p-4 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden flex flex-col items-center ${theme.card}`}>
                             <div className="space-y-6 w-full">
                                {flightAnim && (
                                    <div className="absolute inset-0 pointer-events-none z-[100]">
                                        <motion.div initial={{ x: flightAnim.clone1.start.x, y: flightAnim.clone1.start.y }} animate={{ x: flightAnim.clone1.end.x, y: flightAnim.clone1.end.y }} transition={{ duration: 1 }} className="absolute font-mono font-black text-2xl text-white drop-shadow-glow-blue">{flightAnim.clone1.text}</motion.div>
                                    </div>
                                )}
                                <div className="p-6 rounded-2xl border-2 bg-black/40 border-white/5 flex items-center justify-center gap-4 text-base md:text-lg font-mono font-black text-white" dir="ltr">
                                    <span>-2</span><span className="text-blue-400">x</span> 
                                    <span ref={setRef('learn-b')} className={isAnimating && learnStep === 2 ? 'opacity-0' : 'text-blue-400'}>+4</span> 
                                    <span className="opacity-40 italic">&gt;</span> 
                                    <span>10</span>
                                </div>
                                <div className={`p-6 rounded-2xl border flex justify-center items-center transition-all duration-700 ${learnStep >= 2 ? 'opacity-100 bg-black/40 border-blue-500/20' : 'opacity-0 scale-95'}`}>
                                    <div className="flex items-center gap-4 text-sm md:text-base font-mono font-black text-white" dir="ltr">
                                        <span>-2x &gt; 10</span> 
                                        <span ref={setRef('learn-rhs-calc')} className={isAnimating && (learnStep === 2 || learnStep === 3) ? 'opacity-0' : 'text-blue-400'}>-4</span> 
                                        <span className="text-emerald-500 italic">= 6</span>
                                    </div>
                                </div>
                                <div className={`p-6 rounded-2xl border flex justify-center items-center transition-all duration-700 ${learnStep >= 3 ? 'opacity-100 bg-blue-500/10 border-blue-500/40 shadow-glow-blue' : 'opacity-0 scale-90'}`}>
                                    <div className="flex flex-col items-center gap-2 text-base md:text-lg font-mono font-black text-white" dir="ltr">
                                        <div className="flex items-center gap-4">
                                            <span>x</span> 
                                            <motion.span animate={{ rotate: 180, color: '#60a5fa' }} transition={{ delay: 0.5, duration: 0.8 }} className="italic">&gt;</motion.span> 
                                            <div className="flex flex-col items-center">
                                                <span className="border-b-2 border-white px-4">6</span>
                                                <span className="text-xl text-slate-500">-2</span>
                                            </div>
                                        </div>
                                        <div className="text-emerald-500 text-base md:text-lg mt-2">x <span className="italic">&lt;</span> <span ref={setRef('learn-final-res')}>-3</span></div>
                                    </div>
                                </div>
                             </div>
                        </div>
                        <div className="flex gap-3 mt-6 px-4">
                             <button onClick={learnStep < 3 ? handleNextLearnStep : generateProblem} disabled={isAnimating} className="flex-grow py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xl shadow-glow-blue transition-all active:scale-95">{learnStep < 3 ? 'الخطوة التالية' : 'ابدأ التحدي'}</button>
                             <button onClick={() => { setLearnStep(1); setFlightAnim(null); }} className="p-4 bg-slate-800 text-slate-400 rounded-xl border border-white/5"><RotateCcw size={20} /></button>
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="flex flex-col items-center w-full max-w-5xl px-2">
                        <div className="bg-blue-950/40 px-8 py-3 rounded-[1.5rem] border-4 border-blue-500/30 text-blue-400 text-base md:text-lg font-black shadow-glow-blue mb-3 relative overflow-hidden" dir="ltr">
                            <div className="relative z-10 font-mono tracking-tighter">
                                {practicePair.a}x {practicePair.b >= 0 ? '+' : ''}{practicePair.b} {practicePair.sym} {practicePair.c}
                            </div>
                        </div>

                        {step < 2 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-3xl">
                                <div className={`p-4 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl ${theme.card}`}>
                                    <div className="flex flex-wrap items-center justify-center gap-4 text-base md:text-lg font-black font-mono text-white" dir="ltr">
                                        {step === 0 ? (
                                            <>
                                                <span className="text-sm md:text-2xl">{practicePair.a}x {practicePair.sym} {practicePair.c} - ({practicePair.b}) = </span>
                                                <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-24 md:w-32 bg-black/60 border-2 rounded-xl text-center p-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake' : 'border-blue-500/50 text-blue-400 focus:border-blue-400'}`} placeholder="?" autoFocus />
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="text-white italic">x</span>
                                                <input type="text" value={inputSym} onChange={(e) => setInputSym(e.target.value)} className={`w-16 md:w-20 bg-black/60 border-2 rounded-lg text-center p-2 outline-none transition-all ${error ? 'border-rose-500' : 'border-emerald-500/50 text-emerald-400'}`} placeholder="< >" autoFocus />
                                                <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-24 md:w-32 bg-black/60 border-2 rounded-xl p-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake' : 'border-emerald-500/50 text-emerald-400 focus:border-emerald-500'}`} placeholder="?" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {step === 1 && practicePair.a < 0 && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-4 bg-rose-500/10 rounded-xl border-2 border-rose-500/30 text-rose-400 font-bold text-sm flex items-center justify-center gap-3">
                                        <AlertTriangle size={20} className="animate-bounce" /> انتباه: القسمة على سالب تعني قلب الإشارة!
                                    </motion.div>
                                )}
                                <button onClick={handleCheck} className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xl shadow-glow-blue transition-all active:scale-95 flex items-center justify-center gap-4"><Calculator size={20} /> التحقق من الخطوة</button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-2xl px-4 overflow-y-auto max-h-[350px]">
                                <div className="bg-emerald-500/10 border-2 border-emerald-500/50 rounded-[1.5rem] p-5 shadow-glow-emerald backdrop-blur-3xl relative overflow-hidden">
                                     <div className="relative z-10 text-base md:text-lg font-mono font-black text-white flex items-center justify-center gap-3" dir="ltr">
                                        <span>x</span> <span className="text-emerald-500 italic">{practicePair.symFlip}</span> <span className="drop-shadow-glow-emerald">{practicePair.res}</span>
                                    </div>
                                </div>
                                <MasteryRewardCard reward={reward} />
                                <button onClick={generateProblem} className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xl shadow-glow-blue transition-all">تحدي جديد</button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {phase !== 'intro' && step < 2 && (
                <div className="absolute bottom-4 right-4 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={14} className="text-blue-400" /> <span>الرجوع</span>
                    </button>
                </div>
            )}
        </div>
    );
}
