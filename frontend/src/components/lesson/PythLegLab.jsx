import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/geometry.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('pyth-leg', lvl) }));
}

function PythLegContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const problem = roundData.problem; // { known, hyp, ans, q, hint }

    useEffect(() => {
        labProgressService.getOne('pyth-leg')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    setRounds(buildRounds(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const learnPages = [
        { title: 'حساب ضلع قائم', detail: 'لحساب طول أحد الضلعين القائمين، نطرح مربع الضلع القائم المعلوم من مربع الوتر.', math: 'AB² = AC² - BC²' },
        { title: 'خوارزمية الحساب', detail: 'نطرح مربع الضلع الصغير من مربع الوتر الكبير، ثم نحسب الجذر التربيعي للفرق للحصول على الضلع المجهول.', math: 'AB = √(AC² - BC²)' },
        { title: 'الجولات الثلاث', detail: 'ستحل 3 مثلثات مختلفة تتصاعد صعوبتها. المكافأة تُمنح فقط بعد الجولة الثالثة (الأصعب).', math: 'مبتدئ ➜ متوسط ➜ متقدم' },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setInputVal('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('pyth-leg', 'practice').catch(() => { });
    };

    const handleCheck = async () => {
        if (parseInt(inputVal) === problem.ans) {
            setError(false);
            setInputVal('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `إجابة دقيقة! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'إجابة دقيقة! حسبت الضلع القائم بنجاح.' });
                confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
                await labProgressService.update('pyth-leg', 'completed', 100).catch(() => { });
                try {
                    // الضلع الآخر (المعروف) هو problem.known، والمجهول هو problem.ans؛
                    // الوتر hyp، فنُرسل الثلاثي الكامل للتحقق: known² + ans² = hyp²
                    const data = await rewardService.claimLabReward('pyth-leg', {
                        type: 'pyth', a: problem.known, b: problem.ans, c: problem.hyp,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: الضلع² = الوتر² − الضلع الآخر².' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>القاعدة المباشرة:</h3>
                <div className={`p-3 rounded-xl border text-center mb-3 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-rose-50 border-rose-100'}`}>
                    <div className={`text-base font-black font-mono ${theme.textMain}`} dir="ltr">
                        AB = <span className="text-rose-400">√(AC² - BC²)</span>
                    </div>
                </div>
                <p className={`text-sm ${theme.textSub}`}>مربع الضلع القائم يساوي فرق مربعي الوتر والضلع الآخر. ستمر بـ 3 جولات تصاعدية الصعوبة.</p>
                <div className={`mt-3 mb-1 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'}`}>
                    تعلّم الطريقة
                </button>
            </div>
            <button onClick={startPractice} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-rose-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Triangle size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء الحساب</span>
                </div>
            </button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl ${theme.card}`}
                >
                    <div className="flex flex-col items-center text-center">
                        <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-rose-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-rose-50'}`}>
                            <span className="font-mono font-black text-rose-400" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black">التالي</button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">ابدأ الحساب</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={round + 1}
            total={3}
            level={roundData.level}
            question={problem.q}
            hint={problem.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setInputVal(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <svg width="150" height="105" viewBox="0 0 200 140">
                    <path d="M40 120 L40 30 L160 120 Z" fill="none" stroke={isDarkMode ? '#f43f5e' : '#e11d48'} strokeWidth="3" strokeLinejoin="round" />
                    <path d="M40 105 L55 105 L55 120" fill="none" stroke={isDarkMode ? '#f43f5e' : '#e11d48'} strokeWidth="2" />
                    <text x="25" y="25" fontSize="14" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>A</text>
                    <text x="25" y="135" fontSize="14" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>B</text>
                    <text x="165" y="135" fontSize="14" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>C</text>
                    <text x="15" y="80" fontSize="12" fill={isDarkMode ? '#94a3b8' : '#64748b'} fontWeight="bold">AB = ?</text>
                    <text x="90" y="138" fontSize="12" fill={isDarkMode ? '#94a3b8' : '#64748b'} fontWeight="bold">BC={problem.known}</text>
                    <text x="110" y="65" fontSize="12" fill={isDarkMode ? '#94a3b8' : '#64748b'} fontWeight="bold">AC={problem.hyp}</text>
                </svg>

                <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                    <span className={theme.textMain}>x =</span>
                    <input
                        type="number" value={inputVal} onChange={e => setInputVal(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCheck()}
                        aria-label="أدخل طول الضلع" autoFocus
                        className={`w-24 rounded-xl text-center p-3 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-rose-500/50 text-rose-400 focus:border-rose-400' : 'bg-white border-rose-200 text-rose-700 focus:border-rose-500'
                            }`}
                        placeholder="?"
                    />
                </div>

                <LabTutorialNote
                    from={`الوتر معروف = ${problem.hyp}cm، والضلع القائم الآخر معروف = ${problem.known}cm.`}
                    why={`هذه المرة المجهول ليس الوتر بل أحد الضلعين، لذا نعكس العملية: نطرح (لا نجمع) مربع الضلع المعلوم من مربع الوتر: ${problem.hyp}² − ${problem.known}² = ${problem.hyp * problem.hyp} − ${problem.known * problem.known} = ${problem.hyp * problem.hyp - problem.known * problem.known}.`}
                />

                <button onClick={handleCheck} className="px-8 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black flex items-center gap-2 transition-all">
                    <CheckCircle2 size={18} /> تحقق من الإجابة
                </button>
            </div>
        </LabChallenge>
    );
}

export default function PythLegLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="pyth-leg"
            phase={phase}
            title="حساب الضلع القائم"
            badgeText="فيثاغورس — إيجاد المجهول"
            badgeIcon={Triangle}
            accentColor="rose"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <PythLegContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
