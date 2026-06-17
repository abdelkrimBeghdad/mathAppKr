import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, BookOpen, RefreshCw, Zap as ZapIcon, Sigma, Cpu, Binary, Target, Microscope } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function RootsSimplificationContent() {
    const { theme, isDarkMode, currentAccent } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [step, setStep] = useState(0); // 0: breakdown, 1: root extraction, 2: reward
    const [learnStep, setLearnStep] = useState(1);
    const [practicePair, setPracticePair] = useState({ n: 50, square: 25, root: 5, remainder: 2 });
    const [inputA, setInputA] = useState('');
    const [inputB, setInputB] = useState('');
    const [error, setError] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [flightAnim, setFlightAnim] = useState(null);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    const containerRef = useRef(null);
    const elsRef = useRef({});
    const setRef = (id) => (el) => { if (el) elsRef.current[id] = el; };

    useEffect(() => {
        labProgressService.getOne('roots-simplification')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const generateProblem = () => {
        const options = [
            { n: 50, square: 25, root: 5, remainder: 2 },
            { n: 75, square: 25, root: 5, remainder: 3 },
            { n: 32, square: 16, root: 4, remainder: 2 },
            { n: 20, square: 4, root: 2, remainder: 5 },
            { n: 45, square: 9, root: 3, remainder: 5 },
            { n: 72, square: 36, root: 6, remainder: 2 },
            { n: 8, square: 4, root: 2, remainder: 2 },
            { n: 12, square: 4, root: 2, remainder: 3 },
            { n: 18, square: 9, root: 3, remainder: 2 },
            { n: 24, square: 4, root: 2, remainder: 6 },
            { n: 27, square: 9, root: 3, remainder: 3 },
            { n: 28, square: 4, root: 2, remainder: 7 }
        ];
        
        let newProb = options[Math.floor(Math.random() * options.length)];
        setPracticePair(newProb);
        setPhase('practice');
        setStep(0);
        setInputA('');
        setInputB('');
        setError(false);
        setIsCompleted(false);

        labProgressService.update('roots-simplification', 'practice').catch(console.error);
    };

    const handleNextLearnStep = () => {
        if (isAnimating || learnStep >= 3) return;
        const nextStep = learnStep + 1;
        setIsAnimating(true);
        setLearnStep(nextStep);
        const container = containerRef.current.getBoundingClientRect();

        if (nextStep === 2) {
            const s = elsRef.current['learn-val-50']?.getBoundingClientRect();
            const t1 = elsRef.current['learn-val-25']?.getBoundingClientRect();
            const t2 = elsRef.current['learn-val-2']?.getBoundingClientRect();
            if (s && t1 && t2) {
                setFlightAnim({
                    clone1: { text: '50', start: { x: s.left - container.left, y: s.top - container.top }, end: { x: t1.left - container.left, y: t1.top - container.top } },
                    clone2: { text: '50', start: { x: s.left - container.left, y: s.top - container.top }, end: { x: t2.left - container.left, y: t2.top - container.top } }
                });
            }
        } else if (nextStep === 3) {
            const s1 = elsRef.current['learn-val-25']?.getBoundingClientRect();
            const t1 = elsRef.current['learn-val-root-5']?.getBoundingClientRect();
            const s2 = elsRef.current['learn-val-2']?.getBoundingClientRect();
            const t2 = elsRef.current['learn-val-rem-2']?.getBoundingClientRect();
            if (s1 && t1 && s2 && t2) {
                setFlightAnim({
                    clone1: { text: '25', start: { x: s1.left - container.left, y: s1.top - container.top }, end: { x: t1.left - container.left, y: t1.top - container.top } },
                    clone2: { text: '2', start: { x: s2.left - container.left, y: s2.top - container.top }, end: { x: t2.left - container.left, y: t2.top - container.top } }
                });
            }
        }
        setTimeout(() => { setIsAnimating(false); setFlightAnim(null); }, 1000);
    };

    const handleCheck = async () => {
        const isStep0Correct = parseInt(inputA) === practicePair.square && parseInt(inputB) === practicePair.remainder;
        const isStep1Correct = parseInt(inputA) === practicePair.root && parseInt(inputB) === practicePair.remainder;

        if (step === 0 ? isStep0Correct : isStep1Correct) {
            if (step === 0) { setStep(1); setInputA(''); setInputB(''); }
            else { 
                setStep(2); 
                setIsCompleted(true);
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); 
                try {
                    await labProgressService.update('roots-simplification', 'completed', 100);
                } catch (err) { console.error(err); }
            }
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    return (
        <div className={`w-full h-full flex flex-col font-sans transition-all duration-500`} dir="rtl">
            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full px-4 overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                        <div className={`group relative p-4 md:p-6 rounded-[1.5rem] text-right transition-all border backdrop-blur-3xl overflow-hidden ${theme.card}`}>
                             <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl transition-transform group-hover:rotate-12"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>قانون التبسيط:</h3>
                             <div className={`p-8 md:p-5 rounded-3xl border-2 text-center transition-all bg-white/5 border-white/10 shadow-inner`}>
                                <div className={`text-sm md:text-base font-black font-mono tracking-tighter flex flex-wrap items-center justify-center gap-4`} dir="ltr">
                                    <span className="text-white">\u221an</span>
                                    <span className="text-white">=</span>
                                    <span className="text-emerald-400">\u221a(a\u00b2 \u00d7 b)</span>
                                    <span className="text-white">=</span>
                                    <span className="text-orange-400 italic drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]">a\u221ab</span>
                                </div>
                             </div>
                             <button onClick={() => { setPhase('learn'); setLearnStep(1); labProgressService.update('roots-simplification', 'learn').catch(console.error); }} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all border border-white/10 shadow-lg">مشاهدة الشرح</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                            <div className={`absolute inset-0 transition-transform duration-500 group-hover:scale-110 bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700`} />
                            <div className="relative p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Sigma size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">بدء التحدي</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-4xl" ref={containerRef}>
                        <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="space-y-6 relative z-10">
                                {flightAnim && (
                                    <div className="absolute inset-0 pointer-events-none z-[100]">
                                        <motion.div initial={{ x: flightAnim.clone1.start.x, y: flightAnim.clone1.start.y }} animate={{ x: flightAnim.clone1.end.x, y: flightAnim.clone1.end.y }} transition={{ duration: 1 }} className="absolute font-mono font-black text-base md:text-lg text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">{flightAnim.clone1.text}</motion.div>
                                        <motion.div initial={{ x: flightAnim.clone2.start.x, y: flightAnim.clone2.start.y }} animate={{ x: flightAnim.clone2.end.x, y: flightAnim.clone2.end.y }} transition={{ duration: 1 }} className="absolute font-mono font-black text-base md:text-lg text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.6)]">{flightAnim.clone2.text}</motion.div>
                                    </div>
                                )}
                                <div className={`p-8 md:p-5 rounded-[1.5rem] border-2 flex justify-center items-center bg-white/5 border-white/10 shadow-inner`}>
                                    <div className="flex items-center gap-3 text-xl md:text-9xl font-mono font-black" dir="ltr">
                                        <span className="text-rose-500 italic font-serif">\u221a</span> 
                                        <span ref={setRef('learn-val-50')} className={isAnimating && learnStep === 2 ? 'opacity-0' : 'text-white'}>50</span>
                                    </div>
                                </div>
                                <div className={`p-8 md:p-5 rounded-[1.5rem] border-2 flex justify-center items-center transition-all duration-700 ${learnStep >= 2 ? 'opacity-100 bg-emerald-500/5 border-emerald-500/20 shadow-inner' : 'opacity-0 scale-95'}`}>
                                    <div className="flex items-center gap-3 text-2xl md:text-[6rem] font-mono font-black" dir="ltr">
                                        <span className="text-rose-500 italic font-serif">\u221a (</span> 
                                        <span ref={setRef('learn-val-25')} className={isAnimating && (learnStep === 2 || learnStep === 3) ? 'opacity-0' : 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]'}>25</span> 
                                        <span className="text-white opacity-40">\u00d7</span> 
                                        <span ref={setRef('learn-val-2')} className={isAnimating && (learnStep === 2 || learnStep === 3) ? 'opacity-0' : 'text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.3)]'}>2</span> 
                                        <span className="text-rose-500 italic font-serif">)</span>
                                    </div>
                                </div>
                                <div className={`p-8 md:p-5 rounded-[1.5rem] border-2 flex justify-center items-center transition-all duration-700 ${learnStep >= 3 ? 'opacity-100 bg-white/5 border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.2)]' : 'opacity-0 scale-90'}`}>
                                    <div className="flex items-center gap-3 text-xl md:text-[9rem] font-mono font-black" dir="ltr">
                                        <span ref={setRef('learn-val-root-5')} className={isAnimating && learnStep === 3 ? 'opacity-0' : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]'}>5</span> 
                                        <span className="text-rose-500 italic font-serif">\u221a</span> 
                                        <span ref={setRef('learn-val-rem-2')} className={isAnimating && learnStep === 3 ? 'opacity-0' : 'text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.3)]'}>2</span>
                                    </div>
                                </div>
                             </div>
                        </div>
                        <div className="flex gap-4 mt-4 px-4">
                             <button onClick={learnStep < 3 ? handleNextLearnStep : generateProblem} disabled={isAnimating} className="flex-grow py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl font-black text-2xl shadow-xl transition-all active:scale-95">{learnStep < 3 ? 'الخطوة التالية' : 'ابدأ التحدي'}</button>
                             <button onClick={() => { setLearnStep(1); setFlightAnim(null); }} className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-slate-200 text-slate-500 shadow-lg'}`}><RotateCcw size={28} /></button>
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="flex flex-col items-center w-full max-w-5xl px-4">
                        <div className={`p-12 md:p-16 rounded-[1.5rem] border-2 backdrop-blur-3xl mb-3 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${theme.card}`}>
                             <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-pink-500/10 opacity-30" />
                             <span className="relative z-10 text-2xl md:text-[10rem] font-black text-white italic font-serif drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">\u221a{practicePair.n}</span>
                        </div>

                        {!isCompleted && (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-4xl">
                                <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 mb-4 backdrop-blur-3xl shadow-2xl ${theme.card}`}>
                                    <div className="flex flex-wrap items-center justify-center gap-3 text-2xl md:text-[6rem] font-black font-mono text-white" dir="ltr">
                                        {step === 0 ? (
                                            <>
                                                <span className="text-rose-500 italic font-serif">\u221a (</span>
                                                <input type="number" value={inputA} onChange={(e) => setInputA(e.target.value)} className={`w-36 md:w-60 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-emerald-500/30 text-emerald-400 focus:border-emerald-400 shadow-inner'}`} placeholder="a\u00b2" autoFocus />
                                                <span className="text-white opacity-40">\u00d7</span>
                                                <input type="number" value={inputB} onChange={(e) => setInputB(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-36 md:w-60 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-orange-500/30 text-orange-400 focus:border-orange-400 shadow-inner'}`} placeholder="b" />
                                                <span className="text-rose-500 italic font-serif">)</span>
                                            </>
                                        ) : (
                                            <>
                                                <input type="number" value={inputA} onChange={(e) => setInputA(e.target.value)} className={`w-36 md:w-60 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-white/20 text-white focus:border-white/50 shadow-inner'}`} placeholder="a" autoFocus />
                                                <span className="text-rose-500 italic font-serif drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">\u221a</span>
                                                <input type="number" value={inputB} onChange={(e) => setInputB(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-36 md:w-60 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-orange-500/30 text-orange-400 focus:border-orange-400 shadow-inner'}`} placeholder="b" />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button onClick={handleCheck} className="w-full py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4"><CheckCircle2 size={20} /> {step === 0 ? 'تأكيد التفكيك' : 'تأكيد التحرير'}</button>
                            </motion.div>
                        )}

                        {isCompleted && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-5xl">
                                <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 border-4 border-rose-500/40 rounded-[5rem] p-16 md:p-24 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
                                     <div className="relative z-10 text-2xl md:text-[12rem] font-mono font-black text-white flex flex-wrap items-center justify-center gap-5">
                                        <span className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] leading-none">{practicePair.root}</span> 
                                        <span className="text-rose-500 italic font-serif leading-none">\u221a</span> 
                                        <span className="text-orange-400 drop-shadow-[0_0_30px_rgba(251,146,60,0.4)] leading-none">{practicePair.remainder}</span>
                                    </div>
                                </div>
                                <button onClick={generateProblem} className="mt-12 w-full py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95">تحدي جديد</button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RootsSimplificationLab() {
    return (
        <LabShell 
            labId="roots-simplification" 
            title="تبسيط الجذور التربيعية" 
            icon={Target}
            accentColor="rose"
            badgeText="بروتوكول تحويل الجذور"
            badgeIcon={Target}
        >
            <RootsSimplificationContent />
        </LabShell>
    );
}
