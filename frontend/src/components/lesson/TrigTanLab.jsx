import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

function buildChallenges(level) {
    return difficultyEngine.generateChallengeSet('trig-tan', level, 3);
}

function TrigTanContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [level, setLevel] = useState(1);
    const [challenges, setChallenges] = useState(() => buildChallenges(1));
    const [challengeStep, setChallengeStep] = useState(0);
    const [input1, setInput1] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('trig-tan')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setLevel(lvl);
                    setChallenges(buildChallenges(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const currentChallenge = challenges[challengeStep];

    const resetChallenges = () => {
        setChallenges(buildChallenges(level));
        setChallengeStep(0);
        setInput1('');
        setError(false);
        setFeedback(null);
    };

    const handleAnswer = async () => {
        if (Math.abs(parseFloat(input1) - currentChallenge.ans) < 0.1) {
            setFeedback({ type: 'success', text: 'أحسنت! الظل يعبر عن نسبة المقابل للمجاور.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setInput1('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1400);
            } else {
                await labProgressService.update('trig-tan', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('trig-tan', {
                        type: 'ratio', kind: 'tan', opp: currentChallenge.opp, adj: currentChallenge.adj, result: currentChallenge.ans,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ. Tan = المقابل ÷ المجاور.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    const learnPages = [
        { title: 'ما هو الظل؟', detail: 'ظل الزاوية (Tan) هو نسبة بين الضلع "المقابل" والضلع "المجاور" — لا علاقة له بالوتر إطلاقاً.' },
        { title: 'قانون الظل', detail: 'الظل يقارن الضلعين القائمين ببعضهما مباشرة.', math: 'tan(α) = المقابل / المجاور' },
    ];

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-violet-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <TrendingUp size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تقارن الضلعين القائمين مباشرة بدون الحاجة للوتر، باستخدام نسبة الظل.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-50 text-violet-600'}`}>
                    المستوى الحالي: {['', 'مبتدئ', 'متوسط', 'متقدم'][level]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل التفاعلي
                </button>
            </div>
            <button onClick={() => { resetChallenges(); setPhase('practice'); }} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
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
                        <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-violet-500/20' : 'bg-violet-50 border-violet-100'}`}>
                            <span className="font-mono font-black text-violet-400" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={challengeStep + 1}
            total={challenges.length}
            level={level}
            question={currentChallenge.q}
            hint="Tan(α) = المقابل ÷ المجاور"
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="flex items-center gap-3 font-mono font-black" dir="ltr">
                <span className={theme.textMain}>Tan(α) =</span>
                <input
                    type="number" step="0.1" value={input1}
                    onChange={e => setInput1(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                    aria-label="أدخل قيمة الظل"
                    autoFocus
                    className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-violet-500/50 text-violet-400 focus:border-violet-400' : 'bg-white border-violet-200 text-violet-700 focus:border-violet-500'
                        }`}
                    placeholder="النتيجة"
                />
            </div>
            <LabTutorialNote
                from={`الضلع المقابل = ${currentChallenge.opp}cm، والضلع المجاور = ${currentChallenge.adj}cm (بدون استخدام الوتر هنا).`}
                why={`Tan(α) هو الاستثناء بين النسب الثلاث: لا يستخدم الوتر إطلاقاً، بل يقارن الضلعين القائمين ببعضهما مباشرة: مقابل ÷ مجاور.`}
            />
            <button onClick={handleAnswer} className="mt-4 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <CheckCircle2 size={18} /> تحقق من النتيجة
            </button>
        </LabChallenge>
    );
}

export default function TrigTanLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="trig-tan"
            phase={phase}
            title="مختبر الظل"
            badgeText="ظل الزاوية"
            badgeIcon={TrendingUp}
            accentColor="violet"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <TrigTanContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
