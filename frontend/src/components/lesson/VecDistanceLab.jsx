import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function VecDistanceContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0); // 0: dx,dy  1: مجموع المربعات  2: الجذر
    const [challengeStep, setChallengeStep] = useState(0);
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const challenges = [
        { ax: 1, ay: 2, bx: 4, by: 6 },
        { ax: -2, ay: 1, bx: 4, by: -7 },
        { ax: -3, ay: -2, bx: 2, by: 10 },
    ];

    const currentChallenge = challenges[challengeStep];
    const dx = currentChallenge.bx - currentChallenge.ax;
    const dy = currentChallenge.by - currentChallenge.ay;
    const sumSq = dx * dx + dy * dy;
    const ans = Math.sqrt(sumSq);

    const learnPages = [
        {
            title: 'سر المسافة',
            detail: 'طويلة الشعاع (المسافة بين البداية والنهاية) هي ببساطة طول "وتر" في مثلث قائم الزاوية. هل تذكر نظرية فيثاغورس؟',
        },
        {
            title: 'قانون الجذر التربيعي',
            detail: 'نطرح إحداثيات (النهاية - البداية)، نربع النواتج، نجمعها، ثم نضع الجميع تحت الجذر التربيعي.',
            math: 'AB = √[(xᵦ-xₐ)² + (yᵦ-yₐ)²]',
        },
        {
            title: 'مثال تطبيقي',
            detail: 'A(1, 2) و B(4, 6)',
            math: 'AB = √(9+16) = √25 = 5',
        },
    ];

    const hints = [
        'احسب أولاً: (النهاية ناقص البداية لـ x) و (النهاية ناقص البداية لـ y).',
        'قم بتربيع العددين اللذين وجدتهما، ثم اجمعهما معاً.',
        'ما هو العدد الذي إذا ضربته في نفسه يعطيك الرقم الموجود تحت الجذر؟',
    ];

    const resetChallenges = () => {
        setChallengeStep(0); setStep(0);
        setInput1(''); setInput2('');
        setError(false); setFeedback(null);
    };

    const handleAnswer = async () => {
        let isCorrect = false;
        if (step === 0) isCorrect = parseInt(input1) === dx && parseInt(input2) === dy;
        else if (step === 1) isCorrect = parseInt(input1) === sumSq;
        else if (step === 2) isCorrect = parseInt(input1) === ans;

        if (isCorrect) {
            setError(false);
            setInput1(''); setInput2('');

            if (step < 2) {
                setFeedback({ type: 'success', text: 'صحيح! الخطوة التالية.' });
                setTimeout(() => { setStep(s => s + 1); setFeedback(null); }, 900);
            } else {
                if (challengeStep < challenges.length - 1) {
                    setFeedback({ type: 'success', text: 'ممتاز! التحدي التالي.' });
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                    setTimeout(() => { setChallengeStep(s => s + 1); setStep(0); setFeedback(null); }, 900);
                } else {
                    setFeedback({ type: 'success', text: 'أتقنت حساب طول المسافة!' });
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    try {
                        const data = await rewardService.claimLabReward('vec-distance-mastery');
                        if (data.status === 'success') setReward(data);
                    } catch (err) { console.error(err); }
                }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع الخطوة الحالية جيداً.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-fuchsia-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Ruler size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تحسب المسافة الدقيقة بين نقطتين (طويلة الشعاع) باستخدام قانون الجذر التربيعي المستمد من فيثاغورس.
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
                    {learnPages[learnStep].math && (
                        <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-fuchsia-500/20' : 'bg-fuchsia-50 border-fuchsia-100'}`}>
                            <span className="font-mono font-black text-fuchsia-400" dir="ltr">{learnPages[learnStep].math}</span>
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
            level={step + 1}
            question={`احسب المسافة AB : A(${currentChallenge.ax}, ${currentChallenge.ay})  B(${currentChallenge.bx}, ${currentChallenge.by})`}
            hint={hints[step]}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <p className={`text-xs font-black uppercase tracking-widest ${theme.textSub}`}>
                    {step === 0 ? 'الخطوة 1: احسب dx و dy' : step === 1 ? 'الخطوة 2: اجمع مربعي dx و dy' : 'الخطوة 3: احسب الجذر التربيعي'}
                </p>

                <div className="flex items-center gap-3 font-mono font-black" dir="ltr">
                    {step === 0 && (
                        <>
                            <span className={theme.textMain}>dx =</span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="dx" autoFocus
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="؟" />
                            <span className={theme.textMain}>dy =</span>
                            <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} aria-label="dy"
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-700'}`} placeholder="؟" />
                        </>
                    )}
                    {step === 1 && (
                        <>
                            <span className={theme.textMain}>dx² + dy² =</span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} aria-label="مجموع المربعات" autoFocus
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} placeholder="؟" />
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <span className="text-fuchsia-400 text-lg">AB =</span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} aria-label="المسافة النهائية" autoFocus
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-fuchsia-500/50 text-fuchsia-400' : 'bg-white border-fuchsia-200 text-fuchsia-700'}`} placeholder="؟" />
                        </>
                    )}
                </div>

                <button onClick={handleAnswer} className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                    <CheckCircle2 size={18} /> تأكيد
                </button>
            </div>
        </LabChallenge>
    );
}

export default function VecDistanceLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="vec-distance"
            phase={phase}
            title="طويلة الشعاع"
            badgeText="المسافة بين نقطتين"
            badgeIcon={Ruler}
            accentColor="fuchsia"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <VecDistanceContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
