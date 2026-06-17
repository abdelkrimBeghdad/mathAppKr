import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, BookOpen, Zap as ZapIcon, Sigma, Cpu, Binary, Zap, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function RootsExpressionContent({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [step, setStep] = useState(0); // Current simplification step
    const [practicePair, setPracticePair] = useState({ 
        expr: '\u221a20 + \u221a45', 
        steps: ['2\u221a5 + 3\u221a5', '5\u221a5'],
        final: '5\u221a5'
    });
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        labProgressService.getOne('roots-expression')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const simplificationGuide = [
        { title: 'بروتوكول التفكيك', detail: 'نفكك كل جذر إلى حاصل ضرب مربع تام في عدد أولي (مثلاً \u221a20 = \u221a4\u00d75).' },
        { title: 'خوارزمية الاستخراج', detail: 'نستخرج الجذر التربيعي للمربعات التامة خارج المظلة الجذريّة.' },
        { title: 'الدمج النهائي', detail: 'نجمع أو نطرح الحدود التي لها نفس الجذر للحصول على أبسط صورة.' }
    ];

    const generateProblem = () => {
        const options = [
            { expr: '\u221a20 + \u221a45', steps: ['2\u221a5 + 3\u221a5', '5\u221a5'], final: '5\u221a5' },
            { expr: '\u221a8 + \u221a18', steps: ['2\u221a2 + 3\u221a2', '5\u221a2'], final: '5\u221a2' },
            { expr: '\u221a12 + \u221a27', steps: ['2\u221a3 + 3\u221a3', '5\u221a3'], final: '5\u221a3' },
            { expr: '\u221a50 - \u221a8', steps: ['5\u221a2 - 2\u221a2', '3\u221a2'], final: '3\u221a2' },
            { expr: '\u221a75 - \u221a12', steps: ['5\u221a3 - 2\u221a3', '3\u221a3'], final: '3\u221a3' },
            { expr: '\u221a32 + \u221a8', steps: ['4\u221a2 + 2\u221a2', '6\u221a2'], final: '6\u221a2' },
            { expr: '\u221a48 - \u221a27', steps: ['4\u221a3 - 3\u221a3', '1\u221a3'], final: '1\u221a3' }
        ];
        
        let newProb = options[Math.floor(Math.random() * options.length)];
        setPracticePair(newProb);
        setPhase('practice');
        setStep(0);
        setInputVal('');
        setError(false);
        setIsCompleted(false);
        labProgressService.update('roots-expression', 'practice').catch(console.error);
    };

    const handleCheck = async () => {
        const normalizedInput = inputVal.replace(/\s+/g, '').replace(/√/g, '\u221a');
        const normalizedTarget = practicePair.steps[step].replace(/\s+/g, '').replace(/√/g, '\u221a');

        if (normalizedInput === normalizedTarget) {
            if (step < practicePair.steps.length - 1) {
                setStep(step + 1);
                setInputVal('');
                confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
            } else {
                setStep(step + 1);
                setIsCompleted(true);
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                try {
                    await labProgressService.update('roots-expression', 'completed', 100);
                } catch (err) { console.error(err); }
            }
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('تبسيط العبارات');
        } else if (isCompleted) {
            setLabTitle('تبسيط مثالي!');
        } else {
            setLabTitle(`المرحلة ${step + 1}`);
        }
    }, [phase, isCompleted, step, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 w-full overflow-hidden px-4" dir="rtl">
            {phase === 'intro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                    <div className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-3xl transition-all shadow-2xl ${theme.card}`}>
                         <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl"><BookOpen size={20} /></div>
                         <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>خريطة التبسيط:</h3>
                         <div className="space-y-4">
                             {simplificationGuide.map((g, i) => (
                                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                     <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-lg shadow-inner">{i + 1}</div>
                                     <div>
                                        <h4 className="text-white font-bold text-lg">{g.title}</h4>
                                        <p className="text-white/40 text-sm italic">{g.detail}</p>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>
                    <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                        <div className={`absolute inset-0 bg-gradient-to-br from-rose-600 via-orange-600 to-rose-700 transition-transform duration-500 group-hover:scale-110`} />
                        <div className="relative p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 text-white">
                            <Binary size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                            <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">تفعيل المعالج</span>
                        </div>
                    </motion.button>
                </div>
            )}

            {phase === 'practice' && (
                <div className="flex flex-col items-center w-full max-w-5xl px-2">
                    <div className={`w-full p-4 md:p-6 rounded-[1.5rem] border-2 backdrop-blur-3xl mb-12 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${isCompleted ? 'border-emerald-500/40 bg-emerald-500/5 shadow-lg' : theme.card}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-orange-500/10 opacity-30" />
                        <div className="relative z-10 text-2xl md:text-8xl font-black font-mono leading-tight text-white drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]" dir="ltr">
                            {practicePair.expr}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isCompleted ? (
                            <motion.div key="input-area" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full text-center max-w-4xl">
                                <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl mb-3 ${theme.card}`}>
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <div className="px-6 py-2 rounded-full bg-rose-500/20 text-rose-400 font-black text-xl italic border border-rose-500/30">المرحلة {step + 1}</div>
                                    </div>
                                    <div className="relative">
                                        <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-full bg-white/5 border-4 rounded-[1.5rem] text-center py-2 outline-none text-xl md:text-xl font-black font-mono transition-all ${error ? 'border-rose-500 animate-shake text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'border-rose-500/30 text-rose-400 focus:border-rose-500 shadow-inner'}`} placeholder="a√x ± b√x" autoFocus dir="ltr" />
                                    </div>
                                </div>
                                <button onClick={handleCheck} className="w-full py-2 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                                    <Zap size={20} /> تأكيد المعالجة
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="success-area" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-4xl">
                                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-4 border-emerald-500/40 rounded-[1.5rem] p-4 md:p-5 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                                    <div className="relative z-10 text-2xl md:text-xl font-mono font-black text-white flex items-center justify-center gap-12 drop-shadow-[0_0_40px_rgba(52,211,153,0.4)]">
                                        <span dir="ltr">{practicePair.final}</span>
                                    </div>
                                </div>
                                <button onClick={generateProblem} className="mt-3 w-full py-2 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95">تحليل عبارة جديدة</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

export default function RootsExpressionLab() {
    const [labTitle, setLabTitle] = useState('تبسيط العبارات');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            labId="roots-expression" 
            accentColor="rose"
            badgeText="بروتوكول المعالجة"
            badgeIcon={Cpu}
            title={labTitle}
            phase={labPhase}
        >
            <RootsExpressionContent setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
