import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Calculator, AlertTriangle, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function InequalitiesSolveContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [step, setStep] = useState(0); // 0: نقل الثابت، 1: القسمة النهائية، 2: تم
    const [learnStep, setLearnStep] = useState(1);
    const [practicePair, setPracticePair] = useState({ a: 2, b: 6, c: 14, sym: '>', symFlip: '>', res: 4 });
    const [inputVal, setInputVal] = useState('');
    const [inputSym, setInputSym] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [flightAnim, setFlightAnim] = useState(null);

    const containerRef = useRef(null);
    const elsRef = useRef({});
    const setRef = (id) => (el) => { if (el) elsRef.current[id] = el; };

    const learnPages = [
        {
            title: 'بروتوكول التوازن الجبري',
            detail: 'حل المتراجحة يشبه حل المعادلة؛ ننقل الثوابت للطرف الآخر مع تغيير إشارتها للحفاظ على توازن العبارة.',
            math: 'ax + b > c ⟶ ax > c - b',
            icon: <Scale size={20} />,
        },
        {
            title: 'قاعدة الانعكاس الحرج',
            detail: 'انتبه! عند القسمة على عدد سالب، يجب قلب اتجاه المتراجحة فوراً لضمان صحة المنطق الرياضي.',
            math: '-2x > 6 ⟶ x < -3',
            icon: <AlertTriangle size={20} />,
        },
    ];

    const generateProblem = () => {
        const options = [
            { a: 2, b: 6, c: 14, sym: '>', symFlip: '>', res: 4 },
            { a: 3, b: -5, c: 10, sym: '<', symFlip: '<', res: 5 },
            { a: -2, b: 4, c: 10, sym: '>', symFlip: '<', res: -3 },
            { a: -3, b: -1, c: 8, sym: '≤', symFlip: '≥', res: -3 },
            { a: 5, b: 10, c: 30, sym: '≥', symFlip: '≥', res: 4 },
            { a: -4, b: 8, c: 0, sym: '<', symFlip: '>', res: 2 },
        ];
        const newProb = options[Math.floor(Math.random() * options.length)];
        setPracticePair(newProb);
        setPhase('practice');
        setStep(0);
        setInputVal('');
        setInputSym('');
        setError(false);
        setFeedback(null);
        setReward(null);
    };

    const handleNextLearnStep = () => {
        if (isAnimating || learnStep >= 3) return;
        const nextStep = learnStep + 1;
        setIsAnimating(true);
        setLearnStep(nextStep);
        const container = containerRef.current.getBoundingClientRect();

        if (nextStep === 2) {
            const s = elsRef.current['learn-b']?.getBoundingClientRect();
            const t = elsRef.current['learn-rhs-calc']?.getBoundingClientRect();
            if (s && t) {
                setFlightAnim({
                    clone1: { text: '+4', start: { x: s.left - container.left, y: s.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } },
                });
            }
        } else if (nextStep === 3) {
            const s = elsRef.current['learn-a']?.getBoundingClientRect();
            const t = elsRef.current['learn-final-res']?.getBoundingClientRect();
            if (s && t) {
                setFlightAnim({
                    clone1: { text: '-2', start: { x: s.left - container.left, y: s.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } },
                });
            }
        }
        setTimeout(() => { setIsAnimating(false); setFlightAnim(null); }, 1000);
    };

    const handleCheck = () => {
        if (step === 0) {
            const targetVal = practicePair.c - practicePair.b;
            if (parseInt(inputVal) === targetVal) {
                setStep(1);
                setInputVal('');
                setError(false);
                setFeedback(null);
            } else {
                setError(true);
                setFeedback({ type: 'error', text: 'تحقق من نقل الثابت للطرف الآخر مع عكس إشارته.' });
                setTimeout(() => { setError(false); setFeedback(null); }, 1500);
            }
        } else if (step === 1) {
            const symMatch = inputSym === practicePair.symFlip ||
                (inputSym === '>=' && practicePair.symFlip === '≥') ||
                (inputSym === '<=' && practicePair.symFlip === '≤');

            if (symMatch && parseInt(inputVal) === practicePair.res) {
                setStep(2);
                setFeedback({ type: 'success', text: 'مجموعة الحلول محددة بدقة!' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                rewardService.claimLabReward('inequality-solve')
                    .then(data => data.status === 'success' && setReward(data))
                    .catch(console.error);
                setError(false);
            } else {
                setError(true);
                setFeedback({ type: 'error', text: 'تحقق من اتجاه الرمز وقيمة الناتج.' });
                setTimeout(() => { setError(false); setFeedback(null); }, 1500);
            }
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>خوارزمية الحل:</h3>
                <div className="space-y-2">
                    {learnPages.map((p, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-blue-50 border-blue-100'}`}>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs shrink-0">{i + 1}</div>
                            <div>
                                <h4 className={`font-bold text-xs ${theme.textMain}`}>{p.title}</h4>
                                <p className={`text-[10px] font-medium leading-relaxed ${theme.textSub}`}>{p.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}
                >
                    مشاهدة الخطوات
                </button>
            </div>
            <motion.button
                onClick={generateProblem}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-blue-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-2">
                    <Scale size={40} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء التحدي</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn (بنية خاصة — رسوم متحركة "طائرة" — أُبقيت كما هي) ────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-4xl px-2" ref={containerRef}>
            <div className={`p-4 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden flex flex-col items-center ${theme.card}`}>
                <div className="space-y-6 w-full">
                    {flightAnim && (
                        <div className="absolute inset-0 pointer-events-none z-[100]">
                            <motion.div
                                initial={{ x: flightAnim.clone1.start.x, y: flightAnim.clone1.start.y }}
                                animate={{ x: flightAnim.clone1.end.x, y: flightAnim.clone1.end.y }}
                                transition={{ duration: 1 }}
                                className="absolute font-mono font-black text-2xl text-blue-400"
                            >
                                {flightAnim.clone1.text}
                            </motion.div>
                        </div>
                    )}
                    <div className={`p-6 rounded-2xl border-2 flex items-center justify-center gap-4 text-base md:text-lg font-mono font-black ${isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-blue-50 border-blue-100 text-slate-800'}`} dir="ltr">
                        <span ref={setRef('learn-a')}>-2</span><span className="text-blue-400">x</span>
                        <span ref={setRef('learn-b')} className={isAnimating && learnStep === 2 ? 'opacity-0' : 'text-blue-400'}>+4</span>
                        <span className="opacity-40 italic">&gt;</span>
                        <span>10</span>
                    </div>
                    <div className={`p-6 rounded-2xl border flex justify-center items-center transition-all duration-700 ${learnStep >= 2 ? `opacity-100 ${isDarkMode ? 'bg-black/40 border-blue-500/20' : 'bg-blue-50 border-blue-200'}` : 'opacity-0 scale-95'}`}>
                        <div className={`flex items-center gap-4 text-sm md:text-base font-mono font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`} dir="ltr">
                            <span>-2x &gt; 10</span>
                            <span ref={setRef('learn-rhs-calc')} className={isAnimating && (learnStep === 2 || learnStep === 3) ? 'opacity-0' : 'text-blue-400'}>-4</span>
                            <span className="text-emerald-500 italic">= 6</span>
                        </div>
                    </div>
                    <div className={`p-6 rounded-2xl border flex justify-center items-center transition-all duration-700 ${learnStep >= 3 ? 'opacity-100 bg-blue-500/10 border-blue-500/40' : 'opacity-0 scale-90'}`}>
                        <div className={`flex flex-col items-center gap-2 text-base md:text-lg font-mono font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`} dir="ltr">
                            <div className="flex items-center gap-4">
                                <span>x</span>
                                <motion.span animate={{ rotate: 180, color: '#60a5fa' }} transition={{ delay: 0.5, duration: 0.8 }} className="italic">&gt;</motion.span>
                                <div className="flex flex-col items-center">
                                    <span className={`border-b-2 px-4 ${isDarkMode ? 'border-white' : 'border-slate-700'}`}>6</span>
                                    <span className="text-xl text-slate-500">-2</span>
                                </div>
                            </div>
                            <div className="text-emerald-500 text-base md:text-lg mt-2">x <span className="italic">&lt;</span> <span ref={setRef('learn-final-res')}>-3</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-3 mt-6 px-4">
                <button
                    onClick={learnStep < 3 ? handleNextLearnStep : generateProblem}
                    disabled={isAnimating}
                    className="flex-grow py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all active:scale-95"
                >
                    {learnStep < 3 ? 'الخطوة التالية' : 'ابدأ التحدي'}
                </button>
                <button
                    onClick={() => { setLearnStep(1); setFlightAnim(null); }}
                    className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                    aria-label="إعادة الشرح"
                >
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={step + 1}
            total={3}
            level={practicePair.a < 0 ? 3 : 2}
            question={`حل: ${practicePair.a}x ${practicePair.b >= 0 ? '+' : ''}${practicePair.b} ${practicePair.sym} ${practicePair.c}`}
            hint={step === 0 ? 'انقل الثابت للطرف الآخر مع عكس إشارته.' : 'اقسم على معامل x — إذا كان سالباً اقلب اتجاه الرمز.'}
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-3">
                {step === 0 && (
                    <div className="flex items-center gap-3 font-mono font-black text-base md:text-lg" dir="ltr">
                        <span className={theme.textMain}>{practicePair.a}x {practicePair.sym} {practicePair.c} - ({practicePair.b}) = </span>
                        <input
                            type="number"
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCheck()}
                            aria-label="أدخل نتيجة نقل الثابت"
                            className={`w-24 rounded-xl text-center p-3 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-blue-500/50 text-blue-400 focus:border-blue-400' : 'bg-white border-blue-200 text-blue-700 focus:border-blue-500'
                                }`}
                            placeholder="?"
                            autoFocus
                        />
                    </div>
                )}
                {step === 1 && (
                    <>
                        <div className="flex items-center gap-3 font-mono font-black text-base md:text-lg" dir="ltr">
                            <span className={theme.textMain}>x</span>
                            <input
                                type="text"
                                value={inputSym}
                                onChange={e => setInputSym(e.target.value)}
                                aria-label="أدخل رمز المتراجحة"
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'
                                    }`}
                                placeholder="< >"
                            />
                            <input
                                type="number"
                                value={inputVal}
                                onChange={e => setInputVal(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                                aria-label="أدخل قيمة الحل"
                                className={`w-24 rounded-xl p-3 outline-none border-2 transition-all text-center ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400 focus:border-emerald-500' : 'bg-white border-emerald-200 text-emerald-700 focus:border-emerald-500'
                                    }`}
                                placeholder="?"
                            />
                        </div>
                        {practicePair.a < 0 && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold text-xs"
                            >
                                <AlertTriangle size={16} /> انتباه: القسمة على سالب تعني قلب الإشارة!
                            </motion.div>
                        )}
                    </>
                )}
                {step === 2 && (
                    <div className={`p-4 rounded-2xl border-2 font-mono font-black text-lg text-center ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`} dir="ltr">
                        <span className={theme.textMain}>x</span> <span className="text-emerald-400">{practicePair.symFlip}</span> <span className="text-emerald-400">{practicePair.res}</span>
                    </div>
                )}

                {step < 2 && (
                    <button
                        onClick={handleCheck}
                        className="mt-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black flex items-center gap-2 transition-all"
                    >
                        <Calculator size={18} /> التحقق من الخطوة
                    </button>
                )}
            </div>
        </LabChallenge>
    );
}

export default function InequalitiesSolveLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="inequalities-solve"
            phase={phase}
            title="حل المتراجحات الخطية"
            badgeText="بروتوكول الحماية الجبرية"
            badgeIcon={Scale}
            accentColor="blue"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <InequalitiesSolveContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
