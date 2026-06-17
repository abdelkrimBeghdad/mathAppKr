import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Beaker, Search, Hash, Calculator, Shapes, 
    TrendingUp, ArrowLeft, ArrowRight, Star, 
    Trophy, ChevronLeft, LayoutGrid, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
    {
        id: 'numbers',
        name: 'قلعة الأعداد',
        description: 'اكتشف أسرار الأعداد، الجذور، والـ PGCD.',
        icon: Hash,
        color: 'emerald',
        labs: [
            { id: 'roots', name: 'مختبر الجذور التربيعية', path: '/student/labs/roots', difficulty: 'متوسط' },
            { id: 'pgcd', name: 'مكتشف القاسم المشترك (PGCD)', path: '/student/labs/pgcd', difficulty: 'سهل' },
            { id: 'coprime', name: 'الأعداد الأولية فيما بينها', path: '/student/labs/coprime', difficulty: 'متوسط' },
            { id: 'divisors', name: 'اكتشاف قواسم عدد طبيعي', path: '/student/labs/divisor-discovery', difficulty: 'سهل' },
            { id: 'powers', name: 'مختبر القوى والأسس', path: '/student/labs/powers', difficulty: 'متوسط' },
            { id: 'fractions', name: 'تبسيط الكسور الذكي', path: '/student/labs/fractions', difficulty: 'سهل' },
            { id: 'scientific', name: 'مختبر الكتابة العلمية', path: '/student/labs/scientific', difficulty: 'سهل' }
        ]
    },
    {
        id: 'algebra',
        name: 'ميدان الجبر',
        description: 'حل المعادلات، المتراجحات، والأنظمة بذكاء.',
        icon: Calculator,
        color: 'indigo',
        labs: [
            { id: 'identities', name: 'مختبر المتطابقات الشهيرة', path: '/student/labs/identities', difficulty: 'متوسط' },
            { id: 'factorization', name: 'النشر والتحليل الرياضي', path: '/student/labs/factorization', difficulty: 'صعب' },
            { id: 'equations', name: 'مختبر حل المعادلات', path: '/student/labs/equations', difficulty: 'متوسط' },
            { id: 'eq-product', name: 'معادلة الجداء المعدوم', path: '/student/labs/equations-product', difficulty: 'متوسط' },
            { id: 'systems', name: 'أنظمة المعادلات الخطية', path: '/student/labs/systems', difficulty: 'صعب' },
            { id: 'inequalities', name: 'مختبر المتراجحات', path: '/student/labs/inequalities', difficulty: 'متوسط' },
            { id: 'linear-fn', name: 'مختبر الدالة الخطية', path: '/student/labs/linear-function', difficulty: 'متوسط' },
            { id: 'affine-fn', name: 'مختبر الدالة التآلفية', path: '/student/labs/affine-functions', difficulty: 'متوسط' }
        ]
    },
    {
        id: 'geometry',
        name: 'أراضي الهندسة',
        description: 'فيثاغورس، طالس، والمتجهات في مساحة واحدة.',
        icon: Shapes,
        color: 'violet',
        labs: [
            { id: 'pythagoras', name: 'مختبر فيثاغورس التفاعلي', path: '/student/labs/pythagoras', difficulty: 'متوسط' },
            { id: 'thales', name: 'مختبر خاصية طالس', path: '/student/labs/thales', difficulty: 'متوسط' },
            { id: 'trigo', name: 'مختبر النسب المثلثية', path: '/student/labs/trigonometry', difficulty: 'صعب' },
            { id: 'trig-rel', name: 'العلاقات المثلثية المتقدمة', path: '/student/labs/trig-relations', difficulty: 'صعب' },
            { id: 'vectors', name: 'مختبر المتجهات والإزاحة', path: '/student/labs/vectors', difficulty: 'متوسط' },
            { id: 'vec-coord', name: 'إحداثيات شعاع ومنتصف قطعة', path: '/student/labs/vector-coordinates', difficulty: 'متوسط' },
            { id: 'midpoint', name: 'حساب المسافات والإحداثيات', path: '/student/labs/midpoint-distance', difficulty: 'سهل' },
            { id: 'polygons', name: 'مختبر المضلعات المنتظمة', path: '/student/labs/regular-polygons', difficulty: 'متوسط' },
            { id: 'rotation', name: 'مختبر الدوران والزوايا', path: '/student/labs/rotation', difficulty: 'متوسط' }
        ]
    },
    {
        id: 'analytics',
        name: 'برج البيانات',
        description: 'الاحتمالات والمناحي اللفظية بأسلوب تفاعلي.',
        icon: TrendingUp,
        color: 'amber',
        labs: [
            { id: 'probability', name: 'مختبر علم الاحتمالات', path: '/student/labs/probability', difficulty: 'سهل' },
            { id: 'word-problems', name: 'مختبر تحليل المسائل اللفظية', path: '/student/labs/word-problems', difficulty: 'صعب' }
        ]
    }
];

