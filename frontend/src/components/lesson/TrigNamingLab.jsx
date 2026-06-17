import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, CheckCircle2, HelpCircle, X, ArrowRight, MousePointer2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function TrigNamingLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);
    const [targetAngle, setTargetAngle] = useState('A'); // A or B

    const learnPages = [
        {
            title: 'بنية المثلث القائم',
            detail: 'قبل البدء بالحسابات، يجب أن نعرف أسماء الأضلاع الثلاثة بدقة. الوتر هو دائماً الضلع الأطول والمقابل للزاوية القائمة.',
            visual: (
                <div className="relative w-48 h-32 bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center mx-auto">
                    <svg viewBox="-1 -1 6 6" className="w-full h-full overflow-visible">
                        <g transform="scale(1, -1) translate(0, -5)">
                            <path d="M 0 0 L 4 0 L 0 4 Z" fill="none" stroke="white" strokeWidth="0.1" />
                            <rect x="0" y="0" width="0.4" height="0.4" fill="none" stroke="white" strokeWidth="0.05" />
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} x1="4" y1="0" x2="0" y2="4" stroke="#f472b6" strokeWidth="0.2" />
                        </g>
                    </svg>
                    <div className="absolute top-8 right-6 text-rose-400 font-black text-sm rotate-[-45deg]">الوتر (Hypotenuse)</div>
                </div>
            )
        },
        {
            title: 'المقابل والمجاور',
            detail: 'أسماء الضلعين الآخرين تعتمد على الزاوية التي نختارها. المقابل هو البعيد عنها، والمجاور هو الذي يلمسها (بجانب الوتر).',
            visual: (
                <div className="flex flex-col gap-4 w-full px-4">
                    <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-emerald-500/30">
                        <span className="text-emerald-400 font-bold">الضلع المقابل</span>
                        <span className="text-white text-xs opacity-60">Opposite</span>
                    </div>
                    <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-blue-500/30">
                        <span className="text-blue-400 font-bold">الضلع المجاور</span>
                        <span className="text-white text-xs opacity-60">Adjacent</span>
                    </div>
                </div>
            )
        },
        {
            title: 'تغيير الأدوار',
            detail: 'لاحظ جيداً! إذا غيرنا الزاوية، يتبادل الضلعان القائمان أسماءهما. المقابل لـ A هو المجاور لـ B، والعكس صحيح.',
            visual: (
                <div className="relative w-full h-32 flex items-center justify-center gap-4">
                    <button onClick={() => setTargetAngle(targetAngle === 'A' ? 'B' : 'A')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2">
                         تغيير الزاوية <MousePointer2 size={16} />
                    </button>
                    <div className="text-white font-mono text-xl">الزاوية المختارة: <span className="text-amber-400 font-black">{targetAngle}</span></div>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            target: 'A', 
            q: "في هذا المثلث، ما هو الضلع 'المجاور' للزاوية A؟",
            correct: 'AC',
            options: ['BC', 'AC', 'AB'],
            triangle: { a: {x: 0, y: 4}, b: {x: 4, y: 0}, c: {x: 0, y: 0} }
        },
        { 
            target: 'B', 
            q: "ما هو الضلع 'المقابل' للزاوية B؟",
            correct: 'AC',
            options: ['AC', 'BC', 'AB'],
            triangle: { a: {x: 0, y: 4}, b: {x: 4, y: 0}, c: {x: 0, y: 0} }
        },
        { 
            target: 'A', 
            q: "ما هو اسم الضلع الأطول AB في هذا المثلث؟",
            correct: 'الوتر',
            options: ['المجاور', 'المقابل', 'الوتر'],
            triangle: { a: {x: 0, y: 4}, b: {x: 4, y: 0}, c: {x: 0, y: 0} }
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async (choice) => {
        if (choice === currentChallenge.correct) {
            setFeedback({ type: 'success', text: 'صحيح! مهارة تحديد الأضلاع هي مفتاح الحل. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setShowHint(false);

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('trig-naming-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. تذكر: المجاور يلمس الزاوية، والمقابل لا يلمسها.' });
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
                                <Triangle size={16} /> أساسيات المثلث
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white' : 'text-slate-900'}`}>تسمية الأضلاع</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : reward ? 'مكتمل' : `تحدي التسمية ${challengeStep + 1}/${challenges.length}`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow">
                                <Triangle size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>الخطوة الأولى والأهم في حساب المثلثات هي معرفة أسماء الأضلاع بالنسبة لكل زاوية. إذا أخطأت هنا، سيضيع كل الحل!</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all text-lg">فتح الدليل التفاعلي</button>
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
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-2xl px-2">
                        <div className={`w-full p-4 md:p-8 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center shadow-2xl ${theme.card}`}>
                            <h3 className={`text-sm md:text-base font-black mb-3 ${theme.textMain}`}>{currentChallenge.q}</h3>
                            
                            <div className="relative w-48 h-32 mx-auto mb-4">
                                <svg viewBox="-1 -1 6 6" className="w-full h-full overflow-visible">
                                    <g transform="scale(1, -1) translate(0, -5)">
                                        <path d="M 0 0 L 4 0 L 0 4 Z" fill="none" stroke="white" strokeWidth="0.1" />
                                        <rect x="0" y="0" width="0.4" height="0.4" fill="none" stroke="white" strokeWidth="0.05" />
                                        
                                        {/* Angle marker */}
                                        {currentChallenge.target === 'A' && (
                                            <path d="M 0 3.5 A 0.5 0.5 0 0 1 0.35 3.65" fill="none" stroke="#fbbf24" strokeWidth="0.2" />
                                        )}
                                        {currentChallenge.target === 'B' && (
                                            <path d="M 3.5 0 A 0.5 0.5 0 0 1 3.65 0.35" fill="none" stroke="#fbbf24" strokeWidth="0.2" />
                                        )}
                                        
                                        {/* Labels */}
                                        <text x="-0.5" y="4.5" fill="white" fontSize="0.6" transform="scale(1, -1)">A</text>
                                        <text x="4.5" y="0.5" fill="white" fontSize="0.6" transform="scale(1, -1)">B</text>
                                        <text x="-0.5" y="0.5" fill="white" fontSize="0.6" transform="scale(1, -1)">C</text>
                                    </g>
                                </svg>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3">
                                {currentChallenge.options.map((opt, i) => (
                                    <button key={i} onClick={() => handleAnswer(opt)} className={`px-4 py-2 rounded-xl border-2 font-bold transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-amber-500/50 text-white' : 'border-slate-200 bg-white hover:border-amber-400 hover:bg-slate-50 text-slate-700'}`}>
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

                        <div className="w-full mt-4 text-center">
                            <button onClick={() => setShowHint(!showHint)} className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mx-auto ${isDarkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                <HelpCircle size={20} /> عرض التلميح
                            </button>
                            <AnimatePresence>
                                {showHint && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full text-center mt-2">
                                        <p className="text-amber-500 text-sm font-bold">الوتر مقابل للزاوية القائمة. المقابل للزاوية لا يلمسها، والمجاور يلمسها وهو أحد أضلاعها.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {reward && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); }} className="mt-4 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
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
