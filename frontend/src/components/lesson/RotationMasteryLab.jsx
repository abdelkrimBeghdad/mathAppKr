import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, CheckCircle2, HelpCircle, X, ArrowRight, RefreshCcw, Compass, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function RotationMasteryLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [angle, setAngle] = useState(0);
    const [direction, setDirection] = useState('ccw'); // ccw (Positive), cw (Negative)
    const [challengeStep, setChallengeStep] = useState(0); 
    const [userAngle, setUserAngle] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ما هو الدوران؟',
            detail: 'هو تحويل هندسي "يدور" فيه الشكل حول نقطة ثابتة (المركز) بزاوية معينة وفي اتجاه معين.',
            visual: (
                <div className="relative w-48 h-32 flex items-center justify-center border-2 border-white/5 rounded-full">
                    <div className="absolute w-2 h-2 bg-rose-500 rounded-full z-20" />
                    <motion.div 
                        animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute w-24 h-0.5 bg-rose-500/30 origin-left"
                    />
                    <motion.div 
                        animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute right-0 w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold"
                    >
                        A
                    </motion.div>
                </div>
            )
        },
        {
            title: 'الاتجاه الموجب والسالب',
            detail: 'الاتجاه عكس عقارب الساعة هو "الموجب" (+). والاتجاه مع عقارب الساعة هو "السالب" (-).',
            visual: (
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col items-center gap-2">
                        <RefreshCcw className="text-emerald-400 animate-spin" style={{ animationDirection: 'reverse' }} size={40} />
                        <span className="text-emerald-400 font-bold">موجب (+)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <RotateCw className="text-rose-400 animate-spin" size={40} />
                        <span className="text-rose-400 font-bold">سالب (-)</span>
                    </div>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            q: "دور الشكل بزاوية 90 درجة في الاتجاه الموجب. كم ستكون الدرجة الجبرية؟",
            ans: 90,
            hint: "الاتجاه الموجب هو عكس عقارب الساعة."
        },
        { 
            q: "دور الشكل بزاوية 60 درجة في الاتجاه السالب (مع عقارب الساعة). ما هي القيمة الجبرية؟",
            ans: -60,
            hint: "الاتجاه السالب يسبق بـ (-)."
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (parseInt(userAngle) === currentChallenge.ans) {
            setFeedback({ type: 'success', text: 'رائع! لقد حددت الدوران بدقة هندسية عالية. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                    setUserAngle('');
                }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('rotation-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. تذكر أن الاتجاه يغير إشارة الزاوية.' });
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' : 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100'}`}>
                                <RefreshCcw size={16} /> هندسة الدوران
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-200 to-white' : 'text-slate-900'}`}>مختبر الرادار</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' : 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100'}`}>
                                {phase === 'learn' ? 'التحليل الهندسي' : reward ? 'مكتمل' : 'تحدي الزوايا'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-fuchsia-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow shadow-fuchsia-500/50">
                                <Compass size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تدور الأشكال في الفضاء حول مركز ثابت. الدوران هو لغة الهندسة التي تفسر حركة الكواكب والمحركات.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all text-lg">فتح المختبر</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتحدي</button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={angle} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl relative overflow-hidden text-center ${theme.card}`}>
                             <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[angle % learnPages.length].title}</h3>
                             <p className={`text-base md:text-lg ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[angle % learnPages.length].detail}</p>
                             <div className="mx-auto min-h-[220px] flex items-center justify-center">
                                 {learnPages[angle % learnPages.length].visual}
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => angle > 0 ? setAngle(a => a - 1) : setPhase('intro')} className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-200 text-slate-700'}`}>السابق</button>
                             {angle < learnPages.length - 1 ? (
                                 <button onClick={() => setAngle(a => a + 1)} className="px-6 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-xl px-2">
                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center ${theme.card}`}>
                            <h3 className={`text-sm md:text-base font-black mb-4 ${theme.textMain}`}>{currentChallenge.q}</h3>
                            
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative w-40 h-40 flex items-center justify-center border-4 border-dashed border-white/5 rounded-full">
                                    <div className="absolute w-3 h-3 bg-rose-500 rounded-full" />
                                    <motion.div 
                                        animate={{ rotate: isNaN(parseInt(userAngle)) ? 0 : parseInt(userAngle) }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                        className="w-32 h-1 bg-gradient-to-r from-rose-500 to-transparent origin-left rounded-full shadow-glow shadow-rose-500/20" 
                                    />
                                    <Target className="absolute top-0 text-white/20" size={20} />
                                </div>

                                <div className="flex items-center gap-4 text-2xl font-mono font-black" dir="ltr">
                                    <input 
                                        type="number" value={userAngle} 
                                        onChange={e => setUserAngle(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                                        autoFocus
                                        className={`w-32 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${feedback?.type === 'error' ? 'border-rose-500 animate-shake' : 'border-fuchsia-500/50 text-fuchsia-400'}`} 
                                        placeholder="± °" 
                                    />
                                </div>
                                <button onClick={handleAnswer} className="w-full py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black text-xl transition-all shadow-glow shadow-fuchsia-500/30">تأكيد الزاوية</button>
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
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setUserAngle(''); setReward(null); }} className="mt-4 w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && !reward && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => { setPhase('intro'); setChallengeStep(0); setUserAngle(''); }} className={`p-2 rounded-full backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
