import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, CheckCircle2, HelpCircle, X, ArrowRight, Mountain, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function GeoPyramidLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [input1, setInput1] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'الهرم والمخروط',
            detail: 'هي مجسمات تنتهي بنقطة واحدة في الأعلى تسمى "الرأس". الهرم قاعدته مضلع، والمخروط قاعدته دائرة.',
            visual: (
                <div className="relative w-48 h-32 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                         <motion.path 
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            d="M 50 10 L 10 80 L 90 80 Z" fill="none" stroke="#f59e0b" strokeWidth="2" 
                         />
                         <line x1="50" y1="10" x2="50" y2="80" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4" />
                         <text x="52" y="45" fill="#f59e0b" fontSize="8" fontWeight="bold">الارتفاع h</text>
                    </svg>
                </div>
            )
        },
        {
            title: 'قانون الثلث',
            detail: 'حجم الهرم أو المخروط هو دائماً "ثلث" حجم الأسطوانة أو المنشور الذي يملك نفس القاعدة والارتفاع.',
            visual: (
                <div className="flex flex-col gap-4 text-xl font-black text-center" dir="ltr">
                    <div className="text-white flex items-center gap-2">
                        <span>V = </span>
                        <div className="flex flex-col items-center text-amber-500">
                             <span className="border-b-2 border-amber-500 pb-1">1</span>
                             <span className="pt-1">3</span>
                        </div>
                        <span>\u00D7 B \u00D7 h</span>
                    </div>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            q: "إذا كان حجم أسطوانة هو 30cm\u00B3، فكم يكون حجم مخروط له نفس القاعدة والارتفاع؟",
            ans: 10,
            hint: "اقسم حجم الأسطوانة على 3."
        },
        { 
            q: "هرم مساحة قاعدته 12cm\u00B2 وارتفاعه 5cm. احسب حجمه.",
            ans: 20,
            hint: "(12 \u00D7 5) \u00F7 3"
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (parseInt(input1) === currentChallenge.ans) {
            setFeedback({ type: 'success', text: 'رائع! لقد أتقنت قانون الثلث للهرم والمخروط. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                    setInput1('');
                }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('geo-pyramid-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. لا تنسَ القسمة على 3 في القانون.' });
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                <Mountain size={16} /> الهرم والمخروط
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white' : 'text-slate-900'}`}>مختبر القمم</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : reward ? 'مكتمل' : `تحدي الحجم ${challengeStep + 1}/${challenges.length}`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow shadow-amber-500/50">
                                <Triangle size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>اكتشف سر العلاقة بين المجسمات ذات القمم الحادة ونظيراتها الأسطوانية. سنتعلم قانون "الثلث" السحري لحساب الأحجام.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all text-lg">دخول مختبر القمم</button>
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
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
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
                                <div className="flex items-center gap-4 text-2xl font-mono font-black" dir="ltr">
                                    <span className="text-white">V = </span>
                                    <input 
                                        type="number" value={input1} 
                                        onChange={e => setInput1(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                                        autoFocus
                                        className={`w-32 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${feedback?.type === 'error' ? 'border-rose-500 animate-shake' : 'border-amber-500/50 text-amber-400'}`} 
                                        placeholder="cm\u00B3" 
                                    />
                                </div>
                                <button onClick={handleAnswer} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-lg transition-all shadow-glow shadow-amber-500/30">تحقق من الحجم</button>
                            </div>
                        </div>

                        {feedback && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-lg font-black ${feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {feedback.text}
                            </motion.div>
                        )}
                        
                        <div className="mt-4 flex items-center gap-2 text-slate-500 font-bold bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <HelpCircle size={18} /> {currentChallenge.hint}
                        </div>
                    </div>
                )}

                {reward && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setInput1(''); }} className="mt-4 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && !reward && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => { setPhase('intro'); setChallengeStep(0); setInput1(''); }} className={`p-2 rounded-full backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
