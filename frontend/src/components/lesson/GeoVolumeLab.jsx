import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, ArrowRight, CheckCircle2, Waves } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function GeoVolumeContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [fillLevel, setFillLevel] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [input1, setInput1] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ما هو الحجم؟',
            detail: 'الحجم هو مقدار "الفراغ" الذي يشغله المجسم من الداخل. نقيسه عادة بالوحدة المكعبة (cm³).',
            visual: (
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-28 h-36 border-2 border-white/20 rounded-xl overflow-hidden bg-white/5 flex items-end">
                        <motion.div animate={{ height: `${fillLevel}%` }} transition={{ type: 'spring', damping: 15 }} className="w-full bg-blue-500/40 relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-blue-300/50 -translate-y-1/2 blur-sm" />
                            <Waves className="absolute top-2 left-1/2 -translate-x-1/2 text-blue-300 opacity-30 animate-pulse" />
                        </motion.div>
                    </div>
                    <button onClick={() => setFillLevel(fillLevel === 100 ? 0 : 100)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black flex items-center gap-2 transition-all active:scale-95 text-sm">
                        {fillLevel === 100 ? 'تفريغ' : 'ملء بالماء'} <Droplet size={16} />
                    </button>
                </div>
            ),
        },
        { title: 'القاعدة الذهبية', detail: 'حجم أي مجسم قاعدته ثابتة هو: مساحة القاعدة (B) ضرب الارتفاع (h).', math: 'V = B × h' },
    ];

    const challenges = [
        { q: 'مكعب طول ضلعه 3cm. احسب حجمه.', ans: 27, formula: 'V = 3 × 3 × 3' },
        { q: 'متوازي مستطيلات مساحة قاعدته 10cm² وارتفاعه 5cm. ما هو حجمه؟', ans: 50, formula: 'V = 10 × 5' },
    ];

    const currentChallenge = challenges[challengeStep];

    const resetChallenges = () => { setChallengeStep(0); setInput1(''); setError(false); setFeedback(null); };

    const handleAnswer = async () => {
        if (parseInt(input1) === currentChallenge.ans) {
            setFeedback({ type: 'success', text: 'صحيح! لقد ملأت الفراغ بالحساب الدقيق.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setInput1('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1400);
            } else {
                try {
                    const data = await rewardService.claimLabReward('geo-volume-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ. اضرب مساحة القاعدة في الارتفاع.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Waves size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تقيس الفراغ الداخلي للمجسمات وتكتشف القوانين التي تسمح لنا بحساب سعة الخزانات والمباني الضخمة.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all">
                    دخول مختبر السعة
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
                    {learnPages[learnStep].visual && (
                        <div className="mx-auto min-h-[180px] flex items-center justify-center">{learnPages[learnStep].visual}</div>
                    )}
                    {learnPages[learnStep].math && (
                        <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                            <span className="font-mono font-black text-blue-400 text-xl" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
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
            hint={currentChallenge.formula}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                <span className={theme.textMain}>V =</span>
                <input
                    type="number" value={input1}
                    onChange={e => setInput1(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                    aria-label="أدخل الحجم"
                    autoFocus
                    className={`w-28 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-blue-500/50 text-blue-400 focus:border-blue-400' : 'bg-white border-blue-200 text-blue-700 focus:border-blue-500'
                        }`}
                    placeholder="cm³"
                />
            </div>
            <button onClick={handleAnswer} className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all">
                تحقق من الحجم
            </button>
        </LabChallenge>
    );
}

export default function GeoVolumeLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="geo-volume"
            phase={phase}
            title="مختبر السعة"
            badgeText="الحجوم والسعة"
            badgeIcon={Waves}
            accentColor="blue"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <GeoVolumeContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
