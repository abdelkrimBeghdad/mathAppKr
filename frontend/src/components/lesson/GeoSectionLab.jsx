import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, CheckCircle2, HelpCircle, X, ArrowRight, Layers, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function GeoSectionLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [isCut, setIsCut] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ما هو المقطع المستوي؟',
            detail: 'تخيل أنك تقطع حبة برتقال أو أسطوانة بسكين حاد جداً. الشكل الذي تراه في مكان القطع يسمى "المقطع".',
            visual: (
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-32 h-40 flex items-center justify-center perspective-1000">
                         <motion.div 
                            animate={{ y: isCut ? -20 : 0 }}
                            className="w-20 h-20 bg-amber-500/30 border-2 border-amber-400 rounded-full relative preserve-3d"
                         >
                             <div className="absolute inset-0 bg-amber-500/20 border-b-2 border-amber-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(40px)' }} />
                         </motion.div>
                         {isCut && (
                             <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-amber-400/80 rounded-full border-2 border-white shadow-glow"
                                style={{ transform: 'rotateX(70deg)' }}
                             />
                         )}
                    </div>
                    <button onClick={() => setIsCut(!isCut)} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-black flex items-center gap-2 shadow-glow shadow-rose-500/50">
                        {isCut ? 'إعادة التجميع' : 'قطع الأسطوانة'} <Scissors size={18} />
                    </button>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            q: "عند قطع أسطوانة بمستوٍ موازٍ لقاعدتها، ما هو شكل المقطع الناتج؟",
            correct: "دائرة",
            options: ["مربع", "دائرة", "مثلث"],
            solid: "cylinder"
        },
        { 
            q: "عند قطع مكعب بمستوٍ موازٍ لأحد أوجهه، ماذا نتحصل؟",
            correct: "مربع",
            options: ["مربع", "مستطيل", "دائرة"],
            solid: "cube"
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async (choice) => {
        if (choice === currentChallenge.correct) {
            setFeedback({ type: 'success', text: 'صحيح! المقطع دائماً يأخذ شكل القاعدة إذا كان القطع موازياً لها. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('geo-section-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. تخيل شكل السطح الناتج عن القطع.' });
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                <Scissors size={16} /> المقاطع المستوية
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-white' : 'text-slate-900'}`}>مختبر القواطع</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {phase === 'learn' ? 'التحليل الهندسي' : reward ? 'مكتمل' : `تحدي التخيل ${challengeStep + 1}/${challenges.length}`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow shadow-rose-500/50">
                                <Eye size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تتخيل ما بداخل المجسمات. سنقوم بقطع الأشكال الهندسية بمستويات مختلفة لنكتشف الأشكال المخفية بداخلها.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black transition-all text-lg">فتح مختبر القواطع</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتحدي</button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl relative overflow-hidden text-center ${theme.card}`}>
                             <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                             <p className={`text-base md:text-lg ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                             <div className="mx-auto min-h-[220px] flex items-center justify-center">
                                 {learnPages[learnStep].visual}
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-200 text-slate-700'}`}>السابق</button>
                             {learnStep < learnPages.length - 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-2xl px-2">
                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center ${theme.card}`}>
                            <h3 className={`text-sm md:text-base font-black mb-4 ${theme.textMain}`}>{currentChallenge.q}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {currentChallenge.options.map((opt, i) => (
                                    <button key={i} onClick={() => handleAnswer(opt)} className={`px-6 py-2 rounded-xl border-2 font-black text-xl transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-black/40 hover:border-rose-500/50 hover:bg-rose-500/10 text-white' : 'border-slate-200 bg-white hover:border-rose-400 hover:bg-rose-50 text-slate-700'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {feedback && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-lg font-black ${feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {feedback.text}
                            </motion.div>
                        )}
                    </div>
                )}

                {reward && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); }} className="mt-4 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
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
            
            <style dangerouslySetInnerHTML={{ __html: `
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
            `}} />
        </div>
    );
}
