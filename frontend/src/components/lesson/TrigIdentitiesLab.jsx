import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, ArrowRight, CheckCircle2, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/trig.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

const LAB_ID = 'trig-identities';
const TOLERANCE = 0.03;

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function TrigIdentitiesContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [input1, setInput1] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const problem = rounds[round]; // { level, kind, cosX, sinX, ans, q, hint }

    const learnPages = [
        { title: 'ترابط النسب المثلثية', detail: 'السينوس والكوسينوس ليسا مستقلين تماماً، بل يربطهما قانون صارم مستمد من فيثاغورس.', math: 'cos²(x) + sin²(x) = 1' },
        { title: 'سر الطنجانط', detail: 'الطنجانط هو ببساطة ناتج قسمة الجيب على جيب التمام. إذا كنت تملك الاثنين، تملك الطنجانط آلياً!', math: 'tan(x) = sin(x) / cos(x)' },
    ];

    useEffect(() => {
        labProgressService.getOne(LAB_ID)
            .then(p => { if (p) { const lvl = difficultyEngine.getLevel(p); setBaseLevel(lvl); setRounds(buildRounds(lvl)); } })
            .catch(() => { });
    }, []);

    const resetChallenges = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0); setInput1('');
        setError(false); setFeedback(null); setReward(null);
    };

    const startPractice = () => {
        resetChallenges();
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const handleAnswer = async () => {
        const val = parseFloat(input1);
        if (!isNaN(val) && Math.abs(val - problem.ans) <= TOLERANCE) {
            setFeedback({ type: 'success', text: 'أحسنت! هذه العلاقات تسهل عليك حل أصعب المسائل الجبرية.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setInput1('');

            if (round < 2) {
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward(LAB_ID, {
                        type: 'trig-identity-answer', kind: problem.kind,
                        cosX: problem.cosX, sinX: problem.sinX, ans: problem.ans, submitted: val,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ. راجع العلاقات الأساسية في قسم الشرح.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Layers size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم الروابط السحرية بين النسب المثلثية الثلاث وكيف يمكنك استنتاج أي نسبة إذا كنت تملك الأخرى دون الحاجة للمثلث.
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
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <span className="font-mono font-black text-indigo-400" dir="ltr">{learnPages[learnStep].math}</span>
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
            level={problem.level}
            question={problem.q}
            hint={problem.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); }}
            tourSteps={[
                { target: 'lab-question', title: 'الترابط المثلثي', description: 'المطابقة الأساسية cos²(x) + sin²(x) = 1 صحيحة دائماً لأي زاوية، ومنها نشتق باقي العلاقات.' },
                { target: 'lab-answer-input', title: 'حقل الإجابة', description: 'أدخل النتيجة العددية — يمكنك استخدام كسور عشرية إن لزم.' },
                { target: 'lab-hint-button', title: 'بحاجة لمساعدة؟', description: 'اضغط هنا لتلميح سريع حسب نوع السؤال.' },
            ]}
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                <input
                    type="number" data-tour-id="lab-answer-input" step="0.01" value={input1}
                    onChange={e => setInput1(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                    aria-label="أدخل النتيجة"
                    autoFocus
                    className={`w-32 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400 focus:border-indigo-400' : 'bg-white border-indigo-200 text-indigo-700 focus:border-indigo-500'
                        }`}
                    placeholder="النتيجة"
                />
            </div>

            <button onClick={handleAnswer} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black transition-all">
                تحقق
            </button>
        </LabChallenge>
    );
}

export default function TrigIdentitiesLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId={LAB_ID}
            phase={phase}
            title="الترابط المثلثي"
            badgeText="العلاقات الأساسية"
            badgeIcon={GitBranch}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <TrigIdentitiesContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
