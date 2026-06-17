import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Map, Target, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function ThalesProblemsLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0);
    const [problem, setProblem] = useState(null);
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        { title: 'طاليس في الواقع', detail: 'تُستخدم نظرية طاليس في الهندسة المعمارية ورسم الخرائط وحساب ارتفاعات لا يمكن قياسها مباشرة (مثل الهرم أو شجرة عالية).', math: 'ظل الشجرة / ظلك = طول الشجرة / طولك' },
        { title: 'خطوات الحل', detail: '1. استخرج الأطوال الثلاثة المعلومة من النص.\n2. تأكد من وجود توازي (مثل التعامد على نفس الأرض المستوية).\n3. طبق التناسب لإيجاد الطول المجهول.', math: 'x = (a × b) / c' }
    ];

    const problems = [
        { q: 'يقف شخص طوله 1.8m بجانب شجرة. ظل الشخص طوله 2m، وظل الشجرة 10m. (شعاع الشمس متوازي). ما هو ارتفاع الشجرة؟', ans: 9 },
        { q: 'سلم طوله 5m متكئ على جدار. على بعد 2m من أعلى السلم، تم وضع دعامة عمودية. كم طول الدعامة إذا كان ارتفاع الجدار 4m؟', ans: 2.4 },
        { q: 'مصباح يرتفع 6m، يلقي ظلاً لعمود طوله 2m. إذا كان ظل العمود يمتد 3m ويبعد العمود عن المصباح 6m، فتأكد من الحساب. (استخدم التناسب: 2/6 = 3/9).', ans: 2 }
    ];

    // Simpler word problems focusing strictly on numbers for the input
    const simpleProblems = [
        { q: 'مبنى يلقي ظلاً طوله 15m. في نفس الوقت، عصا طولها 2m تلقي ظلاً طوله 3m. ما هو ارتفاع المبنى؟ (أطوال متناسبة بسبب أشعة الشمس المتوازية).', ans: 10 },
        { q: 'في تصميم جسر، قطعة طولها الحقيقي 12m رُسمت بطول 4cm. قطعة أخرى طولها الحقيقي 18m، كم سيكون طولها على الرسم بـ cm؟', ans: 6 },
        { q: 'مخروط دائري ارتفاعه الكلي 12cm ونصف قطر قاعدته 4cm. قطعناه بمستوٍ يوازي القاعدة على ارتفاع 3cm من الرأس. ما هو نصف قطر الدائرة الناتجة؟', ans: 1 }
    ];

    const generateProblem = () => {
        const p = simpleProblems[Math.floor(Math.random() * simpleProblems.length)];
        setProblem(p); setPhase('practice'); setStep(0); setInputVal(''); setError(false); setReward(null);
    };

    const handleCheck = () => {
        if (parseFloat(inputVal) === problem.ans) {
            setStep(1);
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            rewardService.claimLabReward('thales-problems').then(d => d.status === 'success' && setReward(d)).catch(console.error);
        } else { setError(true); setTimeout(() => setError(false), 800); }
    };

    const theme = {
        container: isDarkMode ? 'bg-slate-950 border-white/5 shadow-3xl' : 'bg-white border-slate-100 shadow-2xl',
        card: isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-100 shadow-xl',
        textMain: isDarkMode ? 'text-white' : 'text-slate-900',
        textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    };

    return (
        <div className={`w-full h-full min-h-[300px] max-h-[85vh] ${theme.container} rounded-[1rem] md:rounded-[1.5rem] p-4 relative overflow-hidden flex flex-col font-sans border transition-all duration-500`} dir="rtl">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-4 pt-2">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm'}`}>
                                <Map size={14} /> تطبيقات طاليس
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>مسائل من الواقع</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                <Target size={14} /> {step === 0 ? 'استخدم التناسب' : 'حل هندسي رائع'}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {step === 1 ? 'ممتاز! إجابة دقيقة.' : 'أوجد الحل للمسألة'}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full pb-8">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                            <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>سر النجاح:</h3>
                            <div className="p-4 rounded-xl border text-center bg-black/20 border-white/5">
                                <div className={`text-lg font-black ${theme.textMain}`}>التناسب هو المفتاح</div>
                            </div>
                            <p className={`mt-3 text-sm ${theme.textSub}`}>ابحث عن الأشياء المتوازية (ظلال، دعامات...) ورتب النسب: صغير على كبير.</p>
                            <button onClick={() => setPhase('learn')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">كيف أبدأ؟</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1rem] shadow-2xl">
                            <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-indigo-600 to-violet-900' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'}`} />
                            <div className="relative p-8 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Map size={20} className="animate-bounce text-indigo-200" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase">اكتشف مسألة</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl ${theme.card}`}>
                            <div className="flex flex-col items-center text-center">
                                <h3 className={`text-base md:text-lg font-black mb-4 tracking-tighter ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                <p className={`text-sm md:text-base ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed whitespace-pre-line`}>{learnPages[learnStep].detail}</p>
                                <div className="p-6 rounded-2xl border-2 border-indigo-500/30 bg-black/40 w-full">
                                    <span className="text-sm md:text-base font-mono font-black text-indigo-400" dir="ltr">{learnPages[learnStep].math}</span>
                                </div>
                            </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                            <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                            {learnStep < 1 ? (
                                <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black text-lg">التالي</button>
                            ) : (
                                <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-lg">أرني مسألة</button>
                            )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && problem && (
                    <div className="flex flex-col items-center w-full max-w-4xl px-2">
                        <div className={`w-full p-4 md:p-6 rounded-[1rem] border backdrop-blur-3xl mb-3 text-center ${step === 1 ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                            <p className={`text-sm md:text-base font-bold leading-relaxed ${theme.textMain}`}>"{problem.q}"</p>
                        </div>

                        <AnimatePresence>
                            {step === 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-2xl">
                                    <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-3xl mb-4 flex flex-col items-center justify-center gap-4 ${theme.card}`}>
                                        <span className={`text-sm font-bold ${theme.textSub}`}>اكتب الجواب النهائي (رقم فقط):</span>
                                        <div className="flex gap-2" dir="ltr">
                                            <input type="number" step="0.1" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-24 md:w-32 bg-black/60 border-2 rounded-xl text-center p-3 text-xl font-bold outline-none transition-all ${error ? 'border-rose-500 animate-shake' : 'border-indigo-500/50 text-indigo-400 focus:border-indigo-400'}`} placeholder="?" autoFocus />
                                        </div>
                                    </div>
                                    <button onClick={handleCheck} className="w-full py-3 md:py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-3">
                                        <CheckCircle2 size={20} /> تحقق من الإجابة
                                    </button>
                                </motion.div>
                            )}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-2xl">
                                    <MasteryRewardCard reward={reward} />
                                    <button onClick={generateProblem} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xl">مسألة جديدة</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {phase !== 'intro' && step === 0 && (
                <div className="absolute bottom-4 right-4 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={14} className="text-indigo-400" /> الرجوع
                    </button>
                </div>
            )}
        </div>
    );
}
