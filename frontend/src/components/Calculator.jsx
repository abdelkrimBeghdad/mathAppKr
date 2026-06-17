import { useState } from 'react';
import { X, Delete, Percent, Divide, Minus, Plus, Equal, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Calculator({ onClose }) {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');

    const handleNumber = (num) => {
        if (display === '0') {
            setDisplay(num);
        } else {
            setDisplay(display + num);
        }
    };

    const handleOperator = (op) => {
        setEquation(display + ' ' + op + ' ');
        setDisplay('0');
    };

    const calculate = () => {
        try {
            const finalEquation = (equation + display)
                .replace('×', '*')
                .replace('÷', '/');

            // Note: Avoid eval in production, but for a local calculator tool it's common.
            // A more robust math library like mathjs would be better in a real app.
            const result = eval(finalEquation);
            setDisplay(String(Number(result.toFixed(4))));
            setEquation('');
        } catch (e) {
            setDisplay('Error');
        }
    };

    const clear = () => {
        setDisplay('0');
        setEquation('');
    };

    const btnClass = "h-14 rounded-2xl font-bold text-lg transition-all active:scale-90 flex items-center justify-center";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-[100] w-80 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl border border-slate-700/50 overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-slate-800/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                        <Equal size={18} />
                    </div>
                    <span className="font-bold tracking-tight">الآلة الحاسبة</span>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Display */}
            <div className="p-6 text-right space-y-1">
                <div className="text-slate-500 text-sm font-medium h-5 truncate">{equation}</div>
                <div className="text-4xl font-black truncate">{display}</div>
            </div>

            {/* Grid */}
            <div className="p-4 grid grid-cols-4 gap-3">
                <button onClick={clear} className={`${btnClass} bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 col-span-2`}>AC</button>
                <button onClick={() => setDisplay(display.slice(0, -1) || '0')} className={`${btnClass} bg-slate-800 text-slate-400 hover:bg-slate-700`}>
                    <Delete size={20} />
                </button>
                <button onClick={() => handleOperator('÷')} className={`${btnClass} bg-sky-500/20 text-sky-400 hover:bg-sky-500/30`}>
                    <Divide size={20} />
                </button>

                {['7', '8', '9'].map(n => <button key={n} onClick={() => handleNumber(n)} className={`${btnClass} bg-slate-800 hover:bg-slate-700`}>{n}</button>)}
                <button onClick={() => handleOperator('×')} className={`${btnClass} bg-sky-500/20 text-sky-400 hover:bg-sky-500/30`}>×</button>

                {['4', '5', '6'].map(n => <button key={n} onClick={() => handleNumber(n)} className={`${btnClass} bg-slate-800 hover:bg-slate-700`}>{n}</button>)}
                <button onClick={() => handleOperator('-')} className={`${btnClass} bg-sky-500/20 text-sky-400 hover:bg-sky-500/30`}>
                    <Minus size={20} />
                </button>

                {['1', '2', '3'].map(n => <button key={n} onClick={() => handleNumber(n)} className={`${btnClass} bg-slate-800 hover:bg-slate-700`}>{n}</button>)}
                <button onClick={() => handleOperator('+')} className={`${btnClass} bg-sky-500/20 text-sky-400 hover:bg-sky-500/30`}>
                    <Plus size={20} />
                </button>

                <button onClick={() => handleNumber('0')} className={`${btnClass} bg-slate-800 hover:bg-slate-700 col-span-2`}>0</button>
                <button onClick={() => !display.includes('.') && setDisplay(display + '.')} className={`${btnClass} bg-slate-800 hover:bg-slate-700`}>.</button>
                <button onClick={calculate} className={`${btnClass} bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20`}>
                    <Equal size={20} />
                </button>
            </div>
        </motion.div>
    );
}
