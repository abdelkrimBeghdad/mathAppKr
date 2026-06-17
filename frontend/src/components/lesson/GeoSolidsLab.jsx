import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, CheckCircle2, HelpCircle, X, ArrowRight, Rotate3D, Layers, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function GeoSolidsLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);
    const [rotation, setRotation] = useState(0);

    // Auto-rotation effect for 3D feel
    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 1) % 360);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    const learnPages = [
        {
            title: 'ما هي الهندسة الفضائية؟',
            detail: 'هي دراسة الأشكال التي تعيش في فضاء ثلاثي الأبعاد. لها طول، عرض، وارتفاع. نطلق عليها اسم "المجسمات".',
            visual: (
                <div className="relative w-48 h-32 flex items-center justify-center perspective-1000">
                    <motion.div 
                        style={{ rotateY: rotation, rotateX: 20 }}
                        className="w-24 h-24 relative preserve-3d"
                    >
                        {/* 3D Cube faces */}
                        {[0, 90, 180, 270].map((rot, i) => (
                            <div key={i} className="absolute inset-0 bg-blue-500/30 border-2 border-blue-400 backdrop-blur-sm" style={{ transform: `rotateY(${rot}deg) translateZ(48px)` }} />
                        ))}
                        <div className="absolute inset-0 bg-blue-500/30 border-2 border-blue-400 backdrop-blur-sm" style={{ transform: 'rotateX(90deg) translateZ(48px)' }} />
                        <div className="absolute inset-0 bg-blue-500/30 border-2 border-blue-400 backdrop-blur-sm" style={{ transform: 'rotateX(-90deg) translateZ(48px)' }} />
                    </motion.div>
                </div>
            )
        },
        {
            title: 'المجسمات الدورانية',
            detail: 'بعض المجسمات تنتج عن دوران شكل مسطح حول محور. مثل الأسطوانة (دوران مستطيل) والمخروط (دوران مثلث قائم).',
            visual: (
                <div className="relative w-48 h-32 flex items-center justify-center perspective-1000">
                    <motion.div 
                        style={{ rotateY: rotation }}
                        className="w-20 h-32 relative preserve-3d"
                    >
                        <div className="absolute inset-0 border-2 border-amber-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(64px)' }} />
                        <div className="absolute inset-0 border-2 border-amber-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(-64px)' }} />
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-amber-500/40 border-x-2 border-amber-400/50" />
                    </motion.div>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            q: "ما هو المجسم الذي يملك 6 أوجه مربعة متطابقة؟",
            correct: "المكعب",
            options: ["المكعب", "متوازي المستطيلات", "الهرم"],
            solidType: 'cube'
        },
        { 
            q: "مجسم قاعدتاه دائرتان متطابقتان ومتوازيتان. ما هو؟",
            correct: "الأسطوانة",
            options: ["المخروط", "الأسطوانة", "الكرة"],
            solidType: 'cylinder'
        },
        { 
            q: "مجسم يملك رأساً واحداً (قمة) وقاعدة دائرية.",
            correct: "المخروط",
            options: ["الهرم", "المخروط", "الكرة"],
            solidType: 'cone'
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async (choice) => {
        if (choice === currentChallenge.correct) {
            setFeedback({ type: 'success', text: 'صحيح! لقد ميزت المجسم من خصائصه الهندسية. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('geo-solids-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. راجع خصائص المجسم المذكور.' });
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                <Box size={16} /> الهندسة الفضائية
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white' : 'text-slate-900'}`}>عالم المجسمات</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                {phase === 'learn' ? 'التحليل الهندسي' : reward ? 'مكتمل' : `تحدي التمييز ${challengeStep + 1}/${challenges.length}`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow shadow-blue-500/50">
                                <Rotate3D size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>اكتشف المجسمات ثلاثية الأبعاد وتعلم كيف تميز بينها من خلال عدد الأوجه والخصائص الهندسية الفريدة لكل منها.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all text-lg">دخول المختبر ثلاثي الأبعاد</button>
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
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-2xl px-2">
                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center ${theme.card}`}>
                            <div className="mb-3 perspective-1000 h-32 flex items-center justify-center">
                                {currentChallenge.solidType === 'cube' && (
                                    <motion.div style={{ rotateY: rotation, rotateX: 20 }} className="w-16 h-16 relative preserve-3d">
                                        {[0, 90, 180, 270].map((rot, i) => (
                                            <div key={i} className="absolute inset-0 bg-blue-500/40 border border-blue-400" style={{ transform: `rotateY(${rot}deg) translateZ(32px)` }} />
                                        ))}
                                        <div className="absolute inset-0 bg-blue-500/40 border border-blue-400" style={{ transform: 'rotateX(90deg) translateZ(32px)' }} />
                                        <div className="absolute inset-0 bg-blue-500/40 border border-blue-400" style={{ transform: 'rotateX(-90deg) translateZ(32px)' }} />
                                    </motion.div>
                                )}
                                {currentChallenge.solidType === 'cylinder' && (
                                    <motion.div style={{ rotateY: rotation }} className="w-16 h-24 relative preserve-3d">
                                        <div className="absolute inset-0 border border-amber-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(48px)' }} />
                                        <div className="absolute inset-0 border border-amber-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(-48px)' }} />
                                        <div className="absolute inset-0 bg-amber-500/30 border-x border-amber-400" />
                                    </motion.div>
                                )}
                                {currentChallenge.solidType === 'cone' && (
                                    <motion.div style={{ rotateY: rotation }} className="w-16 h-24 relative preserve-3d">
                                        <div className="absolute inset-0 border border-emerald-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(-48px)' }} />
                                        <div className="absolute inset-0 flex items-center justify-center overflow-visible">
                                            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                                <path d="M 50 0 L 0 100 L 100 100 Z" fill="rgba(16, 185, 129, 0.2)" stroke="currentColor" className="text-emerald-400" strokeWidth="2" />
                                            </svg>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <h3 className={`text-sm md:text-base font-black mb-4 ${theme.textMain}`}>{currentChallenge.q}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {currentChallenge.options.map((opt, i) => (
                                    <button key={i} onClick={() => handleAnswer(opt)} className={`px-4 py-3 rounded-xl border-2 font-black transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-black/40 hover:border-blue-500/50 hover:bg-blue-500/10 text-white' : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 text-slate-700'}`}>
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
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); }} className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && !reward && (
                <div className="absolute top-4 right-4 z-30 flex gap-2">
                     <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-blue-500/20">
                         <Rotate3D size={12} /> معاينة 3D مفعلة
                     </div>
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
