import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, ArrowRight, CheckCircle2, Waves } from 'lucide-react';
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
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('geo-volume', lvl) }));
}

function GeoVolumeContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [fillLevel, setFillLevel] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [input1, setInput1] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const currentChallenge = roundData.problem; // { type, ans, q, formula, ... }

    useEffect(() => {
        labProgressService.getOne('geo-volume')
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

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setInput1('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('geo-volume', 'practice').catch(() => { });
    };

    const handleAnswer = async () => {
        if (parseInt(input1) === currentChallenge.ans) {
            setError(false);
            setInput1('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `صحيح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'صحيح! لقد ملأت الفراغ بالحساب الدقيق.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('geo-volume', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('geo-volume', {
                        type: 'geo-volume', kind: currentChallenge.type, ans: currentChallenge.ans,
                        side: currentChallenge.side, baseArea: currentChallenge.baseArea, height: currentChallenge.height,
                        triBase: currentChallenge.triBase, triHeight: currentChallenge.triHeight, prismLength: currentChallenge.prismLength,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ. راجع القانون المناسب لهذا المجسم.' });
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
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all">
                    دخول مختبر السعة
                </button>
            </div>
            <button onClick={startPractice} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
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
                    : <button onClick={startPractice} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
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
            question={currentChallenge.q}
            hint={currentChallenge.formula}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setInput1(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
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
            <LabTutorialNote
                from={currentChallenge.type === 'cube'
                    ? `ضلع المكعب هو ${currentChallenge.side}cm — وكل أضلاعه متساوية.`
                    : currentChallenge.type === 'rect'
                        ? `مساحة القاعدة معطاة مباشرة (${currentChallenge.baseArea}cm²)، والارتفاع (${currentChallenge.height}cm).`
                        : `قاعدة الموشور مثلث (قاعدة=${currentChallenge.triBase}cm، ارتفاع=${currentChallenge.triHeight}cm)، وطول الموشور (${currentChallenge.prismLength}cm).`}
                why={currentChallenge.type === 'cube'
                    ? `المكعب حالة خاصة من "مساحة القاعدة × الارتفاع": بما أن كل الأبعاد متساوية، نضرب الضلع في نفسه 3 مرات.`
                    : currentChallenge.type === 'rect'
                        ? `القانون العام V = B × h ينطبق مباشرة هنا؛ لا حاجة لحساب مساحة القاعدة لأنها مُعطاة سلفاً.`
                        : `أولاً نحسب مساحة قاعدة المثلث (قاعدة×ارتفاع÷2)، ثم نضربها في طول الموشور لنحصل على الحجم الكلي.`}
            />
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
