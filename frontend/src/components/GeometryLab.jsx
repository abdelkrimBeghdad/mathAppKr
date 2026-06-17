import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Move, MousePointer2, RefreshCw, Triangle, Layers, Ruler, CheckCircle2, Lightbulb, Award, ArrowRight, BookOpen, Target } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function GeometryLab({ onClose }) {
    const [activeTab, setActiveTab] = useState('thales'); // 'thales', 'pythagoras', 'trig'
    const [exerciseMode, setExerciseMode] = useState(false);
    const containerRef = useRef(null);

    // --- Common Scale & Origin ---
    const origin = { x: 60, y: 220 };
    const viewWidth = 500;
    const viewHeight = 300;

    // --- Thales State ---
    const [a1, setA1] = useState(100);
    const [b1, setB1] = useState(200);
    const [a2, setA2] = useState(120);
    const angle = -Math.PI / 6;
    const A1 = { x: origin.x + a1, y: origin.y };
    const B1 = { x: origin.x + b1, y: origin.y };
    const A2 = { x: origin.x + a2 * Math.cos(angle), y: origin.y + a2 * Math.sin(angle) };
    const b2_actual = a1 !== 0 ? (b1 * a2) / a1 : 0;
    const B2 = { x: origin.x + b2_actual * Math.cos(angle), y: origin.y + b2_actual * Math.sin(angle) };

    // --- Pythagoras State ---
    const [pWidth, setPWidth] = useState(120);
    const [pHeight, setPHeight] = useState(90);
    const pyO = { x: 80, y: 200 };
    const hyp_actual = Math.sqrt(pWidth ** 2 + pHeight ** 2);

    // --- Trigonometry State ---
    const [trigAngle, setTrigAngle] = useState(30);
    const [trigHyp, setTrigHyp] = useState(180);
    const rad = (trigAngle * Math.PI) / 180;
    const tOpp = trigHyp * Math.sin(rad);
    const tAdj = trigHyp * Math.cos(rad);

    // --- Exercise State ---
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const startExercise = () => {
        setExerciseMode(true);
        setIsCorrect(false);
        setUserInput('');
        setShowHint(false);

        if (activeTab === 'thales') {
            setCurrentQuestion({
                text: `إذا كان OA = ${a1}، و OB = ${b1}، و OA' = ${a2}. فما هو طول OB'؟`,
                target: b2_actual,
                hint: "استخدم علاقة طالس: OA / OB = OA' / OB'"
            });
        } else if (activeTab === 'pythagoras') {
            setCurrentQuestion({
                text: `في مثلث قائم طول ضلعيه القائمين a = ${pWidth} و b = ${pHeight}. احسب طول الوتر c.`,
                target: hyp_actual,
                hint: "استخدم مبرهنة فيثاغورس: c² = a² + b²"
            });
        }
    };

    const checkAnswer = () => {
        const val = parseFloat(userInput);
        if (Math.abs(val - currentQuestion.target) < 0.5) {
            setIsCorrect(true);
            toast.success('إجابة رائعة! لقد طبقت النظرية بنجاح.');
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            toast.error('الرقم غير دقيق، تأكد من الحسابات.');
            setShowHint(true);
        }
    };

    const exitExercise = () => {
        setExerciseMode(false);
        setCurrentQuestion(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-8 z-[110] bg-slate-50 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-slate-900 flex flex-col overflow-hidden font-cairo"
        >
            {/* Ultra Premium Header */}
            <div className="p-5 md:p-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
                <div className="flex items-center gap-4 z-10">
                    <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3">
                        <Triangle size={28} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            مختبر الهندسة التفاعلي
                            {exerciseMode && <span className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full animate-pulse">وضع التحدي</span>}
                        </h3>
                        <div className="flex items-center gap-2 text-indigo-300 text-sm font-bold opacity-80">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                            بيئة محاكاة وتطبيق بيداغوجي
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/50 z-10">
                    {[
                        { id: 'thales', label: 'نظرية طالس' },
                        { id: 'pythagoras', label: 'نظرية فيثاغورس' },
                        { id: 'trig', label: 'النسب المثلثية' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setExerciseMode(false); }}
                            className={clsx(
                                "px-8 py-3 rounded-xl text-sm font-black transition-all duration-300",
                                activeTab === tab.id ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <button onClick={onClose} className="p-3 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-2xl transition-all z-10 group">
                    <X size={32} className="group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Precision Controls Panel */}
                <div className="w-full lg:w-[400px] bg-white border-e border-slate-200 p-8 space-y-8 overflow-y-auto relative z-20">
                    <AnimatePresence mode="wait">
                        {!exerciseMode ? (
                            <motion.div
                                key="controls"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-2 text-slate-800 font-black text-lg">
                                    <Move size={20} className="text-indigo-500" />
                                    <span>التحكم الدقيق والمحاكاة</span>
                                </div>

                                {activeTab === 'thales' ? (
                                    <div className="space-y-6">
                                        <ControlItem label="موضع النقطة A" val={a1} set={setA1} min={40} max={140} color="indigo" />
                                        <ControlItem label="موضع النقطة B" val={b1} set={setB1} min={160} max={280} color="emerald" />
                                        <ControlItem label="موضع النقطة 'A" val={a2} set={setA2} min={40} max={140} color="violet" />
                                        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-5 shadow-2xl">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Target size={14} className="text-sky-400" /> النسب المحققة
                                            </h4>
                                            <div className="space-y-3">
                                                <RatioItem label="OA / OB" val={a1 / b1} color="indigo" />
                                                <RatioItem label="OA' / OB'" val={a2 / b2_actual} color="violet" />
                                                <div className="pt-2 border-t border-slate-700 text-center font-black text-emerald-400 text-lg">
                                                    {(a1 / b1).toFixed(3)} = {(a2 / b2_actual).toFixed(3)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : activeTab === 'pythagoras' ? (
                                    <div className="space-y-6">
                                        <ControlItem label="طول الضلع (a)" val={pWidth} set={setPWidth} min={60} max={220} color="sky" />
                                        <ControlItem label="طول الضلع (b)" val={pHeight} set={setPHeight} min={60} max={180} color="rose" />
                                        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-xl text-center">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">حساب الوتر</h4>
                                            <div className="text-5xl font-black text-emerald-400">{hyp_actual.toFixed(2)}</div>
                                            <div className="text-[10px] text-slate-500 font-mono opacity-80" dir="ltr">c = √({pWidth}² + {pHeight}²)</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <ControlItem label="الزاوية (θ)" val={trigAngle} set={setTrigAngle} min={10} max={80} color="indigo" />
                                        <ControlItem label="طول الوتر" val={trigHyp} set={setTrigHyp} min={100} max={250} color="emerald" />
                                        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-2xl">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">المخرجات المثلثية</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-sm font-bold p-3 bg-slate-800 rounded-2xl border border-white/5">
                                                    <span className="text-amber-400">Sin(θ)</span>
                                                    <span>{Math.sin(rad).toFixed(4)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm font-bold p-3 bg-slate-800 rounded-2xl border border-white/5">
                                                    <span className="text-sky-400">Cos(θ)</span>
                                                    <span>{Math.cos(rad).toFixed(4)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm font-bold p-3 bg-slate-800 rounded-2xl border border-white/5">
                                                    <span className="text-rose-400">Tan(θ)</span>
                                                    <span>{Math.tan(rad).toFixed(4)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab !== 'trig' && (
                                    <button
                                        onClick={startExercise}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 border-b-4 border-emerald-700 active:border-b-0"
                                    >
                                        <BookOpen size={24} />
                                        اختبر فهمك للنظرية
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="exercise"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/20 blur-[40px] rounded-full" />
                                    <h4 className="text-amber-400 font-black text-sm uppercase mb-3 flex items-center gap-2">
                                        <Lightbulb size={16} /> المهمة البيداغوجية
                                    </h4>
                                    <p className="font-bold text-lg leading-relaxed">{currentQuestion?.text}</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-400 pr-2">أدخل القيمة المحسوبة</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            disabled={isCorrect}
                                            className={clsx(
                                                "w-full bg-slate-50 border-2 rounded-[2rem] px-8 py-5 text-2xl font-black outline-none transition-all text-center",
                                                isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 focus:border-indigo-500"
                                            )}
                                            placeholder="ضع الناتج هنا"
                                        />
                                        {isCorrect && <CheckCircle2 className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={28} />}
                                    </div>
                                </div>

                                {showHint && !isCorrect && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-amber-50 border-2 border-amber-100 rounded-3xl flex gap-3 italic text-sm font-bold text-amber-700">
                                        <Lightbulb className="shrink-0 text-amber-500" size={18} />
                                        {currentQuestion?.hint}
                                    </motion.div>
                                )}

                                <div className="space-y-4">
                                    {!isCorrect ? (
                                        <button
                                            onClick={checkAnswer}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[2rem] font-black text-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            تأكيد الإجابة <ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />
                                        </button>
                                    ) : (
                                        <div className="p-6 bg-emerald-500 rounded-[2rem] text-white text-center shadow-xl shadow-emerald-500/20">
                                            <Award className="mx-auto mb-2" size={32} />
                                            <h5 className="text-xl font-black">أحسنت! الإجابة صحيحة</h5>
                                            <p className="text-xs font-bold opacity-80 mt-1">يمكنك العودة للمحاكاة أو تجربة قياسات أخرى.</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={exitExercise}
                                        className="w-full py-4 text-slate-500 font-black text-xs hover:text-slate-800 transition-colors"
                                    >
                                        إلغاء التحدي والعودة للمحاكاة
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Main Interactive Canvas */}
                <div className="flex-1 bg-white relative flex items-center justify-center p-4 lg:p-12 overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-[#f8fafc] opacity-50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                    <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-full relative z-10 drop-shadow-2xl overflow-visible">
                        {activeTab === 'thales' ? (
                            <g>
                                <line x1={origin.x} y1={origin.y} x2={440} y2={origin.y} stroke="#e2e8f0" strokeWidth="2" strokeDasharray="8 8" />
                                <line x1={origin.x} y1={origin.y} x2={440} y2={origin.y + 400 * Math.sin(angle)} stroke="#e2e8f0" strokeWidth="2" strokeDasharray="8 8" />
                                <motion.line x1={A1.x} y1={A1.y} x2={A2.x} y2={A2.y} stroke="#6366f1" strokeWidth="8" strokeLinecap="round" />
                                <motion.line x1={B1.x} y1={B1.y} x2={B2.x} y2={B2.y} stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                                <ParallelArrow x={(A1.x + A2.x) / 2} y={(A1.y + A2.y) / 2} angle={Math.atan2(A2.y - A1.y, A2.x - A1.x)} color="#6366f1" />
                                <ParallelArrow x={(B1.x + B2.x) / 2} y={(B1.y + B2.y) / 2} angle={Math.atan2(B2.y - B1.y, B2.x - B1.x)} color="#10b981" />
                                <Point x={origin.x} y={origin.y} label="O" color="#1e293b" />
                                <Point x={A1.x} y={A1.y} label="A" color="#6366f1" pos="bottom" />
                                <Point x={B1.x} y={B1.y} label="B" color="#10b981" pos="bottom" />
                                <Point x={A2.x} y={A2.y} label="A'" color="#8b5cf6" pos="top" />
                                <Point x={B2.x} y={B2.y} label="B'" color="#059669" pos="top" />
                            </g>
                        ) : activeTab === 'pythagoras' ? (
                            <g>
                                <path
                                    d={`M ${pyO.x} ${pyO.y} L ${pyO.x + pWidth} ${pyO.y} L ${pyO.x} ${pyO.y - pHeight} Z`}
                                    fill="rgba(99,102,241,0.05)" stroke="#6366f1" strokeWidth="8" strokeLinejoin="round"
                                />
                                <path d={`M ${pyO.x + 20} ${pyO.y} L ${pyO.x + 20} ${pyO.y - 20} L ${pyO.x} ${pyO.y - 20}`} fill="none" stroke="#1e293b" strokeWidth="3" />
                                <Point x={pyO.x} y={pyO.y} color="#1e293b" />
                                <Point x={pyO.x + pWidth} y={pyO.y} label="C" color="#0ea5e9" pos="right" />
                                <Point x={pyO.x} y={pyO.y - pHeight} label="A" color="#f43f5e" pos="top" />
                                <text x={pyO.x + pWidth / 2} y={pyO.y + 35} className="text-[18px] font-black fill-sky-600 text-center" textAnchor="middle">a = {pWidth}</text>
                                <text x={pyO.x - 40} y={pyO.y - pHeight / 2} className="text-[18px] font-black fill-rose-600" textAnchor="end">b = {pHeight}</text>
                                {isCorrect && activeTab === 'pythagoras' && (
                                    <motion.text
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        x={(pyO.x + pyO.x + pWidth) / 2 - 20} y={(pyO.y + pyO.y - pHeight) / 2 - 20}
                                        className="text-[20px] font-black fill-emerald-600"
                                        transform={`rotate(${-Math.atan2(pHeight, pWidth) * 180 / Math.PI}, ${(pyO.x + pyO.x + pWidth) / 2}, ${(pyO.y + pyO.y - pHeight) / 2})`}
                                    >
                                        c = {hyp_actual.toFixed(2)}
                                    </motion.text>
                                )}
                            </g>
                        ) : (
                            <g>
                                <motion.path
                                    d={`M ${origin.x} ${origin.y} L ${origin.x + tAdj} ${origin.y} L ${origin.x + tAdj} ${origin.y - tOpp} Z`}
                                    fill="rgba(99,102,241,0.05)" stroke="#6366f1" strokeWidth="6" strokeLinejoin="round"
                                />
                                <path
                                    d={`M ${origin.x + 40} ${origin.y} A 40 40 0 0 0 ${origin.x + 40 * Math.cos(-rad)} ${origin.y + 40 * Math.sin(-rad)}`}
                                    fill="none" stroke="#f59e0b" strokeWidth="4"
                                />
                                <text x={origin.x + 50} y={origin.y - 15} className="text-[16px] font-black fill-amber-600">{trigAngle}°</text>
                                <Point x={origin.x} y={origin.y} color="#1e293b" label="B" />
                                <Point x={origin.x + tAdj} y={origin.y} color="#1e293b" label="C" pos="bottom" />
                                <Point x={origin.x + tAdj} y={origin.y - tOpp} color="#1e293b" label="A" pos="top" />
                                <text x={origin.x + tAdj / 2} y={origin.y + 30} className="text-[14px] font-black fill-slate-400" textAnchor="middle">المجاور (Adj)</text>
                                <text x={origin.x + tAdj + 25} y={origin.y - tOpp / 2} className="text-[14px] font-black fill-slate-400" writingMode="vertical-rl">المقابل (Opp)</text>
                            </g>
                        )}
                    </svg>

                    {(isCorrect || !exerciseMode) && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-4 bg-white/90 backdrop-blur-xl rounded-[2rem] border-2 border-slate-100 shadow-2xl overflow-hidden group">
                            {isCorrect ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-black text-emerald-600">رائع! قمت بتطبيق النظرية بشكل صحيح على هذه القياسات</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping" />
                                    <span className="text-sm font-black text-slate-800 opacity-80">قم بتغيير الأطوال من لوحة التحكم، أو ابدأ التحدي</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function ControlItem({ label, val, set, min, max, color }) {
    const colorMap = {
        indigo: 'accent-indigo-500 text-indigo-600',
        emerald: 'accent-emerald-500 text-emerald-600',
        violet: 'accent-violet-500 text-violet-600',
        sky: 'accent-sky-500 text-sky-600',
        rose: 'accent-rose-500 text-rose-600',
    };
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
                <span className="text-xs font-black text-slate-500 uppercase">{label}</span>
                <span className={`text-lg font-black ${colorMap[color].split(' ')[1]}`}>{val.toFixed(1)}</span>
            </div>
            <input
                type="range" min={min} max={max} step="1"
                value={val}
                onChange={(e) => set(Number(e.target.value))}
                className={`w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer transition-all ${colorMap[color].split(' ')[0]}`}
            />
        </div>
    );
}

function RatioItem({ label, val, color }) {
    const colors = { indigo: 'bg-indigo-50 text-indigo-700', violet: 'bg-violet-50 text-violet-700' };
    return (
        <div className={`flex justify-between items-center p-4 ${colors[color]} rounded-2xl border border-white/20 hover:scale-[1.02] transition-transform shadow-inner`}>
            <span className="text-xs font-black opacity-80 tracking-widest">{label}</span>
            <span className="font-mono font-black text-lg">{val.toFixed(4)}</span>
        </div>
    );
}

function Point({ x, y, label, color, pos = 'center' }) {
    return (
        <g>
            <circle cx={x} cy={y} r="10" fill="white" stroke={color} strokeWidth="4" shadow="0 2px 4px rgba(0,0,0,0.1)" />
            <circle cx={x} cy={y} r="4" fill={color} />
            {label && (
                <text
                    x={x + (pos === 'right' ? 20 : pos === 'left' ? -20 : 0)}
                    y={y + (pos === 'bottom' ? 30 : pos === 'top' ? -20 : 5)}
                    textAnchor={pos === 'right' ? 'start' : pos === 'left' ? 'end' : 'middle'}
                    className="text-[20px] font-black select-none pointer-events-none"
                    fill={color}
                >
                    {label}
                </text>
            )}
        </g>
    );
}

function ParallelArrow({ x, y, angle, color }) {
    return (
        <g transform={`translate(${x},${y}) rotate(${angle * 180 / Math.PI})`}>
            <path d="M -7 -8 L 3 0 L -7 8" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 3 -8 L 13 0 L 3 8" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    );
}
