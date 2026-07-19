import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function buildChallenges(level) {
    return difficultyEngine.generateChallengeSet('trig-length', level, 3);
}

function TrigLengthContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [level, setLevel] = useState(1);
    const [challenges, setChallenges] = useState(() => buildChallenges(1));
    const [challengeStep, setChallengeStep] = useState(0);
    const [step, setStep] = useState(0); // 0: اختيار النسبة، 1: الحساب
    const [selectedRatio, setSelectedRatio] = useState(null);
    const [input1, setInput1] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('trig-length')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setLevel(lvl);
                    setChallenges(buildChallenges(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const currentChallenge = challenges[challengeStep];

    const resetChallenges = () => {
        setChallenges(buildChallenges(level));
        setChallengeStep(0); setStep(0);
        setSelectedRatio(null); setInput1('');
        setFeedback(null);
    };

    const handleRatioSelection = (ratio) => {
        if (ratio === currentChallenge.correctRatio) {
            setSelectedRatio(ratio);
            setStep(1);
            setFeedback(null);
        } else {
            setFeedback({ type: 'error', text: 'اختيار غير مناسب. راجع الأضلاع المعطاة والمطلوبة.' });
            setTimeout(() => setFeedback(null), 1200);
        }
    };

    const handleAnswer = async () => {
        if (Math.abs(parseFloat(input1) - currentChallenge.ans) < 0.1) {
            setFeedback({ type: 'success', text: 'رائع! الضرب التبادلي أعطاك النتيجة الصحيحة.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setInput1('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setStep(0); setSelectedRatio(null); setFeedback(null); }, 1400);
            } else {
                await labProgressService.update('trig-length', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('trig-length-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: `خطأ في الحساب. جرب استخدام النسبة ${selectedRatio} مباشرة.` });
            setTimeout(() => setFeedback(null), 1200);
        }
    };

    const learnPages = [
        { title: 'إيجاد المجهول', detail: 'عندما نملك زاوية وضلعاً واحداً، يمكننا إيجاد أي ضلع آخر باستخدام النسبة المناسبة.' },
        {
            title: 'استراتيجية الاختيار',
            detail: 'اسأل نفسك: ما هو الضلع "المعطى"؟ وما هو "المطلوب"؟ إذا كان المعطى مجاوراً والمطلوب وتراً، استخدم الكوسينوس.',
            rules: [
                { label: 'مجاور + وتر → Cos', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
                { label: 'مقابل + وتر → Sin', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                { label: 'مقابل + مجاور → Tan', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            ],
        },
    ];

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Ruler size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تختار النسبة المثلثية الصحيحة وتستخدمها لإيجاد طول ضلع مجهول.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                    المستوى الحالي: {['', 'مبتدئ', 'متوسط', 'متقدم'][level]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all">
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
                    {learnPages[learnStep].rules && (
                        <div className="flex flex-col gap-2 max-w-xs mx-auto">
                            {learnPages[learnStep].rules.map((r, i) => (
                                <div key={i} className={`p-2 rounded-lg border text-xs font-bold ${r.color}`}>{r.label}</div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type={step === 0 ? 'choice' : 'text'}
            current={challengeStep + 1}
            total={challenges.length}
            level={level}
            question={currentChallenge.q}
            hint={step === 0 ? `المعطى: ${currentChallenge.given} — المطلوب: ${currentChallenge.needed}` : 'اضرب الوتر (أو الضلع المعطى) في قيمة النسبة المثلثية.'}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            {step === 0 ? (
                <div className="flex gap-2 w-full" role="group" aria-label="اختر النسبة المناسبة">
                    {['Sin', 'Cos', 'Tan'].map(r => (
                        <button
                            key={r}
                            onClick={() => handleRatioSelection(r)}
                            className={`flex-1 py-3 rounded-xl font-black border-2 transition-all ${isDarkMode ? 'bg-black/40 border-white/10 text-white hover:border-emerald-500' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 font-mono font-black" dir="ltr">
                        <span className={theme.textMain}>x =</span>
                        <input
                            type="number" step="0.1" value={input1}
                            onChange={e => setInput1(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                            aria-label="أدخل الطول"
                            autoFocus
                            className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400 focus:border-emerald-400' : 'bg-white border-emerald-200 text-emerald-700 focus:border-emerald-500'
                                }`}
                            placeholder="؟"
                        />
                    </div>
                    <button onClick={handleAnswer} className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                        <CheckCircle2 size={18} /> تحقق من الطول
                    </button>
                </>
            )}
        </LabChallenge>
    );
}

export default function TrigLengthLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="trig-length"
            phase={phase}
            title="إيجاد الطول المجهول"
            badgeText="استراتيجية اختيار النسبة"
            badgeIcon={Ruler}
            accentColor="emerald"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <TrigLengthContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
