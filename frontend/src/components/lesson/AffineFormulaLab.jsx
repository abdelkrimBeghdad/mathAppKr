import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Target, ArrowRight, CheckCircle2, Fingerprint } from 'lucide-react';
import confetti from 'canvas-confetti';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function AffineFormulaContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [level, setLevel] = useState(1);
    const [step, setStep] = useState(0); // 0: إيجاد a، 1: إيجاد b
    const [a, setA] = useState(2);
    const [b, setB] = useState(3);
    const [p1, setP1] = useState({ x: 1, y: 5 });
    const [p2, setP2] = useState({ x: 2, y: 7 });
    const [inputA, setInputA] = useState('');
    const [inputB, setInputB] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('affine-formula')
            .then(progress => { if (progress) setLevel(difficultyEngine.getLevel(progress)); })
            .catch(() => { });
    }, []);

    const learnPages = [
        { title: 'بروتوكول استخراج الميل', detail: 'الميل a هو معدل التغير. نحسبه بقسمة فرق الصور على فرق السوابق.', math: 'a = (f(x₂) - f(x₁)) / (x₂ - x₁)', icon: <TrendingUp size={20} /> },
        { title: 'خوارزمية تحديد الثابت', detail: 'بعد إيجاد a، نعوض في إحدى النقاط لاستنتاج الثابت b.', math: 'b = f(x₁) - a × x₁', icon: <Target size={20} /> },
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('linear', level);
        const maxCoeff = params.maxCoeff || 5;

        const newA = (Math.floor(Math.random() * maxCoeff) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const newB = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const x1 = Math.floor(Math.random() * 3) + 1;
        const x2 = x1 + Math.floor(Math.random() * 2) + 1;

        setA(newA); setB(newB);
        setP1({ x: x1, y: newA * x1 + newB });
        setP2({ x: x2, y: newA * x2 + newB });
        setPhase('practice');
        setStep(0);
        setInputA(''); setInputB('');
        setError(false); setFeedback(null); setReward(null);
        labProgressService.update('affine-formula', 'practice').catch(() => { });
    };

    const handleCheckA = () => {
        if (parseFloat(inputA) === a) {
            setStep(1);
            setError(false);
            setFeedback({ type: 'success', text: 'صحيح! الآن أوجد الثابت b.' });
            confetti({ particleCount: 50, spread: 40, origin: { y: 0.6 } });
            setTimeout(() => setFeedback(null), 1200);
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع قانون الميل: فرق الصور ÷ فرق السوابق.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    const handleCheckB = async () => {
        if (parseFloat(inputB) === b) {
            setError(false);
            setFeedback({ type: 'success', text: 'أحسنت! فككت الشيفرة بالكامل.' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            await labProgressService.update('affine-formula', 'completed', 100).catch(() => { });
            try {
                const data = await rewardService.claimLabReward('affine-formula-mastery');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: b = f(x₁) − a × x₁.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Fingerprint size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تستخرج معادلة الدالة التآلفية الكاملة f(x) = ax + b من نقطتين معطاتين فقط.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-50 text-orange-600'}`}>
                    المستوى الحالي: {['', 'مبتدئ', 'متوسط', 'متقدم'][level]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black transition-all">
                    فتح دليل البروتوكول
                </button>
            </div>
            <button onClick={generateProblem} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
                تخطي الشرح والبدء بالتحدي
            </button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-3">{learnPages[learnStep].icon}</div>
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-orange-500/20' : 'bg-orange-50 border-orange-100'}`}>
                        <span className="font-mono font-black text-orange-400" dir="ltr">{learnPages[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={generateProblem} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">ابدأ التحدي <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={step + 1}
            total={2}
            level={level}
            question={`النقاط المعطاة: f(${p1.x}) = ${p1.y}   و   f(${p2.x}) = ${p2.y}`}
            hint={step === 0
                ? `a = (${p2.y} − ${p1.y}) ÷ (${p2.x} − ${p1.x})`
                : `b = ${p1.y} − ${a} × ${p1.x}`}
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            {step === 0 ? (
                <>
                    <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                        <span className={theme.textMain}>a =</span>
                        <input
                            type="number" value={inputA}
                            onChange={e => setInputA(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCheckA()}
                            aria-label="أدخل قيمة الميل"
                            autoFocus
                            className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-orange-500/50 text-orange-400 focus:border-orange-400' : 'bg-white border-orange-200 text-orange-700 focus:border-orange-500'
                                }`}
                            placeholder="؟"
                        />
                    </div>
                    <button onClick={handleCheckA} className="mt-4 w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black transition-all">
                        تأكيد الميل a
                    </button>
                </>
            ) : (
                <>
                    <div className={`mb-2 px-4 py-1.5 rounded-full text-xs font-bold ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                        تم كشف a = {a}
                    </div>
                    <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                        <span className={theme.textMain}>b =</span>
                        <input
                            type="number" value={inputB}
                            onChange={e => setInputB(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCheckB()}
                            aria-label="أدخل قيمة الثابت"
                            autoFocus
                            className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400 focus:border-amber-400' : 'bg-white border-amber-200 text-amber-700 focus:border-amber-500'
                                }`}
                            placeholder="؟"
                        />
                    </div>
                    <button onClick={handleCheckB} className="mt-4 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black transition-all">
                        تأكيد الثابت b
                    </button>
                </>
            )}
        </LabChallenge>
    );
}

export default function AffineFormulaLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="affine-formula"
            phase={phase}
            title="استخراج العبارة"
            badgeText="وحدة الاستقصاء"
            badgeIcon={Fingerprint}
            accentColor="orange"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <AffineFormulaContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
