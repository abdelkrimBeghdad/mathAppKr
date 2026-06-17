import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, Zap as ZapIcon, Target, Search, FastForward, ScanSearch, ShieldCheck, BookOpen, Sigma, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function LinearFormulaContent({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [step, setStep] = useState(0); // 0: input, 1: reward
    const [a, setA] = useState(2);
    const [x, setX] = useState(3);
    const [inputA, setInputA] = useState('');
    const [error, setError] = useState(false);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        labProgressService.getOne('linear-formula')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'بروتوكول الكشف الجبري',
            detail: 'بما أن f(x) = ax، فإننا نستطيع "عزل" المعامل a من خلال قسمة النتيجة f(x) على المدخل x.',
            math: 'a = f(x) / x',
            icon: <ScanSearch size={20} />
        },
        {
            title: 'خوارزمية التحقق الرقمي',
            detail: 'دائماً تأكد من أن الناتج المحسوب يحقق العلاقة: f(x) = a × x بدقة تامة.',
            math: 'Test: a × x = f(x)',
            icon: <ShieldCheck size={20} />
        }
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('linear', difficultyLevel);
        const maxCoeff = params.maxCoeff || 5;
        const maxInput = params.maxInput || 5;

        const newA = (Math.floor(Math.random() * maxCoeff) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const newX = (Math.floor(Math.random() * maxInput) + 1);
        
        setA(newA);
        setX(newX);
        setPhase('practice');
        setStep(0);
        setInputA('');
        setError(false);
        setIsCompleted(false);

        labProgressService.update('linear-formula', 'practice').catch(console.error);
    };

    const handleCheck = async () => {
        if (parseFloat(inputA) === a) {
            setStep(1);
            setIsCompleted(true);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                await labProgressService.update('linear-formula', 'completed', 100);
            } catch (err) { console.error(err); }
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('استخراج المعامل');
        } else if (isCompleted) {
            setLabTitle('تم فك الشيفرة!');
        } else {
            setLabTitle('استنتاج a');
        }
    }, [phase, isCompleted, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 w-full overflow-hidden px-4" dir="rtl">
            {phase === 'intro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                    <div className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-3xl transition-all shadow-2xl ${theme.card}`}>
                         <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-sky-600 rounded-[1rem] flex items-center justify-center text-white mb-3 shadow-xl"><BookOpen size={20} /></div>
                         <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>القاعدة الذهبية:</h3>
                         <div className="bg-white/5 p-8 rounded-[1.5rem] border-2 border-indigo-500/20 text-center shadow-inner">
                             <div className="text-base md:text-lg font-black font-mono text-white tracking-tighter flex items-center justify-center gap-4" dir="ltr">
                                 <span>a = </span>
                                 <div className="flex flex-col items-center">
                                     <span className="border-b-4 border-indigo-500 px-6 font-serif">f(x)</span>
                                     <span className="text-2xl opacity-40 font-serif">x</span>
                                 </div>
                             </div>
                         </div>
                         <button onClick={() => setPhase('learn')} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all border border-white/10 w-full text-center text-xl shadow-lg">فتح دليل البروتوكول</button>
                    </div>
                    <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-sky-600 to-indigo-800 transition-transform duration-500 group-hover:scale-110`} />
                        <div className="relative p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 text-white">
                            <ScanSearch size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                            <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest leading-tight">تفعيل المسح الرقمي</span>
                        </div>
                    </motion.button>
                </div>
            )}

            {phase === 'learn' && (
                <div className="w-full max-w-4xl px-2">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                         <div className="flex flex-col items-center text-center">
                             <div className={`w-20 h-20 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 shadow-inner`}>{learnPages[0].icon}</div>

                             <p className={`text-sm md:text-base ${theme.textSub} mb-3 max-w-2xl font-medium leading-relaxed italic`}>{learnPages[0].detail}</p>
                             <div className={`p-5 rounded-[1.5rem] border-2 bg-white/5 border-white/10 shadow-inner w-full`}>
                                 <span className="text-base md:text-lg font-mono font-black text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]" dir="ltr">f(x) = ax ➔ a = f(x) / x</span>
                             </div>
                         </div>
                    </motion.div>
                    <button onClick={generateProblem} className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-[1rem] font-black text-2xl shadow-xl transition-all flex items-center justify-center gap-4">ابدأ المهمة <FastForward size={20} /></button>
                </div>
            )}

            {phase === 'practice' && (
                <div className="flex flex-col items-center w-full max-w-5xl px-2">
                    <div className={`w-full p-4 md:p-6 rounded-[1.5rem] border-2 backdrop-blur-3xl mb-12 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${isCompleted ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-sky-500/10 opacity-30" />
                        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 relative z-10">
                            <div className="text-center space-y-6">
                                <div className="px-6 py-2 rounded-full bg-indigo-500/20 text-indigo-400 font-black text-xs md:text-sm uppercase tracking-[0.4em] mb-4 inline-block border border-indigo-500/30 italic">معطيات المسح</div>
                                <div className="bg-white/5 px-4 py-2 rounded-[1.5rem] border-2 border-indigo-500/20 text-white text-base md:text-lg font-black font-mono shadow-inner" dir="ltr">
                                    f(<span className="text-indigo-400 italic">{x}</span>) = <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{a * x}</span>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {!isCompleted ? (
                                    <motion.div key="input-area" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm">
                                        <div className="bg-white/5 p-5 rounded-[1.5rem] border-2 border-white/10 shadow-inner mb-4">
                                            <div className="flex items-center justify-center gap-3 text-xl md:text-2xl font-black font-mono">
                                                <span className="text-white italic">a =</span>
                                                <input type="number" value={inputA} onChange={(e) => setInputA(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-36 md:w-52 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'border-indigo-500/30 text-indigo-400 focus:border-indigo-400 shadow-inner'}`} placeholder="?" autoFocus dir="ltr" />
                                            </div>
                                        </div>
                                        <button onClick={handleCheck} className="w-full py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"><ZapIcon size={20} /> تأكيد التحليل</button>
                                    </motion.div>
                                ) : (
                                    <motion.div key="success-area" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
                                        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-4 border-emerald-500/40 rounded-[1.5rem] p-12 md:p-16 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                                             <div className="relative z-10 text-xl text-emerald-400 font-black mb-4 uppercase tracking-[0.4em] italic drop-shadow-glow">اكتشاف جبري مثالي!</div>
                                             <div className="relative z-10 text-xl md:text-[6rem] font-mono font-black text-white drop-shadow-[0_0_40px_rgba(52,211,153,0.4)]" dir="ltr">
                                                 f(x) = <span className="text-emerald-400 italic">{a}</span>x
                                             </div>
                                        </div>
                                        <button onClick={generateProblem} className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95">تحليل عبارة جديدة</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function LinearFormulaLab() {
    const [labTitle, setLabTitle] = useState('استخراج المعامل');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            labId="linear-formula" 
            accentColor="indigo"
            badgeText="وحدة التحليل"
            badgeIcon={Search}
            title={labTitle}
            phase={labPhase}
        >
            <LinearFormulaContent setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
