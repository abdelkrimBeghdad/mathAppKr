import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, Activity, Hash, Layers } from 'lucide-react';
import PGCDSolver from './solvers/PGCDSolver';
import FunctionPlotter from './solvers/FunctionPlotter';
import clsx from 'clsx';

export default function MathLab({ onClose }) {
    const [activeTab, setActiveTab] = useState('pgcd');

    const tabs = [
        { id: 'pgcd', name: 'خطوات PGCD', icon: <Hash size={20} />, color: 'indigo' },
        { id: 'plotter', name: 'راسم الدوال', icon: <Activity size={20} />, color: 'sky' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
            <div className="bg-slate-50 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/20 flex flex-col h-[85vh]">

                {/* Header */}
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-200 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                            <Layers size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">مخبر الرياضيات الذكي</h2>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-rose-500">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 bg-white border-l border-slate-200 p-4 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-all duration-300",
                                    activeTab === tab.id
                                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-2"
                                        : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <span className={clsx(
                                    "p-2 rounded-xl",
                                    activeTab === tab.id ? "bg-white/10" : "bg-slate-100"
                                )}>{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'pgcd' && <PGCDSolver />}
                                {activeTab === 'plotter' && <FunctionPlotter />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
