import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Cpu, ArrowRight, Zap as ZapIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { rewardService } from '../../utils/rewardService';

function RootsExpressionContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [step, setStep] = useState(0);
    const [practicePair, setPracticePair] = useState({ expr: '√20 + √45', steps: ['2√5 + 3√5', '5√5'], final: '5√5' });
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const simplificationGuide = [
        { title: 'بروتوكول التفكيك', detail: 'نفكك كل جذر إلى حاصل ضرب مربع تام في عدد أولي (مثلاً √20 = √4×5).' },
        { title: 'خوارزمية الاستخراج', detail: 'نستخرج الجذر التربيعي للمربعات التامة خارج المظلة الجذرية.' },
        { title: 'الدمج النهائي', detail: 'نجمع أو نطرح الحدود التي لها نفس الجذر للحصول على أبسط صورة.' },
    ];

    const options = [
        { expr: '√20 + √45', steps: ['2√5 + 3√5', '5√5'], final: '5√5' },
        { expr: '√8 + √18', steps: ['2√2 + 3√2', '5√2'], final: '5√2' },
        { expr: '√12 + √27', steps: ['2√3 + 3√3', '5√3'], final: '5√3' },
        { expr: '√50 − √8', steps: ['5√2 − 2√2', '3√2'], final: '3√2' },
        { expr: '√75 − √12', steps: ['5√3 − 2√3', '3√3'], final: '3√3' },
        { expr: '√32 + √8', steps: ['4√2 + 2√2', '6√2'], final: '6√2' },
        { expr: '√48 − √27', steps: ['4√3 − 3√3', '1√3'], final: '1√3' },
    ];

    const generateProblem = () => {
        const newProb = options[Math.floor(Math.random() * options.length)];
        setPracticePair(newProb);
        setPhase('practice');
        setStep(0);
        setInputVal('');
        setError(false); setFeedback(null); setReward(null);
        labProgressService.update('roots-expression', 'practice').catch(() => { });
    };

    const handleCheck = async () => {
        const normalizedInput = inputVal.replace(/\s+/g, '').replace(/√/g, '√');
        const normalizedTarget = practicePair.steps[step].replace(/\s+/g, '').replace(/√/g, '√');

        if (normalizedInput === normalizedTarget) {
            setError(false);
            if (step < practicePair.steps.length - 1) {
                setFeedback({ type: 'success', text: 'صحيح! خطوة تفكيك موفقة.' });
                confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
                setInputVal('');
                setTimeout(() => { setStep(s => s + 1); setFeedback(null); }, 900);
            } else {
                setFeedback({ type: 'success', text: 'تبسيط مثالي! وصلت لأبسط صورة للعبارة.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('roots-expression', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('roots-expression-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع خطوة التفكيك أو الدمج.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4 gap-3">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full ${theme.card}`}>
                <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Cpu size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تبسّط عبارات جذرية معقدة عبر تفكيكها إلى مربعات تامة، ثم دمج الحدود المتشابهة.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black transition-all">
                    فتح خريطة التبسيط
                </button>
            </div>
            <button onClick={generateProblem} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
                تخطي الشرح والبدء بالتحدي
            </button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-2xl px-2">
            <div className={`p-5 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-4 text-center ${theme.textMain}`}>خريطة التبسيط</h3>
                <div className="space-y-3">
                    {simplificationGuide.map((g, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-rose-50 border-rose-100'}`}>
                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-sm shrink-0">{i + 1}</div>
                            <div>
                                <h4 className={`font-bold text-xs ${theme.textMain}`}>{g.title}</h4>
                                <p className={`text-[11px] font-medium ${theme.textSub}`}>{g.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>السابق</button>
                <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">تفعيل المعالج <ArrowRight size={18} /></button>
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={step + 1}
            total={practicePair.steps.length}
            level={step + 1}
            question={practicePair.expr}
            hint="فكك كل جذر لمربع تام مضروب في عدد، ثم استخرج الجذر خارج المظلة."
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            <input
                type="text" value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                aria-label="أدخل خطوة التبسيط"
                dir="ltr"
                autoFocus
                className={`w-full max-w-xs rounded-xl text-center p-3 font-mono font-black text-lg outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-rose-500/50 text-rose-400 focus:border-rose-400' : 'bg-white border-rose-200 text-rose-700 focus:border-rose-500'
                    }`}
                placeholder="a√x ± b√x"
            />
            <button onClick={handleCheck} className="mt-4 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <ZapIcon size={18} /> تأكيد المعالجة
            </button>
        </LabChallenge>
    );
}

export default function RootsExpressionLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="roots-expression"
            phase={phase}
            title="تبسيط العبارات الجذرية"
            badgeText="بروتوكول المعالجة"
            badgeIcon={Cpu}
            accentColor="rose"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <RootsExpressionContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
