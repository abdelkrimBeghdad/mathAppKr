import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Move, RotateCw, Maximize2 } from 'lucide-react';
import MathText from './MathText';

export default function VectorLab({ onClose }) {
    const canvasRef = useRef(null);
    const [vectors, setVectors] = useState([
        { id: 1, x: 3, y: 2, color: '#0ea5e9', label: 'A' },
        { id: 2, x: -2, y: 3, color: '#f43f5e', label: 'B' }
    ]);
    const [selectedOp, setSelectedOp] = useState('add');
    const [resultVector, setResultVector] = useState(null);
    const scale = 30;
    const centerX = 200;
    const centerY = 200;

    const drawVector = (ctx, vec, fromX = centerX, fromY = centerY) => {
        const toX = fromX + vec.x * scale;
        const toY = fromY - vec.y * scale;

        ctx.strokeStyle = vec.color;
        ctx.fillStyle = vec.color;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        const angle = Math.atan2(-(vec.y), vec.x);
        const arrowLength = 12;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - arrowLength * Math.cos(angle - Math.PI / 6),
            toY + arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            toX - arrowLength * Math.cos(angle + Math.PI / 6),
            toY + arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = vec.color;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(vec.label, toX + 10, toY - 10);
    };

    const calculateResult = () => {
        if (vectors.length < 2) return null;
        const [v1, v2] = vectors;

        let result;
        if (selectedOp === 'add') {
            result = { x: v1.x + v2.x, y: v1.y + v2.y, color: '#10b981', label: 'A+B' };
        } else if (selectedOp === 'subtract') {
            result = { x: v1.x - v2.x, y: v1.y - v2.y, color: '#f59e0b', label: 'A-B' };
        } else if (selectedOp === 'dot') {
            const dotProduct = v1.x * v2.x + v1.y * v2.y;
            return { type: 'scalar', value: dotProduct };
        }

        return result;
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += scale) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += scale) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.stroke();

        // Draw vectors
        vectors.forEach(vec => drawVector(ctx, vec));

        // Draw result if applicable
        const result = calculateResult();
        if (result && result.type !== 'scalar') {
            setResultVector(result);
            ctx.setLineDash([5, 5]);
            drawVector(ctx, result);
            ctx.setLineDash([]);
        } else if (result && result.type === 'scalar') {
            setResultVector(result);
        }
    };

    React.useEffect(() => {
        drawCanvas();
    }, [vectors, selectedOp]);

    const updateVector = (id, field, value) => {
        setVectors(vectors.map(v => v.id === id ? { ...v, [field]: parseFloat(value) || 0 } : v));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4"
        >
            <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-lg hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                    <X size={24} />
                </button>

                <div className="w-full md:w-96 border-l border-slate-100 flex flex-col bg-slate-50">
                    <div className="p-8 border-b border-slate-100">
                        <h2 className="text-2xl font-black text-slate-800 mb-2 text-right font-cairo">مخبر الأشعة ⚡</h2>
                        <p className="text-sm text-slate-500 font-medium text-right">إجراء عمليات على الأشعة</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {vectors.map((vec, idx) => (
                            <div key={vec.id} className="p-4 bg-white rounded-2xl border-2 border-slate-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: vec.color }} />
                                        <MathText text={`الشعاع $\\vec{${vec.label}}$`} className="font-black text-slate-800" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-1">X</label>
                                        <input
                                            type="number"
                                            value={vec.x}
                                            onChange={(e) => updateVector(vec.id, 'x', e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-center font-bold focus:border-sky-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-1">Y</label>
                                        <input
                                            type="number"
                                            value={vec.y}
                                            onChange={(e) => updateVector(vec.id, 'y', e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-center font-bold focus:border-sky-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div dir="ltr" className="text-center w-full">
                                    <MathText text={`$\\|\\vec{${vec.label}}\\| = ${Math.sqrt(vec.x ** 2 + vec.y ** 2).toFixed(2)}$`} className="text-xs text-slate-500 font-medium" />
                                </div>
                            </div>
                        ))}

                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-slate-400 uppercase text-right">العمليات</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setSelectedOp('add')}
                                    className={`p-3 rounded-xl font-bold text-sm flex flex-col items-center gap-1 transition-all ${selectedOp === 'add' ? 'bg-sky-500 text-white shadow-lg' : 'bg-white text-slate-600 border-2 border-slate-100'}`}
                                >
                                    <Plus size={18} />
                                    <MathText text="$\\vec{A} + \\vec{B}$" />
                                </button>
                                <button
                                    onClick={() => setSelectedOp('subtract')}
                                    className={`p-3 rounded-xl font-bold text-sm flex flex-col items-center gap-1 transition-all ${selectedOp === 'subtract' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-600 border-2 border-slate-100'}`}
                                >
                                    <Minus size={18} />
                                    <MathText text="$\\vec{A} - \\vec{B}$" />
                                </button>
                                <button
                                    onClick={() => setSelectedOp('dot')}
                                    className={`p-3 rounded-xl font-bold text-sm flex flex-col items-center gap-1 transition-all ${selectedOp === 'dot' ? 'bg-violet-500 text-white shadow-lg' : 'bg-white text-slate-600 border-2 border-slate-100'}`}
                                >
                                    <Move size={18} />
                                    <MathText text="$\\vec{A} \\cdot \\vec{B}$" />
                                </button>
                            </div>
                        </div>

                        {resultVector && (
                            <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-center">
                                <h3 className="font-black text-emerald-900 mb-3 text-right">النتيجة</h3>
                                {resultVector.type === 'scalar' ? (
                                    <div dir="ltr" className="text-center w-full">
                                        <MathText text={`$\\vec{A} \\cdot \\vec{B} = ${resultVector.value}$`} className="text-3xl font-black text-emerald-700 block" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div dir="ltr" className="text-center w-full">
                                            <MathText text={`$\\vec{R} = (${resultVector.x.toFixed(1)}; \\, ${resultVector.y.toFixed(1)})$`} className="text-2xl font-black text-emerald-700 block" />
                                        </div>
                                        <div dir="ltr" className="text-center w-full">
                                            <MathText text={`$\\|\\vec{R}\\| = ${Math.sqrt(resultVector.x ** 2 + resultVector.y ** 2).toFixed(2)}$`} className="text-sm text-emerald-600 font-medium block" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-white p-8 flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-slate-800 text-right mb-2">التمثيل البياني</h2>
                        <p className="text-slate-500 font-medium text-right text-sm">الأشعة والناتج على المستوى</p>
                    </div>

                    <div className="flex-1 bg-slate-50 rounded-3xl p-8 flex items-center justify-center border-2 border-slate-100">
                        <canvas
                            ref={canvasRef}
                            width={400}
                            height={400}
                            className="border border-slate-200 rounded-2xl bg-white"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
