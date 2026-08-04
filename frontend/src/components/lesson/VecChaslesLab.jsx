import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/vectors.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

const LAB_ID = 'vec-chasles';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function VecChaslesContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [inputStart, setInputStart] = useState('');
    const [inputEnd, setInputEnd] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const problem = rounds[round]; // { level, chain, vectors, ansStart, ansEnd, hint }

    const learnPages = [
        { title: 'الطريق المختصر', detail: 'إذا سافرت من A إلى B، ثم تابعت من B إلى C، فكأنك سافرت مباشرة من A إلى C.' },
        {
            title: 'علاقة شال السحرية',
            detail: 'يجب أن يكون الحرف الثاني في الشعاع الأول هو نفس الحرف الأول في الشعاع الثاني. ندمجهما ونحذف الحرف المكرر.',
            math: 'AB + BC = AC',
        },
        {
            title: 'التبديل الاستراتيجي',
            detail: 'أحياناً يخدعك التمرين ويعطيك أشعة غير مرتبة. الجمع تبديلي، أعد ترتيبها لتكتشف علاقة شال المخبأة.',
            math: 'CD + AC = AC + CD = AD',
        },
    ];

    useEffect(() => {
        labProgressService.getOne(LAB_ID)
            .then(p => { if (p) { const lvl = difficultyEngine.getLevel(p); setBaseLevel(lvl); setRounds(buildRounds(lvl)); } })
            .catch(() => { });
    }, []);

    const resetChallenges = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setInputStart(''); setInputEnd('');
        setError(false); setFeedback(null); setReward(null);
    };

    const startPractice = () => {
        resetChallenges();
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const handleAnswer = async () => {
        if (inputStart.toUpperCase() === problem.ansStart && inputEnd.toUpperCase() === problem.ansEnd) {
            setFeedback({ type: 'success', text: 'صحيح! دمجت المسارات بعلاقة شال بنجاح.' });
            setError(false);
            setInputStart(''); setInputEnd('');

            if (round < 2) {
                confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1000);
            } else {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward(LAB_ID, {
                        type: 'vec-chasles-chain',
                        vectors: problem.vectors,
                        ansStart: problem.ansStart,
                        ansEnd: problem.ansEnd,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع الحرف المشترك بين الشعاعين.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Route size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تدمج مسارات متعددة في مسار واحد مباشر باستخدام علاقة شال الشهيرة في جمع الأشعة.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all">
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
                    {learnPages[learnStep].math && (
                        <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                            <span className="font-mono font-black text-indigo-400" dir="ltr">{learnPages[learnStep].math}</span>
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
            hint={problem.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); }}
            tourSteps={[
                { target: 'vec-chasles-vectors', title: 'سلسلة الأشعة', description: 'كل حرف يظهر مرتين (نهاية شعاع وبداية التالي) يُحذف تلقائياً عند الجمع.' },
                { target: 'lab-answer-input', title: 'حقلا الإجابة', description: 'اكتب أول حرف من الشعاع الأول، وآخر حرف من الشعاع الأخير في السلسلة.' },
                { target: 'lab-hint-button', title: 'بحاجة لمساعدة؟', description: 'اضغط هنا لتلميح سريع.' },
            ]}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <p className={`text-sm font-bold ${theme.textSub}`}>أوجد المحصلة باستخدام علاقة شال</p>
                <div data-tour-id="vec-chasles-vectors" className="flex items-center justify-center gap-3 font-mono font-black text-lg flex-wrap" dir="ltr">
                    {problem.vectors.map((v, i) => (
                        <React.Fragment key={i}>
                            <span className={theme.textMain}>{v}</span>
                            {i < problem.vectors.length - 1 && <span className="opacity-40">+</span>}
                        </React.Fragment>
                    ))}
                    <span className="opacity-40">=</span>
                </div>

                <div data-tour-id="lab-answer-input" className="flex items-center gap-2 font-mono font-black text-lg" dir="ltr">
                    <span className="text-indigo-400">V =</span>
                    <input type="text" maxLength={1} value={inputStart} onChange={e => setInputStart(e.target.value)} aria-label="الحرف الأول" autoFocus
                        className={`w-14 uppercase rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400' : 'bg-white border-indigo-200 text-indigo-700'}`} placeholder="؟" />
                    <input type="text" maxLength={1} value={inputEnd} onChange={e => setInputEnd(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} aria-label="الحرف الأخير"
                        className={`w-14 uppercase rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400' : 'bg-white border-indigo-200 text-indigo-700'}`} placeholder="؟" />
                </div>

                <button onClick={handleAnswer} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                    <CheckCircle2 size={18} /> تأكيد المحصلة
                </button>
            </div>
        </LabChallenge>
    );
}

export default function VecChaslesLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId={LAB_ID}
            phase={phase}
            title="جمع الأشعة المتسلسلة"
            badgeText="علاقة شال"
            badgeIcon={Route}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <VecChaslesContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
