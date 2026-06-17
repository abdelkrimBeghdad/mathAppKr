import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, CheckCircle2, HelpCircle, X, ArrowRight, Layers, Layout, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function StatCumulativeLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [userValues, setUserValues] = useState(['', '', '']);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'التكرار المجمع الصاعد',
            detail: 'هو مجموع التكرارات من البداية حتى تلك القيمة. يخبرنا كم عدداً "أقل من أو يساوي" قيمة معينة.',
            visual: (
                <div className="flex flex-col gap-2 w-full text-xs font-bold text-center">
                    <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-2">
                        <span className="text-slate-400">التكرار</span>
                        <span className="text-white">3</span>
                        <span className="text-white">5</span>
                        <span className="text-white">2</span>
                    </div>
                    <ArrowUpRight className="text-emerald-500 mx-auto" />
                    <div className="grid grid-cols-3 gap-2 pt-2 text-emerald-400">
                        <span>3</span>
                        <span>3+5=8</span>
                        <span>8+2=10</span>
                    </div>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            freqs: [4, 6, 5],
            q: "احسب التكرار المجمع الصاعد لهذه السلسلة.",
            correct: [4, 10, 15],
            hint: "ابدأ بأول تكرار، ثم أضف إليه التكرار التالي وهكذا."
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        const isCorrect = userValues.every((v, i) => parseInt(v) === currentChallenge.correct[i]);

        if (isCorrect) {
            setFeedback({ type: 'success', text: 'أحسنت! تراكم البيانات يعطيك صورة أوضح عن ترتيب السلسلة. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            try {
                const data = await rewardService.claimLabReward('stat-cumulative-mastery');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setFeedback({ type: 'error', text: 'خطأ في الجمع التراكمي. جرب مرة أخرى.' });
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
                                <ArrowUpRight size={16} /> التكرار المجمع
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white' : 'text-slate-900'}`}>مختبر التراكم</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                {phase === 'learn' ? 'التحليل الإحصائي' : reward ? 'مكتمل' : 'تحدي التراكم'}
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
                                <TrendingUp size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تجمع التكرارات خطوة بخطوة لتكتشف "وزن" كل معلومة داخل السلسلة الإحصائية.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all text-lg">فتح مختبر التراكم</button>
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
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-2xl px-2">
                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center ${theme.card}`}>
                            <h3 className={`text-sm md:text-base font-black mb-4 ${theme.textMain}`}>{currentChallenge.q}</h3>
                            
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-center border-collapse">
                                    <thead>
                                        <tr className={`${theme.textMain} border-b border-white/10`}>
                                            <th className="py-3 px-4">التكرار</th>
                                            {currentChallenge.freqs.map((f, i) => <td key={i} className="py-3 font-bold text-indigo-400">{f}</td>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th className={`py-2 ${theme.textMain}`}>ت م ص</th>
                                            {userValues.map((v, i) => (
                                                <td key={i} className="py-2 px-1">
                                                    <input 
                                                        type="number" value={v} 
                                                        onChange={e => {
                                                            const next = [...userValues];
                                                            next[i] = e.target.value;
                                                            setUserValues(next);
                                                        }}
                                                        className="w-16 bg-black/40 border-2 border-indigo-500/30 rounded-xl text-center p-2 text-indigo-400 outline-none" 
                                                        placeholder="?"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={handleAnswer} className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xl shadow-glow shadow-indigo-500/30 transition-all">تحقق من التراكم</button>
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
                        <button onClick={() => { setPhase('intro'); setUserValues(['','','']); }} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && !reward && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => { setPhase('intro'); setUserValues(['','','']); }} className={`p-2 rounded-full backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
