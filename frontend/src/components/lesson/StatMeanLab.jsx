import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Scale, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

function buildChallenges(level) {
    return difficultyEngine.generateChallengeSet('stat-mean', level, 3);
}

function StatMeanContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [level, setLevel] = useState(1);
    const [challenges, setChallenges] = useState(() => buildChallenges(1));
    const [challengeStep, setChallengeStep] = useState(0);
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('stat-mean')
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
        setInput('');
        setError(false);
        setFeedback(null);
    };

    const handleAnswer = async () => {
        const parsed = parseFloat(input);
        if (isNaN(parsed)) return;

        if (Math.abs(parsed - currentChallenge.ans) < 0.1) {
            setFeedback({ type: 'success', text: 'صحيح! لقد حددت مؤشر المركز بدقة. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setInput('');
            setError(false);

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(s => s + 1);
                    setFeedback(null);
                }, 1400);
            } else {
                await labProgressService.update('stat-mean', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('stat-mean');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ. تأكد من طريقة الحساب.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    const learnPages = [
        {
            title: 'الوسط الحسابي — ما هو؟',
            detail: 'هو القيمة التي "تمثّل" مجموعة البيانات كلها. يُحسب بجمع جميع القيم ثم قسمتها على عددها.',
            visual: (
                <div className={`w-full p-4 rounded-2xl border font-mono text-center ${isDarkMode ? 'bg-black/30 border-white/10 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                    <div className="text-2xl font-black mb-2">الوسط = مجموع القيم ÷ عددها</div>
                    <div className="text-sm opacity-70">(8 + 12 + 10) ÷ 3 = 10</div>
                </div>
            ),
        },
        {
            title: 'الوسيط — نقطة المنتصف',
            detail: 'نرتّب القيم تصاعدياً ثم نأخذ القيمة التي تقع في المنتصف. إذا كان العدد زوجياً نحسب متوسط القيمتين الوسطيتين.',
            visual: (
                <div className="flex gap-2 justify-center flex-wrap">
                    {[1, 2, 5, 8, 9].map((v, i) => (
                        <div key={i} className={`w-10 h-10 flex items-center justify-center rounded-xl font-black border ${i === 2
                                ? 'bg-blue-500 border-blue-400 text-white'
                                : isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}>{v}</div>
                    ))}
                </div>
            ),
        },
    ];

    // ── intro ────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl w-full text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Calculator size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    اكتشف القوانين التي تمنحنا نظرة شمولية على البيانات. ستواجه أسئلة عشوائية مُولَّدة بناءً على مستواك الحالي.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'
                    }`}>
                    مستوى الصعوبة الحالي: {['', 'مبتدئ', 'متوسط', 'متقدم'][level]}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className="w-full px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all"
                >
                    فتح مختبر المعدلات
                </button>
            </div>
            <button
                onClick={() => { resetChallenges(); setPhase('practice'); }}
                className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}
            >
                تخطي الشرح والبدء بالتحدي
            </button>
        </div>
    );

    // ── learn ────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={learnStep}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <h3 className={`text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-5 max-w-2xl mx-auto font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                    <div className="mx-auto min-h-[100px] flex items-center justify-center">
                        {learnPages[learnStep].visual}
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button
                    onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                    السابق
                </button>
                {learnStep < learnPages.length - 1 ? (
                    <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black flex items-center gap-2">
                        التالي <ArrowRight size={18} />
                    </button>
                ) : (
                    <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">
                        التدريب <CheckCircle2 size={18} />
                    </button>
                )}
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
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); }}
        >
            <div className="flex gap-2 justify-center flex-wrap mb-2">
                {currentChallenge.data.map((v, i) => (
                    <span key={i} className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold border ${isDarkMode ? 'bg-black/40 text-white border-white/10' : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>{v}</span>
                ))}
            </div>

            <div className="flex items-center justify-center gap-4 font-mono font-black" dir="ltr">
                <span className={`opacity-40 ${theme.textSub}`}>=</span>
                <input
                    type="number"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                    aria-label="أدخل الوسط الحسابي"
                    autoFocus
                    className={`w-36 rounded-xl p-3 text-center text-xl font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode
                            ? 'bg-black/60 border-blue-500/50 text-blue-400 focus:border-blue-400'
                            : 'bg-white border-blue-200 text-blue-700 focus:border-blue-500'
                        }`}
                    placeholder="؟"
                />
            </div>

            <LabTutorialNote
                from={`لديك ${currentChallenge.data.length} أرقام: ${currentChallenge.data.join('، ')}.`}
                why={`الوسط الحسابي = مجموع كل الأرقام ÷ عددها. اجمعها أولاً، ثم اقسم الناتج على ${currentChallenge.data.length}.`}
            />

            <button
                onClick={handleAnswer}
                className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all"
            >
                تحقق من النتيجة
            </button>
        </LabChallenge>
    );
}

export default function StatMeanLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="stat-mean"
            phase={phase}
            title="مختبر المعدلات"
            badgeText="مؤشرات المركز"
            badgeIcon={Scale}
            accentColor="blue"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <StatMeanContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
