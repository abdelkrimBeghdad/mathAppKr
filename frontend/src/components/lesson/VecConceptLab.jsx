import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, ArrowRight, CheckCircle2, MoveRight, AlignEndHorizontal, Ruler } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function VectorSvg({ dx, dy, color, label }) {
    const len = Math.sqrt(dx * dx + dy * dy) * 20;
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
    const [challengeStep, setChallengeStep] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

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
            title: 'تساوي شعاعين',
            detail: 'نقول عن شعاعين أنهما متساويان إذا تطابقت خصائصهما الثلاثة! لا يهم إن كانا متباعدين في المكان، المهم أن لهما نفس الحركة.',
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

    const challenges = [
        {
            q: 'اختر الشعاع الذي يماثل (يساوي) الشعاع AB:',
            hint: 'يجب أن يكون له نفس الطول، ويوازيه، ويشير إلى نفس الجهة.',
            target: { dx: 3, dy: 1, label: 'AB', color: '#d946ef' },
            options: [
                { id: '1', dx: 3, dy: 1, label: 'CD', correct: true },
                { id: '2', dx: 3, dy: -1, label: 'EF', correct: false },
                { id: '3', dx: -3, dy: -1, label: 'GH', correct: false },
            ],
        },
        {
            q: 'الشعاعان المتعاكسان لهما نفس الطول ونفس المنحى، لكن اتجاههما...',
            hint: 'الكلمة نفسها تشرح المعنى: متعاكسان.',
            target: { dx: 0, dy: -2, label: 'MN', color: '#d946ef' },
            options: [
                { id: '1', dx: 0, dy: -2, label: 'نفسه', correct: false },
                { id: '2', dx: 0, dy: 2, label: 'متعاكس', correct: true },
                { id: '3', dx: 2, dy: 0, label: 'عمودي', correct: false },
            ],
        },
    ];

    const currentChallenge = challenges[challengeStep];

    const resetChallenges = () => { setChallengeStep(0); setFeedback(null); };

    const handleAnswer = async (opt) => {
        if (opt.correct) {
            setFeedback({ type: 'success', text: 'إجابة صحيحة! تطابقت الخصائص الثلاث.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1400);
            } else {
                try {
                    const data = await rewardService.claimLabReward('vec-concept-mastery');
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
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all">
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
                    : <button onClick={() => { resetChallenges(); setPhase('practice'); }} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge بنوع choice ───────────────────────────
    return (
        <LabChallenge
            type="choice"
            current={challengeStep + 1}
            total={challenges.length}
            level={challengeStep + 1}
            question={currentChallenge.q}
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className="flex flex-col items-center pb-4 border-b border-white/10 w-full">
                    <span className={`text-xs font-bold uppercase mb-2 ${theme.textSub}`}>الشعاع المرجعي</span>
                    <VectorSvg dx={currentChallenge.target.dx} dy={currentChallenge.target.dy} color={currentChallenge.target.color} label={currentChallenge.target.label} />
                </div>

                <div className="flex flex-wrap justify-center gap-4" role="group" aria-label="اختر الشعاع المطابق">
                    {currentChallenge.options.map(opt => (
                        <button key={opt.id} onClick={() => handleAnswer(opt)}
                            className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-black/40 hover:border-fuchsia-500/50' : 'border-slate-200 bg-white hover:border-fuchsia-400'}`}
                        >
                            {opt.dx !== undefined ? (
                                <VectorSvg dx={opt.dx} dy={opt.dy} color="#38bdf8" label={opt.label} />
                            ) : (
                                <span className="font-black text-xl px-6 py-2 block text-cyan-400">{opt.label}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </LabChallenge>
    );
}

export default function VecConceptLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="vec-concept"
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
