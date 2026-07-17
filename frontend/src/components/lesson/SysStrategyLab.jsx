import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ArrowRight, CheckCircle2, Layers, Sigma } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function SysStrategyContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'فن اتخاذ القرار',
            detail: 'في الرياضيات، الوصول للحل ليس كافياً؛ اختيار الطريقة "الأسرع" والأقل عرضة للخطأ هو دليل الذكاء الحقيقي.',
            visual: (
                <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center text-emerald-400 gap-2"><Layers size={20} /> التعويض</div>
                    <div className={`text-lg font-black ${theme.textMain}`}>VS</div>
                    <div className="flex flex-col items-center text-blue-400 gap-2"><Sigma size={20} /> الجمع</div>
                </div>
            ),
        },
        {
            title: 'متى أستخدم التعويض؟',
            detail: 'ابحث دائماً عن مجهول معامله 1 أو -1. في هذه الحالة، عزله سيكون سهلاً جداً ولن ينتج عنه كسور معقدة.',
            visual: (
                <div className="flex flex-col gap-3 text-lg font-mono text-center" dir="ltr">
                    <div className={theme.textMain}>x + 3y = 7</div>
                    <div className="text-emerald-400 border-2 border-emerald-500/30 p-2 rounded-xl">x = 7 - 3y</div>
                    <div className="text-xs font-sans text-emerald-300">معامل x هنا هو 1، لذا التعويض ممتاز!</div>
                </div>
            ),
        },
        {
            title: 'متى أستخدم الجمع؟',
            detail: 'إذا كانت المعاملات متعاكسة (مثلاً +2y و -2y)، أو لا يوجد مجهول معامله 1، فالجمع هو الخيار الأفضل لتجنب الكسور.',
            visual: (
                <div className="flex flex-col gap-3 text-lg font-mono text-center" dir="ltr">
                    <div className={theme.textMain}>2x + 5y = 12</div>
                    <div className={theme.textMain}>3x - 5y = 3</div>
                    <div className="text-blue-400 border-2 border-blue-500/30 p-2 rounded-xl">5x + 0 = 15</div>
                    <div className="text-xs font-sans text-blue-300">المعاملات جاهزة للانفجار، الجمع هو الحل الأسرع!</div>
                </div>
            ),
        },
    ];

    const challenges = [
        { sys: ['x - 2y = 4', '3x + y = 5'], best: 'subst', reason: 'المعامل x في المعادلة الأولى هو 1. وكذلك المعامل y في المعادلة الثانية هو 1. التعويض سهل جداً هنا.' },
        { sys: ['4x + 3y = 10', '2x - 3y = 2'], best: 'add', reason: 'لاحظ أن لدينا +3y و -3y. الجمع سيخفي y فوراً بخطوة واحدة!' },
        { sys: ['3x + 2y = 8', '5x + 4y = 14'], best: 'add', reason: 'لا يوجد أي مجهول معامله 1. التعويض سينتج كسوراً. لذا يفضل ضرب المعادلة الأولى في -2 واستخدام الجمع.' },
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async (choice) => {
        if (choice === currentChallenge.best) {
            setFeedback({ type: 'success', text: 'اختيار ذكي وموفق!' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1400);
            } else {
                try {
                    const data = await rewardService.claimLabReward('sys-strategy-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'ليس الخيار الأسرع هنا. تأمل في المعاملات مرة أخرى.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-violet-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <BrainCircuit size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    الآن بعد أن أتقنت الطريقتين، اختبر ذكاءك في تحديد الطريقة الأسرع والأسهل لحل أي جملة تظهر أمامك.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل الإستراتيجي
                </button>
            </div>
            <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
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
                    <div className={`p-6 rounded-2xl border mx-auto max-w-md min-h-[140px] flex items-center justify-center ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        {learnPages[learnStep].visual}
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge بنوع choice ───────────────────────────
    return (
        <LabChallenge
            type="choice"
            current={challengeStep + 1}
            total={challenges.length}
            level={challengeStep + 1}
            hint={currentChallenge.reason}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setChallengeStep(0); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); setChallengeStep(0); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className={`w-full p-4 rounded-xl border flex flex-col items-center justify-center gap-2 font-mono text-base font-black ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} ${theme.textMain}`} dir="ltr">
                    <div>1) {currentChallenge.sys[0]}</div>
                    <div>2) {currentChallenge.sys[1]}</div>
                </div>

                <div className="w-full flex flex-col md:flex-row gap-3" role="group" aria-label="اختر طريقة الحل الأسهل">
                    <button
                        onClick={() => handleAnswer('subst')}
                        className={`flex-1 p-5 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-black text-sm transition-all active:scale-95 flex flex-col items-center gap-2 ${error ? 'opacity-60' : ''}`}
                    >
                        <Layers size={20} /> التعويض أسهل
                    </button>
                    <button
                        onClick={() => handleAnswer('add')}
                        className={`flex-1 p-5 rounded-xl border-2 border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-black text-sm transition-all active:scale-95 flex flex-col items-center gap-2 ${error ? 'opacity-60' : ''}`}
                    >
                        <Sigma size={20} /> الجمع أسهل
                    </button>
                </div>
            </div>
        </LabChallenge>
    );
}

export default function SysStrategyLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="sys-strategy"
            phase={phase}
            title="استراتيجية حل الأنظمة"
            badgeText="أي طريقة أختار؟"
            badgeIcon={BrainCircuit}
            accentColor="violet"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <SysStrategyContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
