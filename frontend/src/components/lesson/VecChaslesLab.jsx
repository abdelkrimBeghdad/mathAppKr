import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, CheckCircle2, HelpCircle, X, ArrowRight, Route } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function VecChaslesLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    
    const [inputStart, setInputStart] = useState('');
    const [inputEnd, setInputEnd] = useState('');
    
    const [error, setError] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const challenges = [
        { q: ["AB", "BD"], ansStart: "A", ansEnd: "D", hint: "حرف B متكرر كـ 'نهاية' للأول و'بداية' للثاني." },
        { q: ["FG", "EF"], ansStart: "E", ansEnd: "G", hint: "انتبه! أعد ترتيب الأشعة في ذهنك لتصبح النهاية هي البداية." },
        { q: ["MN", "NP", "PQ"], ansStart: "M", ansEnd: "Q", hint: "علاقة شال تعمل كالدومينو المتسلسل!" }
    ];

    const currentChallenge = challenges[challengeStep];

    const learnPages = [
        {
            title: 'الطريق المختصر',
            detail: 'إذا سافرت من النقطة A إلى B، ثم تابعت سفرك من B إلى C، فكأنك سافرت مباشرة من A إلى C.',
            visual: (
                <div className="relative w-48 h-32 bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center mx-auto">
                    <svg viewBox="-2 -2 10 10" className="w-full h-full overflow-visible">
                        <g transform="scale(1, -1)">
                            {/* A to B */}
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} x1="0" y1="0" x2="4" y2="1" stroke="#38bdf8" strokeWidth="0.2" markerEnd="url(#arrow-b)" />
                            {/* B to C */}
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1 }} x1="4" y1="1" x2="6" y2="4" stroke="#f472b6" strokeWidth="0.2" markerEnd="url(#arrow-p)" />
                            {/* A to C (Result) */}
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 2.5 }} x1="0" y1="0" x2="6" y2="4" stroke="#10b981" strokeWidth="0.3" strokeDasharray="0.5 0.2" markerEnd="url(#arrow-g)" />
                        </g>
                        <defs>
                            <marker id="arrow-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" /></marker>
                            <marker id="arrow-p" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f472b6" /></marker>
                            <marker id="arrow-g" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" /></marker>
                        </defs>
                    </svg>
                    <div className="absolute top-2 left-6 text-emerald-400 font-black">AC</div>
                </div>
            )
        },
        {
            title: 'علاقة شال السحرية',
            detail: 'لكي نطبق علاقة شال، يجب أن يكون الحرف الثاني في الشعاع الأول هو نفس الحرف الأول في الشعاع الثاني. ببساطة: ندمجهما ونحذف الحرف المكرر.',
            visual: (
                <div className="flex flex-col gap-4 text-xl font-mono text-center" dir="ltr">
                    <div className="flex items-center justify-center gap-2 text-white">
                        <span>A<span className="text-rose-400 font-black border-b-2 border-rose-400">B</span></span>
                        <span>+</span>
                        <span><span className="text-rose-400 font-black border-b-2 border-rose-400">B</span>C</span>
                        <span>=</span>
                        <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }} className="text-emerald-400 font-black">AC</motion.span>
                    </div>
                </div>
            )
        },
        {
            title: 'التبديل الاستراتيجي',
            detail: 'أحياناً يخدعك التمرين ويعطيك أشعة غير مرتبة. الجمع عملية تبديلية، يمكنك إعادة ترتيبها لتكتشف علاقة شال المخبأة.',
            visual: (
                <div className="flex flex-col gap-4 text-2xl font-mono text-center text-white" dir="ltr">
                    <div className="text-slate-400 flex items-center justify-center gap-2">
                        <span>CD + AC</span>
                        <span className="text-rose-400 mx-2 text-sm">لا تطبق شال مباشرة!</span>
                    </div>
                    <div className="flex justify-center my-2">
                        <ArrowRight className="rotate-90 text-slate-500" />
                    </div>
                    <div className="text-white flex items-center justify-center gap-2">
                        <span>A<span className="text-emerald-400">C</span> + <span className="text-emerald-400">C</span>D</span>
                        <span className="text-emerald-400 mx-2 text-sm">نرتبها أولاً!</span>
                    </div>
                    <div className="text-fuchsia-400 font-black text-xl mt-4 border-t border-white/10 pt-4">AD</div>
                </div>
            )
        }
    ];

    const handleAnswer = async () => {
        if (inputStart.toUpperCase() === currentChallenge.ansStart && inputEnd.toUpperCase() === currentChallenge.ansEnd) {
            setError(false);
            setInputStart(''); setInputEnd('');
            setShowHint(false);

            if (challengeStep < challenges.length - 1) {
                confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                setChallengeStep(challengeStep + 1);
            } else {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                try {
                    const data = await rewardService.claimLabReward('vec-chasles-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
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
                                <Link size={16} /> علاقة شال
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white' : 'text-slate-900'}`}>جمع الأشعة المتسلسلة</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : reward ? 'مكتمل' : `تحدي شال ${challengeStep + 1}/${challenges.length}`}
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
                                <Route size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تدمج مسارات متعددة في مسار واحد مباشر باستخدام علاقة شال الشهيرة في جمع الأشعة.</p>
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
                        
                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center ${theme.card}`}>
                            <h3 className={`text-lg font-black mb-3 ${theme.textSub}`}>أوجد المحصلة باستخدام علاقة شال</h3>
                            <div className="flex items-center justify-center gap-4 text-xl md:text-2xl font-mono font-black mb-4" dir="ltr">
                                {currentChallenge.q.map((v, i) => (
                                    <React.Fragment key={i}>
                                        <span className="text-white">{v}</span>
                                        {i < currentChallenge.q.length - 1 && <span className="text-slate-500">+</span>}
                                    </React.Fragment>
                                ))}
                                <span className="text-slate-500">=</span>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-2xl font-black font-mono mt-4" dir="ltr">
                                <span className="text-indigo-400">V = </span>
                                <input type="text" maxLength={1} value={inputStart} onChange={e => setInputStart(e.target.value)} autoFocus className={`w-14 uppercase bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-indigo-500/50 text-indigo-400'}`} placeholder="?" />
                                <input type="text" maxLength={1} value={inputEnd} onChange={e => setInputEnd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-14 uppercase bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-indigo-500/50 text-indigo-400'}`} placeholder="?" />
                            </div>
                        </div>

                        <div className="w-full flex gap-2">
                            <button onClick={() => setShowHint(!showHint)} className={`px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center ${isDarkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                <HelpCircle size={20} />
                            </button>
                            <button onClick={handleAnswer} className="flex-grow py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2">
                                <CheckCircle2 size={20} /> تأكيد المحصلة
                            </button>
                        </div>
                        
                        <AnimatePresence>
                            {showHint && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full text-center mt-2">
                                    <p className="text-amber-500 text-sm font-bold">{currentChallenge.hint}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
        </div>
    );
}
