import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

function buildChallenges(level) {
    return difficultyEngine.generateChallengeSet('powers', level, 4);
}

function PowersContent({ phase, setPhase }) {
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
        labProgressService.getOne('powers-rules')
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
        if (input.trim() === currentChallenge.a) {
            setFeedback({ type: 'success', text: 'ممتاز! أتقنت قانون الأسس.' });
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
            setInput('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1400);
            } else {
                await labProgressService.update('powers-rules', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('powers-rules');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع القانون المستخدم.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    const learnPages = [
        { title: 'ضرب القوى — نجمع الأسس', detail: 'عند ضرب قوتين بنفس الأساس، نجمع الأسس فقط ونبقي الأساس.', math: 'aⁿ × aᵐ = aⁿ⁺ᵐ', example: '2³ × 2⁴ = 2⁷' },
        { title: 'قسمة القوى — نطرح الأسس', detail: 'عند قسمة قوتين بنفس الأساس، نطرح الأس المقسوم عليه من الأس المقسوم.', math: 'aⁿ ÷ aᵐ = aⁿ⁻ᵐ', example: '3⁸ ÷ 3⁵ = 3³' },
        { title: 'قوة القوة — نضرب الأسس', detail: 'عند رفع قوة إلى قوة، نضرب الأسين مع بعض.', math: '(aⁿ)ᵐ = aⁿˣᵐ', example: '(5²)³ = 5⁶' },
    ];

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl w-full text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-fuchsia-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Zap size={22} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-4`}>
                    تعلّم قوانين القوى الثلاثة وجرّب أسئلة عشوائية مُصمَّمة حسب مستواك.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-fuchsia-50 text-fuchsia-600'}`}>
                    المستوى الحالي: {['', 'مبتدئ', 'متوسط', 'متقدم'][level]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all">
                    بدء التعلم
                </button>
            </div>
            <button onClick={() => { resetChallenges(); setPhase('practice'); }} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
                تخطي للتحدي مباشرةً
            </button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-6 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-xl mx-auto font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border-2 border-fuchsia-500/30 mb-2 ${isDarkMode ? 'bg-black/30' : 'bg-fuchsia-50'}`}>
                        <div className="font-mono font-black text-fuchsia-400 text-xl mb-1" dir="ltr">{learnPages[learnStep].math}</div>
                        <div className={`text-sm font-bold opacity-60 ${theme.textSub}`} dir="ltr">{learnPages[learnStep].example}</div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">ابدأ التحدي <CheckCircle2 size={18} /></button>
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
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="flex items-center gap-3" dir="ltr">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                    aria-label="أدخل قيمة الأس"
                    className={`w-28 rounded-xl p-3 text-center text-xl font-black outline-none border-2 transition-all ${error
                            ? 'border-rose-500'
                            : isDarkMode ? 'bg-black/60 border-fuchsia-500/40 text-fuchsia-300 focus:border-fuchsia-400' : 'bg-white border-fuchsia-200 text-fuchsia-700 focus:border-fuchsia-500'
                        }`}
                    placeholder="?"
                    autoFocus
                />
            </div>
            <LabTutorialNote
                from={`السؤال يقارن بين أُسَّين لنفس الأساس.`}
                why={currentChallenge.hint}
            />
            <button
                onClick={handleAnswer}
                className="mt-4 w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all"
            >
                <CheckCircle2 size={18} /> تحقق من الإجابة
            </button>
        </LabChallenge>
    );
}

export default function PowersLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="powers-rules"
            phase={phase}
            title="مختبر الأسس والقوى"
            badgeText="قوانين الأسس"
            badgeIcon={Zap}
            accentColor="fuchsia"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <PowersContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
