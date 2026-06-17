import { useState, useRef, useEffect } from 'react';
import { Pencil, Circle, Minus, MousePointer2, Trash2, Undo, Redo, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';

export default function GeometrySketchpad() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { isDark } = useTheme();

    const [tool, setTool] = useState('pencil'); // pencil, line, circle
    const [color, setColor] = useState('#0ea5e9'); // sky-500
    const [isDrawing, setIsDrawing] = useState(false);

    const [paths, setPaths] = useState([]); // Array of path objects: { tool, color, points: [{x,y}], startPoint, endPoint }
    const [currentPath, setCurrentPath] = useState(null);
    const [historyStep, setHistoryStep] = useState(0);

    const colors = ['#0ea5e9', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', isDark ? '#ffffff' : '#0f172a'];

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    useEffect(() => {
        drawCanvas();
    }, [paths, currentPath, historyStep, isDark]);

    const resizeCanvas = () => {
        if (!canvasRef.current || !containerRef.current) return;
        const canvas = canvasRef.current;
        const container = containerRef.current;

        // Setup high resolution canvas
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        drawCanvas();
    };

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const pos = getCoordinates(e);
        setIsDrawing(true);

        const newPath = {
            tool,
            color,
            width: tool === 'pencil' ? 3 : 2,
            points: [pos],
            startPoint: pos,
            endPoint: pos
        };
        setCurrentPath(newPath);
    };

    const draw = (e) => {
        e.preventDefault();
        if (!isDrawing || !currentPath) return;

        const pos = getCoordinates(e);

        if (tool === 'pencil') {
            setCurrentPath({
                ...currentPath,
                points: [...currentPath.points, pos],
                endPoint: pos
            });
        } else {
            setCurrentPath({
                ...currentPath,
                endPoint: pos
            });
        }
    };

    const stopDrawing = () => {
        if (!isDrawing || !currentPath) return;
        setIsDrawing(false);

        // Prevent empty clicks from saving
        if (currentPath.startPoint.x === currentPath.endPoint.x && currentPath.startPoint.y === currentPath.endPoint.y) {
            setCurrentPath(null);
            return;
        }

        const newPaths = paths.slice(0, historyStep + 1);
        newPaths.push(currentPath);
        setPaths(newPaths);
        setHistoryStep(newPaths.length - 1);
        setCurrentPath(null);
    };

    const drawGrid = (ctx, width, height) => {
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        const gridSize = 40;

        ctx.beginPath();
        for (let x = 0; x <= width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Draw axes
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    };

    const renderPath = (ctx, path) => {
        ctx.beginPath();
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (path.tool === 'pencil' && path.points.length > 0) {
            ctx.moveTo(path.points[0].x, path.points[0].y);
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
            }
            ctx.stroke();
        } else if (path.tool === 'line') {
            ctx.moveTo(path.startPoint.x, path.startPoint.y);
            ctx.lineTo(path.endPoint.x, path.endPoint.y);
            ctx.stroke();
        } else if (path.tool === 'circle') {
            const radius = Math.sqrt(
                Math.pow(path.endPoint.x - path.startPoint.x, 2) +
                Math.pow(path.endPoint.y - path.startPoint.y, 2)
            );
            ctx.arc(path.startPoint.x, path.startPoint.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        ctx.clearRect(0, 0, rect.width, rect.height);

        drawGrid(ctx, rect.width, rect.height);

        // Draw saved paths up to historyStep
        const visiblePaths = paths.slice(0, historyStep + 1);
        visiblePaths.forEach(p => renderPath(ctx, p));

        // Draw current path
        if (currentPath) {
            renderPath(ctx, currentPath);
        }
    };

    const undo = () => {
        if (historyStep >= 0) {
            setHistoryStep(historyStep - 1);
        }
    };

    const redo = () => {
        if (historyStep < paths.length - 1) {
            setHistoryStep(historyStep + 1);
        }
    };

    const clear = () => {
        setPaths([]);
        setHistoryStep(-1);
    };

    const download = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('url');
        link.download = 'geometry-sketch.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    const tools = [
        { id: 'pencil', icon: Pencil, label: 'رسم حر' },
        { id: 'line', icon: Minus, label: 'مستقيم' },
        { id: 'circle', icon: Circle, label: 'دائرة' },
    ];

    return (
        <div className={clsx(
            "w-full h-[60vh] min-h-[500px] rounded-[2.5rem] border-2 shadow-xl flex flex-col overflow-hidden relative",
            isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-100/50"
        )}>
            {/* Toolbar */}
            <div className={clsx(
                "p-4 border-b flex flex-wrap items-center justify-between gap-4 z-10 relative",
                isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-100"
            )}>
                <div className="flex items-center gap-2">
                    {tools.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            className={clsx(
                                "p-3 rounded-xl transition-all shadow-sm",
                                tool === t.id
                                    ? "bg-sky-500 text-white shadow-sky-500/30"
                                    : (isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200")
                            )}
                            title={t.label}
                        >
                            <t.icon size={20} />
                        </button>
                    ))}

                    <div className="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-2" />

                    {colors.map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={clsx(
                                "w-8 h-8 rounded-full border-2 transition-transform",
                                color === c ? "scale-110 border-white dark:border-slate-800 ring-2 ring-sky-500" : "border-transparent hover:scale-110"
                            )}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={undo} disabled={historyStep < 0} className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 transition-all text-slate-600 dark:text-slate-300">
                        <Undo size={18} />
                    </button>
                    <button onClick={redo} disabled={historyStep >= paths.length - 1} className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 transition-all text-slate-600 dark:text-slate-300">
                        <Redo size={18} />
                    </button>
                    <button onClick={clear} className="p-2.5 rounded-xl hover:bg-rose-50 hover:text-rose-500 text-slate-400 dark:hover:bg-rose-900/30 transition-all">
                        <Trash2 size={18} />
                    </button>
                    <button onClick={download} className="px-4 py-2.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                        <Download size={18} /> تحميل
                    </button>
                </div>
            </div>

            {/* Canvas Container */}
            <div
                ref={containerRef}
                className="flex-1 w-full bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden relative cursor-crosshair"
                style={{
                    backgroundImage: isDark
                        ? 'radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)'
                        : 'radial-gradient(circle at center, rgba(0,0,0,0.03) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            >
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute inset-0 touch-none"
                />
            </div>

            {/* Status Hint */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
                <div className={clsx("px-4 py-2 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md", isDark ? "bg-slate-800/80 text-sky-400" : "bg-white/80 text-sky-600")}>
                    وضع الرسم: {tools.find(t => t.id === tool)?.label}
                </div>
            </div>
        </div>
    );
}
