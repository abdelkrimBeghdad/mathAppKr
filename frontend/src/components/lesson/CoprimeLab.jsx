import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, HelpCircle, BookOpen, Check, X, Target, RotateCcw, Zap as ZapIcon, Cpu, Binary, Search, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';

function gcd(x, y) {
    let a = Math.abs(x);
    let b = Math.abs(y);
    while (b) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function CoprimeContent({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [numA, setNumA] = useState('');
    const [numB, setNumB] = useState('');
    const [customResult, setCustomResult] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [currentChallenge, setCurrentChallenge] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const challengeList = [
        { a: 25, b: 27, coprime: true },
        { a: 12, b: 18, coprime: false },
        { a: 14, b: 15, coprime: true },
        { a: 8, b: 20, coprime: false },
        { a: 17, b: 31, coprime: true },
    ];

    const learnContent = [
        {
            title: 'بروتوكول التعريف',
            math: 'PGCD(a, b) = 1',
            detail: 'نقول أن العددين أوليان فيما بينهما إذا كان قاسمهما المشترك الأكبر هو الواحد فقط.',
            icon: <ShieldCheck size={20} />
        },
        {
            title: 'اختبار الترابط',
            math: '25 ↔ 27',
            detail: 'قواسم 25: {1, 5, 25}. قواسم 27: {1, 3, 9, 27}. المشترك الوحيد هو {1}.',
            icon: <Binary size={20} />
        }
    ];

    const handleCustomCheck = () => {
        const a = parseInt(numA), b = parseInt(numB);
        if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return;
        const g = gcd(a, b);
        setCustomResult({ a, b, pgcd: g, coprime: g === 1 });
        if (g === 1) confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    };

    const handleChallengeAnswer = async (answer) => {
        const ch = challengeList[currentChallenge];
        const correct = answer === ch.coprime;
        const g = gcd(ch.a, ch.b);

        const newChallenges = [...challenges, { ...ch, userAnswer: answer, correct, pgcd: g }];
        setChallenges(newChallenges);
        setShowHint(false);

        if (correct) {
            confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
        }

        if (currentChallenge < challengeList.length - 1) {
            setCurrentChallenge(currentChallenge + 1);
        } else {
            const finalScore = newChallenges.filter(c => c.correct).length;
            if (finalScore >= 4) {
                try {
                    const data = await rewardService.claimLabReward('coprime-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        }
    };

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('الأعداد الأولية فيما بينهما');
        } else if (phase === 'learn') {
            setLabTitle(learnContent[learnStep].title);
        } else if (reward) {
            setLabTitle('اكتمال مهمة الأوليات');
        } else {
            setLabTitle('هل العددان أوليان فيما بينهما؟');
        }
    }, [phase, learnStep, reward, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 px-4 min-h-0 flex-grow" dir="rtl">
            {phase === 'intro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
                    <div className={`p-5 md:p-6 rounded-[1.5rem] text-right transition-all border backdrop-blur-3xl overflow-hidden shadow-xl ${theme.card}`}>
                         <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md"><BookOpen size={20} /></div>
                         <h3 className={`text-base md:text-lg font-black mb-2 tracking-tighter ${theme.textMain}`}>موسوعة التعريفات</h3>
                         <p className={`${theme.textSub} text-xs md:text-sm mb-4 font-medium`}>تعلم القاعدة الذهبية والفرق بين العدد الأولي والعددان الأوليان فيما بينهما.</p>
                         <button onClick={() => setPhase('learn')} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-all shadow-md">فتح الموسوعة</button>
                    </div>
                    <motion.button onClick={() => { setPhase('practice'); setCurrentChallenge(0); setChallenges([]); }} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-xl">
                        <div className={`absolute inset-0 transition-transform duration-500 group-hover:scale-110 ${isDarkMode ? 'bg-gradient-to-br from-purple-600 to-indigo-900' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`} />
                        <div className="relative p-6 md:p-12 flex flex-col items-center justify-center text-center gap-3 text-white">
                            <ZapIcon size={32} className="animate-pulse" />
                            <span className="text-base md:text-lg font-black tracking-tighter">ميدان التحدي</span>
                        </div>
                    </motion.button>
                </div>
            )}

            {phase === 'learn' && (
                <div className="w-full max-w-3xl">
                    <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-6 md:p-8 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                         <div className="flex flex-col items-center text-center">
                             <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 shadow-inner">{learnContent[learnStep].icon}</div>
                             <h3 className={`text-base md:text-lg font-black mb-2 ${theme.textMain}`}>{learnContent[learnStep].title}</h3>
                             <p className={`text-xs md:text-sm ${theme.textSub} mb-4 max-w-2xl font-medium leading-relaxed`}>{learnContent[learnStep].detail}</p>
                             <div className={`p-4 rounded-[1rem] border bg-black/10 border-white/5 w-full`}>
                                 <span className="text-sm md:text-base font-mono font-black text-purple-400" dir="ltr">{learnContent[learnStep].math}</span>
                             </div>
                         </div>
                    </motion.div>
                    <div className="flex justify-between items-center mt-4 px-4">
                         <button onClick={() => learnStep > 0 ? setLearnStep(0) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-bold transition-all border ${isDarkMode ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}>السابق</button>
                         {learnStep < 1 ? (
                             <button onClick={() => setLearnStep(1)} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-all shadow-md text-xs md:text-sm">التالي</button>
                         ) : (
                             <button onClick={() => setPhase('practice')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-md text-xs md:text-sm flex items-center gap-1.5">تحدي الآن <ZapIcon size={14} /></button>
                         )}
                    </div>
                </div>
            )}

            {phase === 'practice' && !reward && (
                <div className="w-full max-w-3xl">
                    <div className={`p-6 md:p-8 rounded-[1.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden transition-all duration-700 ${theme.card}`}>
                         <div className="flex justify-between items-center mb-6">
                             <div className="flex gap-1.5">
                                 {challengeList.map((_, i) => (
                                     <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < challenges.length ? (challenges[i].correct ? 'bg-emerald-500' : 'bg-rose-500') : i === currentChallenge ? 'bg-purple-500 animate-pulse' : 'bg-slate-800'}`} />
                                 ))}
                             </div>
                             <div className="text-purple-500 font-black tracking-widest text-xs uppercase italic">المرحلة {currentChallenge + 1}</div>
                         </div>

                         <div className="text-center space-y-6">
                              <motion.div 
                                  key={currentChallenge}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  className={`text-4xl md:text-6xl font-black font-mono flex items-center justify-center gap-3 select-none ${theme.textMain}`} 
                                  dir="ltr"
                              >
                                  <span className="text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">{challengeList[currentChallenge].a}</span>
                                  <Search className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} size={24} />
                                  <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">{challengeList[currentChallenge].b}</span>
                              </motion.div>

                              <div className="flex flex-wrap gap-3 justify-center">
                                  <motion.button 
                                      whileHover={{ scale: 1.05 }} 
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleChallengeAnswer(true)} 
                                      className="px-6 md:px-8 py-2 md:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-base md:text-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                      <Check size={18} /> نعم (أوليان)
                                  </motion.button>
                                  
                                  <motion.button 
                                      whileHover={{ scale: 1.05 }} 
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleChallengeAnswer(false)} 
                                      className="px-6 md:px-8 py-2 md:py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-base md:text-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                      <X size={18} /> لا (غير ذلك)
                                  </motion.button>
                              </div>

                              <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-1.5 text-amber-500 font-bold text-xs md:text-sm mx-auto opacity-70 hover:opacity-100 transition-opacity">
                                  <HelpCircle size={16} /> أحتاج مساعدة
                              </button>
                              <AnimatePresence>
                                  {showHint && (
                                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-4 border-2 rounded-2xl ${isDarkMode ? 'bg-slate-950 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                                          <p className="text-amber-600 font-mono font-black text-xs md:text-sm" dir="ltr">PGCD({challengeList[currentChallenge].a}, {challengeList[currentChallenge].b}) = {gcd(challengeList[currentChallenge].a, challengeList[currentChallenge].b)}</p>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                         </div>
                    </div>
                </div>
            )}

            {reward && (
                <div className="w-full max-w-3xl z-20 text-center px-4">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`border-4 rounded-[1.5rem] p-8 md:p-10 shadow-xl mb-4 backdrop-blur-3xl relative overflow-hidden ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/40 text-white' : 'bg-white border-emerald-500 shadow-2xl text-slate-900'}`}>
                         <ShieldCheck size={36} className="mx-auto text-emerald-500 mb-2" />
                         <h3 className={`text-xl md:text-4xl font-black mb-2 tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>مُحقق الأوليات</h3>
                         <p className="text-xs md:text-sm text-emerald-500 font-bold mb-3 italic">لقد أثبتت براعتك في تمييز الأعداد ومعرفة ترابطها الجوهري.</p>
                         <div className={`inline-block px-8 py-1.5 rounded-xl border text-base md:text-lg font-black ${isDarkMode ? 'bg-emerald-500/20 border-emerald-500/30 text-white' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>{challenges.filter(c => c.correct).length} / {challengeList.length}</div>
                    </motion.div>
                    <MasteryRewardCard reward={reward} />
                </div>
            )}

            {/* Free Exploration Tool */}
            {phase !== 'intro' && !reward && (
                <div className={`mt-6 w-full max-w-3xl p-4 md:p-5 rounded-[1.5rem] border backdrop-blur-xl transition-all shadow-lg ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex flex-wrap gap-3 items-center justify-center">
                        <input type="number" value={numA} onChange={(e) => setNumA(e.target.value)} placeholder="العدد a" className={`flex-1 min-w-[100px] border-2 rounded-xl p-2.5 text-center text-lg font-black outline-none ${isDarkMode ? 'bg-slate-950/50 border-white/10 text-white focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-500'}`} />
                        <input type="number" value={numB} onChange={(e) => setNumB(e.target.value)} placeholder="العدد b" className={`flex-1 min-w-[100px] border-2 rounded-xl p-2.5 text-center text-lg font-black outline-none ${isDarkMode ? 'bg-slate-950/50 border-white/10 text-white focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-500'}`} />
                        <button onClick={handleCustomCheck} className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-md transition-all"><Send size={18} /></button>
                    </div>
                    {customResult && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mt-4 p-4 rounded-xl border-2 text-center font-black text-sm md:text-base ${customResult.coprime ? (isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700') : (isDarkMode ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700')}`}>
                            {customResult.coprime ? `PGCD(${customResult.a}, ${customResult.b}) = 1 → أوليان فيما بينهما ✓` : `PGCD(${customResult.a}, ${customResult.b}) = ${customResult.pgcd} → ليسا أوليين فيما بينهما ✗`}
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function CoprimeLab() {
    const [labTitle, setLabTitle] = useState('الأعداد الأولية فيما بينهما');
    const [labPhase, setLabPhase] = useState('intro');
    const [contentKey, setContentKey] = useState(0);

    return (
        <LabShell 
            labId="coprime" 
            accentColor="violet"
            badgeText="بروتوكول التمييز العددي"
            badgeIcon={ShieldCheck}
            title={labTitle}
            phase={labPhase}
            onBack={() => {
                setLabPhase('intro');
                setContentKey(prev => prev + 1); // Reset content state
            }}
        >
            <CoprimeContent key={contentKey} setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
