import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, Plus, Microscope } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import { rewardService } from '../../utils/rewardService';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('roots-combine', lvl) }));
}

function RootsAdditionContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(1);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [inputA, setInputA] = useState('');
    const [error, setError] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [flightAnim, setFlightAnim] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const containerRef = useRef(null);
    const elsRef = useRef({});
    const setRef = (id) => (el) => { if (el) elsRef.current[id] = el; };

    const roundData = rounds[round];
    const practicePair = roundData.problem; // { a, b, x, sum, diff }

    useEffect(() => {
        labProgressService.getOne('roots-addition')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    setRounds(buildRounds(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const learnPages = [
        { title: 'بروتوكول توحيد المعاملات', detail: 'عند جمع جذور لها نفس القيمة التحتية، نجمع المعاملات (الأرقام الخارجية) مع الحفاظ على الجذر كما هو.', math: 'a√x + b√x = (a + b)√x', icon: <Microscope size={20} /> },
        { title: 'خوارزمية الدمج التراكمي', detail: 'تخيل أن الجذور وحدات قياس، فنحن نجمع الكميات الخارجية فقط ونضعها بجانب الوحدة المشتركة.', math: '3√7 + 5√7 = 8√7', icon: <Plus size={20} /> },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setInputA(''); setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('roots-addition', 'practice').catch(() => { });
    };

    const handleNextLearnStep = () => {
        if (isAnimating || learnStep >= 3) return;
        const nextStep = learnStep + 1;
        setIsAnimating(true);
        setLearnStep(nextStep);
        const container = containerRef.current.getBoundingClientRect();

        if (nextStep === 2) {
            const s1 = elsRef.current['learn-a']?.getBoundingClientRect();
            const s2 = elsRef.current['learn-b']?.getBoundingClientRect();
            const t = elsRef.current['learn-sum-calc']?.getBoundingClientRect();
            if (s1 && s2 && t) {
                setFlightAnim({
                    clone1: { text: '3', start: { x: s1.left - container.left, y: s1.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } },
                    clone2: { text: '5', start: { x: s2.left - container.left, y: s2.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } },
                });
            }
        } else if (nextStep === 3) {
            const s = elsRef.current['learn-sum-calc']?.getBoundingClientRect();
            const t = elsRef.current['learn-sum-final']?.getBoundingClientRect();
            if (s && t) {
                setFlightAnim({ clone1: { text: '8', start: { x: s.left - container.left, y: s.top - container.top }, end: { x: t.left - container.left, y: t.top - container.top } } });
            }
        }
        setTimeout(() => { setIsAnimating(false); setFlightAnim(null); }, 1000);
    };

    const handleCheck = async () => {
        if (parseInt(inputA) === practicePair.sum) {
            setError(false);
            setInputA('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `صحيح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'صحيح! دمجت المعاملات تحت الجذر المشترك بنجاح.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('roots-addition', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('roots-addition', {
                        type: 'roots-combine', a: practicePair.a, b: practicePair.b, result: practicePair.sum, op: 'add',
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: اجمع المعاملات فقط، والجذر يبقى كما هو.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>قانون الجمع:</h3>
                <div className={`p-5 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-50 border-indigo-100'}`}>
                    <div className="text-lg font-black font-mono flex items-center justify-center gap-3" dir="ltr">
                        <span className="text-cyan-400">a√x</span>
                        <span className={theme.textMain}>+</span>
                        <span className="text-orange-400">b√x</span>
                        <span className={theme.textMain}>=</span>
                        <span className="text-rose-400">(a+b)√x</span>
                    </div>
                </div>
                <p className={`text-xs ${theme.textSub} mt-2 text-center`}>ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.</p>
                <div className={`mt-2 mb-1 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => { setPhase('learn'); setLearnStep(1); }} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}>
                    مشاهدة الشرح
                </button>
            </div>
            <button onClick={startPractice} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Plus size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء الحساب</span>
                </div>
            </button>
        </div>
    );

    // ── learn — رسوم متحركة "طائرة" أُبقيت كما هي (تعقيد خاص مبرر) ────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-4xl px-2" ref={containerRef}>
            <div className={`p-4 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                <div className="space-y-6 relative z-10">
                    {flightAnim && (
                        <div className="absolute inset-0 pointer-events-none z-[100]">
                            <motion.div initial={{ x: flightAnim.clone1.start.x, y: flightAnim.clone1.start.y }} animate={{ x: flightAnim.clone1.end.x, y: flightAnim.clone1.end.y }} transition={{ duration: 1 }} className="absolute font-mono font-black text-2xl text-cyan-400">{flightAnim.clone1.text}</motion.div>
                            {flightAnim.clone2 && <motion.div initial={{ x: flightAnim.clone2.start.x, y: flightAnim.clone2.start.y }} animate={{ x: flightAnim.clone2.end.x, y: flightAnim.clone2.end.y }} transition={{ duration: 1 }} className="absolute font-mono font-black text-2xl text-orange-400">{flightAnim.clone2.text}</motion.div>}
                        </div>
                    )}
                    <div className={`p-6 rounded-2xl border-2 flex items-center justify-center gap-4 text-lg md:text-xl font-mono font-black ${isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-indigo-50 border-indigo-100 text-slate-800'}`} dir="ltr">
                        <span ref={setRef('learn-a')} className={isAnimating && learnStep === 2 ? 'opacity-0' : 'text-cyan-400'}>3</span>
                        <span>√7</span>
                        <span className="opacity-40">+</span>
                        <span ref={setRef('learn-b')} className={isAnimating && learnStep === 2 ? 'opacity-0' : 'text-orange-400'}>5</span>
                        <span>√7</span>
                    </div>
                    <div className={`p-5 rounded-2xl border-2 flex justify-center items-center transition-all duration-700 ${learnStep >= 2 ? `opacity-100 ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}` : 'opacity-0 scale-95'}`}>
                        <div className={`flex items-center gap-3 text-base md:text-lg font-mono font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`} dir="ltr">
                            <span className="opacity-40">(</span>
                            <span ref={setRef('learn-sum-calc')} className={isAnimating && (learnStep === 2 || learnStep === 3) ? 'opacity-0' : 'text-rose-400'}>3+5</span>
                            <span className="opacity-40">)</span>
                            <span>√7</span>
                        </div>
                    </div>
                    <div className={`p-5 rounded-2xl border-2 flex justify-center items-center transition-all duration-700 ${learnStep >= 3 ? 'opacity-100 bg-emerald-500/10 border-emerald-500/40' : 'opacity-0 scale-90'}`}>
                        <div className={`flex items-center gap-3 text-xl md:text-2xl font-mono font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`} dir="ltr">
                            <span ref={setRef('learn-sum-final')} className={isAnimating && learnStep === 3 ? 'opacity-0' : ''}>8</span>
                            <span className="text-rose-500">√7</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-3 mt-6 px-4">
                <button onClick={learnStep < 3 ? handleNextLearnStep : startPractice} disabled={isAnimating} className="flex-grow py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black transition-all active:scale-95">
                    {learnStep < 3 ? 'الخطوة التالية' : 'ابدأ التحدي'}
                </button>
                <button onClick={() => { setLearnStep(1); setFlightAnim(null); }} className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'}`} aria-label="إعادة الشرح">
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={round + 1}
            total={3}
            level={roundData.level}
            question={`${practicePair.a}√${practicePair.x} + ${practicePair.b}√${practicePair.x}`}
            hint="اجمع المعاملات فقط (الأرقام الخارجية)، والجذر يبقى دون تغيير."
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setInputA(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
            tourSteps={[
                { target: 'lab-question', title: 'جذران بنفس الرقم الأساسي', description: 'الجذر متطابق في كلا الحدين — أشبه بوحدة قياس مشتركة (مثل جمع تفاحات مع تفاحات).' },
                { target: 'lab-answer-input', title: 'حقل الإجابة', description: 'اجمع المعاملين الخارجيين فقط، وأبقِ الجذر كما هو دون تغيير.' },
                { target: 'lab-hint-button', title: 'بحاجة لمساعدة؟', description: 'اضغط هنا لتلميح سريع.' },
            ]}
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                <span className={`opacity-40 ${theme.textMain}`}>=</span>
                <input
                    type="number" data-tour-id="lab-answer-input" value={inputA}
                    onChange={e => setInputA(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCheck()}
                    aria-label="أدخل المعامل الناتج"
                    autoFocus
                    className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400 focus:border-emerald-400' : 'bg-white border-emerald-200 text-emerald-700 focus:border-emerald-500'
                        }`}
                    placeholder="؟"
                />
                <span className="text-rose-500">√{practicePair.x}</span>
            </div>

            <button onClick={handleCheck} className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <CheckCircle2 size={18} /> تحقق من النتيجة
            </button>
        </LabChallenge>
    );
}

export default function RootsAdditionLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="roots-addition"
            phase={phase}
            title="جمع الجذور التربيعية"
            badgeText="بروتوكول توحيد الجذور"
            badgeIcon={Plus}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <RootsAdditionContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
