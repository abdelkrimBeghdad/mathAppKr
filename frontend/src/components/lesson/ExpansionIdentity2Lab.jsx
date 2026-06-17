import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, MinusCircle, ShieldCheck, BookOpen, Zap as ZapIcon, Target, Rocket, Sigma } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function ExpansionIdentity2Content({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [problem, setProblem] = useState({ b: 4 });
    const [step, setStep] = useState(1); // 1: identify a, 2: identify b, 3: input, 4: reward
    const [error, setError] = useState(false);
    const [inputs, setInputs] = useState({ mid: '', last: '' });
    const [difficultyLevel, setDifficultyLevel] = useState(1);

    useEffect(() => {
        labProgressService.getOne('expansion-identity-2')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'بروتوكول مربع الفرق',
            detail: 'المتطابقة الثانية هي النسخة "السالبة" من المربع الكامل، حيث يتغير فقط إشارة الحد الأوسط.',
            math: '(a - b)² = a² - 2ab + b²',
            icon: <MinusCircle size={20} />
        },
        {
            title: 'فخ الإشارة الأوسط',
            detail: 'تذكر دائماً: مربع الحد الثاني (+b²) دائماً موجب، بينما الحد الأوسط (-2ab) هو الوحيد السالب.',
            math: '-2 × a × b ➔ Negative Middle',
            icon: <ShieldCheck size={20} />
        }
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('expansion', difficultyLevel);
        const maxB = params.maxCoeff || 9;
        const b = Math.floor(Math.random() * maxB) + 1;
        setProblem({ b });
        setPhase('practice');
        setStep(1);
        setInputs({ mid: '', last: '' });
        setError(false);
        labProgressService.update('expansion-identity-2', 'practice').catch(console.error);
    };

    const handleTermClick = (term) => {
        if (step === 1 && term === 'a') setStep(2);
        if (step === 2 && term === 'b') setStep(3);
    };

    const checkMastery = async () => {
        const correctMid = 2 * problem.b;
        const correctLast = problem.b * problem.b;
        if (parseInt(inputs.mid) === correctMid && parseInt(inputs.last) === correctLast) {
            setStep(4);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                await labProgressService.update('expansion-identity-2', 'completed', 100);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('مربع فرق');
        } else if (phase === 'learn') {
            setLabTitle(learnPages[learnStep].title);
        } else if (step === 4) {
            setLabTitle('اكتمال النشر');
        } else {
            setLabTitle(step === 1 ? 'حدد x' : step === 2 ? `حدد ${problem.b}` : 'أدخل النواتج');
        }
    }, [phase, learnStep, step, problem.b, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 w-full overflow-hidden px-4" dir="rtl">
            {phase === 'intro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                    <div className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-3xl transition-all shadow-2xl ${theme.card}`}>
                         <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl"><BookOpen size={20} /></div>
                         <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>بروتوكول الفرق:</h3>
                         <div className={`p-8 rounded-[1.5rem] border-2 text-center bg-white/5 border-white/10 shadow-inner`}>
                            <div className={`text-sm md:text-base font-black font-mono tracking-tighter text-indigo-400`} dir="ltr">
                                (a - b)² = a² - 2ab + b²
                            </div>
                         </div>
                         <button onClick={() => setPhase('learn')} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all border border-white/10 shadow-lg">مراجعة خوارزمية الإشارات</button>
                    </div>
                    <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 transition-transform duration-500 group-hover:scale-110`} />
                        <div className="relative p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 text-white">
                            <MinusCircle size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                            <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">تحليل الفرق</span>
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
                        <div className="relative flex items-center justify-center w-full text-2xl md:text-8xl font-black font-mono z-20" dir="ltr">
                            <span className="text-white/20 font-serif opacity-40">(</span>
                            <motion.div onClick={() => handleTermClick('a')} className={`px-4 py-2 rounded-2xl cursor-pointer transition-all ${step >= 2 ? 'text-sky-400 bg-sky-500/10' : step === 1 ? 'text-white animate-pulse bg-white/5 border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/20'}`}>x</motion.div>
                            <span className="text-indigo-400 opacity-60 font-serif italic">-</span>
                            <motion.div onClick={() => handleTermClick('b')} className={`px-4 py-2 rounded-2xl cursor-pointer transition-all ${step >= 3 ? 'text-indigo-400 bg-indigo-500/10' : step === 2 ? 'text-white animate-pulse bg-white/5 border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/20'}`}>{problem.b}</motion.div>
                            <div className="relative">
                                <span className="text-white/20 font-serif opacity-40">)</span>
                                <span className="text-indigo-400 absolute -top-8 -right-8 text-xl md:text-xl italic drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]">2</span>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-4xl">
                                <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl mb-3 ${theme.card}`}>
                                    <div className="flex flex-wrap items-center justify-center gap-3 text-xl md:text-xl font-black font-mono text-white" dir="ltr">
                                        <div className="relative text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">x<span className="absolute -top-4 -right-4 text-base md:text-lg italic">2</span></div>
                                        <span className="text-indigo-400 opacity-60 font-serif italic">-</span>
                                        <input type="number" value={inputs.mid} onChange={(e) => setInputs({...inputs, mid: e.target.value})} className={`w-28 md:w-44 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-indigo-500/30 text-indigo-400 focus:border-indigo-400 shadow-inner'}`} placeholder="?" autoFocus />
                                        <span className="italic font-serif opacity-40">x</span>
                                        <span className="text-white opacity-20 font-serif">+</span>
                                        <input type="number" value={inputs.last} onChange={(e) => setInputs({...inputs, last: e.target.value})} className={`w-28 md:w-44 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-emerald-500/30 text-emerald-400 focus:border-emerald-400 shadow-inner'}`} placeholder="?" />
                                    </div>
                                </div>
                                <button onClick={checkMastery} className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><CheckCircle2 size={20} /> تأكيد التفكيك</button>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-4xl px-2">
                                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-4 border-emerald-500/40 rounded-[1.5rem] p-12 md:p-16 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                                    <div className="relative z-10 text-xl md:text-[6rem] font-mono font-black text-white flex flex-wrap items-center justify-center gap-4" dir="ltr">
                                        <div className="relative text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">x<span className="absolute -top-4 -right-4 text-base md:text-lg italic">2</span></div>
                                        <span className="text-indigo-400 opacity-60 font-serif italic">-</span>
                                        <span className="text-indigo-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.4)]">{2 * problem.b}x</span>
                                        <span className="text-white opacity-20 font-serif">+</span>
                                        <span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">{problem.b * problem.b}</span>
                                    </div>
                                </div>
                                <button onClick={generateProblem} className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95">تحدي فرق جديد</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

export default function ExpansionIdentity2Lab() {
    const [labTitle, setLabTitle] = useState('مربع فرق');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            labId="expansion-identity-2" 
            accentColor="indigo"
            badgeText="المتطابقة الشهيرة #2"
            badgeIcon={MinusCircle}
            title={labTitle}
            phase={labPhase}
        >
            <ExpansionIdentity2Content setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
