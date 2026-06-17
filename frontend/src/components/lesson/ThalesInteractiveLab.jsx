import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, CheckCircle2, HelpCircle, X, ArrowRight, Mountain, Ruler, Eye, SunDim } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function ThalesInteractiveLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [sunAngle, setSunAngle] = useState(45);
    const [challengeStep, setChallengeStep] = useState(0);
    const [input1, setInput1] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    // Shadow calculations
    const stickHeight = 2; // meters
    const pyramidHeight = 140; // meters (Great Pyramid)
    const stickShadow = stickHeight / Math.tan((sunAngle * Math.PI) / 180);
    const pyramidShadow = pyramidHeight / Math.tan((sunAngle * Math.PI) / 180);

    const learnPages = [
        {
            title: 'حيلة طاليس العبقرية',
            detail: 'في عام 600 قبل الميلاد، وقف طاليس أمام الهرم الأكبر وغرس عصاً صغيرة في الأرض. انتظر حتى تساوى طول ظل العصا مع طولها، فعرف أن ظل الهرم يساوي ارتفاعه!',
            visual: (
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full h-32 bg-gradient-to-b from-amber-900/20 to-amber-500/10 rounded-2xl overflow-hidden border border-amber-500/20">
                        {/* Sun */}
                        <motion.div 
                            animate={{ x: `${70 - sunAngle * 0.5}%`, y: `${sunAngle * 0.3}%` }}
                            className="absolute w-10 h-10 bg-amber-400 rounded-full shadow-glow shadow-amber-400/50 flex items-center justify-center"
                        >
                            <Sun size={20} className="text-amber-900" />
                        </motion.div>
                        
                        {/* Pyramid */}
                        <svg viewBox="0 0 300 120" className="absolute bottom-0 w-full">
                            <polygon points="150,20 100,100 200,100" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="1.5" />
                            {/* Pyramid shadow */}
                            <motion.polygon 
                                animate={{ points: `200,100 ${200 + pyramidShadow * 0.3},100 200,100` }}
                                fill="rgba(0,0,0,0.2)" 
                            />
                            {/* Stick */}
                            <line x1="240" y1="100" x2="240" y2="85" stroke="#22d3ee" strokeWidth="2" />
                            {/* Stick shadow */}
                            <motion.line 
                                animate={{ x2: 240 + stickShadow * 5 }}
                                x1="240" y1="100" x2="250" y2="100" stroke="rgba(0,0,0,0.4)" strokeWidth="2" 
                            />
                            {/* Ground line */}
                            <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        </svg>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full">
                        <SunDim size={16} className="text-amber-400" />
                        <input 
                            type="range" min="15" max="80" value={sunAngle} 
                            onChange={e => setSunAngle(parseInt(e.target.value))}
                            className="w-full accent-amber-500"
                        />
                        <Sun size={16} className="text-amber-400" />
                    </div>
                    <p className="text-amber-400 text-xs font-bold">زاوية الشمس: {sunAngle}° | ظل العصا: {stickShadow.toFixed(1)}م | ظل الهرم: {pyramidShadow.toFixed(0)}م</p>
                </div>
            )
        },
        {
            title: 'قانون النسب المتساوية',
            detail: 'القاعدة بسيطة: إذا كانت الأشعة متوازية (أشعة الشمس)، فإن النسب تتساوى دائماً.',
            visual: (
                <div className="flex flex-col gap-4 text-2xl font-black text-center" dir="ltr">
                    <div className="text-white flex items-center justify-center gap-2">
                        <div className="flex flex-col items-center text-cyan-400">
                            <span className="border-b-2 border-cyan-400 pb-1">طول العصا</span>
                            <span className="pt-1">ظل العصا</span>
                        </div>
                        <span className="text-white text-xl">=</span>
                        <div className="flex flex-col items-center text-amber-400">
                            <span className="border-b-2 border-amber-400 pb-1">ارتفاع الهرم</span>
                            <span className="pt-1">ظل الهرم</span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            q: "عصا طولها 2م وظلها 3م. إذا كان ظل الهرم 210م، فما ارتفاع الهرم؟",
            ans: 140,
            hint: "(2 / 3) = (? / 210) → ? = 2 × 210 / 3"
        },
        { 
            q: "شجرة ظلها 8م. عصا طولها 1.5م وظلها 2م. كم طول الشجرة؟",
            ans: 6,
            hint: "(1.5 / 2) = (? / 8) → ? = 1.5 × 8 / 2"
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (parseInt(input1) === currentChallenge.ans) {
            setFeedback({ type: 'success', text: 'صحيح! لقد استخدمت حيلة طاليس كالمحترفين. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                    setInput1('');
                }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('thales-shadow');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. استخدم التناسب: طول العصا / ظلها = المجهول / ظله.' });
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
                                <Mountain size={16} /> ظل الأهرامات
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white' : 'text-slate-900'}`}>مختبر طاليس التاريخي</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {phase === 'learn' ? 'المحاكاة التاريخية' : reward ? 'مكتمل' : `تحدي الظل ${challengeStep + 1}/${challenges.length}`}
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
                                <Eye size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>سافر عبر الزمن إلى مصر القديمة وتعلم كيف استخدم طاليس ظل عصا صغيرة لقياس ارتفاع الهرم الأكبر دون لمسه!</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all text-lg">السفر إلى مصر القديمة</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتحدي</button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl relative overflow-hidden text-center ${theme.card}`}>
                             <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                             <p className={`text-base md:text-lg ${theme.textSub} mb-3 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                             <div className="mx-auto min-h-[250px] flex items-center justify-center">
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
                                    <span className="text-white">= </span>
                                    <input 
                                        type="number" value={input1} 
                                        onChange={e => setInput1(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                                        autoFocus
                                        className={`w-32 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${feedback?.type === 'error' ? 'border-rose-500 animate-shake' : 'border-amber-500/50 text-amber-400'}`} 
                                        placeholder="متر" 
                                    />
                                </div>
                                <button onClick={handleAnswer} className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-xl transition-all shadow-glow shadow-amber-500/30">تحقق من الارتفاع</button>
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
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setInput1(''); setReward(null); }} className="mt-4 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
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
