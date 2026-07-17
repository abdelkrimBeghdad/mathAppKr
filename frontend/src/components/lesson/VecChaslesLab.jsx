import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function VecChaslesContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [inputStart, setInputStart] = useState('');
    const [inputEnd, setInputEnd] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const challenges = [
        { q: ['AB', 'BD'], ansStart: 'A', ansEnd: 'D', hint: "حرف B متكرر كـ 'نهاية' للأول و'بداية' للثاني." },
        { q: ['FG', 'EF'], ansStart: 'E', ansEnd: 'G', hint: 'انتبه! أعد ترتيب الأشعة في ذهنك لتصبح النهاية هي البداية.' },
        { q: ['MN', 'NP', 'PQ'], ansStart: 'M', ansEnd: 'Q', hint: 'علاقة شال تعمل كالدومينو المتسلسل!' },
    ];

    const currentChallenge = challenges[challengeStep];

    const learnPages = [
        { title: 'الطريق المختصر', detail: 'إذا سافرت من A إلى B، ثم تابعت من B إلى C، فكأنك سافرت مباشرة من A إلى C.' },
        {
            title: 'علاقة شال السحرية',
            detail: 'يجب أن يكون الحرف الثاني في الشعاع الأول هو نفس الحرف الأول في الشعاع الثاني. ندمجهما ونحذف الحرف المكرر.',
            math: 'AB + BC = AC',
        },
        {
            title: 'التبديل الاستراتيجي',
            detail: 'أحياناً يخدعك التمرين ويعطيك أشعة غير مرتبة. الجمع تبديلي، أعد ترتيبها لتكتشف علاقة شال المخبأة.',
            math: 'CD + AC = AC + CD = AD',
        },
    ];

    const resetChallenges = () => {
        setChallengeStep(0);
        setInputStart(''); setInputEnd('');
        setError(false); setFeedback(null);
    };

    const handleAnswer = async () => {
        if (inputStart.toUpperCase() === currentChallenge.ansStart && inputEnd.toUpperCase() === currentChallenge.ansEnd) {
            setFeedback({ type: 'success', text: 'صحيح! دمجت المسارات بعلاقة شال بنجاح.' });
            setError(false);
            setInputStart(''); setInputEnd('');

            if (challengeStep < challenges.length - 1) {
                confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1000);
            } else {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                try {
                    const data = await rewardService.claimLabReward('vec-chasles-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع الحرف المشترك بين الشعاعين.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Route size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تدمج مسارات متعددة في مسار واحد مباشر باستخدام علاقة شال الشهيرة في جمع الأشعة.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل التفاعلي
                </button>
            </div>
            <button onClick={() => { resetChallenges(); setPhase('practice'); }} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
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
                    {learnPages[learnStep].math && (
                        <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                            <span className="font-mono font-black text-indigo-400" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
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
            level={challengeStep + 1}
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <p className={`text-sm font-bold ${theme.textSub}`}>أوجد المحصلة باستخدام علاقة شال</p>
                <div className="flex items-center justify-center gap-3 font-mono font-black text-lg" dir="ltr">
                    {currentChallenge.q.map((v, i) => (
                        <React.Fragment key={i}>
                            <span className={theme.textMain}>{v}</span>
                            {i < currentChallenge.q.length - 1 && <span className="opacity-40">+</span>}
                        </React.Fragment>
                    ))}
                    <span className="opacity-40">=</span>
                </div>

                <div className="flex items-center gap-2 font-mono font-black text-lg" dir="ltr">
                    <span className="text-indigo-400">V =</span>
                    <input type="text" maxLength={1} value={inputStart} onChange={e => setInputStart(e.target.value)} aria-label="الحرف الأول" autoFocus
                        className={`w-14 uppercase rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400' : 'bg-white border-indigo-200 text-indigo-700'}`} placeholder="؟" />
                    <input type="text" maxLength={1} value={inputEnd} onChange={e => setInputEnd(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} aria-label="الحرف الأخير"
                        className={`w-14 uppercase rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400' : 'bg-white border-indigo-200 text-indigo-700'}`} placeholder="؟" />
                </div>

                <button onClick={handleAnswer} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                    <CheckCircle2 size={18} /> تأكيد المحصلة
                </button>
            </div>
        </LabChallenge>
    );
}

export default function VecChaslesLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="vec-chasles"
            phase={phase}
            title="جمع الأشعة المتسلسلة"
            badgeText="علاقة شال"
            badgeIcon={Route}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <VecChaslesContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
