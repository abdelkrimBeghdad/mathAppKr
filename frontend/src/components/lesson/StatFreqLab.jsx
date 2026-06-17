import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, CheckCircle2, HelpCircle, X, ArrowRight, Table, ListFilter, Hash } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function StatFreqLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [userCounts, setUserCounts] = useState({ 10: '', 12: '', 15: '' });
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ما هو الإحصاء؟',
            detail: 'هو علم جمع وترتيب البيانات لنتمكن من فهمها. أول خطوة هي تحويل "الفوضى" إلى "نظام" باستخدام الجداول.',
            visual: (
                <div className="flex flex-col gap-4 items-center">
                    <div className="p-4 rounded-xl bg-slate-800 border border-white/10 text-xs font-mono grid grid-cols-5 gap-2 max-w-xs">
                        {[10, 12, 10, 15, 12, 10, 10, 15, 12, 10].map((v, i) => (
                            <span key={i} className="p-2 bg-white/5 rounded text-center">{v}</span>
                        ))}
                    </div>
                    <ArrowRight className="text-white rotate-90 md:rotate-0" />
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs w-full">
                        <table className="w-full text-emerald-400">
                             <thead><tr className="border-b border-emerald-500/30"><th>القيمة</th><th>التكرار</th></tr></thead>
                             <tbody><tr><td>10</td><td>5</td></tr></tbody>
                        </table>
                    </div>
                </div>
            )
        }
    ];

    const challenges = [
        { 
            data: [10, 12, 10, 15, 12, 10, 10, 15, 12, 10],
            q: "رتب هذه النقاط في جدول تكراري. كم مرة تكرر الرقم 10، 12، و 15؟",
            correct: { 10: 5, 12: 3, 15: 2 },
            hint: "قم بعد كل رقم بتركيز عالي."
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        const isCorrect = 
            parseInt(userCounts[10]) === currentChallenge.correct[10] &&
            parseInt(userCounts[12]) === currentChallenge.correct[12] &&
            parseInt(userCounts[15]) === currentChallenge.correct[15];

        if (isCorrect) {
            setFeedback({ type: 'success', text: 'رائع! لقد نظمت البيانات بنجاح. هذا هو أساس العمل الإحصائي. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            try {
                const data = await rewardService.claimLabReward('stat-freq-mastery');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setFeedback({ type: 'error', text: 'خطأ في العد. حاول مرة أخرى ببطء.' });
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
                                <Hash size={16} /> تنظيم البيانات
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-white' : 'text-slate-900'}`}>مختبر التكرارات</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {phase === 'learn' ? 'التحليل الإحصائي' : reward ? 'مكتمل' : 'تحدي الجدول'}
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
                                <ListFilter size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تحول الأرقام المبعثرة إلى معلومات مفيدة من خلال تنظيمها في جداول تكرارية واحترافية.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all text-lg">دخول مختبر البيانات</button>
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
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-2xl px-2">
                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center ${theme.card}`}>
                            <h3 className={`text-sm md:text-base font-black mb-3 ${theme.textMain}`}>{currentChallenge.q}</h3>
                            
                            <div className="flex flex-wrap justify-center gap-2 mb-4 p-4 bg-black/30 rounded-2xl border border-white/5">
                                {currentChallenge.data.map((v, i) => (
                                    <span key={i} className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 font-bold">{v}</span>
                                ))}
                            </div>

                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-center border-collapse">
                                    <thead>
                                        <tr className={`${theme.textMain} border-b border-white/10`}>
                                            <th className="py-3 px-4">القيمة (النقطة)</th>
                                            <th className="py-3 px-4">التكرار</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[10, 12, 15].map(val => (
                                            <tr key={val} className="border-b border-white/5">
                                                <td className={`py-2 font-black ${theme.textMain}`}>{val}</td>
                                                <td className="py-2">
                                                    <input 
                                                        type="number" value={userCounts[val]} 
                                                        onChange={e => setUserCounts({...userCounts, [val]: e.target.value})}
                                                        className="w-20 bg-black/40 border-2 border-emerald-500/30 rounded-xl text-center p-2 text-emerald-400 outline-none focus:border-emerald-500" 
                                                        placeholder="0"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={handleAnswer} className="w-full mt-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xl transition-all shadow-glow shadow-emerald-500/30">تأكيد الجدول</button>
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
                        <button onClick={() => { setPhase('intro'); setUserCounts({10:'', 12:'', 15:''}); }} className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && !reward && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => { setPhase('intro'); setUserCounts({10:'', 12:'', 15:''}); }} className={`p-2 rounded-full backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
