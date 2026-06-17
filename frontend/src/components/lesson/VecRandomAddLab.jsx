import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, CheckCircle2, HelpCircle, X, ArrowRight, Move } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function VecRandomAddLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [isTranslated, setIsTranslated] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'الأشعة المتباعدة',
            detail: 'أحياناً تكون الأشعة متباعدة في الفضاء ولا تشترك في أي نقطة. كيف نجمعها؟',
            visual: (
                <div className="relative w-48 h-32 bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center mx-auto">
                    <svg viewBox="-1 -1 6 6" className="w-full h-full overflow-visible">
                        <g transform="scale(1, -1) translate(0, -5)">
                            <line x1="0" y1="4" x2="2" y2="4" stroke="#38bdf8" strokeWidth="0.2" markerEnd="url(#arrow-b)" />
                            <line x1="3" y1="1" x2="4" y2="3" stroke="#f472b6" strokeWidth="0.2" markerEnd="url(#arrow-p)" />
                        </g>
                        <defs>
                            <marker id="arrow-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" /></marker>
                            <marker id="arrow-p" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f472b6" /></marker>
                        </defs>
                    </svg>
                </div>
            )
        },
        {
            title: 'قوة الانسحاب',
            detail: 'نقوم بعمل "انسحاب" لأحد الشعاعين بحيث تنطبق بدايته على نهاية الشعاع الآخر. هذا يحول المسألة إلى علاقة شال!',
            visual: (
                <div className="relative w-48 h-32 bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center mx-auto">
                    <svg viewBox="-1 -1 6 6" className="w-full h-full overflow-visible">
                        <g transform="scale(1, -1) translate(0, -5)">
                            <line x1="0" y1="4" x2="2" y2="4" stroke="#38bdf8" strokeWidth="0.2" markerEnd="url(#arrow-b)" />
                            <motion.line 
                                initial={{ x: 0, y: 0 }} 
                                animate={{ x: -1, y: 3 }} 
                                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                                x1="3" y1="1" x2="4" y2="3" 
                                stroke="#f472b6" strokeWidth="0.2" markerEnd="url(#arrow-p)" 
                            />
                        </g>
                    </svg>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            q: "اسحب الشعاع الوردي لتطبقه على نهاية الشعاع الأزرق", 
            v1: { x1: 0, y1: 3, x2: 2, y2: 3 },
            v2: { x1: 1, y1: 0, x2: 2, y2: 1 },
            targetPos: { x: 1, y: 3 } // offset needed
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        setIsTranslated(true);
        setFeedback({ type: 'success', text: 'رائع! الآن يمكنك تطبيق علاقة شال بسهولة. ✓' });
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

        try {
            const data = await rewardService.claimLabReward('vec-random-add-mastery');
            if (data.status === 'success') setReward(data);
        } catch (err) { console.error(err); }
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
                                <Repeat size={16} /> جمع الأشعة الكيفية
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white' : 'text-slate-900'}`}>فن الربط</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : reward ? 'مكتمل' : 'تحدي الانسحاب'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow">
                                <Repeat size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تجمع أي شعاعين في الفضاء، حتى لو كانا متباعدين، باستخدام قوة الانسحاب لدمجهما.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all text-lg">فتح الدليل التفاعلي</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتحدي</button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl relative overflow-hidden text-center ${theme.card}`}>
                             <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                             <p className={`text-base md:text-lg ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                             <div className={`p-6 rounded-2xl bg-black/40 border border-white/5 mx-auto max-w-md min-h-[200px] flex items-center justify-center`}>
                                 {learnPages[learnStep].visual}
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-200 text-slate-700'}`}>السابق</button>
                             {learnStep < learnPages.length - 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-2xl px-2">
                        <div className={`w-full p-6 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center ${theme.card}`}>
                            <h3 className={`text-sm md:text-base font-black mb-4 ${theme.textMain}`}>{currentChallenge.q}</h3>
                            <div className="relative w-64 h-32 mx-auto bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center">
                                <svg viewBox="-1 -1 6 6" className="w-full h-full">
                                    <g transform="scale(1, -1) translate(0, -5)">
                                        <line x1={currentChallenge.v1.x1} y1={currentChallenge.v1.y1} x2={currentChallenge.v1.x2} y2={currentChallenge.v1.y2} stroke="#38bdf8" strokeWidth="0.15" markerEnd="url(#arrow-b)" />
                                        
                                        <motion.line 
                                            animate={isTranslated ? { x: 1, y: 3 } : { x: 0, y: 0 }}
                                            transition={{ type: 'spring', damping: 15 }}
                                            x1={currentChallenge.v2.x1} y1={currentChallenge.v2.y1} 
                                            x2={currentChallenge.v2.x2} y2={currentChallenge.v2.y2} 
                                            stroke="#f472b6" strokeWidth="0.15" markerEnd="url(#arrow-p)" 
                                        />
                                    </g>
                                    <defs>
                                        <marker id="arrow-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" /></marker>
                                        <marker id="arrow-p" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f472b6" /></marker>
                                    </defs>
                                </svg>
                            </div>
                            
                            {!isTranslated && (
                                <button onClick={handleAnswer} className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center gap-2 mx-auto transition-all active:scale-95 shadow-glow">
                                    <Move size={20} /> سحب الشعاع الوردي
                                </button>
                            )}
                        </div>

                        {feedback && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-lg font-black ${feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {feedback.text}
                            </motion.div>
                        )}
                    </div>
                )}

                {reward && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setIsTranslated(false); }} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && !reward && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => { setPhase('intro'); setIsTranslated(false); }} className={`p-2 rounded-full backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
