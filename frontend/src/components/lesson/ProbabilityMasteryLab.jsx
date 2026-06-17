import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice5, CheckCircle2, HelpCircle, X, ArrowRight, Layers, Percent, Play, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function ProbabilityMasteryLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [userAns, setUserAns] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawResult, setDrawResult] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ما هي الاحتمالات؟',
            detail: 'الاحتمال هو مقياس لمدى إمكانية وقوع حدث ما. قيمته دائماً تكون بين 0 (مستحيل) و 1 (مؤكد).',
            visual: (
                <div className="flex flex-col gap-4 items-center">
                    <div className="w-full h-4 bg-slate-800 rounded-full relative border border-white/10 overflow-hidden">
                         <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-indigo-500/30 border-r border-indigo-400" />
                         <span className="absolute left-0 -top-6 text-[10px] text-slate-500 font-bold">مستحيل (0)</span>
                         <span className="absolute right-0 -top-6 text-[10px] text-slate-500 font-bold">مؤكد (1)</span>
                         <span className="absolute left-1/2 -translate-x-1/2 -top-6 text-[10px] text-white font-black">متساوي الاحتمال (0.5)</span>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                            <span className="text-2xl font-black text-indigo-400">P(A)</span>
                            <span className="text-[8px] text-slate-400 uppercase font-bold">قانون الاحتمال</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'قانون الحساب الأساسي',
            detail: 'نحسب الاحتمال بقسمة "عدد الحالات المواتية" على "العدد الإجمالي للحالات الممكنة".',
            visual: (
                <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 text-center" dir="ltr">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-white text-xl font-black">P = k / n</span>
                        <div className="h-0.5 w-full bg-white/10" />
                        <div className="flex gap-4 text-[10px] text-indigo-300 font-bold">
                            <span>k: عدد الكرات المطلوبة</span>
                            <span>n: المجموع الكلي</span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            red: 3, blue: 7, total: 10,
            q: "كيس يحتوي على 3 كرات حمراء و 7 زرقاء. ما هو احتمال سحب كرة حمراء؟ (أعطِ النتيجة كنسبة مئوية %)",
            ans: 30,
            hint: "(3 \u00F7 10) \u00D7 100 = ?"
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (parseInt(userAns) === currentChallenge.ans) {
            setFeedback({ type: 'success', text: 'إجابة عبقرية! لقد أتقنت منطق الاحتمالات. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            try {
                const data = await rewardService.claimLabReward('prob-mastery');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. تذكر: (الجزء \u00F7 الكل) \u00D7 100.' });
        }
    };

    const handleSimDraw = () => {
        setIsDrawing(true);
        setTimeout(() => {
            const res = Math.random() < (currentChallenge.red / currentChallenge.total) ? 'red' : 'blue';
            setDrawResult(res);
            setIsDrawing(false);
        }, 1000);
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
                                <Dice5 size={16} /> منطق الصدفة
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white' : 'text-slate-900'}`}>مختبر الاحتمالات</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                {phase === 'learn' ? 'التحليل الرياضي' : reward ? 'مكتمل' : 'تحدي الكرات'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow shadow-indigo-500/50">
                                <Percent size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>هل الحظ موجود فعلاً؟ تعلم كيف تتوقع المستقبل "رياضياً" وتفهم القوانين التي تحكم المصادفة والكرات الملونة.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all text-lg">دخول مختبر الاحتمال</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتحدي</button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl relative overflow-hidden text-center ${theme.card}`}>
                             <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                             <p className={`text-base md:text-lg ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                             <div className="mx-auto min-h-[200px] flex items-center justify-center">
                                 {learnPages[learnStep].visual}
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-200 text-slate-700'}`}>السابق</button>
                             {learnStep < learnPages.length - 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-4xl px-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-start">
                            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}>
                                <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>{currentChallenge.q}</h3>
                                <div className="flex items-center justify-center gap-4 text-2xl font-mono font-black" dir="ltr">
                                    <input 
                                        type="number" value={userAns} 
                                        onChange={e => setUserAns(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                                        className={`w-32 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${feedback?.type === 'error' ? 'border-rose-500 animate-shake' : 'border-indigo-500/50 text-indigo-400'}`} 
                                        placeholder="%" 
                                    />
                                    <span className="text-white">%</span>
                                </div>
                                <button onClick={handleAnswer} className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xl shadow-glow">تحقق من الاحتمال</button>
                            </div>

                            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl text-center min-h-[250px] relative flex flex-col items-center justify-center ${theme.card}`}>
                                 <div className="grid grid-cols-5 gap-2 mb-3">
                                     {Array.from({ length: currentChallenge.red }).map((_, i) => <div key={i} className="w-6 h-6 rounded-full bg-rose-500 shadow-glow shadow-rose-500/30" />)}
                                     {Array.from({ length: currentChallenge.blue }).map((_, i) => <div key={i} className="w-6 h-6 rounded-full bg-sky-500 shadow-glow shadow-sky-500/30" />)}
                                 </div>
                                 
                                 <button 
                                    onClick={handleSimDraw} disabled={isDrawing}
                                    className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white border border-white/10 transition-all flex items-center gap-2"
                                 >
                                    <Play size={14} /> جرب سحب عشوائي
                                 </button>
                                 
                                 <AnimatePresence>
                                     {drawResult && (
                                         <motion.div 
                                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                                            className={`mt-4 p-2 px-4 rounded-full text-xs font-black ${drawResult === 'red' ? 'bg-rose-500' : 'bg-sky-500'} text-white shadow-xl`}
                                         >
                                            النتيجة: {drawResult === 'red' ? 'حمراء' : 'زرقاء'}
                                         </motion.div>
                                     )}
                                 </AnimatePresence>
                            </div>
                        </div>

                        {feedback && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 text-lg font-black ${feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {feedback.text}
                            </motion.div>
                        )}
                    </div>
                )}

                {reward && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setUserAns(''); setDrawResult(null); }} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && !reward && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => { setPhase('intro'); setUserAns(''); }} className={`p-2 rounded-full backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
