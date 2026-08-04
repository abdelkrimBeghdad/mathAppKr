import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, ArrowRight, CheckCircle2, Move } from 'lucide-react';
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
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('vec-random-add', lvl) }));
}

function VecRandomAddContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [isTranslated, setIsTranslated] = useState(false);
    const [inputX, setInputX] = useState('');
    const [inputY, setInputY] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const { u, v, sum } = roundData.problem;

    useEffect(() => {
        labProgressService.getOne('vec-rand')
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
        { title: 'الأشعة المتباعدة', detail: 'أحياناً تكون الأشعة متباعدة في الفضاء ولا تشترك في أي نقطة. كيف نجمعها؟' },
        { title: 'قوة الانسحاب', detail: 'نقوم بعمل "انسحاب" لأحد الشعاعين بحيث تنطبق بدايته على نهاية الشعاع الآخر. هذا يحول المسألة إلى علاقة شال!' },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setIsTranslated(false);
        setInputX(''); setInputY('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('vec-rand', 'practice').catch(() => { });
    };

    const handleTranslate = () => {
        setIsTranslated(true);
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    };

    const handleCheck = async () => {
        if (parseInt(inputX) === sum.x && parseInt(inputY) === sum.y) {
            setError(false);
            setInputX(''); setInputY('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `صحيح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => { setRound(r => r + 1); setIsTranslated(false); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'رائع! جمعت الشعاعين بدقة رغم تباعدهما.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('vec-rand', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('vec-rand', {
                        type: 'vec-sum', u, v, sum,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: اجمع كل مركبة على حدة (x مع x، وy مع y).' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Repeat size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تجمع أي شعاعين في الفضاء، حتى لو كانا متباعدين، باستخدام قوة الانسحاب لدمجهما.
                    ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all">
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
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — أولاً نعرض الانسحاب البصري، ثم نسأل عن ناتج الجمع ─────────
    const allVals = [u.x, u.y, v.x, v.y, sum.x, sum.y];
    const maxAbs = Math.max(2, ...allVals.map(Math.abs));
    const viewSize = maxAbs * 2 + 2;
    const viewOffset = -maxAbs - 1;

    return (
        <LabChallenge
            type="visual"
            current={round + 1}
            total={3}
            level={roundData.level}
            question={isTranslated ? `u + v = ?` : 'اسحب الشعاع الوردي لتطبقه على نهاية الشعاع الأزرق'}
            hint={isTranslated ? 'اجمع كل مركبة على حدة (x مع x، وy مع y).' : 'اضغط الزر لسحب الشعاع الوردي حتى تلتقي بدايته بنهاية الشعاع الأزرق.'}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setIsTranslated(false); setInputX(''); setInputY(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className="relative w-64 h-32 mx-auto bg-black/20 rounded-2xl border border-white/10 flex items-center justify-center">
                    <svg viewBox={`${viewOffset} ${viewOffset} ${viewSize} ${viewSize}`} className="w-full h-full">
                        <g transform="scale(1, -1)">
                            <line x1="0" y1="0" x2={u.x} y2={u.y} stroke="#38bdf8" strokeWidth="0.15" markerEnd="url(#arrow-b)" />
                            <motion.line
                                animate={isTranslated ? { x: u.x, y: u.y } : { x: 0, y: 0 }}
                                transition={{ type: 'spring', damping: 15 }}
                                x1="0" y1="0" x2={v.x} y2={v.y}
                                stroke="#f472b6" strokeWidth="0.15" markerEnd="url(#arrow-p)"
                            />
                        </g>
                        <defs>
                            <marker id="arrow-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" /></marker>
                            <marker id="arrow-p" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f472b6" /></marker>
                        </defs>
                    </svg>
                </div>

                {!isTranslated ? (
                    <button onClick={handleTranslate} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                        <Move size={18} /> سحب الشعاع الوردي
                    </button>
                ) : (
                    <>
                        <div className="flex items-center gap-2 font-mono font-black text-lg" dir="ltr">
                            <span className={theme.textMain}>u + v = (</span>
                            <input type="number" value={inputX} onChange={e => setInputX(e.target.value)} aria-label="المركبة الأفقية" autoFocus
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400' : 'bg-white border-indigo-200 text-indigo-700'}`} placeholder="x" />
                            <span className={theme.textMain}>,</span>
                            <input type="number" value={inputY} onChange={e => setInputY(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheck()} aria-label="المركبة الرأسية"
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400' : 'bg-white border-indigo-200 text-indigo-700'}`} placeholder="y" />
                            <span className={theme.textMain}>)</span>
                        </div>
                        <LabTutorialNote
                            from={`الشعاعان u = (${u.x}, ${u.y}) و v = (${v.x}, ${v.y}).`}
                            why={`بعد الانسحاب، أصبح الشعاعان متتاليين (علاقة شال)؛ نجمع كل مركبة على حدة: (${u.x}+${v.x}, ${u.y}+${v.y}) = (${sum.x}, ${sum.y}).`}
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

export default function VecRandomAddLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="vec-rand"
            phase={phase}
            title="فن الربط"
            badgeText="جمع الأشعة الكيفية"
            badgeIcon={Repeat}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <VecRandomAddContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
