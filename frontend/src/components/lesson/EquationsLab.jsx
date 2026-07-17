import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Target, Zap as ZapIcon, RefreshCw, Binary, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function EquationsContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        { title: 'بروتوكول موازنة الموازين', detail: 'المعادلة هي ميزان رقمي دقيق. هدفنا الأساسي هو عزل المجهول x في طرف واحد عبر نقل الأرقام بحكمة.', math: 'x + a = b  →  x = b − a', icon: <Scale size={20} /> },
        { title: 'خوارزمية الانعكاس الإشاري', detail: 'عند نقل أي قيمة من كفة لأخرى يجب عكس عمليتها: الجمع يصبح طرحاً، والضرب يصبح قسمة.', math: 'x + 5 = 12  →  x = 12 − 5', icon: <RefreshCw size={20} /> },
        { title: 'بروتوكول الاختزال النهائي', detail: 'في المرحلة الأخيرة نقسم الطرفين على معامل x للوصول إلى القيمة الجوهريّة للمجهول.', math: '2x = 10  →  x = 10 ÷ 2', icon: <Binary size={20} /> },
    ];

    const challenges = [
        { q: 'x + 6 = 15', a: '9', hint: 'انقل +6 للطرف الآخر لتصبح −6.' },
        { q: 'x − 8 = 12', a: '20', hint: 'انقل −8 للطرف الآخر لتصبح +8.' },
        { q: '5x = 40', a: '8', hint: 'اقسم 40 على المعامل 5.' },
        { q: '2x + 4 = 14', a: '5', hint: 'أولاً انقل +4، ثم اقسم الناتج على 2.' },
        { q: '3x − 5 = 10', a: '5', hint: 'أولاً انقل −5 لتصبح +5، ثم اقسم على 3.' },
        { q: '12 − x = 7', a: '5', hint: 'فكر: 12 ناقص كم يساوي 7؟' },
    ];

    const currentChallenge = challenges[challengeStep];

    const resetChallenges = () => {
        setChallengeStep(0); setUserInput('');
        setError(false); setFeedback(null); setReward(null);
    };

    const handleAnswer = async () => {
        if (userInput.trim() === currentChallenge.a) {
            setFeedback({ type: 'success', text: 'معالجة مثالية! تم استخراج قيمة x بنجاح ✓' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            setUserInput('');
            setError(false);
            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1500);
            } else {
                try {
                    const data = await rewardService.claimLabReward('equations');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خلل في الموازنة الرقمية. تحقق من العمليات الحسابية.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ──────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>موسوعة التوازنات</h3>
                <p className={`${theme.textSub} text-sm mb-4 font-medium`}>
                    تعلم استراتيجيات عزل x وكيفية التلاعب بموازين المعادلات للوصول للحقيقة الرقمية.
                </p>
                <button
                    onClick={() => setPhase('learn')}
                    className={`w-full py-3 rounded-xl font-black transition-all text-sm border ${isDarkMode ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                >
                    بدء التدريب
                </button>
            </div>
            <motion.button
                onClick={() => { resetChallenges(); setPhase('practice'); }}
                className="relative group rounded-[1rem] overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="absolute inset-0 bg-violet-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-2">
                    <ZapIcon size={40} />
                    <span className="font-black text-xl uppercase tracking-widest">تفعيل المعالج</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ──────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={learnStep}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl ${theme.card}`}
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center">{learnPages[learnStep].icon}</div>
                        <h3 className={`text-lg font-black ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-violet-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-violet-50'}`}>
                            <span className="font-mono font-black text-violet-400 text-base" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button
                    onClick={() => learnStep > 0 ? setLearnStep(s => s - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all text-sm ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    السابق
                </button>
                {learnStep < learnPages.length - 1 ? (
                    <button onClick={() => setLearnStep(s => s + 1)} className="px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-black">التالي</button>
                ) : (
                    <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">بدء الاختبار</button>
                )}
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={challengeStep + 1}
            total={challenges.length}
            level={challengeStep < 2 ? 1 : challengeStep < 4 ? 2 : 3}
            question={currentChallenge.q}
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); }}
        >
            <div className="flex items-center gap-4 font-black font-mono" dir="ltr">
                <span className={`opacity-30 ${theme.textSub}`}>x =</span>
                <input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                    aria-label="أدخل قيمة x"
                    autoFocus
                    className={`w-24 md:w-36 rounded-xl p-3 text-center text-xl font-black outline-none transition-all border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-slate-950 text-violet-400 focus:border-violet-500 border-violet-500/50' : 'bg-white text-violet-700 border-violet-200 focus:border-violet-500'
                        }`}
                    placeholder="?"
                />
            </div>
            <button
                onClick={handleAnswer}
                className="mt-4 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all"
            >
                <Send size={18} /> تحقق من الإجابة
            </button>
        </LabChallenge>
    );
}

export default function EquationsLab() {
    const [phase, setPhase] = useState('intro');

    return (
        <LabShell
            labId="equations"
            phase={phase}
            title="هندسة المعادلات"
            badgeText="بروتوكول عزل المجاهيل"
            badgeIcon={Target}
            accentColor="violet"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <EquationsContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
