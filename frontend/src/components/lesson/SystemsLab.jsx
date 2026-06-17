import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, HelpCircle, ArrowRight, RotateCcw, Network, Layers, Sigma, Cpu, Link as LinkIcon, BookOpen, Target, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function SystemsContent({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [userInputX, setUserInputX] = useState('');
    const [userInputY, setUserInputY] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [score, setScore] = useState(0);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        labProgressService.getOne('systems-mastery')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'بروتوكول المزامنة',
            detail: 'جملة معادلتين هي نظام يتطلب إيجاد قيم x و y التي تحقق توازن المعادلتين معاً في نفس اللحظة.',
            math: '\\begin{cases} ax + by = c \\\\ a\'x + b\'y = c\' \\end{cases}',
            icon: <Network size={20} />
        },
        {
            title: 'خوارزمية التعويض',
            detail: 'نستخرج قيمة أحد المجاهيل بدلالة الآخر من المعادلة الأولى، ثم نحقنها في المعادلة الثانية.',
            math: 'y = c - ax ➔ a\'x + b\'(c-ax) = c\'',
            icon: <Layers size={20} />
        },
        {
            title: 'خوارزمية الجمع',
            detail: 'نقوم بموازنة المعاملات وجمع المعادلتين طرفاً لطرف ليختفي أحد المجاهيل آلياً.',
            math: '(ax + by) + (a\'x - by) = c + c\'',
            icon: <Sigma size={20} />
        }
    ];

    const challenges = [
        {
            q: '\\begin{cases} x + y = 3 \\\\ x + 2y = 4 \\end{cases}',
            x: '2', y: '1',
            hint: 'من الأولى: x = 3 - y. عوضها في الثانية.'
        },
        {
            q: '\\begin{cases} -2x + y = 0 \\\\ 3x - y = 4 \\end{cases}',
            x: '4', y: '8',
            hint: 'اجمع المعادلتين مباشرة للتخلص من y.'
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (userInputX.trim() === currentChallenge.x && userInputY.trim() === currentChallenge.y) {
            setScore(score + 1);
            setFeedback({ type: 'success', text: 'تمت المزامنة بنجاح! الثنائية صحيحة ✓' });
            confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
            setShowHint(false);

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setUserInputX('');
                    setUserInputY('');
                    setFeedback(null);
                }, 1500);
            } else {
                setIsCompleted(true);
                try {
                    await labProgressService.update('systems-mastery', 'completed', 100);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ في الربط المنطقي. تحقق من الحسابات.' });
        }
    };

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('جمل المعادلات');
        } else if (phase === 'learn') {
            setLabTitle(learnPages[learnStep].title);
        } else if (isCompleted) {
            setLabTitle('اكتمال المزامنة');
        } else {
            setLabTitle(`النظام ${challengeStep + 1}/${challenges.length}`);
        }
    }, [phase, learnStep, isCompleted, challengeStep, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 w-full overflow-hidden px-4" dir="rtl">
            {phase === 'intro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                    <div className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-3xl transition-all shadow-2xl ${theme.card}`}>
                         <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-[1rem] flex items-center justify-center text-white mb-3 shadow-xl"><BookOpen size={20} /></div>
                         <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>دليل الربط:</h3>
                         <p className={`${theme.textSub} text-xl mb-4 font-medium italic`}>تعلم خوارزميات الجمع والتعويض وكيفية تطبيقهما على الأنظمة المزدوجة.</p>
                         <button onClick={() => setPhase('learn')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all border border-white/10 shadow-lg text-xl">فتح الدليل</button>
                    </div>
                    <motion.button onClick={() => setPhase('practice')} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                        <div className={`absolute inset-0 bg-gradient-to-br from-cyan-600 via-indigo-600 to-cyan-900 transition-transform duration-500 group-hover:scale-110`} />
                        <div className="relative p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 text-white">
                            <LinkIcon size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                            <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">تفعيل النظام</span>
                        </div>
                    </motion.button>
                </div>
            )}

            {phase === 'learn' && (
                <div className="w-full max-w-4xl px-2">
                    <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                         <div className="flex flex-col items-center text-center">
                             <div className={`w-20 h-20 rounded-3xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 shadow-inner`}>{learnPages[learnStep].icon}</div>

                             <p className={`text-sm md:text-base ${theme.textSub} mb-3 max-w-2xl font-medium leading-relaxed italic`}>{learnPages[learnStep].detail}</p>
                             <div className={`p-5 rounded-[1.5rem] border-2 bg-white/5 border-white/10 shadow-inner w-full`}>
                                 <span className="text-xl md:text-2xl font-mono font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]" dir="ltr">{learnPages[learnStep].math}</span>
                             </div>
                         </div>
                    </motion.div>
                    <div className="flex justify-between items-center mt-3 px-6">
                         <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-2xl font-black transition-all ${isDarkMode ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                         {learnStep < 2 ? (
                             <button onClick={() => setLearnStep(l => l + 1)} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-2xl font-black shadow-xl text-xl">التالي</button>
                         ) : (
                             <button onClick={() => setPhase('practice')} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-black shadow-xl text-xl">بدء المزامنة</button>
                         )}
                    </div>
                </div>
            )}

            {phase === 'practice' && !isCompleted && (
                <div className="w-full max-w-5xl px-2">
                    <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                         <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10 opacity-30" />
                         <div className="relative z-10 flex flex-col items-center">
                             <div className="flex justify-between w-full mb-12">
                                 <div className="px-6 py-2 rounded-full bg-cyan-500/20 text-cyan-400 font-black text-sm border border-cyan-500/30 italic uppercase tracking-widest">System {challengeStep + 1}/{challenges.length}</div>
                                 <div className="flex gap-3">
                                     {challenges.map((_, i) => (
                                         <div key={i} className={`w-4 h-4 rounded-full transition-all duration-500 ${i < challengeStep ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : i === challengeStep ? 'bg-cyan-500 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-white/10'}`} />
                                     ))}
                                 </div>
                             </div>

                             <div className="text-center w-full space-y-12">
                                 <div className="space-y-6">
                                     <p className="text-white/20 font-black text-xl italic uppercase tracking-widest">تحليل الجملة الحالية:</p>
                                     <div className="text-2xl md:text-8xl font-black font-mono text-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]" dir="ltr">{currentChallenge.q}</div>
                                 </div>

                                 <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-20">
                                     <div className="flex flex-col gap-3">
                                         <span className="text-white/20 font-black text-sm uppercase tracking-widest italic">Variable x</span>
                                         <div className="flex items-center gap-3">
                                             <span className="text-white/40 font-mono text-xl font-black italic">x =</span>
                                             <input type="text" value={userInputX} onChange={(e) => setUserInputX(e.target.value)} className="w-32 md:w-44 bg-white/5 border-4 border-cyan-500/30 rounded-[1rem] py-3 text-center text-xl font-black outline-none focus:border-cyan-500 transition-all text-cyan-400 shadow-inner" placeholder="?" autoFocus />
                                         </div>
                                     </div>
                                     <div className="flex flex-col gap-3">
                                         <span className="text-white/20 font-black text-sm uppercase tracking-widest italic">Variable y</span>
                                         <div className="flex items-center gap-3">
                                             <span className="text-white/40 font-mono text-xl font-black italic">y =</span>
                                             <input type="text" value={userInputY} onChange={(e) => setUserInputY(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className="w-32 md:w-44 bg-white/5 border-4 border-cyan-500/30 rounded-[1rem] py-3 text-center text-xl font-black outline-none focus:border-cyan-500 transition-all text-cyan-400 shadow-inner" placeholder="?" />
                                         </div>
                                     </div>
                                 </div>

                                 {feedback && (
                                     <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-3xl font-black text-xl italic ${feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-2 border-rose-500/30'}`}>
                                         {feedback.text}
                                     </motion.div>
                                 )}

                                 <button onClick={handleAnswer} className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"><Check size={40} /> تأكيد الثنائية</button>

                                 <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-3 text-amber-500/40 font-black text-xl mx-auto hover:text-amber-400 transition-all uppercase italic tracking-widest">
                                     <HelpCircle size={20} /> طلب تلميح مزامنة
                                 </button>
                                 <AnimatePresence>
                                     {showHint && (
                                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-5 bg-white/5 border-2 border-amber-500/20 rounded-[1.5rem] shadow-inner overflow-hidden">
                                             <p className="text-amber-400 text-base md:text-lg font-black leading-relaxed italic drop-shadow-[0_0_10px_rgba(251,191,36,0.2)]">{currentChallenge.hint}</p>
                                         </motion.div>
                                     )}
                                 </AnimatePresence>
                             </div>
                         </div>
                    </div>
                </div>
            )}

            {isCompleted && (
                <div className="w-full max-w-5xl z-20 text-center px-4">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="border-4 rounded-[1.5rem] p-16 shadow-2xl backdrop-blur-3xl relative overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/40">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                         <Network size={120} className="mx-auto text-emerald-400 mb-3 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                         <h3 className="text-xl md:text-[6rem] font-black text-white mb-4 tracking-tighter leading-none uppercase italic">Architecte de Systèmes</h3>
                         <p className="text-base md:text-lg text-emerald-400 font-black mb-12 italic drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">لقد أتقنت فن الربط والمزامنة الجبرية وحل جمل المعادلات ببراعة هندسية.</p>
                         <div className="inline-block px-14 py-3 bg-emerald-500/30 rounded-[1rem] border-2 border-emerald-500/40 text-white text-2xl font-black shadow-inner tracking-widest">SYNC LEVEL: MAXIMUM</div>
                    </motion.div>
                    <button onClick={() => {
                        setPhase('intro');
                        setChallengeStep(0);
                        setIsCompleted(false);
                        setScore(0);
                        setUserInputX('');
                        setUserInputY('');
                        setFeedback(null);
                    }} className="mt-12 w-full py-10 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl transition-all active:scale-95">إعادة تفعيل المزامنة</button>
                </div>
            )}
        </div>
    );
}

export default function SystemsLab() {
    const [labTitle, setLabTitle] = useState('جمل المعادلات');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            labId="systems-mastery" 
            accentColor="cyan"
            badgeText="بروتوكول المزامنة"
            badgeIcon={LinkIcon}
            title={labTitle}
            phase={labPhase}
        >
            <SystemsContent setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
