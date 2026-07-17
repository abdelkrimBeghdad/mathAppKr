import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sigma, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function SysAdditionContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0); // 0..3 خطوات، 4 = تم
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    // المسألة: 2x + y = 4  و  x - 2y = -3  →  x=1, y=2
    const problem = { multiplier: 2, new_eq1: { a: 4, b: 2, c: 8 }, x: 1, y: 2 };

    const learnPages = [
        {
            title: 'مبدأ الجمع',
            detail: 'إذا كانت المعاملات متعاكسة (+2y و -2y)، يمكننا جمع المعادلتين للتخلص من المجهول y تماماً.',
            visual: (
                <div className="flex flex-col gap-3 text-lg font-mono" dir="ltr">
                    <div className="text-blue-400">1) 2x + y = 4</div>
                    <div className="text-violet-400">2) x - 2y = -3</div>
                </div>
            ),
        },
        {
            title: 'خطوة 1: الموازنة',
            detail: 'نلاحظ أن y في المعادلة الأولى معامله 1، وفي الثانية -2. نضربها في 2 لتصبح المعادلة الأولى تحتوي على +2y.',
            visual: (
                <div className="flex flex-col items-center gap-2 text-base font-mono" dir="ltr">
                    <div className={`opacity-60 ${theme.textMain}`}>(2x + y = 4) × <span className="text-rose-400 font-black">2</span></div>
                    <div className="text-blue-400 font-black mt-1">1) 4x + 2y = 8</div>
                    <div className="text-violet-400">2) x - 2y = -3</div>
                </div>
            ),
        },
        {
            title: 'خطوة 2: الاصطدام المباشر',
            detail: 'نجمع المعادلتين طرفاً لطرف. لاحظ كيف تتصادم وتختفي (+2y) مع (-2y).',
            visual: (
                <div className="flex flex-col items-center gap-2 text-base font-mono" dir="ltr">
                    <div className="text-blue-400 w-full text-center">4x <span className="text-emerald-400">+ 2y</span> = 8</div>
                    <div className={`w-full border-b-2 pb-2 text-center text-violet-400 ${isDarkMode ? 'border-white/10' : 'border-slate-300'}`}>+ x <span className="text-rose-400">- 2y</span> = -3</div>
                    <div className={`mt-2 font-black ${theme.textMain}`}>5x + 0y = 5</div>
                </div>
            ),
        },
        {
            title: 'خطوة 3: التبسيط والتعويض العكسي',
            detail: 'من المعادلة (5x = 5) نجد أن x = 1. الآن نعوض بـ 1 في المعادلة الأصلية لنجد y.',
            visual: (
                <div className="flex flex-col items-center gap-2 text-base font-mono" dir="ltr">
                    <div className="text-blue-400">2<span className="text-amber-400 font-black">(1)</span> + y = 4</div>
                    <div className={`font-black mt-1 ${theme.textMain}`}>2 + y = 4 → <span className="text-emerald-400">y = 2</span></div>
                </div>
            ),
        },
    ];

    const stepInstructions = [
        'الخطوة 1: نضرب المعادلة (1) في عدد لنجعل معامل y متعاكساً مع المعادلة (2). ما هو هذا العدد؟',
        'الخطوة 2: اكتب المعادلة (1) الجديدة بعد الضرب:',
        'الخطوة 3: اجمع المعادلتين طرفاً لطرف لحساب قيمة x',
        'الخطوة 4: عوض x بالعدد الذي وجدته لحساب y',
    ];

    const hints = [
        'نريد التخلص من y. المعادلة الثانية تحتوي على -2y، لذا يجب أن تصبح المعادلة الأولى محتوية على +2y. اضرب في 2.',
        'اضرب كل طرف في المعادلة الأولى في 2: (2×2=4)، (1×2=2)، (4×2=8)',
        'اجمع: 4x مع x تساوي 5x. و 2y مع -2y تساوي 0. و 8 مع -3 تساوي 5. إذن 5x = 5.',
        'عوض x بـ 1 في المعادلة: 2(1) + y = 4. إذن 2 + y = 4.',
    ];

    const handleCheckStep = async () => {
        let isCorrect = false;
        if (step === 0) isCorrect = parseInt(input1) === problem.multiplier;
        else if (step === 1) isCorrect = parseInt(input1) === problem.new_eq1.a && parseInt(input2) === problem.new_eq1.b && parseInt(input3) === problem.new_eq1.c;
        else if (step === 2) isCorrect = parseInt(input1) === problem.x;
        else if (step === 3) isCorrect = parseInt(input1) === problem.y;

        if (isCorrect) {
            setError(false);
            setFeedback({ type: 'success', text: 'صحيح! انتقل للخطوة التالية.' });
            setInput1(''); setInput2(''); setInput3('');
            if (step < 3) {
                setTimeout(() => { setStep(s => s + 1); setFeedback(null); }, 900);
            } else {
                setTimeout(async () => {
                    setStep(4);
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    try {
                        const data = await rewardService.claimLabReward('sys-add-mastery');
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
                <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Sigma size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تضرب المعادلات لتوازن معاملاتها، ثم تجمعها لإزالة أحد المجاهيل من طريقك.
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all">
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
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
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
            total={4}
            level={step < 1 ? 1 : step < 3 ? 2 : 3}
            question={stepInstructions[step]}
            hint={hints[step]}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(0); setInput1(''); setInput2(''); setInput3(''); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); setStep(0); setInput1(''); setInput2(''); setInput3(''); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className={`w-full p-3 rounded-xl border flex flex-col items-center gap-1 font-mono text-sm ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} ${theme.textMain}`} dir="ltr">
                    <div className={step === 0 || step === 1 ? 'text-blue-400 font-black' : ''}>1) 2x + y = 4</div>
                    <div className="text-violet-400 font-black">2) x - 2y = -3</div>
                </div>

                <div className="flex items-center justify-center gap-2 font-mono text-base flex-wrap" dir="ltr">
                    {step === 0 && (
                        <>
                            <span className="text-blue-400 font-black">(2x + y = 4) × </span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="عامل الضرب"
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-blue-500/50 text-blue-400' : 'bg-white border-blue-200 text-blue-700'}`} placeholder="؟" autoFocus />
                        </>
                    )}
                    {step === 1 && (
                        <>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="معامل x"
                                className={`w-14 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-blue-500/50 text-blue-400' : 'bg-white border-blue-200 text-blue-700'}`} autoFocus />
                            <span className={theme.textMain}>x +</span>
                            <input type="number" value={input2} onChange={e => setInput2(e.target.value)} aria-label="معامل y"
                                className={`w-14 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-blue-500/50 text-blue-400' : 'bg-white border-blue-200 text-blue-700'}`} />
                            <span className={theme.textMain}>y =</span>
                            <input type="number" value={input3} onChange={e => setInput3(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="الطرف الأيمن"
                                className={`w-14 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-blue-500/50 text-blue-400' : 'bg-white border-blue-200 text-blue-700'}`} />
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <span className="text-emerald-400 font-black">5x = 5 → x = </span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="قيمة x"
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="؟" autoFocus />
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <span className="text-amber-400 font-black">2(1) + y = 4 → y = </span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="قيمة y"
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} placeholder="؟" autoFocus />
                        </>
                    )}
                </div>

                <button onClick={handleCheckStep} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                    <CheckCircle2 size={18} /> تأكيد
                </button>
            </div>
        </LabChallenge>
    );
}

export default function SysAdditionLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="sys-addition"
            phase={phase}
            title="الاندماج الخطي"
            badgeText="طريقة الجمع"
            badgeIcon={Sigma}
            accentColor="blue"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <SysAdditionContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
