import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Target, Send, CheckCircle2, BookOpen } from 'lucide-react';
import { labProgressService } from '../../utils/labProgressService';
import { rewardService } from '../../utils/rewardService';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';

function ExpansionSimpleContent({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro, learn, practice
    const [learnStep, setLearnStep] = useState(0);
    const [practiceStep, setPracticeStep] = useState(1);
    const [problem, setProblem] = useState({ a: 5, b: 3, op: '+' });
    const [inputs, setInputs] = useState({ term1: '', term2: '' });
    const [reward, setReward] = useState(null);

    const learnContent = [
        {
            title: "بروتوكول التوزيع",
            detail: "النشر البسيط هو عملية توزيع الضرب على الجمع أو الطرح داخل الأقواس لإزالة الحواجز الجبرية.",
            math: "a(x + b) = ax + ab",
            icon: <Rocket size={24} className="text-indigo-500" />
        },
        {
            title: "خوارزمية الإسقاط",
            detail: "نقوم بضرب العامل الخارجي (a) في الحد الأول (x)، ثم في الحد الثاني (b).",
            math: "a × x → ax",
            icon: <Target size={24} className="text-indigo-500" />
        }
    ];

    const generateProblem = () => {
        const a = Math.floor(Math.random() * 6) + 2;
        const b = Math.floor(Math.random() * 8) + 1;
        const op = Math.random() > 0.5 ? '+' : '-';
        setProblem({ a, b, op });
        setPhase('practice');
        setPracticeStep(1);
        setInputs({ term1: '', term2: '' });
        setReward(null);
    };

    const handleCheck = async () => {
        if (parseInt(inputs.term1) === problem.a && parseInt(inputs.term2) === (problem.a * problem.b)) {
            setPracticeStep(5);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            try {
                await labProgressService.update('exp-simple', 'completed', 100);
                const res = await rewardService.claimLabReward('expansion-simple');
                if (res.status === 'success') setReward(res);
            } catch (err) { console.error(err); }
        }
    };

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('مفاعل النشر البسيط');
        } else if (phase === 'learn') {
            setLabTitle(learnContent[learnStep].title);
        } else if (practiceStep === 5) {
            setLabTitle('اكتمال عملية النشر');
        } else {
            setLabTitle('تحدي التوزيع الجبري');
        }
    }, [phase, learnStep, practiceStep, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center px-4 py-2 min-h-0 flex-grow">
            <AnimatePresence mode="wait">
                {phase === 'intro' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }} 
                        className={`p-6 md:p-8 rounded-[1.5rem] border ${theme.card} max-w-xl text-center w-full shadow-2xl`}
                    >
                        <div className="mb-4 p-5 rounded-2xl bg-indigo-500/10 font-mono text-xl md:text-2xl text-indigo-400 shadow-inner" dir="ltr">
                            a(x + b) = ax + ab
                        </div>
                        <p className={`${theme.textSub} mb-6 text-sm md:text-base font-medium`}>
                            تعلم كيف تفكك الأقواس وتوزع العوامل بذكاء رياضي.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setPhase('learn')} 
                                className={`py-2.5 px-4 rounded-xl font-bold transition-all border ${isDarkMode ? 'bg-slate-800 border-white/5 text-white hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                            >
                                الشرح النظري
                            </button>
                            <button 
                                onClick={generateProblem} 
                                className="py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all"
                            >
                                بدء التدريب
                            </button>
                        </div>
                    </motion.div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-xl px-2">
                        <motion.div 
                            key={learnStep} 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className={`p-6 md:p-8 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}
                        >
                             <div className="flex flex-col items-center text-center">
                                 <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
                                     {learnContent[learnStep].icon}
                                 </div>
                                 <h3 className={`text-base md:text-lg font-black mb-2 tracking-tighter ${theme.textMain}`}>
                                     {learnContent[learnStep].title}
                                 </h3>
                                 <p className={`text-xs md:text-sm ${theme.textSub} mb-4 max-w-2xl font-medium leading-relaxed italic`}>
                                     {learnContent[learnStep].detail}
                                 </p>
                                 <div className="p-4 rounded-[1rem] border bg-black/10 border-white/5 shadow-inner w-full">
                                     <span className="text-sm md:text-base font-mono font-black text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]" dir="ltr">
                                         {learnContent[learnStep].math}
                                     </span>
                                 </div>
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-4 px-4">
                             <button 
                                onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} 
                                className={`px-4 py-2 rounded-xl font-bold transition-all border ${isDarkMode ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
                             >
                                السابق
                             </button>
                             {learnStep < learnContent.length - 1 ? (
                                 <button 
                                    onClick={() => setLearnStep(l => l + 1)} 
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-bold shadow-xl text-xs md:text-sm"
                                 >
                                    التالي
                                 </button>
                             ) : (
                                 <button 
                                    onClick={generateProblem} 
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-bold shadow-xl text-xs md:text-sm"
                                 >
                                    دخول التجربة
                                 </button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl px-2">
                        <div className={`p-6 md:p-8 rounded-[1.5rem] border ${theme.card} text-center shadow-xl relative overflow-hidden`}>
                            {/* Problem Display with SVG Distribution Arcs */}
                            <div className="relative mb-8">
                                {/* SVG Arcs Layer */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid meet" style={{ zIndex: 1 }}>
                                    {/* Arc: a → x (first distribution) */}
                                    <AnimatePresence>
                                        {practiceStep >= 2 && (
                                            <motion.path
                                                d="M 120 60 Q 160 10, 200 60"
                                                fill="none"
                                                stroke="url(#arcGradient1)"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.7, ease: 'easeOut' }}
                                            />
                                        )}
                                    </AnimatePresence>
                                    {/* Arc: a → b (second distribution) */}
                                    <AnimatePresence>
                                        {practiceStep >= 3 && (
                                            <motion.path
                                                d="M 120 60 Q 190 -10, 280 60"
                                                fill="none"
                                                stroke="url(#arcGradient2)"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeDasharray="6 4"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                                            />
                                        )}
                                    </AnimatePresence>
                                    {/* Arrowheads via circles at endpoints */}
                                    <AnimatePresence>
                                        {practiceStep >= 2 && (
                                            <motion.circle cx="200" cy="60" r="4" fill="#818cf8"
                                                initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }}
                                                transition={{ delay: 0.6, duration: 0.4 }}
                                            />
                                        )}
                                    </AnimatePresence>
                                    <AnimatePresence>
                                        {practiceStep >= 3 && (
                                            <motion.circle cx="280" cy="60" r="4" fill="#34d399"
                                                initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }}
                                                transition={{ delay: 0.8, duration: 0.4 }}
                                            />
                                        )}
                                    </AnimatePresence>
                                    {/* Gradient definitions */}
                                    <defs>
                                        <linearGradient id="arcGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.9" />
                                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                                        </linearGradient>
                                        <linearGradient id="arcGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.7" />
                                            <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Terms display */}
                                <div className="text-3xl md:text-5xl font-black font-mono flex justify-center items-center gap-2 select-none relative" dir="ltr" style={{ zIndex: 2 }}>
                                    <motion.span 
                                        className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${practiceStep >= 2 ? "text-indigo-400 bg-indigo-500/10" : `${theme.textMain}`}`}
                                        animate={practiceStep === 1 ? { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] } : {}}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                        onClick={() => practiceStep === 1 && setPracticeStep(2)}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {problem.a}
                                    </motion.span>
                                    <span className={`${theme.textMain} opacity-30`}>(</span>
                                    <motion.span 
                                        className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${practiceStep >= 3 ? "text-sky-400 bg-sky-500/10" : practiceStep === 2 ? `${theme.textMain}` : `${theme.textMain} opacity-30`}`}
                                        animate={practiceStep === 2 ? { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] } : {}}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                        onClick={() => practiceStep === 2 && setPracticeStep(3)}
                                        whileHover={practiceStep === 2 ? { scale: 1.15 } : {}}
                                        whileTap={practiceStep === 2 ? { scale: 0.9 } : {}}
                                    >
                                        x
                                    </motion.span>
                                    <span className={`${theme.textMain} opacity-30`}>{problem.op}</span>
                                    <motion.span 
                                        className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${practiceStep >= 4 ? "text-emerald-400 bg-emerald-500/10" : practiceStep === 3 ? `${theme.textMain}` : `${theme.textMain} opacity-30`}`}
                                        animate={practiceStep === 3 ? { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] } : {}}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                        onClick={() => practiceStep === 3 && setPracticeStep(4)}
                                        whileHover={practiceStep === 3 ? { scale: 1.15 } : {}}
                                        whileTap={practiceStep === 3 ? { scale: 0.9 } : {}}
                                    >
                                        {problem.b}
                                    </motion.span>
                                    <span className={`${theme.textMain} opacity-30`}>)</span>
                                </div>
                            </div>

                            {/* Progress Step Dots */}
                            <div className="flex justify-center gap-2 mb-5">
                                {[1, 2, 3, 4].map(s => (
                                    <motion.div
                                        key={s}
                                        className={`h-1.5 rounded-full transition-colors ${s <= practiceStep ? 'bg-indigo-500' : isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}
                                        animate={{ width: s === practiceStep ? 28 : 12 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    />
                                ))}
                            </div>

                            {/* Help Guide Indicator */}
                            <AnimatePresence mode="wait">
                            {practiceStep < 4 && (
                                <motion.div 
                                    key={`hint-${practiceStep}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.3 }}
                                    className={`mb-6 p-3 rounded-xl border text-xs md:text-sm ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}
                                >
                                    {practiceStep === 1 && "اضغط على العامل الخارجي للبدء بالتوزيع."}
                                    {practiceStep === 2 && "اضغط على الحد الأول داخل القوسين لضربه."}
                                    {practiceStep === 3 && "اضغط على الحد الثاني لضربه وكتابة النتيجة النهائية."}
                                </motion.div>
                            )}
                            </AnimatePresence>

                            {/* Input Form */}
                            {practiceStep === 4 && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                    <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-mono" dir="ltr">
                                        <motion.input 
                                            type="number" 
                                            value={inputs.term1} 
                                            onChange={e => setInputs({ ...inputs, term1: e.target.value })} 
                                            className={`w-20 md:w-24 border-2 rounded-xl text-center p-2 font-bold focus:outline-none transition-colors ${isDarkMode ? 'bg-black/40 text-indigo-400 border-indigo-500/40 focus:border-indigo-400' : 'bg-slate-100 text-indigo-700 border-indigo-200 focus:bg-white focus:border-indigo-500'}`} 
                                            placeholder="?" 
                                            autoFocus
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                                        />
                                        <span className={theme.textMain}>x</span>
                                        <span className={theme.textMain}>{problem.op}</span>
                                        <motion.input 
                                            type="number" 
                                            value={inputs.term2} 
                                            onChange={e => setInputs({ ...inputs, term2: e.target.value })} 
                                            onKeyDown={e => e.key === 'Enter' && handleCheck()} 
                                            className={`w-20 md:w-24 border-2 rounded-xl text-center p-2 font-bold focus:outline-none transition-colors ${isDarkMode ? 'bg-black/40 text-emerald-400 border-emerald-500/40 focus:border-emerald-400' : 'bg-slate-100 text-emerald-700 border-emerald-200 focus:bg-white focus:border-emerald-500'}`} 
                                            placeholder="?" 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 300, delay: 0.25 }}
                                        />
                                    </div>
                                    <motion.button 
                                        onClick={handleCheck} 
                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-base md:text-lg hover:bg-indigo-500 transition-all shadow-md"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        تحقق من النشر
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* Result Display */}
                            {practiceStep === 5 && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                    <motion.div 
                                        className={`text-3xl md:text-4xl font-black mb-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} 
                                        dir="ltr"
                                        initial={{ y: -15 }}
                                        animate={{ y: 0 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                    >
                                        {problem.a}x {problem.op} {problem.a * problem.b}
                                    </motion.div>
                                    <motion.div 
                                        className={`p-3 rounded-xl border text-sm font-bold mb-4 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        إجابة نموذجية! تمت المعالجة بنجاح.
                                    </motion.div>
                                    {reward && (
                                        <motion.div 
                                            className="flex gap-3 justify-center mb-4 text-xs md:text-sm"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <motion.span 
                                                className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full font-bold"
                                                animate={{ scale: [1, 1.15, 1] }}
                                                transition={{ duration: 0.6, delay: 0.6 }}
                                            >
                                                +{reward.reward.coins} ذهب
                                            </motion.span>
                                            <motion.span 
                                                className="bg-sky-500/20 text-sky-500 px-3 py-1 rounded-full font-bold"
                                                animate={{ scale: [1, 1.15, 1] }}
                                                transition={{ duration: 0.6, delay: 0.8 }}
                                            >
                                                +{reward.reward.xp} XP
                                            </motion.span>
                                        </motion.div>
                                    )}
                                    <motion.button 
                                        onClick={generateProblem} 
                                        className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-md"
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        تحدي جديد
                                    </motion.button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ExpansionSimpleLab() {
    const [labTitle, setLabTitle] = useState('مفاعل النشر البسيط');
    const [labPhase, setLabPhase] = useState('intro');
    const [contentKey, setContentKey] = useState(0);

    return (
        <LabShell 
            labId="expansion-simple" 
            accentColor="indigo"
            badgeText="بروتوكول التوزيع البسيط"
            badgeIcon={Rocket}
            title={labTitle}
            phase={labPhase}
            onBack={() => {
                setLabPhase('intro');
                setContentKey(prev => prev + 1); // Reset content state
            }}
        >
            <ExpansionSimpleContent key={contentKey} setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}