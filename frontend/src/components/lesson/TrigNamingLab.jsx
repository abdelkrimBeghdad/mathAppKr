import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, ArrowRight, CheckCircle2, MousePointer2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/trig.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

const LAB_ID = 'trig-naming';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function TrigNamingContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [targetAngle, setTargetAngle] = useState('A');
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const problem = rounds[round]; // { level, kind, target, correct, options, q, hint }

    const learnPages = [
        { title: 'بنية المثلث القائم', detail: 'قبل البدء بالحسابات، يجب أن نعرف أسماء الأضلاع الثلاثة بدقة. الوتر هو دائماً الضلع الأطول والمقابل للزاوية القائمة.' },
        { title: 'المقابل والمجاور', detail: 'أسماء الضلعين الآخرين تعتمد على الزاوية التي نختارها. المقابل هو البعيد عنها، والمجاور هو الذي يلمسها.' },
        { title: 'تغيير الأدوار', detail: 'لاحظ جيداً! إذا غيرنا الزاوية، يتبادل الضلعان القائمان أسماءهما. المقابل لـ A هو المجاور لـ B، والعكس صحيح.', interactive: true },
    ];

    useEffect(() => {
        labProgressService.getOne(LAB_ID)
            .then(p => { if (p) { const lvl = difficultyEngine.getLevel(p); setBaseLevel(lvl); setRounds(buildRounds(lvl)); } })
            .catch(() => { });
    }, []);

    const resetChallenges = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setFeedback(null);
        setReward(null);
    };

    const startPractice = () => {
        resetChallenges();
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const handleAnswer = async (choice) => {
        if (choice === problem.correct) {
            setFeedback({ type: 'success', text: 'صحيح! مهارة تحديد الأضلاع هي مفتاح الحل.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (round < 2) {
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward(LAB_ID, {
                        type: 'trig-naming-answer', kind: problem.kind, target: problem.target, answer: choice,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. تذكر: المجاور يلمس الزاوية، والمقابل لا يلمسها.' });
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Triangle size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    الخطوة الأولى والأهم في حساب المثلثات هي معرفة أسماء الأضلاع بالنسبة لكل زاوية. إذا أخطأت هنا، سيضيع كل الحل!
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all">
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
                    {learnPages[learnStep].interactive && (
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={() => setTargetAngle(targetAngle === 'A' ? 'B' : 'A')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2 text-sm">
                                تغيير الزاوية <MousePointer2 size={16} />
                            </button>
                            <div className={`font-mono text-lg ${theme.textMain}`}>الزاوية: <span className="text-amber-400 font-black">{targetAngle}</span></div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
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
            level={problem.level}
            question={problem.q}
            hint={problem.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className="relative w-40 h-28">
                    <svg viewBox="-1 -1 6 6" className="w-full h-full overflow-visible">
                        <g transform="scale(1, -1) translate(0, -5)">
                            <path d="M 0 0 L 4 0 L 0 4 Z" fill="none" stroke={isDarkMode ? 'white' : '#334155'} strokeWidth="0.1" />
                            <rect x="0" y="0" width="0.4" height="0.4" fill="none" stroke={isDarkMode ? 'white' : '#334155'} strokeWidth="0.05" />
                            {problem.target === 'A' && <path d="M 0 3.5 A 0.5 0.5 0 0 1 0.35 3.65" fill="none" stroke="#fbbf24" strokeWidth="0.2" />}
                            {problem.target === 'B' && <path d="M 3.5 0 A 0.5 0.5 0 0 1 3.65 0.35" fill="none" stroke="#fbbf24" strokeWidth="0.2" />}
                            <text x="-0.5" y="4.5" fill={isDarkMode ? 'white' : '#334155'} fontSize="0.6" transform="scale(1, -1)">A</text>
                            <text x="4.5" y="0.5" fill={isDarkMode ? 'white' : '#334155'} fontSize="0.6" transform="scale(1, -1)">B</text>
                            <text x="-0.5" y="0.5" fill={isDarkMode ? 'white' : '#334155'} fontSize="0.6" transform="scale(1, -1)">C</text>
                        </g>
                    </svg>
                </div>
                <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="اختر الإجابة">
                    {problem.options.map((opt, i) => (
                        <button key={i} onClick={() => handleAnswer(opt)}
                            className={`px-4 py-2 rounded-xl border-2 font-bold transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-black/40 hover:border-amber-500/50 text-white' : 'border-slate-200 bg-white hover:border-amber-400 text-slate-700'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                <LabTutorialNote
                    from="الزاوية القائمة في هذا المثلث دائماً عند النقطة C، والوتر هو الضلع الأطول AB المقابل لها."
                    why="لتحديد المجاور أو المقابل لأي زاوية غير قائمة، ننظر هل الضلع يلمس الزاوية المختارة (فيكون مجاوراً) أم يقع في الجهة المقابلة لها تماماً بلا تلامس (فيكون مقابلاً). تبديل الزاوية المختارة يبدّل أدوار الضلعين."
                />
            </div>
        </LabChallenge>
    );
}

export default function TrigNamingLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId={LAB_ID}
            phase={phase}
            title="تسمية الأضلاع"
            badgeText="أساسيات المثلث"
            badgeIcon={Triangle}
            accentColor="amber"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <TrigNamingContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
