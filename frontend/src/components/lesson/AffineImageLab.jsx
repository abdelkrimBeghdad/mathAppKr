import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap as ZapIcon, ArrowDown, ArrowUp, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function AffineImageContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [level, setLevel] = useState(1);
    const [mode, setMode] = useState('image'); // 'image' | 'preimage'
    const [a, setA] = useState(2);
    const [b, setB] = useState(3);
    const [x, setX] = useState(4);
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('affine-image')
            .then(progress => { if (progress) setLevel(difficultyEngine.getLevel(progress)); })
            .catch(() => { });
    }, []);

    const generateProblem = (newMode) => {
        const params = difficultyEngine.getParams('linear', level);
        const maxCoeff = params.maxCoeff || 5;
        const maxInput = params.maxInput || 5;

        const newA = (Math.floor(Math.random() * maxCoeff) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const newB = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const newX = (Math.floor(Math.random() * maxInput) + 1) * (Math.random() > 0.5 ? 1 : -1);

        setA(newA); setB(newB); setX(newX);
        setMode(newMode || mode);
        setPhase('practice');
        setInputVal('');
        setError(false); setFeedback(null); setReward(null);
        labProgressService.update('affine-image', 'practice').catch(() => { });
    };

    const handleCheck = async () => {
        const target = mode === 'image' ? (a * x + b) : x;
        if (parseFloat(inputVal) === target) {
            setFeedback({ type: 'success', text: mode === 'image' ? `الضرب في ${a} ثم إضافة ${b} تعطي النتيجة ${a * x + b}.` : `بعكس العمليات وجدنا x = ${x}.` });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            await labProgressService.update('affine-image', 'completed', 100).catch(() => { });
            try {
                const data = await rewardService.claimLabReward('affine-image-mastery');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع خطوتي المعالجة: الضرب ثم الجمع (أو عكسهما).' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro — شاشة اختيار الوضع (صورة أم أصل) ────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <button onClick={() => generateProblem('image')}
                className={`group relative p-6 rounded-[1.25rem] text-right transition-all border shadow-xl backdrop-blur-3xl flex flex-col gap-3 ${theme.card} hover:bg-orange-500/10 hover:border-orange-500/50`}
            >
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform"><ArrowDown size={24} /></div>
                <div>
                    <h3 className={`text-base font-black mb-2 ${theme.textMain}`}>حساب الصورة f(x)</h3>
                    <p className={`${theme.textSub} text-xs font-medium leading-relaxed`}>أدخل x، واحسب الناتج بضرب ثم جمع.</p>
                </div>
            </button>
            <button onClick={() => generateProblem('preimage')}
                className={`group relative p-6 rounded-[1.25rem] text-right transition-all border shadow-xl backdrop-blur-3xl flex flex-col gap-3 ${theme.card} hover:bg-amber-500/10 hover:border-amber-500/50`}
            >
                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:-rotate-12 transition-transform"><ArrowUp size={24} /></div>
                <div>
                    <h3 className={`text-base font-black mb-2 ${theme.textMain}`}>حساب العدد x</h3>
                    <p className={`${theme.textSub} text-xs font-medium leading-relaxed`}>اطرح الثابت ثم اقسم على المعامل لاكتشاف الأصل.</p>
                </div>
            </button>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={1}
            total={1}
            level={level}
            question={mode === 'image' ? `f(x) = ${a}x ${b >= 0 ? '+' : ''}${b}  —  أوجد f(${x})` : `f(x) = ${a}x ${b >= 0 ? '+' : ''}${b}  —  أوجد x إذا كانت f(x) = ${a * x + b}`}
            hint={mode === 'image' ? `اضرب ${x} في ${a} ثم أضف ${b}.` : `اطرح ${b} من ${a * x + b} ثم اقسم على ${a}.`}
            feedback={feedback}
            reward={reward}
            onRefresh={() => generateProblem(mode)}
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
            labId="affine-image"
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
