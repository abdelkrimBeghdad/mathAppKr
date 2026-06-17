import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap as ZapIcon, Cpu, ArrowDown, ArrowUp, FastForward, Settings, Plus, BookOpen, Target, Sigma, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function AffineImageContent({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [mode, setMode] = useState('image'); // 'image' or 'preimage'
    const [step, setStep] = useState(0); // 0: input, 1: reward
    const [a, setA] = useState(2);
    const [b, setB] = useState(3);
    const [x, setX] = useState(4);
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        labProgressService.getOne('affine-image')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const generateProblem = (newMode) => {
        const params = difficultyEngine.getParams('linear', difficultyLevel);
        const maxCoeff = params.maxCoeff || 5;
        const maxInput = params.maxInput || 5;

        const newA = (Math.floor(Math.random() * maxCoeff) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const newB = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const newX = (Math.floor(Math.random() * maxInput) + 1) * (Math.random() > 0.5 ? 1 : -1);
        
        setA(newA);
        setB(newB);
        setX(newX);
        setMode(newMode || mode);
        setPhase('practice');
        setStep(0);
        setInputVal('');
        setError(false);
        setIsProcessing(false);
        setIsCompleted(false);

        labProgressService.update('affine-image', 'practice').catch(console.error);
    };

    const handleCheck = async () => {
        const target = mode === 'image' ? (a * x + b) : x;
        if (parseFloat(inputVal) === target) {
            setIsProcessing(true);
            setTimeout(async () => {
                setStep(1);
                setIsProcessing(false);
                setIsCompleted(true);
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                try {
                    await labProgressService.update('affine-image', 'completed', 100);
                } catch (err) { console.error(err); }
                setError(false);
            }, 2000);
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('معالج التآلف');
        } else if (isProcessing) {
            setLabTitle('تزامن المرحلتين...');
        } else if (isCompleted) {
            setLabTitle('تم الحساب!');
        } else {
            setLabTitle(mode === 'image' ? `حساب f(${x})` : 'استرجاع x');
        }
    }, [phase, isProcessing, isCompleted, mode, x, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 w-full overflow-hidden px-4" dir="rtl">
            {phase === 'intro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-6xl">
                    <button onClick={() => generateProblem('image')} className={`group relative p-12 rounded-[1.5rem] text-right transition-all border shadow-2xl backdrop-blur-3xl overflow-hidden flex flex-col gap-4 ${theme.card} hover:bg-orange-500/10 hover:border-orange-500/50`}>
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-[1rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform"><ArrowDown size={40} /></div>
                        <div>
                            <h3 className={`text-xl md:text-2xl font-black mb-4 tracking-tighter ${theme.textMain}`}>حساب الصورة f(x)</h3>
                            <p className={`${theme.textSub} text-xl font-medium leading-relaxed italic`}>أدخل x، وشاهد المعالج وهو يضرب ثم يجمع لينتج النتيجة النهائية بدقة متناهية.</p>
                        </div>
                    </button>
                    <button onClick={() => generateProblem('preimage')} className={`group relative p-12 rounded-[1.5rem] text-right transition-all border shadow-2xl backdrop-blur-3xl overflow-hidden flex flex-col gap-4 ${theme.card} hover:bg-amber-500/10 hover:border-amber-500/50`}>
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-[1rem] flex items-center justify-center text-white shadow-xl group-hover:-rotate-12 transition-transform"><ArrowUp size={40} /></div>
                        <div>
                            <h3 className={`text-xl md:text-2xl font-black mb-4 tracking-tighter ${theme.textMain}`}>حساب العدد x</h3>
                            <p className={`${theme.textSub} text-xl font-medium leading-relaxed italic`}>العودة بالزمن الجبري: اطرح الثابت b ثم اقسم على المعامل a لاكتشاف الأصل.</p>
                        </div>
                    </button>
                </div>
            )}

            {phase === 'practice' && (
                <div className="flex flex-col items-center w-full max-w-6xl px-4">
                    <div className="relative w-full max-w-3xl flex flex-col items-center justify-center mb-12">
                         <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 backdrop-blur-3xl text-center relative overflow-hidden transition-all duration-700 shadow-2xl w-full ${isCompleted ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 opacity-30" />
                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <div className="text-base md:text-lg font-black font-mono text-white drop-shadow-[0_0_20px_rgba(251,146,60,0.3)]" dir="ltr">
                                    f(x) = {a}x {b >= 0 ? '+' : ''} {b}
                                </div>
                                <div className="flex flex-col gap-3 w-full max-w-md">
                                    <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border-2 border-orange-500/20 shadow-inner">
                                        <div className="flex items-center gap-4 text-orange-400">
                                            <Settings className={isProcessing ? "animate-spin" : ""} size={20} />
                                            <span className="font-black text-2xl uppercase">الضرب في {a}</span>
                                        </div>
                                        <div className="text-white font-black text-2xl font-mono italic">Step 1</div>
                                    </div>
                                    <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border-2 border-amber-500/20 shadow-inner">
                                        <div className="flex items-center gap-4 text-amber-400">
                                            <Plus className={isProcessing ? "animate-bounce" : ""} size={20} />
                                            <span className="font-black text-2xl uppercase">إضافة {b}</span>
                                        </div>
                                        <div className="text-white font-black text-2xl font-mono italic">Step 2</div>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>

                    {!isCompleted && !isProcessing && (
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-4xl p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl text-center backdrop-blur-3xl ${theme.card}`}>
                            <div className="mb-3">
                                <p className="text-orange-400 font-black text-2xl mb-4 tracking-tighter italic">
                                    {mode === 'image' ? `أوجد قيمة f(${x}) :` : `أوجد قيمة x إذا كانت النتيجة f(x) = ${a*x+b} :`}
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-4">
                                    <span className="text-xl md:text-2xl font-black text-white font-mono tracking-tighter">{mode === 'image' ? `f(${x})` : `x`} =</span>
                                    <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-40 md:w-64 bg-white/5 border-4 rounded-[1.5rem] text-center py-3 text-xl md:text-2xl font-black outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'border-orange-500/30 text-orange-400 focus:border-orange-400 shadow-inner'}`} placeholder="?" autoFocus />
                                </div>
                            </div>
                            <button onClick={handleCheck} className="w-full py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"><FastForward size={40} /> تفعيل المعالجة المزدوجة</button>
                        </motion.div>
                    )}

                    {isCompleted && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-5xl px-4">
                            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-4 border-emerald-500/40 rounded-[5rem] p-4 md:p-5 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                                 <h3 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tighter italic drop-shadow-[0_0_40px_rgba(52,211,153,0.4)]">تحويل تآلفي متكامل!</h3>
                                 <p className="text-base md:text-lg text-emerald-400 font-bold opacity-80 leading-relaxed italic">
                                    {mode === 'image' ? `الضرب في ${a} ثم إضافة ${b} تعطي النتيجة ${a*x+b}.` : `بعكس العمليات (طرح ${b} ثم قسمة ${a}) وجدنا x = ${x}.`}
                                 </p>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-12 justify-center">
                                <button onClick={() => generateProblem('image')} className="px-12 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center gap-4"><ArrowDown size={20} /> تحدي صورة جديد</button>
                                <button onClick={() => generateProblem('preimage')} className="px-12 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center gap-4"><ArrowUp size={20} /> تحدي عدد جديد</button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function AffineImageLab() {
    const [labTitle, setLabTitle] = useState('معالج التآلف');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            labId="affine-image" 
            accentColor="orange"
            badgeText="بروتوكول التآلف"
            badgeIcon={ZapIcon}
            title={labTitle}
            phase={labPhase}
        >
            <AffineImageContent setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
