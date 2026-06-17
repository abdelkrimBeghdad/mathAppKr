import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle2, HelpCircle, X, ArrowRight, Layers, Sigma } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function SysStrategyLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'فن اتخاذ القرار',
            detail: 'في الرياضيات، الوصول للحل ليس كافياً؛ اختيار الطريقة "الأسرع" والأقل عرضة للخطأ هو دليل الذكاء الحقيقي. متى نستخدم التعويض ومتى نستخدم الجمع؟',
            visual: (
                <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center text-emerald-400 gap-2"><Layers size={20} /> التعويض</div>
                    <div className="text-xl text-white font-black">VS</div>
                    <div className="flex flex-col items-center text-blue-400 gap-2"><Sigma size={20} /> الجمع</div>
                </div>
            )
        },
        {
            title: 'متى أستخدم التعويض؟',
            detail: 'ابحث دائماً عن مجهول معامله 1 أو -1. في هذه الحالة، عزله سيكون سهلاً جداً ولن ينتج عنه كسور معقدة.',
            visual: (
                <div className="flex flex-col gap-4 text-2xl font-mono text-center" dir="ltr">
                    <div className="text-white">x + 3y = 7</div>
                    <div className="text-emerald-400 border-2 border-emerald-500/30 p-2 rounded-xl">x = 7 - 3y</div>
                    <div className="text-sm font-sans text-emerald-300">"معامل x هنا هو 1، لذا التعويض ممتاز!"</div>
                </div>
            )
        },
        {
            title: 'متى أستخدم الجمع؟',
            detail: 'إذا كانت المعاملات متعاكسة (مثلاً +2y و -2y)، أو لا يوجد مجهول معامله 1، فالجمع هو الخيار الأفضل لتجنب الكسور.',
            visual: (
                <div className="flex flex-col gap-4 text-2xl font-mono text-center" dir="ltr">
                    <div className="text-white">2x + 5y = 12</div>
                    <div className="text-white">3x - 5y = 3</div>
                    <div className="text-blue-400 border-2 border-blue-500/30 p-2 rounded-xl">5x + 0 = 15</div>
                    <div className="text-sm font-sans text-blue-300">"المعاملات جاهزة للانفجار، الجمع هو الحل الأسرع!"</div>
                </div>
            )
        }
    ];

    const challenges = [
        {
            sys: ["x - 2y = 4", "3x + y = 5"],
            best: 'subst',
            reason: 'المعامل x في المعادلة الأولى هو 1. وكذلك المعامل y في المعادلة الثانية هو 1. التعويض سهل جداً هنا.'
        },
        {
            sys: ["4x + 3y = 10", "2x - 3y = 2"],
            best: 'add',
            reason: 'لاحظ أن لدينا +3y و -3y. الجمع سيخفي y فوراً بخطوة واحدة!'
        },
        {
            sys: ["3x + 2y = 8", "5x + 4y = 14"],
            best: 'add',
            reason: 'لا يوجد أي مجهول معامله 1. استخدام التعويض سينتج كسوراً (مثل x = 8/3 - 2/3y). لذا يفضل ضرب المعادلة الأولى في -2 واستخدام الجمع.'
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async (choice) => {
        if (choice === currentChallenge.best) {
            setFeedback({ type: 'success', text: 'اختيار ذكي وموفق! ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setShowHint(false);

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('sys-strategy-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'ليس الخيار الأسرع هنا. تأمل في المعاملات مرة أخرى.' });
        }
    };

    const theme = {
        container: isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-100 shadow-2xl',
        textMain: isDarkMode ? 'text-white' : 'text-slate-900',
        textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
        card: isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-slate-50 border-slate-200',
    };

    return (
        <div className={`w-full h-full min-h-[300px] max-h-[85vh] ${theme.container} rounded-[1rem] md:rounded-[1.5rem] p-4 relative overflow-hidden flex flex-col font-sans border transition-all duration-500`} dir="rtl">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-violet-50 text-violet-600 border-violet-100'}`}>
                                <BrainCircuit size={16} /> استراتيجية الحل
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-white' : 'text-slate-900'}`}>أي طريقة أختار؟</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-violet-50 text-violet-600 border-violet-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : reward ? 'مكتمل' : `تحدي الذكاء ${challengeStep + 1}/${challenges.length}`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-violet-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow">
                                <BrainCircuit size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>الآن بعد أن أتقنت الطريقتين، اختبر ذكاءك في تحديد الطريقة الأسرع والأسهل لحل أي جملة تظهر أمامك.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-black transition-all text-lg">فتح الدليل الإستراتيجي</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتحدي</button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl relative overflow-hidden text-center ${theme.card}`}>
                             <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                             <p className={`text-base md:text-lg ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                             <div className={`p-6 rounded-2xl bg-black/40 border border-white/5 mx-auto max-w-md min-h-[160px] flex items-center justify-center`}>
                                 {learnPages[learnStep].visual}
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-200 text-slate-700'}`}>السابق</button>
                             {learnStep < learnPages.length - 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-2xl px-2">
                        {/* The Problem Box */}
                        <div className={`w-full p-6 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-3 flex flex-col items-center justify-center gap-4 font-mono text-base md:text-lg font-black shadow-2xl ${theme.card} ${theme.textMain}`} dir="ltr">
                            <div>1) {currentChallenge.sys[0]}</div>
                            <div>2) {currentChallenge.sys[1]}</div>
                        </div>

                        {/* Interactive Options */}
                        <div className="w-full flex flex-col md:flex-row gap-4 mb-4">
                            <button onClick={() => handleAnswer('subst')} className="flex-1 p-6 rounded-[1rem] border-2 border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-black text-xl transition-all active:scale-95 flex flex-col items-center gap-2">
                                <Layers size={20} />
                                التعويض أسهل
                            </button>
                            <button onClick={() => handleAnswer('add')} className="flex-1 p-6 rounded-[1rem] border-2 border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-black text-xl transition-all active:scale-95 flex flex-col items-center gap-2">
                                <Sigma size={20} />
                                الجمع أسهل
                            </button>
                        </div>

                        {feedback && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-lg font-black ${feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {feedback.text}
                            </motion.div>
                        )}

                        <div className="w-full mt-4 text-center">
                            <button onClick={() => setShowHint(!showHint)} className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mx-auto ${isDarkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                <HelpCircle size={20} /> عرض التلميح الإستراتيجي
                            </button>
                            <AnimatePresence>
                                {showHint && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full text-center mt-4">
                                        <p className="text-amber-500 text-sm font-bold border-t border-amber-500/20 pt-4">{currentChallenge.reason}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {reward && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); }} className="mt-4 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && !reward && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => { setPhase('intro'); setChallengeStep(0); }} className={`p-2 rounded-full backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
