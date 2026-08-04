import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShieldCheck, Binary, Search, Check, X } from 'lucide-react';
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

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('coprime', lvl) }));
}

function CoprimeContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [numA, setNumA] = useState('');
    const [numB, setNumB] = useState('');
    const [customResult, setCustomResult] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const current = roundData.problem; // { a, b, ans, q, hint }

    useEffect(() => {
        labProgressService.getOne('coprime')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    setRounds(buildRounds(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const learnContent = [
        { title: 'بروتوكول التعريف', math: 'PGCD(a, b) = 1', detail: 'نقول أن العددين أوليان فيما بينهما إذا كان قاسمهما المشترك الأكبر هو الواحد فقط.', icon: <ShieldCheck size={20} /> },
        { title: 'اختبار الترابط', math: '25 ↔ 27', detail: 'قواسم 25: {1, 5, 25}. قواسم 27: {1, 3, 9, 27}. المشترك الوحيد هو {1}.', icon: <Binary size={20} /> },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('coprime', 'practice').catch(() => { });
    };

    const handleChallengeAnswer = async (answer) => {
        const isCoprime = current.ans === 'نعم';
        const correct = answer === isCoprime;
        const g = gcd(current.a, current.b);

        if (correct) {
            setFeedback({ type: 'success', text: `صحيح! PGCD(${current.a}, ${current.b}) = ${g}.` });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (round < 2) {
                setTimeout(() => {
                    setRound(r => r + 1);
                    setFeedback({ type: 'success', text: `أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                    setTimeout(() => setFeedback(null), 1000);
                }, 900);
            } else {
                setTimeout(async () => {
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                    await labProgressService.update('coprime', 'completed', 100).catch(() => { });
                    try {
                        const data = await rewardService.claimLabReward('coprime', {
                            type: 'coprime', a: current.a, b: current.b, ans: isCoprime,
                        });
                        if (data.status === 'success') setReward(data);
                    } catch (err) { console.error(err); }
                }, 900);
            }
        } else {
            setFeedback({ type: 'error', text: `راجع: PGCD(${current.a}, ${current.b}) = ${g}.` });
        }
    };

    const handleCustomCheck = () => {
        const a = parseInt(numA), b = parseInt(numB);
        if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return;
        const g = gcd(a, b);
        setCustomResult({ a, b, pgcd: g, coprime: g === 1 });
        if (g === 1) confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>موسوعة التعريفات</h3>
                <p className={`${theme.textSub} text-sm mb-3 font-medium`}>تعلم القاعدة الذهبية والفرق بين العدد الأولي والعددين الأوليين فيما بينهما.</p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-50 text-violet-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className={`w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100'}`}>
                    فتح الموسوعة
                </button>
            </div>
            <motion.button onClick={startPractice} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-violet-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <ShieldCheck size={36} className="animate-pulse" />
                    <span className="font-black text-xl uppercase tracking-widest">ميدان التحدي</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-3">{learnContent[learnStep].icon}</div>
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnContent[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnContent[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-violet-500/20' : 'bg-violet-50 border-violet-100'}`}>
                        <span className="font-mono font-black text-violet-400" dir="ltr">{learnContent[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(0) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >السابق</button>
                {learnStep < 1
                    ? <button onClick={() => setLearnStep(1)} className="px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-black">التالي</button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">تحدي الآن</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge بنوع choice ───────────────────────────
    return (
        <>
            <LabChallenge
                type="choice"
                current={round + 1}
                total={3}
                level={roundData.level}
                question="هل العددان أوليان فيما بينهما؟"
                hint={`PGCD(${current.a}, ${current.b}) = ${gcd(current.a, current.b)}`}
                feedback={feedback}
                reward={reward}
                onRefresh={() => setFeedback(null)}
                onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
            >
                <div className="w-full flex flex-col items-center gap-4">
                    <div className={`text-3xl font-black font-mono flex items-center justify-center gap-3 ${theme.textMain}`} dir="ltr">
                        <span className="text-sky-400">{current.a}</span>
                        <Search className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} size={20} />
                        <span className="text-amber-400">{current.b}</span>
                    </div>
                    <LabTutorialNote
                        from={`العددان المعطيان هما ${current.a} و${current.b}.`}
                        why={`إذا كان القاسم المشترك الأكبر بينهما (PGCD) يساوي 1 بالضبط، فهما أوليان فيما بينهما. أي قاسم مشترك آخر أكبر من 1 يعني أنهما ليسا كذلك.`}
                    />
                    <div className="flex flex-wrap gap-3 justify-center w-full" role="group" aria-label="اختر هل العددان أوليان فيما بينهما">
                        <button onClick={() => handleChallengeAnswer(true)} className="flex-1 min-w-[130px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                            <Check size={18} /> نعم (أوليان)
                        </button>
                        <button onClick={() => handleChallengeAnswer(false)} className="flex-1 min-w-[130px] py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                            <X size={18} /> لا (غير ذلك)
                        </button>
                    </div>
                </div>
            </LabChallenge>

            {/* أداة الاستكشاف الحر — ميزة إضافية محتفَظ بها، بنفس نظام التصميم */}
            <div className={`mt-4 w-full max-w-2xl p-4 rounded-[1.25rem] border backdrop-blur-xl transition-all shadow-lg ${theme.card}`}>
                <p className={`text-xs font-black uppercase tracking-widest mb-3 text-center ${theme.textSub}`}>أداة الاستكشاف الحر</p>
                <div className="flex flex-wrap gap-3 items-center justify-center">
                    <input type="number" value={numA} onChange={e => setNumA(e.target.value)} placeholder="العدد a" aria-label="العدد الأول"
                        className={`flex-1 min-w-[100px] border-2 rounded-xl p-2.5 text-center text-base font-black outline-none ${isDarkMode ? 'bg-black/40 border-white/10 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-900 focus:border-violet-500'}`} />
                    <input type="number" value={numB} onChange={e => setNumB(e.target.value)} placeholder="العدد b" aria-label="العدد الثاني"
                        className={`flex-1 min-w-[100px] border-2 rounded-xl p-2.5 text-center text-base font-black outline-none ${isDarkMode ? 'bg-black/40 border-white/10 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-900 focus:border-violet-500'}`} />
                    <button onClick={handleCustomCheck} aria-label="تحقق" className="p-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl transition-all">
                        <Send size={16} />
                    </button>
                </div>
                {customResult && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className={`mt-3 p-3 rounded-xl border-2 text-center font-black text-xs ${customResult.coprime
                                ? isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : isDarkMode ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                    >
                        {customResult.coprime
                            ? `PGCD(${customResult.a}, ${customResult.b}) = 1 → أوليان فيما بينهما ✓`
                            : `PGCD(${customResult.a}, ${customResult.b}) = ${customResult.pgcd} → ليسا أوليين فيما بينهما ✗`}
                    </motion.div>
                )}
            </div>
        </>
    );
}

export default function CoprimeLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="coprime"
            phase={phase}
            title="الأعداد الأولية فيما بينهما"
            badgeText="بروتوكول التمييز العددي"
            badgeIcon={ShieldCheck}
            accentColor="violet"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <CoprimeContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
