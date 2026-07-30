import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap as ZapIcon, ArrowDown, ArrowUp, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel, mode) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => {
        const params = difficultyEngine.getParams('linear', lvl);
        const maxCoeff = params.maxCoeff || 5;
        const maxInput = params.maxInput || 5;
        const a = (Math.floor(Math.random() * maxCoeff) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const b = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const x = (Math.floor(Math.random() * maxInput) + 1) * (Math.random() > 0.5 ? 1 : -1);
        return { level: lvl, a, b, x, mode };
    });
}

function AffineImageContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [baseLevel, setBaseLevel] = useState(1);
    const [mode, setMode] = useState('image');
    const [rounds, setRounds] = useState(() => buildRounds(1, 'image'));
    const [round, setRound] = useState(0);
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const { a, b, x } = roundData;

    useEffect(() => {
        labProgressService.getOne('aff-image')
            .then(progress => { if (progress) setBaseLevel(difficultyEngine.getLevel(progress)); })
            .catch(() => { });
    }, []);

    const startPractice = (chosenMode) => {
        setMode(chosenMode);
        setRounds(buildRounds(baseLevel, chosenMode));
        setRound(0);
        setInputVal('');
        setError(false); setFeedback(null); setReward(null);
        setPhase('practice');
        labProgressService.update('aff-image', 'practice').catch(() => { });
    };

    const resetSameMode = () => {
        setRounds(buildRounds(baseLevel, mode));
        setRound(0);
        setInputVal('');
        setError(false); setFeedback(null);
    };

    const handleCheck = async () => {
        const target = mode === 'image' ? (a * x + b) : x;
        if (parseFloat(inputVal) === target) {
            setError(false);
            setInputVal('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `صحيح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: mode === 'image' ? `الضرب في ${a} ثم إضافة ${b} تعطي النتيجة ${a * x + b}.` : `بعكس العمليات وجدنا x = ${x}.` });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('aff-image', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('aff-image', {
                        type: 'linear', x, y: a * x + b, m: a, b,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع خطوتي المعالجة: الضرب ثم الجمع (أو عكسهما).' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro — شاشة اختيار الوضع (صورة أم أصل) ────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <button onClick={() => startPractice('image')}
                className={`group relative p-6 rounded-[1.25rem] text-right transition-all border shadow-xl backdrop-blur-3xl flex flex-col gap-3 ${theme.card} hover:bg-orange-500/10 hover:border-orange-500/50`}
            >
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform"><ArrowDown size={24} /></div>
                <div>
                    <h3 className={`text-base font-black mb-2 ${theme.textMain}`}>حساب الصورة f(x)</h3>
                    <p className={`${theme.textSub} text-xs font-medium leading-relaxed`}>أدخل x، واحسب الناتج بضرب ثم جمع. 3 جولات تصاعدية.</p>
                </div>
            </button>
            <button onClick={() => startPractice('preimage')}
                className={`group relative p-6 rounded-[1.25rem] text-right transition-all border shadow-xl backdrop-blur-3xl flex flex-col gap-3 ${theme.card} hover:bg-amber-500/10 hover:border-amber-500/50`}
            >
                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:-rotate-12 transition-transform"><ArrowUp size={24} /></div>
                <div>
                    <h3 className={`text-base font-black mb-2 ${theme.textMain}`}>حساب العدد x</h3>
                    <p className={`${theme.textSub} text-xs font-medium leading-relaxed`}>اطرح الثابت ثم اقسم على المعامل لاكتشاف الأصل. 3 جولات تصاعدية.</p>
                </div>
            </button>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={round + 1}
            total={3}
            level={roundData.level}
            question={mode === 'image' ? `f(x) = ${a}x ${b >= 0 ? '+' : ''}${b}  —  أوجد f(${x})` : `f(x) = ${a}x ${b >= 0 ? '+' : ''}${b}  —  أوجد x إذا كانت f(x) = ${a * x + b}`}
            hint={mode === 'image' ? `اضرب ${x} في ${a} ثم أضف ${b}.` : `اطرح ${b} من ${a * x + b} ثم اقسم على ${a}.`}
            feedback={feedback}
            reward={reward}
            onRefresh={resetSameMode}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                <span className={theme.textMain}>{mode === 'image' ? `f(${x})` : 'x'} =</span>
                <input
                    type="number" value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCheck()}
                    aria-label="أدخل النتيجة"
                    autoFocus
                    className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-orange-500/50 text-orange-400 focus:border-orange-400' : 'bg-white border-orange-200 text-orange-700 focus:border-orange-500'
                        }`}
                    placeholder="؟"
                />
            </div>

            <LabTutorialNote
                from={mode === 'image'
                    ? `الدالة f(x) = ${a}x ${b >= 0 ? '+' : ''}${b}، والمدخل x = ${x}.`
                    : `الدالة f(x) = ${a}x ${b >= 0 ? '+' : ''}${b}، والناتج المعطى f(x) = ${a * x + b}.`}
                why={mode === 'image'
                    ? `نعوّض x في الدالة بالترتيب: أولاً الضرب (${a} × ${x} = ${a * x})، ثم الجمع (+ ${b} = ${a * x + b}).`
                    : `لعكس العملية نسير بالترتيب المعاكس: أولاً نطرح الثابت (${a * x + b} − ${b} = ${a * x})، ثم نقسم على المعامل (÷ ${a} = ${x}).`}
            />

            <button onClick={handleCheck} className="mt-4 w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <Send size={18} /> تفعيل المعالجة
            </button>
        </LabChallenge>
    );
}

export default function AffineImageLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="aff-image"
            phase={phase}
            title="معالج التآلف"
            badgeText="بروتوكول التآلف"
            badgeIcon={ZapIcon}
            accentColor="orange"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <AffineImageContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
