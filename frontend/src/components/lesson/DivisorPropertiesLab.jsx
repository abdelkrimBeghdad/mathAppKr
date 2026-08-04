import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sigma, Binary, ArrowRight, ListChecks, Zap as ZapIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel, track) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('divisor-props', lvl), track }));
}

function DivisorPropertiesContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [track, setTrack] = useState(null); // null | 'sum' | 'remainder'
    const [rounds, setRounds] = useState([]);
    const [round, setRound] = useState(0);
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('div-props')
            .then(progress => { if (progress) setBaseLevel(difficultyEngine.getLevel(progress)); })
            .catch(() => { });
    }, []);

    const learnContent = [
        { title: 'المجموع والفرق', math: 'n | a ∧ n | b ⟶ n | (a±b)', detail: 'إذا كان العدد n يقسم كلاً من a و b، فهو حتماً يقسم مجموعهما وفرقهما.', icon: <Sigma size={20} /> },
        { title: 'باقي القسمة', math: 'n | a ∧ n | b ⟶ n | r', detail: 'إذا كان n يقسم كلاً من a و b، فهو يقسم أيضاً باقي قسمة a على b.', icon: <Binary size={20} /> },
    ];

    const startTrack = (t) => {
        setTrack(t);
        setRounds(buildRounds(baseLevel, t));
        setRound(0);
        setInputVal('');
        setError(false); setFeedback(null); setReward(null);
        labProgressService.update('div-props', 'practice').catch(() => { });
    };

    const resetTrackFully = () => {
        setTrack(null);
        setRounds([]);
        setRound(0);
        setFeedback(null);
        setError(false);
    };

    const roundData = rounds[round];
    const problem = roundData ? roundData.problem : null; // { n, a, b, sum, diff, remainder, sumQuot, diffQuot, remainderQuot }

    const handleVerify = async () => {
        if (!problem) return;
        const target = track === 'sum' ? problem.sumQuot : problem.remainderQuot;

        if (parseInt(inputVal) === target) {
            setError(false);
            setInputVal('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `تحقق ناجح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1500);
            } else {
                const text = track === 'sum'
                    ? `تحقق: ${problem.n} يقسم المجموع (${problem.sum}) بنجاح! الناتج = ${problem.sumQuot}.`
                    : `تحقق: ${problem.n} يقسم باقي القسمة (r = ${problem.remainder}) بنجاح! الناتج = ${problem.remainderQuot}.`;
                setFeedback({ type: 'success', text });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('div-props', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('div-props', {
                        type: 'divisor-props', n: problem.n, a: problem.a, b: problem.b, track, ans: target,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع القسمة: هل قسمت العدد الصحيح على n؟' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>موسوعة الخواص:</h3>
                <p className={`text-sm ${theme.textSub} mb-3`}>تعلم القواعد الأساسية التي تربط قواسم الأعداد ببعضها البعض.</p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}`}
                >
                    فتح الموسوعة
                </button>
            </div>
            <motion.button
                onClick={() => setPhase('practice')}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-emerald-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <ListChecks size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">دخول المخبر</span>
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
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">{learnContent[learnStep].icon}</div>
                        <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnContent[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnContent[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-emerald-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-emerald-50'}`}>
                            <span className="font-mono font-black text-emerald-400" dir="ltr">{learnContent[learnStep].math}</span>
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
                {learnStep < learnContent.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => setPhase('practice')} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">التجربة العملية</button>
                }
            </div>
        </div>
    );

    // ── practice: اختيار المسار ───────────────────────────────────────────────
    if (phase === 'practice' && !track) return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => startTrack('sum')}
                className={`p-5 rounded-[1.5rem] border-2 text-right transition-all backdrop-blur-3xl group ${theme.card} hover:border-emerald-500`}
            >
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Sigma size={20} /></div>
                <h3 className={`text-base font-black mb-2 ${theme.textMain}`}>مخبر المجموع والفرق</h3>
                <p className={`text-xs ${theme.textSub} mb-3`}>احسب ناتج قسمة المجموع على n. 3 جولات تصاعدية.</p>
                <div className="text-emerald-500 font-black text-sm flex items-center gap-2">دخول <ArrowRight size={16} /></div>
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => startTrack('remainder')}
                className={`p-5 rounded-[1.5rem] border-2 text-right transition-all backdrop-blur-3xl group ${theme.card} hover:border-emerald-500`}
            >
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Binary size={20} /></div>
                <h3 className={`text-base font-black mb-2 ${theme.textMain}`}>مخبر باقي القسمة</h3>
                <p className={`text-xs ${theme.textSub} mb-3`}>احسب ناتج قسمة الباقي r على n. 3 جولات تصاعدية.</p>
                <div className="text-emerald-500 font-black text-sm flex items-center gap-2">دخول <ArrowRight size={16} /></div>
            </motion.button>
        </div>
    );

    // ── practice: التحقق الفعلي — يستخدم LabChallenge ─────────────────────────
    if (!problem) return null;

    return (
        <LabChallenge
            type="text"
            current={round + 1}
            total={3}
            level={roundData.level}
            question={track === 'sum'
                ? `n=${problem.n}, a=${problem.a}, b=${problem.b}. بما أن n يقسم a وb، احسب: (a+b) ÷ n`
                : `n=${problem.n}, a=${problem.a}, b=${problem.b}. باقي قسمة a على b هو r=${problem.remainder}. احسب: r ÷ n`}
            hint={track === 'sum' ? `(${problem.a} + ${problem.b}) ÷ ${problem.n}` : `${problem.remainder} ÷ ${problem.n}`}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setInputVal(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetTrackFully(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <input
                    type="number" value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleVerify()}
                    aria-label="أدخل ناتج القسمة"
                    dir="ltr"
                    className={`w-32 rounded-xl p-3 text-center text-xl font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/40 text-emerald-300 focus:border-emerald-400' : 'bg-white border-emerald-200 text-emerald-700 focus:border-emerald-500'
                        }`}
                    placeholder="?"
                    autoFocus
                />
                <LabTutorialNote
                    from={track === 'sum'
                        ? `العدد n=${problem.n} يقسم a=${problem.a} وb=${problem.b} كلاهما بلا باقٍ.`
                        : `باقي قسمة ${problem.a} على ${problem.b} هو ${problem.remainder}.`}
                    why={track === 'sum'
                        ? `طالما n يقسم a وb، فهو يقسم مجموعهما حتماً — هذه خاصية أساسية في نظرية الأعداد. النتيجة هي ببساطة (a+b) مقسومة على n.`
                        : `نفس المبدأ ينطبق على الباقي: بما أن n يقسم كلاً من a وb، فهو يقسم الباقي الناتج عن قسمة أحدهما على الآخر أيضاً.`}
                />
                <button
                    onClick={handleVerify}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all"
                >
                    <ZapIcon size={18} /> تأكيد النتيجة
                </button>
            </div>
        </LabChallenge>
    );
}

export default function DivisorPropertiesLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="div-props"
            phase={phase}
            title="خصائص القواسم"
            badgeText="بروتوكول القواعد الذهبية"
            badgeIcon={ListChecks}
            accentColor="emerald"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <DivisorPropertiesContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
