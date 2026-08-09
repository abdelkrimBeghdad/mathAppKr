import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('sys-substitution', lvl) }));
}

function SysSubstitutionContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(0); // 0..4 خطوات، 5 = تم
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('sys-subst')
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
    const problem = current.problem; // { eq1: {a:1,b,c}, eq2:{a,b,c}, isolated:{c,b}, x, y }

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setStep(0);
        setInput1(''); setInput2('');
        setFeedback(null);
    };

    // x = isolated.c - isolated.b*y  → بعد التعويض في eq2:
    // eq2.a*(isolated.c - isolated.b*y) + eq2.b*y = eq2.c
    // (eq2.b - eq2.a*isolated.b)*y = eq2.c - eq2.a*isolated.c
    const yCoeff = problem.eq2.b - problem.eq2.a * problem.isolated.b;
    const yConst = problem.eq2.c - problem.eq2.a * problem.isolated.c;

    const tutorialNotes = [
        {
            from: `معامل x في المعادلة الأولى يساوي 1 بالضبط: x + ${problem.eq1.b}y = ${problem.eq1.c}.`,
            why: `عندما يكون معامل مجهول ما يساوي 1، عزله سهل جداً: ننقل باقي الحدود للطرف الآخر فقط دون قسمة.`,
        },
        {
            from: `العبارة المعزولة x = ${problem.isolated.c} - ${problem.isolated.b}y وضعناها بين قوسين مكان x في المعادلة الثانية.`,
            why: `بما أن x تساوي هذه العبارة تماماً، فوضعها مكان x لا يغيّر شيئاً في المعادلة، لكنه يزيل x من المعادلة الثانية.`,
        },
        {
            from: `بعد نشر القوس نحصل على معادلة بمجهول y وحيد: ${yCoeff}y = ${yConst}.`,
            why: `الآن أصبح لدينا معادلة بمجهول واحد فقط، فيمكن حلّها مباشرة بالقسمة.`,
        },
        {
            from: `نعوّض y = ${problem.y} في عبارة العزل نفسها: x = ${problem.isolated.c} - ${problem.isolated.b}(${problem.y}).`,
            why: `عبارة العزل تربط x بـ y دائماً؛ الآن بعد أن عرفنا y يمكننا حساب x منها مباشرة دون العودة للمعادلتين الأصليتين.`,
        },
        {
            from: `${problem.isolated.c} - ${problem.isolated.b} × ${problem.y}`,
            why: `هذه العملية الحسابية البسيطة تعطينا القيمة النهائية لـ x.`,
        },
    ];

    const stepInstructions = [
        'الخطوة 1: اعزل x من المعادلة (1) لتصبح وحدها في طرف',
        'الخطوة 2: احقن العبارة التي وجدتها مكان x في المعادلة (2)',
        'الخطوة 3: انشر المعادلة الناتجة وحلها لإيجاد y',
        'الخطوة 4: عُد لعبارة العزل وعوض y بالقيمة التي وجدتها',
        'الخطوة 5: احسب النتيجة النهائية لتجد x',
    ];

    const handleCheckStep = async () => {
        let isCorrect = false;
        if (step === 0) isCorrect = parseInt(input1) === problem.isolated.c && parseInt(input2) === problem.isolated.b;
        else if (step === 1) isCorrect = parseInt(input1) === problem.isolated.c && parseInt(input2) === problem.isolated.b;
        else if (step === 2) isCorrect = parseInt(input1) === problem.y;
        else if (step === 3) isCorrect = parseInt(input1) === problem.y;
        else if (step === 4) isCorrect = parseInt(input1) === problem.x;

        if (isCorrect) {
            setError(false);
            setFeedback({ type: 'success', text: 'صحيح! انتقل للخطوة التالية.' });
            setInput1(''); setInput2('');
            if (step < 4) {
                setTimeout(() => { setStep(s => s + 1); setFeedback(null); }, 900);
            } else if (round < 2) {
                setTimeout(() => {
                    setFeedback({ type: 'success', text: `أحسنت! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][current.level]}. الجولة التالية أصعب.` });
                    setTimeout(() => { setRound(r => r + 1); setStep(0); setFeedback(null); }, 1400);
                }, 300);
            } else {
                setTimeout(async () => {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    await labProgressService.update('sys-subst', 'completed', 100).catch(() => { });
                    try {
                        const data = await rewardService.claimLabReward('sys-subst', {
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
                <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Layers size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تعزل مجهولاً وتزرعه داخل المعادلة الأخرى لتحل الجملة ببساطة تامة.
                    ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.
                </p>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all">
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
                detail: 'نختار المعادلة التي معامل x فيها يساوي 1 (بسيطة جداً). نعزل x لوحده في طرف.',
                visual: (
                    <div className="flex flex-col gap-3 text-base font-mono" dir="ltr">
                        <div className={theme.textMain}>x + y = 5</div>
                        <div className="text-emerald-400 font-black">x = 5 - y</div>
                    </div>
                ),
            },
            {
                title: 'خطوة 2: الحقن',
                detail: 'نأخذ القيمة (5 - y) ونضعها مكان x في المعادلة الثانية. شاهد كيف يختفي x!',
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
            {
                title: 'الجولات الثلاث',
                detail: 'ستحل نفس الطريقة على 3 مسائل مختلفة تتصاعد صعوبة، ولن تُمنح المكافأة إلا بعد اجتياز الجولة الثالثة (الأصعب) لضمان إتقانك الحقيقي.',
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
                        ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                        : <button onClick={() => { resetAll(); setPhase('practice'); }} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                    }
                </div>
            </div>
        );
    }

    return (
        <LabChallenge
            type="text"
            current={round * 5 + step + 1}
            total={15}
            level={current.level}
            question={stepInstructions[step]}
            hint={problem.hint}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(0); setInput1(''); setInput2(''); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
            tourSteps={[
                { target: 'sys-equations', title: 'نظام معادلتين', description: 'الهدف: عزل مجهول في إحدى المعادلتين، ثم تعويضه في الأخرى.' },
                { target: 'lab-answer-input', title: 'خطوات الحل', description: 'كل خطوة تبني على سابقتها — تابع بالترتيب حتى تصل لقيمتي x وy.' },
                { target: 'lab-hint-button', title: 'بحاجة لمساعدة؟', description: 'اضغط هنا لتلميح سريع حسب الخطوة الحالية.' },
            ]}
        >
            <div data-tour-id="sys-equations" className={`w-full p-3 rounded-xl border flex flex-col items-center gap-1 font-mono text-sm ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} ${theme.textMain}`} dir="ltr">
                <div className={step === 0 ? 'text-emerald-400 font-black' : ''}>1) x + {problem.eq1.b}y = {problem.eq1.c}</div>
                <div className={step === 1 ? 'text-amber-400 font-black' : ''}>2) {problem.eq2.a}x {problem.eq2.b < 0 ? '-' : '+'} {Math.abs(problem.eq2.b)}y = {problem.eq2.c}</div>
            </div>

            <div data-tour-id="lab-answer-input" className="flex items-center justify-center gap-2 font-mono text-base flex-wrap" dir="ltr">
                {step === 0 && (
                    <>
                        <span className="text-emerald-400 font-black">x = </span>
                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="القيمة الأولى"
                            className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="؟" autoFocus />
                        <span className={theme.textMain}>-</span>
                        <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="معامل y"
                            className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="؟" />
                        <span className={theme.textMain}>y</span>
                    </>
                )}
                {step === 1 && (
                    <>
                        <span className="text-amber-400 font-black">{problem.eq2.a}(</span>
                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="القيمة الأولى"
                            className={`w-14 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} placeholder="؟" autoFocus />
                        <span className={theme.textMain}>-</span>
                        <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="معامل y"
                            className={`w-14 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} placeholder="؟" />
                        <span className={theme.textMain}>y) {problem.eq2.b < 0 ? '-' : '+'} {Math.abs(problem.eq2.b)}y = {problem.eq2.c}</span>
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
                        <span className="text-emerald-400 font-black">x = {problem.isolated.c} - {problem.isolated.b}(</span>
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
        </LabChallenge>
    );
}

export default function SysSubstitutionLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="sys-subst"
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
