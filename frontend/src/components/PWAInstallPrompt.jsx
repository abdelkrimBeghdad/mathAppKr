import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const { isDark } = useTheme();

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if dismissed recently
        const dismissed = localStorage.getItem('pwa-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            // Show again after 3 days
            if (Date.now() - dismissedTime < 3 * 24 * 60 * 60 * 1000) return;
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Delay showing the prompt for better UX
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-dismissed', Date.now().toString());
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className={`fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[200] ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-2 rounded-3xl shadow-2xl p-6`}
            >
                <button
                    onClick={handleDismiss}
                    className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-sky-500/30 shrink-0 rotate-3">
                        ن
                    </div>
                    <div className="flex-1">
                        <h3 className={`font-black text-lg mb-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            تثبيت التطبيق 📱
                        </h3>
                        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            أضف منصة النجاح لشاشتك الرئيسية للوصول السريع والاستخدام بدون إنترنت
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleInstall}
                                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Download size={16} />
                                تثبيت الآن
                            </button>
                            <button
                                onClick={handleDismiss}
                                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                لاحقاً
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features list */}
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} grid grid-cols-3 gap-2 text-center`}>
                    <div className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Smartphone size={16} className="mx-auto mb-1 text-sky-500" />
                        وصول سريع
                    </div>
                    <div className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Download size={16} className="mx-auto mb-1 text-emerald-500" />
                        بدون إنترنت
                    </div>
                    <div className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="text-lg block mb-0">🔔</span>
                        إشعارات
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
