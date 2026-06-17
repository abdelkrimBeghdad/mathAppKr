import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, BookOpen, Zap as ZapIcon, Sigma, Cpu, Binary, Target, Microscope } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function RootsDivisionContent() {
    const { theme, isDarkMode, currentAccent } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [step, setStep] = useState(0); // 0: input quotient, 1: input root, 2: reward
    const [learnStep, setLearnStep] = useState(1);
    const [practicePair, setPracticePair] = useState({ a: 50, b: 2, quot: 25, result: 5 });
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [flightAnim, setFlightAnim] = useState(null);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    const containerRef = useRef(null);
    const elsRef = useRef({});
    const setRef = (id) => (el) => { if (el) elsRef.current[id] = el; };

    useEffect(() => {
        labProgressService.getOne('roots-division')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const generateProblem = () => {
        const options = [
            { a: 50, b: 2, quot: 25, result: 5 },
            { a: 72, b: 2, quot: 36, result: 6 },
            { a: 100, b: 4, quot: 25, result: 5 },
            { a: 48, b: 3, quot: 16, result: 4 },
            { a: 80, b: 5, quot: 16, result: 4 },
            { a: 162, b: 2, quot: 81, result: 9 }
        ];
        let newProb = options[Math.floor(Math.random() * options.length)];
        setPracticePair(newProb);
        setPhase('practice');
        setStep(0);
        setInputVal('');
        setError(false);
        setIsCompleted(false);

        labProgressService.update('roots-division', 'practice').catch(console.error);
    };

    const handleNextLearnStep = () => {
        if (isAnimating || learnStep >= 3) return;
        const nextStep = learnStep + 1;
        setIsAnimating(true);
        setLearnStep(nextStep);
        const container = containerRef.current.getBoundingClientRect();

        if (nextStep === 2) {
            const s1 = elsRef.current['learn-a']?.getBoundingClientRect();
            const s2 = elsRef.current['learn-b']?.getBoundingClientRect();
            const t = elsRef.current['learn-quot']?.getBoundingClientRect();
            if (s1 && s2 && t) {
                setFlightAnim({
                    clone1: { text: '50', start: { x: s1.left - container.left, y: s1.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } },
                    clone2: { text: '2', start: { x: s2.left - container.left, y: s2.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } }
                });
            }
        } else if (nextStep === 3) {
            const s = elsRef.current['learn-quot']?.getBoundingClientRect();
            const t = elsRef.current['learn-res']?.getBoundingClientRect();
            if (s && t) {
                setFlightAnim({
                    clone1: { text: '25', start: { x: s.left - container.left, y: s.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } }
                });
            }
        }
        setTimeout(() => { setIsAnimating(false); setFlightAnim(null); }, 1000);
    };

    const handleCheck = async () => {
        const isCorrect = step === 0 ? parseInt(inputVal) === practicePair.quot : parseInt(inputVal) === practicePair.result;

        if (isCorrect) {
            if (step === 0) { setStep(1); setInputVal(''); }
            else { 
                setStep(2); 
                setIsCompleted(true);
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); 
                try {
                    await labProgressService.update('roots-division', 'completed', 100);
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
            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full px-4">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                        <div className={`group relative p-4 md:p-6 rounded-[1.5rem] text-right transition-all border backdrop-blur-3xl overflow-hidden ${theme.card}`}>
                             <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl transition-transform group-hover:rotate-12"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>قانون التوحيد:</h3>
                             <div className={`p-8 md:p-5 rounded-3xl border-2 text-center transition-all bg-white/5 border-white/10 shadow-inner`}>
                                <div className={`text-base md:text-lg font-black font-mono tracking-tighter flex items-center justify-center gap-4`} dir="ltr">
                                    <span className="text-cyan-400">\u221aa</span>
                                    <span className="text-white">/</span>
                                    <span className="text-orange-400">\u221ab</span>
                                    <span className="text-white">=</span>
                                    <span className="text-emerald-400 italic drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">\u221a(a / b)</span>
                                </div>
                             </div>
                             <button onClick={() => { setPhase('learn'); setLearnStep(1); labProgressService.update('roots-division', 'learn').catch(console.error); }} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all border border-white/10 shadow-lg">مشاهدة الشرح</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                            <div className={`absolute inset-0 transition-transform duration-500 group-hover:scale-110 bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700`} />
                            <div className="relative p-12 md:p-16 flex flex-col items-center justify-center text-center gap-3 text-white">
                                <ZapIcon size={20} className="md:w-24 md:h-24 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">بدء التحدي</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-5xl" ref={containerRef}>
                        <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                            <div className="space-y-8 relative z-10">
                                {flightAnim && (
                                    <div className="absolute inset-0 pointer-events-none z-[100]">
                                        <motion.div initial={{ x: flightAnim.clone1.start.x, y: flightAnim.clone1.start.y }} animate={{ x: flightAnim.clone1.end.x, y: flightAnim.clone1.end.y }} transition={{ duration: 1 }} className="absolute font-mono font-black text-base md:text-lg text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">{flightAnim.clone1.text}</motion.div>
                                        {flightAnim.clone2 && <motion.div initial={{ x: flightAnim.clone2.start.x, y: flightAnim.clone2.start.y }} animate={{ x: flightAnim.clone2.end.x, y: flightAnim.clone2.end.y }} transition={{ duration: 1 }} className="absolute font-mono font-black text-base md:text-lg text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.6)]">{flightAnim.clone2.text}</motion.div>}
                                    </div>
                                )}
                                <div className="p-5 rounded-[1.5rem] border-2 bg-white/5 border-white/10 flex flex-col items-center justify-center text-xl md:text-9xl font-mono font-black shadow-inner" dir="ltr">
                                    <div className="border-b-4 border-white/20 px-12 pb-6 flex items-center gap-3">
                                        <span className="text-rose-500 italic font-serif">\u221a</span>
                                        <span ref={setRef('learn-a')} className={isAnimating && learnStep === 2 ? 'opacity-0' : 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]'}>50</span>
                                    </div>
                                    <div className="px-12 pt-6 flex items-center gap-3">
                                        <span className="text-rose-500 italic font-serif">\u221a</span>
                                        <span ref={setRef('learn-b')} className={isAnimating && learnStep === 2 ? 'opacity-0' : 'text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.3)]'}>2</span>
                                    </div>
                                </div>
                                <div className={`p-5 rounded-[1.5rem] border-2 flex justify-center items-center transition-all duration-700 ${learnStep >= 2 ? 'opacity-100 bg-emerald-500/5 border-emerald-500/20 shadow-inner' : 'opacity-0 scale-95'}`}>
                                    <div className="flex items-center gap-4 text-2xl md:text-xl font-mono font-black" dir="ltr">
                                        <span className="text-rose-500 italic font-serif">\u221a (</span> 
                                        <span ref={setRef('learn-quot')} className={isAnimating && (learnStep === 2 || learnStep === 3) ? 'opacity-0' : 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]'}>25</span> 
                                        <span className="text-rose-500 italic font-serif">)</span>
                                    </div>
                                </div>
                                <div className={`p-5 rounded-[1.5rem] border-2 flex justify-center items-center transition-all duration-700 ${learnStep >= 3 ? 'opacity-100 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.2)]' : 'opacity-0 scale-90'}`}>
                                    <div className="flex items-center gap-5 text-8xl md:text-[12rem] font-mono font-black text-white" dir="ltr">
                                        <span ref={setRef('learn-res')} className={isAnimating && learnStep === 3 ? 'opacity-0' : 'text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]'}>5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-3 px-6">
                             <button onClick={learnStep < 3 ? handleNextLearnStep : generateProblem} disabled={isAnimating} className="flex-grow py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl font-black text-2xl shadow-xl transition-all active:scale-95">{learnStep < 3 ? 'الخطوة التالية' : 'ابدأ التحدي'}</button>
                             <button onClick={() => { setLearnStep(1); setFlightAnim(null); }} className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-slate-200 text-slate-500 shadow-lg'}`}><RotateCcw size={28} /></button>
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="flex flex-col items-center w-full max-w-6xl px-4">
                        <div className={`p-12 md:p-16 rounded-[1.5rem] border-2 backdrop-blur-3xl mb-3 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${theme.card}`}>
                             <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-pink-500/10 opacity-30" />
                             <div className="relative z-10 flex flex-col items-center leading-none text-2xl md:text-xl font-black" dir="ltr">
                                <div className="border-b-4 border-white/20 pb-4 px-10 flex items-center gap-3">
                                    <span className="text-rose-500 font-serif italic">\u221a</span>
                                    <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">{practicePair.a}</span>
                                </div>
                                <div className="pt-4 px-10 flex items-center gap-3">
                                    <span className="text-rose-500 font-serif italic">\u221a</span>
                                    <span className="text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.3)]">{practicePair.b}</span>
                                </div>
                            </div>
                        </div>

                        {!isCompleted && (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-4xl">
                                <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 mb-4 backdrop-blur-3xl shadow-2xl ${theme.card}`}>
                                    <div className="flex flex-wrap items-center justify-center gap-3 text-2xl md:text-[6rem] font-black font-mono text-white" dir="ltr">
                                        {step === 0 ? (
                                            <>
                                                <span className="text-rose-500 italic font-serif">\u221a (</span>
                                                <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-36 md:w-64 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-emerald-500/30 text-emerald-400 focus:border-emerald-500 shadow-inner'}`} placeholder="?" autoFocus />
                                                <span className="text-rose-500 italic font-serif">)</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-emerald-400 italic opacity-60 leading-none">\u221a{practicePair.quot} =</span>
                                                <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-36 md:w-64 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-cyan-500/30 text-cyan-400 focus:border-cyan-400 shadow-inner'}`} placeholder="?" autoFocus />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button onClick={handleCheck} className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4"><CheckCircle2 size={20} /> {step === 0 ? 'تأكيد التوحيد' : 'استخراج الناتج'}</button>
                            </motion.div>
                        )}

                        {isCompleted && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-5xl">
                                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-4 border-emerald-500/40 rounded-[5rem] p-16 md:p-24 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
                                     <div className="relative z-10 text-8xl md:text-[14rem] font-mono font-black text-white flex items-center justify-center">
                                        <span className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] leading-none">{practicePair.result}</span>
                                    </div>
                                </div>
                                <button onClick={generateProblem} className="mt-3 w-full py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95">تحدي قسمة جديد</button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RootsDivisionLab() {
    return (
        <LabShell 
            labId="roots-division" 
            title="قسمة الجذور التربيعية" 
            icon={Target}
            accentColor="rose"
            badgeText="بروتوكول تجزئة الجذور"
            badgeIcon={Target}
        >
            <RootsDivisionContent />
        </LabShell>
    );
}
