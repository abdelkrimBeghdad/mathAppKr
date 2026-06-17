import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Coins, FileText, Upload, CheckCircle, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import confetti from 'canvas-confetti';
import { useTheme } from '../../context/ThemeContext';

export default function PremiumLock({ resourceInfo, onUnlocked, userCoins }) {
    const { isDark } = useTheme();
    const [view, setView] = useState('selection'); // selection, coins, receipt
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [receiptFile, setReceiptFile] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleUnlockWithCoins = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/access/unlock-coins', {
                accessible_id: resourceInfo.id,
                accessible_type: resourceInfo.type // 'lesson', 'section', 'field', 'feature'
            });

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#0ea5e9', '#f43f5e', '#10b981', '#f59e0b']
            });

            setSuccess(true);
            setTimeout(() => onUnlocked(data), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'فشل عملية الدفع. حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const handleReceiptUpload = async (e) => {
        e.preventDefault();
        if (!receiptFile) return;

        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('receipt', receiptFile);
        formData.append('accessible_id', resourceInfo.id);
        formData.append('accessible_type', resourceInfo.type);

        try {
            await api.post('/access/submit-receipt', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setView('receipt_success');
        } catch (err) {
            setError(err.response?.data?.message || 'فشل رفع الوصل.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-12 text-center"
            >
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                    <CheckCircle size={48} className="text-emerald-500" />
                </div>
                <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>تم فتح المحتوى!</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold">استمتع بتعلم ممتع ومفيد...</p>
            </motion.div>
        );
    }

    return (
        <div className="relative overflow-hidden glass-card p-8 md:p-12 border-2 border-sky-100 shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-400/10 rounded-full -ml-32 -mb-32 blur-3xl" />

            <AnimatePresence mode="wait">
                {view === 'selection' && (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center space-y-8"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl ring-8 ring-sky-50">
                            <Lock size={36} className="text-white" />
                        </div>

                        <div className="space-y-2">
                            <h2 className={`text-3xl font-black font-cairo ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>محتوى متميز (Premium)</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">هذا الجزء يتطلب اشتراكاً أو دفعاً لمرة واحدة للوصول إليه.</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 justify-center">
                            {/* Coin Option */}
                            <button
                                onClick={() => setView('coins')}
                                className="flex-1 p-6 glass-card hover:bg-sky-50 transition-all border-2 border-transparent hover:border-sky-300 group text-right dir-rtl"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                        <Coins size={24} />
                                    </div>
                                    <div>
                                        <div className={`text-lg font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>فتح بالعملات</div>
                                        <div className="text-amber-600 font-bold">{resourceInfo.price} عملة</div>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed">استخدم عملاتك التي كسبتها من حل التحديات لفتح هذا الدرس فوراً.</p>
                            </button>

                            {/* Receipt Option */}
                            <button
                                onClick={() => setView('receipt')}
                                className="flex-1 p-6 glass-card hover:bg-rose-50 transition-all border-2 border-transparent hover:border-rose-300 group text-right dir-rtl"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <div className={`text-lg font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>تفعيل يدوي</div>
                                        <div className="text-rose-600 font-bold">رفع وصل الدفع</div>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed">إذا قمت بالدفع عبر البريد أو البنك، ارفع صورة الوصل هنا وسيفعله المعلم لك.</p>
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold pt-4">
                            <ShieldCheck size={16} />
                            نظام دفع آمن ومحمي بالكامل
                        </div>
                    </motion.div>
                )}

                {view === 'coins' && (
                    <motion.div
                        key="coins"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-center space-y-8"
                    >
                        <div className="flex items-center justify-between dir-rtl mb-6">
                            <button onClick={() => setView('selection')} className="text-slate-400 hover:text-slate-600 transition-colors">رجوع</button>
                            <h3 className={`font-black text-2xl ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>تأكيد الدفع</h3>
                            <div className="w-10" />
                        </div>

                        <div className="p-8 bg-amber-50/50 rounded-3xl border-2 border-amber-100 space-y-6">
                            <div className={`flex justify-between items-center dir-rtl mb-4 p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-2xl shadow-sm border`}>
                                <span className="text-slate-500 font-bold">رصيدك الحالي:</span>
                                <span className="text-amber-600 font-black text-xl flex items-center gap-2">
                                    {userCoins} <Coins size={20} />
                                </span>
                            </div>

                            <div className="flex justify-between items-center dir-rtl p-4 bg-white/50 rounded-2xl border border-dashed border-amber-200">
                                <span className="text-slate-500 font-bold">تكلفة الفتح:</span>
                                <span className="text-slate-800 font-black text-xl">-{resourceInfo.price}</span>
                            </div>

                            <div className="border-t border-amber-100 dark:border-amber-900/50 pt-4 flex justify-between items-center dir-rtl">
                                <span className={`font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>الرصيد المتبقي:</span>
                                <span className={`font-black text-2xl ${userCoins >= resourceInfo.price ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {userCoins - resourceInfo.price}
                                </span>
                            </div>

                            {userCoins < resourceInfo.price && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 dir-rtl text-right font-bold">
                                    <AlertCircle size={20} />
                                    <span>عذراً، رصيدك غير كافٍ. يمكنك كسب المزيد من العملات عبر حل التحديات المجانية.</span>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl dir-rtl font-bold">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleUnlockWithCoins}
                                disabled={loading || userCoins < resourceInfo.price}
                                className={`w-full py-4 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 ${loading || userCoins < resourceInfo.price
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-amber-500/40 hover:-translate-y-1'
                                    }`}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                تأكيد وفتح الآن
                            </button>
                        </div>
                    </motion.div>
                )}

                {view === 'receipt' && (
                    <motion.div
                        key="receipt"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between dir-rtl mb-6">
                            <button onClick={() => setView('selection')} className="text-slate-400 hover:text-slate-600 transition-colors">رجوع</button>
                            <h3 className={`font-black text-2xl ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>رفع وصل الدفع</h3>
                            <div className="w-10" />
                        </div>

                        <form onSubmit={handleReceiptUpload} className="space-y-6">
                            <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center text-center group">
                                <input
                                    type="file"
                                    id="receipt-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setReceiptFile(e.target.files[0])}
                                />
                                <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center">
                                    <div className={`w-20 h-20 ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                                        <Upload size={32} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                                    </div>
                                    <div className={`font-black text-lg ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>اضغط هنا لرفع الصورة</div>
                                    <div className="text-slate-400 font-medium">PNG, JPG (أقصى حجم: 2MB)</div>
                                </label>
                                {receiptFile && (
                                    <div className="mt-4 p-2 bg-emerald-50 text-emerald-600 font-bold rounded-lg flex items-center gap-2">
                                        <CheckCircle size={16} />
                                        {receiptFile.name}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl dir-rtl font-bold text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !receiptFile}
                                className={`w-full py-4 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 ${loading || !receiptFile
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-rose-500/40 hover:-translate-y-1'
                                    }`}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Upload />}
                                إرسال للمراجعة
                            </button>
                        </form>
                    </motion.div>
                )}

                {view === 'receipt_success' && (
                    <motion.div
                        key="receipt_success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>تم الإرسال بنجاح!</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto">سيقوم المعلم بمراجعة الوصل وتفعيل الوصول لك خلال 24 ساعة كحد أقصى.</p>
                        <button
                            onClick={() => setView('selection')}
                            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                        >
                            فهمت
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
