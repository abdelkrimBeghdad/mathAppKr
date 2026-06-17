import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, CheckCircle2, HelpCircle, X, ArrowRight, BarChart, Activity, Percent } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function StatChartLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [input1, setInput1] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'التمثيل البياني',
            detail: 'الصورة تساوي ألف كلمة! الرسوم البيانية تسمح لنا بمقارنة البيانات بسرعة البرق.',
            visual: (
                <div className="flex items-end gap-2 h-32 w-full justify-center">
                    {[40, 70, 50, 90].map((h, i) => (
                        <motion.div 
                            key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                            className="w-8 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg shadow-glow shadow-emerald-500/20"
                        />
                    ))}
                </div>
            )
        },
        {
            title: 'المخطط الدائري',
            detail: 'في المخطط الدائري، تتناسب زاوية كل قطاع مع تكراره. القاعدة: الزاوية = (التكرار \u00F7 التكرار الكلي) \u00D7 360.',
            visual: (
                <div className="relative w-32 h-32 rounded-full border-4 border-white/10 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-500/20" />
                    <div className="absolute inset-0 border-l-4 border-white/40 rotate-45" />
                    <Percent className="text-white opacity-20" size={20} />
                </div>
            )
        }
    ];

    const challenges = [
        { 
            q: "إذا كان التكرار الكلي هو 20، وتكرار القيمة هو 5. كم تكون زاوية قطاعها في الدائرة؟",
            ans: 90,
            hint: "(5 \u00F7 20) \u00D7 360 = ?"
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (parseInt(input1) === currentChallenge.ans) {
            setFeedback({ type: 'success', text: 'صحيح! 90 درجة تمثل ربع الدائرة بالضبط. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            try {
                const data = await rewardService.claimLabReward('stat-chart-mastery');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. استخدم قاعدة التناسب: (5 / 20) * 360.' });
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
                                <BarChart size={16} /> الرسوم البيانية
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-white' : 'text-slate-900'}`}>مختبر الألوان</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {phase === 'learn' ? 'التحليل البصري' : reward ? 'مكتمل' : 'تحدي الزوايا'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow shadow-emerald-500/50">
                                <Activity size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تحول الجداول الجافة إلى لوحات فنية تخبرك بالقصة كاملة في ثوانٍ. المخططات هي لغة العالم الحديث.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all text-lg">فتح مختبر الرسوم</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتحدي</button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl relative overflow-hidden text-center ${theme.card}`}>
                             <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                             <p className={`text-base md:text-lg ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                             <div className="mx-auto min-h-[160px] flex items-center justify-center">
                                 {learnPages[learnStep].visual}
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-200 text-slate-700'}`}>السابق</button>
                             {learnStep < learnPages.length - 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
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
                                    <input 
                                        type="number" value={input1} 
                                        onChange={e => setInput1(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                                        autoFocus
                                        className={`w-32 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${feedback?.type === 'error' ? 'border-rose-500 animate-shake' : 'border-emerald-500/50 text-emerald-400'}`} 
                                        placeholder="الزاوية" 
                                    />
                                    <span className="text-white">\u00B0</span>
                                </div>
                                <button onClick={handleAnswer} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xl transition-all shadow-glow shadow-emerald-500/30">تحقق من الزاوية</button>
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
                        <button onClick={() => { setPhase('intro'); setInput1(''); }} className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && !reward && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => { setPhase('intro'); setInput1(''); }} className={`p-2 rounded-full backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
