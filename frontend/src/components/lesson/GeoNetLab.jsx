import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, CheckCircle2, HelpCircle, X, ArrowRight, Layers, Layout, MousePointer2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function GeoNetLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [isUnfolded, setIsUnfolded] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ما هو نشر المجسم؟',
            detail: 'نشر المجسم هو عملية "فتحه" وجعله شكلاً مسطحاً. هذا يساعدنا على رؤية كل الأوجه وحساب المساحة الكلية بسهولة.',
            visual: (
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-32 h-32 flex items-center justify-center perspective-1000">
                        <motion.div 
                            animate={{ rotateY: isUnfolded ? 0 : 45, rotateX: isUnfolded ? 0 : 20 }}
                            className="w-16 h-16 relative preserve-3d"
                        >
                            {!isUnfolded ? (
                                <div className="absolute inset-0 bg-indigo-500/40 border-2 border-indigo-400 backdrop-blur-md" />
                            ) : (
                                <div className="flex gap-1">
                                     {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 bg-indigo-500/20 border border-indigo-400" />)}
                                </div>
                            )}
                        </motion.div>
                    </div>
                    <button onClick={() => setIsUnfolded(!isUnfolded)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2">
                        {isUnfolded ? 'إغلاق المجسم' : 'نشر المجسم'} <MousePointer2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            q: "إذا كانت مساحة الوجه الواحد للمكعب هي 9cm\u00B2، فكم تكون مساحته الكلية؟",
            correct: "54",
            options: ["36", "54", "81"],
            hint: "المكعب يملك 6 أوجه متطابقة. اضرب مساحة الوجه في 6."
        },
        { 
            q: "كم وجهاً يظهر في 'نشر' متوازي المستطيلات؟",
            correct: "6",
            options: ["4", "6", "8"],
            hint: "متوازي المستطيلات هو ابن عم المكعب، له نفس عدد الأوجه."
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async (choice) => {
        if (choice === currentChallenge.correct) {
            setFeedback({ type: 'success', text: 'صحيح! المساحة الكلية هي مجموع مساحات كل أوجه النشر. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('geo-net-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. فكر في عدد الأوجه الموجودة في الشكل المسطح.' });
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                <Layers size={16} /> المساحة والنشر
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white' : 'text-slate-900'}`}>مختبر الأوجه المسطحة</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                {phase === 'learn' ? 'التحليل الهندسي' : reward ? 'مكتمل' : `تحدي المساحة ${challengeStep + 1}/${challenges.length}`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow shadow-indigo-500/50">
                                <Layout size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تفتح المجسمات لترى "جلدها" الخارجي. مهارة النشر هي الطريق الوحيد لفهم وحساب المساحات الكلية للمجسمات.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all text-lg">بدء عملية النشر</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتحدي</button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl relative overflow-hidden text-center ${theme.card}`}>
                             <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                             <p className={`text-base md:text-lg ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                             <div className="mx-auto min-h-[200px] flex items-center justify-center">
                                 {learnPages[learnStep].visual}
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-200 text-slate-700'}`}>السابق</button>
                             {learnStep < learnPages.length - 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
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
                            
                            <div className="flex flex-wrap justify-center gap-3">
                                {currentChallenge.options.map((opt, i) => (
                                    <button key={i} onClick={() => handleAnswer(opt)} className={`px-4 py-2 rounded-xl border-2 font-black text-2xl transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-black/40 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-white' : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 text-slate-700'}`}>
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
                        
                        <div className="mt-6 flex items-center gap-2 text-indigo-400 font-bold bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/20">
                            <HelpCircle size={18} /> {currentChallenge.hint}
                        </div>
                    </div>
                )}

                {reward && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); }} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
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
