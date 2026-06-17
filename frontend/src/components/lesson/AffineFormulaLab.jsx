import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, Zap as ZapIcon, Target, Search, FastForward, ScanSearch, ShieldCheck, Fingerprint, TrendingUp, Lightbulb, BookOpen, Sigma, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function AffineFormulaContent({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [step, setStep] = useState(0); // 0: find a, 1: find b, 2: success
    const [a, setA] = useState(2);
    const [b, setB] = useState(3);
    const [p1, setP1] = useState({ x: 1, y: 5 });
    const [p2, setP2] = useState({ x: 2, y: 7 });
    const [inputA, setInputA] = useState('');
    const [inputB, setInputB] = useState('');
    const [error, setError] = useState(false);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        labProgressService.getOne('affine-formula')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'بروتوكول استخراج الميل',
            detail: 'الميل a هو معدل التغير. نحسبه بقسمة فرق الصور على فرق السوابق.',
            math: 'a = (f(x\u2082) - f(x\u2081)) / (x\u2082 - x\u2081)',
            icon: <TrendingUp size={20} />
        },
        {
            title: 'خوارزمية تحديد الثابت',
            detail: 'بعد إيجاد a، نعوض في إحدى النقاط (مثلاً x\u2081) لاستنتاج الثابت b.',
            math: 'b = f(x\u2081) - a \u00d7 x\u2081',
            icon: <Target size={20} />
        }
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('linear', difficultyLevel);
        const maxCoeff = params.maxCoeff || 5;

        const newA = (Math.floor(Math.random() * maxCoeff) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const newB = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
        
        const x1 = Math.floor(Math.random() * 3) + 1;
        const x2 = x1 + Math.floor(Math.random() * 2) + 1;
        
        setA(newA);
        setB(newB);
        setP1({ x: x1, y: newA * x1 + newB });
        setP2({ x: x2, y: newA * x2 + newB });
        
        setPhase('practice');
        setStep(0);
        setInputA('');
        setInputB('');
        setError(false);
        setIsCompleted(false);

        labProgressService.update('affine-formula', 'practice').catch(console.error);
    };

    const handleCheckA = () => {
        if (parseFloat(inputA) === a) {
            setStep(1);
            setError(false);
            confetti({ particleCount: 50, spread: 40, origin: { x: 0.8, y: 0.6 } });
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    const handleCheckB = async () => {
        if (parseFloat(inputB) === b) {
            setStep(2);
            setIsCompleted(true);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                await labProgressService.update('affine-formula', 'completed', 100);
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
            setLabTitle('استخراج العبارة');
        } else if (isCompleted) {
            setLabTitle('اكتمال فك الشيفرة');
        } else {
            setLabTitle(step === 0 ? 'كشف الميل a' : 'تحديد الثابت b');
        }
    }, [phase, isCompleted, step, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 w-full overflow-hidden px-4" dir="rtl">
            {phase === 'intro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-6xl">
                    <div className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-3xl transition-all shadow-2xl ${theme.card}`}>
                         <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-[1rem] flex items-center justify-center text-white mb-4 shadow-xl"><BookOpen size={20} /></div>
                         <h3 className={`text-base md:text-lg font-black mb-4 tracking-tighter ${theme.textMain}`}>خوارزمية الاستخراج:</h3>
                         <div className="space-y-6">
                             <div className="bg-white/5 p-8 rounded-[1rem] border-2 border-orange-500/20 text-center shadow-inner">
                                 <div className="text-xl md:text-2xl font-black font-mono text-white flex items-center justify-center gap-3" dir="ltr">
                                     <span>a =</span>
                                     <div className="flex flex-col items-center">
                                         <span className="border-b-4 border-orange-500 px-6 font-serif">Δf(x)</span>
                                         <span className="text-2xl opacity-40 font-serif">Δx</span>
                                     </div>
                                 </div>
                             </div>
                             <div className="bg-white/5 p-8 rounded-[1rem] border-2 border-amber-500/20 text-center shadow-inner">
                                 <div className="text-xl md:text-2xl font-black font-mono text-white tracking-tighter" dir="ltr">
                                     b = f(x) - a × x
                                 </div>
                             </div>
                         </div>
                         <button onClick={() => setPhase('learn')} className="mt-3 px-8 py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all border border-white/10 w-full text-center text-xl shadow-lg">فتح دليل البروتوكول</button>
                    </div>
                    <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-3xl">
                        <div className={`absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-600 to-orange-800 transition-transform duration-500 group-hover:scale-110`} />
                        <div className="relative p-4 md:p-5 flex flex-col items-center justify-center text-center gap-4 text-white">
                            <ScanSearch size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                            <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest leading-tight">تفعيل وحدة الاستقصاء</span>
                        </div>
                    </motion.button>
                </div>
            )}

            {phase === 'practice' && (
                <div className="flex flex-col items-center w-full max-w-6xl px-4">
                    <div className={`w-full p-4 md:p-6 rounded-[4.5rem] border-2 backdrop-blur-3xl mb-12 text-center transition-all duration-700 relative overflow-hidden shadow-2xl ${isCompleted ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                         <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 opacity-30" />
                         
                         <div className="flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
                             <div className="text-right space-y-8 flex-grow">
                                 <div className="px-6 py-2 rounded-full bg-orange-500/20 text-orange-400 font-black text-xs md:text-sm uppercase tracking-[0.4em] mb-4 inline-block border border-orange-500/30 italic">قاعدة المعطيات الإحداثية</div>
                                 <div className="space-y-6">
                                     <div className="bg-white/5 px-4 py-2 rounded-[1.5rem] border-2 border-orange-500/20 text-white text-base md:text-lg font-black shadow-inner font-mono transition-transform hover:scale-105" dir="ltr">
                                         f(<span className="text-orange-400">{p1.x}</span>) = <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{p1.y}</span>
                                     </div>
                                     <div className="bg-white/5 px-4 py-2 rounded-[1.5rem] border-2 border-orange-500/20 text-white text-base md:text-lg font-black shadow-inner font-mono transition-transform hover:scale-105" dir="ltr">
                                         f(<span className="text-orange-400">{p2.x}</span>) = <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{p2.y}</span>
                                     </div>
                                 </div>
                             </div>

                             <AnimatePresence mode="wait">
                                 {step === 0 && (
                                     <motion.div key="stage-a" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md">
                                         <div className="bg-white/5 p-5 rounded-[1.5rem] border-2 border-white/10 shadow-inner mb-4">
                                             <p className="text-orange-400 font-black text-2xl mb-4 italic tracking-tighter text-center">احسب الميل (a):</p>
                                             <div className="flex items-center justify-center gap-3 text-xl md:text-2xl font-black font-mono">
                                                 <span className="text-white italic">a =</span>
                                                 <input type="number" value={inputA} onChange={(e) => setInputA(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckA()} className={`w-36 md:w-56 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'border-orange-500/30 text-orange-400 focus:border-orange-500 shadow-inner'}`} placeholder="?" autoFocus />
                                             </div>
                                         </div>
                                         <button onClick={handleCheckA} className="w-full py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"><FastForward size={40} className="rotate-180" /> تأكيد الميل a</button>
                                     </motion.div>
                                 )}

                                 {step === 1 && (
                                     <motion.div key="stage-b" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md">
                                         <div className="bg-white/5 p-5 rounded-[1.5rem] border-2 border-white/10 shadow-inner mb-4">
                                             <div className="flex flex-col items-center mb-4">
                                                 <div className="px-6 py-2 bg-emerald-500/20 text-emerald-400 rounded-full font-black text-lg border-2 border-emerald-500/30 mb-3 shadow-inner">تم كشف a = {a}</div>
                                                 <p className="text-amber-400 font-black text-2xl italic tracking-tighter">احسب الثابت (b):</p>
                                             </div>
                                             <div className="flex items-center justify-center gap-3 text-xl md:text-2xl font-black font-mono">
                                                 <span className="text-white italic">b =</span>
                                                 <input type="number" value={inputB} onChange={(e) => setInputB(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckB()} className={`w-36 md:w-56 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'border-amber-500/30 text-amber-400 focus:border-amber-400 shadow-inner'}`} placeholder="?" autoFocus />
                                             </div>
                                         </div>
                                         <button onClick={handleCheckB} className="w-full py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"><CheckCircle2 size={40} /> تأكيد الثابت b</button>
                                     </motion.div>
                                 )}

                                 {step === 2 && (
                                     <motion.div key="success-area" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl">
                                         <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-4 border-emerald-500/40 rounded-[5rem] p-12 md:p-16 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                                              <div className="relative z-10 text-xl text-emerald-400 font-black mb-4 uppercase tracking-[0.4em] italic drop-shadow-glow">فك الشيفرة مكتمـل!</div>
                                              <div className="relative z-10 text-xl md:text-8xl font-mono font-black text-white drop-shadow-[0_0_30px_rgba(52,211,153,0.4)]" dir="ltr">
                                                 f(x) = {a}x {b >= 0 ? '+' : ''} <span className="text-emerald-400 italic">{b}</span>
                                             </div>
                                         </div>
                                         <button onClick={generateProblem} className="mt-3 w-full py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95">تحليل هوية جديدة</button>
                                     </motion.div>
                                 )}
                             </AnimatePresence>
                         </div>
                    </div>
                    
                    {step < 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 md:p-6 rounded-[1.5rem] border-2 text-orange-300 text-xl font-medium leading-relaxed w-full max-w-6xl text-center backdrop-blur-3xl shadow-inner italic ${theme.card}`}>
                            <h5 className="text-orange-400 font-black text-xl mb-3 flex items-center gap-3 justify-center leading-none drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]"><Lightbulb size={20} /> بروتوكول التحليل الذكي:</h5>
                            <div className="text-white/40 text-xl md:text-2xl font-mono font-bold space-y-6">
                                {step === 0 ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="opacity-40 italic">a = ({p2.y} - {p1.y}) / ({p2.x} - {p1.x})</div>
                                        <div className="text-orange-400 text-xl md:text-2xl font-black drop-shadow-[0_0_20px_rgba(251,146,60,0.4)]">a = {p2.y - p1.y} / {p2.x - p1.x}</div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="opacity-40 italic">{a} × {p1.x} + b = {p1.y}</div>
                                        <div className="text-amber-400 text-xl md:text-2xl font-black drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">b = {p1.y} - {a * p1.x}</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function AffineFormulaLab() {
    const [labTitle, setLabTitle] = useState('استخراج العبارة');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            labId="affine-formula" 
            accentColor="orange"
            badgeText="وحدة الاستقصاء"
            badgeIcon={Fingerprint}
            title={labTitle}
            phase={labPhase}
        >
            <AffineFormulaContent setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
