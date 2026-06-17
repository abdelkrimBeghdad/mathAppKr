import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import clsx from 'clsx';

export default function FunctionGrapher({ onClose }) {
    const [a, setA] = useState(1);
    const [b, setB] = useState(0);
    const [type, setType] = useState('linear'); // linear: ax, affine: ax + b
    const [data, setData] = useState([]);

    useEffect(() => {
        const newData = [];
        for (let x = -10; x <= 10; x++) {
            const y = type === 'linear' ? a * x : a * x + b;
            newData.push({ x, y: parseFloat(y.toFixed(2)) });
        }
        setData(newData);
    }, [a, b, type]);

    const equation = type === 'linear'
        ? `f(x) = ${a}x`
        : `f(x) = ${a}x ${b >= 0 ? '+' : ''} ${b}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
            <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative border border-slate-100">

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-lg hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                    <X size={24} />
                </button>

                <div className="flex-1 p-8 md:p-12 bg-slate-50 min-h-[400px]">
                    <div className="mb-8">
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">التمثيل البياني</div>
                        <h2 className="text-3xl font-black text-slate-800 bg-white inline-block px-6 py-2 rounded-2xl shadow-sm border border-slate-100" dir="ltr">
                            {equation}
                        </h2>
                    </div>

                    <div className="h-[400px] w-full bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="x"
                                    type="number"
                                    domain={[-10, 10]}
                                    tickCount={21}
                                    stroke="#94a3b8"
                                    fontSize={10}
                                />
                                <YAxis
                                    type="number"
                                    domain={[-20, 20]}
                                    stroke="#94a3b8"
                                    fontSize={10}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    labelClassName="font-bold text-slate-800"
                                />
                                <ReferenceLine x={0} stroke="#475569" strokeWidth={2} />
                                <ReferenceLine y={0} stroke="#475569" strokeWidth={2} />
                                <Line
                                    type="monotone"
                                    dataKey="y"
                                    stroke="#0ea5e9"
                                    strokeWidth={4}
                                    dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                    animationDuration={500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="w-full md:w-80 p-8 border-l border-slate-100 flex flex-col gap-8 bg-white overflow-y-auto">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">راسم الدوال 📈</h2>
                        <p className="text-sm text-slate-500 font-medium">تحكم في المعاملات وراقب التغيرات.</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                        <button
                            onClick={() => setType('linear')}
                            className={clsx(
                                "flex-1 py-3 rounded-xl text-xs font-black transition-all",
                                type === 'linear' ? "bg-white text-sky-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            خطية (ax)
                        </button>
                        <button
                            onClick={() => setType('affine')}
                            className={clsx(
                                "flex-1 py-3 rounded-xl text-xs font-black transition-all",
                                type === 'affine' ? "bg-white text-sky-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            تآلفية (ax+b)
                        </button>
                    </div>

                    <div className="space-y-8">
                        <ControlRange
                            label="المعامل a"
                            value={a}
                            min={-5}
                            max={5}
                            step={0.5}
                            onChange={(v) => setA(parseFloat(v))}
                            color="accent-sky-500"
                        />
                        {type === 'affine' && (
                            <ControlRange
                                label="الثابت b"
                                value={b}
                                min={-10}
                                max={10}
                                step={1}
                                onChange={(v) => setB(parseFloat(v))}
                                color="accent-indigo-500"
                            />
                        )}
                    </div>

                    <div className="mt-auto p-5 bg-sky-50 rounded-3xl border-2 border-sky-100 flex items-start gap-4">
                        <Info className="text-sky-500 shrink-0" size={20} />
                        <ul className="text-[11px] text-sky-700 font-bold leading-relaxed list-disc pr-4">
                            <li>المعامل a يحدد ميل المستقيم.</li>
                            <li>الثابت b يحدد نقطة التقاطع مع محور التراتيب.</li>
                            <li>الدالة الخطية تمر دائماً من المبدأ (0,0).</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ControlRange({ label, value, min, max, step, onChange, color }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 tracking-wider uppercase">{label}</span>
                <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-sm font-black text-slate-700 shadow-sm">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={clsx("w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer", color)}
            />
        </div>
    );
}
