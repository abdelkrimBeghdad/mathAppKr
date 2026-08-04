import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Percent, ArrowRight, CheckCircle2, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/stats.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

const LAB_ID = 'prob-mastery';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function ProbabilityMasteryContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [userAns, setUserAns] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawResult, setDrawResult] = useState(null);
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const problem = rounds[round]; // { level, red, blue, total, askBlue, ans, q, hint }

    const learnPages = [
        { title: 'ما هي الاحتمالات؟', detail: 'الاحتمال هو مقياس لمدى إمكانية وقوع حدث ما. قيمته دائماً تكون بين 0 (مستحيل) و 1 (مؤكد).' },
        { title: 'قانون الحساب الأساسي', detail: 'نحسب الاحتمال بقسمة "عدد الحالات المواتية" على "العدد الإجمالي للحالات الممكنة".', math: 'P = k / n' },
    ];

    useEffect(() => {
        labProgressService.getOne(LAB_ID)
            .then(p => { if (p) { const lvl = difficultyEngine.getLevel(p); setBaseLevel(lvl); setRounds(buildRounds(lvl)); } })
            .catch(() => { });
    }, []);

    const resetChallenges = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0); setUserAns(''); setDrawResult(null);
        setError(false); setFeedback(null); setReward(null);
    };

    const startPractice = () => {
        resetChallenges();
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const handleAnswer = async () => {
        if (parseInt(userAns) === problem.ans) {
            setFeedback({ type: 'success', text: 'إجابة عبقرية! لقد أتقنت منطق الاحتمالات.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setUserAns(''); setDrawResult(null);

            if (round < 2) {
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward(LAB_ID, {
                        type: 'prob-mastery-answer', red: problem.red, blue: problem.blue, total: problem.total, askBlue: problem.askBlue, ans: problem.ans,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ. تذكر: (الجزء ÷ الكل) × 100.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    const handleSimDraw = () => {
        setIsDrawing(true);
        setTimeout(() => {
            const res = Math.random() < (problem.red / problem.total) ? 'red' : 'blue';
            setDrawResult(res);
            setIsDrawing(false);
        }, 1000);
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Percent size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    هل الحظ موجود فعلاً؟ تعلم كيف تتوقع المستقبل "رياضياً" وتفهم القوانين التي تحكم المصادفة والكرات الملونة.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all">
                    دخول مختبر الاحتمال
                </button>
            </div>
            <button onClick={startPractice} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
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
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    {learnPages[learnStep].math && (
                        <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                            <span className="font-mono font-black text-indigo-400 text-xl" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={round + 1}
            total={3}
            level={problem.level}
            question={problem.q}
            hint={problem.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); }}
            tourSteps={[
                { target: 'prob-bag', title: 'الكيس', description: 'يحتوي كرات حمراء وزرقاء — جرّب السحب العشوائي لترى المصادفة عملياً.' },
                { target: 'lab-answer-input', title: 'حقل الإجابة', description: 'اقسم عدد الحالات المواتية على المجموع الكلي، ثم اضرب في 100 للحصول على نسبة مئوية.' },
                { target: 'lab-hint-button', title: 'بحاجة لمساعدة؟', description: 'اضغط هنا لتلميح سريع.' },
            ]}
        >
            <div className="w-full flex flex-col items-center gap-4">
                {/* محاكاة السحب البصرية */}
                <div data-tour-id="prob-bag" className="flex flex-col items-center gap-3">
                    <div className="grid grid-cols-5 gap-2 max-w-[180px]">
                        {Array.from({ length: problem.red }).map((_, i) => <div key={`r${i}`} className="w-5 h-5 rounded-full bg-rose-500" />)}
                        {Array.from({ length: problem.blue }).map((_, i) => <div key={`b${i}`} className="w-5 h-5 rounded-full bg-sky-500" />)}
                    </div>
                    <button
                        onClick={handleSimDraw} disabled={isDrawing}
                        className={`px-5 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-2 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                    >
                        <Play size={14} /> جرب سحب عشوائي
                    </button>
                    <AnimatePresence>
                        {drawResult && (
                            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                                className={`px-4 py-1.5 rounded-full text-xs font-black text-white ${drawResult === 'red' ? 'bg-rose-500' : 'bg-sky-500'}`}
                            >
                                النتيجة: {drawResult === 'red' ? 'حمراء' : 'زرقاء'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* الإدخال */}
                <div className="flex items-center gap-3 font-mono font-black text-xl" dir="ltr">
                    <input
                        type="number" data-tour-id="lab-answer-input" value={userAns}
                        onChange={e => setUserAns(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                        aria-label="أدخل النسبة المئوية"
                        autoFocus
                        className={`w-28 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400 focus:border-indigo-400' : 'bg-white border-indigo-200 text-indigo-700 focus:border-indigo-500'
                            }`}
                        placeholder="%"
                    />
                    <span className={theme.textMain}>%</span>
                </div>

                <button onClick={handleAnswer} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black transition-all">
                    تحقق من الاحتمال
                </button>
            </div>
        </LabChallenge>
    );
}

export default function ProbabilityMasteryLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId={LAB_ID}
            phase={phase}
            title="مختبر الاحتمالات"
            badgeText="منطق الصدفة"
            badgeIcon={Percent}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <ProbabilityMasteryContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
