import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowRight, CheckCircle2, Percent } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('stat-chart', lvl) }));
}

function StatChartContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [input1, setInput1] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const challenge = roundData.problem;

    useEffect(() => {
        labProgressService.getOne('stat-chart')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    setRounds(buildRounds(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setInput1('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('stat-chart', 'practice').catch(() => { });
    };

    const handleAnswer = async () => {
        if (parseInt(input1) === challenge.ans) {
            setError(false);
            setInput1('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `صحيح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'صحيح! أتقنت حساب زاوية القطاع الدائري.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('stat-chart', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('stat-chart', {
                        type: 'stat-chart', total: challenge.total, value: challenge.value, ans: challenge.ans,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ. استخدم قاعدة التناسب: (التكرار ÷ الكلي) × 360.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    const learnPages = [
        {
            title: 'التمثيل البياني',
            detail: 'الصورة تساوي ألف كلمة! الرسوم البيانية تسمح لنا بمقارنة البيانات بسرعة البرق.',
            visual: (
                <div className="flex items-end gap-2 h-28 w-full justify-center">
                    {[40, 70, 50, 90].map((h, i) => (
                        <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} className="w-8 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg" />
                    ))}
                </div>
            ),
        },
        {
            title: 'المخطط الدائري',
            detail: 'في المخطط الدائري، تتناسب زاوية كل قطاع مع تكراره. القاعدة: الزاوية = (التكرار ÷ التكرار الكلي) × 360.',
            visual: (
                <div className="relative w-28 h-28 rounded-full border-4 border-white/10 overflow-hidden flex items-center justify-center mx-auto">
                    <div className="absolute inset-0 bg-emerald-500/20" />
                    <div className="absolute inset-0 border-l-4 border-white/40 rotate-45" />
                    <Percent className={`opacity-20 ${theme.textMain}`} size={20} />
                </div>
            ),
        },
    ];

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Activity size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تحول الجداول الجافة إلى لوحات فنية تخبرك بالقصة كاملة في ثوانٍ. المخططات هي لغة العالم الحديث.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all">
                    فتح مختبر الرسوم
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
                    <div className="mx-auto min-h-[140px] flex items-center justify-center">{learnPages[learnStep].visual}</div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
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
            level={roundData.level}
            question={challenge.q}
            hint={challenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setInput1(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="flex items-center gap-3 font-mono font-black text-xl" dir="ltr">
                <input
                    type="number" value={input1}
                    onChange={e => setInput1(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                    aria-label="أدخل الزاوية"
                    autoFocus
                    className={`w-32 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400 focus:border-emerald-400' : 'bg-white border-emerald-200 text-emerald-700 focus:border-emerald-500'
                        }`}
                    placeholder="الزاوية"
                />
                <span className={theme.textMain}>°</span>
            </div>
            <LabTutorialNote
                from={`التكرار الكلي هو ${challenge.total}، وتكرار القيمة المطلوبة هو ${challenge.value}.`}
                why={`الدائرة الكاملة تساوي 360°، فنسبة الزاوية من الدائرة تساوي نسبة التكرار من الإجمالي: (${challenge.value}/${challenge.total}) × 360°.`}
            />
            <button onClick={handleAnswer} className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black transition-all">
                تحقق من الزاوية
            </button>
        </LabChallenge>
    );
}

export default function StatChartLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="stat-chart"
            phase={phase}
            title="مختبر الألوان"
            badgeText="الرسوم البيانية"
            badgeIcon={Activity}
            accentColor="emerald"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <StatChartContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
