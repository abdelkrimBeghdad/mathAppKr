import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sigma, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

// 3 جولات تصاعدية الصعوبة: مبتدئ ➜ متوسط ➜ متقدم. المكافأة تُمنح فقط بعد
// اجتياز الجولة الثالثة (الأصعب)، ويُرسل حلّها الحقيقي للتحقق الخادمي.
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('sys-addition', lvl) }));
}

function SysAdditionContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);       // 0..2 (مبتدئ/متوسط/متقدم)
    const [step, setStep] = useState(0);          // 0..3 خطوات داخل كل جولة
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('sys-add')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    setRounds(buildRounds(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const current = rounds[round];
    const problem = current.problem; // { eq1, eq2, multiplier, newEq1, sumEq, x, y, q, hint }

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setStep(0);
        setInput1(''); setInput2(''); setInput3('');
        setFeedback(null);
    };

    // نص "من أين/لماذا" مبني ديناميكياً من أرقام المسألة الحالية نفسها،
    // حتى يفهم المتعلم لماذا هذا الرقم بالذات مطلوب هنا (لا شرح عام مجرد).
    const tutorialNotes = [
        {
            from: `معامل y في المعادلة الثانية هو ${problem.eq2.b}، ومعامله في المعادلة الأولى هو ${problem.eq1.b}.`,
            why: `نريد أن يصبح معامل y في المعادلة الأولى مساوياً في القيمة المطلقة لمعامله في الثانية (${Math.abs(problem.eq2.b)}) حتى يُلغى عند الجمع.`,
        },
        {
            from: `ضربنا كل حدود المعادلة الأولى (${problem.eq1.a}, ${problem.eq1.b}, ${problem.eq1.c}) في ${problem.multiplier}.`,
            why: `الضرب في نفس العدد لكل الحدود يحافظ على صحة المعادلة، لكنه يكبّر معامل y ليتماثل مع المعادلة الثانية.`,
        },
        {
            from: `مجموع معاملي x: (${problem.newEq1.a} + ${problem.eq2.a}) ومجموع الطرفين الأيمنين: (${problem.newEq1.c} + ${problem.eq2.c}).`,
            why: `معامل y أصبح صفراً بعد الجمع، فتبقّى معادلة بمجهول واحد (x) يمكن حلّها مباشرة.`,
        },
        {
            from: `عوّضنا قيمة x التي أوجدناها في المعادلة الأصلية الأولى: ${problem.eq1.a}x + ${problem.eq1.b}y = ${problem.eq1.c}.`,
            why: `بعد معرفة x، يبقى مجهول واحد فقط (y) في أي من المعادلتين الأصليتين، فنحله بالتعويض المباشر.`,
        },
    ];

    const stepInstructions = [
        `الخطوة 1: بأي عدد نضرب المعادلة (1) لنجعل معامل y فيها متعاكساً مع المعادلة (2)؟`,
        `الخطوة 2: اكتب المعادلة (1) الجديدة بعد الضرب في ${problem.multiplier}:`,
        'الخطوة 3: اجمع المعادلتين طرفاً لطرف لحساب قيمة x',
        'الخطوة 4: عوض x بالعدد الذي وجدته لحساب y',
    ];

    const handleCheckStep = async () => {
        let isCorrect = false;
        if (step === 0) isCorrect = parseInt(input1) === problem.multiplier;
        else if (step === 1) isCorrect = parseInt(input1) === problem.newEq1.a && parseInt(input2) === problem.newEq1.b && parseInt(input3) === problem.newEq1.c;
        else if (step === 2) isCorrect = parseInt(input1) === problem.x;
        else if (step === 3) isCorrect = parseInt(input1) === problem.y;

        if (isCorrect) {
            setError(false);
            setFeedback({ type: 'success', text: 'صحيح! انتقل للخطوة التالية.' });
            setInput1(''); setInput2(''); setInput3('');
            if (step < 3) {
                setTimeout(() => { setStep(s => s + 1); setFeedback(null); }, 900);
            } else if (round < 2) {
                setTimeout(() => {
                    setFeedback({ type: 'success', text: `أحسنت! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][current.level]}. الجولة التالية أصعب.` });
                    setTimeout(() => { setRound(r => r + 1); setStep(0); setFeedback(null); }, 1400);
                }, 300);
            } else {
                setTimeout(async () => {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    await labProgressService.update('sys-add', 'completed', 100).catch(() => { });
                    try {
                        const data = await rewardService.claimLabReward('sys-add', {
                            type: 'system',
                            eq1: problem.eq1,
                            eq2: problem.eq2,
                            x: problem.x,
                            y: problem.y,
                        });
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

    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Sigma size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تضرب المعادلات لتوازن معاملاتها، ثم تجمعها لإزالة أحد المجاهيل من طريقك.
                    ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل التفاعلي
                </button>
            </div>
            <button onClick={() => { resetAll(); setPhase('practice'); }} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
                تخطي الشرح والبدء بالتدريب
            </button>
        </div>
    );

    if (phase === 'learn') {
        const learnPages = [
            {
                title: 'مبدأ الجمع',
                detail: 'إذا كانت المعاملات متعاكسة (مثلاً +2y و -2y)، يمكننا جمع المعادلتين للتخلص من المجهول y تماماً.',
                visual: (
                    <div className="flex flex-col gap-3 text-lg font-mono" dir="ltr">
                        <div className="text-blue-400">1) 2x + y = 4</div>
                        <div className="text-violet-400">2) x - 2y = -3</div>
                    </div>
                ),
            },
            {
                title: 'خطوة 1: الموازنة',
                detail: 'نلاحظ معامل y في كل معادلة، ونضرب إحداهما بعدد مناسب حتى يتماثل معامل y بالقيمة المطلقة ويتعاكس بالإشارة.',
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
            {
                title: 'الجولات الثلاث',
                detail: 'بعد الشرح ستحل نفس الطريقة على 3 مسائل مختلفة: الأولى سهلة، الثانية أصعب قليلاً، والثالثة الأصعب. لا تُمنح المكافأة إلا بعد اجتياز الجولة الثالثة، لضمان إتقانك الحقيقي للطريقة وليس مجرد حفظ إجابة واحدة.',
                visual: (
                    <div className="flex items-center gap-3 justify-center font-mono text-sm">
                        <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black">مبتدئ</span>
                        <ArrowRight size={16} className={theme.textSub} />
                        <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 font-black">متوسط</span>
                        <ArrowRight size={16} className={theme.textSub} />
                        <span className="px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-400 font-black">متقدم</span>
                    </div>
                ),
            },
        ];

        return (
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
                        : <button onClick={() => { resetAll(); setPhase('practice'); }} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                    }
                </div>
            </div>
        );
    }

    const b2Sign = problem.eq2.b < 0 ? '-' : '+';
    return (
        <LabChallenge
            type="text"
            current={round * 4 + step + 1}
            total={12}
            level={current.level}
            question={stepInstructions[step]}
            hint={problem.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(0); setInput1(''); setInput2(''); setInput3(''); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className={`w-full p-3 rounded-xl border flex flex-col items-center gap-1 font-mono text-sm ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} ${theme.textMain}`} dir="ltr">
                <div className={step === 0 || step === 1 ? 'text-blue-400 font-black' : ''}>1) {problem.eq1.a}x + {problem.eq1.b}y = {problem.eq1.c}</div>
                <div className="text-violet-400 font-black">2) {problem.eq2.a}x {b2Sign} {Math.abs(problem.eq2.b)}y = {problem.eq2.c}</div>
            </div>

            <div className="flex items-center justify-center gap-2 font-mono text-base flex-wrap" dir="ltr">
                {step === 0 && (
                    <>
                        <span className="text-blue-400 font-black">({problem.eq1.a}x + {problem.eq1.b}y = {problem.eq1.c}) × </span>
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
                        <span className="text-emerald-400 font-black">{problem.sumEq.a}x = {problem.sumEq.c} → x = </span>
                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="قيمة x"
                            className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="؟" autoFocus />
                    </>
                )}
                {step === 3 && (
                    <>
                        <span className="text-amber-400 font-black">{problem.eq1.a}({problem.x}) + {problem.eq1.b}y = {problem.eq1.c} → y = </span>
                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="قيمة y"
                            className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} placeholder="؟" autoFocus />
                    </>
                )}
            </div>

            <LabTutorialNote from={tutorialNotes[step].from} why={tutorialNotes[step].why} />

            <button onClick={handleCheckStep} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <CheckCircle2 size={18} /> تأكيد
            </button>
        </LabChallenge>
    );
}

export default function SysAdditionLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="sys-add"
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
