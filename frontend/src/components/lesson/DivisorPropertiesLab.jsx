import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Send, Lightbulb, Trophy, AlertCircle, RefreshCw, RotateCcw, Calculator, ArrowRight, BookOpen, Pencil, HelpCircle, Target, Zap as ZapIcon, Cpu, Binary, Sigma, Microscope, BrainCircuit, ListChecks } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function DivisorPropertiesLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(1); // 1: Select Property, 2: Prop 1 Lab, 3: Prop 2 Lab
    const [inputs, setInputs] = useState({ a: 35, b: 15, n: 5 });
    const [prop2Inputs, setProp2Inputs] = useState({ a: 56, b: 21, n: 7 });
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [showHint, setShowHint] = useState(false);

    const resetLab = () => {
        setStep(1);
        setFeedback(null);
        setShowHint(false);
    };

    const learnContent = [
        {
            title: 'المجموع والفرق',
            math: 'n | a \u2227 n | b \u2192 n | (a\u00b1b)',
            detail: 'إذا كان العدد n يقسم كلاً من a و b، فهو حتماً يقسم مجموعهما وفرقهما.',
            icon: <Sigma size={20} />
        },
        {
            title: 'باقي القسمة',
            math: 'n | a \u2227 n | b \u2192 n | r',
            detail: 'إذا كان n يقسم كلاً من a و b، فهو يقسم أيضاً باقي قسمة a على b.',
            icon: <Binary size={20} />
        }
    ];

    const handleProp1Verify = async () => {
        const { a, b, n } = inputs;
        if (a % n === 0 && b % n === 0) {
            setFeedback({
                type: 'success',
                text: `تحقق: n يقسم المجموع (${a+b}) والفرق (${Math.abs(a-b)}) بنجاح!`
            });
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            try {
                const data = await rewardService.claimLabReward('divisor-prop-1');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setFeedback({
                type: 'error',
                text: a % n !== 0 ? `${n} لا يقسم ${a}.` : `${n} لا يقسم ${b}.`
            });
        }
    };

    const handleProp2Verify = async () => {
        const { a, b, n } = prop2Inputs;
        const r = a % b;
        if (a % n === 0 && b % n === 0) {
            setFeedback({
                type: 'success',
                text: `تحقق: n يقسم باقي القسمة (r = ${r}) بنجاح!`
            });
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            try {
                const data = await rewardService.claimLabReward('divisor-prop-2');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setFeedback({
                type: 'error',
                text: a % n !== 0 ? `${n} لا يقسم ${a}.` : `${n} لا يقسم ${b}.`
            });
        }
    };

    const theme = {
        container: isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-100 shadow-2xl',
        textMain: isDarkMode ? 'text-white' : 'text-slate-900',
        textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
        card: isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-100 shadow-xl',
    };

    return (
        <div className={`w-full h-full min-h-[300px] max-h-[85vh] ${theme.container} rounded-[1rem] md:rounded-[1.5rem] p-4 md:p-6 relative overflow-hidden flex flex-col font-sans border transition-all duration-500`} dir="rtl">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-4 pt-4 md:pt-0">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-4 border backdrop-blur-md ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'}`}>
                                <ListChecks size={16} /> بروتوكول خصائص القواسم
                            </div>
                            <h2 className={`text-2xl md:text-xl lg:text-xl font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-white' : 'text-slate-900'}`}>مخبر القواعد الذهبية</h2>
                            <p className={`${theme.textSub} mt-4 text-sm md:text-lg font-medium max-w-2xl mx-auto italic`}>اختبر خواص الجمع، الفرق، والباقي لتفهم أسرار علاقات القواسم بين الأعداد.</p>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-4 border ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                <Microscope size={16} /> معمل التحليل: {step === 1 ? 'اختيار المسار' : step === 2 ? 'المجموع والفرق' : 'باقي القسمة'}
                            </div>
                            <h2 className={`text-xl md:text-2xl font-black tracking-tighter leading-none px-4 ${theme.textMain}`}>
                                {phase === 'learn' ? 'النماذج الرياضية للخواص' : 'تحقق من صحة القواعد الآن'}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full px-4">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl px-4">
                        <div className={`group relative p-4 md:p-6 rounded-[1.5rem] text-right transition-all border backdrop-blur-3xl overflow-hidden ${theme.card}`}>
                             <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-3 shadow-glow transition-transform group-hover:rotate-12"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>موسوعة الخواص</h3>
                             <p className={`${theme.textSub} text-lg mb-4 font-medium`}>تعلم القواعد الأساسية التي تربط قواسم الأعداد ببعضها البعض نظرياً.</p>
                             <button onClick={() => setPhase('learn')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black transition-all">فتح الموسوعة</button>
                        </div>
                        <motion.button onClick={() => setPhase('practice')} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem]">
                            <div className={`absolute inset-0 transition-transform duration-500 group-hover:scale-110 ${isDarkMode ? 'bg-gradient-to-br from-emerald-600 to-teal-900' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`} />
                            <div className="relative p-5 md:p-16 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Microscope size={20} className="md:w-24 md:h-24 animate-pulse" />
                                <span className="text-base md:text-lg font-black tracking-tighter">دخول المخبر</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-4xl">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-8 md:p-16 rounded-[1.5rem] md:rounded-[1.5rem] border-2 shadow-3xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="flex flex-col items-center text-center">
                                 <div className={`w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3`}>{learnContent[learnStep].icon}</div>
                                 <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnContent[learnStep].title}</h3>
                                 <p className={`text-lg md:text-2xl ${theme.textSub} mb-12 max-w-2xl font-medium leading-relaxed`}>{learnContent[learnStep].detail}</p>
                                 <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 border-emerald-500/30 bg-slate-950/50 mb-3 w-full`}>
                                     <span className="text-xl md:text-xl font-mono font-black text-emerald-400" dir="ltr">{learnContent[learnStep].math}</span>
                                 </div>
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-12 px-8">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-2xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                             {learnStep < 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-glow transition-all flex items-center gap-2">التالي <ArrowRight size={20} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-glow transition-all flex items-center gap-2">التجربة العملية <Microscope size={20} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="w-full max-w-5xl">
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.button whileHover={{ scale: 1.05 }} onClick={() => setStep(2)} className={`p-5 rounded-[1.5rem] border-2 text-right transition-all backdrop-blur-3xl group ${theme.card} hover:border-emerald-500`}>
                                     <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Sigma size={20} /></div>
                                     <h3 className={`text-2xl font-black mb-4 ${theme.textMain}`}>مخبر المجموع والفرق</h3>
                                     <p className={`${theme.textSub} mb-3`}>تحقق كيف ينتقل القاسم n ليقسم المجموع والفرق آلياً.</p>
                                     <div className="text-emerald-500 font-black flex items-center gap-2">دخول <ArrowRight size={20} /></div>
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} onClick={() => setStep(3)} className={`p-5 rounded-[1.5rem] border-2 text-right transition-all backdrop-blur-3xl group ${theme.card} hover:border-emerald-500`}>
                                     <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Binary size={20} /></div>
                                     <h3 className={`text-2xl font-black mb-4 ${theme.textMain}`}>مخبر باقي القسمة</h3>
                                     <p className={`${theme.textSub} mb-3`}>تحقق كيف يظل n قاسماً لباقي القسمة r دائماً.</p>
                                     <div className="text-emerald-500 font-black flex items-center gap-2">دخول <ArrowRight size={20} /></div>
                                </motion.button>
                            </div>
                        )}

                        {(step === 2 || step === 3) && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-3xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                                 <div className="flex justify-between items-center mb-3">
                                     <div className="flex items-center gap-4">
                                         <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">{step === 2 ? <Sigma /> : <Binary />}</div>
                                         <h3 className={`text-base md:text-lg font-black ${theme.textMain}`}>{step === 2 ? 'مخبر المجموع والفرق' : 'مخبر باقي القسمة'}</h3>
                                     </div>
                                     <button onClick={resetLab} className="p-4 bg-slate-800 text-slate-400 rounded-2xl hover:text-white transition-colors"><RotateCcw size={20} /></button>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 bg-slate-950/50 p-8 rounded-3xl border-2 border-dashed border-white/5" dir="ltr">
                                     <div className="space-y-3">
                                         <label className="text-emerald-500/60 font-black text-xs uppercase tracking-widest block">Value a</label>
                                         <input type="number" value={step === 2 ? inputs.a : prop2Inputs.a} onChange={(e) => step === 2 ? setInputs({...inputs, a: parseInt(e.target.value)}) : setProp2Inputs({...prop2Inputs, a: parseInt(e.target.value)})} className="w-full bg-slate-900 border-2 border-emerald-500/20 rounded-2xl p-4 text-center text-xl font-black text-white outline-none focus:border-emerald-500 transition-all" />
                                     </div>
                                     <div className="space-y-3">
                                         <label className="text-emerald-500/60 font-black text-xs uppercase tracking-widest block">Value b</label>
                                         <input type="number" value={step === 2 ? inputs.b : prop2Inputs.b} onChange={(e) => step === 2 ? setInputs({...inputs, b: parseInt(e.target.value)}) : setProp2Inputs({...prop2Inputs, b: parseInt(e.target.value)})} className="w-full bg-slate-900 border-2 border-emerald-500/20 rounded-2xl p-4 text-center text-xl font-black text-white outline-none focus:border-emerald-500 transition-all" />
                                     </div>
                                     <div className="space-y-3">
                                         <label className="text-emerald-500/60 font-black text-xs uppercase tracking-widest block">Divisor n</label>
                                         <input type="number" value={step === 2 ? inputs.n : prop2Inputs.n} onChange={(e) => step === 2 ? setInputs({...inputs, n: parseInt(e.target.value)}) : setProp2Inputs({...prop2Inputs, n: parseInt(e.target.value)})} className="w-full bg-slate-900 border-2 border-emerald-500/20 rounded-2xl p-4 text-center text-xl font-black text-white outline-none focus:border-emerald-500 transition-all" />
                                     </div>
                                 </div>

                                 <button onClick={step === 2 ? handleProp1Verify : handleProp2Verify} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black text-2xl shadow-glow transition-all active:scale-95 mb-4 flex items-center justify-center gap-3"><ZapIcon size={20} /> معالجة البيانات والتحقق</button>

                                 <AnimatePresence mode="wait">
                                     {feedback && (
                                         <motion.div key={feedback.text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`p-8 rounded-[1.5rem] border-2 flex items-start gap-3 ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                                             <div className="p-4 bg-white/5 rounded-2xl">{feedback.type === 'success' ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}</div>
                                             <div>
                                                 <h4 className="text-2xl font-black mb-2">{feedback.type === 'success' ? 'الخاصية محققة ✓' : 'تنبيه بالنظام ✗'}</h4>
                                                 <p className="text-lg font-medium leading-relaxed opacity-80">{feedback.text}</p>
                                             </div>
                                         </motion.div>
                                     )}
                                 </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {reward && <MasteryRewardCard reward={reward} />}

            {phase !== 'intro' && (
                <div className="absolute bottom-10 right-10 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-[1rem] font-black text-sm flex items-center gap-3 backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-xl'}`}>
                        <RotateCcw size={20} className="text-emerald-500" /> <span>غرفة التحكم</span>
                    </button>
                </div>
            )}
        </div>
    );
}

const ShieldCheck = ({ size, className }) => <Check size={size} className={className} />;
const ShieldAlert = ({ size, className }) => <AlertCircle size={size} className={className} />;
