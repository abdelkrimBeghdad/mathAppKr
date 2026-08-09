import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, Crosshair, Map, Navigation, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import { rewardService } from '../../utils/rewardService';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => {
        const params = difficultyEngine.getParams('linear', lvl);
        const maxCoeff = params.maxCoeff || 4;
        const a = (Math.floor(Math.random() * maxCoeff) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const b = (Math.floor(Math.random() * 4) + 1) * (Math.random() > 0.5 ? 1 : -1);
        return { level: lvl, a, b };
    });
}

function AffineGraphContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [points, setPoints] = useState([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);
    const [cursor, setCursor] = useState({ x: 0, y: 0 }); // مؤشر تنقّل بلوحة المفاتيح

    const roundData = rounds[round];
    const { a, b } = roundData;

    useEffect(() => {
        labProgressService.getOne('aff-graph')
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
        { title: 'بروتوكول نقطة الارتكاز', detail: 'كل دالة تآلفية f(x) = ax + b تقطع محور التراتيب عند القيمة b. هذه هي نقطة الانطلاق الأولى (0, b).', math: 'f(0) = a × 0 + b = b', icon: <Navigation size={20} /> },
        { title: 'خوارزمية المسار الثاني', detail: 'نحتاج لنقطة ثانية فقط لرسم المستقيم. عوض x بقيمة سهلة (مثلاً 1) واحسب f(1) = a + b.', math: 'النقطة الثانية: (1, a+b)', icon: <Map size={20} /> },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setPoints([]);
        setError(false); setFeedback(null); setIsCompleted(false);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('aff-graph', 'practice').catch(() => { });
    };

    const placePoint = (clampedX, clampedY) => {
        if (isCompleted || points.length >= 2) return;
        if (points.some(p => p.x === clampedX && p.y === clampedY)) return;
        setPoints(prev => [...prev, { x: clampedX, y: clampedY }]);
    };

    const handleGridClick = (e) => {
        if (isCompleted || points.length >= 2) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;
        const scaleX = 500 / rect.width;
        const scaleY = 500 / rect.height;
        const gridX = Math.round((rawX * scaleX - 250) / 45);
        const gridY = Math.round((250 - rawY * scaleY) / 45);
        const clampedX = Math.max(-5, Math.min(5, gridX));
        const clampedY = Math.max(-5, Math.min(5, gridY));
        setCursor({ x: clampedX, y: clampedY });
        placePoint(clampedX, clampedY);
    };

    const handleGridKeyDown = (e) => {
        if (isCompleted || points.length >= 2) return;
        let { x, y } = cursor;
        if (e.key === 'ArrowRight') { x = Math.min(5, x + 1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { x = Math.max(-5, x - 1); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { y = Math.min(5, y + 1); e.preventDefault(); }
        else if (e.key === 'ArrowDown') { y = Math.max(-5, y - 1); e.preventDefault(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); placePoint(x, y); return; }
        else return;
        setCursor({ x, y });
    };

    const handleCheck = async () => {
        if (points.length < 2) return;
        const isCorrect = points.every(p => p.y === (a * p.x + b));

        if (isCorrect) {
            setIsCompleted(true);
            setError(false);
            if (round < 2) {
                setFeedback({ type: 'success', text: `مسار دقيق! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
                setTimeout(() => {
                    setRound(r => r + 1);
                    setPoints([]);
                    setIsCompleted(false);
                    setFeedback(null);
                }, 1600);
            } else {
                setFeedback({ type: 'success', text: 'مسار دقيق! كلتا النقطتين على المستقيم الصحيح.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('aff-graph', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('aff-graph', {
                        type: 'linear-2pt', m: a, b, p1: points[0], p2: points[1],
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'إحدى النقطتين لا تحقق المعادلة. تحقق من الحساب.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    const size = 500, center = size / 2, stepSize = 45;

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>دليل الملاحة:</h3>
                <div className="space-y-3">
                    {learnPages.map((p, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-orange-50 border-orange-100'}`}>
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-sm shrink-0">{i + 1}</div>
                            <h4 className={`font-bold text-xs ${theme.textMain}`}>{p.title}</h4>
                        </div>
                    ))}
                </div>
                <p className={`text-xs ${theme.textSub} mt-3 text-center`}>ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.</p>
                <div className={`mt-2 mb-1 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-50 text-orange-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100'}`}>
                    فتح دليل الملاحة
                </button>
            </div>
            <motion.button onClick={startPractice} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-orange-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Crosshair size={36} className="animate-pulse" />
                    <span className="font-black text-xl uppercase tracking-widest">بدء التخطيط</span>
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
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-3">{learnPages[learnStep].icon}</div>
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-orange-500/20' : 'bg-orange-50 border-orange-100'}`}>
                        <span className="font-mono font-black text-orange-400" dir="ltr">{learnPages[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">بدء التخطيط</button>
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
            question={`f(x) = ${a}x ${b >= 0 ? '+' : ''} ${b}`}
            hint={`المستقيم يقطع محور التراتيب عند ${b}. اختر نقطة ثانية سهلة، مثل x=1. (لوحة المفاتيح: الأسهم للتنقل، Enter للتثبيت)`}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setPoints([]); setIsCompleted(false); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
            tourSteps={[
                { target: 'affine-graph-svg', title: 'شبكة الإحداثيات', description: 'اضغط لتحديد نقطتين تحققان الدالة f(x)=ax+b — ابدأ من نقطة تقاطعها مع محور التراتيب.' },
                { target: 'lab-hint-button', title: 'بحاجة لمساعدة؟', description: 'اضغط هنا لتلميح سريع.' },
            ]}
        >
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4">
                <div data-tour-id="affine-graph-svg" className={`relative p-3 rounded-[1rem] border-2 overflow-visible shrink-0 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <svg
                        width="320" height="320" viewBox="0 0 500 500" className="cursor-crosshair overflow-visible focus:outline-none"
                        onClick={handleGridClick}
                        onKeyDown={handleGridKeyDown}
                        tabIndex={0}
                        role="application"
                        aria-label={`شبكة إحداثيات. استخدم الأسهم للتنقل، Enter لتثبيت نقطة. المؤشر حالياً عند (${cursor.x}, ${cursor.y})`}
                    >
                        {Array.from({ length: 11 }).map((_, i) => (
                            <React.Fragment key={i}>
                                <line x1={i * stepSize + (center % stepSize)} y1="0" x2={i * stepSize + (center % stepSize)} y2={size} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                                <line x1="0" y1={i * stepSize + (center % stepSize)} x2={size} y2={i * stepSize + (center % stepSize)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                            </React.Fragment>
                        ))}
                        <line x1="0" y1={center} x2={size} y2={center} stroke="rgba(245,158,11,0.4)" strokeWidth="3" />
                        <line x1={center} y1="0" x2={center} y2={size} stroke="rgba(245,158,11,0.4)" strokeWidth="3" />
                        {!isCompleted && points.length < 2 && (
                            <circle cx={center + cursor.x * stepSize} cy={center - cursor.y * stepSize} r="10" fill="none" stroke="#facc15" strokeWidth="2.5" strokeDasharray="4 3" />
                        )}
                        {points.length === 2 && (
                            <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1 }}
                                x1={center - 5.5 * stepSize} y1={center - (a * -5.5 + b) * stepSize} x2={center + 5.5 * stepSize} y2={center - (a * 5.5 + b) * stepSize}
                                stroke={isCompleted ? '#10b981' : '#f59e0b'} strokeWidth="5" strokeLinecap="round" strokeDasharray={isCompleted ? '0' : '12 8'}
                            />
                        )}
                        {points.map((p, i) => (
                            <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transform={`translate(${center + p.x * stepSize}, ${center - p.y * stepSize})`}>
                                <circle r="14" fill={isCompleted ? '#10b981' : '#f59e0b'} />
                                <text y="28" textAnchor="middle" fill="white" fontSize="14" fontWeight="900">({p.x}, {p.y})</text>
                            </motion.g>
                        ))}
                    </svg>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <div className={`px-4 py-1.5 rounded-full text-center font-black text-sm border ${isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                        النقاط {points.length}/2
                    </div>
                    <div className="flex flex-col gap-2">
                        {points.map((p, i) => (
                            <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                <span className={`font-mono font-black ${theme.textMain}`}>({p.x}, {p.y})</span>
                                <button onClick={() => setPoints(points.filter((_, idx) => idx !== i))} aria-label="حذف النقطة" className="p-1.5 bg-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500/30 transition-all">
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                        ))}
                        {points.length === 0 && (
                            <div className={`py-6 text-center font-bold italic border-2 border-dashed rounded-xl text-xs ${isDarkMode ? 'text-white/20 border-white/10' : 'text-slate-300 border-slate-200'}`}>
                                حدد نقطتين على الرادار
                            </div>
                        )}
                    </div>
                    {!isCompleted && (
                        <button onClick={handleCheck} disabled={points.length < 2} className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-30 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95">
                            <CheckCircle2 size={18} /> تأكيد المسار
                        </button>
                    )}
                </div>
            </div>
        </LabChallenge>
    );
}

export default function AffineGraphLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="aff-graph"
            phase={phase}
            title="رسم الدوال التآلفية"
            badgeText="رادار التخطيط"
            badgeIcon={Crosshair}
            accentColor="orange"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <AffineGraphContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
