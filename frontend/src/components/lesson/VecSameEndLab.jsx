import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/vectors.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('vec-same-end', lvl) }));
}

function VecSameEndContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [isTransformed, setIsTransformed] = useState(false);
    const [inputX, setInputX] = useState('');
    const [inputY, setInputY] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const { a, b, c, ac, bc, sum } = roundData.problem;

    useEffect(() => {
        labProgressService.getOne('vec-same-end')
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
        { title: 'الهدف المشترك', detail: 'ماذا لو كان للشعاعين نفس نقطة النهاية؟ مثل AC + BC. هنا تكمن الخدعة التي ترهق الطلاب.' },
        { title: 'إعادة التوجيه', detail: 'نستخدم الانسحاب لنحول أحد الشعاعين، ثم نجمع مركبات الشعاعين الأصليين كلاً على حدة — تمامًا كجمع أي شعاعين حرّين.' },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setIsTransformed(false);
        setInputX(''); setInputY('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('vec-same-end', 'practice').catch(() => { });
    };

    const handleTransform = () => {
        setIsTransformed(true);
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    };

    const handleCheck = async () => {
        if (parseInt(inputX) === sum.x && parseInt(inputY) === sum.y) {
            setError(false);
            setInputX(''); setInputY('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `صحيح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => { setRound(r => r + 1); setIsTransformed(false); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'عبقري! حللت مسألة الأشعة المتقاطعة عند نفس النقطة.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('vec-same-end', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('vec-same-end', {
                        type: 'vec-sum', u: ac, v: bc, sum,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: اجمع مركبات AC وBC كلاً على حدة.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Target size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تتعامل مع الأشعة التي تصب في نفس النقطة، وكيف تحسب مجموعها بدقة رغم اتجاهها المشترك.
                    ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black transition-all">
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

    // ── practice — يستخدم LabChallenge بنوع visual ────────────────────────────
    const allX = [a.x, b.x, c.x];
    const allY = [a.y, b.y, c.y];
    const maxAbs = Math.max(2, ...allX.map(Math.abs), ...allY.map(Math.abs));
    const viewSize = maxAbs * 2 + 2;
    const viewOffset = -maxAbs - 1;

    return (
        <LabChallenge
            type="visual"
            current={round + 1}
            total={3}
            level={roundData.level}
            question="AC + BC = ?"
            hint="حوّل أحد الشعاعين ليبدأ من نهاية الآخر (أو احسب المركبات مباشرة)، ثم اجمع كل محور على حدة."
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setIsTransformed(false); setInputX(''); setInputY(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className="relative w-64 h-40 mx-auto bg-black/20 rounded-2xl border border-white/10 flex items-center justify-center">
                    <svg viewBox={`${viewOffset} ${viewOffset} ${viewSize} ${viewSize}`} className="w-full h-full">
                        <g transform="scale(1, -1)">
                            <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke="#38bdf8" strokeWidth="0.1" markerEnd="url(#arrow-b)" />
                            <motion.line
                                animate={isTransformed ? { x: c.x - b.x, y: c.y - b.y } : { x: 0, y: 0 }}
                                transition={{ type: 'spring', damping: 15 }}
                                x1={b.x} y1={b.y} x2={c.x} y2={c.y}
                                stroke="#f472b6" strokeWidth="0.1" markerEnd="url(#arrow-p)"
                            />
                        </g>
                        <defs>
                            <marker id="arrow-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" /></marker>
                            <marker id="arrow-p" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f472b6" /></marker>
                        </defs>
                    </svg>
                </div>

                {!isTransformed ? (
                    <button onClick={handleTransform} className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                        <RefreshCw size={18} /> تحويل BC لتبدأ من C
                    </button>
                ) : (
                    <>
                        <div className="flex items-center gap-2 font-mono font-black text-lg" dir="ltr">
                            <span className={theme.textMain}>AC + BC = (</span>
                            <input type="number" value={inputX} onChange={e => setInputX(e.target.value)} aria-label="المركبة الأفقية" autoFocus
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-rose-500/50 text-rose-400' : 'bg-white border-rose-200 text-rose-700'}`} placeholder="x" />
                            <span className={theme.textMain}>,</span>
                            <input type="number" value={inputY} onChange={e => setInputY(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheck()} aria-label="المركبة الرأسية"
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-rose-500/50 text-rose-400' : 'bg-white border-rose-200 text-rose-700'}`} placeholder="y" />
                            <span className={theme.textMain}>)</span>
                        </div>
                        <LabTutorialNote
                            from={`AC = C − A = (${ac.x}, ${ac.y})، وBC = C − B = (${bc.x}, ${bc.y}).`}
                            why={`رغم أن الشعاعين ينتهيان عند نفس النقطة C، فإن جمعهما لا يختلف عن جمع أي شعاعين حرّين: نجمع كل مركبة على حدة: (${ac.x}+${bc.x}, ${ac.y}+${bc.y}) = (${sum.x}, ${sum.y}).`}
                        />
                        <button onClick={handleCheck} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                            <CheckCircle2 size={18} /> تأكيد المجموع
                        </button>
                    </>
                )}
            </div>
        </LabChallenge>
    );
}

export default function VecSameEndLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="vec-same-end"
            phase={phase}
            title="إعادة المسار"
            badgeText="فخ نقطة النهاية"
            badgeIcon={Target}
            accentColor="rose"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <VecSameEndContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
