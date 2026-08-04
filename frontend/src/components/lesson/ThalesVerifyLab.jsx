import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/geometry.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

const LAB_ID = 'thales-verify';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function ThalesVerifyContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const problem = rounds[round]; // { level, ad, ab, ae, ac, isParallel }

    const learnPages = [
        {
            title: 'هل المستقيمان متوازيان؟',
            detail: 'للتحقق من توازي مستقيمين في شكل طاليس (الخاصية العكسية)، نحسب النسبتين AD/AB و AE/AC ونقارنهما.',
            math: 'AD/AB = AE/AC ؟',
        },
        {
            title: 'خطوات التحقق',
            detail: 'احسب النسبة الأولى (الصغير على الكبير في جهة)، ثم النسبة الثانية في الجهة الأخرى. إذا تساوتا → المستقيمان متوازيان.',
            math: '2/6 = 3/9 → 0.33 = 0.33 ✓',
        },
        {
            title: 'الجولات الثلاث',
            detail: 'ستُختبر في 3 حالات تصاعدية الصعوبة، بعضها متوازٍ وبعضها ليس كذلك — انتبه للأرقام المتقاربة في المستوى المتقدم.',
            math: 'مبتدئ ➜ متوسط ➜ متقدم',
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
        setAnswered(false);
        setError(false);
        setFeedback(null);
        setReward(null);
    };

    const startPractice = () => {
        resetChallenges();
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const handleAnswer = async (userAnswer) => {
        if (userAnswer === problem.isParallel) {
            setAnswered(true);
            setFeedback({ type: 'success', text: 'إجابة صحيحة! قارنت النسبتين بدقة.' });
            if (round < 2) {
                setTimeout(() => { setRound(r => r + 1); setAnswered(false); setFeedback(null); }, 1400);
            } else {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward(LAB_ID, {
                        type: 'thales-verify-parallel',
                        ad: problem.ad, ab: problem.ab, ae: problem.ae, ac: problem.ac,
                        answer: problem.isParallel,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'قارن AD/AB مع AE/AC بدقة أكبر.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1200);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>شرط التوازي:</h3>
                <div className={`p-3 rounded-xl border text-center mb-3 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-blue-50 border-blue-100'}`}>
                    <div className={`text-base font-black font-mono ${theme.textMain}`} dir="ltr">
                        AD/AB = AE/AC <span className="text-blue-400">?</span>
                    </div>
                </div>
                <p className={`text-sm ${theme.textSub}`}>إذا تساوت النسبتان → المستقيمان متوازيان (DE ∥ BC).</p>
                <div className={`my-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`mt-1 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}
                >
                    كيف أتحقق؟
                </button>
            </div>
            <motion.button
                onClick={startPractice}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-blue-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Triangle size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">ابدأ التحقق</span>
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
                        <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-blue-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-blue-50'}`}>
                            <span className="font-mono font-black text-blue-400" dir="ltr">{learnPages[learnStep].math}</span>
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
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black">التالي</button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">ابدأ التحقق</button>
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
            question="هل المستقيمان (DE) و (BC) متوازيان؟"
            hint="قارن النسبة AD/AB مع AE/AC — إن تساوتا فالمستقيمان متوازيان."
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenges}
            onRestart={() => { setPhase('intro'); resetChallenges(); }}
            tourSteps={[
                { target: 'thales-triangle-svg', title: 'مثلث طاليس', description: 'المستقيم DE داخل المثلث الكبير ABC. نريد معرفة هل هو موازٍ للضلع BC.' },
                { target: 'thales-ratios-box', title: 'النسبتان المطلوب مقارنتهما', description: 'إن تساوت النسبتان AD/AB وAE/AC تماماً، فالمستقيمان متوازيان.' },
                { target: 'thales-verify-buttons', title: 'إجابتك', description: 'اضغط "نعم" إن كانت النسبتان متساويتين، أو "لا" إن اختلفتا ولو بمقدار بسيط.' },
            ]}
        >
            <div className="w-full flex flex-col items-center gap-4">

                {/* رسم مثلث طاليس */}
                <svg data-tour-id="thales-triangle-svg" width="150" height="112" viewBox="0 0 200 150">
                    <path d="M100 20 L20 140 L180 140 Z" fill="none" stroke={isDarkMode ? '#64748b' : '#94a3b8'} strokeWidth="2" />
                    <line x1="60" y1="80" x2="140" y2="80" stroke={isDarkMode ? '#3b82f6' : '#2563eb'} strokeWidth="3" />
                    <text x="95" y="15" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>A</text>
                    <text x="10" y="145" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>B</text>
                    <text x="180" y="145" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>C</text>
                    <text x="50" y="85" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#60a5fa' : '#3b82f6'}>D</text>
                    <text x="145" y="85" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#60a5fa' : '#3b82f6'}>E</text>
                </svg>

                {/* عرض النسبتين */}
                <div data-tour-id="thales-ratios-box" className={`w-full p-3 rounded-xl border font-mono text-sm text-center ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} ${theme.textMain}`} dir="ltr">
                    <div>AD/AB = {problem.ad}/{problem.ab} = {(problem.ad / problem.ab).toFixed(2)}</div>
                    <div>AE/AC = {problem.ae}/{problem.ac} = {(problem.ae / problem.ac).toFixed(2)}</div>
                </div>

                {/* أزرار نعم/لا */}
                <div data-tour-id="thales-verify-buttons" className="flex gap-3 w-full" role="group" aria-label="هل المستقيمان متوازيان">
                    <button
                        onClick={() => handleAnswer(true)}
                        disabled={answered}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white ${error || answered ? 'opacity-60' : ''}`}
                    >
                        <Check size={18} /> نعم، متوازيان
                    </button>
                    <button
                        onClick={() => handleAnswer(false)}
                        disabled={answered}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white ${error || answered ? 'opacity-60' : ''}`}
                    >
                        <X size={18} /> لا، غير متوازيين
                    </button>
                </div>
            </div>
        </LabChallenge>
    );
}

export default function ThalesVerifyLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId={LAB_ID}
            phase={phase}
            title="التحقق من التوازي"
            badgeText="نظرية طاليس العكسية"
            badgeIcon={Triangle}
            accentColor="blue"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <ThalesVerifyContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
