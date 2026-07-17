import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function VecParallelogramContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        { title: 'نقطة الانطلاق المشتركة', detail: 'عندما ينطلق شعاعان من نفس النقطة، لا يمكننا تطبيق علاقة شال مباشرة. هنا نحتاج لـ "قاعدة متوازي الأضلاع".' },
        { title: 'إكمال الشكل', detail: 'نتخيل وجود خطوط توازي الأشعة لترسم لنا متوازي أضلاع. نقطة التقاطع هي نهاية شعاع المحصلة.' },
        { title: 'المحصلة هي القطر', detail: 'الشعاع الناتج ينطلق من نفس البداية A ويصل إلى الرأس المقابل C في متوازي الأضلاع.', math: 'AB + AD = AC' },
    ];

    const challenges = [
        {
            q: 'AB + AD = ?',
            a: { x: 0, y: 0 }, b: { x: 3, y: 1 }, d: { x: 1, y: 3 },
            options: [{ x: 4, y: 4, correct: true }, { x: 2, y: 2, correct: false }, { x: 3, y: 4, correct: false }],
        },
        {
            q: 'MA + MB = ?',
            a: { x: 0, y: 0 }, b: { x: -2, y: 2 }, d: { x: 2, y: 2 },
            options: [{ x: 0, y: 4, correct: true }, { x: 0, y: 0, correct: false }, { x: 4, y: 0, correct: false }],
        },
    ];

    const currentChallenge = challenges[challengeStep];

    const resetChallenges = () => {
        setChallengeStep(0); setSelectedPoint(null); setFeedback(null);
    };

    const handleAnswer = async (opt) => {
        setSelectedPoint(opt);
        if (opt.correct) {
            setFeedback({ type: 'success', text: 'أحسنت! أكملت متوازي الأضلاع بنجاح.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); setSelectedPoint(null); }, 1400);
            } else {
                try {
                    const data = await rewardService.claimLabReward('vec-parallelogram-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'نقطة خاطئة. تذكر أن المحصلة هي الرأس الرابع لمتوازي الأضلاع.' });
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Box size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تجمع شعاعين ينطلقان من نفس النقطة باستخدام الهندسة الذكية لإكمال متوازي الأضلاع.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all">
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
                        <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                            <span className="font-mono font-black text-blue-400" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge بنوع choice ───────────────────────────
    return (
        <LabChallenge
            type="choice"
            current={challengeStep + 1}
            total={challenges.length}
            level={challengeStep + 1}
            question={`أكمل متوازي الأضلاع: ${currentChallenge.q}`}
            hint="تخيل خطين وهميين يوازيان الأشعة الموجودة حتى يتقاطعا في النقطة الرابعة."
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="relative w-64 h-40 mx-auto bg-black/20 rounded-2xl border border-white/10">
                <svg viewBox="-1 -1 6 6" className="w-full h-full" aria-hidden="true">
                    <g transform="scale(1, -1) translate(0, -5)">
                        <line x1={currentChallenge.a.x} y1={currentChallenge.a.y} x2={currentChallenge.b.x} y2={currentChallenge.b.y} stroke="#38bdf8" strokeWidth="0.1" markerEnd="url(#arrow-b)" />
                        <line x1={currentChallenge.a.x} y1={currentChallenge.a.y} x2={currentChallenge.d.x} y2={currentChallenge.d.y} stroke="#f472b6" strokeWidth="0.1" markerEnd="url(#arrow-p)" />
                        <circle cx={currentChallenge.a.x} cy={currentChallenge.a.y} r="0.1" fill="white" />
                        {currentChallenge.options.map((opt, i) => (
                            <circle
                                key={i}
                                cx={opt.x} cy={opt.y} r="0.3"
                                fill={selectedPoint === opt ? (opt.correct ? '#10b981' : '#ef4444') : '#6366f1'}
                                className="cursor-pointer hover:scale-125 transition-transform"
                                onClick={() => handleAnswer(opt)}
                            />
                        ))}
                    </g>
                    <defs>
                        <marker id="arrow-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" /></marker>
                        <marker id="arrow-p" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f472b6" /></marker>
                    </defs>
                </svg>
            </div>

            {/* أزرار بديلة موثوقة لمستخدمي لوحة المفاتيح — نفس النقاط المرسومة أعلاه */}
            <div className="flex gap-3 justify-center mt-3" role="group" aria-label="اختر النقطة الصحيحة">
                {currentChallenge.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        aria-label={`النقطة ${i + 1}: إحداثيات (${opt.x}, ${opt.y})`}
                        className={`w-10 h-10 rounded-full border-2 font-black text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${selectedPoint === opt
                                ? (opt.correct ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white')
                                : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30'
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </LabChallenge>
    );
}

export default function VecParallelogramLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="vec-parallelogram"
            phase={phase}
            title="توازن القوى"
            badgeText="قاعدة متوازي الأضلاع"
            badgeIcon={Box}
            accentColor="blue"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <VecParallelogramContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
