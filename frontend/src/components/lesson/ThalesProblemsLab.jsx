import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, CheckCircle2 } from 'lucide-react';
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
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('thales-problems', lvl) }));
}

function ThalesProblemsContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const problem = roundData.problem; // { type, a, b, c, ans, q }

    useEffect(() => {
        labProgressService.getOne('thales-prob')
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
            title: 'طاليس في الواقع',
            detail: 'تُستخدم نظرية طاليس في الهندسة المعمارية ورسم الخرائط وحساب ارتفاعات لا يمكن قياسها مباشرة (كالهرم أو شجرة عالية).',
            math: 'ظل الشجرة / ظلك = طول الشجرة / طولك',
        },
        {
            title: 'خطوات الحل',
            detail: 'استخرج الأطوال الثلاثة المعلومة من النص، تأكد من وجود توازي، ثم طبّق التناسب لإيجاد الطول المجهول.',
            math: 'x = (a × b) / c',
        },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setInputVal('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('thales-prob', 'practice').catch(() => { });
    };

    const handleCheck = async () => {
        if (parseFloat(inputVal) === problem.ans) {
            setError(false);
            setInputVal('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `ممتاز! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'ممتاز! طبّقت التناسب بدقة في 3 سياقات مختلفة.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('thales-prob', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('thales-prob', {
                        type: 'thales-problem', kind: problem.type, a: problem.a, b: problem.b, c: problem.c, ans: parseFloat(inputVal),
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'ابحث عن الأشياء المتوازية ورتّب النسب: صغير على كبير.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>سر النجاح:</h3>
                <div className={`p-4 rounded-xl border text-center mb-3 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-indigo-50 border-indigo-100'}`}>
                    <div className={`text-base font-black ${theme.textMain}`}>التناسب هو المفتاح</div>
                </div>
                <p className={`text-sm ${theme.textSub}`}>ابحث عن الأشياء المتوازية (ظلال، دعامات، مخاريط...) ورتّب النسب: صغير على كبير. ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً.</p>
                <div className={`mt-3 mb-1 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}
                >
                    كيف أبدأ؟
                </button>
            </div>
            <motion.button
                onClick={startPractice}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-indigo-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Map size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">اكتشف مسألة</span>
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
                        <div className={`p-5 rounded-2xl border-2 border-indigo-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-indigo-50'}`}>
                            <span className="font-mono font-black text-indigo-400" dir="ltr">{learnPages[learnStep].math}</span>
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
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black">التالي</button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">أرني مسألة</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    const tutorialByType = {
        shadow: {
            from: `العصا معلومة الطول (${problem.a}) والظل (${problem.b})، وظل المبنى معلوم أيضاً (${problem.c}).`,
            why: `أشعة الشمس متوازية، فالنسبة بين الطول والظل ثابتة: ${problem.a}/${problem.b} = ؟/${problem.c}.`,
        },
        scale: {
            from: `القطعة الأولى: طولها الحقيقي ${problem.a}m ورُسمت بطول ${problem.b}cm، والقطعة الثانية طولها الحقيقي ${problem.c}m.`,
            why: `مقياس الرسم ثابت لكل القطع: ${problem.a}/${problem.b} = ${problem.c}/؟.`,
        },
        cone: {
            from: `المخروط ارتفاعه الكلي ${problem.a}cm ونصف قطر قاعدته ${problem.b}cm، وقُطع على ارتفاع ${problem.c}cm من الرأس.`,
            why: `القطاع الموازي للقاعدة يحافظ على نفس النسبة: ${problem.a}/${problem.b} = ${problem.c}/؟.`,
        },
    };
    const note = tutorialByType[problem.type];

    return (
        <LabChallenge
            type="text"
            current={round + 1}
            total={3}
            level={roundData.level}
            question={`"${problem.q}"`}
            hint="ابحث عن التوازي في المسألة، ورتّب النسب: صغير على كبير في كل جهة."
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setInputVal(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <span className={`text-sm font-bold ${theme.textSub}`}>اكتب الجواب النهائي (رقم فقط):</span>
                <input
                    type="number"
                    step="0.1"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCheck()}
                    aria-label="أدخل الجواب"
                    dir="ltr"
                    className={`w-32 rounded-xl text-center p-3 text-xl font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400 focus:border-indigo-400' : 'bg-white border-indigo-200 text-indigo-700 focus:border-indigo-500'
                        }`}
                    placeholder="?"
                    autoFocus
                />
                <LabTutorialNote from={note.from} why={note.why} />
                <button
                    onClick={handleCheck}
                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center gap-2 transition-all"
                >
                    <CheckCircle2 size={18} /> تحقق من الإجابة
                </button>
            </div>
        </LabChallenge>
    );
}

export default function ThalesProblemsLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="thales-prob"
            phase={phase}
            title="مسائل طاليس التطبيقية"
            badgeText="تطبيقات طاليس"
            badgeIcon={Map}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <ThalesProblemsContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
