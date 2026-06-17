import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, Scissors, Layers, BookOpen, Zap as ZapIcon, Target, Rocket, Sigma } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function ExpansionIdentity3Content({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [problem, setProblem] = useState({ b: 7 });
    const [step, setStep] = useState(1); // 1: identify a, 2: identify b, 3: input, 4: reward
    const [error, setError] = useState(false);
    const [inputs, setInputs] = useState({ last: '' });
    const [difficultyLevel, setDifficultyLevel] = useState(1);

    useEffect(() => {
        labProgressService.getOne('expansion-identity-3')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'بروتوكول فرق المربعين',
            detail: 'المتطابقة الثالثة هي الأكثر اختصاراً، حيث يضرب مجموع حدين في فرقهما لينتج فرق مربعي الحدين.',
            math: '(a + b)(a - b) = a² - b²',
            icon: <Scissors size={20} />
        },
        {
            title: 'خوارزمية التلاشي',
            detail: 'في هذه الحالة، الحدود الوسطى (+ab) و (-ab) تلغي بعضها البعض تماماً، مما يسهل العملية.',
            math: 'ab - ab ➔ Zero Middle',
            icon: <Layers size={20} />
        }
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('expansion', difficultyLevel);
        const maxB = params.maxCoeff || 9;
        const b = Math.floor(Math.random() * maxB) + 2;
        setProblem({ b });
        setPhase('practice');
        setStep(1);
        setInputs({ last: '' });
        setError(false);
        labProgressService.update('expansion-identity-3', 'practice').catch(console.error);
    };

    const handleTermAClick = () => { if (step === 1) setStep(2); };
    const handleTermBClick = () => { if (step === 2) setStep(3); };

    const checkMastery = async () => {
        const correctLast = problem.b * problem.b;
        if (parseInt(inputs.last) === correctLast) {
            setStep(4);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                await labProgressService.update('expansion-identity-3', 'completed', 100);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('فرق مربعين');
        } else if (phase === 'learn') {
            setLabTitle(learnPages[learnStep].title);
        } else if (step === 4) {
            setLabTitle('اكتمال النشر');
        } else {
            setLabTitle(step === 1 ? 'حدد x' : step === 2 ? `حدد ${problem.b}` : 'أدخل النتيجة');
        }
    }, [phase, learnStep, step, problem.b, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 w-full overflow-hidden px-4" dir="rtl">
            {phase === 'intro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                    <div className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-3xl transition-all shadow-2xl ${theme.card}`}>
                         <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl"><BookOpen size={20} /></div>
                         <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>قاعدة الاختزال:</h3>
                         <div className={`p-8 rounded-[1.5rem] border-2 text-center bg-white/5 border-white/10 shadow-inner`}>
                            <div className={`text-sm md:text-base font-black font-mono tracking-tighter text-indigo-400`} dir="ltr">
                                (a + b)(a - b) = a² - b²
                            </div>
                         </div>
                         <button onClick={() => setPhase('learn')} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all border border-white/10 shadow-lg">مراجعة بروتوكول الاختزال</button>
                    </div>
                    <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 transition-transform duration-500 group-hover:scale-110`} />
                        <div className="relative p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 text-white">
                            <Scissors size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                            <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">تفعيل الاختزال</span>
                        </div>
                    </motion.button>
                </div>
            )}

            {phase === 'learn' && (
                <div className="w-full max-w-4xl px-2">
                    <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                         <div className="flex flex-col items-center text-center">
                             <div className={`w-20 h-20 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 shadow-inner`}>{learnPages[learnStep].icon}</div>

                             <p className={`text-sm md:text-base ${theme.textSub} mb-3 max-w-2xl font-medium leading-relaxed italic`}>{learnPages[learnStep].detail}</p>
                             <div className={`p-5 rounded-[1.5rem] border-2 bg-white/5 border-white/10 shadow-inner w-full`}>
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
                    <div className={`w-full p-4 md:p-6 rounded-[1.5rem] border-2 backdrop-blur-3xl mb-12 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${step === 4 ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-30" />
                        <div className="relative flex items-center justify-center w-full text-base md:text-lg font-black font-mono z-20" dir="ltr">
                            <span className="text-white/20 font-serif opacity-40">(</span>
                            <motion.div onClick={handleTermAClick} className={`px-6 py-2 rounded-2xl cursor-pointer transition-all ${step >= 2 ? 'text-sky-400 bg-sky-500/10' : step === 1 ? 'text-white animate-pulse bg-white/5 border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/20'}`}>x</motion.div>
                            <span className="text-emerald-400 opacity-60 font-serif italic">+</span>
                            <motion.div onClick={handleTermBClick} className={`px-6 py-2 rounded-2xl cursor-pointer transition-all ${step >= 3 ? 'text-amber-400 bg-amber-500/10' : step === 2 ? 'text-white animate-pulse bg-white/5 border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/20'}`}>{problem.b}</motion.div>
                            <span className="text-white/20 font-serif opacity-40">)(</span>
                            <span className={`${step >= 2 ? 'text-sky-400 opacity-100' : 'text-white/20'}`}>x</span>
                            <span className="text-rose-500 opacity-60 font-serif italic">-</span>
                            <span className={`${step >= 3 ? 'text-amber-400 opacity-100' : 'text-white/20'}`}>{problem.b}</span>
                            <span className="text-white/20 font-serif opacity-40">)</span>
                        </div>
                    </div>

                    <AnimatePresence>
                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-4xl">
                                <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl mb-3 ${theme.card}`}>
                                    <div className="flex flex-wrap items-center justify-center gap-3 text-xl md:text-xl font-black font-mono text-white" dir="ltr">
                                        <div className="relative text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">x<span className="absolute -top-4 -right-4 text-base md:text-lg italic">2</span></div>
                                        <span className="text-rose-500 opacity-60 font-serif italic">-</span>
                                        <input type="number" value={inputs.last} onChange={(e) => setInputs({...inputs, last: e.target.value})} className={`w-16 md:w-24 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-indigo-500/30 text-indigo-400 focus:border-indigo-400 shadow-inner'}`} placeholder="?" autoFocus />
                                    </div>
                                </div>
                                <button onClick={checkMastery} className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><CheckCircle2 size={20} /> تأكيد الاختزال</button>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-4xl px-2">
                                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-4 border-emerald-500/40 rounded-[1.5rem] p-12 md:p-16 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                                    <div className="relative z-10 text-xl md:text-[6rem] font-mono font-black text-white flex flex-wrap items-center justify-center gap-4" dir="ltr">
                                        <div className="relative text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">x<span className="absolute -top-4 -right-4 text-base md:text-lg italic">2</span></div>
                                        <span className="text-rose-500 opacity-60 font-serif italic">-</span>
                                        <span className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.4)]">{problem.b * problem.b}</span>
                                    </div>
                                </div>
                                <button onClick={generateProblem} className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95">تحدي اختزال جديد</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

export default function ExpansionIdentity3Lab() {
    const [labTitle, setLabTitle] = useState('فرق مربعين');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            labId="expansion-identity-3" 
            accentColor="indigo"
            badgeText="المتطابقة الشهيرة #3"
            badgeIcon={Scissors}
            title={labTitle}
            phase={labPhase}
        >
            <ExpansionIdentity3Content setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
