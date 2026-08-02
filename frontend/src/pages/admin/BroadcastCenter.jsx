import { useState } from 'react';
import { Megaphone, Send, AlertTriangle, Info, CheckCircle, Bell, X, Users, MessageSquare, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function BroadcastCenter() {
    const [sending, setSending] = useState(false);
    const [preview, setPreview] = useState({
        title: 'عنوان الإعلان',
        message: 'محتوى الرسالة التي ستظهر للطلاب هنا...',
        type: 'info',
        icon: 'Bell'
    });

    const handleSend = async (e) => {
        e.preventDefault();
        if (!window.confirm('هل أنت متأكد من إرسال هذا الإعلان لجميع الطلاب؟ هذه العملية لا يمكن التراجع عنها.')) return;

        setSending(true);
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());

        try {
            const { data } = await api.post('/admin/broadcast/send', values);
            toast.success(data.message);
            e.target.reset();
        } catch (e) {
            toast.error('فشل في إرسال الإعلان');
        } finally {
            setSending(false);
        }
    };

    const updatePreview = (e) => {
        const { name, value } = e.target;
        setPreview(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-cairo text-right" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">مركز البث العالمي 📢</h1>
                    <p className="text-slate-500 font-medium">إرسال تنبيهات هامة لجميع الطلاب المسجلين في المنصة فوراً.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Composer */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                <MessageSquare size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">إنشاء إعلان جديد</h3>
                        </div>
                        <form onSubmit={handleSend} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700 mx-2">عنوان الإعلان</label>
                                <input
                                    name="title"
                                    onChange={updatePreview}
                                    placeholder="مثال: تحديث جديد في المنصة!"
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 font-bold"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 mx-2">نوع التنبيه</label>
                                    <select
                                        name="type"
                                        onChange={updatePreview}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 font-black"
                                    >
                                        <option value="info">معلومات (Info)</option>
                                        <option value="warning">تحذير (Warning)</option>
                                        <option value="success">نجاح (Success)</option>
                                        <option value="reward">مكافأة (Reward)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 mx-2">الأيقونة</label>
                                    <select
                                        name="icon"
                                        onChange={updatePreview}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 font-black"
                                    >
                                        <option value="Bell">جرس (Bell)</option>
                                        <option value="Trophy">كأس (Trophy)</option>
                                        <option value="Zap">برق (Zap)</option>
                                        <option value="Gift">هدية (Gift)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700 mx-2">محتوى الرسالة</label>
                                <textarea
                                    name="message"
                                    onChange={updatePreview}
                                    rows={4}
                                    placeholder="اكتب هنا التفاصيل التي سيراها الطلاب..."
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700 mx-2">رابط التوجيه (اختياري)</label>
                                <input
                                    name="action_url"
                                    placeholder="/student/store"
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 font-mono text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {sending ? 'جاري الإرسال...' : (
                                    <>
                                        <Send size={20} className="rotate-180" /> إرسال الإعلان للجميع
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-5">
                    <div className="sticky top-8 space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                <Megaphone className="text-primary-400" /> معاينة مباشرة
                            </h3>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                <div className="flex gap-4">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                        preview.type === 'info' ? "bg-sky-500" :
                                            preview.type === 'warning' ? "bg-rose-500" :
                                                preview.type === 'success' ? "bg-emerald-500" : "bg-amber-500"
                                    )}>
                                        <Bell size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-black text-lg mb-1">{preview.title || 'عنوان الإعلان'}</div>
                                        <p className="text-sm text-slate-300 font-medium">{preview.message || 'المحتوى...'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-white/5 rounded-[1.5rem] border border-white/5">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">كيف سيظهر للطالب؟</div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                                        <Users size={20} className="text-slate-500" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-2 w-24 bg-slate-800 rounded-full" />
                                        <div className="h-2 w-48 bg-slate-800/50 rounded-full" />
                                    </div>
                                    <div className="relative">
                                        <Bell className="text-slate-500" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex gap-4">
                            <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                            <div className="text-sm text-amber-800 font-bold leading-relaxed">
                                تنبيه: سيصل هذا الإعلان لكل طالب يملك حساباً على المنصة. يرجى التأكد من صحة المعلومات قبل الضغط على زر الإرسال.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
