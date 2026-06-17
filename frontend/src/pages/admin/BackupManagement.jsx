import { useState, useEffect } from 'react';
import { Database, Download, Trash2, Plus, AlertCircle, CheckCircle2, Loader2, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

export default function BackupManagement() {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchBackups = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/backups');
            setBackups(data.backups);
            setError(null);
        } catch (e) {
            setError('فشل في جلب قائمة النسخ الاحتياطي');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleCreateBackup = async () => {
        try {
            setCreating(true);
            setSuccess(null);
            const { data } = await api.post('/admin/backups');
            setSuccess(data.message);
            fetchBackups();
        } catch (e) {
            setError('فشل في إنشاء نسخة احتياطية جديدة');
        } finally {
            setCreating(false);
        }
    };

    const handleDownload = async (fileName) => {
        try {
            const response = await api.get(`/admin/backups/${fileName}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            setError('فشل في تحميل الملف');
        }
    };

    const handleDelete = async (fileName) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه النسخة؟')) return;

        try {
            await api.delete(`/admin/backups/${fileName}`);
            setBackups(prev => prev.filter(b => b.name !== fileName));
            setSuccess('تم حذف النسخة بنجاح');
        } catch (e) {
            setError('فشل في حذف الملف');
        }
    };

    return (
        <div className="p-4 md:p-8 font-cairo" dir="rtl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Database className="text-sky-500" size={36} />
                        النسخ الاحتياطي التلقائي
                    </h1>
                    <p className="text-slate-500 font-bold mt-2">إدارة وتأمين بيانات المنصة بشكل دوري</p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={creating}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-4 rounded-[1.2rem] font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                >
                    {creating ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                    إنشاء نسخة فورية
                </button>
            </div>

            {/* Notifications */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-rose-50 border-2 border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 flex items-center gap-3 font-bold"
                    >
                        <AlertCircle size={24} />
                        {error}
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-emerald-50 border-2 border-emerald-100 text-emerald-600 p-4 rounded-2xl mb-6 flex items-center gap-3 font-bold"
                    >
                        <CheckCircle2 size={24} />
                        {success}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backup Table */}
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b-2 border-slate-100">
                                <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-wider text-sm">اسم الملف</th>
                                <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-wider text-sm">الحجم</th>
                                <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-wider text-sm">تاريخ الإنشاء</th>
                                <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-wider text-sm">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold">
                                        <Loader2 className="animate-spin mx-auto mb-2 text-sky-500" size={32} />
                                        جارٍ تحميل الملفات...
                                    </td>
                                </tr>
                            ) : backups.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold">
                                        <HardDrive className="mx-auto mb-2 opacity-20" size={48} />
                                        لا توجد نسخ احتياطية حالياً
                                    </td>
                                </tr>
                            ) : (
                                backups.map((backup) => (
                                    <tr key={backup.name} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                                                    <Database size={20} />
                                                </div>
                                                <span className="font-bold text-slate-700">{backup.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-500">{backup.size}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-500 tabular-nums">{backup.created_at}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDownload(backup.name)}
                                                    className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                                                    title="تحميل"
                                                >
                                                    <Download size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(backup.name)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Security Note */}
            <div className="mt-8 p-6 bg-amber-50 rounded-[1.8rem] border-2 border-amber-100 flex gap-4">
                <AlertCircle className="text-amber-500 shrink-0" size={28} />
                <div>
                    <h4 className="font-black text-amber-800 mb-1">توصية أمنية 🛡️</h4>
                    <p className="text-amber-700/80 font-bold leading-relaxed">
                        يتم إنشاء نسخة احتياطية تلقائية كل يوم في منتصف الليل. ننصحك بتحميل نسخة يدوية وحفظها في مكان آمن (مثل Google Drive أو قرص خارجي) مرة واحدة على الأقل أسبوعياً لضمان سلامة البيانات القصوى.
                    </p>
                </div>
            </div>
        </div>
    );
}
