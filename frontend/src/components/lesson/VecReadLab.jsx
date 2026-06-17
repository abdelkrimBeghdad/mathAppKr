import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, CheckCircle2, HelpCircle, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function VecReadLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [inputX, setInputX] = useState('');
    const [inputY, setInputY] = useState('');
    const [error, setError] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'قراءة المسار',
            detail: 'لكتابة مركبات شعاع، نقوم بتحليل حركته المائلة إلى حركتين بسيطتين: حركة أفقية (x) ثم حركة عمودية (y).',
            visual: (
                <div className="relative w-48 h-32 bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundPosition: 'center center' }} />
                    <svg viewBox="-5 -5 10 10" className="w-full h-full z-10 overflow-visible">
                        <g transform="scale(1, -1)">
                            {/* Vector */}
                            <line x1="-3" y1="-2" x2="3" y2="2" stroke="#d946ef" strokeWidth="0.3" markerEnd="url(#arrow)" />
                            {/* Path */}
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }} x1="-3" y1="-2" x2="3" y2="-2" stroke="#34d399" strokeWidth="0.2" strokeDasharray="0.5 0.2" />
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.5, repeat: Infinity, repeatDelay: 1.5 }} x1="3" y1="-2" x2="3" y2="2" stroke="#38bdf8" strokeWidth="0.2" strokeDasharray="0.5 0.2" />
                        </g>
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#d946ef" />
                            </marker>
                        </defs>
                    </svg>
                </div>
            )
        },
        {
            title: 'المركبة الأفقية (x)',
            detail: 'نبدأ دائماً من نقطة انطلاق الشعاع. نتحرك يميناً (موجب) أو يساراً (سالب) حتى نصبح أسفل أو أعلى نقطة النهاية مباشرة.',
            visual: (
                <div className="flex flex-col gap-4 text-xl font-mono text-center">
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-emerald-400 font-black px-4 py-2 bg-emerald-400/10 rounded-xl">يمين = +</span>
                        <span className="text-rose-400 font-black px-4 py-2 bg-rose-400/10 rounded-xl">يسار = -</span>
                    </div>
                </div>
            )
        },
        {
            title: 'المركبة العمودية (y)',
            detail: 'بعد الوصول، نصعد (موجب) أو ننزل (سالب) لنصل إلى رأس السهم (النهاية).',
            visual: (
                <div className="flex flex-col gap-4 text-xl font-mono text-center">
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-cyan-400 font-black px-4 py-2 bg-cyan-400/10 rounded-xl">أعلى = +</span>
                        <span className="text-rose-400 font-black px-4 py-2 bg-rose-400/10 rounded-xl">أسفل = -</span>
                    </div>
                    <div className="mt-4 text-2xl text-fuchsia-400 font-black border-2 border-fuchsia-500/30 rounded-xl p-4 inline-block mx-auto">
                        <span className="text-emerald-400">x</span> <br/>
                        <span className="text-cyan-400">y</span>
                    </div>
                </div>
            )
        }
    ];

    const challenges = [
        { dx: 3, dy: 2, startX: -2, startY: -1 },
        { dx: -4, dy: 1, startX: 2, startY: -1 },
        { dx: 0, dy: -3, startX: 0, startY: 2 },
        { dx: -2, dy: -2, startX: 1, startY: 1 }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (parseInt(inputX) === currentChallenge.dx && parseInt(inputY) === currentChallenge.dy) {
            setError(false);
            setInputX(''); setInputY('');
            setShowHint(false);

            if (challengeStep < challenges.length - 1) {
                confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                setChallengeStep(challengeStep + 1);
            } else {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                try {
                    const data = await rewardService.claimLabReward('vec-read-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    const VectorGrid = ({ dx, dy, startX, startY }) => {
        return (
            <div className="relative w-full max-w-[250px] aspect-square bg-slate-950/50 rounded-2xl border-2 border-white/10 overflow-hidden mx-auto mb-3 shadow-inner">
                {/* Grid */}
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '10% 10%', backgroundPosition: 'center center' }} />
                {/* Axes */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-600" />
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-slate-600" />
                
                <svg viewBox="-5 -5 10 10" className="absolute inset-0 w-full h-full overflow-visible z-10">
                    <g transform="scale(1, -1)">
                        <circle cx={startX} cy={startY} r="0.2" fill="#10b981" />
                        <line x1={startX} y1={startY} x2={startX + dx} y2={startY + dy} stroke="#d946ef" strokeWidth="0.15" markerEnd="url(#arrowhead)" />
                    </g>
                    <defs>
                        <marker id="arrowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#d946ef" />
                        </marker>
                    </defs>
                </svg>
            </div>
        );
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
                                <Grid size={16} /> القراءة البيانية
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-200 to-white' : 'text-slate-900'}`}>تفكيك الحركة</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' : 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : reward ? 'مكتمل' : `تحدي القراءة ${challengeStep + 1}/${challenges.length}`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-fuchsia-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow">
                                <Grid size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تقرأ مركبات الشعاع من الشبكة كأنك تفكك شفرة، بالانتقال خطوة بخطوة من البداية إلى النهاية.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all text-lg">فتح الدليل التفاعلي</button>
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
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-xl px-2">
                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 shadow-2xl flex flex-col items-center ${theme.card}`}>
                            
                            <VectorGrid dx={currentChallenge.dx} dy={currentChallenge.dy} startX={currentChallenge.startX} startY={currentChallenge.startY} />

                            <div className="flex items-center gap-4 text-xl font-black font-mono" dir="ltr">
                                <span className="text-fuchsia-400 text-2xl">V (</span>
                                <div className="flex flex-col gap-2">
                                    <input type="number" value={inputX} onChange={e => setInputX(e.target.value)} autoFocus className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-emerald-500/50 text-emerald-400'}`} placeholder="x" />
                                    <input type="number" value={inputY} onChange={e => setInputY(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-cyan-500/50 text-cyan-400'}`} placeholder="y" />
                                </div>
                                <span className="text-fuchsia-400 text-2xl">)</span>
                            </div>

                        </div>

                        <div className="w-full flex gap-2">
                            <button onClick={() => setShowHint(!showHint)} className={`px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center ${isDarkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                <HelpCircle size={20} />
                            </button>
                            <button onClick={handleAnswer} className="flex-grow py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2">
                                <CheckCircle2 size={20} /> تأكيد المركبات
                            </button>
                        </div>
                        
                        <AnimatePresence>
                            {showHint && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full text-center mt-2">
                                    <p className="text-amber-500 text-sm font-bold">ابدأ من النقطة الخضراء، عد المربعات لليمين أو اليسار للوصول لـ x، ثم المربعات للأعلى أو الأسفل للوصول لـ y.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {reward && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); }} className="mt-4 w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
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
