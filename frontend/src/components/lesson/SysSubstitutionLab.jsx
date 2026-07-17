import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function SysSubstitutionContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0); // 0..4 خطوات، 5 = تم
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    // المسألة: x + 2y = 8  و  3x - y = 10  →  x=4, y=2
    const problem = { x: 4, y: 2, c_isolated: 8, b_isolated: 2 };

    const learnPages = [
        {
            title: 'مبدأ التعويض',
            detail: 'تخيل أن لديك صندوقين (معادلتين). في طريقة التعويض، نفتح الصندوق الأسهل لنعرف قيمة x بدلالة y.',
            visual: (
                <div className="flex flex-col gap-3 text-lg font-mono" dir="ltr">
                    <div className="text-cyan-400">1) x + y = 5</div>
                    <div className="text-amber-400">2) 2x - y = 4</div>
                </div>
            ),
        },
        {
            title: 'خطوة 1: العزل',
            detail: 'نختار المعادلة الأولى لأن معامل x فيها هو 1 (بسيطة جداً). نعزل x لوحده في طرف.',
            visual: (
                <div className="flex flex-col gap-3 text-base font-mono" dir="ltr">
                    <div className={theme.textMain}>x + y = 5</div>
                    <div className="text-emerald-400 font-black">x = 5 - y</div>
                </div>
            ),
        },
        {
            title: 'خطوة 2: الحقن السحري',
            detail: 'نأخذ القيمة (5 - y) ونحقنها مكان x في المعادلة الثانية. شاهد كيف يختفي x!',
            visual: (
                <div className="flex flex-col items-center gap-2 text-base font-mono" dir="ltr">
                    <div className="text-emerald-400">x = 5 - y</div>
                    <div className="text-amber-400">2(x) - y = 4</div>
                    <div className={`mt-2 border-2 border-emerald-500/50 p-3 rounded-2xl ${theme.textMain}`}>
                        2<span className="text-emerald-400">(5 - y)</span> - y = 4
                    </div>
                </div>
            ),
        },
        {
            title: 'خطوة 3: الحل والعودة',
            detail: 'أصبحت المعادلة الثانية بمجهول واحد (y). نحلها، ثم نعود للقيمة المعزولة لنجد x.',
            visual: (
                <div className="flex flex-col items-center gap-2 text-base font-mono" dir="ltr">
                    <div className={theme.textMain}>10 - 2y - y = 4</div>
                    <div className={`opacity-70 ${theme.textMain}`}>-3y = -6 → <span className="text-amber-400">y = 2</span></div>
                    <div className={`mt-2 pt-2 border-t w-full text-center ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                        <div className={theme.textMain}>x = 5 - <span className="text-amber-400">y</span></div>
                        <div className="text-emerald-400 font-black mt-1">x = 5 - 2 = 3</div>
                    </div>
                </div>
            ),
        },
    ];

    const stepInstructions = [
        'الخطوة 1: اعزل x من المعادلة (1) لتصبح وحدها في طرف',
        'الخطوة 2: احقن العبارة التي وجدتها مكان x في المعادلة (2)',
        'الخطوة 3: انشر المعادلة الناتجة وحلها لإيجاد y',
        'الخطوة 4: عُد لعبارة العزل وعوض y بالقيمة التي وجدتها',
        'الخطوة 5: احسب النتيجة النهائية لتجد x',
    ];

    const hints = [
        'انقل +2y إلى الطرف الآخر من المعادلة الأولى لتصبح x وحدها.',
        'ضع القيمة التي وجدتها (8 - 2y) بين قوسين بدلاً من حرف x.',
        'انشر الرقم 3 على القوس، ثم اجمع قيم y معاً وحل المعادلة كالمعتاد.',
        'عوض قيمة y التي وجدتها (وهي 2) في العبارة المعزولة x = 8 - 2y.',
        'احسب العملية الحسابية البسيطة: 8 ناقص (2 مضروبة في 2).',
    ];

    const handleCheckStep = async () => {
        let isCorrect = false;
        if (step === 0) isCorrect = parseInt(input1) === problem.c_isolated && parseInt(input2) === problem.b_isolated;
        else if (step === 1) isCorrect = parseInt(input1) === problem.c_isolated && parseInt(input2) === problem.b_isolated;
        else if (step === 2) isCorrect = parseInt(input1) === problem.y;
        else if (step === 3) isCorrect = parseInt(input1) === problem.y;
        else if (step === 4) isCorrect = parseInt(input1) === problem.x;

        if (isCorrect) {
            setError(false);
            setFeedback({ type: 'success', text: 'صحيح! انتقل للخطوة التالية.' });
            setInput1('');
            setInput2('');
            if (step < 4) {
                setTimeout(() => { setStep(s => s + 1); setFeedback(null); }, 900);
            } else {
                setTimeout(async () => {
                    setStep(5);
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    try {
                        const data = await rewardService.claimLabReward('sys-subst-mastery');
                        if (data.status === 'success') setReward(data);
                    } catch (err) { console.error(err); }
                }, 900);
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع الحساب وحاول مرة أخرى.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Layers size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تعزل مجهولاً وتزرعه داخل المعادلة الأخرى لتحل الجملة ببساطة تامة.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل التفاعلي
                </button>
            </div>
            <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
                تخطي الشرح والبدء بالتدريب
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
                    <div className={`p-6 rounded-2xl border mx-auto max-w-md min-h-[140px] flex items-center justify-center ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        {learnPages[learnStep].visual}
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge لكل خطوة ────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={step + 1}
            total={5}
            level={step < 2 ? 1 : step < 4 ? 2 : 3}
            question={stepInstructions[step]}
            hint={hints[step]}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(0); setInput1(''); setInput2(''); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); setStep(0); setInput1(''); setInput2(''); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className={`w-full p-3 rounded-xl border flex flex-col items-center gap-1 font-mono text-sm ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} ${theme.textMain}`} dir="ltr">
                    <div className={step === 0 ? 'text-emerald-400 font-black' : ''}>1) x + 2y = 8</div>
                    <div className={step === 1 ? 'text-amber-400 font-black' : ''}>2) 3x - y = 10</div>
                </div>

                <div className="flex items-center justify-center gap-2 font-mono text-base flex-wrap" dir="ltr">
                    {step === 0 && (
                        <>
                            <span className="text-emerald-400 font-black">x = </span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="القيمة الأولى"
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="8" autoFocus />
                            <span className={theme.textMain}>-</span>
                            <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="معامل y"
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="2" />
                            <span className={theme.textMain}>y</span>
                        </>
                    )}
                    {step === 1 && (
                        <>
                            <span className="text-amber-400 font-black">3(</span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="القيمة الأولى"
                                className={`w-14 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} placeholder="8" autoFocus />
                            <span className={theme.textMain}>-</span>
                            <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="معامل y"
                                className={`w-14 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} placeholder="2" />
                            <span className={theme.textMain}>y) - y = 10</span>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <span className="text-amber-400 font-black">y = </span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="قيمة y"
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} placeholder="؟" autoFocus />
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <span className="text-emerald-400 font-black">x = 8 - 2(</span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="قيمة y المعوّضة"
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="y" autoFocus />
                            <span className="text-emerald-400 font-black">)</span>
                        </>
                    )}
                    {step === 4 && (
                        <>
                            <span className="text-emerald-400 font-black">x = </span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="القيمة النهائية لـ x"
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="؟" autoFocus />
                        </>
                    )}
                </div>

                <button onClick={handleCheckStep} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                    <CheckCircle2 size={18} /> تأكيد
                </button>
            </div>
        </LabChallenge>
    );
}

export default function SysSubstitutionLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="sys-substitution"
            phase={phase}
            title="حقن المتغيرات"
            badgeText="طريقة التعويض"
            badgeIcon={Layers}
            accentColor="emerald"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <SysSubstitutionContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
