import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, CheckCircle2, Calculator, BookOpen, Pencil, ArrowRight, Play, RefreshCw, Zap as ZapIcon, Sigma, Cpu, Binary, Target, Coins, Send, Rocket, ShieldCheck, Microscope, BrainCircuit, Star, Zap, Scale, Layers, Search, Trophy, HelpCircle, FastForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function EquationsLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'بروتوكول موازنة الموازين',
            detail: 'المعادلة هي ميزان رقمي دقيق. هدفنا الأساسي هو عزل المجهول x في طرف واحد عبر نقل الأرقام بحكمة.',
            math: 'x + a = b \u27f6 Balance Check',
            icon: <Scale size={20} />
        },
        {
            title: 'خوارزمية الانعكاس الإشاري',
            detail: 'عند نقل أي قيمة من كفة لأخرى، يجب عكس عمليتها فوراً: الجمع يصبح طرحاً، والضرب يصبح قسمة.',
            math: 'x + 5 = 12 \u27f6 x = 12 - 5',
            icon: <RefreshCw size={20} />
        },
        {
            title: 'بروتوكول الاختزال النهائي',
            detail: 'في المرحلة الأخيرة، نقسم الطرفين على معامل x لنصل إلى القيمة الجوهريّة للمجهول.',
            math: '2x = 10 \u27f6 x = 10 / 2',
            icon: <Binary size={20} />
        }
    ];

    const challenges = [
        { q: 'x + 6 = 15', a: '9', hint: 'انقل +6 للطرف الآخر لتصبح -6.' },
        { q: 'x - 8 = 12', a: '20', hint: 'انقل -8 للطرف الآخر لتصبح +8.' },
        { q: '5x = 40', a: '8', hint: 'اقسم 40 على المعامل 5.' },
        { q: '2x + 4 = 14', a: '5', hint: 'أولاً انقل +4، ثم اقسم الناتج على 2.' },
        { q: '3x - 5 = 10', a: '5', hint: 'أولاً انقل -5 لتصبح +5، ثم اقسم على 3.' },
        { q: '12 - x = 7', a: '5', hint: 'فكر: 12 ناقص كم يساوي 7؟' }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (userInput.trim() === currentChallenge.a) {
            setFeedback({ type: 'success', text: 'معالجة مثالية! تم استخراج قيمة x بنجاح ✓' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            setShowHint(false);
            setUserInput('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1500);
            } else {
                rewardService.claimLabReward('equations-mastery')
                    .then(data => data.status === 'success' && setReward(data))
                    .catch(console.error);
            }
        } else {
            setFeedback({ type: 'error', text: 'خلل في الموازنة الرقمية. تحقق من العمليات الحسابية.' });
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-4 pt-2">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-violet-50 text-violet-600 border-violet-100'}`}>
                                <Target size={14} /> بروتوكول عزل المجاهيل
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>هندسة المعادلات</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-violet-50 text-violet-600 border-violet-100'}`}>
                                {phase === 'learn' ? 'التحليل الاستراتيجي' : reward ? 'اكتمال المعالجة' : `المعادلة ${challengeStep + 1} من ${challenges.length}`}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {phase === 'learn' ? learnPages[learnStep].title : reward ? 'سيد التوازنات!' : 'أوجد قيمة x المجهولة'}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                             <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>موسوعة التوازنات</h3>
                             <p className={`${theme.textSub} text-sm mb-4 font-medium italic`}>تعلم استراتيجيات عزل x وكيفية التلاعب بموازين المعادلات للوصول للحقيقة الرقمية.</p>
                             <button onClick={() => setPhase('learn')} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black transition-all border border-white/10 text-sm">بدء التدريب</button>
                        </div>
                        <motion.button onClick={() => setPhase('practice')} className="relative group rounded-[1rem] shadow-2xl overflow-hidden">
                            <div className={`absolute inset-0 bg-violet-600`} />
                            <div className="relative p-8 flex flex-col items-center justify-center text-white gap-2">
                                <ZapIcon size={40} />
                                <span className="font-black text-xl italic uppercase tracking-widest">تفعيل المعالج</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="flex flex-col items-center text-center">
                                 <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                 <p className={`text-sm md:text-base ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                                 <div className={`p-6 rounded-2xl border-2 border-violet-500/30 bg-black/40 mb-4 w-full`}>
                                     <span className="text-sm md:text-base font-mono font-black text-violet-400" dir="ltr">{learnPages[learnStep].math}</span>
                                 </div>
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                             {learnStep < 2 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-black shadow-glow text-lg">التالي</button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-glow text-lg">بدء الاختبار</button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="w-full max-w-4xl px-2">
                        <div className={`p-4 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden flex flex-col items-center ${theme.card}`}>
                             <div className="w-full bg-slate-800 h-1 absolute top-0 left-0">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${((challengeStep) / challenges.length) * 100}%` }} className="h-full bg-violet-500 shadow-glow-violet transition-all duration-1000" />
                             </div>

                             <div className="text-center w-full space-y-6">
                                 <div className="space-y-2">
                                     <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest italic block">المعادلة قيد المعالجة</span>
                                     <div className="text-base md:text-lg font-black font-mono text-white bg-black/20 py-2 rounded-2xl border border-white/5" dir="ltr">
                                         {currentChallenge.q}
                                     </div>
                                 </div>

                                 <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full">
                                     <div className="flex items-center gap-4 text-base md:text-lg font-black text-white italic font-mono" dir="ltr">
                                         <span className="opacity-20 text-slate-500">x =</span>
                                         <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-24 md:w-36 bg-slate-950 border-2 rounded-xl p-3 text-center text-xl font-black outline-none transition-all ${feedback?.type === 'error' ? 'border-rose-500 animate-shake text-rose-400' : 'border-violet-500/50 text-violet-400 focus:border-violet-500'}`} placeholder="?" autoFocus />
                                     </div>
                                     <button onClick={handleAnswer} className="w-full md:w-auto p-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-glow-violet transition-all active:scale-95 flex items-center justify-center"><Send size={20} /></button>
                                 </div>

                                 <button onClick={() => setShowHint(!showHint)} className="text-amber-500/50 font-black text-xs hover:text-amber-500 transition-all uppercase italic tracking-widest flex items-center gap-2 mx-auto">
                                     <HelpCircle size={16} /> تلميح راداري
                                 </button>
                                 
                                 {showHint && (
                                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-black/60 border border-amber-500/20 rounded-xl italic">
                                         <p className="text-amber-400 text-sm md:text-base font-bold">{currentChallenge.hint}</p>
                                     </motion.div>
                                 )}

                                 {feedback && (
                                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-xl border font-bold text-sm text-center ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/10 border-rose-500/40 text-rose-400'}`}>
                                         {feedback.text}
                                     </motion.div>
                                 )}
                             </div>
                        </div>
                    </div>
                )}

                {reward && (
                    <div className="w-full max-w-2xl text-center px-4 overflow-y-auto max-h-[400px]">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="border-2 rounded-[1.5rem] p-8 shadow-glow-emerald backdrop-blur-3xl bg-emerald-500/10 border-emerald-500/40">
                             <Trophy size={40} className="mx-auto text-emerald-500 mb-4" />
                             <h3 className="text-base md:text-lg font-black text-white mb-4 tracking-tighter italic">MASTER OF LOGIC</h3>
                             <p className="text-sm md:text-base text-emerald-400 font-bold mb-3 italic opacity-80">لقد أتممت بروتوكول عزل المجاهيل بنجاح.</p>
                             <div className="inline-block px-8 py-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-white text-xl font-black italic">RESOLVED: 100%</div>
                        </motion.div>
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setReward(null); }} className="mt-6 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black text-xl shadow-glow-violet transition-all active:scale-95">إعادة التشغيل</button>
                    </div>
                )}
            </div>

            {phase !== 'intro' && !reward && (
                <div className="absolute bottom-4 right-4 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={14} className="text-violet-400" /> <span>الرجوع</span>
                    </button>
                </div>
            )}
        </div>
    );
}
