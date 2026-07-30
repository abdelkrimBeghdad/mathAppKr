import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('geo-pyramid', lvl) }));
}

function GeoPyramidContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [input1, setInput1] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const currentChallenge = roundData.problem; // { type, ans, q, hint, ... }

    useEffect(() => {
        labProgressService.getOne('geo-pyramid')
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
            title: 'الهرم والمخروط',
            detail: 'هي مجسمات تنتهي بنقطة واحدة في الأعلى تسمى "الرأس". الهرم قاعدته مضلع، والمخروط قاعدته دائرة.',
            visual: (
                <svg viewBox="0 0 100 100" className="w-40 h-32 overflow-visible mx-auto">
                    <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M 50 10 L 10 80 L 90 80 Z" fill="none" stroke="#f59e0b" strokeWidth="2" />
                    <line x1="50" y1="10" x2="50" y2="80" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4" />
                    <text x="52" y="45" fill="#f59e0b" fontSize="8" fontWeight="bold">الارتفاع h</text>
                </svg>
            ),
        },
        { title: 'قانون الثلث', detail: 'حجم الهرم أو المخروط هو دائماً "ثلث" حجم الأسطوانة أو المنشور الذي يملك نفس القاعدة والارتفاع.', math: 'V = (1/3) × B × h' },
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
        labProgressService.update('geo-pyramid', 'practice').catch(() => { });
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
                setFeedback({ type: 'success', text: 'رائع! لقد أتقنت قانون الثلث للهرم والمخروط.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('geo-pyramid', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('geo-pyramid', {
                        type: 'geo-pyramid', kind: currentChallenge.type, ans: currentChallenge.ans,
                        cylinderVol: currentChallenge.cylinderVol, baseArea: currentChallenge.baseArea, height: currentChallenge.height,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ. لا تنسَ القسمة على 3 في القانون.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Mountain size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    اكتشف سر العلاقة بين المجسمات ذات القمم الحادة ونظيراتها الأسطوانية. سنتعلم قانون "الثلث" السحري لحساب الأحجام.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all">
                    دخول مختبر القمم
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
                    {learnPages[learnStep].visual}
                    {learnPages[learnStep].math && (
                        <div className={`p-4 rounded-2xl border mx-auto max-w-md mt-2 ${isDarkMode ? 'bg-black/40 border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
                            <span className="font-mono font-black text-amber-400 text-xl" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
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
            hint={currentChallenge.hint}
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
                    className={`w-28 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400 focus:border-amber-400' : 'bg-white border-amber-200 text-amber-700 focus:border-amber-500'
                        }`}
                    placeholder="cm³"
                />
            </div>
            <LabTutorialNote
                from={currentChallenge.type === 'cylinderCone'
                    ? `حجم الأسطوانة المعطى هو ${currentChallenge.cylinderVol}cm³.`
                    : `مساحة قاعدة الهرم هي ${currentChallenge.baseArea}cm²، وارتفاعه ${currentChallenge.height}cm.`}
                why={currentChallenge.type === 'cylinderCone'
                    ? `حجم المخروط دائماً يساوي ثلث حجم الأسطوانة التي لها نفس القاعدة ونفس الارتفاع — لذا نقسم على 3 مباشرة.`
                    : `أي مجسم منتهٍ بقمة واحدة (هرم أو مخروط) حجمه يساوي ثلث حاصل ضرب مساحة القاعدة في الارتفاع، بخلاف الموشور أو الأسطوانة العادية.`}
            />
            <button onClick={handleAnswer} className="mt-4 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black transition-all">
                تحقق من الحجم
            </button>
        </LabChallenge>
    );
}

export default function GeoPyramidLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="geo-pyramid"
            phase={phase}
            title="مختبر القمم"
            badgeText="الهرم والمخروط"
            badgeIcon={Mountain}
            accentColor="amber"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <GeoPyramidContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
