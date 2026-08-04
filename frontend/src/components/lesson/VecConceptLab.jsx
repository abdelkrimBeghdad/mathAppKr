import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, ArrowRight, CheckCircle2, MoveRight, AlignEndHorizontal, Ruler } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/vectors.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

const LAB_ID = 'vec-concept';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function VectorSvg({ dx, dy, color, label }) {
    const len = Math.sqrt(dx * dx + dy * dy) * 15;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return (
        <div className="flex flex-col items-center gap-2">
            <div style={{ width: 100, height: 100 }} className="relative flex items-center justify-center bg-black/20 rounded-xl border border-white/5">
                <div style={{ transform: `rotate(${angle}deg)`, width: len }} className="flex items-center origin-center">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <div className="h-0.5 flex-grow" style={{ backgroundColor: color }} />
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px]" style={{ borderLeftColor: color }} />
                </div>
            </div>
            <span className="font-bold text-sm text-slate-300 font-mono">{label}</span>
        </div>
    );
}

function VecConceptContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const problem = rounds[round]; // { level, kind, dx, dy, correctDx, correctDy, q, hint, options }

    const learnPages = [
        {
            title: 'ما هو الشعاع؟',
            detail: 'الشعاع ليس مجرد سهم نرسمه، بل هو تعبير عن "حركة انسحاب" لنقطة (أو شكل) من مكان إلى آخر. له نقطة بداية ونقطة نهاية.',
            visual: (
                <div className="relative w-full h-32 bg-black/40 rounded-xl overflow-hidden flex items-center justify-center">
                    <motion.div initial={{ x: -100 }} animate={{ x: 100 }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="flex items-center">
                        <div className="w-4 h-4 bg-fuchsia-500 rounded-full" />
                        <div className="h-1 w-32 bg-fuchsia-500 origin-left" />
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-[12px] border-l-fuchsia-500" />
                    </motion.div>
                </div>
            ),
        },
        {
            title: 'الهوية الثلاثية',
            detail: 'لكل شعاع 3 خصائص تميزه: الاتجاه (أين يذهب؟)، المنحى (على أي خط يوازي؟)، والطويلة (المسافة).',
            visual: (
                <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center gap-3 bg-black/30 p-2 rounded-lg"><MoveRight className="text-emerald-400" size={18} /><span className="text-white text-xs">الاتجاه (من A إلى B)</span></div>
                    <div className="flex items-center gap-3 bg-black/30 p-2 rounded-lg"><AlignEndHorizontal className="text-blue-400" size={18} /><span className="text-white text-xs">المنحى (التوازي أو الاستقامية)</span></div>
                    <div className="flex items-center gap-3 bg-black/30 p-2 rounded-lg"><Ruler className="text-amber-400" size={18} /><span className="text-white text-xs">الطويلة (المسافة بين النقطتين)</span></div>
                </div>
            ),
        },
        {
            title: 'الجولات الثلاث',
            detail: 'ستُختبر في 3 جولات تصاعدية الصعوبة، منها أسئلة عن تساوي شعاعين وأخرى عن الأشعة المتعاكسة.',
            visual: (
                <div className="relative w-full h-32 bg-black/40 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center w-32 relative">
                        <span className="absolute -top-6 -left-2 text-fuchsia-400 font-bold text-xs">A</span>
                        <span className="absolute -top-6 -right-2 text-fuchsia-400 font-bold text-xs">B</span>
                        <div className="w-2 h-2 bg-fuchsia-500 rounded-full" />
                        <div className="h-1 flex-grow bg-fuchsia-500" />
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-fuchsia-500" />
                    </div>
                    <div className="flex items-center w-32 relative translate-x-12">
                        <span className="absolute -bottom-6 -left-2 text-cyan-400 font-bold text-xs">C</span>
                        <span className="absolute -bottom-6 -right-2 text-cyan-400 font-bold text-xs">D</span>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                        <div className="h-1 flex-grow bg-cyan-500" />
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-cyan-500" />
                    </div>
                </div>
            ),
        },
    ];

    useEffect(() => {
        labProgressService.getOne(LAB_ID)
            .then(p => { if (p) { const lvl = difficultyEngine.getLevel(p); setBaseLevel(lvl); setRounds(buildRounds(lvl)); } })
            .catch(() => { });
    }, []);

    const resetChallenges = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setFeedback(null);
        setReward(null);
    };

    const startPractice = () => {
        resetChallenges();
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const handleAnswer = async (opt) => {
        if (opt.correct) {
            setFeedback({ type: 'success', text: 'إجابة صحيحة! تطابقت الخصائص المطلوبة.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (round < 2) {
                setTimeout(() => { setRound(r => r + 1); setFeedback(null); }, 1400);
            } else {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward(LAB_ID, {
                        type: 'vec-concept-match',
                        kind: problem.kind,
                        targetDx: problem.dx, targetDy: problem.dy,
                        chosenDx: opt.dx, chosenDy: opt.dy,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'خطأ! تأكد من تطابق الخصائص الثلاثة.' });
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-fuchsia-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Navigation size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعرف على المعنى الحقيقي للشعاع! ليس مجرد خط وسهم، بل هو لغة تصف الحركة والانسحاب في الفضاء.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-fuchsia-50 text-fuchsia-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل التفاعلي
                </button>
            </div>
            <button onClick={startPractice} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
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
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 mx-auto max-w-md min-h-[160px] flex items-center justify-center">
                        {learnPages[learnStep].visual}
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge بنوع choice ───────────────────────────
    return (
        <LabChallenge
            type="choice"
            current={round + 1}
            total={3}
            level={problem.level}
            question={problem.q}
            hint={problem.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className="flex flex-col items-center pb-4 border-b border-white/10 w-full">
                    <span className={`text-xs font-bold uppercase mb-2 ${theme.textSub}`}>الشعاع المرجعي</span>
                    <VectorSvg dx={problem.dx} dy={problem.dy} color="#d946ef" label="AB" />
                </div>

                <div className="flex flex-wrap justify-center gap-4" role="group" aria-label="اختر الشعاع المطابق">
                    {problem.options.map(opt => (
                        <button key={opt.id} onClick={() => handleAnswer(opt)}
                            className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-black/40 hover:border-fuchsia-500/50' : 'border-slate-200 bg-white hover:border-fuchsia-400'}`}
                        >
                            <VectorSvg dx={opt.dx} dy={opt.dy} color="#38bdf8" label={opt.id} />
                        </button>
                    ))}
                </div>

                <LabTutorialNote
                    from={`الشعاع المرجعي له مركبتان: dx = ${problem.dx}، dy = ${problem.dy}.`}
                    why={problem.kind === 'equal'
                        ? 'شعاعان متساويان يعنيان أن لهما نفس المركبتين (نفس dx ونفس dy) تماماً — أي نفس الطول ونفس الاتجاه ونفس المنحى.'
                        : 'الشعاع المعاكس له نفس الطول ونفس المنحى، لكن مركبتيه معكوستا الإشارة (سالب dx وسالب dy)، أي يشير للجهة المضادة تماماً.'}
                />
            </div>
        </LabChallenge>
    );
}

export default function VecConceptLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId={LAB_ID}
            phase={phase}
            title="فلسفة الحركة"
            badgeText="مفهوم الشعاع والانسحاب"
            badgeIcon={Navigation}
            accentColor="fuchsia"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <VecConceptContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
