import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function VectorGrid({ dx, dy, startX, startY, isDarkMode }) {
    return (
        <div className="relative w-full max-w-[220px] aspect-square bg-slate-950/50 rounded-2xl border-2 border-white/10 overflow-hidden mx-auto mb-2 shadow-inner">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '10% 10%', backgroundPosition: 'center center' }} />
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-600" />
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-slate-600" />
            <svg viewBox="-5 -5 10 10" className="absolute inset-0 w-full h-full overflow-visible z-10">
                <g transform="scale(1, -1)">
                    <circle cx={startX} cy={startY} r="0.2" fill="#10b981" />
                    <line x1={startX} y1={startY} x2={startX + dx} y2={startY + dy} stroke="#d946ef" strokeWidth="0.15" markerEnd="url(#arrowhead)" />
                </g>
                <defs>
                    <marker id="arrowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#d946ef" />
                    </marker>
                </defs>
            </svg>
        </div>
    );
}

function VecReadContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [inputX, setInputX] = useState('');
    const [inputY, setInputY] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        { title: 'قراءة المسار', detail: 'لكتابة مركبات شعاع، نحلل حركته المائلة إلى حركتين بسيطتين: أفقية (x) ثم عمودية (y).' },
        { title: 'المركبة الأفقية (x)', detail: 'نبدأ من نقطة الانطلاق. نتحرك يميناً (موجب) أو يساراً (سالب) حتى نصبح أسفل أو أعلى نقطة النهاية مباشرة.' },
        { title: 'المركبة العمودية (y)', detail: 'بعد الوصول، نصعد (موجب) أو ننزل (سالب) لنصل إلى رأس السهم.' },
    ];

    const challenges = [
        { dx: 3, dy: 2, startX: -2, startY: -1 },
        { dx: -4, dy: 1, startX: 2, startY: -1 },
        { dx: 0, dy: -3, startX: 0, startY: 2 },
        { dx: -2, dy: -2, startX: 1, startY: 1 },
    ];

    const currentChallenge = challenges[challengeStep];

    const resetChallenges = () => {
        setChallengeStep(0);
        setInputX(''); setInputY('');
        setError(false); setFeedback(null);
    };

    const handleAnswer = async () => {
        if (parseInt(inputX) === currentChallenge.dx && parseInt(inputY) === currentChallenge.dy) {
            setFeedback({ type: 'success', text: 'صحيح! قرأت مركبات الشعاع بدقة.' });
            setError(false);
            setInputX(''); setInputY('');

            if (challengeStep < challenges.length - 1) {
                confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1000);
            } else {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                try {
                    const data = await rewardService.claimLabReward('vec-read-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع اتجاه الحركة الأفقية والعمودية.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-fuchsia-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Grid size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تقرأ مركبات الشعاع من الشبكة، بالانتقال خطوة بخطوة من البداية إلى النهاية.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all">
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
                    {learnStep === 1 && (
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-emerald-400 font-black px-4 py-2 bg-emerald-400/10 rounded-xl text-sm">يمين = +</span>
                            <span className="text-rose-400 font-black px-4 py-2 bg-rose-400/10 rounded-xl text-sm">يسار = -</span>
                        </div>
                    )}
                    {learnStep === 2 && (
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-cyan-400 font-black px-4 py-2 bg-cyan-400/10 rounded-xl text-sm">أعلى = +</span>
                            <span className="text-rose-400 font-black px-4 py-2 bg-rose-400/10 rounded-xl text-sm">أسفل = -</span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
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
            level={challengeStep < 2 ? 1 : 2}
            hint="ابدأ من النقطة الخضراء، عد المربعات لليمين أو اليسار للوصول لـ x، ثم للأعلى أو الأسفل للوصول لـ y."
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-3">
                <VectorGrid dx={currentChallenge.dx} dy={currentChallenge.dy} startX={currentChallenge.startX} startY={currentChallenge.startY} isDarkMode={isDarkMode} />
                <div className="flex items-center gap-3 font-mono font-black" dir="ltr">
                    <span className="text-fuchsia-400 text-xl">V (</span>
                    <div className="flex flex-col gap-2">
                        <input type="number" value={inputX} onChange={e => setInputX(e.target.value)} aria-label="المركبة x" autoFocus
                            className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="x" />
                        <input type="number" value={inputY} onChange={e => setInputY(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} aria-label="المركبة y"
                            className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-700'}`} placeholder="y" />
                    </div>
                    <span className="text-fuchsia-400 text-xl">)</span>
                </div>
                <button onClick={handleAnswer} className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                    <CheckCircle2 size={18} /> تأكيد المركبات
                </button>
            </div>
        </LabChallenge>
    );
}

export default function VecReadLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="vec-read"
            phase={phase}
            title="تفكيك الحركة"
            badgeText="القراءة البيانية للمتجهات"
            badgeIcon={Grid}
            accentColor="fuchsia"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <VecReadContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
