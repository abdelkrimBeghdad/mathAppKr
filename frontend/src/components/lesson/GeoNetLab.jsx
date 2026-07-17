import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Layers, Layout, MousePointer2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function GeoNetContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [isUnfolded, setIsUnfolded] = useState(false);
    const [challengeStep, setChallengeStep] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ما هو نشر المجسم؟',
            detail: 'نشر المجسم هو عملية "فتحه" وجعله شكلاً مسطحاً. هذا يساعدنا على رؤية كل الأوجه وحساب المساحة الكلية بسهولة.',
            visual: (
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-32 h-32 flex items-center justify-center perspective-1000">
                        <motion.div
                            animate={{ rotateY: isUnfolded ? 0 : 45, rotateX: isUnfolded ? 0 : 20 }}
                            className="w-16 h-16 relative preserve-3d"
                        >
                            {!isUnfolded ? (
                                <div className="absolute inset-0 bg-indigo-500/40 border-2 border-indigo-400 backdrop-blur-md" />
                            ) : (
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 bg-indigo-500/20 border border-indigo-400" />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                    <button
                        onClick={() => setIsUnfolded(s => !s)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2"
                    >
                        {isUnfolded ? 'إغلاق المجسم' : 'نشر المجسم'} <MousePointer2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const challenges = [
        {
            q: 'إذا كانت مساحة الوجه الواحد للمكعب هي 9cm²، فكم تكون مساحته الكلية؟',
            correct: '54',
            options: ['36', '54', '81'],
            hint: 'المكعب يملك 6 أوجه متطابقة. اضرب مساحة الوجه في 6.',
        },
        {
            q: "كم وجهاً يظهر في 'نشر' متوازي المستطيلات؟",
            correct: '6',
            options: ['4', '6', '8'],
            hint: 'متوازي المستطيلات هو ابن عم المكعب، له نفس عدد الأوجه.',
        },
    ];

    const currentChallenge = challenges[challengeStep];

    const resetChallenges = () => {
        setChallengeStep(0); setFeedback(null); setReward(null);
    };

    const handleAnswer = async (choice) => {
        if (choice === currentChallenge.correct) {
            setFeedback({ type: 'success', text: 'صحيح! المساحة الكلية هي مجموع مساحات كل أوجه النشر. ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('geo-net-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ. فكر في عدد الأوجه الموجودة في الشكل المسطح.' });
        }
    };

    // ── intro ──────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                    <Layout size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تفتح المجسمات لترى "جلدها" الخارجي. مهارة النشر هي الطريق الوحيد لفهم وحساب المساحات الكلية للمجسمات.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all">
                    بدء عملية النشر
                </button>
            </div>
            <button onClick={() => { resetChallenges(); setPhase('practice'); }} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
                تخطي الشرح والبدء بالتحدي
            </button>
        </div>
    );

    // ── learn ──────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <h3 className={`text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    <div className="mx-auto min-h-[200px] flex items-center justify-center">
                        {learnPages[learnStep].visual}
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button
                    onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                    السابق
                </button>
                {learnStep < learnPages.length - 1 ? (
                    <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all flex items-center gap-2">
                        التالي <ArrowRight size={18} />
                    </button>
                ) : (
                    <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">
                        التدريب <CheckCircle2 size={18} />
                    </button>
                )}
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge بنوع choice ────────────────────────────
    return (
        <LabChallenge
            type="choice"
            current={challengeStep + 1}
            total={challenges.length}
            level={challengeStep + 1}
            question={currentChallenge.q}
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); }}
        >
            <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="خيارات الإجابة">
                {currentChallenge.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        className={`px-4 py-2 rounded-xl border-2 font-black text-2xl transition-all active:scale-95 ${isDarkMode
                                ? 'border-white/10 bg-black/40 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-white'
                                : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 text-slate-700'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
      `}} />
        </LabChallenge>
    );
}

export default function GeoNetLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="geo-net"
            phase={phase}
            title="مختبر الأوجه المسطحة"
            badgeText="المساحة والنشر"
            badgeIcon={Layers}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <GeoNetContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
