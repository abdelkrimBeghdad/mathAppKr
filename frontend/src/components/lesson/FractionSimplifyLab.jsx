import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ShieldCheck, FlaskConical, ArrowRight, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

function gcd(x, y) {
    let a = Math.abs(x), b = Math.abs(y);
    while (b) { const t = b; b = a % b; a = t; }
    return a;
}

function buildChallenges(level) {
    // كل تحدٍ: { num, den } من generator الكسور — نُضيف الحقول المشتقة محلياً
    return difficultyEngine.generateChallengeSet('fraction', level, 4).map(c => {
        const g = gcd(c.num, c.den);
        return { ...c, expectedNum: c.num / g, expectedDen: c.den / g };
    });
}

function FractionSimplifyContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [level, setLevel] = useState(1);
    const [challenges, setChallenges] = useState(() => buildChallenges(1));
    const [challengeStep, setChallengeStep] = useState(0);
    const [userNum, setUserNum] = useState('');
    const [userDen, setUserDen] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('frac-simplify')
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
        setChallengeStep(0);
        setUserNum('');
        setUserDen('');
        setError(false);
        setFeedback(null);
    };

    const handleAnswer = async () => {
        const n = parseInt(userNum);
        const d = parseInt(userDen);

        if (isNaN(n) || isNaN(d) || d === 0) {
            setError(true);
            setFeedback({ type: 'error', text: 'تأكد من إدخال أعداد صحيحة، والمقام لا يساوي صفراً.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
            return;
        }

        if (n === currentChallenge.expectedNum && d === currentChallenge.expectedDen) {
            setFeedback({ type: 'success', text: 'تقطير مثالي! وصلت للجوهر غير القابل للاختزال.' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            setUserNum('');
            setUserDen('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1400);
            } else {
                await labProgressService.update('frac-simplify', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('frac-simplify');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'الكسر يحتاج لمزيد من التصفية — راجع القاسم المشترك الأكبر.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    const learnPages = [
        { title: 'بروتوكول التصفية الرقمية', detail: 'تبسيط الكسر يعني البحث عن أصغر صورة ممكنة له دون تغيير قيمته الجوهرية.', math: 'a/b ⟶ الصيغة المبسطة', icon: <Filter size={20} /> },
        { title: 'خوارزمية القاسم المطلق', detail: 'يكون الكسر غير قابل للاختزال إذا كان القاسم المشترك الأكبر بين البسط والمقام يساوي 1.', math: 'PGCD(a, b) = 1', icon: <ShieldCheck size={20} /> },
        { title: 'عملية التقطير الجبري', detail: 'لاختزال كسر، نقسم البسط والمقام على PGCD الخاص بهما لنحصل على الجوهر غير القابل للاختزال.', math: '(a ÷ g) / (b ÷ g)', icon: <FlaskConical size={20} /> },
    ];

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>بروتوكول التصفية:</h3>
                <div className={`p-3 rounded-xl border text-center mb-3 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-cyan-50 border-cyan-100'}`}>
                    <div className={`text-base font-black font-mono ${theme.textMain}`} dir="ltr">(a ÷ g) / (b ÷ g)</div>
                </div>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-50 text-cyan-600'}`}>
                    المستوى الحالي: {['', 'مبتدئ', 'متوسط', 'متقدم'][level]}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100'}`}
                >
                    فهم عملية التقطير
                </button>
            </div>
            <motion.button
                onClick={() => { resetChallenges(); setPhase('practice'); }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-cyan-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <FlaskConical size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء التقطير</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={learnStep}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl ${theme.card}`}
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">{learnPages[learnStep].icon}</div>
                        <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-cyan-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-cyan-50'}`}>
                            <span className="font-mono font-black text-cyan-400" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button
                    onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    السابق
                </button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">ابدأ التقطير</button>
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
            level={level}
            question="بسّط الكسر إلى أصغر صورة له"
            hint="اقسم البسط والمقام على القاسم المشترك الأكبر بينهما."
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="flex flex-col items-center gap-4 w-full">

                {/* الكسر الأصلي */}
                <div className={`px-6 py-3 rounded-2xl border font-mono font-black text-xl text-center ${isDarkMode ? 'bg-black/30 border-cyan-500/20 text-cyan-300' : 'bg-cyan-50 border-cyan-100 text-cyan-700'}`} dir="ltr">
                    {currentChallenge.num} / {currentChallenge.den}
                </div>

                {/* إدخال البسط والمقام */}
                <div className="flex items-center gap-3" dir="ltr">
                    <input
                        type="number"
                        value={userNum}
                        onChange={e => setUserNum(e.target.value)}
                        aria-label="البسط المبسط"
                        className={`w-20 rounded-xl p-3 text-center text-lg font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400 focus:border-cyan-500' : 'bg-white border-cyan-200 text-cyan-700 focus:border-cyan-500'
                            }`}
                        placeholder="؟"
                        autoFocus
                    />
                    <span className={`text-lg font-black opacity-50 ${theme.textMain}`}>/</span>
                    <input
                        type="number"
                        value={userDen}
                        onChange={e => setUserDen(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                        aria-label="المقام المبسط"
                        className={`w-20 rounded-xl p-3 text-center text-lg font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400 focus:border-cyan-500' : 'bg-white border-cyan-200 text-cyan-700 focus:border-cyan-500'
                            }`}
                        placeholder="؟"
                    />
                </div>

                <LabTutorialNote
                    from={`الكسر ${currentChallenge.num}/${currentChallenge.den}: القاسم المشترك الأكبر بين ${currentChallenge.num} و${currentChallenge.den} هو ${gcd(currentChallenge.num, currentChallenge.den)}.`}
                    why={`قسمة البسط والمقام على نفس العدد (القاسم المشترك الأكبر) لا تغيّر قيمة الكسر، لكنها تعطينا أصغر صورة ممكنة له.`}
                />

                <button
                    onClick={handleAnswer}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all"
                >
                    <Send size={18} /> تحقق من التبسيط
                </button>
            </div>
        </LabChallenge>
    );
}

export default function FractionSimplifyLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="frac-simplify"
            phase={phase}
            title="تبسيط الكسور"
            badgeText="بروتوكول التصفية الرقمية"
            badgeIcon={Filter}
            accentColor="cyan"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <FractionSimplifyContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
