import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Divide, ArrowRight, Layers } from 'lucide-react';
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
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('roots-divide', lvl) }));
}

function RootsDivisionContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(1);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(0); // 0: توحيد تحت جذر واحد، 1: استخراج الجذر
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const practicePair = roundData.problem; // { a, b, quot, result }

    useEffect(() => {
        labProgressService.getOne('roots-division')
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
        { title: 'بروتوكول التوحيد التقسيمي', detail: 'قسمة جذرين تربيعيين تعني توحيدهما تحت جذر واحد، بقسمة العدد الأول على الثاني داخل الجذر.', math: '√a ÷ √b = √(a ÷ b)', icon: <Divide size={20} /> },
        { title: 'خوارزمية الاستخراج النهائي', detail: 'بعد الحصول على القيمة الموحدة تحت الجذر، نستخرج جذرها التربيعي للوصول للناتج النهائي.', math: '√25 = 5', icon: <Layers size={20} /> },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setStep(0);
        setInputVal(''); setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('roots-division', 'practice').catch(() => { });
    };

    const handleCheck = async () => {
        const isCorrect = step === 0 ? parseInt(inputVal) === practicePair.quot : parseInt(inputVal) === practicePair.result;

        if (isCorrect) {
            setError(false);
            setInputVal('');
            if (step === 0) {
                setFeedback({ type: 'success', text: 'صحيح! الآن استخرج الجذر التربيعي.' });
                setTimeout(() => { setStep(1); setFeedback(null); }, 900);
            } else if (round < 2) {
                setFeedback({ type: 'success', text: `ممتاز! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => { setRound(r => r + 1); setStep(0); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'ممتاز! وحّدت الجذرين واستخرجت الناتج بدقة.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('roots-division', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('roots-division', {
                        type: 'roots-divide', a: practicePair.a, b: practicePair.b, quot: practicePair.quot, result: practicePair.result,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: step === 0 ? `اقسم ${practicePair.a} على ${practicePair.b}.` : 'ما هو العدد الذي مربعه يساوي هذا الرقم؟' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>قانون التوحيد:</h3>
                <div className={`p-5 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-rose-50 border-rose-100'}`}>
                    <div className="text-lg font-black font-mono flex items-center justify-center gap-3" dir="ltr">
                        <span className="text-cyan-400">√a</span>
                        <span className={`opacity-40 ${theme.textMain}`}>÷</span>
                        <span className="text-orange-400">√b</span>
                        <span className={theme.textMain}>=</span>
                        <span className="text-rose-400">√(a÷b)</span>
                    </div>
                </div>
                <p className={`text-xs ${theme.textSub} mt-2 text-center`}>ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.</p>
                <div className={`mt-2 mb-1 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => { setPhase('learn'); setLearnStep(1); }} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'}`}>
                    مشاهدة الشرح
                </button>
            </div>
            <button onClick={startPractice} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-rose-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Divide size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء الحساب</span>
                </div>
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
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3">{learnPages[learnStep - 1].icon}</div>
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep - 1].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep - 1].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                        <span className="font-mono font-black text-rose-400" dir="ltr">{learnPages[learnStep - 1].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 1 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >السابق</button>
                {learnStep < 2
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">ابدأ التحدي</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={round * 2 + step + 1}
            total={6}
            level={roundData.level}
            question={step === 0 ? `√${practicePair.a} ÷ √${practicePair.b} = √(؟)` : `√${practicePair.quot} = ؟`}
            hint={step === 0 ? `اقسم ${practicePair.a} ÷ ${practicePair.b}.` : `أي عدد مضروب في نفسه يعطي ${practicePair.quot}؟`}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(0); setInputVal(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
            tourSteps={[
                { target: 'lab-question', title: 'قسمة جذرين', description: 'قسمة جذرين تساوي جذر ناتج القسمة: √a ÷ √b = √(a÷b).' },
                { target: 'lab-answer-input', title: 'حقل الإجابة', description: 'في الخطوة الأولى وحّد العددين تحت جذر واحد، ثم استخرج الجذر النهائي في الخطوة الثانية.' },
                { target: 'lab-hint-button', title: 'بحاجة لمساعدة؟', description: 'اضغط هنا لتلميح سريع.' },
            ]}
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                {step === 1 && <span className="text-rose-500">√</span>}
                <input
                    type="number" data-tour-id="lab-answer-input" value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCheck()}
                    aria-label="أدخل الناتج"
                    autoFocus
                    className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400 focus:border-emerald-400' : 'bg-white border-emerald-200 text-emerald-700 focus:border-emerald-500'
                        }`}
                    placeholder="؟"
                />
            </div>

            <button onClick={handleCheck} className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <CheckCircle2 size={18} /> {step === 0 ? 'تأكيد التوحيد' : 'استخراج الناتج'}
            </button>
        </LabChallenge>
    );
}

export default function RootsDivisionLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="roots-division"
            phase={phase}
            title="قسمة الجذور التربيعية"
            badgeText="بروتوكول التوحيد التقسيمي"
            badgeIcon={Divide}
            accentColor="rose"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <RootsDivisionContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
