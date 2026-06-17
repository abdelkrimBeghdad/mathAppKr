import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sigma, Divide, X as CloseIcon, HelpCircle, Save, Type, Eraser, Eye } from 'lucide-react';
import MathText from './MathText';

const CATEGORIES = [
    {
        id: 'basic',
        icon: <Sigma size={16} />,
        label: 'أساسي',
        symbols: [
            { label: '+', latex: '+', display: '+' },
            { label: '-', latex: '-', display: '-' },
            { label: '×', latex: '\\times', display: '×' },
            { label: '÷', latex: '\\div', display: '÷' },
            { label: '=', latex: '=', display: '=' },
            { label: '≈', latex: '\\approx', display: '≈' },
            { label: '≠', latex: '\\neq', display: '≠' },
            { label: '>', latex: '>', display: '>' },
            { label: '<', latex: '<', display: '<' },
            { label: '±', latex: '\\pm', display: '±' },
        ]
    },
    {
        id: 'structure',
        icon: <Divide size={16} />,
        label: 'هياكل',
        symbols: [
            { label: 'كسر', latex: '\\frac{}{}', display: '□/□', cursorOffset: -2 },
            { label: 'جذر', latex: '\\sqrt{}', display: '√□', cursorOffset: -1 },
            { label: 'أس', latex: '^{}', display: 'x²', cursorOffset: -1 },
            { label: 'دليل', latex: '_{}', display: 'xₙ', cursorOffset: -1 },
            { label: 'أقواس', latex: '()', display: '(□)', cursorOffset: -1 },
            { label: 'مجموعة', latex: '\\{\\}', display: '{□}', cursorOffset: -1 },
            { label: 'قيمة مطلقة', latex: '| |', display: '|□|', cursorOffset: -1 },
            { label: 'جذر نوني', latex: '\\sqrt[]{}', display: 'ⁿ√□', cursorOffset: -2 },
        ]
    },
    {
        id: 'symbols',
        icon: <Type size={16} />,
        label: 'رموز',
        symbols: [
            { label: 'باي', latex: '\\pi', display: 'π' },
            { label: 'لانهاية', latex: '\\infty', display: '∞' },
            { label: 'زاوية', latex: '\\angle', display: '∠' },
            { label: 'مثلث', latex: '\\triangle', display: '△' },
            { label: 'درجة', latex: '^{\\circ}', display: '°' },
            { label: 'ينتمي', latex: '\\in', display: '∈' },
            { label: 'مجموعة خالية', latex: '\\emptyset', display: '∅' },
            { label: 'ألفا', latex: '\\alpha', display: 'α' },
            { label: 'بيتا', latex: '\\beta', display: 'β' },
            { label: 'ثيتا', latex: '\\theta', display: 'θ' },
        ]
    }
];

export default function EquationEditor({ onInsert, active }) {
    const [activeTab, setActiveTab] = useState('basic');
    const [currentLatex, setCurrentLatex] = useState('');

    const handleInsert = (symbol) => {
        const latexToAdd = symbol.latex;
        setCurrentLatex(prev => prev + latexToAdd);
        // We still call onInsert if they click directly, 
        // but maybe they want to build first? 
        // Let's make it so they can "build" then "insert all"
    };

    const handleConfirm = () => {
        if (currentLatex) {
            onInsert(currentLatex, 0);
            setCurrentLatex('');
        }
    };

    const handleClear = () => setCurrentLatex('');

    if (!active) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden mb-3"
        >
            <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 border-b dark:border-slate-700">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveTab(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === cat.id
                            ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        {cat.icon}
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            <div className="p-4 grid grid-cols-5 sm:grid-cols-10 gap-2">
                {CATEGORIES.find(c => c.id === activeTab).symbols.map((symbol, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => handleInsert(symbol)}
                        className="h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-900/30 hover:bg-sky-50 dark:hover:bg-sky-900/30 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-medium text-slate-700 dark:text-slate-300 transition-all hover:scale-110 active:scale-95 hover:border-sky-300 dark:hover:border-sky-700"
                        title={symbol.label}
                    >
                        {symbol.display}
                    </button>
                ))}
            </div>

            {/* Live Preview Area */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-b dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Eye size={12} /> معاينة مباشرة
                    </span>
                    <button
                        onClick={handleClear}
                        className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase flex items-center gap-1 transition-colors"
                    >
                        <Eraser size={12} /> مسح الكل
                    </button>
                </div>
                <div className="min-h-[60px] p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-xl shadow-inner group relative">
                    {currentLatex ? (
                        <MathText text={`$${currentLatex}$`} />
                    ) : (
                        <span className="text-slate-300 dark:text-slate-600 font-medium italic">المعادلة ستظهر هنا...</span>
                    )}
                </div>
                <button
                    onClick={handleConfirm}
                    disabled={!currentLatex}
                    className="w-full mt-3 py-2.5 bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:shadow-none active:scale-95"
                >
                    <Save size={18} /> إدراج في النص
                </button>
            </div>

            <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle size={10} />
                    اضغط على الرموز لبناء المعادلة ثم اضغط "إدراج"
                </p>
                <div className="flex gap-1 text-[10px] items-center">
                    <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">مثال: $ \sqrt{25} = 5 $</span>
                </div>
            </div>
        </motion.div>
    );
}
