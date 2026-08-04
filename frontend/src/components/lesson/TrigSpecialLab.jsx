import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, CheckCircle2, Table } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/trig.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

const LAB_ID = 'trig-special';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function TrigSpecialContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const problem = rounds[round]; // { level, kind, angle, func, correct, options, q, hint }

    const learnPages = [
        { title: 'أصدقاء الطالب', detail: 'هناك زوايا تتكرر كثيراً في التمارين والفيزياء، قيمها "جميلة" وسهلة الحفظ. نسميها الزوايا الشهيرة.' },
    ];

    useEffect(() => {
        labProgressService.getOne(LAB_ID)
            .then(p => { if (p) { const lvl = difficultyEngine.getLevel(p); setBaseLevel(lvl); setRounds(buildRounds(lvl)); } })
            .catch(() => { });
    }, []);

    const resetChallenges = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setFeedback(null);
        setReward(null);
    };

    const startPractice = () => {
        resetChallenges();
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const handleAnswer = async (choice) => {
        if (choice === problem.correct) {
            setFeedback({ type: 'success', text: 'أحسنت! حفظ هذه القيم سيوفر عليك الكثير من الوقت في الامتحانات.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (round < 2) {
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward(LAB_ID, {
                        type: 'trig-special-answer', kind: problem.kind, angle: problem.angle, func: problem.func, answer: choice,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. تذكر جدول الزوايا الشهيرة.' });
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Table size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    احفظ القيم التي لا غنى عنها لأي طالب متميز. الزوايا 30، 45، و60 سترافقك في كل مسار تعليمي قادم.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل التفاعلي
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
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="grid grid-cols-4 gap-2 text-xs font-bold text-center">
                            <span className={theme.textSub}>الزاوية</span>
                            <span className={theme.textMain}>30°</span>
                            <span className={theme.textMain}>45°</span>
                            <span className={theme.textMain}>60°</span>
                        </div>
                        <div className={`grid grid-cols-4 gap-2 text-xs font-bold text-center pt-2 mt-2 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                            <span className="text-rose-400">Sin</span>
                            <span className="text-rose-400">1/2</span>
                            <span className="text-rose-400">√2/2</span>
                            <span className="text-rose-400">√3/2</span>
                        </div>
                        <div className={`grid grid-cols-4 gap-2 text-xs font-bold text-center pt-2 mt-2 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                            <span className="text-sky-400">Cos</span>
                            <span className="text-sky-400">√3/2</span>
                            <span className="text-sky-400">√2/2</span>
                            <span className="text-sky-400">1/2</span>
                        </div>
                        <div className={`grid grid-cols-4 gap-2 text-xs font-bold text-center pt-2 mt-2 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                            <span className="text-emerald-400">Tan</span>
                            <span className="text-emerald-400">√3/3</span>
                            <span className="text-emerald-400">1</span>
                            <span className="text-emerald-400">√3</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge بنوع choice ───────────────────────────
    return (
        <LabChallenge
            type="choice"
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
                { target: 'lab-question', title: 'الزوايا الشهيرة', description: 'الزوايا 30°، 45°، و60° لها قيم ثابتة يجب حفظها — تتكرر كثيراً في التمارين.' },
                { target: 'trig-special-options', title: 'الخيارات', description: 'اختر الإجابة الصحيحة من جدول القيم الشهيرة.' },
            ]}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div data-tour-id="trig-special-options" className="flex flex-wrap justify-center gap-4" role="group" aria-label="اختر الإجابة">
                    {problem.options.map((opt, i) => (
                        <button key={i} onClick={() => handleAnswer(opt)} className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-xl transition-all active:scale-95">
                            {opt}
                        </button>
                    ))}
                </div>

            </div>
        </LabChallenge>
    );
}

export default function TrigSpecialLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId={LAB_ID}
            phase={phase}
            title="نجوم المثلثات"
            badgeText="الزوايا الشهيرة"
            badgeIcon={Star}
            accentColor="amber"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <TrigSpecialContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
