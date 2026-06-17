import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, CheckCircle2, Calculator, BookOpen, Pencil, ArrowRight, Play, RefreshCw, Zap as ZapIcon, Sigma, Cpu, Binary, Target, Coins, Send, Rocket, ShieldCheck, Microscope, BrainCircuit, Star, Zap, HelpCircle, FastForward, Lightbulb, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function PowersLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'بروتوكول التكرار الأسي',
            detail: 'القوة هي تكرار لعملية الضرب. العدد a المرفوع للأس n يعني ضرب a في نفسه n مرة.',
            math: 'a\u207f = a \u00d7 a \u00d7 ... \u00d7 a',
            icon: <Zap size={20} />
        },
        {
            title: 'خوارزمية دمج القوى',
            detail: 'عند ضرب قوى لنفس العدد، نقوم بجمع الأسس. وعند القسمة، نقوم بطرحها لتسهيل المعالجة.',
            math: 'a\u207f \u00d7 a\u1d50 = a\u207f\u207a\u1d50',
            icon: <BrainCircuit size={20} />
        },
        {
            title: 'بروتوكول القوة المزدوجة',
            detail: 'رفع قوة إلى قوة أخرى يعني ضرب الأسين في بعضهما لإنتاج قوة موحدة قوية.',
            math: '(a\u207f)\u1d50 = a\u207f\u02e3\u1d50',
            icon: <Cpu size={20} />
        }
    ];

    const challenges = [
        { q: '2\u00b2 \u00d7 2\u00b3 = 2^?', a: '5', hint: 'عند الضرب نجمع الأسس: 2 + 3 = ?' },
        { q: '5\u2078 \u00f7 5\u2076 = 5^?', a: '2', hint: 'عند القسمة نطرح الأسس: 8 - 6 = ?' },
        { q: '(10\u00b2)\u2074 = 10^?', a: '8', hint: 'قوة القوة هي جداء الأسين: 2 \u00d7 4 = ?' },
        { q: '3\u2075 \u00d7 3\u207b\u00b2 = 3^?', a: '3', hint: 'نجمع الأسس: 5 + (-2) = ?' },
        { q: '7\u207b\u2074 \u00d7 7\u2074 = 7^?', a: '0', hint: 'نجمع الأسس المتعاكسة: -4 + 4 = ?' },
        { q: '2\u00b3 = ?', a: '8', hint: '2\u00b3 تعني 2 \u00d7 2 \u00d7 2.' }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (userInput.trim() === currentChallenge.a) {
            setFeedback({ type: 'success', text: 'طاقة أسية متفجرة! إجابة دقيقة ✓' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            setShowHint(false);
            setUserInput('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1500);
            } else {
                rewardService.claimLabReward('powers-mastery')
                    .then(data => data.status === 'success' && setReward(data))
                    .catch(console.error);
            }
        } else {
            setFeedback({ type: 'error', text: 'خلل في تدفق القوى. راجع قاعدة الأسس.' });
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="text-center z-10 mb-3 pt-4 md:pt-0">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-4 border backdrop-blur-md ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'}`}>
                                <ZapIcon size={16} /> مفاعل القوى والأسس
                            </div>
                            <h2 className={`text-2xl md:text-xl lg:text-2xl font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white' : 'text-slate-900'}`}>مفاعل القوى والأسس</h2>
                            <p className={`${theme.textSub} mt-4 text-sm md:text-lg font-medium max-w-2xl mx-auto italic`}>تحكم في النمو الأسي الخارق، وأتقن قواعد دمج القوى وتفكيكها داخل مفاعلنا الذهبي.</p>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-4 border ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                <Cpu size={16} /> بروتوكول التكرار: {phase === 'learn' ? 'محاكاة القواعد' : reward ? 'اكتمال الطاقة' : `النبضة ${challengeStep + 1} من ${challenges.length}`}
                            </div>
                            <h2 className={`text-xl md:text-2xl font-black tracking-tighter leading-none px-4 ${theme.textMain}`}>
                                {phase === 'learn' ? learnPages[learnStep].title : reward ? 'سيد القوى المطلقة!' : 'أكمل الفراغ الأسي'}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full px-4">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-6xl">
                        <div className={`group relative p-4 md:p-6 rounded-[1.5rem] text-right transition-all border backdrop-blur-3xl overflow-hidden ${theme.card}`}>
                             <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-4 shadow-glow transition-transform group-hover:rotate-12"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-4 tracking-tighter ${theme.textMain}`}>موسوعة الأسس</h3>
                             <p className={`${theme.textSub} text-lg mb-3 font-medium leading-relaxed italic`}>تعلم كيف تدمج القوى، وتطرح الأسس، وتتحكم في الأرقام العملاقة من خلال القواعد الذهبية.</p>
                             <button onClick={() => setPhase('learn')} className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all border border-white/10 w-full text-center">فتح الدليل التقني</button>
                        </div>
                        <motion.button onClick={() => setPhase('practice')} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-3xl">
                            <div className={`absolute inset-0 transition-transform duration-500 group-hover:scale-110 ${isDarkMode ? 'bg-gradient-to-br from-amber-500 to-orange-800 shadow-glow-amber' : 'bg-gradient-to-br from-amber-500 to-amber-600'}`} />
                            <div className="relative p-4 md:p-5 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <ZapIcon size={40} className="md:w-12 md:h-12 animate-pulse text-amber-200" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">تفعيل المفاعل</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-4xl">
                        <motion.div key={learnStep} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-5 md:p-20 rounded-[1.5rem] border-2 shadow-3xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="flex flex-col items-center text-center">
                                 <div className={`w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3`}>{learnPages[learnStep].icon}</div>
                                 <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                 <p className={`text-lg md:text-2xl ${theme.textSub} mb-14 max-w-2xl font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                                 <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 border-amber-500/30 bg-black/40 mb-3 w-full shadow-inner`}>
                                     <span className="text-xl md:text-xl font-mono font-black text-amber-400" dir="ltr">{learnPages[learnStep].math}</span>
                                 </div>
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-12 px-8">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-10 py-5 rounded-2xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 shadow-xl'}`}>السابق</button>
                             {learnStep < 2 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-12 py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-glow-amber transition-all flex items-center gap-2 text-xl">التالي <ArrowRight size={20} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-12 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-glow transition-all flex items-center gap-2 text-xl">دخول المفاعل <ZapIcon size={20} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="w-full max-w-5xl">
                        <div className={`p-5 md:p-16 rounded-[4.5rem] border-2 shadow-3xl backdrop-blur-3xl relative overflow-hidden flex flex-col items-center ${theme.card}`}>
                             <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${((challengeStep) / challenges.length) * 100}%` }} className="h-full bg-amber-500 shadow-glow-amber transition-all duration-1000" />
                             </div>

                             <div className="w-full flex justify-between items-center mb-16 px-4">
                                 <div className="text-amber-500 font-black tracking-[0.3em] uppercase italic text-sm">Target: Exponential Flux</div>
                                 <div className="text-slate-500 font-black font-mono">Stage {challengeStep + 1}/{challenges.length}</div>
                             </div>

                             <div className="text-center w-full space-y-12">
                                 <div className="space-y-6">
                                     <span className="text-slate-500 font-black text-xs uppercase tracking-[0.4em] mb-4 block italic">تحليل النبضة الأسية</span>
                                     <div className="text-2xl md:text-xl font-black font-mono text-white drop-shadow-glow tracking-tighter bg-black/20 py-10 rounded-[1.5rem] border border-white/5" dir="ltr">
                                         {currentChallenge.q}
                                     </div>
                                 </div>

                                 <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full max-w-2xl mx-auto">
                                     <div className="flex items-center gap-3 text-xl md:text-8xl font-black text-white italic font-mono" dir="ltr">
                                         <input type="number" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-44 md:w-72 bg-slate-950 border-4 rounded-[1.5rem] p-6 text-center text-2xl md:text-[6rem] font-black outline-none transition-all ${error ? 'border-rose-500 animate-shake shadow-glow-rose text-rose-400' : 'border-amber-500/50 text-amber-400 focus:border-amber-500 shadow-inner'}`} placeholder="?" autoFocus />
                                     </div>
                                     <button onClick={handleAnswer} className="w-full md:w-auto p-5 bg-amber-600 hover:bg-amber-500 text-white rounded-[1.5rem] shadow-glow-amber transition-all active:scale-95 flex items-center justify-center"><Send size={20} /></button>
                                 </div>

                                 <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-3 text-amber-500/50 font-black text-lg mx-auto hover:text-amber-500 hover:scale-105 transition-all uppercase italic tracking-[0.2em] mt-4">
                                     <HelpCircle size={20} /> أحتاج تلميحاً رادارياً
                                 </button>
                                 <AnimatePresence>
                                     {showHint && (
                                         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5 bg-black/60 border-2 border-amber-500/20 rounded-[1.5rem] backdrop-blur-md shadow-inner italic">
                                             <p className="text-amber-400 text-base md:text-lg font-bold leading-relaxed tracking-tight">{currentChallenge.hint}</p>
                                         </motion.div>
                                     )}
                                 </AnimatePresence>

                                 {feedback && (
                                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-[1rem] border-2 font-black text-xl text-center ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/10 border-rose-500/40 text-rose-400'}`}>
                                         {feedback.text}
                                     </motion.div>
                                 )}
                             </div>
                        </div>
                    </div>
                )}

                {reward && (
                    <div className="w-full max-w-5xl z-20 text-center px-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="border-4 rounded-[5rem] p-20 shadow-glow-emerald mb-12 backdrop-blur-3xl relative overflow-hidden bg-emerald-500/10 border-emerald-500/40">
                             <ZapIcon size={120} className="mx-auto text-emerald-500 mb-3 drop-shadow-glow" />
                             <h3 className="text-2xl md:text-xl font-black text-white mb-4 tracking-tighter leading-none uppercase italic">Absolute Power</h3>
                             <p className="text-base md:text-lg text-emerald-400 font-bold mb-12 italic opacity-80 leading-relaxed">لقد سيطرت على تدفق القوى المطلقة وأتقنت قواعد الأسس المعقدة بكفاءة برمجية مذهلة.</p>
                             <div className="inline-block px-16 py-3 bg-emerald-500/20 rounded-[1rem] border border-emerald-500/30 text-white text-2xl font-black shadow-inner tracking-widest italic">CAPACITY: 100%</div>
                        </motion.div>
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setReward(null); }} className="mt-12 w-full py-10 bg-amber-600 hover:bg-amber-500 text-white rounded-[1.5rem] font-black text-xl shadow-glow-amber transition-all active:scale-95">إعادة تفعيل المفاعل</button>
                    </div>
                )}
            </div>

            {phase !== 'intro' && !reward && (
                <div className="absolute bottom-12 right-12 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-10 py-5 rounded-[1.5rem] font-black text-sm flex items-center gap-4 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={22} className="text-amber-400" /> <span>غرفة القيادة</span>
                    </button>
                </div>
            )}
        </div>
    );
}
