import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/stats.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('stat-cumulative', lvl) }));
}

function StatCumulativeContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [userValues, setUserValues] = useState(() => new Array(rounds[0].problem.freqs.length).fill(''));
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const challenge = roundData.problem;

    useEffect(() => {
        labProgressService.getOne('stat-cumulative')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    const newRounds = buildRounds(lvl);
                    setRounds(newRounds);
                    setUserValues(new Array(newRounds[0].problem.freqs.length).fill(''));
                }
            })
            .catch(() => { });
    }, []);

    const resetAll = () => {
        const newRounds = buildRounds(baseLevel);
        setRounds(newRounds);
        setRound(0);
        setUserValues(new Array(newRounds[0].problem.freqs.length).fill(''));
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('stat-cumulative', 'practice').catch(() => { });
    };

    const handleAnswer = async () => {
        const isCorrect = userValues.every((v, i) => parseInt(v) === challenge.correct[i]);

        if (isCorrect) {
            setError(false);
            if (round < 2) {
                setFeedback({ type: 'success', text: `أحسنت! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
                setTimeout(() => {
                    const nextIdx = round + 1;
                    setRound(nextIdx);
                    setUserValues(new Array(rounds[nextIdx].problem.freqs.length).fill(''));
                    setFeedback(null);
                }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'أحسنت! تراكم البيانات يعطيك صورة أوضح عن ترتيب السلسلة.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('stat-cumulative', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('stat-cumulative', {
                        type: 'stat-cumulative', freqs: challenge.freqs, correct: challenge.correct,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ في الجمع التراكمي. جرب مرة أخرى.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    const learnPages = [
        { title: 'التكرار المجمع الصاعد', detail: 'هو مجموع التكرارات من البداية حتى تلك القيمة. يخبرنا كم عدداً "أقل من أو يساوي" قيمة معينة.', example: '3، 5، 2 → 3، 3+5=8، 8+2=10' },
    ];

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <ArrowUpRight size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تبني صورة تراكمية للبيانات تساعدك في فهم ترتيب القيم بشكل أعمق.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all">
                    دخول مختبر التراكم
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
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <span className="font-mono font-black text-indigo-400 text-sm" dir="ltr">{learnPages[learnStep].example}</span>
                    </div>
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
            level={roundData.level}
            question={challenge.q}
            hint={challenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setUserValues(new Array(challenge.freqs.length).fill('')); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
            tourSteps={[
                { target: 'stat-cum-freqs', title: 'التكرارات الأصلية', description: 'هذه هي سلسلة التكرارات — سنجمعها تراكمياً من اليسار لليمين.' },
                { target: 'lab-answer-input', title: 'حقول الإجابة', description: 'أول خانة = التكرار الأول نفسه، وكل خانة تالية = مجموع كل الخانات السابقة معها.' },
                { target: 'lab-hint-button', title: 'بحاجة لمساعدة؟', description: 'اضغط هنا لتلميح سريع.' },
            ]}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div data-tour-id="stat-cum-freqs" className={`flex justify-center gap-3 p-3 rounded-xl border font-mono text-sm ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} ${theme.textMain}`} dir="ltr">
                    {challenge.freqs.map((f, i) => <span key={i}>{f}</span>)}
                </div>

                <div data-tour-id="lab-answer-input" className="flex items-center gap-2" dir="ltr">
                    {userValues.map((v, i) => (
                        <React.Fragment key={i}>
                            <input
                                type="number"
                                value={v}
                                onChange={e => {
                                    const copy = [...userValues];
                                    copy[i] = e.target.value;
                                    setUserValues(copy);
                                }}
                                onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                                aria-label={`المجموع التراكمي ${i + 1}`}
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 transition-all font-black ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400 focus:border-indigo-400' : 'bg-white border-indigo-200 text-indigo-700 focus:border-indigo-500'
                                    }`}
                                placeholder="؟"
                                autoFocus={i === 0}
                            />
                            {i < userValues.length - 1 && <span className={`opacity-40 ${theme.textMain}`}>→</span>}
                        </React.Fragment>
                    ))}
                </div>

                <button onClick={handleAnswer} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black transition-all">
                    تحقق من التراكم
                </button>
            </div>
        </LabChallenge>
    );
}

export default function StatCumulativeLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="stat-cumulative"
            phase={phase}
            title="مختبر التراكم"
            badgeText="التكرار المجمع"
            badgeIcon={ArrowUpRight}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <StatCumulativeContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
