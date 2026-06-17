import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Shield, Settings, CheckCircle, XCircle, FileText, ExternalLink, Loader2, Save, Coins, Zap, Activity } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SiteGovernance() {
    const [features, setFeatures] = React.useState([]);
    const [pendingReceipts, setPendingReceipts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('features'); // features, receipts

    const fetchData = async () => {
        try {
            const [featuresRes, receiptsRes] = await Promise.all([
                api.get('/settings/features'),
                api.get('/admin/access/pending-receipts')
            ]);
            setFeatures(featuresRes.data);
            setPendingReceipts(receiptsRes.data);
        } catch (e) {
            console.error(e);
            toast.error('فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateFeature = async (feature) => {
        setSaving(true);
        try {
            await api.post('/admin/settings/features', feature);
            toast.success(`تم تحديث إعدادات ${feature.display_name_ar}`);
            fetchData();
        } catch (e) {
            toast.error('فشل التحديث');
        } finally {
            setSaving(false);
        }
    };

    const handleApproveAccess = async (recordId) => {
        try {
            await api.post(`/admin/access/approve-receipt/${recordId}`);
            toast.success('تمت الموافقة وتفعيل الوصول');
            fetchData();
        } catch (e) {
            toast.error('فشل تفعيل الوصول');
        }
    };

    if (loading) return <LoadingScreen message="جاري تحميل إعدادات الإدارة..." />;

    return (
        <div className="space-y-8 pb-20" dir="rtl">
            <header className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 font-cairo">
                        <Shield className="text-sky-500" size={32} />
                        إدارة الصلاحيات والحوكمة
                    </h1>
                    <p className="text-slate-500 font-medium">التحكم في بوابات الوصول، أسعار الميزات، ومراجعة وصولات الدفع.</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('features')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'features' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Settings size={18} /> بوابات الموقع
                    </button>
                    <button
                        onClick={() => setActiveTab('receipts')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'receipts' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FileText size={18} />
                        الوصولات المعلقة
                        {pendingReceipts.length > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">{pendingReceipts.length}</span>
                        )}
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === 'features' ? (
                    <motion.div
                        key="features"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((feature) => (
                            <div key={feature.name} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 group transition-all hover:border-sky-300">
                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-50">
                                    <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                                        <Activity size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">{feature.display_name_ar}</h3>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{feature.name}</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase">نوع الوصول</label>
                                        <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                                            <button
                                                onClick={() => setFeatures(prev => prev.map(f => f.name === feature.name ? { ...f, access_type: 'classic' } : f))}
                                                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${feature.access_type === 'classic' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                مجاني (Classic)
                                            </button>
                                            <button
                                                onClick={() => setFeatures(prev => prev.map(f => f.name === feature.name ? { ...f, access_type: 'premium' } : f))}
                                                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${feature.access_type === 'premium' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                متميز (Premium)
                                            </button>
                                        </div>
                                    </div>

                                    {feature.access_type === 'premium' && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                            <label className="text-xs font-black text-slate-400 uppercase">السعر (بالعملات)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={feature.price}
                                                    onChange={(e) => setFeatures(prev => prev.map(f => f.name === feature.name ? { ...f, price: parseInt(e.target.value) } : f))}
                                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-sky-500 transition-all font-black text-slate-700"
                                                />
                                                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleUpdateFeature(feature)}
                                        disabled={saving}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        حفظ الإعدادات
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="receipts"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                    >
                        {pendingReceipts.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-20 text-center space-y-4 border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle size={40} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">لا توجد وصولات معلقة</h3>
                                <p className="text-slate-500 font-medium">كل شيء تحت السيطرة! جميع إرسالات الطلاب تمت معالجتها.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {pendingReceipts.map((record) => (
                                    <div key={record.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
                                                {record.receipt_path ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${record.receipt_path}`}
                                                        alt="Receipt"
                                                        className="w-full h-full object-cover cursor-pointer"
                                                        onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${record.receipt_path}`, '_blank')}
                                                    />
                                                ) : (
                                                    <FileText size={24} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-black text-slate-800 text-lg">{record.user?.name}</span>
                                                    <span className="text-[10px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-black">طالب</span>
                                                </div>
                                                <div className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                                    طلب الوصول إلى:
                                                    <span className="text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 flex items-center gap-1">
                                                        <Zap size={14} className="text-amber-500" />
                                                        {record.accessible?.name || record.accessible?.display_name_ar}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-1">تاريخ الطلب: {new Date(record.created_at).toLocaleString('ar-DZ')}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <a
                                                href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${record.receipt_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all text-sm"
                                            >
                                                <ExternalLink size={16} /> عرض الوصل
                                            </a>
                                            <button
                                                onClick={() => handleApproveAccess(record.id)}
                                                className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm"
                                            >
                                                <CheckCircle size={16} /> موافقة وتفعيل
                                            </button>
                                            <button className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
