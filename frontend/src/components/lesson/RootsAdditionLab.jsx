import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, BookOpen, Plus, Zap as ZapIcon, Sigma, Cpu, Binary, Microscope } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function RootsAdditionContent() {
    const { theme, isDarkMode, currentAccent } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [step, setStep] = useState(0); // 0: input, 1: reward
    const [learnStep, setLearnStep] = useState(1);
    const [practicePair, setPracticePair] = useState({ a: 3, b: 5, x: 7, sum: 8 });
    const [inputA, setInputA] = useState('');
    const [error, setError] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [flightAnim, setFlightAnim] = useState(null);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    const containerRef = useRef(null);
    const elsRef = useRef({});
    const setRef = (id) => (el) => { if (el) elsRef.current[id] = el; };

    useEffect(() => {
        labProgressService.getOne('roots-addition')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'بروتوكول توحيد المعاملات',
            detail: 'عند جمع جذور لها نفس القيمة التحتية، نقوم ببساطة بجمع المعاملات (الأرقام الخارجية) مع الحفاظ على الجذر كما هو.',
            math: 'a\u221ax + b\u221ax = (a + b)\u221ax',
            icon: <Microscope size={20} />
        },
        {
            title: 'خوارزمية الدمج التراكمي',
            detail: 'تخيل أن الجذور هي وحدات قياس (مثل التفاح)، فنحن نجمع الكميات الخارجية فقط ونضعها بجانب الوحدة المشتركة.',
            math: '3\u221a7 + 5\u221a7 = 8\u221a7',
            icon: <Plus size={20} />
        }
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('roots', difficultyLevel);
        const maxCoeff = params.maxCoeff || 15;
        
        const a = Math.floor(Math.random() * maxCoeff) + 1;
        const b = Math.floor(Math.random() * maxCoeff) + 1;
        const x = [2, 3, 5, 7, 10, 11][Math.floor(Math.random() * 6)];
        
        setPracticePair({ a, b, x, sum: a + b });
        setPhase('practice');
        setStep(0);
        setInputA('');
        setError(false);
        setIsCompleted(false);

        labProgressService.update('roots-addition', 'practice').catch(console.error);
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
            const t = elsRef.current['learn-sum-calc']?.getBoundingClientRect();
            if (s1 && s2 && t) {
                setFlightAnim({
                    clone1: { text: '3', start: { x: s1.left - container.left, y: s1.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } },
                    clone2: { text: '5', start: { x: s2.left - container.left, y: s2.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } }
                });
            }
        } else if (nextStep === 3) {
            const s = elsRef.current['learn-sum-calc']?.getBoundingClientRect();
            const t = elsRef.current['learn-sum-final']?.getBoundingClientRect();
            if (s && t) {
                setFlightAnim({
                    clone1: { text: '8', start: { x: s.left - container.left, y: s.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } }
                });
            }
        }
        setTimeout(() => { setIsAnimating(false); setFlightAnim(null); }, 1000);
    };

    const handleCheck = async () => {
        if (parseInt(inputA) === practicePair.sum) {
            setStep(2);
            setIsCompleted(true);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                await labProgressService.update('roots-addition', 'completed', 100);
            } catch (err) { console.error(err); }
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
                             <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl transition-transform group-hover:rotate-12"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>قانون الجمع:</h3>
                             <div className={`p-8 md:p-5 rounded-3xl border-2 text-center transition-all bg-white/5 border-white/10 shadow-inner`}>
                                <div className={`text-xl md:text-2xl font-black font-mono tracking-tighter flex items-center justify-center gap-4`} dir="ltr">
                                    <span className="text-cyan-400">a\u221ax</span>
                                    <span className="text-white">+</span>
                                    <span className="text-orange-400">b\u221ax</span>
                                    <span className="text-white">=</span>
                                    <span className="text-rose-400 italic drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">(a + b)\u221ax</span>
                                </div>
                             </div>
                             <button onClick={() => { setPhase('learn'); setLearnStep(1); labProgressService.update('roots-addition', 'learn').catch(console.error); }} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all border border-white/10 shadow-lg">مشاهدة الشرح</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-cyan-600 to-indigo-700 transition-transform duration-500 group-hover:scale-110`} />
                            <div className="relative p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Plus size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">بدء الحساب</span>
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
                                <div className="p-8 rounded-[1.5rem] border-2 bg-white/5 border-white/10 flex items-center justify-center gap-4 text-xl md:text-9xl font-mono font-black shadow-inner" dir="ltr">
                                    <span ref={setRef('learn-a')} className={isAnimating && learnStep === 2 ? 'opacity-0' : 'text-cyan-400'}>3</span> 
                                    <span className="text-white italic font-serif">\u221a7</span> 
                                    <span className="text-white opacity-40">+</span> 
                                    <span ref={setRef('learn-b')} className={isAnimating && learnStep === 2 ? 'opacity-0' : 'text-orange-400'}>5</span> 
                                    <span className="text-white italic font-serif">\u221a7</span>
                                </div>
                                <div className={`p-5 rounded-[1.5rem] border-2 flex justify-center items-center transition-all duration-700 ${learnStep >= 2 ? 'opacity-100 bg-emerald-500/5 border-emerald-500/20 shadow-inner' : 'opacity-0 scale-95'}`}>
                                    <div className="flex items-center gap-3 text-2xl md:text-xl font-mono font-black text-white" dir="ltr">
                                        <span className="text-white opacity-40">(</span> 
                                        <span ref={setRef('learn-sum-calc')} className={isAnimating && (learnStep === 2 || learnStep === 3) ? 'opacity-0' : 'text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]'}>3+5</span> 
                                        <span className="text-white opacity-40">)</span> 
                                        <span className="text-white italic font-serif drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">\u221a7</span>
                                    </div>
                                </div>
                                <div className={`p-5 rounded-[1.5rem] border-2 flex justify-center items-center transition-all duration-700 ${learnStep >= 3 ? 'opacity-100 bg-emerald-500/10 border-emerald-500/40 shadow-lg' : 'opacity-0 scale-90'}`}>
                                    <div className="flex items-center gap-5 text-8xl md:text-[12rem] font-mono font-black text-white" dir="ltr">
                                        <span ref={setRef('learn-sum-final')} className={isAnimating && learnStep === 3 ? 'opacity-0' : 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]'}>8</span> 
                                        <span className="text-rose-500 italic font-serif drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]">\u221a7</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-3 px-6">
                             <button onClick={learnStep < 3 ? handleNextLearnStep : generateProblem} disabled={isAnimating} className="flex-grow py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-2xl font-black text-2xl shadow-xl transition-all active:scale-95">{learnStep < 3 ? 'الخطوة التالية' : 'ابدأ التحدي'}</button>
                             <button onClick={() => { setLearnStep(1); setFlightAnim(null); }} className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-slate-200 text-slate-500 shadow-lg'}`}><RotateCcw size={28} /></button>
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="flex flex-col items-center w-full max-w-6xl px-4">
                        <div className={`p-12 md:p-16 rounded-[1.5rem] border backdrop-blur-3xl mb-3 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${isCompleted ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 opacity-30" />
                            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 text-2xl md:text-xl font-black" dir="ltr">
                                <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">{practicePair.a}\u221a{practicePair.x}</span>
                                <span className="text-white opacity-40 font-serif italic">+</span>
                                <span className="text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.3)]">{practicePair.b}\u221a{practicePair.x}</span>
                            </div>
                        </div>

                        {!isCompleted && (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-4xl">
                                <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 mb-4 backdrop-blur-3xl shadow-2xl ${theme.card}`}>
                                    <div className="flex items-center justify-center gap-3 text-2xl md:text-xl font-black font-mono text-white" dir="ltr">
                                        <span className="text-white opacity-40 italic">=</span>
                                        <input type="number" value={inputA} onChange={(e) => setInputA(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-36 md:w-64 bg-white/5 border-4 rounded-[1.5rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-emerald-500/30 text-emerald-400 focus:border-emerald-500 shadow-inner'}`} placeholder="?" autoFocus />
                                        <span className="text-rose-500 italic font-serif drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">\u221a{practicePair.x}</span>
                                    </div>
                                </div>
                                <button onClick={handleCheck} className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"><CheckCircle2 size={20} /> تحقق من النتيجة</button>
                            </motion.div>
                        )}

                        {isCompleted && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-5xl">
                                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-4 border-emerald-500/40 rounded-[5rem] p-16 md:p-24 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
                                     <div className="relative z-10 text-8xl md:text-[14rem] font-mono font-black text-white flex items-center justify-center gap-14">
                                        <span className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] leading-none">{practicePair.sum}</span> 
                                        <span className="text-rose-500 italic font-serif drop-shadow-[0_0_30px_rgba(244,63,94,0.4)] leading-none">\u221a{practicePair.x}</span>
                                    </div>
                                </div>
                                <button onClick={generateProblem} className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-[1.5rem] font-black text-2xl shadow-xl transition-all active:scale-95">تحدي جديد</button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RootsAdditionLab() {
    return (
        <LabShell 
            labId="roots-addition" 
            title="جمع الجذور التربيعية" 
            icon={Plus}
            accentColor="indigo"
            badgeText="بروتوكول توحيد الجذور"
            badgeIcon={Plus}
        >
            <RootsAdditionContent />
        </LabShell>
    );
}
