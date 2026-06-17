import { useState, useEffect } from 'react';
import { Trophy, Plus, Edit, Trash2, Calendar, Users, Star, Coins, Zap, MoreVertical, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminTournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTournament, setEditingTournament] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        prize_coins: 100,
        prize_xp: 200,
        min_level: 1,
        status: 'active'
    });

    const fetchTournaments = async () => {
        try {
            const res = await api.get('/admin/tournaments');
            setTournaments(res.data.data);
        } catch (e) {
            toast.error('فشل في تحميل المسابقات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTournament) {
                await api.put(`/admin/tournaments/${editingTournament.id}`, formData);
                toast.success('تم تحديث المسابقة بنجاح');
            } else {
                await api.post('/admin/tournaments', formData);
                toast.success('تم إنشاء المسابقة بنجاح');
            }
            setShowModal(false);
            fetchTournaments();
        } catch (e) {
            toast.error('حدث خطأ أثناء الحفظ');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه المسابقة؟')) return;
        try {
            await api.delete(`/admin/tournaments/${id}`);
            toast.success('تم حذف المسابقة');
            fetchTournaments();
        } catch (e) {
            toast.error('فشل في الحذف');
        }
    };

    const openModal = (tournament = null) => {
        if (tournament) {
            setEditingTournament(tournament);
            setFormData({
                title: tournament.title,
                description: tournament.description || '',
                start_time: tournament.start_time.split('.')[0].replace(' ', 'T'),
                end_time: tournament.end_time.split('.')[0].replace(' ', 'T'),
                prize_coins: tournament.prize_coins,
                prize_xp: tournament.prize_xp,
                min_level: tournament.min_level,
                status: tournament.status
            });
        } else {
            setEditingTournament(null);
            setFormData({
                title: '',
                description: '',
                start_time: '',
                end_time: '',
                prize_coins: 100,
                prize_xp: 200,
                min_level: 1,
                status: 'active'
            });
        }
        setShowModal(true);
    };

    if (loading) return <LoadingScreen message="جاري تحميل المسابقات..." />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-cairo">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">مدير المسابقات 🏆</h1>
                    <p className="text-slate-500 font-medium">خطط ونظم التحديات التنافسية للطلاب.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    مسابقة جديدة
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {tournaments.map((t) => (
                    <div key={t.id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group">
                        <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-primary-600 border border-slate-100 shrink-0">
                                <Trophy size={40} />
                            </div>

                            <div className="flex-1 space-y-2 text-center md:text-right">
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-1">
                                    <h3 className="text-xl font-black text-slate-800">{t.title}</h3>
                                    <span className={clsx(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        t.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {t.status === 'active' ? 'نشطة' : t.status === 'upcoming' ? 'قادمة' : 'منتهية'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium line-clamp-1">{t.description}</p>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <Calendar size={14} />
                                        <span>من: {format(new Date(t.start_time), 'yyyy-MM-dd HH:mm')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <Clock size={14} />
                                        <span>إلى: {format(new Date(t.end_time), 'yyyy-MM-dd HH:mm')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                                        <Coins size={14} />
                                        <span>{t.prize_coins} عملة</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-sky-600">
                                        <Star size={14} />
                                        <span>{t.prize_xp} XP</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 px-8 border-x border-slate-50">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-slate-800">{t.participants_count || 0}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">مشارك</div>
                                </div>
                            </div>

                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => openModal(t)}
                                    className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all border border-slate-100"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {tournaments.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
                        <Trophy size={64} className="mx-auto text-slate-200 mb-4" />
                        <h3 className="text-xl font-black text-slate-400">لا توجد مسابقات حالياً</h3>
                        <p className="text-slate-400">ابدأ بإنشاء أول تحدي لطلابك!</p>
                    </div >
                )}
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-xl font-black text-slate-800">
                                    {editingTournament ? 'تعديل المسابقة' : 'إنشاء مسابقة جديدة'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pr-2">عنوان المسابقة</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold focus:border-primary-500 outline-none transition-all"
                                            placeholder="مثال: تحدي نوابغ الجبر"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pr-2">الوصف</label>
                                        <textarea
                                            rows="2"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold focus:border-primary-500 outline-none transition-all"
                                            placeholder="وصف مختصر للمسابقة..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pr-2">وقت البدء</label>
                                        <input
                                            required
                                            type="datetime-local"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pr-2">وقت الانتهاء</label>
                                        <input
                                            required
                                            type="datetime-local"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pr-2">الجائزة (عملات)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.prize_coins}
                                            onChange={(e) => setFormData({ ...formData, prize_coins: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pr-2">الجائزة (XP)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.prize_xp}
                                            onChange={(e) => setFormData({ ...formData, prize_xp: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pr-2">المستوى المطلوب</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.min_level}
                                            onChange={(e) => setFormData({ ...formData, min_level: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest pr-2">الحالة</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold focus:border-primary-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="active">نشطة</option>
                                            <option value="upcoming">قادمة (مسودة)</option>
                                            <option value="finished">منتهية</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-[2rem] font-black text-lg shadow-xl shadow-primary-500/20 transition-all border-b-4 border-primary-800 active:border-b-0"
                                    >
                                        {editingTournament ? 'حفظ التغييرات' : 'إنشاء المسابقة الآن'}
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

function X({ size }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
