import React, { useState, useEffect } from 'react';
import { Cpu, ArrowRight, Zap as ZapIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { rewardService } from '../../utils/rewardService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';

const LAB_ID = 'roots-expression';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function RootsExpressionContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(0); // 0: تفكيك، 1: دمج نهائي
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const problem = rounds[round]; // { level, x, c1, c2, op, result, q, decomposeStep, finalStep, hint }

    const simplificationGuide = [
        { title: 'بروتوكول التفكيك', detail: 'نفكك كل جذر إلى حاصل ضرب مربع تام في عدد (مثلاً √20 = √4×5).' },
        { title: 'خوارزمية الاستخراج', detail: 'نستخرج الجذر التربيعي للمربعات التامة خارج المظلة الجذرية.' },
        { title: 'الدمج النهائي', detail: 'نجمع أو نطرح الحدود التي لها نفس الجذر للحصول على أبسط صورة.' },
    ];

    useEffect(() => {
        labProgressService.getOne(LAB_ID)
            .then(p => { if (p) { const lvl = difficultyEngine.getLevel(p); setBaseLevel(lvl); setRounds(buildRounds(lvl)); } })
            .catch(() => { });
    }, []);

    const resetChallenges = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0); setStep(0); setInputVal('');
        setError(false); setFeedback(null); setReward(null);
    };

    const startPractice = () => {
        resetChallenges();
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const normalize = (s) => s.replace(/\s+/g, '');

    const handleCheck = async () => {
        const target = step === 0 ? problem.decomposeStep : problem.finalStep;
        if (normalize(inputVal) === normalize(target)) {
            setError(false);
            setInputVal('');
            if (step === 0) {
                setFeedback({ type: 'success', text: 'صحيح! خطوة تفكيك موفقة.' });
                confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
                setTimeout(() => { setStep(1); setFeedback(null); }, 900);
            } else {
                setFeedback({ type: 'success', text: 'تبسيط مثالي! وصلت لأبسط صورة للعبارة.' });
                confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 } });
                if (round < 2) {
                    setTimeout(() => { setRound(r => r + 1); setStep(0); setFeedback(null); }, 1400);
                } else {
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                    await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
                    try {
                        const data = await rewardService.claimLabReward(LAB_ID, {
                            type: 'roots-combine', a: problem.c1, b: problem.c2, op: problem.op, result: problem.result,
                        });
                        if (data.status === 'success') setReward(data);
                    } catch (err) { console.error(err); }
                }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع خطوة التفكيك أو الدمج.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4 gap-3">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full ${theme.card}`}>
                <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Cpu size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تبسّط عبارات جذرية معقدة عبر تفكيكها إلى مربعات تامة، ثم دمج الحدود المتشابهة.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black transition-all">
                    فتح خريطة التبسيط
                </button>
            </div>
            <button onClick={startPractice} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
                تخطي الشرح والبدء بالتحدي
            </button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-2xl px-2">
            <div className={`p-5 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-4 text-center ${theme.textMain}`}>خريطة التبسيط</h3>
                <div className="space-y-3">
                    {simplificationGuide.map((g, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-rose-50 border-rose-100'}`}>
                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-sm shrink-0">{i + 1}</div>
                            <div>
                                <h4 className={`font-bold text-xs ${theme.textMain}`}>{g.title}</h4>
                                <p className={`text-[11px] font-medium ${theme.textSub}`}>{g.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>السابق</button>
                <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">تفعيل المعالج <ArrowRight size={18} /></button>
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
        >
            <input
                type="text" value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                aria-label="أدخل خطوة التبسيط"
                dir="ltr"
                autoFocus
                className={`w-full max-w-xs rounded-xl text-center p-3 font-mono font-black text-lg outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-rose-500/50 text-rose-400 focus:border-rose-400' : 'bg-white border-rose-200 text-rose-700 focus:border-rose-500'
                    }`}
                placeholder="a√x ± b√x"
            />

            <LabTutorialNote
                from={`العبارة ${problem.q} تحتوي جذرين قابلين للتفكيك، وكلاهما ينتهيان بنفس الجذر الأساسي (${problem.x}).`}
                why="نفكك كل جذر إلى مربع تام مضروب في نفس العدد الأساسي لنحصل على جذور متشابهة، ثم نتعامل معها كحدود جبرية عادية بجمع أو طرح معاملاتها فقط دون المساس بالجذر نفسه."
            />

            <button onClick={handleCheck} className="mt-4 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <ZapIcon size={18} /> تأكيد المعالجة
            </button>
        </LabChallenge>
    );
}

export default function RootsExpressionLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId={LAB_ID}
            phase={phase}
            title="تبسيط العبارات الجذرية"
            badgeText="بروتوكول المعالجة"
            badgeIcon={Cpu}
            accentColor="rose"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <RootsExpressionContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
