import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, CheckCircle2, Calculator, BookOpen, Pencil, ArrowRight, Play, RefreshCw, Zap as ZapIcon, Sigma, Cpu, Binary, Target, Coins, Send, Rocket, ShieldCheck, Microscope, BrainCircuit, Star, Zap, Crosshair, ArrowLeftRight, Layers, ShieldAlert, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function InequalitiesGraphLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [practicePair, setPracticePair] = useState({ q: 'x > 3', boundary: 3, dir: 'right', inc: false });
    const [userDir, setUserDir] = useState(null); // 'left' | 'right'
    const [userInc, setUserInc] = useState(null); // true | false
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'رادار الاتجاهات الجبريّة',
            detail: 'إذا كانت الحلول أكبر (>) نختار جهة اليمين، وإذا كانت أصغر (<) نختار جهة اليسار على المستقيم المدرج.',
            math: 'x > 2 \u27f6 Right \u27a1',
            icon: <ArrowLeftRight size={20} />
        },
        {
            title: 'تشفير العوارض الإحصائية',
            detail: 'العارضة [ ] تتجه نحو الحلول إذا كان الحد مشمولاً (\u2264، \u2265)، وتتجه عكسها إذا كان الحد مستبعداً (<، >).',
            math: 'x \u2265 0 \u27f6 [ Included ]',
            icon: <Layers size={20} />
        },
        {
            title: 'بروتوكول الشطب النهائي',
            detail: 'نقوم بتظليل أو شطب الجهة التي لا تمثل حلولاً لنترك مساحة الحلول واضحة ومحددة بدقة.',
            math: 'Cancel Non-Solutions',
            icon: <Crosshair size={20} />
        }
    ];

    const generateProblem = () => {
        const options = [
            { q: 'x > 3', boundary: 3, dir: 'right', inc: false },
            { q: 'x \u2264 5', boundary: 5, dir: 'left', inc: true },
            { q: 'x < -2', boundary: -2, dir: 'left', inc: false },
            { q: 'x \u2265 0', boundary: 0, dir: 'right', inc: true },
            { q: 'x > -4', boundary: -4, dir: 'right', inc: false },
            { q: 'x \u2264 2', boundary: 2, dir: 'left', inc: true }
        ];
        const newProb = options[Math.floor(Math.random() * options.length)];
        setPracticePair(newProb);
        setPhase('practice');
        setUserDir(null);
        setUserInc(null);
        setFeedback(null);
        setReward(null);
    };

    const handleCheck = async () => {
        if (userDir === practicePair.dir && userInc === practicePair.inc) {
            setFeedback({ type: 'success', text: 'إسقاط بياني مثالي! تم تحديد النطاق بنجاح ✓' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            
            rewardService.claimLabReward('inequality-graph-mastery')
                .then(data => data.status === 'success' && setReward(data))
                .catch(console.error);
        } else {
            setFeedback({ type: 'error', text: 'تحليل غير دقيق. تأكد من اتجاه الحلول وحالة العارضة.' });
        }
    };

    const theme = {
        container: isDarkMode ? 'bg-slate-950 border-white/5 shadow-3xl' : 'bg-white border-slate-100 shadow-2xl',
        card: isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-100 shadow-xl',
        textMain: isDarkMode ? 'text-white' : 'text-slate-900',
        textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    };

    return (
        <div className={`w-full h-full min-h-[300px] max-h-[85vh] ${theme.container} rounded-[1rem] md:rounded-[1.5rem] p-4 md:p-6 relative overflow-hidden flex flex-col font-sans border transition-all duration-500`} dir="rtl">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-4 pt-2">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm'}`}>
                                <Crosshair size={14} /> بروتوكول الإسقاط البياني
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>رادار المجالات البيانية</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                <Cpu size={14} /> وحدة الإسقاط: {phase === 'learn' ? 'التحليل' : reward ? 'مكتمل' : 'تحديد النطاق'}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {phase === 'learn' ? learnPages[learnStep].title : reward ? 'سيد المستقيم المدرج!' : 'مثل المتراجحة بيانياً'}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                             <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>دليل الرصد:</h3>
                             <div className="space-y-3">
                                 {learnPages.map((p, i) => (
                                     <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 transition-all">
                                         <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">{i + 1}</div>
                                         <h4 className="text-white font-bold text-xs">{p.title}</h4>
                                     </div>
                                 ))}
                             </div>
                             <button onClick={() => setPhase('learn')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">فتح دليل الإسقاط</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group rounded-[1rem] shadow-2xl overflow-hidden">
                            <div className={`absolute inset-0 bg-blue-600`} />
                            <div className="relative p-5 flex flex-col items-center justify-center text-white gap-4">
                                <Crosshair size={20} />
                                <span className="font-black text-xl italic uppercase tracking-widest">تفعيل الرادار</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="flex flex-col items-center text-center">
                                 <div className={`w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3`}>{learnPages[learnStep].icon}</div>
                                 <h3 className={`text-sm md:text-base font-black mb-3 tracking-tighter ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                 <p className={`text-sm md:text-lg ${theme.textSub} mb-4 max-w-2xl font-medium`}>{learnPages[learnStep].detail}</p>
                                 <div className={`p-6 rounded-2xl border-2 border-blue-500/30 bg-black/40 w-full`}>
                                     <span className="text-sm md:text-base font-mono font-black text-blue-400" dir="ltr">{learnPages[learnStep].math}</span>
                                 </div>
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                             {learnStep < 2 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black shadow-glow-blue transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-glow transition-all flex items-center gap-2">بدء الرصد <Crosshair size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-5xl px-2 overflow-y-auto max-h-full py-2">
                        <div className="bg-blue-950/40 px-4 py-2 rounded-[1.5rem] border-2 border-blue-500/30 text-blue-400 text-xl md:text-xl font-black shadow-glow-blue mb-3 relative overflow-hidden" dir="ltr">
                            <div className="relative z-10 font-mono tracking-tighter">
                                {practicePair.q}
                            </div>
                        </div>

                        <div className={`w-full p-6 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="relative w-full h-24 flex items-center justify-center bg-black/40 rounded-2xl border border-white/5 mb-4 px-4 overflow-hidden">
                                 <div className="absolute w-full h-1 bg-slate-800 rounded-full" />
                                 {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(v => (
                                     <div key={v} className="absolute h-4 w-0.5 bg-slate-700/50" style={{ left: `${50 + v * 9}%` }}>
                                         <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-500 font-mono italic">{v}</span>
                                     </div>
                                 ))}
                                 
                                 <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute h-16 w-1 bg-blue-500 shadow-glow-blue z-10" style={{ left: `${50 + practicePair.boundary * 9}%` }} />
                                 
                                 <AnimatePresence>
                                     {userDir && (
                                         <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} className={`absolute h-8 bg-gradient-to-r ${userDir === 'right' ? 'from-blue-500/40 to-transparent origin-left' : 'from-transparent to-blue-500/40 origin-right'} backdrop-blur-md border-y border-blue-500/20`} style={{ left: userDir === 'right' ? `${50 + practicePair.boundary * 9}%` : '5%', right: userDir === 'right' ? '5%' : `${100 - (50 + practicePair.boundary * 9)}%` }} />
                                     )}
                                 </AnimatePresence>

                                 <AnimatePresence>
                                     {userInc !== null && userDir && (
                                         <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute h-12 w-8 border-y-4 border-white flex items-center justify-center z-20" style={{ left: `${50 + practicePair.boundary * 9}%`, transform: 'translateX(-50%)', borderLeft: (userDir === 'right' && userInc) || (userDir === 'left' && !userInc) ? '6px solid white' : '1px solid rgba(255,255,255,0.1)', borderRight: (userDir === 'left' && userInc) || (userDir === 'right' && !userInc) ? '6px solid white' : '1px solid rgba(255,255,255,0.1)' }} />
                                     )}
                                 </AnimatePresence>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                 <div className="space-y-3">
                                     <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest px-4 block italic">اتجاه الرصد</span>
                                     <div className="flex gap-2">
                                         <button onClick={() => setUserDir('left')} className={`flex-1 py-2 rounded-xl font-black text-xl border-2 transition-all ${userDir === 'left' ? 'bg-blue-600 border-blue-400 text-white shadow-glow-blue' : 'bg-black/40 border-white/5 text-slate-600 hover:border-blue-500/30'}`}>يسار (&lt;)</button>
                                         <button onClick={() => setUserDir('right')} className={`flex-1 py-2 rounded-xl font-black text-xl border-2 transition-all ${userDir === 'right' ? 'bg-blue-600 border-blue-400 text-white shadow-glow-blue' : 'bg-black/40 border-white/5 text-slate-600 hover:border-blue-500/30'}`}>يمين (&gt;)</button>
                                     </div>
                                 </div>
                                 <div className="space-y-3">
                                     <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest px-4 block italic">نوع العارضة</span>
                                     <div className="flex gap-2">
                                         <button onClick={() => setUserInc(true)} className={`flex-1 py-2 rounded-xl font-black text-xl border-2 transition-all ${userInc === true ? 'bg-emerald-600 border-emerald-400 text-white shadow-glow' : 'bg-black/40 border-white/5 text-slate-600 hover:border-emerald-500/30'}`}>مشمول</button>
                                         <button onClick={() => setUserInc(false)} className={`flex-1 py-2 rounded-xl font-black text-xl border-2 transition-all ${userInc === false ? 'bg-rose-600 border-rose-400 text-white shadow-glow-rose' : 'bg-black/40 border-white/5 text-slate-600 hover:border-rose-500/30'}`}>تماماً</button>
                                     </div>
                                 </div>
                             </div>

                             <button onClick={handleCheck} disabled={userDir === null || userInc === null} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-2xl shadow-glow-blue transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 transition-all">
                                 <CheckCircle2 size={20} /> تأكيد الإسقاط
                             </button>
                             
                             {feedback && (
                                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-xl border font-black text-sm text-center ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-shake'}`}>
                                     {feedback.text}
                                 </motion.div>
                             )}
                        </div>
                    </div>
                )}

                {reward && (
                    <div className="w-full max-w-4xl z-20 text-center px-4 overflow-y-auto max-h-full">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="border-2 rounded-[1.5rem] p-5 shadow-glow-emerald mb-3 backdrop-blur-3xl relative overflow-hidden bg-emerald-500/10 border-emerald-500/40">
                             <ShieldCheck size={40} className="mx-auto text-emerald-500 mb-3 drop-shadow-glow" />
                             <h3 className="text-base md:text-lg font-black text-white mb-3 tracking-tighter leading-none uppercase italic">Visual Scout</h3>
                             <p className="text-sm md:text-base text-emerald-400 font-bold mb-4 italic">لقد أتقنت فن الإسقاط الهندسي وترجمة المتراجحات إلى مساحات بيانيّة دقيقة.</p>
                             <div className="inline-block px-8 py-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-white text-xl font-black shadow-inner">100%</div>
                        </motion.div>
                        <MasteryRewardCard reward={reward} />
                        <button onClick={generateProblem} className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xl shadow-glow-blue transition-all active:scale-95">تحدي رصد جديد</button>
                    </div>
                )}
            </div>

            {phase !== 'intro' && !reward && (
                <div className="absolute bottom-4 right-4 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={14} className="text-blue-400" /> <span>الرجوع</span>
                    </button>
                </div>
            )}
        </div>
    );
}
