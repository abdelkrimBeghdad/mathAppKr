import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Crosshair, ArrowLeftRight, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function InequalitiesGraphContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [practicePair, setPracticePair] = useState({ q: 'x > 3', boundary: 3, dir: 'right', inc: false });
    const [userDir, setUserDir] = useState(null); // 'left' | 'right'
    const [userInc, setUserInc] = useState(null); // true | false
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'رادار الاتجاهات الجبريّة',
            detail: 'إذا كانت الحلول أكبر (>) نختار جهة اليمين، وإذا كانت أصغر (<) نختار جهة اليسار على المستقيم المدرج.',
            math: 'x > 2 ⟶ Right ➡',
            icon: <ArrowLeftRight size={20} />,
        },
        {
            title: 'تشفير العوارض الإحصائية',
            detail: 'العارضة [ ] تتجه نحو الحلول إذا كان الحد مشمولاً (≤، ≥)، وتتجه عكسها إذا كان الحد مستبعداً (<، >).',
            math: 'x ≥ 0 ⟶ [ Included ]',
            icon: <Layers size={20} />,
        },
        {
            title: 'بروتوكول الشطب النهائي',
            detail: 'نقوم بتظليل أو شطب الجهة التي لا تمثل حلولاً لنترك مساحة الحلول واضحة ومحددة بدقة.',
            math: 'Cancel Non-Solutions',
            icon: <Crosshair size={20} />,
        },
    ];

    const generateProblem = () => {
        const options = [
            { q: 'x > 3', boundary: 3, dir: 'right', inc: false },
            { q: 'x ≤ 5', boundary: 5, dir: 'left', inc: true },
            { q: 'x < -2', boundary: -2, dir: 'left', inc: false },
            { q: 'x ≥ 0', boundary: 0, dir: 'right', inc: true },
            { q: 'x > -4', boundary: -4, dir: 'right', inc: false },
            { q: 'x ≤ 2', boundary: 2, dir: 'left', inc: true },
        ];
        const newProb = options[Math.floor(Math.random() * options.length)];
        setPracticePair(newProb);
        setPhase('practice');
        setUserDir(null);
        setUserInc(null);
        setFeedback(null);
        setReward(null);
    };

    const handleCheck = async () => {
        if (userDir === practicePair.dir && userInc === practicePair.inc) {
            setFeedback({ type: 'success', text: 'إسقاط بياني مثالي! تم تحديد النطاق بنجاح.' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            rewardService.claimLabReward('inequality-graph-mastery')
                .then(data => data.status === 'success' && setReward(data))
                .catch(console.error);
        } else {
            setFeedback({ type: 'error', text: 'تحليل غير دقيق. تأكد من اتجاه الحلول وحالة العارضة.' });
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>دليل الرصد:</h3>
                <div className="space-y-3">
                    {learnPages.map((p, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-blue-50 border-blue-100'}`}>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm shrink-0">{i + 1}</div>
                            <h4 className={`font-bold text-xs ${theme.textMain}`}>{p.title}</h4>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}
                >
                    فتح دليل الإسقاط
                </button>
            </div>
            <motion.button
                onClick={generateProblem}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-blue-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Crosshair size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">تفعيل الرادار</span>
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
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className={`p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl ${theme.card}`}
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">{learnPages[learnStep].icon}</div>
                        <h3 className={`text-base font-black mb-3 tracking-tighter ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm mb-4 max-w-2xl font-medium ${theme.textSub}`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-blue-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-blue-50'}`}>
                            <span className="font-mono font-black text-blue-400 text-sm" dir="ltr">{learnPages[learnStep].math}</span>
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
                {learnStep < learnPages.length - 1 ? (
                    <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black flex items-center gap-2">
                        التالي <ArrowRight size={18} />
                    </button>
                ) : (
                    <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">
                        بدء الرصد <Crosshair size={18} />
                    </button>
                )}
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge بنوع choice ───────────────────────────
    return (
        <LabChallenge
            type="choice"
            current={1}
            total={1}
            level={practicePair.dir === 'left' ? 2 : 1}
            question={practicePair.q}
            hint="لاحظ اتجاه رمز المتراجحة، ثم حدد هل الحد الحدّي مشمول (≤،≥) أم مستبعد (<،>)."
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">

                {/* ── المستقيم المدرج ─────────────────────────────────────────── */}
                <div className={`relative w-full h-24 flex items-center justify-center rounded-2xl border mb-1 px-4 overflow-hidden ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`absolute w-full h-1 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-300'}`} />
                    {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(v => (
                        <div key={v} className={`absolute h-4 w-0.5 ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300'}`} style={{ left: `${50 + v * 9}%` }}>
                            <span className={`absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black font-mono italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{v}</span>
                        </div>
                    ))}

                    {/* نقطة الحد */}
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute h-16 w-1 bg-blue-500 z-10"
                        style={{ left: `${50 + practicePair.boundary * 9}%` }}
                    />

                    {/* التظليل حسب اختيار الطالب */}
                    <AnimatePresence>
                        {userDir && (
                            <motion.div
                                initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
                                className={`absolute h-8 bg-gradient-to-r ${userDir === 'right' ? 'from-blue-500/40 to-transparent origin-left' : 'from-transparent to-blue-500/40 origin-right'} backdrop-blur-md border-y border-blue-500/20`}
                                style={{
                                    left: userDir === 'right' ? `${50 + practicePair.boundary * 9}%` : '5%',
                                    right: userDir === 'right' ? '5%' : `${100 - (50 + practicePair.boundary * 9)}%`,
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {/* العارضة */}
                    <AnimatePresence>
                        {userInc !== null && userDir && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="absolute h-12 w-8 border-y-4 border-white flex items-center justify-center z-20"
                                style={{
                                    left: `${50 + practicePair.boundary * 9}%`,
                                    transform: 'translateX(-50%)',
                                    borderLeft: (userDir === 'right' && userInc) || (userDir === 'left' && !userInc) ? '6px solid white' : '1px solid rgba(255,255,255,0.1)',
                                    borderRight: (userDir === 'left' && userInc) || (userDir === 'right' && !userInc) ? '6px solid white' : '1px solid rgba(255,255,255,0.1)',
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* ── أزرار الاختيار ───────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-2">
                        <span className={`font-black text-[10px] uppercase tracking-widest px-1 block ${theme.textSub}`}>اتجاه الرصد</span>
                        <div className="flex gap-2" role="group" aria-label="اختر اتجاه الحل">
                            <button
                                onClick={() => setUserDir('left')}
                                className={`flex-1 py-2.5 rounded-xl font-black text-base border-2 transition-all ${userDir === 'left'
                                        ? 'bg-blue-600 border-blue-400 text-white'
                                        : isDarkMode ? 'bg-black/40 border-white/5 text-slate-500 hover:border-blue-500/30' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                                    }`}
                            >يسار (&lt;)</button>
                            <button
                                onClick={() => setUserDir('right')}
                                className={`flex-1 py-2.5 rounded-xl font-black text-base border-2 transition-all ${userDir === 'right'
                                        ? 'bg-blue-600 border-blue-400 text-white'
                                        : isDarkMode ? 'bg-black/40 border-white/5 text-slate-500 hover:border-blue-500/30' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                                    }`}
                            >يمين (&gt;)</button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className={`font-black text-[10px] uppercase tracking-widest px-1 block ${theme.textSub}`}>نوع العارضة</span>
                        <div className="flex gap-2" role="group" aria-label="اختر نوع العارضة">
                            <button
                                onClick={() => setUserInc(true)}
                                className={`flex-1 py-2.5 rounded-xl font-black text-sm border-2 transition-all ${userInc === true
                                        ? 'bg-emerald-600 border-emerald-400 text-white'
                                        : isDarkMode ? 'bg-black/40 border-white/5 text-slate-500 hover:border-emerald-500/30' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'
                                    }`}
                            >مشمول</button>
                            <button
                                onClick={() => setUserInc(false)}
                                className={`flex-1 py-2.5 rounded-xl font-black text-sm border-2 transition-all ${userInc === false
                                        ? 'bg-rose-600 border-rose-400 text-white'
                                        : isDarkMode ? 'bg-black/40 border-white/5 text-slate-500 hover:border-rose-500/30' : 'bg-white border-slate-200 text-slate-500 hover:border-rose-300'
                                    }`}
                            >مستبعد</button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCheck}
                    disabled={userDir === null || userInc === null}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                    <CheckCircle2 size={20} /> تأكيد الإسقاط
                </button>
            </div>
        </LabChallenge>
    );
}

export default function InequalitiesGraphLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="inequalities-graph"
            phase={phase}
            title="رادار المجالات البيانية"
            badgeText="بروتوكول الإسقاط البياني"
            badgeIcon={Crosshair}
            accentColor="blue"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <InequalitiesGraphContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
