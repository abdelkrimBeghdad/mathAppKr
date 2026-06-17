import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Info } from 'lucide-react';

export default function FunctionPlotter() {
    const [a, setA] = useState(1);
    const [b, setB] = useState(0);
    const canvasRef = useRef(null);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const scale = 30; // pixels per unit
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);

        // Draw Grid
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;

        for (let x = 0; x <= width; x += scale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y += scale) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw Axes
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();

        // Draw Function: f(x) = ax + b
        // In canvas coordinates: y_canvas = centerY - (a * x_math + b) * scale
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.beginPath();

        for (let xCanvas = 0; xCanvas <= width; xCanvas++) {
            const xMath = (xCanvas - centerX) / scale;
            const yMath = a * xMath + b;
            const yCanvas = centerY - yMath * scale;

            if (xCanvas === 0) {
                ctx.moveTo(xCanvas, yCanvas);
            } else {
                ctx.lineTo(xCanvas, yCanvas);
            }
        }
        ctx.stroke();

        // Draw points for clarity
        // Intercept with Y axis
        const interceptY = centerY - b * scale;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(centerX, interceptY, 6, 0, Math.PI * 2);
        ctx.fill();
    };

    useEffect(() => {
        draw();
    }, [a, b]);

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col lg:flex-row gap-10">
            <div className="flex-1 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">راسم الدوال</h3>
                        <p className="text-sm font-bold text-slate-400">الدوال الخطية والتآلفية</p>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[60px] rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-sky-400">معادلة الدالة</span>
                    <h4 className="text-4xl font-black mt-2">
                        f(x) = <span className="text-indigo-400">{a !== 0 ? (a === 1 ? '' : a === -1 ? '-' : a) : ''}x</span>
                        <span className="text-rose-400">{b >= 0 ? (b === 0 ? '' : ` + ${b}`) : ` - ${Math.abs(b)}`}</span>
                    </h4>
                </div>

                <div className="space-y-10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-sm font-black text-slate-600">المعامل (a) - الميل</span>
                            <span className="text-lg font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">{a}</span>
                        </div>
                        <input
                            type="range" min="-10" max="10" step="0.5"
                            value={a} onChange={(e) => setA(parseFloat(e.target.value))}
                            className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-sm font-black text-slate-600">الثابت (b) - نقطة التقاطع</span>
                            <span className="text-lg font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-xl">{b}</span>
                        </div>
                        <input
                            type="range" min="-10" max="10" step="1"
                            value={b} onChange={(e) => setB(parseFloat(e.target.value))}
                            className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-rose-500"
                        />
                    </div>
                </div>

                <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex gap-3 items-start">
                    <Info className="text-amber-500 shrink-0" size={20} />
                    <p className="text-sm text-amber-700 font-medium leading-relaxed">
                        عندما يكون <span className="font-bold">b = 0</span>، تكون الدالة <span className="font-bold underline">خطية</span> وتمر من المبدأ.
                        عندما يكون <span className="font-bold underline">b ≠ 0</span>، تكون الدالة <span className="font-bold underline">تآلفية</span>.
                    </p>
                </div>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-4 border-2 border-slate-100 flex items-center justify-center relative overflow-hidden group">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className="bg-white rounded-2xl shadow-inner cursor-crosshair"
                />
            </div>
        </div>
    );
}
