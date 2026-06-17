import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, X, Coins, BrainCircuit, Lightbulb } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

const AITutorWidget = ({ contextId, type = 'lesson' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hint, setHint] = useState(null);
    const [loading, setLoading] = useState(false);

    const getHint = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/tutor/hint', {
                question_id: contextId,
                lesson_id: type === 'lesson' ? contextId : 1 // Fallback or handle differently
            });
            setHint(response.data.hint);
        } catch (error) {
            toast.error(error.response?.data?.message || "فشل الحصول على تلميح ذكي");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 left-8 z-[100] flex flex-col items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-80 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border-2 border-slate-100 dark:border-slate-700 p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[50px] rounded-full" />

                        <header className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/40 rounded-xl flex items-center justify-center text-sky-600">
                                    <BrainCircuit size={20} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm">المساعد الذكي</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إصدار تجريبي (Beta)</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </header>

                        <div className="space-y-6 relative z-10">
                            {hint ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30 text-amber-900 dark:text-amber-200 text-sm font-medium leading-relaxed italic"
                                >
                                    <Lightbulb size={24} className="mb-3 text-amber-500" />
                                    {hint}
                                </motion.div>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                    مرحباً بك! هل تحتاج إلى تلميح صغير لمتابعة الحل؟ تذكر أن الاعتماد على النفس هو سر النجاح بالرياضيات!
                                </p>
                            )}

                            {!hint && (
                                <button
                                    onClick={getHint}
                                    disabled={loading}
                                    className="w-full bg-slate-900 dark:bg-sky-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? 'جاري التفكير...' : (
                                        <>
                                            <Sparkles size={18} /> احصل على تلميح (5 <Coins size={14} className="inline" />)
                                        </>
                                    )}
                                </button>
                            )}

                            {hint && (
                                <button
                                    onClick={() => setHint(null)}
                                    className="w-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-2xl font-black text-xs transition-all"
                                >
                                    فهمت، شكراً!
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[1.8rem] shadow-2xl flex items-center justify-center border-4 border-white dark:border-slate-800 transition-all
                    ${isOpen ? 'bg-rose-500 rotate-90 text-white' : 'bg-sky-500 text-white'}`}
            >
                {isOpen ? <X size={32} /> : <div className="relative"><Sparkles size={32} /><div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" /></div>}
            </motion.button>
        </div>
    );
};

export default AITutorWidget;
