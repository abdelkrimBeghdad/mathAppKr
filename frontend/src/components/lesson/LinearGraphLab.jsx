import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, MousePointer2, TrendingUp, Crosshair, LassoSelect, Target, Pencil, BookOpen, Sigma, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function LinearGraphContent({ setLabTitle, setLabPhase }) {
    const { theme, isDarkMode } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [a, setA] = useState(2);
    const [pointPos, setPointPos] = useState({ x: 0, y: 0 }); // Current point position on grid
    const [step, setStep] = useState(0); // 0: plotting, 1: reward
    const [error, setError] = useState(false);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        labProgressService.getOne('linear-graph')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'بروتوكول نقطة الأصل',
            detail: 'كل دالة خطية f(x)=ax تمر حتماً بمركز المعلم (0,0)؛ فهي نقطة الانطلاق الثابتة دوماً.',
            math: 'f(0) = a × 0 = 0',
            icon: <Target size={20} />
        },
        {
            title: 'خوارزمية الإسقاط الثنائي',
            detail: 'لرسم المستقيم، نحتاج لنقطة ثانية فقط. اختر x عشوائياً (مثلاً x=1) واحسب f(1)=a.',
            math: 'Point: (1, a)',
            icon: <LassoSelect size={20} />
        }
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('linear', difficultyLevel);
        const maxCoeff = params.maxCoeff || 4;

        const newA = (Math.floor(Math.random() * maxCoeff) + 1) * (Math.random() > 0.5 ? 1 : -1);
        if (Math.random() > 0.5) {
            setA(newA);
        } else {
            setA(newA / 2);
        }

        setPointPos({ x: 0, y: 0 });
        setPhase('practice');
        setStep(0);
        setError(false);
        setIsCompleted(false);

        labProgressService.update('linear-graph', 'practice').catch(console.error);
    };

    const handleGridClick = (e) => {
        if (isCompleted) return;
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;
        
        const gridX = Math.round((rawX - 250) / 45);
        const gridY = Math.round((250 - rawY) / 45);
        
        const clampedX = Math.max(-5, Math.min(5, gridX));
        const clampedY = Math.max(-5, Math.min(5, gridY));
        
        setPointPos({ x: clampedX, y: clampedY });
    };

    const handleCheck = async () => {
        if (pointPos.x !== 0 && (Math.abs(pointPos.y / pointPos.x - a) < 0.1)) {
            setStep(1);
            setIsCompleted(true);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                await labProgressService.update('linear-graph', 'completed', 100);
            } catch (err) { console.error(err); }
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    const size = 500;
    const center = size / 2;
    const stepSize = 45;

    useEffect(() => {
        setLabPhase(phase);
        if (phase === 'intro') {
            setLabTitle('رسم الدوال الخطية');
        } else if (isCompleted) {
            setLabTitle('مسار هندسي دقيق!');
        } else {
            setLabTitle(`تمثيل f(x) = ${a}x`);
        }
    }, [phase, isCompleted, a, setLabTitle, setLabPhase]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 w-full overflow-hidden px-4" dir="rtl">
            {phase === 'intro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                    <div className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-3xl transition-all shadow-2xl ${theme.card}`}>
                         <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-sky-600 rounded-[1rem] flex items-center justify-center text-white mb-3 shadow-xl"><BookOpen size={20} /></div>
                         <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>دليل المهندس:</h3>
                         <div className="space-y-4">
                             {learnPages.map((p, i) => (
                                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all">
                                     <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-lg shadow-inner">{i + 1}</div>
                                     <div>
                                        <h4 className="text-white font-bold text-lg">{p.title}</h4>
                                        <p className="text-white/40 text-sm italic">{p.detail}</p>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>
                    <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-sky-600 to-indigo-900 transition-transform duration-500 group-hover:scale-110`} />
                        <div className="relative p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 text-white">
                            <Pencil size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                            <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest leading-tight">بدء الإسقاط</span>
                        </div>
                    </motion.button>
                </div>
            )}

            {phase === 'practice' && (
                <div className="flex flex-col md:flex-row items-center justify-center gap-5 w-full max-w-7xl px-4">
                    <div className={`relative p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl overflow-visible shrink-0 ${theme.card}`}>
                        <div className="absolute top-0 right-0 p-4 font-black text-indigo-400 text-2xl font-mono" dir="ltr">f(x) = {a}x</div>
                        <svg width="450" height="450" viewBox="0 0 500 500" className="cursor-crosshair overflow-visible" onClick={handleGridClick}>
                            {Array.from({ length: 11 }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <line x1={i * stepSize + (center % stepSize)} y1="0" x2={i * stepSize + (center % stepSize)} y2={size} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                    <line x1="0" y1={i * stepSize + (center % stepSize)} x2={size} y2={i * stepSize + (center % stepSize)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                </React.Fragment>
                            ))}
                            <line x1="0" y1={center} x2={size} y2={center} stroke="rgba(99,102,241,0.4)" strokeWidth="3" />
                            <line x1={center} y1="0" x2={center} y2={size} stroke="rgba(99,102,241,0.4)" strokeWidth="3" />
                            {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map(v => (
                                <React.Fragment key={v}>
                                    <line x1={center + v * stepSize} y1={center - 4} x2={center + v * stepSize} y2={center + 4} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                                    <line x1={center - 4} y1={center - v * stepSize} x2={center + 4} y2={center - v * stepSize} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                                </React.Fragment>
                            ))}
                            <circle cx={center} cy={center} r="12" fill="#6366f1" className="drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            {(isCompleted || pointPos.x !== 0) && (
                                <motion.line 
                                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5 }}
                                    x1={center - 5.5 * stepSize} y1={center + 5.5 * a * stepSize} x2={center + 5.5 * stepSize} y2={center - 5.5 * a * stepSize} 
                                    stroke={isCompleted ? "#10b981" : "#6366f1"} strokeWidth="6" strokeLinecap="round" strokeDasharray={isCompleted ? "0" : "15 10"}
                                    className="drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                />
                            )}
                            <motion.g animate={{ x: center + pointPos.x * stepSize, y: center - pointPos.y * stepSize }}>
                                <circle r="18" fill={isCompleted ? "#10b981" : error ? "#ef4444" : "white"} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
                                <text y="35" textAnchor="middle" fill="white" className="font-black text-sm">({pointPos.x}, {pointPos.y})</text>
                            </motion.g>
                        </svg>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-md">
                        <div className={`p-8 md:p-5 rounded-[1.5rem] border-2 shadow-2xl text-center backdrop-blur-3xl ${theme.card}`}>
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-slate-500 uppercase font-black mb-2 italic">Axis X</span>
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl border-2 border-indigo-500/30 flex items-center justify-center text-xl font-black text-white font-mono shadow-inner">{pointPos.x}</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-slate-500 uppercase font-black mb-2 italic">Axis Y</span>
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl border-2 border-indigo-500/30 flex items-center justify-center text-xl font-black text-white font-mono shadow-inner">{pointPos.y}</div>
                                </div>
                            </div>
                            
                            {!isCompleted ? (
                                <button onClick={handleCheck} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-[1rem] font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4">
                                    <CheckCircle2 size={20} /> تأكيد الرسم
                                </button>
                            ) : (
                                <button onClick={generateProblem} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-[1rem] font-black text-2xl shadow-xl transition-all active:scale-95">تحدي إسقاط جديد</button>
                            )}
                        </div>
                        
                        <div className="p-6 bg-indigo-500/10 rounded-[1rem] border-2 border-indigo-500/20 text-indigo-300 text-lg font-medium leading-relaxed flex items-center gap-4 italic shadow-inner">
                            <MousePointer2 size={40} className="text-indigo-400 shrink-0" />
                            <span>تلميح: حدد النقطة المرجعية (1, {a}) لتمرير المستقيم بدقة.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function LinearGraphLab() {
    const [labTitle, setLabTitle] = useState('رسم الدوال الخطية');
    const [labPhase, setLabPhase] = useState('intro');

    return (
        <LabShell 
            labId="linear-graph" 
            accentColor="indigo"
            badgeText="رادار الإسقاط"
            badgeIcon={Crosshair}
            title={labTitle}
            phase={labPhase}
        >
            <LinearGraphContent setLabTitle={setLabTitle} setLabPhase={setLabPhase} />
        </LabShell>
    );
}
