import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, CheckCircle2, ArrowRight, Mountain, Eye, SunDim } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function ThalesInteractiveContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [sunAngle, setSunAngle] = useState(45);
    const [challengeStep, setChallengeStep] = useState(0);
    const [input1, setInput1] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    // حسابات الظل
    const stickHeight = 2;   // متر
    const pyramidHeight = 140; // متر (الهرم الأكبر)
    const stickShadow = stickHeight / Math.tan((sunAngle * Math.PI) / 180);
    const pyramidShadow = pyramidHeight / Math.tan((sunAngle * Math.PI) / 180);

    const learnPages = [
        {
            title: 'حيلة طاليس العبقرية',
            detail: 'في عام 600 قبل الميلاد، وقف طاليس أمام الهرم الأكبر وغرس عصاً صغيرة في الأرض. انتظر حتى تساوى طول ظل العصا مع طولها، فعرف أن ظل الهرم يساوي ارتفاعه!',
            visual: (
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="relative w-full h-32 bg-gradient-to-b from-amber-900/20 to-amber-500/10 rounded-2xl overflow-hidden border border-amber-500/20">
                        <motion.div
                            animate={{ x: `${70 - sunAngle * 0.5}%`, y: `${sunAngle * 0.3}%` }}
                            className="absolute w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center"
                        >
                            <Sun size={20} className="text-amber-900" />
                        </motion.div>
                        <svg viewBox="0 0 300 120" className="absolute bottom-0 w-full">
                            <polygon points="150,20 100,100 200,100" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="1.5" />
                            <motion.polygon
                                animate={{ points: `200,100 ${200 + pyramidShadow * 0.3},100 200,100` }}
                                fill="rgba(0,0,0,0.2)"
                            />
                            <line x1="240" y1="100" x2="240" y2="85" stroke="#22d3ee" strokeWidth="2" />
                            <motion.line
                                animate={{ x2: 240 + stickShadow * 5 }}
                                x1="240" y1="100" x2="250" y2="100" stroke="rgba(0,0,0,0.4)" strokeWidth="2"
                            />
                            <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-4 w-full">
                        <SunDim size={16} className="text-amber-400" />
                        <input
                            type="range" min="15" max="80" value={sunAngle}
                            onChange={e => setSunAngle(parseInt(e.target.value))}
                            aria-label="زاوية الشمس"
                            className="w-full accent-amber-500"
                        />
                        <Sun size={16} className="text-amber-400" />
                    </div>
                    <p className="text-amber-400 text-xs font-bold">زاوية الشمس: {sunAngle}° | ظل العصا: {stickShadow.toFixed(1)}م | ظل الهرم: {pyramidShadow.toFixed(0)}م</p>
                </div>
            ),
        },
        {
            title: 'قانون النسب المتساوية',
            detail: 'القاعدة بسيطة: إذا كانت الأشعة متوازية (أشعة الشمس)، فإن النسب تتساوى دائماً.',
            visual: (
                <div className="flex flex-col gap-4 text-xl font-black text-center" dir="ltr">
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex flex-col items-center text-cyan-400">
                            <span className="border-b-2 border-cyan-400 pb-1">طول العصا</span>
                            <span className="pt-1">ظل العصا</span>
                        </div>
                        <span className={`text-lg ${theme.textMain}`}>=</span>
                        <div className="flex flex-col items-center text-amber-400">
                            <span className="border-b-2 border-amber-400 pb-1">ارتفاع الهرم</span>
                            <span className="pt-1">ظل الهرم</span>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    const challenges = [
        { q: 'عصا طولها 2م وظلها 3م. إذا كان ظل الهرم 210م، فما ارتفاع الهرم؟', ans: 140, hint: '(2 / 3) = (؟ / 210) → ؟ = 2 × 210 / 3' },
        { q: 'شجرة ظلها 8م. عصا طولها 1.5م وظلها 2م. كم طول الشجرة؟', ans: 6, hint: '(1.5 / 2) = (؟ / 8) → ؟ = 1.5 × 8 / 2' },
    ];

    const currentChallenge = challenges[challengeStep];

    const handleAnswer = async () => {
        if (parseInt(input1) === currentChallenge.ans) {
            setFeedback({ type: 'success', text: 'صحيح! استخدمت حيلة طاليس كالمحترفين.' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setInput1('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => { setChallengeStep(s => s + 1); setFeedback(null); }, 1400);
            } else {
                try {
                    const data = await rewardService.claimLabReward('thales-shadow');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'استخدم التناسب: طول العصا / ظلها = المجهول / ظله.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Eye size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    سافر عبر الزمن إلى مصر القديمة وتعلم كيف استخدم طاليس ظل عصا صغيرة لقياس ارتفاع الهرم الأكبر دون لمسه!
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all">
                    السفر إلى مصر القديمة
                </button>
            </div>
            <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
                تخطي الشرح والبدء بالتحدي
            </button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={learnStep}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-3 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
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
                    <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">
                        التالي <ArrowRight size={18} />
                    </button>
                ) : (
                    <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">
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
            current={challengeStep + 1}
            total={challenges.length}
            level={challengeStep + 1}
            question={currentChallenge.q}
            hint={currentChallenge.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setChallengeStep(0); setInput1(''); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); setChallengeStep(0); setInput1(''); setReward(null); }}
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                <span className={theme.textMain}>=</span>
                <input
                    type="number"
                    value={input1}
                    onChange={e => setInput1(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                    aria-label="أدخل الارتفاع"
                    className={`w-32 rounded-xl text-center p-3 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400 focus:border-amber-400' : 'bg-white border-amber-200 text-amber-700 focus:border-amber-500'
                        }`}
                    placeholder="متر"
                    autoFocus
                />
            </div>
            <button
                onClick={handleAnswer}
                className="mt-4 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all"
            >
                <CheckCircle2 size={18} /> تحقق من الارتفاع
            </button>
        </LabChallenge>
    );
}

export default function ThalesInteractiveLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="thales-interactive"
            phase={phase}
            title="مختبر طاليس التاريخي"
            badgeText="ظل الأهرامات"
            badgeIcon={Mountain}
            accentColor="amber"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <ThalesInteractiveContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
