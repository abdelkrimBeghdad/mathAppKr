import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Coins, Check, Lock, Sparkles, User, Palette, Bookmark, ChevronLeft } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import SEO from '../../components/common/SEO';

export default function Store() {
    const [items, setItems] = useState([]);
    const [ownedItemIds, setOwnedItemIds] = useState([]);
    const [equippedItemIds, setEquippedItemIds] = useState([]);
    const [coins, setCoins] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { isDark } = useTheme();

    const user = useAuthStore(state => state.user);
    const setUser = useAuthStore(state => state.setUser);


    const fetchItems = async () => {
        try {
            const { data } = await api.get('/store');
            setItems(data.items);
            setOwnedItemIds(data.owned_item_ids);
            setEquippedItemIds(data.equipped_item_ids);
            setCoins(data.coins);
            if (user) {
                setUser({ ...user, coins: data.coins });
            }
        } catch (e) {
            console.error('Failed to fetch store items', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handlePurchase = async (item) => {
        if (coins < item.price) {
            toast.error('ليس لديك ما يكفي من القطع الذهبية');
            return;
        }

        try {
            const { data } = await api.post(`/store/items/${item.id}/purchase`);
            toast.success(data.message);
            setCoins(data.coins);
            if (user) {
                setUser({ ...user, coins: data.coins });
            }
            setOwnedItemIds([...ownedItemIds, item.id]);
        } catch (e) {
            toast.error(e.response?.data?.message || 'فشلت عملية الشراء');
        }
    };

    const handleEquip = async (item) => {
        try {
            await api.post(`/store/items/${item.id}/equip`);
            toast.success('تم التجهيز بنجاح!');
            // Refresh counts to update UI
            fetchItems();
        } catch (e) {
            toast.error('فشل التجهيز');
        }
    };

    const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

    const categories = [
        { id: 'all', label: 'الكل', icon: ShoppingBag },
        { id: 'avatar', label: 'أفاتار', icon: User },
        { id: 'theme', label: 'ثيمات', icon: Palette },
        { id: 'banner', label: 'أشرطة', icon: Bookmark },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12" dir="rtl">
            <SEO title="المتجر | منصة النجاح" description="تسوق لتخصيص حسابك في منصة النجاح." />

            {/* Header section with Stats - Refined Glassmorphism */}
            <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-sky-500/20 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-500/30 blur-[80px] rounded-full" />

                <div className="relative z-10 flex-1 space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black flex items-center gap-4">
                        <ShoppingBag size={40} className="text-amber-300 drop-shadow-md" />
                        المتجر الافتراضي
                    </h1>
                    <p className="text-sky-100 text-lg md:text-xl font-medium max-w-xl">
                        استخدم قطعك الذهبية لتخصيص حسابك وإظهار تميزك بين أصدقائك بأسلوبك الخاص!
                    </p>
                </div>

                <div className="relative z-10 bg-white/10 p-6 rounded-[2rem] backdrop-blur-md flex flex-col items-center justify-center min-w-[250px] border border-white/20 shadow-xl">
                    <div className="text-sm font-bold text-sky-100 mb-2 uppercase tracking-widest">محفظتك</div>
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-400 p-3 rounded-2xl shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                            <Coins size={32} className="text-amber-900" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white" dir="ltr">{coins.toLocaleString()}</span>
                            <span className="text-xs font-bold text-amber-300">قطعة ذهبية</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Filter - Modern Pills */}
            <div className="flex flex-wrap gap-3 justify-center">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all duration-300 ${filter === cat.id
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105 ring-2 ring-sky-500/20'
                            : 'bg-white text-slate-500 hover:bg-slate-50 border-2 border-slate-100 hover:text-slate-800'
                            }`}
                    >
                        <cat.icon size={18} className={filter === cat.id ? 'animate-bounce-slight' : ''} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map(item => {
                        const isOwned = ownedItemIds.includes(item.id);
                        const isEquipped = equippedItemIds.includes(item.id);

                        return (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`relative group rounded-[2rem] border-2 transition-all duration-300 overflow-hidden flex flex-col bg-white border-slate-100 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-200/40`}
                            >
                                {isEquipped && (
                                    <div className="absolute top-4 left-4 z-10 bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/30">
                                        <Check size={20} strokeWidth={4} />
                                    </div>
                                )}

                                <div className="aspect-square bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-6 border-b border-slate-100">
                                    {/* Background glow for equipped */}
                                    {isEquipped && <div className="absolute inset-0 bg-emerald-500/5" />}

                                    <div className="text-7xl group-hover:scale-110 transition-transform duration-500 drop-shadow-xl relative z-10">
                                        {item.image_url || '✨'}
                                    </div>

                                    {/* Type badge */}
                                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-slate-200/80 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-300/50">
                                        {item.type}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="space-y-2 mb-6 flex-1">
                                        <h3 className="font-black text-xl text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm font-medium leading-relaxed text-slate-500 line-clamp-2">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        {!isOwned ? (
                                            <>
                                                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                                                    <Coins size={18} className="text-amber-500" />
                                                    <span className="font-black text-amber-700 text-lg" dir="ltr">
                                                        {item.price.toLocaleString()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handlePurchase(item)}
                                                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-black rounded-xl transition-all shadow-md shadow-sky-500/20 active:scale-95"
                                                >
                                                    شراء
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                    <Sparkles size={16} />
                                                    <span className="text-sm font-black">مملوك</span>
                                                </div>
                                                <button
                                                    onClick={() => handleEquip(item)}
                                                    disabled={isEquipped}
                                                    className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${isEquipped
                                                        ? 'bg-emerald-100 text-emerald-600 cursor-default'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-sky-500 hover:text-white hover:shadow-md hover:shadow-sky-500/20 active:scale-95'
                                                        }`}
                                                >
                                                    {isEquipped ? 'مجهز' : 'تجهيز'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center bg-white rounded-3xl p-12 shadow-sm border-2 border-slate-100">
                    <ShoppingBag size={64} className="mx-auto text-slate-200 mb-4" />
                    <h3 className="text-xl font-black text-slate-600">لا توجد عناصر حالياً</h3>
                    <p className="text-slate-400 font-medium">عد لاحقاً لاكتشاف عناصر جديدة!</p>
                </div>
            )}
        </div>
    );
}
