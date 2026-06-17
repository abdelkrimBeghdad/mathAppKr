import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart2, PieChart as PieIcon, Plus, Trash2, Calculator, Info, TrendingUp, Target, Zap as ZapIcon, Cpu, Binary, Sigma, Search, Layers, BrainCircuit, RotateCcw, ShieldCheck, Database, LineChart } from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import clsx from 'clsx';

const COLORS = ['#f59e0b', '#fbbf24', '#d97706', '#b45309', '#fcd34d', '#78350f'];

export default function StatisticsGrapher({ onClose, isDarkMode = true }) {
    const [rows, setRows] = useState([
        { id: 1, value: 10, frequency: 5 },
        { id: 2, value: 12, frequency: 8 },
        { id: 3, value: 15, frequency: 3 },
    ]);
    const [chartType, setChartType] = useState('bar');

    const stats = useMemo(() => {
        let totalFreq = 0;
        let sumValueFreq = 0;
        const flatData = [];

        rows.forEach(r => {
            const val = parseFloat(r.value) || 0;
            const freq = parseFloat(r.frequency) || 0;
            totalFreq += freq;
            sumValueFreq += (val * freq);
            for (let i = 0; i < freq; i++) flatData.push(val);
        });

        flatData.sort((a, b) => a - b);
        const mean = totalFreq > 0 ? sumValueFreq / totalFreq : 0;
        let median = 0;
        if (flatData.length > 0) {
            const mid = Math.floor(flatData.length / 2);
            median = flatData.length % 2 !== 0
                ? flatData[mid]
                : (flatData[mid - 1] + flatData[mid]) / 2;
        }
        const maxFreq = Math.max(...rows.map(r => r.frequency || 0));
        const modes = rows.filter(r => r.frequency === maxFreq && r.frequency > 0).map(r => r.value);
        const range = flatData.length > 0 ? flatData[flatData.length - 1] - flatData[0] : 0;

        return {
            mean: mean.toFixed(2),
            median: median.toFixed(2),
            mode: modes.length > 0 && modes.length < rows.length ? modes.join(', ') : 'لا يوجد',
            totalFreq,
            range: range.toFixed(2)
        };
    }, [rows]);

    const addRow = () => setRows([...rows, { id: Date.now(), value: 0, frequency: 1 }]);
    const updateRow = (id, field, val) => setRows(rows.map(r => r.id === id ? { ...r, [field]: val } : r));
    const removeRow = (id) => rows.length > 1 && setRows(rows.filter(r => r.id !== id));

    const chartData = useMemo(() => {
        return rows.map((r, i) => ({
            name: r.value.toString(),
            value: parseFloat(r.frequency) || 0,
            color: COLORS[i % COLORS.length]
        })).filter(d => d.value > 0);
    }, [rows]);

    const theme = {
        container: isDarkMode ? 'bg-slate-950 border-white/5 shadow-3xl' : 'bg-white border-slate-100 shadow-2xl',
        card: isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-100 shadow-xl',
        textMain: isDarkMode ? 'text-white' : 'text-slate-900',
        textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
        input: isDarkMode ? 'bg-slate-950 border-white/10 text-amber-400' : 'bg-slate-50 border-slate-100 text-amber-600',
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8" dir="rtl">
            <div className={clsx("w-full max-w-7xl h-full max-h-[90vh] rounded-[3.5rem] overflow-hidden flex flex-col lg:flex-row relative border transition-all duration-500", theme.container)}>
                
                {/* Background Decor */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full" />
                </div>

                <button onClick={onClose} className="absolute top-8 left-8 z-50 p-4 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-3xl transition-all border border-white/5 backdrop-blur-md">
                    <X size={24} />
                </button>

                {/* Left Panel: Data Control */}
                <div className={clsx("w-full lg:w-[420px] border-l flex flex-col z-10 transition-colors", isDarkMode ? 'border-white/5 bg-slate-900/50' : 'border-slate-100 bg-white')}>
                    <div className="p-10 pb-6 text-right">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-[10px] uppercase tracking-widest mb-4">
                            <Database size={12} /> Data Analyzer v4.0
                        </div>
                        <h2 className={clsx("text-3xl font-black tracking-tighter mb-2 font-sans", theme.textMain)}>مخبر الإحصاء</h2>
                        <p className={theme.textSub}>تحويل البيانات الخام إلى رؤى إحصائية دقيقة.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-10 py-4 space-y-6 scrollbar-hide">
                        <div className="space-y-4">
                            <div className="flex justify-between px-4 text-[10px] font-black uppercase text-amber-500/50 tracking-widest">
                                <span className="w-[45%] text-right">القيمة (X)</span>
                                <span className="w-[45%] text-right">التكرار (N)</span>
                            </div>
                            <AnimatePresence>
                                {rows.map((row, idx) => (
                                    <motion.div key={row.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex gap-3 items-center group relative">
                                        <input type="number" value={row.value} onChange={(e) => updateRow(row.id, 'value', e.target.value)} className={clsx("flex-1 rounded-[1.25rem] px-6 py-4 text-lg font-black outline-none border-2 focus:border-amber-500 transition-all text-center font-mono shadow-sm", theme.input)} />
                                        <input type="number" value={row.frequency} onChange={(e) => updateRow(row.id, 'frequency', e.target.value)} className={clsx("flex-1 rounded-[1.25rem] px-6 py-4 text-lg font-black outline-none border-2 focus:border-amber-500 transition-all text-center font-mono shadow-sm", theme.input)} />
                                        <button onClick={() => removeRow(row.id)} className="p-3 text-rose-500/40 hover:text-rose-500 transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <button onClick={addRow} className="w-full py-5 border-2 border-dashed border-amber-500/20 rounded-3xl text-amber-500 hover:bg-amber-500/10 transition-all font-black text-sm flex items-center justify-center gap-3">
                                <Plus size={20} /> إضافة إحداثيات جديدة
                            </button>
                        </div>
                    </div>

                    <div className="p-10 pt-6 border-t border-white/5 bg-black/20 backdrop-blur-xl">
                        <h3 className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest text-right mb-6">المؤشرات الإحصائية (Stats Output)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <StatBox label="المتوسط" value={stats.mean} icon={<Sigma size={14} />} isDarkMode={isDarkMode} />
                            <StatBox label="الوسيط" value={stats.median} icon={<Binary size={14} />} isDarkMode={isDarkMode} />
                            <StatBox label="المدى" value={stats.range} icon={<LineChart size={14} />} isDarkMode={isDarkMode} />
                            <StatBox label="التكرار الكلي" value={stats.totalFreq} icon={<Database size={14} />} isDarkMode={isDarkMode} />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Visualization Area */}
                <div className="flex-1 bg-black/40 p-10 md:p-16 flex flex-col gap-10 overflow-hidden relative">
                    <div className="flex items-center justify-between z-10">
                        <div className="flex bg-white/5 p-2 rounded-[2rem] border border-white/5 backdrop-blur-2xl">
                            <button onClick={() => setChartType('bar')} className={clsx("flex items-center gap-3 px-8 py-3 rounded-2xl text-sm font-black transition-all", chartType === 'bar' ? "bg-amber-500 text-slate-950 shadow-glow-amber" : "text-slate-400 hover:text-white")}>
                                <BarChart2 size={18} /> مخطط أعمدة
                            </button>
                            <button onClick={() => setChartType('pie')} className={clsx("flex items-center gap-3 px-8 py-3 rounded-2xl text-sm font-black transition-all", chartType === 'pie' ? "bg-amber-500 text-slate-950 shadow-glow-amber" : "text-slate-400 hover:text-white")}>
                                <PieIcon size={18} /> مخطط دائري
                            </button>
                        </div>

                        <div className="hidden md:flex items-center gap-4 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-glow-emerald" />
                            <span className="text-xs font-black text-emerald-400 tracking-widest uppercase">Live Process Tracking</span>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-900/40 rounded-[4rem] p-8 md:p-12 border border-white/5 shadow-2xl relative group flex items-center justify-center backdrop-blur-3xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                        
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'bar' ? (
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} fontWeight="900" axisLine={false} tickLine={false} dy={15} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} fontWeight="900" axisLine={false} tickLine={false} dx={-15} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', padding: '20px' }} itemStyle={{ fontWeight: '900', color: '#f59e0b' }} />
                                    <Bar dataKey="value" radius={[12, 12, 4, 4]} barSize={45} animationDuration={1000}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : (
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={100} outerRadius={160} paddingAngle={8} dataKey="value" animationDuration={1000} stroke="none">
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', padding: '20px' }} />
                                    <Legend verticalAlign="bottom" height={40} iconType="circle" formatter={(val) => <span className="text-slate-400 font-black text-xs mx-3">قيمة: {val}</span>} />
                                </PieChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
                        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-xl flex items-start gap-6 group hover:bg-white/10 transition-all">
                            <Info className="text-amber-500 shrink-0 mt-1" size={28} />
                            <div>
                                <h4 className="font-black text-white text-lg mb-2 tracking-tighter uppercase">Algorithm Logic</h4>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed italic">يتم حساب المقاييس آلياً عبر فرز البيانات (Sort) واستخراج المتوسطات المرجحة بالتكرارات.</p>
                            </div>
                        </div>
                        <div className="p-8 bg-amber-500/10 rounded-[2.5rem] border-2 border-amber-500/20 flex items-start gap-6">
                            <TrendingUp className="text-amber-500 shrink-0 mt-1" size={28} />
                            <div>
                                <h4 className="font-black text-amber-500 text-lg mb-2 tracking-tighter uppercase italic">المنوال (Mode)</h4>
                                <p className="text-xs text-amber-200/60 font-bold leading-relaxed">
                                    القيمة السائدة الأكثر تكراراً في السلسلة: <span className="text-amber-400 underline decoration-wavy decoration-amber-500/50 ml-1">{stats.mode}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StatBox({ label, value, icon, isDarkMode }) {
    return (
        <div className={clsx("p-5 rounded-[1.75rem] border-2 transition-all group hover:scale-[1.02] text-right", isDarkMode ? 'bg-black/40 border-white/5 hover:border-amber-500/30 shadow-inner' : 'bg-slate-50 border-slate-100 hover:border-amber-500/30 shadow-sm')}>
            <div className="flex items-center gap-2 text-amber-500/50 mb-2">
                {icon}
                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <div className={clsx("text-2xl font-mono font-black tracking-tighter", isDarkMode ? 'text-amber-400 shadow-glow-amber' : 'text-slate-900')} dir="ltr">{value}</div>
        </div>
    );
}
