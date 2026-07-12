import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, Layers, Rocket, Zap as ZapIcon, BookOpen, Target, Sigma } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function ExpansionDoubleContent({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const staticTextClass = isDarkMode ? "text-white" : "text-slate-900";
    const opacityTextClass = isDarkMode ? "text-white/20" : "text-slate-900/25";
    const activePulseClass = isDarkMode 
      ? 'text-white animate-pulse bg-white/5 border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
      : 'text-slate-800 animate-pulse bg-slate-100 border-2 border-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.05)]';
    const inputClass = isDarkMode 
      ? 'bg-black/30 border-indigo-500/30 text-indigo-400 focus:border-indigo-400' 
      : 'bg-slate-100 border-indigo-200 text-indigo-600 focus:border-indigo-500 focus:bg-white';
    const inputClass2 = isDarkMode 
      ? 'bg-black/30 border-emerald-500/30 text-emerald-400 focus:border-emerald-400' 
      : 'bg-slate-100 border-emerald-200 text-emerald-600 focus:border-emerald-500 focus:bg-white';
    const parenthesisClass = isDarkMode ? "text-white/50" : "text-slate-800/60";
    const inactiveFactorClass = isDarkMode ? "text-white/30" : "text-slate-800/45";

    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [problem, setProblem] = useState({ b: 2, d: 3 });
    const [step, setStep] = useState(1); // 1-6: interaction, 7: input, 8: reward
    const [error, setError] = useState(false);
    const [inputs, setInputs] = useState({ x2: '', x: '', c: '' });
    const [difficultyLevel, setDifficultyLevel] = useState(1);

    useEffect(() => {
        labProgressService.getOne('expansion-double')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'بروتوكول التوزيع الرباعي',
            detail: 'النشر المزدوج هو عملية توزيع كل حد من القوس الأول على كل حد من القوس الثاني بالتساوي.',
            math: '(a + b)(c + d) = ac + ad + bc + bd',
            icon: <Layers size={20} />
        },
        {
            title: 'خوارزمية المسارات الأربعة',
            detail: 'نبدأ بالحد الأول (x) ونوزعه، ثم ننتقل للحد الثاني ونوزعه، لضمان تغطية كافة الاحتمالات.',
            math: 'Step 1: x \u00d7 x \u2192 x\u00b2',
            icon: <Rocket size={20} />
        }
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('expansion', difficultyLevel);
        const maxVal = params.maxCoeff || 5;
        const b = Math.floor(Math.random() * maxVal) + 1;
        const d = Math.floor(Math.random() * maxVal) + 1;
        setProblem({ b, d });
        setPhase('practice');
        setStep(1);
        setInputs({ x2: '', x: '', c: '' });
        setError(false);
        labProgressService.update('expansion-double', 'practice').catch(console.error);
    };

    const handleFirstOuterClick = () => { if (step === 1) setStep(2); };
    const handleDist1 = () => { if (step === 2) setStep(3); };
    const handleDist2 = () => { if (step === 3) setStep(4); };
    const handleSecondOuterClick = () => { if (step === 4) setStep(5); };
    const handleDist3 = () => { if (step === 5) setStep(6); };
    const handleDist4 = () => { if (step === 6) setStep(7); };

    const checkMastery = async () => {
        const correctX = problem.b + problem.d;
        const correctC = problem.b * problem.d;
        if (parseInt(inputs.x) === correctX && parseInt(inputs.c) === correctC) {
            setStep(8);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                await labProgressService.update('expansion-double', 'completed', 100);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('النشر المزدوج');
        } else if (phase === 'learn') {
            setLabTitle(learnPages[learnStep].title);
        } else if (step === 8) {
            setLabTitle('اكتمال النشر');
        } else {
            setLabTitle(step < 4 ? 'توزيع القطب A' : step < 7 ? 'توزيع القطب B' : 'الدمج الهيكلي');
        }
    }, [phase, learnStep, step, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 overflow-hidden px-4" dir="rtl">
            {phase === 'intro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                    <div className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-3xl transition-all shadow-2xl ${theme.card}`}>
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl"><BookOpen size={20} /></div>
                          <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>خارطة التوزيع الرباعي:</h3>
                          <div className={`p-8 rounded-[1.5rem] border-2 text-center shadow-inner ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                             <div className={`text-sm md:text-base font-black font-mono tracking-tighter text-indigo-400`} dir="ltr">
                                 (a+b)(c+d) = ac + ad + bc + bd
                             </div>
                          </div>
                          <button onClick={() => setPhase('learn')} className={`mt-4 px-4 py-2 rounded-2xl font-black transition-all border shadow-lg ${isDarkMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}>فتح دليل المسارات</button>
                    </div>
                    <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 transition-transform duration-500 group-hover:scale-110`} />
                        <div className="relative p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 text-white">
                            <Layers size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                            <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">تفعيل المصفوفة</span>
                        </div>
                    </motion.button>
                </div>
            )}

            {phase === 'learn' && (
                <div className="w-full max-w-4xl px-2">
                    <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                          <div className="flex flex-col items-center text-center">
                              <div className={`w-20 h-20 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 shadow-inner`}>{learnPages[learnStep].icon}</div>
                              <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                              <p className={`text-sm md:text-base ${theme.textSub} mb-3 max-w-2xl font-medium leading-relaxed italic`}>{learnPages[learnStep].detail}</p>
                              <div className={`p-5 rounded-[1.5rem] border-2 shadow-inner w-full ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                  <span className="text-base md:text-lg font-mono font-black text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]" dir="ltr">{learnPages[learnStep].math}</span>
                              </div>
                          </div>
                    </motion.div>
                    <div className="flex justify-between items-center mt-3 px-6">
                          <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-2xl font-black transition-all ${isDarkMode ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                          {learnStep < 1 ? (
                              <button onClick={() => setLearnStep(l => l + 1)} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-2xl font-black shadow-xl text-xl">التالي</button>
                          ) : (
                              <button onClick={generateProblem} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-black shadow-xl text-xl">دخول التجربة</button>
                          )}
                    </div>
                </div>
            )}

            {phase === 'practice' && (
                <div className="flex flex-col items-center w-full max-w-5xl px-2">
                    <div className={`w-full p-4 md:p-6 rounded-[1.5rem] border-2 backdrop-blur-3xl mb-6 md:mb-8 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${step === 8 ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-30" />
                        
                        <div className="relative mb-4 w-[360px] h-[160px] mx-auto">
                            {/* SVG Arcs for FOIL distribution */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 160" preserveAspectRatio="xMidYMid meet" style={{ zIndex: 1 }}>
                                {/* Arc 1: x1 -> x2 (step >= 3) */}
                                <AnimatePresence>
                                    {step >= 3 && step < 8 && (
                                        <motion.path
                                            d="M 70 80 Q 150 15, 230 80"
                                            fill="none"
                                            stroke="url(#arcDouble1)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.7, ease: 'easeOut' }}
                                        />
                                    )}
                                </AnimatePresence>
                                
                                {/* Arc 2: x1 -> d2 (step >= 4) */}
                                <AnimatePresence>
                                    {step >= 4 && step < 8 && (
                                        <motion.path
                                            d="M 70 80 Q 177 -5, 285 80"
                                            fill="none"
                                            stroke="url(#arcDouble2)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeDasharray="6 4"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                                        />
                                    )}
                                </AnimatePresence>
                                
                                {/* Arc 3: b1 -> x2 (step >= 6) */}
                                <AnimatePresence>
                                    {step >= 6 && step < 8 && (
                                        <motion.path
                                            d="M 125 80 Q 177 145, 230 80"
                                            fill="none"
                                            stroke="url(#arcDouble3)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.7, ease: 'easeOut' }}
                                        />
                                    )}
                                </AnimatePresence>
                                
                                {/* Arc 4: b1 -> d2 (step >= 7) */}
                                <AnimatePresence>
                                    {step >= 7 && step < 8 && (
                                        <motion.path
                                            d="M 125 80 Q 205 165, 285 80"
                                            fill="none"
                                            stroke="url(#arcDouble4)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeDasharray="6 4"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Arrowheads/Endpoints circles */}
                                <AnimatePresence>
                                    {step >= 3 && step < 8 && <motion.circle cx="230" cy="80" r="4" fill="#38bdf8" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} />}
                                </AnimatePresence>
                                <AnimatePresence>
                                    {step >= 4 && step < 8 && <motion.circle cx="285" cy="80" r="4" fill="#34d399" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />}
                                </AnimatePresence>
                                <AnimatePresence>
                                    {step >= 6 && step < 8 && <motion.circle cx="230" cy="80" r="4" fill="#fbbf24" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} />}
                                </AnimatePresence>
                                <AnimatePresence>
                                    {step >= 7 && step < 8 && <motion.circle cx="285" cy="80" r="4" fill="#f87171" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />}
                                </AnimatePresence>
                                
                                <defs>
                                    <linearGradient id="arcDouble1" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.9" />
                                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                                    </linearGradient>
                                    <linearGradient id="arcDouble2" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.7" />
                                        <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
                                    </linearGradient>
                                    <linearGradient id="arcDouble3" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                                    </linearGradient>
                                    <linearGradient id="arcDouble4" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <div className="absolute inset-x-0 bottom-12 h-12 text-2xl font-black font-mono select-none" dir="ltr" style={{ zIndex: 2 }}>
                                <div className={`${parenthesisClass} absolute text-center font-serif`} style={{ left: '35px', width: '20px' }}>(</div>
                                
                                {/* Term 1: x */}
                                <motion.div 
                                    onClick={handleFirstOuterClick} 
                                    className={`absolute text-center rounded-xl cursor-pointer transition-all ${step >= 2 ? 'text-sky-400 bg-sky-500/10' : step === 1 ? activePulseClass : inactiveFactorClass}`}
                                    style={{ left: '65px', width: '30px' }}
                                    animate={step === 1 ? { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    whileHover={step === 1 ? { scale: 1.15 } : {}}
                                    whileTap={step === 1 ? { scale: 0.95 } : {}}
                                >
                                    x
                                </motion.div>
                                
                                <div className={`${parenthesisClass} absolute text-center`} style={{ left: '105px', width: '20px' }}>+</div>
                                
                                {/* Term 2: b */}
                                <motion.div 
                                    onClick={handleSecondOuterClick} 
                                    className={`absolute text-center rounded-xl cursor-pointer transition-all ${step >= 5 ? 'text-amber-400 bg-amber-500/10' : step === 4 ? activePulseClass : inactiveFactorClass}`}
                                    style={{ left: '135px', width: '30px' }}
                                    animate={step === 4 ? { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    whileHover={step === 4 ? { scale: 1.15 } : {}}
                                    whileTap={step === 4 ? { scale: 0.95 } : {}}
                                >
                                    {problem.b}
                                </motion.div>
                                
                                <div className={`${parenthesisClass} absolute text-center font-serif`} style={{ left: '175px', width: '20px' }}>)</div>
                                
                                <div className={`${parenthesisClass} absolute text-center font-serif`} style={{ left: '195px', width: '20px' }}>(</div>
                                
                                {/* Term 3: x */}
                                <motion.div 
                                    onClick={step === 2 ? handleDist1 : (step === 5 ? handleDist3 : undefined)} 
                                    className={`absolute text-center rounded-xl cursor-pointer transition-all ${step === 2 || step === 5 ? activePulseClass : (step > 2 && step !== 5 && step < 7 ? 'text-sky-400 bg-sky-500/5' : inactiveFactorClass)}`}
                                    style={{ left: '225px', width: '30px' }}
                                    animate={step === 2 || step === 5 ? { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    whileHover={step === 2 || step === 5 ? { scale: 1.15 } : {}}
                                    whileTap={step === 2 || step === 5 ? { scale: 0.95 } : {}}
                                >
                                    x
                                </motion.div>
                                
                                <div className={`${parenthesisClass} absolute text-center`} style={{ left: '265px', width: '20px' }}>+</div>
                                
                                {/* Term 4: d */}
                                <motion.div 
                                    onClick={step === 3 ? handleDist2 : (step === 6 ? handleDist4 : undefined)} 
                                    className={`absolute text-center rounded-xl cursor-pointer transition-all ${step === 3 || step === 6 ? activePulseClass : (step > 3 && step !== 6 && step < 7 ? 'text-amber-400 bg-amber-500/5' : inactiveFactorClass)}`}
                                    style={{ left: '295px', width: '30px' }}
                                    animate={step === 3 || step === 6 ? { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    whileHover={step === 3 || step === 6 ? { scale: 1.15 } : {}}
                                    whileTap={step === 3 || step === 6 ? { scale: 0.95 } : {}}
                                >
                                    {problem.d}
                                </motion.div>
                                
                                <div className={`${parenthesisClass} absolute text-center font-serif`} style={{ left: '335px', width: '20px' }}>)</div>
                            </div>
                        </div>

                        {/* Intermediate Formula Builder */}
                        {step >= 2 && step <= 6 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`mt-4 p-3 rounded-xl font-mono text-base md:text-lg border select-none max-w-md mx-auto z-20 relative ${isDarkMode ? 'bg-white/5 border-white/10 text-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                dir="ltr"
                            >
                                {step === 2 && <span>x × x = x²</span>}
                                {step === 3 && <span>x² + x × {problem.d} = x² + {problem.d}x</span>}
                                {step === 4 && <span>x² + {problem.d}x</span>}
                                {step === 5 && <span>x² + {problem.d}x + {problem.b} × x = x² + {problem.d}x + {problem.b}x</span>}
                                {step === 6 && <span>x² + {problem.d}x + {problem.b}x + {problem.b} × {problem.d} = x² + {problem.d}x + {problem.b}x + {problem.b * problem.d}</span>}
                            </motion.div>
                        )}
                    </div>

                    {/* Progress Step Dots */}
                    <div className="flex justify-center gap-2 mb-5">
                        {[1, 2, 3, 4, 5, 6, 7].map(s => (
                            <motion.div
                                key={s}
                                className={`h-1.5 rounded-full transition-colors ${s <= step ? 'bg-indigo-500' : isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}
                                animate={{ width: s === step ? 28 : 12 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            />
                        ))}
                    </div>

                    {/* Help Guide Indicator */}
                    <AnimatePresence mode="wait">
                        {step < 7 && (
                            <motion.div 
                                key={`hint-${step}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3 }}
                                className={`mb-6 p-4 rounded-xl border text-xs md:text-sm max-w-md mx-auto text-center ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}
                            >
                                {step === 1 && "اضغط على الحد الأول بالقوس الأول (x) للبدء بتوزيعه."}
                                {step === 2 && "اضغط على الحد الأول بالقوس الثاني (x) لضربه في الحد الأول."}
                                {step === 3 && "اضغط على الحد الثاني بالقوس الثاني لضربه في الحد الأول."}
                                {step === 4 && "اضغط على الحد الثاني بالقوس الأول للبدء بتوزيعه."}
                                {step === 5 && "اضغط على الحد الأول بالقوس الثاني لضربه في الحد الثاني."}
                                {step === 6 && "اضغط على الحد الثاني بالقوس الثاني لضربه في الحد الثاني."}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {step === 7 && (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-4xl">
                                <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl mb-3 ${theme.card}`}>
                                    <div className="flex flex-wrap items-center justify-center gap-3 text-xl md:text-xl font-black font-mono text-white" dir="ltr">
                                        <div className="relative text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">x<span className="absolute -top-4 -right-4 text-base md:text-lg italic">2</span></div>
                                        <span className={`${opacityTextClass} font-serif`}>+</span>
                                        <motion.input whileFocus={{ scale: 1.03 }} type="number" value={inputs.x} onChange={(e) => setInputs({...inputs, x: e.target.value})} className={`w-28 md:w-44 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : inputClass} shadow-inner`} placeholder="?" autoFocus />
                                        <span className={`${staticTextClass} italic font-serif opacity-60`}>x</span>
                                        <span className={`${opacityTextClass} font-serif`}>+</span>
                                        <motion.input whileFocus={{ scale: 1.03 }} type="number" value={inputs.c} onChange={(e) => setInputs({...inputs, c: e.target.value})} className={`w-28 md:w-44 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : inputClass2} shadow-inner`} placeholder="?" />
                                    </div>
                                    
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="text-rose-500 text-sm font-bold mt-4"
                                            >
                                                النتيجة غير صحيحة، يرجى المحاولة مرة أخرى!
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={checkMastery} className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl flex items-center justify-center gap-3 transition-all"><CheckCircle2 size={20} /> تأكيد العملية</motion.button>
                            </motion.div>
                        )}

                        {step === 8 && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-4xl px-2">
                                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-4 border-emerald-500/40 rounded-[1.5rem] p-10 md:p-12 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                                    <div className="relative z-10 text-xl md:text-[6rem] font-mono font-black text-white flex flex-wrap items-center justify-center gap-4" dir="ltr">
                                        <div className="relative text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">x<span className="absolute -top-4 -right-4 text-base md:text-lg italic">2</span></div>
                                        <span className={`${opacityTextClass} font-serif`}>+</span>
                                        <span className="text-indigo-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.4)]">{problem.b + problem.d}x</span>
                                        <span className={`${opacityTextClass} font-serif`}>+</span>
                                        <span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">{problem.b * problem.d}</span>
                                    </div>
                                </div>
                                <button onClick={generateProblem} className="mt-3 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95">تحدي نشر جديد</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

export default function ExpansionDoubleLab() {
    const [labTitle, setLabTitle] = useState('النشر المزدوج');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            labId="expansion-double" 
            accentColor="indigo"
            badgeText="بروتوكول التوزيع الرباعي"
            badgeIcon={Layers}
            title={labTitle}
            phase={labPhase}
        >
            <ExpansionDoubleContent setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
