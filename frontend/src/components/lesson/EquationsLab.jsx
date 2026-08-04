import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Target, Zap as ZapIcon, RefreshCw, Binary, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

const LAB_ID = 'eq-solve';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function EquationsContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const currentChallenge = rounds[round]; // { level, kind, x, a, b, c, q, hint }

    const learnPages = [
        { title: 'بروتوكول موازنة الموازين', detail: 'المعادلة هي ميزان رقمي دقيق. هدفنا الأساسي هو عزل المجهول x في طرف واحد عبر نقل الأرقام بحكمة.', math: 'x + a = b  →  x = b − a', icon: <Scale size={20} /> },
        { title: 'خوارزمية الانعكاس الإشاري', detail: 'عند نقل أي قيمة من كفة لأخرى يجب عكس عمليتها: الجمع يصبح طرحاً، والضرب يصبح قسمة.', math: 'x + 5 = 12  →  x = 12 − 5', icon: <RefreshCw size={20} /> },
        { title: 'بروتوكول الاختزال النهائي', detail: 'في المرحلة الأخيرة نقسم الطرفين على معامل x للوصول إلى القيمة الجوهريّة للمجهول. الجولة الثالثة تجمع الخطوتين معاً.', math: '2x + 4 = 14  →  x = (14 − 4) ÷ 2', icon: <Binary size={20} /> },
    ];

    useEffect(() => {
        labProgressService.getOne(LAB_ID)
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    setRounds(buildRounds(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const resetChallenges = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0); setUserInput('');
        setError(false); setFeedback(null); setReward(null);
    };

    const startPractice = () => {
        resetChallenges();
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const handleAnswer = async () => {
        if (userInput.trim() === String(currentChallenge.x)) {
            setFeedback({ type: 'success', text: 'معالجة مثالية! تم استخراج قيمة x بنجاح ✓' });
            setUserInput('');
            setError(false);
            if (round < 2) {
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1500);
            } else {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward(LAB_ID, {
                        type: 'eq-solve-linear',
                        a: currentChallenge.a,
                        b: currentChallenge.b,
                        c: currentChallenge.c,
                        x: currentChallenge.x,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خلل في الموازنة الرقمية. تحقق من العمليات الحسابية.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ──────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>موسوعة التوازنات</h3>
                <p className={`${theme.textSub} text-sm mb-4 font-medium`}>
                    تعلم استراتيجيات عزل x وكيفية التلاعب بموازين المعادلات للوصول للحقيقة الرقمية.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-50 text-violet-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`w-full py-3 rounded-xl font-black transition-all text-sm border ${isDarkMode ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                >
                    بدء التدريب
                </button>
            </div>
            <motion.button
                onClick={startPractice}
                className="relative group rounded-[1rem] overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="absolute inset-0 bg-violet-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-2">
                    <ZapIcon size={40} />
                    <span className="font-black text-xl uppercase tracking-widest">تفعيل المعالج</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ──────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={learnStep}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl ${theme.card}`}
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center">{learnPages[learnStep].icon}</div>
                        <h3 className={`text-lg font-black ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-violet-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-violet-50'}`}>
                            <span className="font-mono font-black text-violet-400 text-base" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button
                    onClick={() => learnStep > 0 ? setLearnStep(s => s - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all text-sm ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    السابق
                </button>
                {learnStep < learnPages.length - 1 ? (
                    <button onClick={() => setLearnStep(s => s + 1)} className="px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-black">التالي</button>
                ) : (
                    <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">بدء الاختبار</button>
                )}
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={round + 1}
            total={3}
            level={currentChallenge.level}
            question={currentChallenge.q}
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); }}
        >
            <div className="flex items-center gap-4 font-black font-mono" dir="ltr">
                <span className={`opacity-30 ${theme.textSub}`}>x =</span>
                <input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                    aria-label="أدخل قيمة x"
                    autoFocus
                    className={`w-24 md:w-36 rounded-xl p-3 text-center text-xl font-black outline-none transition-all border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-slate-950 text-violet-400 focus:border-violet-500 border-violet-500/50' : 'bg-white text-violet-700 border-violet-200 focus:border-violet-500'}`}
                    placeholder="?"
                />
            </div>

            <LabTutorialNote
                from={`المعادلة ${currentChallenge.q} تخبرنا أن طرفها الأيسر يساوي طرفها الأيمن تماماً.`}
                why="لعزل x نطبّق العملية العكسية على الطرفين معاً — إن كان هناك رقم مضافاً أو مطروحاً ننقله بعكس إشارته، وإن كان معامل ضرب نقسم عليه، دون كسر توازن الميزان أبداً."
            />

            <button
                onClick={handleAnswer}
                className="mt-4 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all"
            >
                <Send size={18} /> تحقق من الإجابة
            </button>
        </LabChallenge>
    );
}

export default function EquationsLab() {
    const [phase, setPhase] = useState('intro');

    return (
        <LabShell
            labId={LAB_ID}
            phase={phase}
            title="هندسة المعادلات"
            badgeText="بروتوكول عزل المجاهيل"
            badgeIcon={Target}
            accentColor="violet"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <EquationsContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
