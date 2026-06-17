import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Trash2, Edit2, Coins, Tag, Image as ImageIcon, Search, Filter, Info, ChevronRight, X, Layout, UserCircle } from 'lucide-react';
import api from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoreManager() {
    const [items, setItems] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, type: 'create', data: null });
    const [filter, setFilter] = useState('all');

    const fetchData = async () => {
        try {
            const [itemsRes, statsRes] = await Promise.all([
                api.get('/admin/store/items'),
                api.get('/admin/store/stats')
            ]);
            setItems(itemsRes.data);
            setStats(statsRes.data);
        } catch (e) {
            toast.error('فشل في تحميل بيانات المتجر');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا العنصر من المتجر؟')) return;
        try {
            await api.delete(`/api/admin/store/items/${id}`);
            toast.success('تم حذف العنصر بنجاح');
            fetchData();
        } catch (e) {
            toast.error('فشل في حذف العنصر');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());

        try {
            if (modal.type === 'create') {
                await api.post('/api/admin/store/items', values);
                toast.success('تم إضافة العنصر بنجاح');
            } else {
                await api.put(`/api/admin/store/items/${modal.data.id}`, values);
                toast.success('تم تحديث العنصر بنجاح');
            }
            setModal({ open: false, type: 'create', data: null });
            fetchData();
        } catch (e) {
            toast.error('فشل في حفظ البيانات');
        }
    };

    const filteredItems = items.filter(item => filter === 'all' || item.type === filter);

    if (loading) return <LoadingScreen message="جاري تحميل إدارة المتجر..." />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-cairo" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">إدارة المتجر 🛒</h1>
                    <p className="text-slate-500 font-medium">إضافة وتعديل العناصر المتاحة للشراء بالعملات الذهبية.</p>
                </div>
                <button
                    onClick={() => setModal({ open: true, type: 'create', data: null })}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/10 font-black transition-all active:scale-95"
                >
                    <Plus size={20} /> إضافة عنصر جديد
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'إجمالي العناصر', value: stats?.total_items, icon: ShoppingBag, color: 'bg-primary-500' },
                    { label: 'الأفاتار', value: stats?.avatar_count, icon: UserCircle, color: 'bg-sky-500' },
                    { label: 'البانرات', value: stats?.banner_count, icon: Layout, color: 'bg-indigo-500' },
                    { label: 'القيمة الإجمالية', value: `${stats?.revenue_potential} 💰`, icon: Coins, color: 'bg-amber-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm font-bold">{stat.label}</div>
                            <div className="text-2xl font-black text-slate-800 mt-1">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {['all', 'avatar', 'banner', 'other'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={clsx(
                                "px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap",
                                filter === t ? "bg-slate-900 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {t === 'all' ? 'الكل' : t === 'avatar' ? 'أفاتار' : t === 'banner' ? 'بانرات' : 'أخرى'}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <motion.div
                            layout
                            key={item.id}
                            className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all"
                        >
                            <div className="aspect-square relative flex items-center justify-center p-8 bg-slate-50/50 overflow-hidden">
                                {item.type === 'banner' ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded-xl shadow-md rotate-3 group-hover:rotate-0 transition-transform duration-500" />
                                ) : (
                                    <div className="w-32 h-32 rounded-3xl bg-white shadow-xl flex items-center justify-center border-4 border-white group-hover:scale-110 transition-transform duration-500">
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-2" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black text-slate-500 shadow-sm uppercase tracking-wider">
                                    {item.type}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-black text-slate-800">{item.name}</h3>
                                    <div className="flex items-center gap-1 text-amber-500 font-black">
                                        <span>{item.price}</span>
                                        <Coins size={14} />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-6 h-8">{item.description || 'لا يوجد وصف متاح.'}</p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setModal({ open: true, type: 'edit', data: item })}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 font-bold transition-all"
                                    >
                                        <Edit2 size={16} /> تعديل
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modal.open && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setModal({ open: false, type: 'create', data: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-2xl font-black text-slate-800">
                                    {modal.type === 'create' ? 'إضافة عنصر جديد 🛍️' : 'تعديل العنصر ✏️'}
                                </h3>
                                <button
                                    onClick={() => setModal({ open: false, type: 'create', data: null })}
                                    className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700 mx-2">اسم العنصر</label>
                                        <input
                                            name="name"
                                            defaultValue={modal.data?.name}
                                            placeholder="مثال: الخوذة الذهبية"
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 font-bold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700 mx-2">السعر (ذهب)</label>
                                        <input
                                            name="price"
                                            type="number"
                                            defaultValue={modal.data?.price}
                                            placeholder="500"
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 font-black"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 mx-2">نوع العنصر</label>
                                    <select
                                        name="type"
                                        defaultValue={modal.data?.type || 'avatar'}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 font-black"
                                    >
                                        <option value="avatar">أفاتار (Avatar)</option>
                                        <option value="banner">بانر الملف الشخصي (Banner)</option>
                                        <option value="other">عنصر آخر</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 mx-2">رابط الصورة (URL)</label>
                                    <input
                                        name="image_url"
                                        defaultValue={modal.data?.image_url}
                                        placeholder="https://..."
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 font-mono text-xs"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 mx-2">الوصف</label>
                                    <textarea
                                        name="description"
                                        defaultValue={modal.data?.description}
                                        rows={3}
                                        placeholder="وصف مختصر للعنصر..."
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 font-medium"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10"
                                >
                                    {modal.type === 'create' ? 'إضافة إلى المتجر' : 'حفظ التعديلات'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
