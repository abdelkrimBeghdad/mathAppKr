import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Split, Layers, ShieldCheck, ArrowRight, FastForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

function EquationsProductContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [level, setLevel] = useState(1);
    const [challenges, setChallenges] = useState([]);
    const [challengeStep, setChallengeStep] = useState(0);
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('eq-product')
            .then(progress => { if (progress) setLevel(difficultyEngine.getLevel(progress)); })
            .catch(() => { });
    }, []);

    const learnPages = [
        { title: 'بروتوكول الانشطار الجبري', detail: 'إذا كان حاصل ضرب قوسين يساوي الصفر، فهذا يعني حتماً أن أحد القوسين على الأقل يساوي الصفر.', math: 'A × B = 0 ⟶ A = 0 ∨ B = 0', icon: <Split size={20} /> },
        { title: 'تفكيك العوامل المتصلة', detail: 'في معادلة مثل (x+3)(x-5)=0، نقوم بشطرها إلى معادلتين بسيطتين وحلهما بشكل مستقل.', math: '(x + 3) = 0 ∣ (x - 5) = 0', icon: <Layers size={20} /> },
        { title: 'مجموعة الحلول الثنائية', detail: 'المعادلة النهائية تمتلك حلين (جذرين). نكتبهما في مجموعة الحلول S.', math: 'S = {x₁, x₂}', icon: <ShieldCheck size={20} /> },
    ];

    const buildChallenges = () => {
        const numProblems = Math.min(4 + Math.floor(level / 2), 8);
        const list = [];
        for (let i = 0; i < numProblems; i++) {
            const p = difficultyEngine.generateChallenge('eq-product', level);
            list.push({
                q: p.q,
                a1: p.root1.toString(),
                a2: p.root2.toString(),
                hint: p.hint,
            });
        }
        return list;
    };

    const generateProblems = () => {
        setChallenges(buildChallenges());
        setPhase('practice');
        setChallengeStep(0);
        setInput1(''); setInput2('');
        setError(false); setFeedback(null); setReward(null);
        labProgressService.update('eq-product', 'practice').catch(() => { });
    };

    const currentChallenge = challenges[challengeStep] || {};

    const validateAnswer = (input, a1, a2) => {
        const clean = input.trim();
        return clean === a1 || clean === a2;
    };

    const handleAnswer = async () => {
        const is1Correct = validateAnswer(input1, currentChallenge.a1, currentChallenge.a2);
        const is2Correct = validateAnswer(input2, currentChallenge.a1, currentChallenge.a2);

        if (is1Correct && is2Correct && input1.trim() !== input2.trim()) {
            setFeedback({ type: 'success', text: 'انشطار منطقي ناجح! تم تحديد الجذور بدقة.' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            setInput1(''); setInput2('');
            setError(false);

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1400);
            } else {
                await labProgressService.update('eq-product', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('eq-product', {
                        type: 'eq-product', root1: parseInt(currentChallenge.a1), root2: parseInt(currentChallenge.a2),
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'فشل الانشطار. تأكد من إدخال كلا الحلين المختلفين.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>دليل الانشطار الجبري</h3>
                <p className={`${theme.textSub} text-sm mb-4 font-medium leading-relaxed`}>تعلم كيف تفرز العوامل وتحول الضرب المعقد إلى احتمالات بسيطة عبر قاعدة الصفر المطلق.</p>
                <button onClick={() => setPhase('learn')} className={`w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}>
                    فتح ملف المراجعة
                </button>
            </div>
            <motion.button onClick={generateProblems} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Split size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">ميدان الانشطار</span>
                </div>
            </motion.button>
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
                    : <button onClick={generateProblems} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">دخول الميدان</button>
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
            question={currentChallenge.q}
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblems}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full">
                <div className="flex flex-col gap-2 items-center">
                    <span className={`text-[10px] font-black uppercase ${theme.textSub}`}>الجذر الأول</span>
                    <div className="flex items-center gap-2 font-mono font-black" dir="ltr">
                        <span className={`opacity-40 ${theme.textMain}`}>x₁=</span>
                        <input type="text" value={input1} onChange={e => setInput1(e.target.value)} aria-label="الجذر الأول"
                            className={`w-20 rounded-xl p-2 text-center font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400 focus:border-indigo-500' : 'bg-white border-indigo-200 text-indigo-700 focus:border-indigo-500'}`}
                            placeholder="?" autoFocus />
                    </div>
                </div>
                <div className={`text-lg font-black ${theme.textSub}`}>أو</div>
                <div className="flex flex-col gap-2 items-center">
                    <span className={`text-[10px] font-black uppercase ${theme.textSub}`}>الجذر الثاني</span>
                    <div className="flex items-center gap-2 font-mono font-black" dir="ltr">
                        <span className={`opacity-40 ${theme.textMain}`}>x₂=</span>
                        <input type="text" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} aria-label="الجذر الثاني"
                            className={`w-20 rounded-xl p-2 text-center font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400 focus:border-indigo-500' : 'bg-white border-indigo-200 text-indigo-700 focus:border-indigo-500'}`}
                            placeholder="?" />
                    </div>
                </div>
            </div>
            <LabTutorialNote
                from={`المعادلة على شكل ضرب قوسين يساوي صفر: ${currentChallenge.q}`}
                why={`إذا كان حاصل ضرب عددين يساوي صفراً، فأحدهما على الأقل لا بد أن يكون صفراً. لذا نحل كل قوس على حدة كأنه معادلة مستقلة بسيطة.`}
            />
            <button onClick={handleAnswer} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <FastForward size={18} /> تأكيد الانشطار
            </button>
        </LabChallenge>
    );
}

export default function EquationsProductLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="eq-product"
            phase={phase}
            title="معادلات الانشطار"
            badgeText="بروتوكول الجداء المعدوم"
            badgeIcon={Split}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <EquationsProductContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
