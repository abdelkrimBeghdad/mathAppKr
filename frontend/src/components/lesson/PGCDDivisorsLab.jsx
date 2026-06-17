import React, { useState, useMemo, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, CheckCircle2, Search, Zap as ZapIcon, Target, Send, Trophy, HelpCircle, BookOpen, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import MasteryRewardCard from './MasteryRewardCard';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';


function getDivisors(n) {
    const divs = [];
    for (let i = 1; i <= n; i++) {
        if (n % i === 0) divs.push(i);
    }
    return divs;
}

const PGCDDivisorsContent = ({ isDarkMode, setLabTitle, setLabPhase }) => {
    const { theme } = useLabTheme();
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [numbers, setNumbers] = useState({ a: 12, b: 18 });
    const [step, setStep] = useState(1); // 1: divisors A, 2: divisors B, 3: common, 4: pgcd
    const [foundDivisorsA, setFoundDivisorsA] = useState([]);
    const [foundDivisorsB, setFoundDivisorsB] = useState([]);
    const [foundCommon, setFoundCommon] = useState([]);
    const [pgcdInput, setPgcdInput] = useState('');
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [finished, setFinished] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);
    const [level, setLevel] = useState(1);

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const progress = await labProgressService.getOne('pgcd-divisors');
                setLevel(difficultyEngine.getLevel(progress));
            } catch (err) {
                console.error(err);
            }
        };
        loadProgress();
    }, []);
    const allDivisorsA = useMemo(() => getDivisors(numbers.a), [numbers.a]);
    const allDivisorsB = useMemo(() => getDivisors(numbers.b), [numbers.b]);
    const commonDivisors = useMemo(() => allDivisorsA.filter(d => allDivisorsB.includes(d)), [allDivisorsA, allDivisorsB]);
    const pgcd = useMemo(() => Math.max(...commonDivisors), [commonDivisors]);

    const learnPages = [
        {
            title: 'بروتوكول جرد القواسم',
            detail: 'قواسم عدد طبيعي هي جميع الأعداد التي تقسمه بدون باقي. نبدأ دائماً بـ 1 وننتهي بالعدد نفسه.',
            math: 'a ÷ d = k (باقي 0)',
        },
        {
            title: 'المنطقة المشتركة',
            detail: 'بعد إيجاد قواسم كل عدد، نحدد الأرقام الموجودة في المجموعتين معاً. أكبر هذه الأرقام هو PGCD.',
            math: 'D(a) ∩ D(b) → Max = PGCD',
        },
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('pgcd', level);
        const pairs = params.pairs || [[12, 18], [15, 25], [20, 30]];
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        setNumbers({ a: pair[0], b: pair[1] });
        setStep(1);
        setFoundDivisorsA([]);
        setFoundDivisorsB([]);
        setFoundCommon([]);
        setPgcdInput('');
        setInputVal('');
        setError(false);
        setFinished(false);
        setShowHint(false);
        setReward(null);
        setPhase('practice');
    };

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('القواسم المشتركة');
        } else if (phase === 'learn') {
            setLabTitle(learnPages[learnStep].title);
        } else if (finished) {
            setLabTitle(`PGCD = ${pgcd}`);
        } else {
            if (step === 1) setLabTitle(`أوجد جميع قواسم ${numbers.a}`);
            else if (step === 2) setLabTitle(`أوجد جميع قواسم ${numbers.b}`);
            else if (step === 3) setLabTitle('اختر القواسم المشتركة');
            else setLabTitle('ما هو أكبر قاسم؟');
        }
    }, [phase, learnStep, step, finished, numbers.a, numbers.b, pgcd, setLabTitle, setLabPhase]);

    const handleAddDivisor = () => {
        const val = parseInt(inputVal);
        if (isNaN(val) || val <= 0) return;

        if (step === 1) {
            if (numbers.a % val !== 0 || foundDivisorsA.includes(val)) {
                setError(true);
                setTimeout(() => setError(false), 1000);
            } else {
                const newList = [...foundDivisorsA, val].sort((x, y) => x - y);
                setFoundDivisorsA(newList);
                if (newList.length === allDivisorsA.length) setStep(2);
            }
        } else if (step === 2) {
            if (numbers.b % val !== 0 || foundDivisorsB.includes(val)) {
                setError(true);
                setTimeout(() => setError(false), 1000);
            } else {
                const newList = [...foundDivisorsB, val].sort((x, y) => x - y);
                setFoundDivisorsB(newList);
                if (newList.length === allDivisorsB.length) setStep(3);
            }
        } else if (step === 3) {
            if (!commonDivisors.includes(val) || foundCommon.includes(val)) {
                setError(true);
                setTimeout(() => setError(false), 1000);
            } else {
                const newList = [...foundCommon, val].sort((x, y) => x - y);
                setFoundCommon(newList);
                if (newList.length === commonDivisors.length) setStep(4);
            }
        }
        setInputVal('');
    };

    const checkPGCD = async () => {
        if (parseInt(pgcdInput) === pgcd) {
            await labProgressService.update('pgcd-divisors', 'completed', 100);
            setFinished(true);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                const data = await rewardService.claimLabReward('pgcd-divisors');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center min-h-0">
            {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                            <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>طريقة القوائم:</h3>
                            <div className={`p-4 rounded-xl font-mono text-center ${isDarkMode ? 'bg-black/20 border border-white/5 text-emerald-400' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'}`}>D(a) ∩ D(b) = Common</div>
                            <button onClick={() => setPhase('learn')} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'}`}>فتح الدليل النظري</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group rounded-[1rem] shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-600" />
                            <div className="relative p-5 flex flex-col items-center justify-center text-white gap-4">
                                <ZapIcon size={20} />
                                <span className="font-black text-xl italic uppercase tracking-widest">دخول الميدان</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                            <div className="flex flex-col items-center text-center">
                                <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                <p className={`text-sm md:text-base ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                                <div className={`p-6 rounded-2xl border-2 mb-4 w-full ${isDarkMode ? 'border-emerald-500/30 bg-black/40' : 'border-emerald-200 bg-emerald-50'}`}>
                                    <span className={`text-sm md:text-base font-mono font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} dir="ltr">{learnPages[learnStep].math}</span>
                                </div>
                            </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                            <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                            {learnStep < 1 ? (
                                <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-glow text-lg">التالي</button>
                            ) : (
                                <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-glow text-lg">بدء التحدي</button>
                            )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !finished && (
                    <div className="w-full max-w-4xl px-2 overflow-y-auto">
                        <div className={`p-4 md:p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                            <div className="space-y-6">
                                {/* Current Step Display */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className={`p-4 rounded-2xl border transition-all ${step === 1 ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-black/10 opacity-50'}`}>
                                        <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">قواسم {numbers.a}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {foundDivisorsA.map(d => <span key={d} className="px-2 py-1 bg-emerald-500 text-white rounded-lg font-bold text-xs">{d}</span>)}
                                            {foundDivisorsA.length < allDivisorsA.length && <span className="animate-pulse text-emerald-500">?</span>}
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-2xl border transition-all ${step === 2 ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-black/10 opacity-50'}`}>
                                        <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">قواسم {numbers.b}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {foundDivisorsB.map(d => <span key={d} className="px-2 py-1 bg-sky-500 text-white rounded-lg font-bold text-xs">{d}</span>)}
                                            {step === 2 && foundDivisorsB.length < allDivisorsB.length && <span className="animate-pulse text-sky-500">?</span>}
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-2xl border transition-all ${step >= 3 ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-black/10 opacity-50'}`}>
                                        <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">المشتركة</div>
                                        <div className="flex flex-wrap gap-2">
                                            {foundCommon.map(d => <span key={d} className="px-2 py-1 bg-amber-500 text-white rounded-lg font-bold text-xs">{d}</span>)}
                                            {step === 3 && foundCommon.length < commonDivisors.length && <span className="animate-pulse text-amber-500">?</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Input Section */}
                                {step < 4 ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-4 w-full max-w-xs">
                                            <input
                                                type="number"
                                                value={inputVal}
                                                onChange={(e) => setInputVal(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddDivisor()}
                                                className={`flex-1 border-2 rounded-xl p-3 text-center text-2xl font-black outline-none transition-all ${isDarkMode
                                                    ? `bg-slate-950 ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-emerald-500/50 text-emerald-400 focus:border-emerald-400'}`
                                                    : `bg-white ${error ? 'border-rose-500 animate-shake text-rose-500' : 'border-emerald-200 text-emerald-600 focus:border-emerald-500'} shadow-sm`
                                                }`}
                                                placeholder="قاسم..."
                                                autoFocus
                                            />
                                            <button onClick={handleAddDivisor} className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-glow-emerald transition-all">
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 py-2">
                                        <div className={`p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-black text-center w-full max-w-sm`}>
                                            ما هو أكبر قاسم مشترك في المجموعة؟
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`text-sm font-black italic opacity-50 ${theme.textSub}`}>PGCD =</div>
                                            <input
                                                type="number"
                                                value={pgcdInput}
                                                onChange={(e) => setPgcdInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && checkPGCD()}
                                                className={`w-28 md:w-36 border-2 rounded-xl p-3 text-center text-xl font-black outline-none transition-all ${isDarkMode
                                                    ? `bg-slate-950 ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-amber-500/50 text-amber-400 focus:border-amber-400'}`
                                                    : `bg-white ${error ? 'border-rose-500 animate-shake text-rose-500' : 'border-amber-200 text-amber-600 focus:border-amber-500'} shadow-sm`
                                                }`}
                                                placeholder="?"
                                            />
                                            <button onClick={checkPGCD} className="p-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-glow-amber transition-all">
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button onClick={() => setShowHint(!showHint)} className={`text-xs font-black uppercase italic tracking-widest flex items-center gap-2 mx-auto transition-all ${isDarkMode ? 'text-amber-500/50 hover:text-amber-500' : 'text-amber-600/50 hover:text-amber-600'}`}>
                                    <HelpCircle size={16} /> تلميح
                                </button>
                                {showHint && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl italic text-sm md:text-base font-bold text-center ${isDarkMode ? 'bg-black/60 border border-amber-500/20 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                                        {step === 1 ? `جرب قسمة ${numbers.a} على الأعداد من 1 إلى ${numbers.a}` : 
                                         step === 2 ? `جرب قسمة ${numbers.b} على الأعداد من 1 إلى ${numbers.b}` : 
                                         step === 3 ? "ابحث عن الأرقام التي تكررت في القائمتين" : 
                                         "انظر إلى أكبر عدد في قائمة القواسم المشتركة"}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {finished && (
                    <div className="w-full max-w-2xl text-center px-4 overflow-y-auto max-h-[400px]">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`border-2 rounded-[1.5rem] p-8 shadow-glow-emerald backdrop-blur-3xl ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-emerald-50 border-emerald-200'}`}>
                            <Trophy size={40} className="mx-auto text-emerald-500 mb-4" />
                            <h3 className={`text-base md:text-lg font-black mb-4 tracking-tighter italic ${theme.textMain}`}>إتقان القواسم!</h3>
                            <div className={`inline-block px-8 py-3 rounded-xl border text-xl font-black italic font-mono ${isDarkMode ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`} dir="ltr">
                                PGCD({numbers.a}, {numbers.b}) = {pgcd}
                            </div>
                        </motion.div>
                        <MasteryRewardCard reward={reward} />
                        <button onClick={generateProblem} className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xl shadow-glow-emerald transition-all active:scale-95">تحدي جديد</button>
                    </div>
                )}
        </div>
    );
};

export default function PGCDDivisorsLab({ isDarkMode }) {
    const [labTitle, setLabTitle] = useState('القواسم المشتركة');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            isDarkMode={isDarkMode} 
            labId="pgcd-divisors"
            accentColor="emerald" 
            badgeText="مختبر جرد القواسم" 
            badgeIcon={Search} 
            title={labTitle}
            phase={labPhase}
        >
            <PGCDDivisorsContent isDarkMode={isDarkMode} setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
