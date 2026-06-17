import { useState } from 'react';
import { ExternalLink, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function SafeLink({ href, children, className, ...props }) {
    const [showWarning, setShowWarning] = useState(false);

    const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));

    const handleClick = (e) => {
        if (isExternal) {
            e.preventDefault();
            setShowWarning(true);
        }
    };

    const confirmRedirect = () => {
        setShowWarning(false);
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    if (!isExternal && href) {
        return <Link to={href} className={className} {...props}>{children}</Link>;
    }

    return (
        <>
            <a
                href={href}
                onClick={handleClick}
                className={className}
                {...props}
            >
                {children}
            </a>

            <AnimatePresence>
                {showWarning && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-cairo" dir="rtl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative overflow-hidden"
                        >
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[5rem] -z-10 opacity-50" />

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                    <AlertTriangle size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800">تنبيه أمان ⚠️</h3>
                                    <p className="text-slate-500 font-bold">أنت على وشك مغادرة المنصة</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    هذا الرابط سيوجهك إلى موقع خارجي غير تابع لمنصة التحدى. يرجى التأكد من أنك تثق بالمصدر قبل المتابعة.
                                </p>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 break-all font-mono text-xs text-slate-500 flex gap-2 items-start">
                                    <ExternalLink size={14} className="shrink-0 mt-0.5" />
                                    {href}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={confirmRedirect}
                                    className="flex-1 py-4 bg-amber-500 text-white rounded-[1.2rem] font-black text-lg hover:bg-amber-600 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-amber-500/20"
                                >
                                    متابعة للموقع <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => setShowWarning(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[1.2rem] font-black text-lg hover:bg-slate-200 transition-all"
                                >
                                    إلغاء والعودة
                                </button>
                            </div>

                            <button
                                onClick={() => setShowWarning(false)}
                                className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
