import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, CheckCircle2, HelpCircle, X, ArrowRight, Calculator, Waves } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function GeoVolumeLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [fillLevel, setFillLevel] = useState(0);
    const [input1, setInput1] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ما هو الحجم؟',
            detail: 'الحجم هو مقدار "الفراغ" الذي يشغله المجسم من الداخل. نقيسه عادة بالوحدة المكعبة (cm\u00B3).',
            visual: (
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-32 h-40 border-2 border-white/20 rounded-xl overflow-hidden bg-white/5 flex items-end">
                        <motion.div 
                            animate={{ height: `${fillLevel}%` }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="w-full bg-blue-500/40 relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-blue-300/50 -translate-y-1/2 blur-sm" />
                            <Waves className="absolute top-2 left-1/2 -translate-x-1/2 text-blue-300 opacity-30 animate-pulse" />
                        </motion.div>
                    </div>
                    <button onClick={() => setFillLevel(fillLevel === 100 ? 0 : 100)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-glow shadow-blue-500/50">
                        {fillLevel === 100 ? 'تفريغ' : 'ملء بالماء'} <Droplet size={18} />
                    </button>
                </div>
            )
        },
        {
            title: 'القاعدة الذهبية',
            detail: 'حجم أي مجسم قاعدته ثابتة هو: مساحة القاعدة (B) ضرب الارتفاع (h).',
            visual: (
                <div className="flex flex-col gap-4 text-2xl font-black text-center" dir="ltr">
                    <div className="text-white">V = <span className="text-emerald-400">B</span> \u00D7 <span className="text-rose-400">h</span></div>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            q: "مكعب طول ضلعه 3cm. احسب حجمه.",
            ans: 27,
            formula: "V = 3 \u00D7 3 \u00D7 3"
        },
        { 
            q: "متوازي مستطيلات مساحة قاعدته 10cm\u00B2 وارتفاعه 5cm. ما هو حجمه؟",
            ans: 50,
            formula: "V = 10 \u00D7 5"
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (parseInt(input1) === currentChallenge.ans) {
            setFeedback({ type: 'success', text: 'صحيح! لقد ملأت الفراغ بالحساب الدقيق. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                    setInput1('');
                }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('geo-volume-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. اضرب مساحة القاعدة في الارتفاع.' });
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
                                <Waves size={16} /> الحجوم والسعة
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white' : 'text-slate-900'}`}>مختبر السعة</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
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
                            <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow shadow-blue-500/50">
                                <Calculator size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تقيس الفراغ الداخلي للمجسمات وتكتشف القوانين التي تسمح لنا بحساب سعة الخزانات والمباني الضخمة.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all text-lg">دخول مختبر السعة</button>
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
                                        className={`w-32 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${feedback?.type === 'error' ? 'border-rose-500 animate-shake' : 'border-blue-500/50 text-blue-400'}`} 
                                        placeholder="cm\u00B3" 
                                    />
                                </div>
                                <button onClick={handleAnswer} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg shadow-glow shadow-blue-500/30">تحقق من الحجم</button>
                            </div>
                        </div>

                        {feedback && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-lg font-black ${feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {feedback.text}
                            </motion.div>
                        )}
                        
                        <div className="mt-4 flex items-center gap-2 text-slate-500 font-bold">
                            <HelpCircle size={18} /> {currentChallenge.formula}
                        </div>
                    </div>
                )}

                {reward && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setInput1(''); }} className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
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
