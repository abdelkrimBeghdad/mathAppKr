import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Divide, Zap as ZapIcon, Send, Trophy, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import MasteryRewardCard from './MasteryRewardCard';
import BaseLabLayout from '../common/BaseLabLayout';
import { useTheme } from '../../context/ThemeContext';

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

export default function PGCDEuclideanLab() {
    const { isDark } = useTheme();
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [numbers, setNumbers] = useState({ a: 84, b: 60 });
    const [expectedSteps, setExpectedSteps] = useState([]);
    const [pgcd, setPgcd] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [completedRows, setCompletedRows] = useState([]);
    const [error, setError] = useState(false);
    const [finished, setFinished] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);
    const [level, setLevel] = useState(1);

    // Theme Variables (Indigo/Purple Focus)
    const cardGlass = isDark ? 'bg-slate-900/60 border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.3)]' : 'bg-white/80 border-indigo-100/50 shadow-[0_8px_30px_rgba(99,102,241,0.08)]';
    const textMain = isDark ? 'text-white' : 'text-slate-800';
    const textSub = isDark ? 'text-slate-300' : 'text-slate-500';
    const innerBox = isDark ? 'bg-black/40 border-white/5 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600';
    const inputGlass = isDark ? 'bg-slate-900/80 border-slate-700 text-indigo-400' : 'bg-white border-indigo-100 shadow-inner text-indigo-600';

    const current = expectedSteps[currentStep];
    const progress = expectedSteps.length > 0 ? Math.round((completedRows.length / expectedSteps.length) * 100) : 0;

    let labTitle = 'القسمة الإقليدية (PGCD)';
    if (phase === 'learn') labTitle = 'دليل القسمة الإقليدية';
    if (phase === 'practice') labTitle = current ? `باقي قسمة ${current.a} على ${current.b}` : labTitle;
    if (finished) labTitle = `PGCD = ${pgcd}`;

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const progress = await labProgressService.getOne('pgcd-euclidean');
                if (progress) setLevel(difficultyEngine.getLevel(progress));
            } catch (err) {
                console.error(err);
            }
        };
        loadProgress();
    }, []);

    const learnPages = [
        {
            title: 'بروتوكول القسمة الإقليدية',
            detail: 'خوارزمية إقليدس تعتمد على تكرار القسمة الإقليدية: نقسم العدد الأكبر على الأصغر ونحتفظ بالباقي. ثم نكرر العملية مع المقسوم عليه والباقي.',
            math: 'a = b × q + r',
        },
        {
            title: 'شرط التوقف',
            detail: 'نكرر هذه الخطوة حتى نحصل على باقي يساوي صفر (r=0). عندها، آخر مقسوم عليه (أو آخر باقي غير معدوم) هو القاسم المشترك الأكبر.',
            math: 'r = 0 → PGCD = آخر b',
        },
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('pgcd', level);
        const options = params.pairs || [[48, 18], [60, 24], [84, 60], [105, 45]];
        const pair = options[Math.floor(Math.random() * options.length)];
        const a = Math.max(pair[0], pair[1]);
        const b = Math.min(pair[0], pair[1]);
        const { steps, pgcd: p } = computeSteps(a, b);
        
        setNumbers({ a, b });
        setExpectedSteps(steps);
        setPgcd(p);
        setCurrentStep(0);
        setCompletedRows([]);
        setUserAnswer('');
        setError(false);
        setFinished(false);
        setShowHint(false);
        setReward(null);
        setPhase('practice');
        labProgressService.update('pgcd-euclidean', 'practice').catch(e => console.error(e));
    };

    const handleSubmit = async () => {
        const val = parseInt(userAnswer);
        if (isNaN(val) || val < 0) return;
        if (!current) return;
        
        if (val !== current.r) {
            setError(true);
            setTimeout(() => setError(false), 800);
            return;
        }
        
        const newRows = [...completedRows, { ...current }];
        setCompletedRows(newRows);
        setUserAnswer('');
        setShowHint(false);
        setError(false);

        if (current.r === 0) {
            await labProgressService.update('pgcd-euclidean', 'completed', 100).catch(e => console.error(e));
            setFinished(true);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                const data = await rewardService.claimLabReward('pgcd-euclidean');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const renderStepsPanel = () => {
        if (phase !== 'practice' || finished) return null;
        
        return (
            <div className="flex flex-col h-full">
                <h3 className={`text-sm lg:text-base font-black mb-6 border-b pb-4 flex items-center gap-3 uppercase tracking-wider ${isDark ? 'text-indigo-400 border-slate-800' : 'text-indigo-500 border-slate-200'}`}>
                    <BookOpen size={16} /> سجل القسمات
                </h3>
                <div className="flex-1 space-y-4 pb-4">
                    <AnimatePresence>
                        {completedRows.map((row, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: 20, scale: 0.95 }} 
                                animate={{ opacity: 1, x: 0, scale: 1 }} 
                                key={i} 
                                className={`relative overflow-hidden flex flex-col gap-2 py-4 px-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60' : 'bg-white/60 border-slate-200 hover:bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]'}`} 
                                dir="ltr"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-full" />
                                <div className="flex items-center justify-between font-mono font-bold text-base md:text-lg">
                                    <div className="flex items-center gap-2">
                                        <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{row.a}</span>
                                        <span className="text-indigo-500 opacity-60">=</span>
                                        <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{row.b}</span>
                                        <span className="text-indigo-500 opacity-60">×</span>
                                        <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{row.q}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 opacity-50">+</span>
                                        <span className={`font-black ${row.r === 0 ? 'text-emerald-500' : 'text-fuchsia-500'}`}>{row.r}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {completedRows.length === 0 && (
                        <div className={`flex flex-col items-center justify-center text-center h-40 mt-10 rounded-3xl border-2 border-dashed ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                            <Divide size={24} className="mb-3 opacity-50" />
                            <span className="text-sm font-bold">السبورة فارغة.<br/>أدخل باقي القسمة الأول للبدء.</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderControls = () => {
        if (phase === 'intro') return null;
        if (phase === 'learn') {
            return (
                <div className="flex justify-between w-full max-w-2xl mx-auto">
                    <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'}`}>
                        العودة
                    </button>
                    {learnStep < learnPages.length - 1 ? (
                        <button onClick={() => setLearnStep(l => l + 1)} className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl active:scale-95 transition-all flex items-center gap-2 hover:scale-[1.02]">
                            التالي
                        </button>
                    ) : (
                        <button onClick={generateProblem} className="px-10 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 hover:scale-[1.02]">
                            <ZapIcon size={18} className="fill-white" /> بدء التحدي
                        </button>
                    )}
                </div>
            );
        }
        if (phase === 'practice' && !finished) {
            return (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl mx-auto">
                    <button 
                        onClick={() => setShowHint(!showHint)} 
                        className={`p-4 rounded-2xl transition-all border-2 ${showHint ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-400' : 'bg-white border-slate-200 text-slate-500 hover:border-amber-200 hover:text-amber-500 shadow-sm')} shrink-0`} 
                        title="تلميح"
                    >
                        <HelpCircle size={24} />
                    </button>
                    <div className={`flex-1 flex items-center border-2 rounded-2xl p-2 transition-all ${error ? 'border-rose-500 bg-rose-500/5 animate-shake' : (isDark ? 'bg-slate-900/50 border-slate-700 focus-within:border-indigo-500/50' : 'bg-white border-slate-200 focus-within:border-indigo-400 focus-within:shadow-[0_4px_20px_rgba(99,102,241,0.1)]')}`}>
                        <input
                            type="number"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="flex-1 bg-transparent py-2 px-6 text-center text-2xl font-black font-mono outline-none text-indigo-500 placeholder-slate-400/50 w-full"
                            placeholder="أدخل الباقي r..."
                            autoFocus
                        />
                        <button onClick={handleSubmit} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl shadow-md font-black transition-all active:scale-95 flex items-center gap-2 shrink-0">
                            <Send size={20} /> <span className="hidden sm:inline">تحقق</span>
                        </button>
                    </div>
                </div>
            );
        }
        if (finished) {
            return (
                <button onClick={generateProblem} className="w-full max-w-xl mx-auto py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] transition-all active:scale-95">
                    تحدي إقليدس جديد
                </button>
            );
        }
        return null;
    };

    return (
        <BaseLabLayout
            title={labTitle}
            progress={progress}
            score={reward?.points || 0}
            stepsPanel={renderStepsPanel()}
            controls={renderControls()}
        >
            {/* Canvas Content */}
            <div className="w-full h-full flex flex-col items-center justify-center relative p-4 lg:p-10">
                
                {/* Premium Intro Phase */}
                {phase === 'intro' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 40, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-2xl relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-fuchsia-500 blur-[120px] opacity-25 pointer-events-none scale-110" />
                        
                        <div className={`relative p-10 md:p-14 rounded-[3rem] border backdrop-blur-[60px] flex flex-col items-center text-center overflow-hidden ${isDark ? 'bg-slate-900/50 border-white/[0.08] shadow-[0_30px_80px_rgba(0,0,0,0.5)]' : 'bg-white/25 border-white/50 shadow-[0_30px_80px_rgba(0,0,0,0.06)]'}`}>
                            
                            {/* Animated sparkle particles */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-purple-400'}`}
                                        style={{
                                            left: `${15 + i * 15}%`,
                                            top: `${10 + (i % 3) * 30}%`,
                                        }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0, 1.5, 0],
                                            y: [0, -30, -60],
                                        }}
                                        transition={{
                                            duration: 3 + i * 0.5,
                                            repeat: Infinity,
                                            delay: i * 0.7,
                                            ease: "easeOut",
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Icon with animated glow ring */}
                            <div className="relative mb-10">
                                <motion.div
                                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-[-12px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-500 blur-xl"
                                />
                                <motion.div 
                                    initial={{ scale: 0.5, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.15 }}
                                    className="relative w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl hover:rotate-6 hover:scale-105 transition-transform cursor-default"
                                >
                                    <Divide size={40} strokeWidth={2.5} />
                                </motion.div>
                            </div>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className={`text-4xl md:text-5xl font-black mb-5 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
                            >
                                خوارزمية إقليدس
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className={`text-lg md:text-xl mb-12 max-w-md font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                            >
                                اكتشف القاسم المشترك الأكبر <span className="text-indigo-500 font-bold">(PGCD)</span> باستخدام بروتوكول القسمة المتتالية لإقليدس.
                            </motion.p>

                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className={`w-full p-7 rounded-[2rem] border mb-12 relative overflow-hidden ${isDark ? 'bg-black/30 border-white/[0.06] text-indigo-400' : 'bg-white/60 border-white/80 text-indigo-600'} backdrop-blur-xl`}
                            >
                                <div className="absolute top-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
                                <div className="text-xl md:text-2xl font-black font-mono tracking-wider" dir="ltr">
                                    a = b × q + r
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="flex flex-col sm:flex-row items-center gap-4 w-full"
                            >
                                <button 
                                    onClick={generateProblem} 
                                    className="group w-full sm:flex-1 py-5 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 hover:scale-[1.03] active:scale-[0.97] rounded-[1.5rem] font-black text-lg transition-all shadow-[0_15px_40px_rgba(99,102,241,0.35)] flex items-center justify-center gap-3 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                                    <ZapIcon size={24} className="fill-white relative z-10" />
                                    <span className="relative z-10">دخول الميدان</span>
                                </button>
                                <button 
                                    onClick={() => setPhase('learn')} 
                                    className={`w-full sm:w-auto py-5 px-8 rounded-[1.5rem] font-bold text-lg transition-all border-2 hover:scale-[1.02] active:scale-[0.98] ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-white/60 bg-white/30 hover:bg-white/60 text-slate-700 shadow-sm backdrop-blur-xl'}`}
                                >
                                    الدليل النظري
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}


                {/* Premium Learn Phase */}
                {phase === 'learn' && (
                    <div className="w-full max-w-3xl">
                        <motion.div 
                            key={learnStep} 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            className={`p-10 md:p-14 rounded-[3rem] border shadow-2xl backdrop-blur-[60px] text-center relative overflow-hidden ${isDark ? 'bg-slate-900/50 border-white/[0.08]' : 'bg-white/25 border-white/50 shadow-[0_30px_80px_rgba(0,0,0,0.06)]'}`}
                        >
                            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
                            
                            <h3 className={`text-3xl lg:text-4xl font-black mb-8 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {learnPages[learnStep].title}
                            </h3>
                            <p className={`text-lg md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {learnPages[learnStep].detail}
                            </p>
                            <div className={`p-8 rounded-[2rem] border inline-block ${isDark ? 'bg-black/30 border-white/[0.06] text-indigo-400' : 'bg-white/60 border-white/80 text-indigo-600'} backdrop-blur-xl`}>
                                <span className="text-2xl md:text-4xl font-mono font-black drop-shadow-sm" dir="ltr">
                                    {learnPages[learnStep].math}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Ultra Clean Practice Phase */}
                {phase === 'practice' && !finished && current && (
                    <div className="flex flex-col items-center justify-center w-full max-w-4xl relative">
                        <AnimatePresence>
                            {showHint && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20, scale: 0.9 }} 
                                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                                    exit={{ opacity: 0, y: -20, scale: 0.9 }} 
                                    className="absolute -top-32 p-5 rounded-2xl bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 font-bold text-lg text-center shadow-2xl border border-white/10 dark:border-slate-200 flex flex-col md:flex-row items-center gap-3"
                                    dir="ltr"
                                >
                                    <div className="flex items-center gap-2">
                                        <Lightbulb size={24} className="text-amber-400" />
                                        <span dir="rtl">تلميح حساب الباقي:</span>
                                    </div>
                                    <span className="font-mono text-indigo-400 dark:text-indigo-600 font-black text-xl px-2 bg-black/20 dark:bg-slate-100 rounded-lg">
                                        r = {current.a} - ({current.b} × {current.q})
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-10 text-5xl md:text-[6rem] lg:text-[8rem] font-black font-mono select-none leading-none mt-10 md:mt-0" dir="ltr">
                            <motion.span 
                                key={`a-${current.a}`}
                                initial={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                className={isDark ? 'text-white' : 'text-slate-900'}
                            >
                                {current.a}
                            </motion.span>
                            
                            <span className="text-indigo-500 opacity-60 font-sans font-light">=</span>
                            
                            <motion.span 
                                key={`b-${current.b}`}
                                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                className={isDark ? 'text-slate-300' : 'text-slate-600'}
                            >
                                {current.b}
                            </motion.span>
                            
                            <span className="text-indigo-500 opacity-60 font-sans font-light">×</span>
                            
                            <motion.span 
                                key={`q-${current.q}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`text-fuchsia-500 drop-shadow-[0_0_20px_rgba(217,70,239,0.2)] ${isDark ? '' : 'text-fuchsia-600'}`}
                            >
                                {current.q}
                            </motion.span>
                            
                            <span className="text-slate-400 opacity-40 font-sans font-light">+</span>
                            
                            <span className="text-slate-400 opacity-30 italic font-serif">r?</span>
                        </div>
                    </div>
                )}

                {/* Finished Phase */}
                {finished && (
                    <div className="text-center w-full max-w-3xl flex flex-col items-center gap-8">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            className={`w-full p-12 md:p-16 rounded-[3rem] border shadow-2xl backdrop-blur-[60px] relative overflow-hidden ${isDark ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-white/25 border-white/50 shadow-[0_30px_80px_rgba(16,185,129,0.08)]'}`}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.05)_0%,transparent_70%)] pointer-events-none" />
                            
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                            >
                                <Trophy size={80} className="mx-auto text-emerald-500 mb-8 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]" />
                            </motion.div>
                            
                            <h3 className={`text-5xl md:text-6xl font-black mb-10 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                خبير إقليدس!
                            </h3>
                            
                            <div className={`inline-block px-12 py-8 rounded-[2rem] border ${isDark ? 'bg-black/30 border-emerald-500/20 text-emerald-400' : 'bg-white/60 border-white/80 text-emerald-600'} backdrop-blur-xl`} dir="ltr">
                                <span className="text-3xl md:text-4xl font-black font-mono">PGCD({numbers.a}, {numbers.b}) = {pgcd}</span>
                            </div>
                        </motion.div>
                        
                        {reward && (
                            <div className="w-full max-w-md">
                                <MasteryRewardCard reward={reward} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </BaseLabLayout>
    );
}
