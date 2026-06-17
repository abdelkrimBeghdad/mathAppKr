import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Send, Lightbulb, Trophy, AlertCircle, RefreshCw, BookOpen, Pencil, HelpCircle, ArrowRight, Target, Zap as ZapIcon, Cpu, Binary, Sigma, Search, Microscope, BrainCircuit, ListChecks } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function DivisorDiscovery({ target = 36, isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [factorA, setFactorA] = useState('');
    const [factorB, setFactorB] = useState('');
    const [foundPairs, setFoundPairs] = useState([]);
    const [currentAttempt, setCurrentAttempt] = useState({ factor: 1, status: 'idle' });
    const [feedback, setFeedback] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [showStopChallenge, setShowStopChallenge] = useState(false);
    const [divisors, setDivisors] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const learnTarget = 12;
    const learnContent = [
        { title: 'بروتوكول البداية', math: '12 = 1 \u00d7 12', detail: 'نبدأ دائماً بالعدد 1 كأول قاسم، ومقابله العدد نفسه.', icon: <Target size={20} /> },
        { title: 'التسلسل المنطقي', math: '12 = 2 \u00d7 6', detail: 'ننتقل للعدد 2 ونبحث عن مكمّله بالضرب.', icon: <Binary size={20} /> },
        { title: 'نقطة الانعطاف', math: '12 = 3 \u00d7 4', detail: 'نستمر حتى نجد أن العدد التالي (4) قد ظهر مسبقاً، هنا نتوقف.', icon: <RotateCcw size={20} /> }
    ];

    const handleCheck = () => {
        const a = parseInt(factorA);
        const b = parseInt(factorB);
        if (isNaN(a) || isNaN(b)) return;

        if (a * b !== target) {
            setFeedback({ type: 'error', text: `الجداء ${a} \u00d7 ${b} = ${a * b} لا يساوي ${target}. حاول مرة أخرى!` });
            return;
        }
        if (a !== currentAttempt.factor) {
            setFeedback({ type: 'hint', text: `من الأفضل تجربة الأعداد بالتسلسل. لنحاول مع العدد ${currentAttempt.factor}.` });
            return;
        }

        const newPairs = [...foundPairs, { a, b }];
        setFoundPairs(newPairs);
        setFactorA('');
        setFactorB('');
        setShowHint(false);
        setFeedback({ type: 'success', text: `ممتاز! ${a} \u00d7 ${b} = ${target}. تم اكتشاف زوج جديد!` });

        const nextFactor = currentAttempt.factor + 1;
        checkNextStep(nextFactor, newPairs);
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
    };

    const checkNextStep = (nextA, currentPairs) => {
        const repeated = currentPairs.find(p => p.b === nextA || p.a === nextA);
        if (repeated) {
            if (nextA * (target / nextA) === target) {
                setShowStopChallenge(true);
            } else {
                setCurrentAttempt({ factor: nextA, status: 'idle' });
            }
        } else {
            if (target % nextA === 0) {
                setCurrentAttempt({ factor: nextA, status: 'idle' });
            } else {
                const q = Math.floor(target / nextA);
                const r = target % nextA;
                setFeedback({ type: 'explanation', text: `العدد ${nextA} ليس قاسماً لـ ${target} لأن الباقي (${r}) ليس معدوماً.` });
                checkNextStep(nextA + 1, currentPairs);
            }
        }
    };

    const handleStopDecision = async (decision) => {
        if (decision === 'stop') {
            setIsFinished(true);
            setShowStopChallenge(false);
            const allDivs = Array.from(new Set(foundPairs.flatMap(p => [p.a, p.b]))).sort((x, y) => x - y);
            setDivisors(allDivs);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            try {
                const data = await rewardService.claimLabReward('divisor-discovery');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setFeedback({ type: 'error', text: 'فكر جيداً! لقد بدأنا نكرر نفس الأعداد التي وجدناها سابقاً.' });
        }
    };

    const theme = {
        container: isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-100 shadow-2xl',
        textMain: isDarkMode ? 'text-white' : 'text-slate-900',
        textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
        card: isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-100 shadow-xl',
    };

    return (
        <div className={`w-full h-full min-h-[300px] max-h-[85vh] ${theme.container} rounded-[1rem] md:rounded-[1.5rem] p-4 md:p-6 relative overflow-hidden flex flex-col font-sans border transition-all duration-500`} dir="rtl">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-4 pt-4 md:pt-0">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-4 border backdrop-blur-md ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'}`}>
                                <Search size={16} /> بروتوكول التنقيب عن القواسم
                            </div>
                            <h2 className={`text-2xl md:text-xl lg:text-xl font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white' : 'text-slate-900'}`}>اكتشاف القواسم الكلي</h2>
                            <p className={`${theme.textSub} mt-4 text-sm md:text-lg font-medium max-w-2xl mx-auto italic`}>ابحث عن جميع أزواج الضرب الممكنة لتكوين العدد واستخلص القائمة النهائية للقواسم.</p>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-4 border ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                <Cpu size={16} /> وحدة الاكتشاف: {isFinished ? 'اكتمال المهمة' : `البحث عن الزوج ${foundPairs.length + 1}`}
                            </div>
                            <h2 className={`text-xl md:text-2xl font-black tracking-tighter leading-none px-4 ${theme.textMain}`}>
                                {isFinished ? 'تم استخراج القواسم بنجاح!' : `أوجد قواسم العدد (${target})`}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full px-4">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl px-4">
                        <div className={`group relative p-4 md:p-6 rounded-[1.5rem] text-right transition-all border backdrop-blur-3xl overflow-hidden ${theme.card}`}>
                             <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-3 shadow-glow transition-transform group-hover:rotate-12"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>خريطة الاكتشاف:</h3>
                             <p className={`${theme.textSub} text-lg mb-4 font-medium`}>تعلم استراتيجية "أزواج الضرب" لتحديد جميع القواسم دون نسيان أي منها.</p>
                             <button onClick={() => setPhase('learn')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black transition-all">بدء الرحلة</button>
                        </div>
                        <motion.button onClick={() => setPhase('practice')} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem]">
                            <div className={`absolute inset-0 transition-transform duration-500 group-hover:scale-110 ${isDarkMode ? 'bg-gradient-to-br from-amber-600 to-orange-900' : 'bg-gradient-to-br from-amber-500 to-amber-600'}`} />
                            <div className="relative p-5 md:p-16 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Search size={20} className="md:w-24 md:h-24 animate-pulse" />
                                <span className="text-base md:text-lg font-black tracking-tighter">تفعيل الرادار</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-4xl">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-8 md:p-16 rounded-[1.5rem] md:rounded-[1.5rem] border-2 shadow-3xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="flex flex-col items-center text-center">
                                 <div className={`w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3`}>{learnContent[learnStep].icon}</div>
                                 <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnContent[learnStep].title}</h3>
                                 <p className={`text-lg md:text-2xl ${theme.textSub} mb-12 max-w-2xl font-medium leading-relaxed`}>{learnContent[learnStep].detail}</p>
                                 <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 border-amber-500/30 bg-slate-950/50 mb-3 w-full`}>
                                     <span className="text-xl md:text-xl font-mono font-black text-amber-400" dir="ltr">{learnContent[learnStep].math}</span>
                                 </div>
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-12 px-8">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-2xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                             {learnStep < 2 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-glow transition-all flex items-center gap-2">التالي <ArrowRight size={20} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-glow transition-all flex items-center gap-2">ابدأ البحث <Search size={20} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !isFinished && (
                    <div className="flex flex-col items-center w-full max-w-5xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mb-12" dir="ltr">
                            <AnimatePresence>
                                {foundPairs.map((pair, i) => (
                                    <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 text-center font-black text-2xl text-amber-500 shadow-glow-amber">
                                        {pair.a} \u00d7 {pair.b} = {target}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {!showStopChallenge ? (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-2xl p-5 rounded-[1.5rem] border-2 border-white/5 shadow-3xl mb-12 backdrop-blur-3xl ${theme.card}`}>
                                <div className="text-center mb-4">
                                     <div className="text-amber-500 font-black mb-2 text-xl italic uppercase tracking-widest">المحاولة الحالية:</div>
                                     <div className="text-base md:text-lg font-black font-mono text-white" dir="ltr">{target} = {currentAttempt.factor} \u00d7 ?</div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 justify-center" dir="ltr">
                                    <input type="number" value={factorA} onChange={(e) => setFactorA(e.target.value)} placeholder="?" className="w-24 md:w-32 bg-slate-950 border-4 border-amber-500/50 rounded-2xl p-4 text-center text-xl font-black text-amber-400 outline-none" />
                                    <Sigma className="text-slate-800" size={20} />
                                    <input type="number" value={factorB} onChange={(e) => setFactorB(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} placeholder="?" className="w-24 md:w-32 bg-slate-950 border-4 border-amber-500/50 rounded-2xl p-4 text-center text-xl font-black text-amber-400 outline-none" />
                                    <button onClick={handleCheck} className="p-4 bg-amber-500 hover:bg-amber-600 rounded-2xl text-white shadow-glow transition-all"><Send size={20} className="rotate-180" /></button>
                                </div>

                                <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-amber-500/60 font-black text-sm mx-auto mt-4 hover:text-amber-500 transition-colors uppercase italic">
                                    <HelpCircle size={16} /> تلميح استكشافي
                                </button>
                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-6 bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl text-center font-black text-lg text-amber-400" dir="ltr">
                                            {target % currentAttempt.factor === 0 ? `${target} \u00f7 ${currentAttempt.factor} = ${target / currentAttempt.factor}` : `${target} لا يقبل القسمة على ${currentAttempt.factor}`}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`w-full max-w-2xl p-12 rounded-[1.5rem] border-4 border-rose-500/40 shadow-glow-rose text-center backdrop-blur-3xl ${theme.card}`}>
                                <AlertCircle size={20} className="mx-auto text-rose-500 mb-4 animate-pulse" />
                                <h3 className="text-xl font-black text-white mb-3 tracking-tighter">تحذير: تكرار البيانات!</h3>
                                <p className="text-xl text-slate-400 mb-3 font-medium leading-relaxed">لقد بدأت الأرقام بالتكرار في الاتجاه المعاكس. هل تعتقد أننا وجدنا جميع القواسم الممكنة؟</p>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <button onClick={() => handleStopDecision('stop')} className="px-10 py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-3xl font-black text-xl shadow-glow-rose transition-all">نعم، نتوقف هنا</button>
                                    <button onClick={() => handleStopDecision('continue')} className="px-10 py-5 bg-slate-800 text-slate-400 rounded-3xl font-black text-xl transition-all border border-white/5">لا، واصل البحث</button>
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {feedback && (
                                <motion.div key={feedback.text} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`mt-4 p-6 rounded-3xl border-2 flex items-center gap-4 w-full max-w-2xl ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                                    {feedback.type === 'success' ? <Trophy size={20} /> : <Lightbulb size={20} />}
                                    <p className="font-black text-sm md:text-base">{feedback.text}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {isFinished && (
                    <div className="w-full max-w-4xl text-center px-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`border-4 rounded-[1.5rem] p-12 shadow-glow-emerald mb-3 backdrop-blur-3xl relative overflow-hidden ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white border-emerald-500 shadow-2xl'}`}>
                             <Trophy size={40} className="mx-auto text-emerald-500 mb-4" />
                             <h3 className="text-2xl md:text-8xl font-black text-white mb-4 tracking-tighter leading-none">مُنقب القواسم الخبير</h3>
                             <div className="p-8 bg-slate-950/50 rounded-3xl border-2 border-emerald-500/20 mb-4">
                                 <div className="text-emerald-400 text-xl md:text-xl font-mono font-black tracking-tighter" dir="ltr">
                                     {"{ " + divisors.join(", ") + " }"}
                                 </div>
                             </div>
                             <p className="text-sm md:text-base text-emerald-400/60 font-bold italic uppercase tracking-widest">Mission Accomplished</p>
                        </motion.div>
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => setPhase('intro')} className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-[1.5rem] font-black text-2xl shadow-3xl transition-all active:scale-95">استكشاف عدد آخر</button>
                    </div>
                )}
            </div>

            {phase !== 'intro' && !isFinished && (
                <div className="absolute bottom-10 right-10 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-[1rem] font-black text-sm flex items-center gap-3 backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-xl'}`}>
                        <RotateCcw size={20} className="text-amber-500" /> <span>غرفة التحكم</span>
                    </button>
                </div>
            )}
        </div>
    );
}
