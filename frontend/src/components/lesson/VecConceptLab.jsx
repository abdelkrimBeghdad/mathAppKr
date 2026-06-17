import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, CheckCircle2, HelpCircle, ArrowRight, MoveRight, AlignEndHorizontal, Ruler } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';

const VecConceptContent = ({ isDarkMode }) => {
    const { theme } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0); 
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'ما هو الشعاع؟',
            detail: 'الشعاع ليس مجرد سهم نرسمه، بل هو تعبير عن "حركة انسحاب" لنقطة (أو شكل) من مكان إلى آخر. له نقطة بداية ونقطة نهاية.',
            visual: (
                <div className="relative w-full h-32 bg-black/40 rounded-xl overflow-hidden flex items-center justify-center">
                    <motion.div initial={{ x: -100 }} animate={{ x: 100 }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex items-center">
                        <div className="w-4 h-4 bg-fuchsia-500 rounded-full" />
                        <div className="h-1 w-32 bg-fuchsia-500 origin-left" />
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-[12px] border-l-fuchsia-500" />
                    </motion.div>
                </div>
            )
        },
        {
            title: 'الهوية الثلاثية',
            detail: 'لكل شعاع 3 خصائص تميزه (بصمة الشعاع): الاتجاه (أين يذهب؟)، المنحى (على أي خط يوازي؟)، والطويلة (المسافة).',
            visual: (
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex items-center gap-4 bg-black/30 p-2 rounded-lg">
                        <MoveRight className="text-emerald-400" />
                        <span className="text-white text-sm">الاتجاه (من A إلى B)</span>
                    </div>
                    <div className="flex items-center gap-4 bg-black/30 p-2 rounded-lg">
                        <AlignEndHorizontal className="text-blue-400" />
                        <span className="text-white text-sm">المنحى (التوازي أو الاستقامية)</span>
                    </div>
                    <div className="flex items-center gap-4 bg-black/30 p-2 rounded-lg">
                        <Ruler className="text-amber-400" />
                        <span className="text-white text-sm">الطويلة (المسافة بين النقطتين)</span>
                    </div>
                </div>
            )
        },
        {
            title: 'تساوي شعاعين',
            detail: 'نقول عن شعاعين أنهما متساويان إذا (وفقط إذا) تطابقت خصائصهما الثلاثة! لا يهم إن كانا متباعدين في المكان، المهم أن لهما نفس الحركة.',
            visual: (
                <div className="relative w-full h-32 bg-black/40 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center w-32 relative">
                        <span className="absolute -top-6 -left-2 text-fuchsia-400 font-bold">A</span>
                        <span className="absolute -top-6 -right-2 text-fuchsia-400 font-bold">B</span>
                        <div className="w-2 h-2 bg-fuchsia-500 rounded-full" />
                        <div className="h-1 flex-grow bg-fuchsia-500" />
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-fuchsia-500" />
                    </div>
                    <div className="flex items-center w-32 relative translate-x-12">
                        <span className="absolute -bottom-6 -left-2 text-cyan-400 font-bold">C</span>
                        <span className="absolute -bottom-6 -right-2 text-cyan-400 font-bold">D</span>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                        <div className="h-1 flex-grow bg-cyan-500" />
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-cyan-500" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="bg-black/80 text-white px-2 py-1 rounded text-sm font-bold opacity-80 backdrop-blur">متساويان! نفس الحركة</span>
                    </div>
                </div>
            )
        }
    ];

    const challenges = [
        {
            q: "اختر الشعاع الذي يماثل (يساوي) الشعاع AB:",
            hint: "يجب أن يكون له نفس الطول، ويوازيه، ويشير إلى نفس الجهة.",
            target: { dx: 3, dy: 1, label: 'AB', color: '#d946ef' },
            options: [
                { id: '1', dx: 3, dy: 1, label: 'CD', correct: true },
                { id: '2', dx: 3, dy: -1, label: 'EF', correct: false },
                { id: '3', dx: -3, dy: -1, label: 'GH', correct: false },
            ]
        },
        {
            q: "الشعاعان المتعاكسان لهما نفس الطول ونفس المنحى، لكن اتجاههما...",
            hint: "الكلمة نفسها تشرح المعنى: متعاكسان.",
            target: { dx: 0, dy: -2, label: 'MN', color: '#d946ef' },
            options: [
                { id: '1', dx: 0, dy: -2, label: 'نفسه', correct: false },
                { id: '2', dx: 0, dy: 2, label: 'متعاكس', correct: true },
                { id: '3', dx: 2, dy: 0, label: 'عمودي', correct: false },
            ]
        }
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async (opt) => {
        if (opt.correct) {
            setFeedback({ type: 'success', text: 'إجابة صحيحة! ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setShowHint(false);

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1500);
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

    const VectorSvg = ({ dx, dy, color, label }) => {
        const len = Math.sqrt(dx*dx + dy*dy) * 20; // scale
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
    };

    return (
        <LabShell
            isDarkMode={isDarkMode}
            labId="vec-concept"
            accentColor="fuchsia"
            badgeText="مفهوم الشعاع والانسحاب"
            badgeIcon={Navigation}
            title={phase === 'intro' ? "فلسفة الحركة" : (phase === 'learn' ? 'التحليل النظري' : reward ? 'مكتمل' : `تحدي المفاهيم ${challengeStep + 1}/${challenges.length}`)}
            phase={phase}
            onBack={() => setPhase('intro')}
        >
            <div className="w-full h-full flex flex-col items-center justify-center min-h-0">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-fuchsia-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow">
                                <Navigation size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعرف على المعنى الحقيقي للشعاع! ليس مجرد خط وسهم، بل هو لغة تصف الحركة والانسحاب في الفضاء.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all text-lg">فتح الدليل التفاعلي</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتحدي</button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl relative overflow-hidden text-center ${theme.card}`}>
                             <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                             <p className={`text-base md:text-lg ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                             <div className={`p-6 rounded-2xl bg-black/40 border border-white/5 mx-auto max-w-md min-h-[160px] flex items-center justify-center`}>
                                 {learnPages[learnStep].visual}
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-200 text-slate-700'}`}>السابق</button>
                             {learnStep < learnPages.length - 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-3xl px-2">
                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-3 text-center shadow-2xl ${theme.card}`}>
                            <h3 className={`text-base md:text-lg font-black mb-3 ${theme.textMain}`}>{currentChallenge.q}</h3>
                            
                            {/* Target Vector */}
                            <div className="flex flex-col items-center mb-4 border-b border-white/10 pb-6">
                                <span className={`text-sm font-bold uppercase mb-2 ${theme.textSub}`}>الشعاع المرجعي</span>
                                <VectorSvg dx={currentChallenge.target.dx} dy={currentChallenge.target.dy} color={currentChallenge.target.color} label={currentChallenge.target.label} />
                            </div>

                            {/* Options */}
                            <div className="flex flex-wrap justify-center gap-4">
                                {currentChallenge.options.map((opt) => (
                                    <button key={opt.id} onClick={() => handleAnswer(opt)} className={`p-4 rounded-xl border-2 transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-fuchsia-500/50' : 'border-slate-200 bg-white hover:border-fuchsia-400 hover:bg-slate-50'}`}>
                                        {opt.dx !== undefined ? (
                                            <VectorSvg dx={opt.dx} dy={opt.dy} color="#38bdf8" label={opt.label} />
                                        ) : (
                                            <span className="font-black text-xl px-6 py-2 block text-cyan-400">{opt.label}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {feedback && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-lg font-black ${feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {feedback.text}
                            </motion.div>
                        )}

                        <div className="w-full mt-2 text-center">
                            <button onClick={() => setShowHint(!showHint)} className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mx-auto ${isDarkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                <HelpCircle size={20} /> عرض التلميح
                            </button>
                            <AnimatePresence>
                                {showHint && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full text-center mt-4">
                                        <p className="text-amber-500 text-sm font-bold border-t border-amber-500/20 pt-4">{currentChallenge.hint}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {reward && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); }} className="mt-4 w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
        </LabShell>
    );
};

export default function VecConceptLab(props) {
    return <VecConceptContent {...props} />;
}

