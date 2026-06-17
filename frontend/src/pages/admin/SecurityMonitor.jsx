import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, UserX, UserCheck, Search, Activity, Clock, ShieldAlert, Eye, Filter } from 'lucide-react';
import api from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function SecurityMonitor() {
    const [incidents, setIncidents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspensionData, setSuspensionData] = useState({ userId: '', name: '', reason: '' });
    const [page, setPage] = useState(1);

    const fetchData = async () => {
        try {
            const [incRes, statsRes] = await Promise.all([
                api.get(`/admin/security/incidents?page=${page}`),
                api.get('/admin/security/stats')
            ]);
            setIncidents(incRes.data.data);
            setStats(statsRes.data);
        } catch (e) {
            toast.error('فشل في تحميل بيانات الأمان');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const handleSuspend = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/admin/security/users/${suspensionData.userId}/suspend`, {
                reason: suspensionData.reason
            });
            toast.success('تم تعليق حساب المستخدم بنجاح');
            setShowSuspendModal(false);
            fetchData();
        } catch (e) {
            toast.error('فشل في تعليق الحساب');
        }
    };

    const handleUnsuspend = async (userId) => {
        if (!window.confirm('هل أنت متأكد من إلغاء تعليق هذا الحساب؟')) return;
        try {
            await api.post(`/admin/security/users/${userId}/unsuspend`);
            toast.success('تم إلغاء تعليق الحساب');
            fetchData();
        } catch (e) {
            toast.error('فشل في إلغاء التعليق');
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-rose-100 text-rose-600 border-rose-200';
            case 'high': return 'bg-orange-100 text-orange-600 border-orange-200';
            case 'medium': return 'bg-amber-100 text-amber-600 border-amber-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (loading) return <LoadingScreen message="جاري فحص سجلات الأمان..." />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-cairo">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">مراقب الأمان 🛡️</h1>
                    <p className="text-slate-500 font-medium">متابعة الأنشطة المشبوهة وحماية نزاهة المنصة.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <Activity className="text-primary-500" size={20} />
                        <span className="text-sm font-black text-slate-700">{stats?.total_incidents} حادثة مسجلة</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="حوادث حرجة" value={stats?.critical_incidents} color="rose" icon={ShieldAlert} />
                <StatCard label="تحذيرات عالية" value={stats?.high_incidents} color="orange" icon={AlertTriangle} />
                <StatCard label="طلاب محظورون" value={stats?.suspended_users} color="slate" icon={UserX} />
                <StatCard label="حوادث (7 أيام)" value={stats?.recent_incidents} color="sky" icon={Clock} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Incident List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <Activity className="text-rose-500" />
                                سجل النشاط المشبوه
                            </h2>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                    <Filter size={18} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {incidents.map((incident) => (
                                <motion.div
                                    key={incident.id}
                                    layoutId={`incident-${incident.id}`}
                                    className="p-4 rounded-2xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group cursor-pointer"
                                    onClick={() => setSelectedIncident(incident)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center border shrink-0", getSeverityColor(incident.severity))}>
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-black text-slate-800">{incident.user.name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">{format(new Date(incident.created_at), 'HH:mm - yyyy/MM/dd')}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                                    {incident.type.replace(/_/g, ' ')}
                                                </span>
                                                {incident.user.is_suspended && (
                                                    <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md font-black uppercase">محظور</span>
                                                )}
                                            </div>
                                        </div>
                                        <Eye size={18} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                </motion.div>
                            ))}

                            {incidents.length === 0 && (
                                <div className="text-center py-20 text-slate-300">
                                    <Shield className="mx-auto mb-4 opacity-20" size={64} />
                                    <p className="font-bold">لا توجد حوادث مسجلة حالياً.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Detail / Action */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedIncident ? (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-8"
                            >
                                <div className="text-center mb-8">
                                    <div className={clsx("w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border mb-4", getSeverityColor(selectedIncident.severity))}>
                                        <ShieldAlert size={40} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 leading-tight">تفاصيل الحادثة</h3>
                                    <p className="text-slate-400 font-bold text-sm mt-1">{selectedIncident.user.name}</p>
                                </div>

                                <div className="space-y-6 mb-8 text-right" dir="rtl">
                                    <DetailItem label="النوع" value={selectedIncident.type} />
                                    <DetailItem label="الخطورة" value={selectedIncident.severity.toUpperCase()} />
                                    <DetailItem label="عنوان IP" value={selectedIncident.ip_address || 'Unknown'} />
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">البيانات التقنية</span>
                                        <div className="bg-slate-50 p-4 rounded-xl font-mono text-xs text-slate-600 overflow-auto max-h-40">
                                            {JSON.stringify(selectedIncident.details, null, 2)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {selectedIncident.user.is_suspended ? (
                                        <button
                                            onClick={() => handleUnsuspend(selectedIncident.user.id)}
                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <UserCheck size={20} />
                                            إلغاء الحظر
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setSuspensionData({ userId: selectedIncident.user.id, name: selectedIncident.user.name, reason: '' });
                                                setShowSuspendModal(true);
                                            }}
                                            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <UserX size={20} />
                                            حظر المستخدم
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedIncident(null)}
                                        className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold transition-colors"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-400"
                            >
                                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-bold">اختر حادثة من السجل لمشاهدة التفاصيل والإجراءات.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Suspend Modal */}
            <AnimatePresence>
                {showSuspendModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSuspendModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden text-right"
                            dir="rtl"
                        >
                            <div className="p-8 bg-rose-50 border-b border-rose-100 flex items-center gap-4 text-rose-600">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                    <UserX size={24} />
                                </div>
                                <h3 className="text-xl font-black">حظر المستخدم: {suspensionData.name}</h3>
                            </div>

                            <form onSubmit={handleSuspend} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pr-2">سبب الحظر (سيظهر للطالب)</label>
                                    <textarea
                                        required
                                        rows="3"
                                        value={suspensionData.reason}
                                        onChange={(e) => setSuspensionData({ ...suspensionData, reason: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-rose-500 outline-none transition-all"
                                        placeholder="مثال: تم اكتشاف محاولة غش متكررة في الاختبارات..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowSuspendModal(false)}
                                        className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition-all"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black shadow-lg shadow-rose-500/20 transition-all"
                                    >
                                        تأكيد الحظر
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, color, icon: Icon }) {
    const colors = {
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
        orange: 'text-orange-600 bg-orange-50 border-orange-100',
        slate: 'text-slate-600 bg-slate-50 border-slate-100',
        sky: 'text-sky-600 bg-sky-50 border-sky-100',
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-right">
            <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center mb-4 ms-auto`}>
                <Icon size={24} />
            </div>
            <div className="text-2xl font-black text-slate-800">{value !== undefined ? value : '0'}</div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{label}</div>
        </div>
    );
}

function DetailItem({ label, value }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="font-bold text-slate-700">{value}</span>
        </div>
    );
}
