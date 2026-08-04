import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/geometry.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

const LAB_ID = 'thales-length';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function ThalesLengthContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const problem = rounds[round]; // { level, ad, ab, ac, ae }

    const learnPages = [
        { title: 'حساب طول مجهول', detail: 'تسمح نظرية طاليس (الخاصية المباشرة) بحساب طول ضلع مجهول في مثلث إذا علمنا أن هناك مستقيمين متوازيين.', math: 'AD/AB = AE/AC = DE/BC' },
        { title: 'الرابع المتناسب', detail: 'بما أن النسب متساوية، نستخدم "الرابع المتناسب" (جداء الطرفين يساوي جداء الوسطين) لإيجاد المجهول.', math: 'AE = (AD × AC) / AB' },
        { title: 'الجولات الثلاث', detail: 'ستحسب 3 أطوال مجهولة بأرقام تتصاعد صعوبةً — الجولة الأخيرة قد تحتوي أعداداً أكبر.', math: 'مبتدئ ➜ متوسط ➜ متقدم' },
    ];

    useEffect(() => {
        labProgressService.getOne(LAB_ID)
            .then(p => { if (p) { const lvl = difficultyEngine.getLevel(p); setBaseLevel(lvl); setRounds(buildRounds(lvl)); } })
            .catch(() => { });
    }, []);

    const resetChallenges = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setInputVal('');
        setError(false);
        setFeedback(null);
        setReward(null);
    };

    const startPractice = () => {
        resetChallenges();
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const handleCheck = async () => {
        if (parseFloat(inputVal) === problem.ae) {
            setFeedback({ type: 'success', text: 'حساب دقيق! أتقنت الرابع المتناسب.' });
            setInputVal('');
            if (round < 2) {
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward(LAB_ID, {
                        type: 'thales-problem', kind: 'length',
                        a: problem.ad, b: problem.ab, c: problem.ac, ans: problem.ae,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
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
                <div className={`my-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-50 text-sky-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`mt-1 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100'}`}
                >
                    تعلّم الطريقة
                </button>
            </div>
            <motion.button
                onClick={startPractice}
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
            level={problem.level}
            question="أوجد الطول المجهول AE"
            hint="استخدم قاعدة الرابع المتناسب: جداء الطرفين = جداء الوسطين."
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); }}
            tourSteps={[
                { target: 'thales-length-ratio', title: 'النسبة المتناسبة', description: 'بما أن المستقيمان متوازيان، النسبتان AD/AB وAE/AC متساويتان تماماً.' },
                { target: 'lab-answer-input', title: 'حقل الإجابة', description: 'اضرب الطرفين (AD × AC) ثم اقسم الناتج على الوسط المعلوم (AB) لتحصل على AE.' },
                { target: 'lab-hint-button', title: 'بحاجة لمساعدة؟', description: 'اضغط هنا لتلميح سريع.' },
            ]}
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
                <div data-tour-id="thales-length-ratio" className={`p-4 rounded-xl border font-mono text-sm flex justify-center gap-4 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} ${theme.textMain}`} dir="ltr">
                    <div>
                        <div className="pb-1 px-2 border-b-2 border-current">{problem.ad}</div>
                        <div className="pt-1 px-2">{problem.ab}</div>
                    </div>
                    <div className="flex items-center font-black">=</div>
                    <div>
                        <div className="pb-1 px-2 border-b-2 border-current text-sky-400 font-black">AE</div>
                        <div className="pt-1 px-2">{problem.ac}</div>
                    </div>
                </div>

                {/* الإدخال */}
                <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                    <span className={`uppercase ${theme.textMain}`}>AE =</span>
                    <input
                        type="number"
                        data-tour-id="lab-answer-input"
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
            labId={LAB_ID}
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
