import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, ArrowRight, CheckCircle2, Rotate3D } from 'lucide-react';
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
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('geo-solids', lvl) }));
}

function GeoSolidsContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);
    const [rotation, setRotation] = useState(0);

    const roundData = rounds[round];
    const currentChallenge = roundData.problem; // { q, correct, options, solidType }

    useEffect(() => {
        labProgressService.getOne('geo-solids')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    setRounds(buildRounds(lvl));
                }
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => setRotation(prev => (prev + 1) % 360), 30);
        return () => clearInterval(interval);
    }, []);

    const learnPages = [
        {
            title: 'ما هي الهندسة الفضائية؟',
            detail: 'هي دراسة الأشكال التي تعيش في فضاء ثلاثي الأبعاد. لها طول، عرض، وارتفاع. نطلق عليها اسم "المجسمات".',
            visual: (
                <div className="relative w-40 h-32 flex items-center justify-center" style={{ perspective: '1000px' }}>
                    <motion.div style={{ rotateY: rotation, rotateX: 20, transformStyle: 'preserve-3d' }} className="w-24 h-24 relative">
                        {[0, 90, 180, 270].map((rot, i) => (
                            <div key={i} className="absolute inset-0 bg-blue-500/30 border-2 border-blue-400" style={{ transform: `rotateY(${rot}deg) translateZ(48px)` }} />
                        ))}
                        <div className="absolute inset-0 bg-blue-500/30 border-2 border-blue-400" style={{ transform: 'rotateX(90deg) translateZ(48px)' }} />
                        <div className="absolute inset-0 bg-blue-500/30 border-2 border-blue-400" style={{ transform: 'rotateX(-90deg) translateZ(48px)' }} />
                    </motion.div>
                </div>
            ),
        },
        {
            title: 'المجسمات الدورانية',
            detail: 'بعض المجسمات تنتج عن دوران شكل مسطح حول محور. مثل الأسطوانة (دوران مستطيل) والمخروط (دوران مثلث قائم).',
            visual: (
                <div className="relative w-40 h-32 flex items-center justify-center" style={{ perspective: '1000px' }}>
                    <motion.div style={{ rotateY: rotation, transformStyle: 'preserve-3d' }} className="w-20 h-32 relative">
                        <div className="absolute inset-0 border-2 border-amber-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(64px)' }} />
                        <div className="absolute inset-0 border-2 border-amber-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(-64px)' }} />
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-amber-500/40 border-x-2 border-amber-400/50" />
                    </motion.div>
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
        labProgressService.update('geo-solids', 'practice').catch(() => { });
    };

    const handleAnswer = async (choice) => {
        if (choice === currentChallenge.correct) {
            setFeedback({ type: 'success', text: 'صحيح! لقد ميزت المجسم من خصائصه الهندسية.' });
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
                    await labProgressService.update('geo-solids', 'completed', 100).catch(() => { });
                    try {
                        const data = await rewardService.claimLabReward('geo-solids', {
                            type: 'identify', correct: currentChallenge.correct, choice,
                        });
                        if (data.status === 'success') setReward(data);
                    } catch (err) { console.error(err); }
                }, 900);
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. راجع خصائص المجسم المذكور.' });
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Rotate3D size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    اكتشف المجسمات ثلاثية الأبعاد وتعلم كيف تميز بينها من خلال عدد الأوجه والخصائص الهندسية الفريدة لكل منها.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all">
                    دخول المختبر ثلاثي الأبعاد
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
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
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
            hint="راجع عدد الأوجه ونوع القاعدة (مضلع أم دائرة) لتحديد المجسم بدقة."
            feedback={feedback}
            reward={reward}
            onRefresh={() => setFeedback(null)}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className="h-28 flex items-center justify-center" style={{ perspective: '1000px' }}>
                    {currentChallenge.solidType === 'cube' && (
                        <motion.div style={{ rotateY: rotation, rotateX: 20, transformStyle: 'preserve-3d' }} className="w-16 h-16 relative">
                            {[0, 90, 180, 270].map((rot, i) => (
                                <div key={i} className="absolute inset-0 bg-blue-500/40 border border-blue-400" style={{ transform: `rotateY(${rot}deg) translateZ(32px)` }} />
                            ))}
                            <div className="absolute inset-0 bg-blue-500/40 border border-blue-400" style={{ transform: 'rotateX(90deg) translateZ(32px)' }} />
                            <div className="absolute inset-0 bg-blue-500/40 border border-blue-400" style={{ transform: 'rotateX(-90deg) translateZ(32px)' }} />
                        </motion.div>
                    )}
                    {currentChallenge.solidType === 'cylinder' && (
                        <motion.div style={{ rotateY: rotation, transformStyle: 'preserve-3d' }} className="w-16 h-24 relative">
                            <div className="absolute inset-0 border border-amber-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(48px)' }} />
                            <div className="absolute inset-0 border border-amber-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(-48px)' }} />
                            <div className="absolute inset-0 bg-amber-500/30 border-x border-amber-400" />
                        </motion.div>
                    )}
                    {currentChallenge.solidType === 'cone' && (
                        <motion.div style={{ rotateY: rotation, transformStyle: 'preserve-3d' }} className="w-16 h-24 relative">
                            <div className="absolute inset-0 border border-emerald-400 rounded-full" style={{ transform: 'rotateX(90deg) translateZ(-48px)' }} />
                            <div className="absolute inset-0 flex items-center justify-center overflow-visible">
                                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                    <path d="M 50 0 L 0 100 L 100 100 Z" fill="rgba(16, 185, 129, 0.2)" stroke="currentColor" className="text-emerald-400" strokeWidth="2" />
                                </svg>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full" role="group" aria-label="اختر الإجابة">
                    {currentChallenge.options.map((opt, i) => (
                        <button key={i} onClick={() => handleAnswer(opt)}
                            className={`px-4 py-3 rounded-xl border-2 font-black transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-black/40 hover:border-blue-500/50 text-white' : 'border-slate-200 bg-white hover:border-blue-400 text-slate-700'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                <LabTutorialNote
                    from={`السؤال يصف مجسماً بخصائص معيّنة: عدد الأوجه، شكل القاعدة، أو طريقة تكوينه.`}
                    why={`كل مجسم له بصمة هندسية فريدة: عدد الأوجه المسطحة، وجود قاعدة دائرية أو مضلعة، وعدد القمم — هذه العلامات تكفي وحدها لتمييزه عن باقي المجسمات.`}
                />
            </div>
        </LabChallenge>
    );
}

export default function GeoSolidsLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="geo-solids"
            phase={phase}
            title="عالم المجسمات"
            badgeText="الهندسة الفضائية"
            badgeIcon={Box}
            accentColor="blue"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <GeoSolidsContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
