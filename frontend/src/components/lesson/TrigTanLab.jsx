import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, CheckCircle2, HelpCircle, X, ArrowRight, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function TrigTanLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [input1, setInput1] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ما هو الطنجانط؟',
            detail: 'ظل الزاوية (Tan) هو نسبة تقارن بين ضلعي القائمة فقط (المقابل والمجاور). لا علاقة له بالوتر!',
            visual: (
                <div className="relative w-48 h-32 bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center mx-auto">
                    <svg viewBox="-1 -1 6 6" className="w-full h-full overflow-visible">
                        <g transform="scale(1, -1) translate(0, -5)">
                            <path d="M 0 0 L 4 0 L 0 4 Z" fill="none" stroke="white" strokeWidth="0.1" />
                            <motion.line initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} x1="0" y1="0" x2="0" y2="4" stroke="#fbbf24" strokeWidth="0.2" />
                            <motion.line initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} x1="0" y1="0" x2="4" y2="0" stroke="#38bdf8" strokeWidth="0.2" />
                        </g>
                    </svg>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-xs">المقابل</div>
                    <div className="absolute bottom-2 text-sky-400 font-bold text-xs">المجاور</div>
                </div>
            )
        },
        {
            title: 'قانون الظل',
            detail: 'الطنجانط يخبرنا بمدى "ميلان" الضلع. تذكر دائماً: مقابل ÷ مجاور.',
            visual: (
                <div className="flex flex-col gap-4 text-xl font-mono text-center" dir="ltr">
                    <div className="text-white">tan(\u03B1) =</div>
                    <div className="flex flex-col items-center justify-center text-xl text-emerald-400 border-2 border-emerald-500/30 p-4 rounded-xl bg-black/40">
                        <span className="border-b-2 border-amber-400 pb-1 text-amber-400">المقابل</span>
                        <span className="text-sky-400 pt-1">المجاور</span>
                    </div>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            opp: 3, 
            adj: 4, 
            ans: 0.75,
            q: "إذا كان المقابل 3cm والمجاور 4cm، احسب Tan الزاوية.",
            triangle: { a: {x: 0, y: 3}, b: {x: 4, y: 0}, c: {x: 0, y: 0} }
        },
        { 
            opp: 5, 
            adj: 5, 
            ans: 1,
            q: "إذا تساوى المقابل والمجاور (5cm لكل منهما)، كم يكون Tan الزاوية؟",
            triangle: { a: {x: 0, y: 5}, b: {x: 5, y: 0}, c: {x: 0, y: 0} }
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (parseFloat(input1) === currentChallenge.ans) {
            setFeedback({ type: 'success', text: 'صحيح! عندما يتساوى المقابل والمجاور يكون الظل 1 (زاوية 45 درجة). ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setShowHint(false);

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                    setInput1('');
                }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('trig-tan-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. اقسم المقابل على المجاور.' });
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                <TrendingUp size={16} /> الظل
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-white' : 'text-slate-900'}`}>مختبر الطنجانط</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : reward ? 'مكتمل' : `تحدي الظل ${challengeStep + 1}/${challenges.length}`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow">
                                <Calculator size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>اكتشف العلاقة بين ضلعي القائمة. نسبة الطنجانط هي الأكثر استخداماً في الهندسة المعمارية لحساب المنحدرات والارتفاعات.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all text-lg">فتح الدليل التفاعلي</button>
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
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-xl px-2">
                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center ${theme.card}`}>
                            <h3 className={`text-sm md:text-base font-black mb-3 ${theme.textMain}`}>{currentChallenge.q}</h3>
                            
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-4 text-xl font-mono font-black" dir="ltr">
                                    <span className="text-white">Tan(\u03B1) = </span>
                                    <div className="flex flex-col items-center">
                                        <div className="border-b-2 border-white/30 pb-1 text-amber-400">{currentChallenge.opp}</div>
                                        <div className="pt-1 text-sky-400">{currentChallenge.adj}</div>
                                    </div>
                                    <span className="text-white mx-2">=</span>
                                    <input 
                                        type="number" step="0.01" value={input1} 
                                        onChange={e => setInput1(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                                        autoFocus
                                        className={`w-24 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${feedback?.type === 'error' ? 'border-rose-500 animate-shake' : 'border-emerald-500/50 text-emerald-400'}`} 
                                        placeholder="?" 
                                    />
                                </div>
                                <button onClick={handleAnswer} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all">
                                    <CheckCircle2 size={20} /> تحقق من النتيجة
                                </button>
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
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setInput1(''); }} className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
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
