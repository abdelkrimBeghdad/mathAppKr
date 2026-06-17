import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, CheckCircle2, HelpCircle, X, ArrowRight, BookOpen, Target, Sigma, Rocket, Navigation, Map } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function SystemsGraphContent({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0); 
    // 0: y eq1, 1: points eq1, 2: y eq2, 3: points eq2, 4: read intersection, 5: reward
    
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        labProgressService.getOne('sys-graph')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    // Problem: x + y = 3 and x - y = 1
    const problem = {
        m1: -1, b1: 3, // y = -x + 3
        pt1_x1: 0, pt1_y1: 3,
        pt1_x2: 3, pt1_y2: 0,
        m2: 1, b2: -1, // y = x - 1
        pt2_x1: 0, pt2_y1: -1,
        pt2_x2: 3, pt2_y2: 2,
        ans_x: 2, ans_y: 1
    };

    const learnPages = [
        {
            title: 'مبدأ الرسم البياني',
            detail: 'كل معادلة في الجملة تمثل خطاً مستقيماً. الحل ببساطة هو النقطة الوحيدة التي يتقاطع فيها الفضاءان (المستقيمان).',
            visual: (
                <div className="flex flex-col items-center gap-4">
                    <svg viewBox="-6 -6 12 12" className="w-40 h-40 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        <g transform="scale(1, -1)">
                            <line x1="-6" y1="9" x2="6" y2="-3" stroke="#f59e0b" strokeWidth="0.5" strokeLinecap="round" />
                            <line x1="-6" y1="-7" x2="6" y2="5" stroke="#6366f1" strokeWidth="0.5" strokeLinecap="round" />
                            <circle cx="2" cy="1" r="0.8" fill="#22d3ee" className="animate-pulse shadow-glow-cyan" />
                        </g>
                    </svg>
                </div>
            )
        },
        {
            title: 'خطوة 1: الصياغة الدالية',
            detail: 'لا يمكننا رسم مستقيم بسهولة من الشكل x + y = 3. يجب عزل y لتصبح المعادلة دالة تآلفية: y = ax + b.',
            visual: (
                <div className="flex flex-col gap-3 text-xl font-mono text-center" dir="ltr">
                    <div className="text-white/40">x + y = 3</div>
                    <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-orange-400 font-black drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                        y = -x + 3
                    </motion.div>
                </div>
            )
        },
        {
            title: 'خطوة 2: النقطتان السحريتان',
            detail: 'لرسم أي مستقيم، نحتاج لنقطتين فقط. نعطي قيمة اختيارية لـ x ونحسب y. أسهل نقطة دائماً هي x = 0.',
            visual: (
                <div className="flex flex-col gap-4 text-base md:text-lg font-mono bg-white/5 p-8 rounded-[1rem] border-2 border-white/10 shadow-inner" dir="ltr">
                    <div className="text-white">x = <span className="text-emerald-400">0</span> ➔ y = <span className="text-orange-400">3</span></div>
                    <div className="text-white">x = <span className="text-emerald-400">3</span> ➔ y = <span className="text-orange-400">0</span></div>
                </div>
            )
        },
        {
            title: 'خطوة 3: المسح الإحداثي',
            detail: 'نرسم المستقيم الأول، ثم الثاني بنفس الطريقة. وأخيراً، نقرأ إحداثيات (x, y) لنقطة التقاطع.',
            visual: (
                <div className="flex flex-col items-center gap-3 text-xl font-mono text-center" dir="ltr">
                    <div className="text-white/40 font-black italic tracking-widest uppercase text-sm">Intersection Point:</div>
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }} className="text-cyan-400 font-black border-4 border-cyan-400/50 px-4 py-2 rounded-[1.5rem] shadow-[0_0_30px_rgba(34,211,238,0.3)] bg-cyan-400/5">
                        (2, 1)
                    </motion.div>
                </div>
            )
        }
    ];

    const handleCheckStep = async () => {
        let isCorrect = false;
        
        if (step === 0) {
            if (parseInt(input1) === problem.m1 && parseInt(input2) === problem.b1) isCorrect = true;
        } else if (step === 1) {
            if (parseInt(input1) === problem.pt1_y1 && parseInt(input2) === problem.pt1_y2) isCorrect = true;
        } else if (step === 2) {
            if (parseInt(input1) === problem.m2 && parseInt(input2) === problem.b2) isCorrect = true;
        } else if (step === 3) {
            if (parseInt(input1) === problem.pt2_y1 && parseInt(input2) === problem.pt2_y2) isCorrect = true;
        } else if (step === 4) {
            if (parseInt(input1) === problem.ans_x && parseInt(input2) === problem.ans_y) isCorrect = true;
        }

        if (isCorrect) {
            setError(false);
            setInput1(''); setInput2('');
            setShowHint(false);
            if (step < 4) {
                setStep(s => s + 1);
                confetti({ particleCount: 30, spread: 40, origin: { x: 0.8, y: 0.6 } });
            } else {
                setStep(5);
                setIsCompleted(true);
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                try {
                    await labProgressService.update('sys-graph', 'completed', 100);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    const hints = [
        "انقل x إلى الطرف الآخر وغير إشارته ليصبح -x.",
        "عوض x بصفر في المعادلة (y = -x + 3) لتجد القيمة الأولى. ثم عوض بـ 3 لتجد القيمة الثانية.",
        "في المعادلة x - y = 1، انقل -y للطرف الآخر لتصبح موجبة، وانقل 1 للطرف الآخر ليصبح سالباً.",
        "عوض x بصفر في المعادلة (y = x - 1) لتجد القيمة الأولى. ثم عوض بـ 3 لتجد القيمة الثانية.",
        "انظر إلى الرسم البياني حيث يتقاطع المستقيمان البرتقالي والأزرق. اقرأ قيمة الإحداثي السيني (x) الصادي (y)."
    ];

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('الرادار الهندسي');
        } else if (phase === 'learn') {
            setLabTitle(learnPages[learnStep].title);
        } else if (isCompleted) {
            setLabTitle('مزامنة هندسية ناجحة!');
        } else {
            setLabTitle(`خطوة المسح ${step + 1}/5`);
        }
    }, [phase, learnStep, isCompleted, step, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 w-full overflow-hidden px-4" dir="rtl">
            {phase === 'intro' && (
                <div className="flex flex-col items-center max-w-4xl text-center px-4">
                    <div className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-3xl w-full mb-4 shadow-2xl transition-all ${theme.card}`}>
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white mb-4 mx-auto shadow-xl">
                            <Crosshair size={20} />
                        </div>
                        <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>بروتوكول الرادار</h3>
                        <p className={`${theme.textSub} text-base md:text-lg font-medium mb-3 leading-relaxed italic`}>تعلم كيف تحول المعادلات الجبرية إلى خطوط مستقيمة على الشبكة لتجد الحل بالعين المجردة.</p>
                        <button onClick={() => setPhase('learn')} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-[1rem] font-black transition-all shadow-xl text-2xl">فتح الدليل التفاعلي</button>
                    </div>
                    <button onClick={() => setPhase('practice')} className="text-white/40 font-black text-xl hover:text-white transition-all italic tracking-widest uppercase">تخطي الشرح والبدء بالمسح</button>
                </div>
            )}

            {phase === 'learn' && (
                <div className="w-full max-w-4xl px-2">
                    <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-6 rounded-[1.5rem] border-2 backdrop-blur-3xl relative overflow-hidden text-center shadow-2xl ${theme.card}`}>

                         <p className={`text-base md:text-lg ${theme.textSub} mb-12 max-w-2xl mx-auto font-medium italic leading-relaxed`}>{learnPages[learnStep].detail}</p>
                         <div className={`p-5 rounded-[1.5rem] bg-white/5 border-2 border-white/10 mx-auto max-w-xl min-h-[220px] flex items-center justify-center shadow-inner`}>
                             {learnPages[learnStep].visual}
                         </div>
                    </motion.div>
                    <div className="flex justify-between items-center mt-3 px-8">
                         <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-2xl font-black transition-all ${isDarkMode ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-slate-100 text-slate-600 shadow-lg'}`}>السابق</button>
                         {learnStep < learnPages.length - 1 ? (
                             <button onClick={() => setLearnStep(l => l + 1)} className="px-12 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-2xl font-black shadow-xl text-2xl flex items-center gap-3">التالي <ArrowRight size={20} /></button>
                         ) : (
                             <button onClick={() => setPhase('practice')} className="px-12 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-black shadow-xl text-2xl flex items-center gap-3">بدء التدريب <Rocket size={20} /></button>
                         )}
                    </div>
                </div>
            )}

            {phase === 'practice' && step < 5 && (
                <div className="flex flex-col lg:flex-row items-center justify-center gap-5 w-full max-w-7xl px-4">
                    
                    {/* Live Graph Area */}
                    <div className={`w-full lg:w-1/2 p-8 md:p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl flex flex-col items-center justify-center relative overflow-hidden ${theme.card}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-orange-500/10 opacity-30" />
                        <div className="relative w-full aspect-square max-w-[400px] bg-slate-950/80 rounded-[1.5rem] border-4 border-white/10 overflow-hidden shadow-2xl">
                             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '10% 10%' }} />
                             <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20" />
                             <div className="absolute top-0 left-1/2 w-1 h-full bg-white/20" />
                             
                             <svg className="absolute inset-0 w-full h-full p-4 overflow-visible" viewBox="-5.5 -5.5 11 11">
                                 <g transform="scale(1, -1)">
                                     {step > 1 && (
                                        <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5 }} x1="-6" y1="9" x2="6" y2="-3" stroke="#f59e0b" strokeWidth="0.2" strokeLinecap="round" className="drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                     )}
                                     {step > 3 && (
                                        <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5 }} x1="-4.5" y1="-5.5" x2="6.5" y2="5.5" stroke="#6366f1" strokeWidth="0.2" strokeLinecap="round" className="drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                     )}
                                     {step > 3 && (
                                        <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 1 }} cx="2" cy="1" r="0.5" fill="#22d3ee" className="animate-pulse shadow-glow-cyan drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
                                     )}
                                 </g>
                             </svg>
                         </div>
                         <div className="mt-4 font-mono text-lg w-full flex flex-col gap-4 px-8 relative z-10">
                             <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-orange-500/20">
                                 <div className="w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                 <span className="text-white font-black italic">Eq (1): x + y = 3</span>
                             </div>
                             <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-indigo-500/20">
                                 <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                 <span className="text-white font-black italic">Eq (2): x - y = 1</span>
                             </div>
                         </div>
                    </div>

                    {/* Interactive Steps */}
                    <div className={`w-full lg:w-1/2 p-8 md:p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl flex flex-col items-center gap-4 ${theme.card}`}>
                        <div className="w-full space-y-4">
                            <div className="px-6 py-2 rounded-full bg-cyan-500/20 text-cyan-400 font-black text-sm border border-cyan-500/30 italic uppercase tracking-[0.3em] inline-block mb-4">Step {step + 1} of 5</div>
                            <h4 className={`text-base md:text-lg font-black tracking-tighter ${theme.textMain} leading-tight`}>
                                {step === 0 && "صيغة y للدالة الأولى:"}
                                {step === 1 && "جدول قيم المستقيم البرتقالي:"}
                                {step === 2 && "صيغة y للدالة الثانية:"}
                                {step === 3 && "جدول قيم المستقيم الأزرق:"}
                                {step === 4 && "إحداثيات نقطة التقاطع:"}
                            </h4>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center gap-4 font-mono text-base md:text-lg mt-4 w-full" dir="ltr">
                            {step === 0 && (
                                <div className="flex items-center gap-4">
                                    <span className="text-orange-400 font-black italic drop-shadow-glow">y = </span>
                                    <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className={`w-24 md:w-32 bg-white/5 border-4 rounded-[1.5rem] text-center py-2 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-orange-500/30 text-orange-400 focus:border-orange-500 shadow-inner'}`} placeholder="m" autoFocus />
                                    <span className="text-white font-serif italic">x + </span>
                                    <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-24 md:w-32 bg-white/5 border-4 rounded-[1.5rem] text-center py-2 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-orange-500/30 text-orange-400 focus:border-orange-500 shadow-inner'}`} placeholder="b" />
                                </div>
                            )}
                            {step === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-center">
                                    <div className="bg-white/5 p-6 rounded-[1rem] border-2 border-orange-500/20 text-orange-400 shadow-inner italic">x = 0 ➔ y = <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className={`w-20 bg-black/40 border-2 rounded-xl text-center mt-2 outline-none transition-all ${error ? 'border-rose-500 text-rose-400' : 'border-orange-500/50 text-white'}`} autoFocus /></div>
                                    <div className="bg-white/5 p-6 rounded-[1rem] border-2 border-orange-500/20 text-orange-400 shadow-inner italic">x = 3 ➔ y = <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-20 bg-black/40 border-2 rounded-xl text-center mt-2 outline-none transition-all ${error ? 'border-rose-500 text-rose-400' : 'border-orange-500/50 text-white'}`} /></div>
                                </div>
                            )}
                            {step === 2 && (
                                <div className="flex items-center gap-4">
                                    <span className="text-indigo-400 font-black italic drop-shadow-glow">y = </span>
                                    <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className={`w-24 md:w-32 bg-white/5 border-4 rounded-[1.5rem] text-center py-2 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-indigo-500/30 text-indigo-400 focus:border-indigo-500 shadow-inner'}`} placeholder="m" autoFocus />
                                    <span className="text-white font-serif italic">x + </span>
                                    <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-24 md:w-32 bg-white/5 border-4 rounded-[1.5rem] text-center py-2 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-indigo-500/30 text-indigo-400 focus:border-indigo-500 shadow-inner'}`} placeholder="b" />
                                </div>
                            )}
                            {step === 3 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-center">
                                    <div className="bg-white/5 p-6 rounded-[1rem] border-2 border-indigo-500/20 text-indigo-400 shadow-inner italic">x = 0 ➔ y = <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className={`w-20 bg-black/40 border-2 rounded-xl text-center mt-2 outline-none transition-all ${error ? 'border-rose-500 text-rose-400' : 'border-indigo-500/50 text-white'}`} autoFocus /></div>
                                    <div className="bg-white/5 p-6 rounded-[1rem] border-2 border-indigo-500/20 text-indigo-400 shadow-inner italic">x = 3 ➔ y = <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-20 bg-black/40 border-2 rounded-xl text-center mt-2 outline-none transition-all ${error ? 'border-rose-500 text-rose-400' : 'border-indigo-500/50 text-white'}`} /></div>
                                </div>
                            )}
                            {step === 4 && (
                                <div className="flex items-center gap-3 text-xl md:text-2xl">
                                    <span className="text-cyan-400 font-black italic drop-shadow-glow">(</span>
                                    <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className={`w-28 md:w-40 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-cyan-500/30 text-cyan-400 focus:border-cyan-500 shadow-inner'}`} placeholder="x" autoFocus />
                                    <span className="text-white font-black italic">,</span>
                                    <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-28 md:w-40 bg-white/5 border-4 rounded-[1rem] text-center py-3 outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-cyan-500/30 text-cyan-400 focus:border-cyan-500 shadow-inner'}`} placeholder="y" />
                                    <span className="text-cyan-400 font-black italic drop-shadow-glow">)</span>
                                </div>
                            )}
                        </div>

                        <div className="w-full flex gap-4 mt-4">
                            <button onClick={() => setShowHint(!showHint)} className="px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-[1.5rem] border-2 border-amber-500/30 transition-all flex items-center justify-center shadow-lg active:scale-95">
                                <HelpCircle size={40} />
                            </button>
                            <button onClick={handleCheckStep} className="flex-grow py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-[1rem] font-black text-2xl flex items-center justify-center gap-4 shadow-xl active:scale-95">
                                <CheckCircle2 size={20} /> تأكيد الخطوة
                            </button>
                        </div>
                        
                        <AnimatePresence>
                            {showHint && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-full p-8 bg-amber-500/5 border-2 border-amber-500/20 rounded-[1.5rem] text-center shadow-inner italic">
                                    <p className="text-amber-400 text-xl font-black leading-relaxed italic">{hints[step]}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {step === 5 && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-2xl px-4">
                    <div className="p-16 rounded-[5rem] border-4 border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-3xl mb-12 shadow-2xl relative overflow-hidden">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                         <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-4 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                         <h3 className="text-xl md:text-2xl font-black text-white mb-3 tracking-tighter italic">مزامنة هندسية ناجحة!</h3>
                         <p className="text-base md:text-lg text-emerald-400 font-black opacity-80 italic">لقد أثبتّ دقة عالية في ربط الجبر بالهندسة وفك شيفرة الأنظمة.</p>
                    </div>
                    <button onClick={() => { setPhase('intro'); setStep(0); setInput1(''); setInput2(''); setIsCompleted(false); }} className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl transition-all active:scale-95">إعادة معايرة الرادار</button>
                </motion.div>
            )}
        </div>
    );
}

export default function SystemsGraphLab() {
    const [labTitle, setLabTitle] = useState('الرادار الهندسي');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            labId="sys-graph" 
            accentColor="cyan"
            badgeText="رادار المسح"
            badgeIcon={Crosshair}
            title={labTitle}
            phase={labPhase}
        >
            <SystemsGraphContent setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
