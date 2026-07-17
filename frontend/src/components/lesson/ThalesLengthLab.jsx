import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function ThalesLengthContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [problem, setProblem] = useState({ ad: 2, ab: 6, ae: 3, missing: 'ac', ans: 9 });
    const [step, setStep] = useState(0); // 0: إدخال، 1: تم
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'حساب طول مجهول',
            detail: 'تسمح نظرية طاليس (الخاصية المباشرة) بحساب طول ضلع مجهول في مثلث إذا علمنا أن هناك مستقيمين متوازيين.',
            math: 'AD/AB = AE/AC = DE/BC',
        },
        {
            title: 'الرابع المتناسب',
            detail: 'بما أن النسب متساوية، نستخدم "الرابع المتناسب" (جداء الطرفين يساوي جداء الوسطين) لإيجاد المجهول.',
            math: 'x = (a × b) / c',
        },
    ];

    const problems = [
        { ad: 2, ab: 6, ae: 3, missing: 'ac', ans: 9 }, { ad: 4, ab: 10, ae: 6, missing: 'ac', ans: 15 },
        { ad: 3, ab: 9, ac: 12, missing: 'ae', ans: 4 }, { ab: 10, ae: 2, ac: 8, missing: 'ad', ans: 2.5 },
        { ad: 5, ab: 15, ae: 4, missing: 'ac', ans: 12 }, { ad: 3, ab: 12, ac: 16, missing: 'ae', ans: 4 },
    ];

    const generateProblem = () => {
        const p = problems[Math.floor(Math.random() * problems.length)];
        setProblem(p);
        setPhase('practice');
        setStep(0);
        setInputVal('');
        setError(false);
        setFeedback(null);
        setReward(null);
    };

    const handleCheck = () => {
        if (parseFloat(inputVal) === problem.ans) {
            setStep(1);
            setFeedback({ type: 'success', text: 'حساب دقيق! أتقنت الرابع المتناسب.' });
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            rewardService.claimLabReward('thales-length').then(d => d.status === 'success' && setReward(d)).catch(console.error);
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: جداء الطرفين = جداء الوسطين.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>القاعدة المباشرة:</h3>
                <div className={`p-3 rounded-xl border text-center mb-3 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-sky-50 border-sky-100'}`}>
                    <div className={`text-base font-black font-mono ${theme.textMain}`} dir="ltr">
                        <span className="text-sky-400">AD/AB</span> = <span className="text-emerald-400">AE/AC</span>
                    </div>
                </div>
                <p className={`text-sm ${theme.textSub}`}>بمعرفة 3 أطوال، يمكننا حساب الطول الرابع (الرابع المتناسب).</p>
                <button
                    onClick={() => setPhase('learn')}
                    className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100'}`}
                >
                    تعلّم الطريقة
                </button>
            </div>
            <motion.button
                onClick={generateProblem}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-sky-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Triangle size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء الحساب</span>
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
                        <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-sky-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-sky-50'}`}>
                            <span className="font-mono font-black text-sky-400" dir="ltr">{learnPages[learnStep].math}</span>
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
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black">التالي</button>
                    : <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">ابدأ الحساب</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={1}
            total={1}
            level={2}
            question={`أوجد الطول المجهول ${problem.missing.toUpperCase()}`}
            hint="استخدم قاعدة الرابع المتناسب: جداء الطرفين = جداء الوسطين."
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">

                {/* رسم مثلث طاليس */}
                <svg width="150" height="112" viewBox="0 0 200 150">
                    <path d="M100 20 L20 140 L180 140 Z" fill="none" stroke={isDarkMode ? '#64748b' : '#94a3b8'} strokeWidth="2" />
                    <line x1="60" y1="80" x2="140" y2="80" stroke={isDarkMode ? '#0ea5e9' : '#0284c7'} strokeWidth="3" />
                    <text x="95" y="15" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>A</text>
                    <text x="10" y="145" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>B</text>
                    <text x="180" y="145" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>C</text>
                    <text x="50" y="85" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#7dd3fc' : '#0ea5e9'}>D</text>
                    <text x="145" y="85" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#7dd3fc' : '#0ea5e9'}>E</text>
                </svg>

                {/* النسبة */}
                <div className={`p-4 rounded-xl border font-mono text-sm flex justify-center gap-4 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} ${theme.textMain}`} dir="ltr">
                    <div>
                        <div className={`border-b-2 border-current pb-1 px-2 ${problem.missing === 'ad' ? 'text-sky-400 font-black' : ''}`}>{problem.missing === 'ad' ? 'AD' : problem.ad}</div>
                        <div className={`pt-1 px-2 ${problem.missing === 'ab' ? 'text-sky-400 font-black' : ''}`}>{problem.missing === 'ab' ? 'AB' : problem.ab}</div>
                    </div>
                    <div className="flex items-center font-black">=</div>
                    <div>
                        <div className={`border-b-2 border-current pb-1 px-2 ${problem.missing === 'ae' ? 'text-sky-400 font-black' : ''}`}>{problem.missing === 'ae' ? 'AE' : problem.ae}</div>
                        <div className={`pt-1 px-2 ${problem.missing === 'ac' ? 'text-sky-400 font-black' : ''}`}>{problem.missing === 'ac' ? 'AC' : problem.ac}</div>
                    </div>
                </div>

                {/* الإدخال */}
                <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                    <span className={`uppercase ${theme.textMain}`}>{problem.missing} =</span>
                    <input
                        type="number"
                        step="0.1"
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCheck()}
                        aria-label="أدخل الطول المجهول"
                        className={`w-24 rounded-xl text-center p-3 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-sky-500/50 text-sky-400 focus:border-sky-400' : 'bg-white border-sky-200 text-sky-700 focus:border-sky-500'
                            }`}
                        placeholder="?"
                        autoFocus
                    />
                </div>

                <button
                    onClick={handleCheck}
                    className="px-8 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black flex items-center gap-2 transition-all"
                >
                    <CheckCircle2 size={18} /> تحقق من الإجابة
                </button>
            </div>
        </LabChallenge>
    );
}

export default function ThalesLengthLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="thales-length"
            phase={phase}
            title="حساب طول بطاليس"
            badgeText="التناسب والهندسة"
            badgeIcon={Triangle}
            accentColor="sky"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <ThalesLengthContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
