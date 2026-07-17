import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, Target, Crosshair, ArrowRight, CheckCircle2, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function buildChallenges(level) {
    return difficultyEngine.generateChallengeSet('scientific-notation', level, 4);
}

function ScientificNotationContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [level, setLevel] = useState(1);
    const [challenges, setChallenges] = useState(() => buildChallenges(1));
    const [challengeStep, setChallengeStep] = useState(0);
    const [userInput, setUserInput] = useState({ a: '', n: '' });
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('scientific-notation')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setLevel(lvl);
                    setChallenges(buildChallenges(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const currentChallenge = challenges[challengeStep];

    const resetChallenges = () => {
        setChallenges(buildChallenges(level));
        setChallengeStep(0);
        setUserInput({ a: '', n: '' });
        setError(false);
        setFeedback(null);
    };

    const handleAnswer = async () => {
        if (userInput.a.trim() === currentChallenge.a && userInput.n.trim() === currentChallenge.n) {
            setFeedback({ type: 'success', text: 'تمت المعالجة العلمية بنجاح! تطابق رقمي مثالي.' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            setUserInput({ a: '', n: '' });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1400);
            } else {
                await labProgressService.update('scientific-notation', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('scientific-notation-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ في معايير الكتابة. تأكد من قيمة a ومن عدد المراتب n.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    const learnPages = [
        { title: 'بروتوكول الضغط العلمي', detail: 'الكتابة العلمية هي شفرة لتبسيط الأعداد الضخمة أو المتناهية في الصغر لتسهيل قراءتها ومعالجتها.', math: 'a × 10ⁿ', icon: <Microscope size={20} /> },
        { title: 'معيار المعامل الذهبي', detail: 'يجب أن يكون المعامل a عدداً عشرياً يحمل رقماً واحداً فقط غير معدوم قبل الفاصلة.', math: '1 ≤ a < 10', icon: <Target size={20} /> },
        { title: 'خوارزمية ملاحقة الأصفار', detail: 'نحرك الفاصلة لليسار ليكون الأس موجباً (أعداد كبيرة)، ولليمين ليكون الأس سالباً (أعداد صغيرة).', math: 'يسار ⟶ n+ | يمين ⟶ n-', icon: <Crosshair size={20} /> },
    ];

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>بروتوكول التشفير:</h3>
                <p className={`text-sm ${theme.textSub} mb-3`}>اكتشف كيف يختزل العلماء المسافات الكونية وأحجام الجسيمات في صيغ رياضية بسيطة.</p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-50 text-orange-600'}`}>
                    المستوى الحالي: {['', 'مبتدئ', 'متوسط', 'متقدم'][level]}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100'}`}
                >
                    بدء جلسة المعايرة
                </button>
            </div>
            <motion.button
                onClick={() => { resetChallenges(); setPhase('practice'); }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-orange-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Microscope size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">تفعيل الماسح</span>
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
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3">{learnPages[learnStep].icon}</div>
                        <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-orange-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-orange-50'}`}>
                            <span className="font-mono font-black text-orange-400" dir="ltr">{learnPages[learnStep].math}</span>
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
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">بدء المسح</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={challengeStep + 1}
            total={challenges.length}
            level={level}
            question={`العدد الخام: ${currentChallenge.q}`}
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-2" dir="ltr">
                    <input
                        type="text"
                        value={userInput.a}
                        onChange={e => setUserInput({ ...userInput, a: e.target.value })}
                        aria-label="أدخل المعامل a"
                        className={`w-20 rounded-xl p-3 text-center text-lg font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-orange-500/50 text-orange-400 focus:border-orange-500' : 'bg-white border-orange-200 text-orange-700 focus:border-orange-500'
                            }`}
                        placeholder="a"
                        autoFocus
                    />
                    <span className={`text-lg font-black opacity-50 ${theme.textMain}`}>× 10</span>
                    <input
                        type="text"
                        value={userInput.n}
                        onChange={e => setUserInput({ ...userInput, n: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                        aria-label="أدخل الأس n"
                        className={`w-16 rounded-xl p-3 text-center text-lg font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-orange-500/50 text-orange-400 focus:border-orange-500' : 'bg-white border-orange-200 text-orange-700 focus:border-orange-500'
                            }`}
                        placeholder="n"
                    />
                </div>
                <button
                    onClick={handleAnswer}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all"
                >
                    <Send size={18} /> تحقق من الصيغة
                </button>
            </div>
        </LabChallenge>
    );
}

export default function ScientificNotationLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="scientific-notation"
            phase={phase}
            title="الكتابة العلمية"
            badgeText="الماسح الضوئي العلمي"
            badgeIcon={Microscope}
            accentColor="orange"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <ScientificNotationContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
