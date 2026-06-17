import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, CheckCircle2, Calculator, BookOpen, Pencil, ArrowRight, Zap as ZapIcon, Sigma, Cpu, Binary, Target, Send, Rocket, ShieldCheck, Microscope, BrainCircuit, Star, Zap, HelpCircle, Trophy, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function IdentitiesLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [score, setScore] = useState(0);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'المتطابقة الأولى: مربع مجموع',
            math: '(a + b)² = a² + 2ab + b²',
            detail: 'نربع الأول، نربع الثاني، ونضع ضعف ضربهما.',
            example: 'مثال: (x + 3)² = x² + 6x + 9',
            icon: <Sigma size={20} />
        },
        {
            title: 'المتطابقة الثانية: مربع فرق',
            math: '(a - b)² = a² - 2ab + b²',
            detail: 'مثل الأولى تماماً، لكن إشارة الضعف تكون سالبة.',
            example: 'مثال: (x - 5)² = x² - 10x + 25',
            icon: <Binary size={20} />
        },
        {
            title: 'المتطابقة الثالثة: مجموع فرق',
            math: '(a + b)(a - b) = a² - b²',
            detail: 'أسهل المتطابقات! مربع الأول ناقص مربع الثاني.',
            example: 'مثال: (x + 4)(x - 4) = x² - 16',
            icon: <ShieldCheck size={20} />
        }
    ];

    const challenges = [
        { q: '(x + 2)² = x² + ?x + 4', a: '4', hint: '2 × x × 2 = ?' },
        { q: '(x - 3)² = x² - 6x + ?', a: '9', hint: '3² = ?' },
        { q: '(x + 5)(x - 5) = x² - ?', a: '25', hint: '5² = ?' },
        { q: '(2x + 1)² = 4x² + ?x + 1', a: '4', hint: '2 × (2x) × 1 = ?' },
        { q: '(x - 10)² = x² - ?x + 100', a: '20', hint: '2 × x × 10 = ?' },
        { q: '(3x + 2)(3x - 2) = ?x² - 4', a: '9', hint: '(3x)² = ?x²' }
    ];

    const handleAnswer = async () => {
        const current = challenges[challengeStep];
        if (userInput.trim() === current.a) {
            setScore(score + 1);
            setFeedback({ type: 'success', text: 'ممتاز! لقد استوعبت المتطابقة ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setShowHint(false);
            setUserInput('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1000);
            } else {
                try {
                    const data = await rewardService.claimLabReward('identities-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'إجابة غير صحيحة. ركز في القواعد!' });
            setTimeout(() => setFeedback(null), 2000);
        }
    };

    const theme = {
        container: isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-100 shadow-2xl',
        card: isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-100 shadow-xl',
        textMain: isDarkMode ? 'text-white' : 'text-slate-900',
        textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    };

    return (
        <div className={`w-full h-full min-h-[300px] max-h-[85vh] ${theme.container} rounded-[1rem] md:rounded-[1.5rem] p-4 md:p-6 relative overflow-hidden flex flex-col font-sans border transition-all duration-500`} dir="rtl">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-4 pt-2">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'}`}>
                                <ZapIcon size={14} /> معمل القواعد الذهبية
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>المتطابقات الشهيرة</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                <Cpu size={14} /> البروتوكول: {phase === 'learn' ? 'التعلم' : 'الاختبار'}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {phase === 'learn' ? learnPages[learnStep].title : `تحدي النشر ${challengeStep + 1}/${challenges.length}`}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                             <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>موسوعة القواعد:</h3>
                             <div className="space-y-3">
                                 {learnPages.map((p, i) => (
                                     <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                         <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">{i + 1}</div>
                                         <h4 className="text-white font-bold text-xs">{p.title}</h4>
                                     </div>
                                 ))}
                             </div>
                             <button onClick={() => setPhase('learn')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">دخول الموسوعة</button>
                        </div>
                        <motion.button onClick={() => setPhase('practice')} className="relative group rounded-[1rem] shadow-2xl overflow-hidden">
                            <div className={`absolute inset-0 bg-amber-600`} />
                            <div className="relative p-5 flex flex-col items-center justify-center text-white gap-4">
                                <Rocket size={20} />
                                <span className="font-black text-xl italic uppercase tracking-widest">ميدان التحدي</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-6 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="flex flex-col items-center text-center">
                                 <div className={`w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3`}>{learnPages[learnStep].icon}</div>
                                 <h3 className={`text-sm md:text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                 <p className={`text-sm md:text-lg ${theme.textSub} mb-3 max-w-2xl font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                                 <div className={`p-6 rounded-2xl border-2 border-amber-500/30 bg-slate-950/50 w-full mb-4`}>
                                     <span className="text-xl md:text-2xl font-mono font-black text-amber-400" dir="ltr">{learnPages[learnStep].math}</span>
                                 </div>
                                 <div className={`p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 italic text-amber-400 font-bold text-sm`}>{learnPages[learnStep].example}</div>
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(learnStep - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                             {learnStep < learnPages.length - 1 ? (
                                 <button onClick={() => setLearnStep(learnStep + 1)} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black shadow-glow transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-glow transition-all flex items-center gap-2 text-lg">بدء التحدي <Zap size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="w-full max-w-4xl px-2 overflow-y-auto max-h-full py-2">
                        <div className={`p-6 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="text-center space-y-6">
                                 <div className="space-y-3">
                                     <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest italic">أكمل الفراغ في النشر:</p>
                                     <div className="text-xl md:text-xl font-black text-amber-500 font-mono tracking-tighter" dir="ltr">
                                         {challenges[challengeStep].q}
                                     </div>
                                 </div>

                                 <div className="flex justify-center items-center gap-4 text-base md:text-lg font-black text-white" dir="ltr">
                                     <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-24 md:w-44 bg-slate-950/50 border-2 rounded-2xl p-4 text-center text-base md:text-lg font-black outline-none transition-all ${feedback?.type === 'error' ? 'border-rose-500 animate-shake' : 'border-amber-500/50 text-amber-400'}`} placeholder="?" autoFocus />
                                     <button onClick={handleAnswer} className="p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-glow transition-all active:scale-95"><Send size={20} /></button>
                                 </div>

                                 <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-amber-500 font-black text-xs mx-auto hover:text-amber-400 transition-colors uppercase tracking-widest italic">
                                     <HelpCircle size={16} /> طلب تلميح ذكي
                                 </button>
                                 <AnimatePresence>
                                     {showHint && (
                                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center text-amber-500 font-bold text-sm italic">
                                             {challenges[challengeStep].hint}
                                         </motion.div>
                                     )}
                                 </AnimatePresence>

                                 {feedback && (
                                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl border-2 font-black text-sm text-center ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/10 border-rose-100 text-rose-400'}`}>
                                         {feedback.text}
                                     </motion.div>
                                 )}
                             </div>
                        </div>
                    </div>
                )}

                {reward && (
                    <div className="w-full max-w-4xl z-20 text-center px-4 overflow-y-auto max-h-full">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`border-2 rounded-[1.5rem] p-5 shadow-glow-emerald mb-3 backdrop-blur-3xl relative overflow-hidden ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white border-emerald-500 shadow-2xl'}`}>
                             <Trophy size={40} className="mx-auto text-amber-400 mb-3" />
                             <h3 className="text-base md:text-lg font-black text-white mb-4 uppercase tracking-tighter">سيد المتطابقات!</h3>
                             <p className="text-sm md:text-base text-emerald-400 font-bold mb-4 italic opacity-80 leading-relaxed">لقد أتممت تحدي المتطابقات الشهيرة بنجاح باهر.</p>
                             <div className="inline-block px-10 py-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-white text-xl font-black">{score} / {challenges.length}</div>
                        </motion.div>
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setReward(null); setScore(0); }} className="mt-6 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-xl shadow-3xl transition-all">إعادة التحدي</button>
                    </div>
                )}
            </div>

            {phase !== 'intro' && !reward && (
                <div className="absolute bottom-4 right-4 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-xl'}`}>
                        <RotateCcw size={14} className="text-amber-500" /> <span>الرجوع</span>
                    </button>
                </div>
            )}
        </div>
    );
}
