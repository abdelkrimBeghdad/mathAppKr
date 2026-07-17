import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, Minus, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import { rewardService } from '../../utils/rewardService';

function RootsSubtractionContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(1);
    const [level, setLevel] = useState(1);
    const [practicePair, setPracticePair] = useState({ a: 10, b: 3, x: 7, diff: 7 });
    const [inputA, setInputA] = useState('');
    const [error, setError] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [flightAnim, setFlightAnim] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const containerRef = useRef(null);
    const elsRef = useRef({});
    const setRef = (id) => (el) => { if (el) elsRef.current[id] = el; };

    useEffect(() => {
        labProgressService.getOne('roots-subtraction')
            .then(progress => { if (progress) setLevel(difficultyEngine.getLevel(progress)); })
            .catch(() => { });
    }, []);

    const learnPages = [
        { title: 'بروتوكول التناقص التراكمي', detail: 'عند طرح جذور لها نفس القيمة التحتية، نطرح المعاملات مع الحفاظ على الجذر كما هو.', math: 'a√x − b√x = (a − b)√x', icon: <Minus size={20} /> },
        { title: 'تحذير: النتيجة قد تكون سالبة', detail: 'إذا كان المعامل الثاني أكبر من الأول، فالناتج سيكون سالباً — هذا طبيعي ومقبول في الجبر.', math: '3√7 − 5√7 = −2√7', icon: <AlertTriangle size={20} /> },
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('roots', level);
        const maxCoeff = params.maxCoeff || 15;
        const a = Math.floor(Math.random() * (maxCoeff / 3)) + 2;
        const b = Math.floor(Math.random() * (maxCoeff / 3)) + 1;
        const x = [2, 3, 5, 7, 10, 11][Math.floor(Math.random() * 6)];

        setPracticePair({ a, b, x, diff: a - b });
        setPhase('practice');
        setInputA('');
        setError(false); setFeedback(null); setReward(null);
        labProgressService.update('roots-subtraction', 'practice').catch(() => { });
    };

    const handleNextLearnStep = () => {
        if (isAnimating || learnStep >= 2) return;
        setIsAnimating(true);
        setLearnStep(2);
        setTimeout(() => setIsAnimating(false), 700);
    };

    const handleCheck = async () => {
        if (parseInt(inputA) === practicePair.diff) {
            setFeedback({ type: 'success', text: 'صحيح! طرحت المعاملات بدقة، والجذر بقي كما هو.' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            await labProgressService.update('roots-subtraction', 'completed', 100).catch(() => { });
            setError(false);
            try {
                const data = await rewardService.claimLabReward('roots-subtraction-mastery');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: اطرح المعاملات فقط، مع الحفاظ على الجذر.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>قانون الطرح:</h3>
                <div className={`p-5 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-rose-50 border-rose-100'}`}>
                    <div className="text-lg font-black font-mono flex items-center justify-center gap-3" dir="ltr">
                        <span className="text-cyan-400">a√x</span>
                        <span className={theme.textMain}>−</span>
                        <span className="text-orange-400">b√x</span>
                        <span className={theme.textMain}>=</span>
                        <span className="text-rose-400">(a−b)√x</span>
                    </div>
                </div>
                <button onClick={() => { setPhase('learn'); setLearnStep(1); }} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'}`}>
                    مشاهدة الشرح
                </button>
            </div>
            <motion.button onClick={generateProblem} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-rose-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Minus size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء الحساب</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2" ref={containerRef}>
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3">{learnPages[learnStep - 1].icon}</div>
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep - 1].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep - 1].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                        <span className="font-mono font-black text-rose-400" dir="ltr">{learnPages[learnStep - 1].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex gap-3 mt-6 px-4">
                <button onClick={learnStep < 2 ? handleNextLearnStep : generateProblem} disabled={isAnimating} className="flex-grow py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black transition-all active:scale-95">
                    {learnStep < 2 ? 'الخطوة التالية' : 'ابدأ التحدي'}
                </button>
                <button onClick={() => setLearnStep(1)} className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'}`} aria-label="إعادة الشرح">
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={1}
            total={1}
            level={level}
            question={`${practicePair.a}√${practicePair.x} − ${practicePair.b}√${practicePair.x}`}
            hint="اطرح المعاملات فقط. النتيجة قد تكون سالبة وهذا طبيعي."
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                <span className={`opacity-40 ${theme.textMain}`}>=</span>
                <input
                    type="number" value={inputA}
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
                <CheckCircle2 size={18} /> تحقق من الفارق
            </button>
        </LabChallenge>
    );
}

export default function RootsSubtractionLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="roots-subtraction"
            phase={phase}
            title="طرح الجذور التربيعية"
            badgeText="بروتوكول التناقص"
            badgeIcon={Minus}
            accentColor="rose"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <RootsSubtractionContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
