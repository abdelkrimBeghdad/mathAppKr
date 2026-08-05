import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Layers, Layout, MousePointer2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/geometry.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('geo-net', lvl) }));
}

function GeoNetContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [isUnfolded, setIsUnfolded] = useState(false);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const currentChallenge = roundData.problem; // { type, ans, q, hint, ... }

    useEffect(() => {
        labProgressService.getOne('geo-net')
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
            title: 'ما هو نشر المجسم؟',
            detail: 'نشر المجسم هو عملية "فتحه" وجعله شكلاً مسطحاً. هذا يساعدنا على رؤية كل الأوجه وحساب المساحة الكلية بسهولة.',
            visual: (
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-32 h-32 flex items-center justify-center perspective-1000">
                        <motion.div
                            animate={{ rotateY: isUnfolded ? 0 : 45, rotateX: isUnfolded ? 0 : 20 }}
                            className="w-16 h-16 relative preserve-3d"
                        >
                            {!isUnfolded ? (
                                <div className="absolute inset-0 bg-indigo-500/40 border-2 border-indigo-400 backdrop-blur-md" />
                            ) : (
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 bg-indigo-500/20 border border-indigo-400" />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                    <button
                        onClick={() => setIsUnfolded(s => !s)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2"
                    >
                        {isUnfolded ? 'إغلاق المجسم' : 'نشر المجسم'} <MousePointer2 size={16} />
                    </button>
                </div>
            ),
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
        labProgressService.update('geo-net', 'practice').catch(() => { });
    };

    const handleAnswer = async () => {
        if (parseInt(inputVal) === currentChallenge.ans) {
            setError(false);
            setInputVal('');
            if (round < 2) {
                setFeedback({ type: 'success', text: `صحيح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                setFeedback({ type: 'success', text: 'صحيح! المساحة الكلية هي مجموع مساحات كل أوجه النشر. ✓' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('geo-net', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('geo-net', {
                        type: 'geo-net', kind: currentChallenge.type, ans: currentChallenge.ans,
                        side: currentChallenge.side, l: currentChallenge.l, w: currentChallenge.w, h: currentChallenge.h,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'خطأ. فكر في عدد الأوجه ومساحة كل واحد منها في الشكل المسطح.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ──────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                    <Layout size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تفتح المجسمات لترى "جلدها" الخارجي. مهارة النشر هي الطريق الوحيد لفهم وحساب المساحات الكلية للمجسمات.
                    ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all">
                    بدء عملية النشر
                </button>
            </div>
            <button onClick={startPractice} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
                تخطي الشرح والبدء بالتحدي
            </button>
        </div>
    );

    // ── learn ──────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <h3 className={`text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    <div className="mx-auto min-h-[200px] flex items-center justify-center">
                        {learnPages[learnStep].visual}
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button
                    onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                    السابق
                </button>
                {learnStep < learnPages.length - 1 ? (
                    <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all flex items-center gap-2">
                        التالي <ArrowRight size={18} />
                    </button>
                ) : (
                    <button onClick={startPractice} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">
                        التدريب <CheckCircle2 size={18} />
                    </button>
                )}
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={round + 1}
            total={3}
            level={roundData.level}
            question={currentChallenge.q}
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setInputVal(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
            tourSteps={[
                { target: 'lab-question', title: 'المساحة الكلية', description: 'تخيّل الشكل مفروداً (منشوراً) بمساوٍ — عدد وجوهه وأبعادها.' },
                { target: 'lab-answer-input', title: 'حقل الإجابة', description: 'اجمع مساحات كل الأوجه المتطابقة والمتقابلة لتحصل على المساحة الكلية.' },
                { target: 'lab-hint-button', title: 'بحاجة لمساعدة؟', description: 'اضغط هنا لتلميح سريع.' },
            ]}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <input
                    type="number" data-tour-id="lab-answer-input" value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                    aria-label="أدخل المساحة الكلية"
                    dir="ltr"
                    className={`w-32 rounded-xl p-3 text-center text-xl font-black outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/40 text-indigo-300 focus:border-indigo-400' : 'bg-white border-indigo-200 text-indigo-700 focus:border-indigo-500'
                        }`}
                    placeholder="?"
                    autoFocus
                />
                <button onClick={handleAnswer} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black transition-all">
                    تحقق من المساحة الكلية
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
      `}} />
        </LabChallenge>
    );
}

export default function GeoNetLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="geo-net"
            phase={phase}
            title="مختبر الأوجه المسطحة"
            badgeText="المساحة والنشر"
            badgeIcon={Layers}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <GeoNetContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
