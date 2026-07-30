import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sigma, Zap as ZapIcon, Binary, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import { rewardService } from '../../utils/rewardService';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('roots-multiply', lvl) }));
}

function RootsMultiplicationContent({ phase, setPhase }) {
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
    const practicePair = roundData.problem; // { a, b, res }

    useEffect(() => {
        labProgressService.getOne('roots-multiplication')
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
        { title: 'بروتوكول الاندماج الجذري', detail: 'عند ضرب جذرين تربيعيين، يمكننا دمج القيمتين تحت جذر واحد كبير لتبسيط العملية.', math: '√a × √b = √(a × b)', icon: <ZapIcon size={20} /> },
        { title: 'خوارزمية الضرب الموحد', detail: 'نضرب الأعداد الموجودة داخل الجذور ببعضها، ونضع الناتج تحت رمز جذر واحد مشترك.', math: '√2 × √3 = √6', icon: <Binary size={20} /> },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setInputVal(''); setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('roots-multiplication', 'practice').catch(() => { });
    };

    const handleCheck = async () => {
        if (parseInt(inputVal) === practicePair.res) {
            setError(false);
            setInputVal('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `صحيح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'اندماج جذري متكامل! ضربت الأعداد تحت جذر مشترك واحد.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('roots-multiplication', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('roots-multiplication', {
                        type: 'roots-multiply', a: practicePair.a, b: practicePair.b, result: practicePair.res,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: اضرب العددين الموجودين تحت الجذرين.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>قانون الدمج:</h3>
                <div className={`p-5 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-50 border-indigo-100'}`}>
                    <div className="text-lg font-black font-mono flex items-center justify-center gap-3" dir="ltr">
                        <span className="text-cyan-400">√a</span>
                        <span className={`opacity-40 ${theme.textMain}`}>×</span>
                        <span className="text-orange-400">√b</span>
                        <span className={theme.textMain}>=</span>
                        <span className="text-rose-400">√(a×b)</span>
                    </div>
                </div>
                <p className={`text-xs ${theme.textSub} mt-2 text-center`}>ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.</p>
                <div className={`mt-2 mb-1 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}>
                    فتح الشرح
                </button>
            </div>
            <button onClick={startPractice} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Sigma size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء التحدي</span>
                </div>
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
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">{learnPages[learnStep].icon}</div>
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <span className="font-mono font-black text-indigo-400" dir="ltr">{learnPages[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">بدء التحدي</button>
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
            question={`√${practicePair.a} × √${practicePair.b}`}
            hint={`اضرب ${practicePair.a} × ${practicePair.b}، ثم ضع الناتج تحت جذر واحد.`}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setInputVal(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                <span className="text-rose-500">√</span>
                <input
                    type="number" value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCheck()}
                    aria-label="أدخل الناتج تحت الجذر"
                    autoFocus
                    className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400 focus:border-indigo-400' : 'bg-white border-indigo-200 text-indigo-700 focus:border-indigo-500'
                        }`}
                    placeholder="؟"
                />
            </div>

            <LabTutorialNote
                from={`العددان تحت الجذرين هما ${practicePair.a} و${practicePair.b}.`}
                why={`ضرب جذرين تربيعيين يساوي جذر حاصل ضرب العددين: √${practicePair.a} × √${practicePair.b} = √(${practicePair.a} × ${practicePair.b}). اضرب العددين فقط، والجذر يُطبَّق مرة واحدة على الناتج.`}
            />

            <button onClick={handleCheck} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <ZapIcon size={18} /> تفعيل الاندماج
            </button>
        </LabChallenge>
    );
}

export default function RootsMultiplicationLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="roots-multiplication"
            phase={phase}
            title="ضرب الجذور التربيعية"
            badgeText="بروتوكول دمج الجذور"
            badgeIcon={ZapIcon}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <RootsMultiplicationContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
