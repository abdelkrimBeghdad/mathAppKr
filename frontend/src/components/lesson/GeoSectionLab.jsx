import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, ArrowRight, CheckCircle2, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('geo-section', lvl) }));
}

function GeoSectionContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [isCut, setIsCut] = useState(false);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const currentChallenge = roundData.problem; // { q, correct, options }

    useEffect(() => {
        labProgressService.getOne('geo-section')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    setRounds(buildRounds(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const learnPages = [
        {
            title: 'ما هو المقطع المستوي؟',
            detail: 'تخيل أنك تقطع حبة برتقال أو أسطوانة بسكين حاد جداً. الشكل الذي تراه في مكان القطع يسمى "المقطع".',
            visual: (
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-32 h-36 flex items-center justify-center" style={{ perspective: '1000px' }}>
                        <motion.div animate={{ y: isCut ? -20 : 0 }} className="w-20 h-20 bg-amber-500/30 border-2 border-amber-400 rounded-full relative" style={{ transformStyle: 'preserve-3d' }}>
                            <div className="absolute inset-0 bg-amber-500/20 border-b-2 border-amber-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(40px)' }} />
                        </motion.div>
                        {isCut && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-amber-400/80 rounded-full border-2 border-white"
                                style={{ transform: 'rotateX(70deg)' }}
                            />
                        )}
                    </div>
                    <button onClick={() => setIsCut(!isCut)} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-black flex items-center gap-2 text-sm">
                        {isCut ? 'إعادة التجميع' : 'قطع الأسطوانة'} <Scissors size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('geo-section', 'practice').catch(() => { });
    };

    const handleAnswer = async (choice) => {
        if (choice === currentChallenge.correct) {
            setFeedback({ type: 'success', text: 'صحيح! تخيّلت شكل السطح الناتج عن القطع بدقة.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (round < 2) {
                setTimeout(() => {
                    setRound(r => r + 1);
                    setFeedback({ type: 'success', text: `أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                    setTimeout(() => setFeedback(null), 1000);
                }, 900);
            } else {
                setTimeout(async () => {
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                    await labProgressService.update('geo-section', 'completed', 100).catch(() => { });
                    try {
                        const data = await rewardService.claimLabReward('geo-section', {
                            type: 'identify', correct: currentChallenge.correct, choice,
                        });
                        if (data.status === 'success') setReward(data);
                    } catch (err) { console.error(err); }
                }, 900);
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. تخيل شكل السطح الناتج عن القطع.' });
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Eye size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تتخيل ما بداخل المجسمات. سنقوم بقطع الأشكال الهندسية بمستويات مختلفة لنكتشف الأشكال المخفية بداخلها.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black transition-all">
                    فتح مختبر القواطع
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
                    <div className="mx-auto min-h-[180px] flex items-center justify-center">{learnPages[learnStep].visual}</div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
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
            level={roundData.level}
            question={currentChallenge.q}
            hint="تخيل المستوى وهو يقطع المجسم من الداخل، وحدد شكل السطح الناتج."
            feedback={feedback}
            reward={reward}
            onRefresh={() => setFeedback(null)}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full" role="group" aria-label="اختر الإجابة">
                {currentChallenge.options.map((opt, i) => (
                    <button key={i} onClick={() => handleAnswer(opt)}
                        className={`px-6 py-2 rounded-xl border-2 font-black text-lg transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-black/40 hover:border-rose-500/50 text-white' : 'border-slate-200 bg-white hover:border-rose-400 text-slate-700'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            <LabTutorialNote
                from={`السؤال يصف مستوى قطع يمر بمجسم معيّن بزاوية أو موقع محدد.`}
                why={`شكل المقطع يعتمد على المجسم نفسه وعلى اتجاه المستوى: القطع الموازي للقاعدة غالبًا يُعيد شكل القاعدة نفسه، بينما القطع بزاوية مختلفة قد ينتج شكلاً مختلفاً تمامًا.`}
            />
        </LabChallenge>
    );
}

export default function GeoSectionLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="geo-section"
            phase={phase}
            title="مختبر القواطع"
            badgeText="المقاطع المستوية"
            badgeIcon={Scissors}
            accentColor="rose"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <GeoSectionContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
