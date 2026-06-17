import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, BookOpen, RefreshCw, Zap as ZapIcon, Sigma, Cpu, Binary, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function RootsMultiplicationContent() {
    const { theme, isDarkMode, currentAccent } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0); // 0: input result, 1: reward
    const [practicePair, setPracticePair] = useState({ a: 2, b: 3, res: 6 });
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        labProgressService.getOne('roots-multiplication')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'بروتوكول الاندماج الجذري',
            detail: 'عند ضرب جذرين تربيعيين، يمكننا دمج القيمتين تحت جذر واحد كبير لتبسيط العملية وتوحيد المظلة.',
            math: '\u221aa \u00d7 \u221ab = \u221a(a \u00d7 b)',
            icon: <ZapIcon size={20} />
        },
        {
            title: 'خوارزمية الضرب الموحد',
            detail: 'ببساطة، نضرب الأعداد الموجودة داخل الجذور ببعضها، ونضع الناتج تحت رمز جذر واحد مشترك.',
            math: '\u221a2 \u00d7 \u221a3 = \u221a6',
            icon: <Binary size={20} />
        }
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('roots', difficultyLevel);
        const maxNum = params.maxNum || 12;
        
        const nums = [2, 3, 5, 7, 10, 6, 8, 11, 13, 14, 15].filter(n => n <= maxNum);
        const a = nums[Math.floor(Math.random() * nums.length)];
        let b = nums[Math.floor(Math.random() * nums.length)];
        while (a === b && nums.length > 1) b = nums[Math.floor(Math.random() * nums.length)];
        
        setPracticePair({ a, b, res: a * b });
        setPhase('practice');
        setStep(0);
        setInputVal('');
        setError(false);
        setIsCompleted(false);

        labProgressService.update('roots-multiplication', 'practice').catch(console.error);
    };

    const handleCheck = async () => {
        if (parseInt(inputVal) === practicePair.res) {
            setStep(1);
            setIsCompleted(true);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                await labProgressService.update('roots-multiplication', 'completed', 100);
            } catch (err) { console.error(err); }
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    return (
        <div className={`w-full h-full flex flex-col font-sans transition-all duration-500`} dir="rtl">
            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full overflow-hidden px-4">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                        <div className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-3xl transition-all shadow-2xl ${theme.card}`}>
                             <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>قانون الدمج:</h3>
                             <div className={`p-8 rounded-[1.5rem] border-2 text-center bg-white/5 border-white/10 shadow-inner`}>
                                <div className={`text-base md:text-lg font-black font-mono tracking-tighter flex items-center justify-center gap-3`} dir="ltr">
                                    <span className="text-cyan-400">\u221aa</span>
                                    <span className="text-white opacity-40">\u00d7</span>
                                    <span className="text-orange-400">\u221ab</span>
                                    <span className="text-white">=</span>
                                    <span className="text-rose-400 italic drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">\u221a(a \u00d7 b)</span>
                                </div>
                             </div>
                             <button onClick={() => { setPhase('learn'); setLearnStep(0); labProgressService.update('roots-multiplication', 'learn').catch(console.error); }} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all border border-white/10 shadow-lg">فتح الشرح</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 transition-transform duration-500 group-hover:scale-110`} />
                            <div className="relative p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 text-white">
                                <Sigma size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">بدء التحدي</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-4xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="flex flex-col items-center text-center">
                                 <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                 <p className={`text-sm md:text-base ${theme.textSub} mb-3 max-w-2xl font-medium leading-relaxed italic`}>{learnPages[learnStep].detail}</p>
                                 <div className={`p-5 rounded-[1.5rem] border-2 bg-white/5 border-white/10 shadow-inner w-full`}>
                                     <span className="text-xl md:text-xl font-mono font-black text-white" dir="ltr">
                                        {learnStep === 0 ? (
                                            <>
                                                <span className="text-cyan-400">\u221aa</span> \u00d7 <span className="text-orange-400">\u221ab</span> = <span className="text-rose-400">\u221a(a \u00d7 b)</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-cyan-400">\u221a2</span> \u00d7 <span className="text-orange-400">\u221a3</span> = <span className="text-rose-400 font-bold drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">\u221a6</span>
                                            </>
                                        )}
                                     </span>
                                 </div>
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-3 px-6">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-2xl font-black transition-all ${isDarkMode ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                             {learnStep < 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-2xl font-black shadow-xl text-xl">التالي</button>
                             ) : (
                                 <button onClick={generateProblem} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-black shadow-xl text-xl">بدء التحدي</button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="flex flex-col items-center w-full max-w-5xl px-2">
                        <div className={`w-full p-12 md:p-16 rounded-[1.5rem] border backdrop-blur-3xl mb-3 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${isCompleted ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-30" />
                            <div className="flex flex-wrap items-center justify-center gap-5 relative z-10" dir="ltr">
                                <AnimatePresence mode="wait">
                                    {!isCompleted ? (
                                        <motion.div key="fusion" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2, filter: 'blur(5px)' }} className="flex items-center gap-3 text-xl md:text-[9rem] font-black font-mono text-white leading-none">
                                            <div className="flex items-center gap-3">
                                                <span className="text-rose-500 font-serif italic">\u221a</span>
                                                <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">{practicePair.a}</span>
                                            </div>
                                            <span className="text-white opacity-40 font-serif italic">\u00d7</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-rose-500 font-serif italic">\u221a</span>
                                                <span className="text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.3)]">{practicePair.b}</span>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="result" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center text-2xl md:text-[12rem] font-black font-mono text-white leading-none">
                                            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 px-12 py-10 rounded-[1.5rem] border-4 border-emerald-500/40 shadow-2xl relative overflow-hidden">
                                                <span className="text-rose-500 font-serif italic drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">\u221a</span>
                                                <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">{practicePair.res}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <AnimatePresence>
                            {!isCompleted && (
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-4xl px-4">
                                    <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl mb-4 ${theme.card}`}>
                                        <div className="flex items-center justify-center gap-3 text-2xl md:text-xl font-black font-mono text-white" dir="ltr">
                                            <span className="text-rose-500 font-serif italic">\u221a</span>
                                            <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-36 md:w-64 bg-white/5 border-4 rounded-[1.5rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-indigo-500/30 text-indigo-400 focus:border-indigo-500 shadow-inner'}`} placeholder="?" autoFocus />
                                        </div>
                                    </div>
                                    <button onClick={handleCheck} className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"><ZapIcon size={36} /> تفعيل الاندماج</button>
                                </motion.div>
                            )}

                            {isCompleted && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-2xl px-2">
                                    <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/40 p-8 rounded-3xl text-emerald-400 font-bold mb-3 text-2xl shadow-lg">اندماج جذري متكامل!</div>
                                    <button onClick={generateProblem} className="mt-4 w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[1rem] font-black text-2xl shadow-xl transition-all active:scale-95">تحدي جديد</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RootsMultiplicationLab() {
    return (
        <LabShell 
            labId="roots-multiplication" 
            title="ضرب الجذور التربيعية" 
            icon={Sigma}
            accentColor="indigo"
            badgeText="بروتوكول دمج الجذور"
            badgeIcon={ZapIcon}
        >
            <RootsMultiplicationContent />
        </LabShell>
    );
}
