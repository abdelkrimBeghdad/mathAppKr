import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function VecMidpointContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0); // 0: مجموع، 1: قسمة
    const [challengeStep, setChallengeStep] = useState(0);
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const challenges = [
        { ax: 2, ay: 4, bx: 8, by: 6 },
        { ax: -4, ay: 3, bx: 2, by: -1 },
        { ax: -3, ay: -5, bx: 1, by: 3 },
    ];

    const currentChallenge = challenges[challengeStep];

    const learnPages = [
        {
            title: 'نقطة التوازن',
            detail: 'لحساب إحداثيات منتصف قطعة مستقيم، نبحث عن "مركز الثقل" أو نقطة التوازن بين البداية والنهاية.',
            visual: (
                <div className="flex flex-col items-center gap-2">
                    <Scale size={40} className="text-amber-400" />
                    <span className={`text-sm font-bold ${theme.textSub}`}>A ⟷ M ⟷ B</span>
                </div>
            ),
        },
        {
            title: 'قانون المتوسط الحسابي',
            detail: 'على عكس الشعاع (الذي نستخدم فيه الطرح)، المنتصف هو جمع ثم قسمة على 2.',
            visual: (
                <div className="flex flex-col gap-2 text-lg font-mono text-center" dir="ltr">
                    <div className={theme.textMain}>M</div>
                    <div className="text-emerald-400 text-base">(Xₐ + Xᵦ) / 2</div>
                    <div className="text-cyan-400 text-base">(Yₐ + Yᵦ) / 2</div>
                </div>
            ),
        },
        {
            title: 'مثال تطبيقي',
            detail: 'A(2, 4) و B(6, 8)',
            visual: (
                <div className="flex flex-col gap-1 text-base font-mono text-center" dir="ltr">
                    <div className={theme.textMain}><span className="text-emerald-400">X = (2+6)/2</span> = 4</div>
                    <div className={theme.textMain}><span className="text-cyan-400">Y = (4+8)/2</span> = 6</div>
                    <div className="mt-2 text-emerald-300 font-black">M(4, 6)</div>
                </div>
            ),
        },
    ];

    const hints = [
        'اجمع إحداثيات X معاً، واجمع إحداثيات Y معاً. تذكر: إشارة الناقص تطغى على الزائد.',
        'اقسم المجموع الذي حصلت عليه على 2 لتحصل على إحداثيات نقطة المنتصف.',
    ];

    const resetChallenges = () => {
        setChallengeStep(0); setStep(0);
        setInput1(''); setInput2('');
        setError(false); setFeedback(null);
    };

    const handleAnswer = async () => {
        let isCorrect = false;
        if (step === 0) {
            isCorrect = parseInt(input1) === currentChallenge.ax + currentChallenge.bx &&
                parseInt(input2) === currentChallenge.ay + currentChallenge.by;
        } else {
            const ansX = (currentChallenge.ax + currentChallenge.bx) / 2;
            const ansY = (currentChallenge.ay + currentChallenge.by) / 2;
            isCorrect = parseInt(input1) === ansX && parseInt(input2) === ansY;
        }

        if (isCorrect) {
            setError(false);
            setInput1(''); setInput2('');

            if (step === 0) {
                setFeedback({ type: 'success', text: 'صحيح! الآن اقسم الناتج على 2.' });
                setTimeout(() => { setStep(1); setFeedback(null); }, 900);
            } else {
                if (challengeStep < challenges.length - 1) {
                    setFeedback({ type: 'success', text: 'ممتاز! التحدي التالي.' });
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                    setTimeout(() => { setChallengeStep(s => s + 1); setStep(0); setFeedback(null); }, 900);
                } else {
                    setFeedback({ type: 'success', text: 'أتقنت حساب نقطة المنتصف!' });
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    try {
                        const data = await rewardService.claimLabReward('vec-midpoint-mastery');
                        if (data.status === 'success') setReward(data);
                    } catch (err) { console.error(err); }
                }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع قانون المتوسط الحسابي.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Scale size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف توجد النقطة المركزية (المنتصف) بين نقطتين، باستخدام قانون المتوسط الحسابي.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all">
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
                    <div className={`p-5 rounded-2xl border mx-auto max-w-md flex items-center justify-center min-h-[100px] ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        {learnPages[learnStep].visual}
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
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
            level={challengeStep + 1}
            question={`احسب إحداثيات المنتصف M : A(${currentChallenge.ax}, ${currentChallenge.ay})  B(${currentChallenge.bx}, ${currentChallenge.by})`}
            hint={hints[step]}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <p className={`text-xs font-black uppercase tracking-widest ${theme.textSub}`}>
                    {step === 0 ? 'الخطوة 1: اجمع إحداثيات x معاً، وإحداثيات y معاً' : 'الخطوة 2: اقسم المجاميع على 2'}
                </p>

                <div className="flex items-center gap-3 font-mono font-black" dir="ltr">
                    <span className="text-emerald-400 text-xl">M (</span>
                    {step === 0 ? (
                        <div className="flex items-center gap-3">
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="مجموع X" autoFocus
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="ΣX" />
                            <span className={theme.textMain}>,</span>
                            <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} aria-label="مجموع Y"
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-700'}`} placeholder="ΣY" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="X للمنتصف" autoFocus
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="Xₘ" />
                            <span className={theme.textMain}>,</span>
                            <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} aria-label="Y للمنتصف"
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-700'}`} placeholder="Yₘ" />
                        </div>
                    )}
                    <span className="text-emerald-400 text-xl">)</span>
                </div>

                <button onClick={handleAnswer} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                    <CheckCircle2 size={18} /> تأكيد
                </button>
            </div>
        </LabChallenge>
    );
}

export default function VecMidpointLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="vec-midpoint"
            phase={phase}
            title="مركز الثقل"
            badgeText="المنتصف والتوازن"
            badgeIcon={Scale}
            accentColor="amber"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <VecMidpointContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
