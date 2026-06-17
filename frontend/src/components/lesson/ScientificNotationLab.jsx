import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, CheckCircle2, Calculator, BookOpen, Pencil, ArrowRight, Play, RefreshCw, Zap as ZapIcon, Sigma, Cpu, Binary, Target, Coins, Send, Rocket, ShieldCheck, Microscope, BrainCircuit, Star, Zap, HelpCircle, FastForward, Lightbulb, Trophy, Search, Layers, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function ScientificNotationLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [userInput, setUserInput] = useState({ a: '', n: '' });
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'بروتوكول الضغط العلمي',
            detail: 'الكتابة العلمية هي شفرة لتبسيط الأعداد الضخمة أو المتناهية في الصغر لتسهيل قراءتها ومعالجتها.',
            math: 'a \u00d7 10\u207f',
            icon: <Microscope size={20} />
        },
        {
            title: 'معيار المعامل الذهبي',
            detail: 'يجب أن يكون المعامل a عدداً عشرياً يحمل رقماً واحداً فقط غير معدوم قبل الفاصلة.',
            math: '1 \u2264 a < 10',
            icon: <Target size={20} />
        },
        {
            title: 'خوارزمية ملاحقة الأصفار',
            detail: 'نحرك الفاصلة لليسار ليكون الأس موجباً (أعداد كبيرة)، ولليمين ليكون الأس سالباً (أعداد صغيرة).',
            math: 'Shift Left \u27f6 n+ | Shift Right \u27f6 n-',
            icon: <Crosshair size={20} />
        }
    ];

    const challenges = [
        { q: '45000', a: '4.5', n: '4', hint: 'حرك الفاصلة 4 مراتب لليسار حتى تصل لـ 4.5.' },
        { q: '0.00072', a: '7.2', n: '-4', hint: 'حرك الفاصلة 4 مراتب لليمين، الأس سيكون سالباً.' },
        { q: '125.8', a: '1.258', n: '2', hint: 'حرك الفاصلة مرتبتين لليسار ليصبح لديك رقم واحد قبل الفاصلة.' },
        { q: '0.09', a: '9', n: '-2', hint: 'حرك الفاصلة مرتبتين لليمين لتصل للعدد 9.' },
        { q: '1000000', a: '1', n: '6', hint: 'المليون هو 10 مرفوع للقوة 6.' }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (userInput.a.trim() === currentChallenge.a && userInput.n.trim() === currentChallenge.n) {
            setFeedback({ type: 'success', text: 'تمت المعالجة العلمية بنجاح! تطابق رقمي مثالي ✓' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            setShowHint(false);
            setUserInput({ a: '', n: '' });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1500);
            } else {
                rewardService.claimLabReward('scientific-notation-mastery')
                    .then(data => data.status === 'success' && setReward(data))
                    .catch(console.error);
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ في معايير الكتابة. تأكد من قيمة a ومن عدد المراتب n.' });
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="text-center z-10 mb-3 pt-4 md:pt-0">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-4 border backdrop-blur-md ${isDarkMode ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-orange-50 text-orange-600 border-orange-100 shadow-sm'}`}>
                                <Microscope size={16} /> الماسح الضوئي العلمي
                            </div>
                            <h2 className={`text-2xl md:text-xl lg:text-2xl font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-white' : 'text-slate-900'}`}>الكتابة العلمية</h2>
                            <p className={`${theme.textSub} mt-4 text-sm md:text-lg font-medium max-w-2xl mx-auto italic`}>حول الأرقام الفلكية والذرية إلى صيغ علمية رشيقة باستخدام خوارزمية ملاحقة الفواصل الرقمية.</p>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-4 border ${isDarkMode ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                <Search size={16} /> نظام الفحص: {phase === 'learn' ? 'التحليل التقني' : reward ? 'اكتمال المسح' : `العدد ${challengeStep + 1} من ${challenges.length}`}
                            </div>
                            <h2 className={`text-xl md:text-2xl font-black tracking-tighter leading-none px-4 ${theme.textMain}`}>
                                {phase === 'learn' ? learnPages[learnStep].title : reward ? 'خبير المقاييس العلمية!' : 'حول العدد للصيغة العلمية'}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full px-4">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-6xl">
                        <div className={`group relative p-4 md:p-6 rounded-[1.5rem] text-right transition-all border backdrop-blur-3xl overflow-hidden ${theme.card}`}>
                             <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center text-white mb-4 shadow-glow transition-transform group-hover:rotate-12"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-4 tracking-tighter ${theme.textMain}`}>بروتوكول التشفير</h3>
                             <p className={`${theme.textSub} text-lg mb-3 font-medium leading-relaxed italic`}>اكتشف كيف يختزل العلماء المسافات الكونية وأحجام الجسيمات في صيغ رياضية بسيطة وقوية.</p>
                             <button onClick={() => setPhase('learn')} className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all border border-white/10 w-full text-center">بدء جلسة المعايرة</button>
                        </div>
                        <motion.button onClick={() => setPhase('practice')} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-3xl">
                            <div className={`absolute inset-0 transition-transform duration-500 group-hover:scale-110 ${isDarkMode ? 'bg-gradient-to-br from-orange-600 to-amber-900 shadow-glow-orange' : 'bg-gradient-to-br from-orange-500 to-orange-600'}`} />
                            <div className="relative p-4 md:p-5 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Search size={40} className="md:w-12 md:h-12 animate-pulse text-orange-200" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">تفعيل الماسح</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-4xl">
                        <motion.div key={learnStep} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-5 md:p-20 rounded-[1.5rem] border-2 shadow-3xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="flex flex-col items-center text-center">
                                 <div className={`w-20 h-20 rounded-3xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3`}>{learnPages[learnStep].icon}</div>
                                 <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                 <p className={`text-lg md:text-2xl ${theme.textSub} mb-14 max-w-2xl font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                                 <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 border-orange-500/30 bg-black/40 mb-3 w-full shadow-inner`}>
                                     <span className="text-xl md:text-xl font-mono font-black text-orange-400" dir="ltr">{learnPages[learnStep].math}</span>
                                 </div>
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-12 px-8">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-10 py-5 rounded-2xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 shadow-xl'}`}>السابق</button>
                             {learnStep < 2 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-12 py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black shadow-glow-orange transition-all flex items-center gap-2 text-xl">التالي <ArrowRight size={20} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-12 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-glow transition-all flex items-center gap-2 text-xl">بدء المسح <ZapIcon size={20} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="w-full max-w-5xl">
                        <div className={`p-5 md:p-16 rounded-[4.5rem] border-2 shadow-3xl backdrop-blur-3xl relative overflow-hidden flex flex-col items-center ${theme.card}`}>
                             <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${((challengeStep) / challenges.length) * 100}%` }} className="h-full bg-orange-500 shadow-glow-orange transition-all duration-1000" />
                             </div>

                             <div className="w-full flex justify-between items-center mb-16 px-4">
                                 <div className="text-orange-500 font-black tracking-[0.3em] uppercase italic text-sm">Target: Scientific Compression</div>
                                 <div className="text-slate-500 font-black font-mono">Stage {challengeStep + 1}/{challenges.length}</div>
                             </div>

                             <div className="text-center w-full space-y-12">
                                 <div className="space-y-6">
                                     <span className="text-slate-500 font-black text-xs uppercase tracking-[0.4em] mb-4 block italic">العدد الخام المكتشف</span>
                                     <div className="text-2xl md:text-xl font-black font-mono text-white drop-shadow-glow tracking-tighter bg-black/20 py-10 rounded-[1.5rem] border border-white/5" dir="ltr">
                                         {currentChallenge.q}
                                     </div>
                                 </div>

                                 <div className="flex flex-col md:flex-row justify-center items-center gap-3 w-full max-w-4xl mx-auto" dir="ltr">
                                     <input type="text" value={userInput.a} onChange={(e) => setUserInput({ ...userInput, a: e.target.value })} className={`w-36 md:w-56 bg-slate-950 border-4 rounded-[1.5rem] p-6 text-center text-base md:text-lg font-black outline-none transition-all ${error ? 'border-rose-500 animate-shake shadow-glow-rose text-rose-400' : 'border-orange-500/50 text-orange-400 focus:border-orange-500 shadow-inner'}`} placeholder="a" autoFocus />
                                     <div className="text-white text-xl md:text-8xl font-black opacity-20 hover:opacity-100 transition-opacity select-none">\u00d7 10</div>
                                     <div className="relative">
                                         <input type="text" value={userInput.n} onChange={(e) => setUserInput({ ...userInput, n: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-28 md:w-40 bg-slate-950 border-4 rounded-[1rem] p-5 text-center text-xl md:text-xl font-black outline-none transition-all ${error ? 'border-rose-500 shadow-glow-rose text-rose-400' : 'border-orange-500/50 text-orange-400 focus:border-orange-500 shadow-inner'}`} placeholder="n" />
                                         <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 uppercase font-black tracking-widest">Power</span>
                                     </div>
                                     <button onClick={handleAnswer} className="mt-4 md:mt-0 p-8 md:p-5 bg-orange-600 hover:bg-orange-500 text-white rounded-[1.5rem] shadow-glow-orange transition-all active:scale-95"><Send size={20} /></button>
                                 </div>

                                 <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-3 text-amber-500/50 font-black text-lg mx-auto hover:text-amber-500 hover:scale-105 transition-all uppercase italic tracking-[0.2em] mt-4">
                                     <HelpCircle size={20} /> طلب تحليل مجهري
                                 </button>
                                 <AnimatePresence>
                                     {showHint && (
                                         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5 bg-black/60 border-2 border-amber-500/20 rounded-[1.5rem] backdrop-blur-md shadow-inner italic text-right">
                                             <p className="text-amber-400 text-base md:text-lg font-bold leading-relaxed tracking-tight">{currentChallenge.hint}</p>
                                         </motion.div>
                                     )}
                                 </AnimatePresence>

                                 {feedback && (
                                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-[1rem] border-2 font-black text-xl text-center ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/10 border-rose-500/40 text-rose-400'}`}>
                                         {feedback.text}
                                     </motion.div>
                                 )}
                             </div>
                        </div>
                    </div>
                )}

                {reward && (
                    <div className="w-full max-w-5xl z-20 text-center px-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="border-4 rounded-[5rem] p-20 shadow-glow-emerald mb-12 backdrop-blur-3xl relative overflow-hidden bg-emerald-500/10 border-emerald-500/40">
                             <Microscope size={120} className="mx-auto text-emerald-500 mb-3 drop-shadow-glow" />
                             <h3 className="text-2xl md:text-xl font-black text-white mb-4 tracking-tighter leading-none uppercase italic">Master of Precision</h3>
                             <p className="text-base md:text-lg text-emerald-400 font-bold mb-12 italic opacity-80 leading-relaxed">لقد أتقنت بروتوكول الضغط العلمي وسيطرت على الأرقام الفلكية والذرية بدقة رياضية مذهلة.</p>
                             <div className="inline-block px-16 py-3 bg-emerald-500/20 rounded-[1rem] border border-emerald-500/30 text-white text-2xl font-black shadow-inner tracking-widest italic">RESOLUTION: 100%</div>
                        </motion.div>
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setReward(null); }} className="mt-12 w-full py-10 bg-orange-600 hover:bg-orange-500 text-white rounded-[1.5rem] font-black text-xl shadow-glow-orange transition-all active:scale-95">إعادة تفعيل الماسح</button>
                    </div>
                )}
            </div>

            {phase !== 'intro' && !reward && (
                <div className="absolute bottom-12 right-12 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-10 py-5 rounded-[1.5rem] font-black text-sm flex items-center gap-4 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={22} className="text-orange-400" /> <span>غرفة القيادة</span>
                    </button>
                </div>
            )}
        </div>
    );
}
