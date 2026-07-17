import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ArrowRight, CheckCircle2, RefreshCcw, RotateCw, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function RotationMasteryContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [userAngle, setUserAngle] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ما هو الدوران؟',
            detail: 'هو تحويل هندسي "يدور" فيه الشكل حول نقطة ثابتة (المركز) بزاوية معينة وفي اتجاه معين.',
            visual: (
                <div className="relative w-40 h-28 flex items-center justify-center border-2 border-white/5 rounded-full mx-auto">
                    <div className="absolute w-2 h-2 bg-rose-500 rounded-full z-20" />
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute w-20 h-0.5 bg-rose-500/30 origin-left" />
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute right-0 w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</motion.div>
                </div>
            ),
        },
        {
            title: 'الاتجاه الموجب والسالب',
            detail: 'الاتجاه عكس عقارب الساعة هو "الموجب" (+). والاتجاه مع عقارب الساعة هو "السالب" (-).',
            visual: (
                <div className="flex gap-4 items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <RefreshCcw className="text-emerald-400 animate-spin" style={{ animationDirection: 'reverse' }} size={36} />
                        <span className="text-emerald-400 font-bold text-sm">موجب (+)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <RotateCw className="text-rose-400 animate-spin" size={36} />
                        <span className="text-rose-400 font-bold text-sm">سالب (-)</span>
                    </div>
                </div>
            ),
        },
    ];

    const challenges = [
        { q: 'دور الشكل بزاوية 90 درجة في الاتجاه الموجب. كم ستكون الدرجة الجبرية؟', ans: 90, hint: 'الاتجاه الموجب هو عكس عقارب الساعة.' },
        { q: 'دور الشكل بزاوية 60 درجة في الاتجاه السالب (مع عقارب الساعة). ما هي القيمة الجبرية؟', ans: -60, hint: 'الاتجاه السالب يسبق بـ (-).' },
    ];

    const currentChallenge = challenges[challengeStep];

    const resetChallenges = () => { setChallengeStep(0); setUserAngle(''); setError(false); setFeedback(null); };

    const handleAnswer = async () => {
        if (parseInt(userAngle) === currentChallenge.ans) {
            setFeedback({ type: 'success', text: 'رائع! لقد حددت الدوران بدقة هندسية عالية.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); setUserAngle(''); }, 1400);
            } else {
                try {
                    const data = await rewardService.claimLabReward('rotation-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ. تذكر أن الاتجاه يغير إشارة الزاوية.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-fuchsia-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Compass size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تدور الأشكال في الفضاء حول مركز ثابت. الدوران هو لغة الهندسة التي تفسر حركة الكواكب والمحركات.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all">
                    فتح المختبر
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
                    <div className="mx-auto min-h-[160px] flex items-center justify-center">{learnPages[learnStep].visual}</div>
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
            level={challengeStep + 1}
            question={currentChallenge.q}
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                {/* رادار الدوران التفاعلي */}
                <div className="relative w-32 h-32 flex items-center justify-center border-4 border-dashed border-white/5 rounded-full">
                    <div className="absolute w-3 h-3 bg-rose-500 rounded-full" />
                    <motion.div
                        animate={{ rotate: isNaN(parseInt(userAngle)) ? 0 : parseInt(userAngle) }}
                        transition={{ type: 'spring', stiffness: 50 }}
                        className="w-24 h-1 bg-gradient-to-r from-rose-500 to-transparent origin-left rounded-full"
                    />
                    <Target className="absolute top-0 text-white/20" size={18} />
                </div>

                <div className="flex items-center gap-3 font-mono font-black text-xl" dir="ltr">
                    <input
                        type="number" value={userAngle}
                        onChange={e => setUserAngle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                        aria-label="أدخل الزاوية الجبرية"
                        autoFocus
                        className={`w-28 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-fuchsia-500/50 text-fuchsia-400 focus:border-fuchsia-400' : 'bg-white border-fuchsia-200 text-fuchsia-700 focus:border-fuchsia-500'
                            }`}
                        placeholder="± °"
                    />
                </div>

                <button onClick={handleAnswer} className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black transition-all">
                    تأكيد الزاوية
                </button>
            </div>
        </LabChallenge>
    );
}

export default function RotationMasteryLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="rotation-mastery"
            phase={phase}
            title="مختبر الرادار"
            badgeText="هندسة الدوران"
            badgeIcon={Compass}
            accentColor="fuchsia"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <RotationMasteryContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
