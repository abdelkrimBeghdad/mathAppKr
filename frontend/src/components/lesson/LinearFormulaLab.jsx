import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ScanSearch, Zap as ZapIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => {
        const params = difficultyEngine.getParams('linear', lvl);
        const maxCoeff = params.maxCoeff || 5;
        const maxInput = params.maxInput || 5;
        const a = (Math.floor(Math.random() * maxCoeff) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const x = Math.floor(Math.random() * maxInput) + 1;
        return { level: lvl, a, x };
    });
}

function LinearFormulaContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [inputA, setInputA] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const { a, x } = roundData;

    useEffect(() => {
        labProgressService.getOne('lin-formula')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    setRounds(buildRounds(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setInputA('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('lin-formula', 'practice').catch(() => { });
    };

    const handleCheck = async () => {
        if (parseFloat(inputA) === a) {
            setError(false);
            setInputA('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `اكتشاف جبري مثالي! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'اكتشاف جبري مثالي! فككت شيفرة الدالة الخطية.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('lin-formula', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('lin-formula', {
                        type: 'linear', x, y: a * x, m: a, b: 0,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع القاعدة: a = f(x) ÷ x.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>القاعدة الذهبية:</h3>
                <div className={`p-4 rounded-xl border text-center mb-2 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-indigo-50 border-indigo-100'}`}>
                    <span className="font-mono font-black text-indigo-400" dir="ltr">a = f(x) / x</span>
                </div>
                <p className={`text-xs ${theme.textSub} mb-2 text-center`}>ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.</p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className={`w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}>
                    فتح دليل البروتوكول
                </button>
            </div>
            <motion.button onClick={startPractice} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <ScanSearch size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">تفعيل المسح الرقمي</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <div className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3"><ScanSearch size={20} /></div>
                <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>بما أن f(x) = ax، نستطيع عزل المعامل a بقسمة الناتج f(x) على المدخل x.</p>
                <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                    <span className="font-mono font-black text-indigo-400" dir="ltr">f(x) = ax ⟶ a = f(x) / x</span>
                </div>
            </div>
            <button onClick={startPractice} className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all">
                ابدأ المهمة
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
            question={`f(${x}) = ${a * x}`}
            hint={`a = ${a * x} ÷ ${x}`}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setInputA(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                <span className={theme.textMain}>a =</span>
                <input
                    type="number" value={inputA}
                    onChange={e => setInputA(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCheck()}
                    aria-label="أدخل قيمة المعامل"
                    autoFocus
                    className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400 focus:border-indigo-400' : 'bg-white border-indigo-200 text-indigo-700 focus:border-indigo-500'
                        }`}
                    placeholder="؟"
                />
            </div>

            <LabTutorialNote
                from={`القيمتان المعطاتان هما x = ${x} و f(x) = ${a * x}.`}
                why={`بما أن f(x) = ax دالة خطية تمر من الأصل، فالمعامل a هو ببساطة ناتج قسمة f(x) على x: ${a * x} ÷ ${x} = ${a}.`}
            />

            <button onClick={handleCheck} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <ZapIcon size={18} /> تأكيد التحليل
            </button>
        </LabChallenge>
    );
}

export default function LinearFormulaLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="lin-formula"
            phase={phase}
            title="استخراج المعامل"
            badgeText="وحدة التحليل"
            badgeIcon={Search}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <LinearFormulaContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
