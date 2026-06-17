import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, CheckCircle2, Calculator, BookOpen, Pencil, ArrowRight, Play, RefreshCw, Zap as ZapIcon, Sigma, Cpu, Binary, Target, Coins, Send, Rocket, ShieldCheck, Microscope, BrainCircuit, Star, Zap, Split, Layers, Search, HelpCircle, FastForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import MasteryRewardCard from './MasteryRewardCard';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';

const EquationsProductContent = ({ isDarkMode, setLabTitle, setLabPhase }) => {
    const { theme } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [userInput1, setUserInput1] = useState('');
    const [userInput2, setUserInput2] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);
    const [level, setLevel] = useState(1);
    const [challenges, setChallenges] = useState([]);

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const progress = await labProgressService.getOne('equations-product');
                setLevel(difficultyEngine.getLevel(progress));
            } catch (err) {
                console.error(err);
            }
        };
        loadProgress();
    }, []);

    const learnPages = [
        {
            title: 'بروتوكول الانشطار الجبري',
            detail: 'إذا كان حاصل ضرب قوسين يساوي الصفر، فهذا يعني حتماً أن أحد القوسين على الأقل يساوي الصفر.',
            math: 'A \u00d7 B = 0 \u27f6 A = 0 \u2228 B = 0',
            icon: <Split size={20} />
        },
        {
            title: 'تفكيك العوامل المتصلة',
            detail: 'في معادلة مثل (x+3)(x-5)=0، نقوم بشطرها إلى معادلتين بسيطتين وحلهما بشكل مستقل.',
            math: '(x + 3) = 0 \u2223 (x - 5) = 0',
            icon: <Layers size={20} />
        },
        {
            title: 'مجموعة الحلول الثنائية',
            detail: 'المعادلة النهائية تمتلك حلين (جذرين) يحققان التوازن الرقمي. نكتبهما في مجموعة الحلول S.',
            math: 'S = {x\u2081, x\u2082}',
            icon: <ShieldCheck size={20} />
        }
    ];

    const generateProblems = () => {
        // Generate dynamic problems based on level
        const numProblems = Math.min(4 + Math.floor(level / 2), 8);
        const newChallenges = [];
        for (let i = 0; i < numProblems; i++) {
            const a = Math.floor(Math.random() * 10) - 5; // -5 to 4
            const b = Math.floor(Math.random() * 10) - 5;
            
            // To avoid a == b and make them non-zero for simplicity if needed
            let root1 = a === 0 ? 1 : a;
            let root2 = b === root1 ? root1 + 1 : b;
            
            // Format equation (x - root1)(x - root2) = 0
            const formatFactor = (r) => {
                if (r === 0) return 'x';
                return `(x ${r > 0 ? '-' : '+'} ${Math.abs(r)})`;
            };
            
            const q = `${formatFactor(root1)}${formatFactor(root2)} = 0`;
            newChallenges.push({
                q,
                a1: root1.toString(),
                a2: root2.toString(),
                hint: `إما ${formatFactor(root1).replace(/[()]/g, '')} = 0 أو ${formatFactor(root2).replace(/[()]/g, '')} = 0.`
            });
        }
        setChallenges(newChallenges);
        setPhase('practice');
        setChallengeStep(0);
        setUserInput1('');
        setUserInput2('');
        setFeedback(null);
        setShowHint(false);
        setReward(null);
    };

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('معادلات الانشطار');
        } else if (phase === 'learn') {
            setLabTitle(learnPages[learnStep].title);
        } else if (reward) {
            setLabTitle('سيد العوامل!');
        } else {
            setLabTitle(`تحدي ${challengeStep + 1}/${challenges.length}`);
        }
    }, [phase, learnStep, reward, challengeStep, challenges.length, setLabTitle, setLabPhase]);

    const currentChallenge = challenges[challengeStep] || {};

    const validateAnswer = (input, a1, a2) => {
        const clean = input.trim();
        return clean === a1 || clean === a2;
    };

    const handleAnswer = async () => {
        const is1Correct = validateAnswer(userInput1, currentChallenge.a1, currentChallenge.a2);
        const is2Correct = validateAnswer(userInput2, currentChallenge.a1, currentChallenge.a2);

        if (is1Correct && is2Correct && userInput1.trim() !== userInput2.trim()) {
            setFeedback({ type: 'success', text: 'انشطار منطقي ناجح! تم تحديد الجذور بدقة ✓' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            setShowHint(false);
            setUserInput1('');
            setUserInput2('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1500);
            } else {
                await labProgressService.update('equations-product', 'completed', 100);
                rewardService.claimLabReward('equations-product')
                    .then(data => data.status === 'success' && setReward(data))
                    .catch(console.error);
            }
        } else {
            setFeedback({ type: 'error', text: 'فشل الانشطار. تأكد من إدخال كلا الحلين المختلفين.' });
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center min-h-0 relative z-10" dir="rtl">
            {phase === 'intro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-4">
                    <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                         <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>دليل الانشطار الجبري</h3>
                         <p className={`${theme.textSub} text-sm mb-3 font-medium leading-relaxed italic`}>تعلم كيف تفرز العوامل وتحول الضرب المعقد إلى احتمالات بسيطة وقابلة للحل عبر قاعدة الصفر المطلق.</p>
                         <button onClick={() => setPhase('learn')} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">فتح ملف المراجعة</button>
                    </div>
                    <motion.button onClick={generateProblems} className="relative group rounded-[1rem] shadow-2xl overflow-hidden">
                        <div className={`absolute inset-0 bg-indigo-600`} />
                        <div className="relative p-5 flex flex-col items-center justify-center text-white gap-4">
                            <ZapIcon size={20} />
                            <span className="font-black text-xl italic uppercase tracking-widest">ميدان الانشطار</span>
                        </div>
                    </motion.button>
                </div>
            )}

            {phase === 'learn' && (
                <div className="w-full max-w-3xl px-2">
                    <motion.div key={learnStep} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                         <div className="flex flex-col items-center text-center">
                             <div className={`w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3`}>{learnPages[learnStep].icon}</div>
                             <h3 className={`text-sm md:text-base font-black mb-3 tracking-tighter ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                             <p className={`text-sm md:text-lg ${theme.textSub} mb-4 max-w-2xl font-medium`}>{learnPages[learnStep].detail}</p>
                             <div className={`p-6 rounded-2xl border-2 border-indigo-500/30 bg-black/40 w-full`}>
                                 <span className="text-sm md:text-base font-mono font-black text-indigo-400" dir="ltr">{learnPages[learnStep].math}</span>
                             </div>
                         </div>
                    </motion.div>
                    <div className="flex justify-between items-center mt-6 px-4">
                         <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-slate-600 shadow-xl'}`}>السابق</button>
                         {learnStep < learnPages.length - 1 ? (
                             <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black shadow-glow-indigo transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                         ) : (
                             <button onClick={generateProblems} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-glow transition-all flex items-center gap-2">دخول الميدان <ZapIcon size={18} /></button>
                         )}
                    </div>
                </div>
            )}

            {phase === 'practice' && !reward && challenges.length > 0 && (
                <div className="w-full max-w-5xl px-2 overflow-y-auto max-h-full py-2">
                    <div className={`p-6 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden flex flex-col items-center ${theme.card}`}>
                         <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${((challengeStep) / challenges.length) * 100}%` }} className="h-full bg-indigo-500 shadow-glow-indigo transition-all duration-1000" />
                         </div>

                         <div className="text-center w-full space-y-6">
                             <div className="space-y-3">
                                 <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest block italic">تفكيك الجداء المعدوم</span>
                                 <div className="text-xl md:text-xl font-black font-mono text-white tracking-tighter bg-black/20 py-3 rounded-2xl border border-white/5" dir="ltr">
                                     {currentChallenge.q}
                                 </div>
                             </div>

                             <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full max-w-2xl mx-auto">
                                 <div className="flex flex-col gap-2">
                                     <span className="text-slate-500 font-black text-[10px] uppercase italic">الجذر الأول</span>
                                     <div className="flex items-center gap-2 text-base md:text-lg font-black text-white font-mono" dir="ltr">
                                         <span className="opacity-20 text-slate-500 text-lg">x₁=</span>
                                         <input type="text" value={userInput1} onChange={(e) => setUserInput1(e.target.value)} className={`w-16 md:w-24 bg-slate-950 border-2 rounded-xl p-3 text-center text-base md:text-lg font-black outline-none transition-all ${feedback?.type === 'error' ? 'border-rose-500 animate-shake text-rose-400' : 'border-indigo-500/50 text-indigo-400 focus:border-indigo-500 shadow-inner'}`} placeholder="?" autoFocus />
                                     </div>
                                 </div>

                                 <div className="text-slate-800 text-xl font-black italic select-none">أو</div>

                                 <div className="flex flex-col gap-2">
                                     <span className="text-slate-500 font-black text-[10px] uppercase italic">الجذر الثاني</span>
                                     <div className="flex items-center gap-2 text-base md:text-lg font-black text-white font-mono" dir="ltr">
                                         <span className="opacity-20 text-slate-500 text-lg">x₂=</span>
                                         <input type="text" value={userInput2} onChange={(e) => setUserInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-16 md:w-24 bg-slate-950 border-2 rounded-xl p-3 text-center text-base md:text-lg font-black outline-none transition-all ${feedback?.type === 'error' ? 'border-rose-500 animate-shake text-rose-400' : 'border-indigo-500/50 text-indigo-400 focus:border-indigo-500 shadow-inner'}`} placeholder="?" />
                                     </div>
                                 </div>
                             </div>

                             <button onClick={handleAnswer} className="w-full max-w-md py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl shadow-glow-indigo transition-all active:scale-95 flex items-center justify-center gap-4 transition-all mx-auto">
                                 <FastForward size={20} /> تأكيد الانشطار
                             </button>

                             <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-amber-500/50 font-black text-sm mx-auto hover:text-amber-500 transition-all uppercase italic tracking-widest">
                                 <HelpCircle size={18} /> تحليل راداري
                             </button>
                             <AnimatePresence>
                                 {showHint && (
                                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-black/60 border border-amber-500/20 rounded-xl backdrop-blur-md shadow-inner italic">
                                         <p className="text-amber-400 text-sm md:text-lg font-bold">{currentChallenge.hint}</p>
                                     </motion.div>
                                 )}
                             </AnimatePresence>

                             {feedback && (
                                 <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-xl border font-black text-sm text-center ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/10 border-rose-500/40 text-rose-400'}`}>
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
                         <Split size={40} className="mx-auto text-emerald-500 mb-3" />
                         <h3 className="text-base md:text-lg font-black text-white mb-3 tracking-tighter leading-none uppercase italic">Nuclear Mastery</h3>
                         <p className="text-sm md:text-base text-emerald-400 font-bold mb-4 italic opacity-80 leading-relaxed">لقد أتقنت بروتوكول الانشطار الجبري وحل معادلات الجداء المعدوم ببراعة ذرية فائقة.</p>
                         <div className="inline-block px-8 py-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-white text-xl font-black shadow-inner tracking-widest italic">RESOLVED: 100%</div>
                    </motion.div>
                    <MasteryRewardCard reward={reward} />
                    <button onClick={() => { setPhase('intro'); setChallengeStep(0); setReward(null); }} className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl shadow-glow-indigo transition-all">إعادة التفعيل</button>
                </div>
            )}
        </div>
    );
};

export default function EquationsProductLab(props) {
    const [labTitle, setLabTitle] = useState('معادلات الانشطار');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            {...props} 
            labId="equations-product" 
            title={labTitle} 
            phase={labPhase} 
            accentColor="indigo" 
            badgeIcon={Split} 
            badgeText="بروتوكول الجداء المعدوم"
        >
            <EquationsProductContent {...props} setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}

