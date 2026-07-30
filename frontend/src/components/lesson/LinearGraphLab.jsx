import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Target, LassoSelect, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import { rewardService } from '../../utils/rewardService';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => {
        const params = difficultyEngine.getParams('linear', lvl);
        const maxCoeff = params.maxCoeff || 4;
        let a = (Math.floor(Math.random() * maxCoeff) + 1) * (Math.random() > 0.5 ? 1 : -1);
        if (Math.random() > 0.5) a = a / 2;
        return { level: lvl, a };
    });
}

function LinearGraphContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [pointPos, setPointPos] = useState({ x: 0, y: 0 });
    const [isCompleted, setIsCompleted] = useState(false);
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const a = roundData.a;

    useEffect(() => {
        labProgressService.getOne('lin-graph')
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
        { title: 'بروتوكول نقطة الأصل', detail: 'كل دالة خطية f(x)=ax تمر حتماً بمركز المعلم (0,0)؛ فهي نقطة الانطلاق الثابتة دوماً.', math: 'f(0) = a × 0 = 0', icon: <Target size={20} /> },
        { title: 'خوارزمية الإسقاط الثنائي', detail: 'لرسم المستقيم، نحتاج لنقطة ثانية فقط. اختر x عشوائياً (مثلاً x=1) واحسب f(1)=a.', math: 'النقطة: (1, a)', icon: <LassoSelect size={20} /> },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setPointPos({ x: 0, y: 0 });
        setError(false); setFeedback(null); setIsCompleted(false);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('lin-graph', 'practice').catch(() => { });
    };

    const handleGridClick = (e) => {
        if (isCompleted) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;
        const scaleX = 500 / rect.width;
        const scaleY = 500 / rect.height;
        const gridX = Math.round((rawX * scaleX - 250) / 45);
        const gridY = Math.round((250 - rawY * scaleY) / 45);
        setPointPos({ x: Math.max(-5, Math.min(5, gridX)), y: Math.max(-5, Math.min(5, gridY)) });
    };

    const handleGridKeyDown = (e) => {
        if (isCompleted) return;
        let { x, y } = pointPos;
        if (e.key === 'ArrowRight') { x = Math.min(5, x + 1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { x = Math.max(-5, x - 1); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { y = Math.min(5, y + 1); e.preventDefault(); }
        else if (e.key === 'ArrowDown') { y = Math.max(-5, y - 1); e.preventDefault(); }
        else return;
        setPointPos({ x, y });
    };

    const handleCheck = async () => {
        if (pointPos.x !== 0 && Math.abs(pointPos.y / pointPos.x - a) < 0.1) {
            setIsCompleted(true);
            setError(false);
            if (round < 2) {
                setFeedback({ type: 'success', text: `إسقاط دقيق! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
                setTimeout(() => {
                    setRound(r => r + 1);
                    setPointPos({ x: 0, y: 0 });
                    setIsCompleted(false);
                    setFeedback(null);
                }, 1600);
            } else {
                setFeedback({ type: 'success', text: 'إسقاط دقيق! النقطة تحقق معادلة الدالة الخطية.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('lin-graph', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('lin-graph', {
                        type: 'linear', x: pointPos.x, y: pointPos.y, m: a, b: 0,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'النقطة لا تحقق المعادلة y = ax. جرّب موضعاً آخر.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    const size = 500, center = size / 2, stepSize = 45;

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>دليل الإسقاط:</h3>
                <div className="space-y-3">
                    {learnPages.map((p, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-sky-50 border-sky-100'}`}>
                            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-sm shrink-0">{i + 1}</div>
                            <h4 className={`font-bold text-xs ${theme.textMain}`}>{p.title}</h4>
                        </div>
                    ))}
                </div>
                <p className={`text-xs ${theme.textSub} mt-3 text-center`}>ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.</p>
                <div className={`mt-2 mb-1 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-50 text-sky-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100'}`}>
                    فتح دليل الإسقاط
                </button>
            </div>
            <motion.button onClick={startPractice} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-sky-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Target size={36} className="animate-pulse" />
                    <span className="font-black text-xl uppercase tracking-widest">بدء الإسقاط</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto mb-3">{learnPages[learnStep].icon}</div>
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-sky-500/20' : 'bg-sky-50 border-sky-100'}`}>
                        <span className="font-mono font-black text-sky-400" dir="ltr">{learnPages[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">بدء الإسقاط</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge بنوع visual ────────────────────────────
    return (
        <LabChallenge
            type="visual"
            current={round + 1}
            total={3}
            level={roundData.level}
            question={`f(x) = ${a}x`}
            hint="الدالة تمر بنقطة الأصل (0,0). حدد نقطة ثانية تحقق y = ax. (لوحة المفاتيح: الأسهم للتنقل)"
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setPointPos({ x: 0, y: 0 }); setIsCompleted(false); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4">
                <div className={`relative p-3 rounded-[1rem] border-2 overflow-visible shrink-0 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <svg
                        width="320" height="320" viewBox="0 0 500 500" className="cursor-crosshair overflow-visible focus:outline-none"
                        onClick={handleGridClick}
                        onKeyDown={handleGridKeyDown}
                        tabIndex={0}
                        role="application"
                        aria-label={`شبكة إحداثيات. استخدم الأسهم لتحريك النقطة. الموضع الحالي (${pointPos.x}, ${pointPos.y})`}
                    >
                        {Array.from({ length: 11 }).map((_, i) => (
                            <React.Fragment key={i}>
                                <line x1={i * stepSize + (center % stepSize)} y1="0" x2={i * stepSize + (center % stepSize)} y2={size} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                                <line x1="0" y1={i * stepSize + (center % stepSize)} x2={size} y2={i * stepSize + (center % stepSize)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                            </React.Fragment>
                        ))}
                        <line x1="0" y1={center} x2={size} y2={center} stroke="rgba(56,189,248,0.4)" strokeWidth="3" />
                        <line x1={center} y1="0" x2={center} y2={size} stroke="rgba(56,189,248,0.4)" strokeWidth="3" />
                        <circle cx={center} cy={center} r="8" fill="rgba(56,189,248,0.6)" />
                        {(pointPos.x !== 0 || pointPos.y !== 0) && (
                            <>
                                <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1 }}
                                    x1={center - 5.5 * stepSize} y1={center - a * -5.5 * stepSize} x2={center + 5.5 * stepSize} y2={center - a * 5.5 * stepSize}
                                    stroke={isCompleted ? '#10b981' : '#38bdf8'} strokeWidth="5" strokeLinecap="round" strokeDasharray={isCompleted ? '0' : '12 8'}
                                />
                                <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transform={`translate(${center + pointPos.x * stepSize}, ${center - pointPos.y * stepSize})`}>
                                    <circle r="14" fill={isCompleted ? '#10b981' : '#38bdf8'} />
                                    <text y="28" textAnchor="middle" fill="white" fontSize="14" fontWeight="900">({pointPos.x}, {pointPos.y})</text>
                                </motion.g>
                            </>
                        )}
                    </svg>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <LabTutorialNote
                        from={`الدالة f(x) = ${a}x تمر بنقطة الأصل (0,0) دائماً.`}
                        why={`أي نقطة (x, y) تقع على المستقيم يجب أن تحقق العلاقة y = ${a} × x. اختر أي x غير صفري وتحرك رأسياً حتى تحقق النسبة الصحيحة.`}
                    />
                    {!isCompleted && (
                        <button onClick={handleCheck} disabled={pointPos.x === 0 && pointPos.y === 0} className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-30 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95">
                            <CheckCircle2 size={18} /> تأكيد النقطة
                        </button>
                    )}
                </div>
            </div>
        </LabChallenge>
    );
}

export default function LinearGraphLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="lin-graph"
            phase={phase}
            title="رسم الدوال الخطية"
            badgeText="رادار الإسقاط"
            badgeIcon={Target}
            accentColor="sky"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <LinearGraphContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
