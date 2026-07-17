import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sigma, Binary, ArrowRight, ListChecks, Zap as ZapIcon, RotateCcw, Check, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function DivisorPropertiesContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [track, setTrack] = useState(null); // null | 'sum' | 'remainder'
    const [inputs, setInputs] = useState({ a: 35, b: 15, n: 5 });
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnContent = [
        { title: 'المجموع والفرق', math: 'n | a ∧ n | b ⟶ n | (a±b)', detail: 'إذا كان العدد n يقسم كلاً من a و b، فهو حتماً يقسم مجموعهما وفرقهما.', icon: <Sigma size={20} /> },
        { title: 'باقي القسمة', math: 'n | a ∧ n | b ⟶ n | r', detail: 'إذا كان n يقسم كلاً من a و b، فهو يقسم أيضاً باقي قسمة a على b.', icon: <Binary size={20} /> },
    ];

    const resetTrack = () => {
        setTrack(null);
        setFeedback(null);
        setError(false);
    };

    const generateInputs = (t) => {
        const n = [3, 4, 5, 6, 7][Math.floor(Math.random() * 5)];
        const a = n * (Math.floor(Math.random() * 8) + 3);
        const b = n * (Math.floor(Math.random() * 6) + 2);
        setInputs({ a, b, n });
        setTrack(t);
        setFeedback(null);
        setError(false);
    };

    const handleVerify = async () => {
        const { a, b, n } = inputs;
        if (a % n === 0 && b % n === 0) {
            const text = track === 'sum'
                ? `تحقق: n يقسم المجموع (${a + b}) والفرق (${Math.abs(a - b)}) بنجاح!`
                : `تحقق: n يقسم باقي القسمة (r = ${a % b}) بنجاح!`;
            setFeedback({ type: 'success', text });
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            try {
                const data = await rewardService.claimLabReward(track === 'sum' ? 'divisor-prop-1' : 'divisor-prop-2');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: a % n !== 0 ? `${n} لا يقسم ${a}.` : `${n} لا يقسم ${b}.` });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>موسوعة الخواص:</h3>
                <p className={`text-sm ${theme.textSub} mb-4`}>تعلم القواعد الأساسية التي تربط قواسم الأعداد ببعضها البعض.</p>
                <button
                    onClick={() => setPhase('learn')}
                    className={`w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}`}
                >
                    فتح الموسوعة
                </button>
            </div>
            <motion.button
                onClick={() => setPhase('practice')}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-emerald-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <ListChecks size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">دخول المخبر</span>
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
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">{learnContent[learnStep].icon}</div>
                        <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnContent[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnContent[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-emerald-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-emerald-50'}`}>
                            <span className="font-mono font-black text-emerald-400" dir="ltr">{learnContent[learnStep].math}</span>
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
                {learnStep < learnContent.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => setPhase('practice')} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">التجربة العملية</button>
                }
            </div>
        </div>
    );

    // ── practice: اختيار المسار ───────────────────────────────────────────────
    if (phase === 'practice' && !track) return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => generateInputs('sum')}
                className={`p-5 rounded-[1.5rem] border-2 text-right transition-all backdrop-blur-3xl group ${theme.card} hover:border-emerald-500`}
            >
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Sigma size={20} /></div>
                <h3 className={`text-base font-black mb-2 ${theme.textMain}`}>مخبر المجموع والفرق</h3>
                <p className={`text-xs ${theme.textSub} mb-3`}>تحقق كيف ينتقل القاسم n ليقسم المجموع والفرق آلياً.</p>
                <div className="text-emerald-500 font-black text-sm flex items-center gap-2">دخول <ArrowRight size={16} /></div>
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => generateInputs('remainder')}
                className={`p-5 rounded-[1.5rem] border-2 text-right transition-all backdrop-blur-3xl group ${theme.card} hover:border-emerald-500`}
            >
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Binary size={20} /></div>
                <h3 className={`text-base font-black mb-2 ${theme.textMain}`}>مخبر باقي القسمة</h3>
                <p className={`text-xs ${theme.textSub} mb-3`}>تحقق كيف يظل n قاسماً لباقي القسمة r دائماً.</p>
                <div className="text-emerald-500 font-black text-sm flex items-center gap-2">دخول <ArrowRight size={16} /></div>
            </motion.button>
        </div>
    );

    // ── practice: التحقق الفعلي — يستخدم LabChallenge ─────────────────────────
    return (
        <LabChallenge
            type="text"
            current={1}
            total={1}
            level={2}
            question={track === 'sum' ? 'تحقق: هل n يقسم a و b؟ إن كان كذلك، فهو يقسم مجموعهما وفرقهما.' : 'تحقق: هل n يقسم a و b؟ إن كان كذلك، فهو يقسم باقي قسمة a على b.'}
            hint="تأكد أن a ÷ n و b ÷ n كلاهما بدون باقٍ."
            feedback={feedback}
            reward={reward}
            onRefresh={() => generateInputs(track)}
            onRestart={() => { setPhase('intro'); resetTrack(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className="grid grid-cols-3 gap-3 w-full" dir="ltr">
                    <div className="space-y-1">
                        <label className={`text-[10px] font-black uppercase tracking-widest block text-center ${theme.textSub}`}>a</label>
                        <input
                            type="number" value={inputs.a}
                            onChange={e => setInputs({ ...inputs, a: parseInt(e.target.value) || 0 })}
                            aria-label="القيمة a"
                            className={`w-full rounded-xl p-3 text-center text-lg font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/40 text-emerald-300 focus:border-emerald-400' : 'bg-white border-emerald-200 text-emerald-700 focus:border-emerald-500'
                                }`}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className={`text-[10px] font-black uppercase tracking-widest block text-center ${theme.textSub}`}>b</label>
                        <input
                            type="number" value={inputs.b}
                            onChange={e => setInputs({ ...inputs, b: parseInt(e.target.value) || 0 })}
                            aria-label="القيمة b"
                            className={`w-full rounded-xl p-3 text-center text-lg font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/40 text-emerald-300 focus:border-emerald-400' : 'bg-white border-emerald-200 text-emerald-700 focus:border-emerald-500'
                                }`}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className={`text-[10px] font-black uppercase tracking-widest block text-center ${theme.textSub}`}>n</label>
                        <input
                            type="number" value={inputs.n}
                            onChange={e => setInputs({ ...inputs, n: parseInt(e.target.value) || 0 })}
                            onKeyDown={e => e.key === 'Enter' && handleVerify()}
                            aria-label="القاسم n"
                            className={`w-full rounded-xl p-3 text-center text-lg font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/40 text-emerald-300 focus:border-emerald-400' : 'bg-white border-emerald-200 text-emerald-700 focus:border-emerald-500'
                                }`}
                        />
                    </div>
                </div>
                <button
                    onClick={handleVerify}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all"
                >
                    <ZapIcon size={18} /> معالجة البيانات والتحقق
                </button>
            </div>
        </LabChallenge>
    );
}

export default function DivisorPropertiesLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="divisor-properties"
            phase={phase}
            title="خصائص القواسم"
            badgeText="بروتوكول القواعد الذهبية"
            badgeIcon={ListChecks}
            accentColor="emerald"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <DivisorPropertiesContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
