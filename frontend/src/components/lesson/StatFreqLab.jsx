import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, ArrowRight, CheckCircle2, ListFilter } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function buildChallenge(level) {
    return difficultyEngine.generateChallenge('stat-freq', level);
}

function StatFreqContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [level, setLevel] = useState(1);
    const [challenge, setChallenge] = useState(() => buildChallenge(1));
    const [userCounts, setUserCounts] = useState({});
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const uniqueValues = Object.keys(challenge.correct).map(Number);

    useEffect(() => {
        labProgressService.getOne('stat-freq')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setLevel(lvl);
                    setChallenge(buildChallenge(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const resetChallenge = () => {
        const c = buildChallenge(level);
        setChallenge(c);
        setUserCounts({});
        setError(false);
        setFeedback(null);
    };

    const handleAnswer = async () => {
        const isCorrect = uniqueValues.every(val => parseInt(userCounts[val]) === challenge.correct[val]);

        if (isCorrect) {
            setFeedback({ type: 'success', text: 'رائع! لقد نظمت البيانات بنجاح. هذا هو أساس العمل الإحصائي.' });
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            await labProgressService.update('stat-freq', 'completed', 100).catch(() => { });
            try {
                const data = await rewardService.claimLabReward('stat-freq-mastery');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ في العد. حاول مرة أخرى ببطء.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    const learnPages = [
        { title: 'ما هو الإحصاء؟', detail: 'هو علم جمع وترتيب البيانات لنتمكن من فهمها. أول خطوة هي تحويل "الفوضى" إلى "نظام" باستخدام الجداول.' },
    ];

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <ListFilter size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تحول الأرقام المبعثرة إلى معلومات مفيدة من خلال تنظيمها في جداول تكرارية احترافية.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                    المستوى الحالي: {['', 'مبتدئ', 'متوسط', 'متقدم'][level]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all">
                    دخول مختبر البيانات
                </button>
            </div>
            <button onClick={() => { resetChallenge(); setPhase('practice'); }} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
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
                    <div className="flex flex-col gap-4 items-center">
                        <div className={`p-4 rounded-xl border text-xs font-mono grid grid-cols-5 gap-2 max-w-xs ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            {[10, 12, 10, 15, 12, 10, 10, 15, 12, 10].map((v, i) => (
                                <span key={i} className={`p-2 rounded text-center ${isDarkMode ? 'bg-white/5' : 'bg-white'} ${theme.textMain}`}>{v}</span>
                            ))}
                        </div>
                        <ArrowRight className={theme.textMain} />
                        <div className={`p-4 rounded-xl border text-xs w-full max-w-xs ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                            <table className="w-full text-emerald-400">
                                <thead><tr className="border-b border-emerald-500/30"><th>القيمة</th><th>التكرار</th></tr></thead>
                                <tbody><tr><td>10</td><td>5</td></tr></tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => { resetChallenge(); setPhase('practice'); }} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
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
            level={level}
            question={challenge.q}
            hint="عُد كل رقم بتركيز عالٍ، واحداً تلو الآخر."
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenge}
            onRestart={() => { setPhase('intro'); resetChallenge(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className={`flex flex-wrap justify-center gap-2 p-4 rounded-2xl border ${isDarkMode ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    {challenge.data.map((v, i) => (
                        <span key={i} className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 font-bold">{v}</span>
                    ))}
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className={`${theme.textMain} border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                                <th className="py-2 px-4">القيمة</th>
                                <th className="py-2 px-4">التكرار</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uniqueValues.map(val => (
                                <tr key={val} className={`border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                    <td className={`py-2 font-black ${theme.textMain}`}>{val}</td>
                                    <td className="py-2">
                                        <input
                                            type="number"
                                            value={userCounts[val] || ''}
                                            onChange={e => setUserCounts({ ...userCounts, [val]: e.target.value })}
                                            aria-label={`تكرار القيمة ${val}`}
                                            className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/40 border-emerald-500/30 text-emerald-400 focus:border-emerald-500' : 'bg-white border-emerald-200 text-emerald-700 focus:border-emerald-500'
                                                }`}
                                            placeholder="0"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button onClick={handleAnswer} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black transition-all">
                    تأكيد الجدول
                </button>
            </div>
        </LabChallenge>
    );
}

export default function StatFreqLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="stat-freq"
            phase={phase}
            title="مختبر التكرارات"
            badgeText="تنظيم البيانات"
            badgeIcon={Hash}
            accentColor="emerald"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <StatFreqContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
