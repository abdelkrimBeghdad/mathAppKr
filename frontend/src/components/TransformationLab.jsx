import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Move, RotateCw, Rotate3d, FlipHorizontal } from 'lucide-react'; // Renamed Flip to FlipHorizontal and Rotate3D to Rotate3d

export default function TransformationLab({ onClose }) {
    const canvasRef = useRef(null);
    const [shape, setShape] = useState({ type: 'triangle', x: 150, y: 150, rotation: 0, scale: 1 });
    const [transformation, setTransformation] = useState('translation');
    const [params, setParams] = useState({ dx: 50, dy: 30, angle: 45, axis: 'x' });
    const [showOriginal, setShowOriginal] = useState(true);

    const drawTriangle = (ctx, x, y, rotation = 0, scale = 1, color = '#0ea5e9', alpha = 1) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);

        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(25, 20);
        ctx.lineTo(-25, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    };

    const drawSquare = (ctx, x, y, rotation = 0, scale = 1, color = '#0ea5e9', alpha = 1) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);

        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        ctx.fillRect(-25, -25, 50, 50);
        ctx.strokeRect(-25, -25, 50, 50);

        ctx.restore();
    };

    const applyTransformation = () => {
        let newShape = { ...shape };

        if (transformation === 'translation') {
            newShape.x = shape.x + params.dx;
            newShape.y = shape.y + params.dy;
        } else if (transformation === 'rotation') {
            newShape.rotation = shape.rotation + params.angle;
        } else if (transformation === 'symmetry') {
            if (params.axis === 'x') {
                newShape.y = 300 - shape.y;
            } else {
                newShape.x = 300 - shape.x;
            }
        }

        return newShape;
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(canvas.width, 150);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(150, 0);
        ctx.lineTo(150, canvas.height);
        ctx.stroke();

        // Original shape
        if (showOriginal) {
            if (shape.type === 'triangle') {
                drawTriangle(ctx, shape.x, shape.y, shape.rotation, shape.scale, '#94a3b8', 0.5);
            } else {
                drawSquare(ctx, shape.x, shape.y, shape.rotation, shape.scale, '#94a3b8', 0.5);
            }
        }

        // Transformed shape
        const transformed = applyTransformation();
        if (shape.type === 'triangle') {
            drawTriangle(ctx, transformed.x, transformed.y, transformed.rotation, transformed.scale, '#10b981', 1);
        } else {
            drawSquare(ctx, transformed.x, transformed.y, transformed.rotation, transformed.scale, '#10b981', 1);
        }
    };

    useEffect(() => {
        drawCanvas();
    }, [shape, transformation, params, showOriginal]);

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
                        <h2 className="text-2xl font-black text-slate-800 mb-2 text-right font-cairo">مخبر التحويلات 🔄</h2>
                        <p className="text-sm text-slate-500 font-medium text-right">تطبيق التحويلات الهندسية</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase mb-3 text-right">نوع الشكل</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShape({ ...shape, type: 'triangle' })}
                                    className={`flex-1 p-3 rounded-xl font-bold transition-all ${shape.type === 'triangle' ? 'bg-sky-500 text-white' : 'bg-white border-2 border-slate-100 text-slate-600'}`}
                                >
                                    مثلث
                                </button>
                                <button
                                    onClick={() => setShape({ ...shape, type: 'square' })}
                                    className={`flex-1 p-3 rounded-xl font-bold transition-all ${shape.type === 'square' ? 'bg-sky-500 text-white' : 'bg-white border-2 border-slate-100 text-slate-600'}`}
                                >
                                    مربع
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase mb-3 text-right">التحويل</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setTransformation('translation')}
                                    className={`w-full p-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${transformation === 'translation' ? 'bg-violet-500 text-white shadow-lg' : 'bg-white text-slate-600 border-2 border-slate-100'}`}
                                >
                                    <Move size={18} />
                                    <MathText text="الإزاحة (Translation)" />
                                </button>
                                <button
                                    onClick={() => setTransformation('rotation')}
                                    className={`w-full p-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${transformation === 'rotation' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-600 border-2 border-slate-100'}`}
                                >
                                    <RotateCw size={18} />
                                    <MathText text="الدوران (Rotation)" />
                                </button>
                                <button
                                    onClick={() => setTransformation('symmetry')}
                                    className={`w-full p-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${transformation === 'symmetry' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-600 border-2 border-slate-100'}`}
                                >
                                    <FlipHorizontal size={18} />
                                    <MathText text="التماثل (Symmetry)" />
                                </button>
                            </div>
                        </div>

                        {transformation === 'translation' && (
                            <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 space-y-3">
                                <h4 className="font-black text-slate-700 text-sm text-right">معاملات الإزاحة</h4>
                                <div>
                                    <MathText text="$\\Delta x$" className="text-xs font-bold text-slate-400 block mb-1 text-right" />
                                    <input
                                        type="number"
                                        value={params.dx}
                                        onChange={(e) => setParams({ ...params, dx: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-center font-bold focus:border-sky-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <MathText text="$\\Delta y$" className="text-xs font-bold text-slate-400 block mb-1 text-right" />
                                    <input
                                        type="number"
                                        value={params.dy}
                                        onChange={(e) => setParams({ ...params, dy: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-center font-bold focus:border-sky-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {transformation === 'rotation' && (
                            <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 space-y-3">
                                <h4 className="font-black text-slate-700 text-sm text-right">زاوية الدوران</h4>
                                <input
                                    type="number"
                                    value={params.angle}
                                    onChange={(e) => setParams({ ...params, angle: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-center font-bold focus:border-sky-500 outline-none"
                                    placeholder="درجة"
                                />
                            </div>
                        )}

                        {transformation === 'symmetry' && (
                            <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 space-y-3">
                                <h4 className="font-black text-slate-700 text-sm text-right">محور التماثل</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setParams({ ...params, axis: 'x' })}
                                        className={`flex-1 p-2 rounded-xl font-bold text-sm transition-all ${params.axis === 'x' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600'}`}
                                    >
                                        المحور X
                                    </button>
                                    <button
                                        onClick={() => setParams({ ...params, axis: 'y' })}
                                        className={`flex-1 p-2 rounded-xl font-bold text-sm transition-all ${params.axis === 'y' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600'}`}
                                    >
                                        المحور Y
                                    </button>
                                </div>
                            </div>
                        )}

                        <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showOriginal}
                                onChange={(e) => setShowOriginal(e.target.checked)}
                                className="w-5 h-5"
                            />
                            <span className="text-sm font-bold text-slate-700">إظهار الشكل الأصلي</span>
                        </label>
                    </div>
                </div>

                <div className="flex-1 bg-white p-8 flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-slate-800 text-right mb-2">المعاينة</h2>
                        <p className="text-slate-500 font-medium text-right text-sm">رؤية التحويل على المستوى</p>
                    </div>

                    <div className="flex-1 bg-slate-50 rounded-3xl p-8 flex items-center justify-center border-2 border-slate-100">
                        <div className="space-y-4">
                            <canvas
                                ref={canvasRef}
                                width={300}
                                height={300}
                                className="border border-slate-200 rounded-2xl bg-white shadow-lg"
                            />
                            <div className="flex gap-4 justify-center text-xs font-bold">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-slate-400/50 rounded" />
                                    <span>الأصلي</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-emerald-500 rounded" />
                                    <span>المحول</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