export default function LabsExplorer() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    const filteredLabs = CATEGORIES.flatMap(cat => 
        cat.labs.map(lab => ({ ...lab, category: cat }))
    ).filter(lab => 
        (selectedCategory === 'all' || lab.category.id === selectedCategory) &&
        (lab.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         lab.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20" dir="rtl">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-indigo-600 dark:bg-indigo-900 pt-16 pb-32">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-32 h-32 border-8 border-white rounded-full animate-pulse" />
                    <div className="absolute bottom-10 right-20 w-48 h-48 border-[12px] border-white rounded-full opacity-50" />
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 backdrop-blur-md rounded-full text-indigo-100 border border-white/10 mb-6 font-black text-sm uppercase tracking-widest">
                            <Beaker size={18} />
                            أكاديمية المختبرات التفاعلية
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                            استكشف عالم <span className="text-amber-300">الرياضيات</span> <br className="hidden md:block" /> 
                            بين يديك
                        </h1>
                        <p className="max-w-2xl mx-auto text-indigo-100 text-lg font-medium opacity-80 leading-relaxed">
                            مختبرات افتراضية تمنحك القوة لتفكيك المسائل المعقدة وفهم أسرار العلم من خلال التجربة والحل الذاتي.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="ابحث عن مختبر (مثلاً: فيثاغورس)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-3 pr-12 pl-4 focus:border-indigo-500 outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                        <button 
                            onClick={() => setSelectedCategory('all')}
                            className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                        >
                            الكل
                        </button>
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap flex items-center gap-2 ${selectedCategory === cat.id ? `bg-${cat.color}-600 text-white shadow-lg shadow-${cat.color}-200/50` : 'bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                            >
                                <cat.icon size={16} />
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Labs Display */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <AnimatePresence mode="wait">
                    {filteredLabs.length > 0 ? (
                        <motion.div 
                            key={`${selectedCategory}-${viewMode}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4 max-w-4xl mx-auto"}
                        >
                            {filteredLabs.map((lab, i) => (
                                <motion.div 
                                    key={lab.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => navigate(lab.path)}
                                    className={`group relative cursor-pointer bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-200/40 dark:hover:shadow-indigo-900/40 overflow-hidden ${viewMode === 'list' ? 'flex items-center p-4' : 'p-6'}`}
                                >
                                    <div className={`absolute top-0 right-0 w-2 h-full bg-${lab.category.color}-500`} />
                                    
                                    <div className={`${viewMode === 'grid' ? 'mb-4' : 'ml-6'} w-12 h-12 bg-${lab.category.color}-50 dark:bg-${lab.category.color}-900/20 rounded-2xl flex items-center justify-center text-${lab.category.color}-600 group-hover:scale-110 transition-transform`}>
                                        <lab.category.icon size={24} />
                                    </div>
                                    
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded bg-${lab.category.color}-100 dark:bg-${lab.category.color}-950 text-${lab.category.color}-700 dark:text-${lab.category.color}-300`}>
                                                {lab.category.name}
                                            </span>
                                            <span className={`text-[10px] font-bold ${lab.difficulty === 'صعب' ? 'text-rose-500' : lab.difficulty === 'متوسط' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                • {lab.difficulty}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                                            {lab.name}
                                        </h3>
                                    </div>

                                    {viewMode === 'grid' && (
                                        <div className="mt-6 flex items-center justify-between text-slate-400 group-hover:text-indigo-600 transition-colors">
                                            <span className="text-xs font-bold uppercase tracking-widest">عرض المختبر</span>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <ArrowLeft size={16} />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">لم نجد أي مختبر بهذا الاسم</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">حاول البحث بكلمة أخرى أو تصفح الأقسام الجانبية.</p>
                            <button onClick={() => {setSearchQuery(''); setSelectedCategory('all');}} className="mt-6 text-indigo-600 font-black hover:underline">إظهار كافة المختبرات</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Achievement Footer Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                <div className="bg-gradient-to-br from-indigo-900 to-slate-950 rounded-[3rem] p-10 relative overflow-hidden text-white border border-white/5">
                    <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                        <Trophy className="absolute -bottom-10 -right-10 w-64 h-64 rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="text-center lg:text-right space-y-4">
                            <h2 className="text-3xl font-black">جاهز لتصبح "أسطورة المختبرات"؟</h2>
                            <p className="max-w-xl font-medium opacity-70">كل مختبر تكمله يمنحك نقاط خبرة (XP) وأوسمة تظهر في ملفك الشخصي. ابدأ التحدي الآن!</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black text-lg hover:bg-amber-400 hover:text-indigo-900 transition-all transform hover:scale-105 active:scale-95">
                                عرض أوسمتي
                            </button>
                            <button className="px-8 py-4 bg-indigo-500/20 backdrop-blur-md rounded-2xl font-black text-lg border border-white/10 hover:bg-white/10 transition-all">
                                ترتيب الأوائل
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
