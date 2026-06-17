import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, CheckCircle2, Calculator, BookOpen, Pencil, ArrowRight, Play, RefreshCw, Zap as ZapIcon, Sigma, Cpu, Binary, Target, Coins, Send, Rocket, ShieldCheck, Microscope, BrainCircuit, Star, Zap, HelpCircle, FastForward, Lightbulb, Trophy, Droplets, FlaskConical, Beaker, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

function gcd(x, y) {
    let a = Math.abs(x);
    let b = Math.abs(y);
    while (b) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

export default function FractionSimplifyLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [userNum, setUserNum] = useState('');
    const [userDen, setUserDen] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'بروتوكول التصفية الرقمية',
            detail: 'تبسيط الكسر يعني البحث عن أصغر صورة ممكنة له دون تغيير قيمته الجوهرية.',
            math: 'a/b \u27f6 Simplified Form',
            icon: <Filter size={20} />
        },
        {
            title: 'خوارزمية القاسم المطلق',
            detail: 'يكون الكسر غير قابل للاختزال إذا كان القاسم المشترك الأكبر بين البسط والمقام يساوي 1.',
            math: 'PGCD(a, b) = 1',
            icon: <ShieldCheck size={20} />
        },
        {
            title: 'عملية التقطير الجبري',
            detail: 'لاختزال كسر، نقسم البسط والمقام على PGCD الخاص بهما لنحصل على "الجوهر" غير القابل للاختزال.',
            math: '(a \u00f7 g) / (b \u00f7 g)',
            icon: <FlaskConical size={20} />
        }
    ];

    const challenges = [
        { num: 24, den: 16 },
        { num: 35, den: 14 },
        { num: 9, den: 10 },
        { num: 48, den: 36 },
        { num: 15, den: 28 },
        { num: 100, den: 75 }
    ];

    const currentChallenge = challenges[challengeStep];
    const currentGCD = currentChallenge ? gcd(currentChallenge.num, currentChallenge.den) : 1;
    const expectedNum = currentChallenge ? currentChallenge.num / currentGCD : 0;
    const expectedDen = currentChallenge ? currentChallenge.den / currentGCD : 0;

    const handleAnswer = async () => {
        const n = parseInt(userNum);
        const d = parseInt(userDen);
        
        if (isNaN(n) || isNaN(d) || d === 0) {
            setFeedback({ type: 'error', text: 'خطأ في المدخلات. تأكد من إدخال أعداد صحيحة.' });
            return;
        }

        if (n === expectedNum && d === expectedDen) {
            setFeedback({ type: 'success', text: 'تقطير مثالي! لقد وصلت للجوهر غير القابل للاختزال ✓' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            setShowHint(false);
            setUserNum('');
            setUserDen('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1500);
            } else {
                rewardService.claimLabReward('fraction-simplify-mastery')
                    .then(data => data.status === 'success' && setReward(data))
                    .catch(console.error);
            }
        } else {
            setFeedback({ type: 'error', text: 'الكسر المكتشف غير دقيق أو يحتاج لمزيد من التصفية.' });
        }
    };

    const theme = {
        container: isDarkMode ? 'bg-slate-950 border-white/5 shadow-3xl' : 'bg-white border-slate-100 shadow-2xl',
        card: isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-100 shadow-xl',
        textMain: isDarkMode ? 'text-white' : 'text-slate-900',
        textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    };

    return (
        <div className={`w-full h-full min-h-[300px] max-h-[85vh] ${theme.container} rounded-[1rem] md:rounded-[1.5rem] p-4 md:p-6 relative overflow-hidden flex flex-col font-sans border transition-all duration-500`} dir="rtl">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-4 pt-2">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-600 border-cyan-100 shadow-sm'}`}>
                                <Droplets size={14} /> معمل التصفية الرقمية
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>تبسيط الكسور</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-600 border-cyan-100'}`}>
                                <FlaskConical size={14} /> نظام التقطير: {phase === 'learn' ? 'التعلم' : reward ? 'اكتمال' : `العيّنة ${challengeStep + 1}/${challenges.length}`}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {phase === 'learn' ? learnPages[learnStep].title : reward ? 'كيميائي الكسور البارع!' : 'استخرج الجوهر الرياضي'}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                             <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>دليل المختبر:</h3>
                             <div className="space-y-3">
                                 {learnPages.map((p, i) => (
                                     <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 transition-all">
                                         <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xs">{i + 1}</div>
                                         <h4 className="text-white font-bold text-xs">{p.title}</h4>
                                     </div>
                                 ))}
                             </div>
                             <button onClick={() => setPhase('learn')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">فتح ملف التعليمات</button>
                        </div>
                        <motion.button onClick={() => setPhase('practice')} className="relative group rounded-[1rem] shadow-2xl overflow-hidden">
                            <div className={`absolute inset-0 bg-cyan-600`} />
                            <div className="relative p-5 flex flex-col items-center justify-center text-white gap-4">
                                <FlaskConical size={20} />
                                <span className="font-black text-xl italic uppercase tracking-widest">تشغيل المقطر</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-6 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="flex flex-col items-center text-center">
                                 <div className={`w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3`}>{learnPages[learnStep].icon}</div>
                                 <h3 className={`text-sm md:text-base font-black mb-3 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                 <p className={`text-sm md:text-lg ${theme.textSub} mb-4 max-w-2xl font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                                 <div className={`p-6 rounded-2xl border-2 border-cyan-500/30 bg-black/40 w-full mb-3`}>
                                     <span className="text-xl md:text-2xl font-mono font-black text-cyan-400" dir="ltr">{learnPages[learnStep].math}</span>
                                 </div>
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                             {learnStep < 2 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black shadow-glow transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-glow transition-all flex items-center gap-2">بدء التحدي <ZapIcon size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="w-full max-w-4xl px-2 overflow-y-auto max-h-full py-2">
                        <div className={`p-6 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="text-center space-y-6">
                                 <div className="flex flex-col items-center gap-2 text-base md:text-lg font-black font-mono text-white drop-shadow-glow" dir="ltr">
                                     <span>{currentChallenge.num}</span>
                                     <div className="w-16 md:w-24 h-1.5 bg-white/20 rounded-full" />
                                     <span>{currentChallenge.den}</span>
                                 </div>

                                 <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full">
                                     <div className="flex flex-col items-center gap-2">
                                         <input type="number" value={userNum} onChange={(e) => setUserNum(e.target.value)} className={`w-24 md:w-32 bg-slate-950 border-2 rounded-2xl p-4 text-center text-base md:text-lg font-black outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-cyan-500/50 text-cyan-400 focus:border-cyan-500 shadow-inner'}`} placeholder="?" autoFocus dir="ltr" />
                                         <div className="w-16 md:w-24 h-1 bg-slate-800 rounded-full" />
                                         <input type="number" value={userDen} onChange={(e) => setUserDen(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-24 md:w-32 bg-slate-950 border-2 rounded-2xl p-4 text-center text-base md:text-lg font-black outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-cyan-500/50 text-cyan-400 focus:border-cyan-500 shadow-inner'}`} placeholder="?" dir="ltr" />
                                     </div>
                                     <button onClick={handleAnswer} className="p-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-3xl shadow-glow-cyan transition-all active:scale-95"><Send size={20} /></button>
                                 </div>

                                 <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-cyan-500/50 font-black text-xs mx-auto hover:text-cyan-400 transition-all uppercase italic tracking-widest">
                                     <HelpCircle size={16} /> طلب مساعدة تقطيرية
                                 </button>
                                 <AnimatePresence>
                                     {showHint && (
                                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-black/60 border border-cyan-500/20 rounded-xl text-center text-cyan-400 font-bold text-sm italic">
                                             {currentGCD === 1 ? "الكسر غير قابل للاختزال! أعد كتابة نفس الأرقام." : `اقسم البسط والمقام على PGCD وهو ${currentGCD}.`}
                                         </motion.div>
                                     )}
                                 </AnimatePresence>

                                 {feedback && (
                                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl border-2 font-black text-sm text-center ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/10 border-rose-100 text-rose-400'}`}>
                                         {feedback.text}
                                     </motion.div>
                                 )}
                             </div>
                        </div>
                    </div>
                )}

                {reward && (
                    <div className="w-full max-w-4xl z-20 text-center px-4 overflow-y-auto max-h-full">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="border-2 rounded-[1.5rem] p-5 shadow-glow-emerald mb-3 backdrop-blur-3xl relative overflow-hidden bg-emerald-500/10 border-emerald-500/40">
                             <Beaker size={40} className="mx-auto text-emerald-500 mb-3 drop-shadow-glow" />
                             <h3 className="text-base md:text-lg font-black text-white mb-4 uppercase tracking-tighter italic">Master Distiller</h3>
                             <p className="text-sm md:text-base text-emerald-400 font-bold mb-4 italic opacity-80 leading-relaxed">لقد أتممت بروتوكول التصفية الرقمية بنجاح وأتقنت فن تبسيط الكسور.</p>
                             <div className="inline-block px-10 py-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-white text-xl font-black shadow-inner tracking-widest italic">PURITY: 100%</div>
                        </motion.div>
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setReward(null); }} className="mt-6 w-full py-2 bg-cyan-600 hover:bg-cyan-600 text-white rounded-2xl font-black text-xl shadow-3xl transition-all">إعادة التفعيل</button>
                    </div>
                )}
            </div>

            {phase !== 'intro' && !reward && (
                <div className="absolute bottom-4 right-4 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={14} className="text-cyan-400" /> <span>الرجوع</span>
                    </button>
                </div>
            )}
        </div>
    );
}
