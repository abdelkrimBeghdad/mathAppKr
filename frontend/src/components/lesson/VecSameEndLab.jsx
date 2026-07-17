import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function VecSameEndContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [isTransformed, setIsTransformed] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        { title: 'الهدف المشترك', detail: 'ماذا لو كان للشعاعين نفس نقطة النهاية؟ مثل AC + BC. هنا تكمن الخدعة التي ترهق الطلاب.' },
        { title: 'إعادة التوجيه', detail: 'نستخدم الانسحاب لنحول أحد الشعاعين ليبدأ من نقطة النهاية المشتركة C. هكذا نطبق علاقة شال بكل بساطة!' },
    ];

    const challenge = {
        q: 'AC + BC = ?',
        v1: { x1: 1, y1: 1, x2: 3, y2: 3 },
        v2: { x1: 5, y1: 1, x2: 3, y2: 3 },
    };

    const resetChallenge = () => {
        setIsTransformed(false); setFeedback(null);
    };

    const handleAnswer = async () => {
        setIsTransformed(true);
        setFeedback({ type: 'success', text: 'عبقري! حولت المسألة لعلاقة شال بتعديل المسار.' });
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        try {
            const data = await rewardService.claimLabReward('vec-same-end-mastery');
            if (data.status === 'success') setReward(data);
        } catch (err) { console.error(err); }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Target size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تتعامل مع الأشعة التي تصب في نفس النقطة، وكيف تعيد توجيهها لتطبيق علاقة شال بنجاح.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل التفاعلي
                </button>
            </div>
            <button onClick={() => { resetChallenge(); setPhase('practice'); }} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
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
                    : <button onClick={() => { resetChallenge(); setPhase('practice'); }} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="visual"
            current={1}
            total={1}
            level={3}
            question={challenge.q}
            hint="حوّل أحد الشعاعين ليبدأ من نقطة النهاية المشتركة C، ثم طبّق علاقة شال."
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenge}
            onRestart={() => { setPhase('intro'); resetChallenge(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className="relative w-64 h-32 mx-auto bg-black/20 rounded-2xl border border-white/10 flex items-center justify-center">
                    <svg viewBox="-1 -1 6 6" className="w-full h-full">
                        <g transform="scale(1, -1) translate(0, -5)">
                            <line x1={challenge.v1.x1} y1={challenge.v1.y1} x2={challenge.v1.x2} y2={challenge.v1.y2} stroke="#38bdf8" strokeWidth="0.15" markerEnd="url(#arrow-b)" />
                            <motion.line
                                animate={isTransformed ? { x: -2, y: 2 } : { x: 0, y: 0 }}
                                transition={{ type: 'spring', damping: 15 }}
                                x1={challenge.v2.x1} y1={challenge.v2.y1}
                                x2={challenge.v2.x2} y2={challenge.v2.y2}
                                stroke="#f472b6" strokeWidth="0.15" markerEnd="url(#arrow-p)"
                            />
                        </g>
                        <defs>
                            <marker id="arrow-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" /></marker>
                            <marker id="arrow-p" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f472b6" /></marker>
                        </defs>
                    </svg>
                </div>
                {!isTransformed && (
                    <button onClick={handleAnswer} className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                        <RefreshCw size={18} /> تحويل BC لتبدأ من C
                    </button>
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
