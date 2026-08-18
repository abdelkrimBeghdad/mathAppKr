import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Shield, Settings, CheckCircle, XCircle, FileText, ExternalLink, Loader2, Save, Coins, Zap, Activity, DollarSign, CreditCard, ArrowUpRight, ArrowDownLeft, Search, Download, FlaskConical, Filter, BookOpen, BarChart3 } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STORAGE_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace('/api', '');

export default function SiteGovernance() {
    const [features, setFeatures] = React.useState([]);
    const [pendingReceipts, setPendingReceipts] = React.useState([]);
    const [financialLedger, setFinancialLedger] = React.useState({ summary: {}, ledger: { data: [] } });
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('features'); // features, labs, receipts, ledger
    const [labs, setLabs] = React.useState([]);
    const [labCategoryFilter, setLabCategoryFilter] = React.useState('all');
    const [labSearch, setLabSearch] = React.useState('');
    const [savingLabId, setSavingLabId] = React.useState(null);

    const [ledgerSearch, setLedgerSearch] = useState('');
    const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all');

    const filteredLedger = (financialLedger.ledger?.data || []).filter(row => {
        const matchesSearch = 
            (row.user?.name || '').toLowerCase().includes(ledgerSearch.toLowerCase()) ||
            (row.description || '').toLowerCase().includes(ledgerSearch.toLowerCase());
        const matchesType = 
            ledgerTypeFilter === 'all' || 
            row.transaction_type === ledgerTypeFilter;
        return matchesSearch && matchesType;
    });

    const exportLedgerToCSV = () => {
        const headers = ['رقم القيد', 'التاريخ', 'اسم الطالب', 'وسيلة الدفع', 'النوع', 'العملات', 'القيمة بالدينار', 'الوصف', 'المصادق'];
        const rows = filteredLedger.map(row => [
            `#${row.id}`,
            new Date(row.created_at).toLocaleString('ar-DZ'),
            row.user?.name || `مستخدم #${row.user_id}`,
            row.payment_method,
            row.transaction_type === 'credit' ? 'إيداع / تفعيل' : 'اقتطاع عملات',
            row.coins_amount || 0,
            row.amount_dzd || 0,
            row.description || '',
            row.approver?.name || 'آلي'
        ]);

        const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `تقرير_الدفتر_المالي_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchData = async () => {
        try {
            const [featuresRes, receiptsRes, ledgerRes, labsRes] = await Promise.allSettled([
                api.get('/settings/features'),
                api.get('/admin/access/pending-receipts'),
                api.get('/admin/access/financial-ledger'),
                api.get('/admin/labs'),
            ]);
            if (featuresRes.status === 'fulfilled') setFeatures(featuresRes.value.data);
            if (receiptsRes.status === 'fulfilled') setPendingReceipts(receiptsRes.value.data);
            if (ledgerRes.status === 'fulfilled') setFinancialLedger(ledgerRes.value.data);
            if (labsRes.status === 'fulfilled') setLabs(labsRes.value.data);
        } catch (e) {
            console.error(e);
            toast.error('فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLab = async (lab) => {
        setSavingLabId(lab.id);
        try {
            await api.put(`/admin/labs/${lab.id}`, {
                access_type: lab.access_type,
                price: lab.price,
            });
            toast.success(`تم تحديث إعدادات «${lab.title_ar}»`);
        } catch (e) {
            toast.error('فشل تحديث المختبر');
        } finally {
            setSavingLabId(null);
        }
    };

    const LAB_CATEGORIES = [
        { key: 'all',           label: 'الكل' },
        { key: 'expansion',     label: 'النشر والتبسيط' },
        { key: 'factorization', label: 'التحليل الجبري' },
        { key: 'pgcd',          label: 'القواسم والأعداد' },
        { key: 'roots',         label: 'الجذور التربيعية' },
        { key: 'fractions',     label: 'الكسور' },
        { key: 'powers',        label: 'القوى والكتابة العلمية' },
        { key: 'equations',     label: 'المعادلات' },
        { key: 'inequalities',  label: 'المتراجحات' },
        { key: 'linear',        label: 'الدوال الخطية' },
        { key: 'affine',        label: 'الدوال التآلفية' },
        { key: 'systems',       label: 'جمل المعادلتين' },
        { key: 'pythagoras',    label: 'فيثاغورس' },
        { key: 'thales',        label: 'طاليس' },
        { key: 'vectors',       label: 'الأشعة' },
        { key: 'trig',          label: 'الحساب المثلثي' },
        { key: 'geometry-3d',   label: 'الهندسة الفضائية' },
        { key: 'stats',         label: 'الإحصاء' },
        { key: 'rotation',      label: 'الرادار' },
        { key: 'probability',   label: 'الاحتمالات' },
    ];

    const DIFFICULTY_COLORS = {
        'مبتدئ': 'bg-emerald-100 text-emerald-700',
        'متوسط': 'bg-sky-100 text-sky-700',
        'متقدم': 'bg-amber-100 text-amber-700',
        'خبير':  'bg-rose-100 text-rose-700',
    };

    const filteredLabs = labs.filter(lab => {
        const matchCat = labCategoryFilter === 'all' || lab.category === labCategoryFilter;
        const matchSearch = lab.title_ar.includes(labSearch) || lab.lab_key.includes(labSearch);
        return matchCat && matchSearch;
    });

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
            toast.success('تمت الموافقة وتفعيل الوصول وتوثيقه بالدفتر المالي');
            fetchData();
        } catch (e) {
            toast.error('فشل تفعيل الوصول');
        }
    };

    if (loading) return <LoadingScreen message="جاري تحميل إعدادات الإدارة والسجل المالي..." />;

    return (
        <div className="space-y-8 pb-20" dir="rtl">
            <header className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 font-cairo">
                        <Shield className="text-sky-500" size={32} />
                        إدارة الصلاحيات والحوكمة الماليّة (ERP)
                    </h1>
                    <p className="text-slate-500 font-medium">التحكم في بوابات الوصول، مراجعة الوصولات، والتدقيق المالي التراكمي.</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex-wrap gap-1">
                    <button
                        onClick={() => setActiveTab('features')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'features' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Settings size={18} /> بوابات الموقع
                    </button>
                    <button
                        onClick={() => setActiveTab('receipts')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'receipts' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FileText size={18} />
                        الوصولات المعلقة
                        {pendingReceipts.length > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">{pendingReceipts.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('labs')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'labs' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FlaskConical size={18} /> إدارة المخابر
                        <span className="bg-violet-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{labs.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('ledger')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'ledger' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <CreditCard size={18} />
                        السجل المالي للـ ERP
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === 'features' && (
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
                )}

                {activeTab === 'receipts' && (
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
                                                        src={`${STORAGE_BASE_URL}/storage/${record.receipt_path}`}
                                                        alt="Receipt"
                                                        className="w-full h-full object-cover cursor-pointer"
                                                        onClick={() => window.open(`${STORAGE_BASE_URL}/storage/${record.receipt_path}`, '_blank')}
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
                                                href={`${STORAGE_BASE_URL}/storage/${record.receipt_path}`}
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'labs' && (
                    <motion.div
                        key="labs"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'إجمالي المخابر', value: labs.length, icon: <FlaskConical size={22} />, color: 'violet' },
                                { label: 'مجاني (Classic)', value: labs.filter(l => l.access_type === 'classic').length, icon: <BookOpen size={22} />, color: 'emerald' },
                                { label: 'مدفوع (Premium)', value: labs.filter(l => l.access_type === 'premium').length, icon: <Coins size={22} />, color: 'amber' },
                                { label: 'إجمالي المحاولات', value: labs.reduce((s, l) => s + (l.attempts || 0), 0), icon: <BarChart3 size={22} />, color: 'sky' },
                            ].map(stat => (
                                <div key={stat.label} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-black text-slate-400 uppercase">{stat.label}</span>
                                        <h3 className={`text-3xl font-black mt-1 text-${stat.color}-600`}>{stat.value}</h3>
                                    </div>
                                    <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-500 rounded-2xl flex items-center justify-center`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="بحث بالاسم أو المفتاح..."
                                    value={labSearch}
                                    onChange={e => setLabSearch(e.target.value)}
                                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-violet-400 transition-colors"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {LAB_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.key}
                                        onClick={() => setLabCategoryFilter(cat.key)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                            labCategoryFilter === cat.key
                                                ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Labs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredLabs.map(lab => (
                                <div key={lab.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-violet-300 group transition-all flex flex-col gap-4">
                                    {/* Lab Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-800 text-sm leading-snug">{lab.title_ar}</h4>
                                            <code className="text-[10px] text-slate-400 font-mono">{lab.lab_key}</code>
                                        </div>
                                        <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-black ${DIFFICULTY_COLORS[lab.difficulty] || 'bg-slate-100 text-slate-500'}`}>
                                            {lab.difficulty}
                                        </span>
                                    </div>

                                    {/* Usage Stats */}
                                    <div className="flex gap-3 text-[11px] font-bold text-slate-500">
                                        <span className="flex items-center gap-1"><BarChart3 size={12} /> {lab.attempts || 0} محاولة</span>
                                        <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> {lab.completed || 0} مكتمل</span>
                                    </div>

                                    {/* Access Type Toggle */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">نوع الوصول</label>
                                        <div className="flex gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
                                            <button
                                                onClick={() => setLabs(prev => prev.map(l => l.id === lab.id ? { ...l, access_type: 'classic', price: 0 } : l))}
                                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                                                    lab.access_type === 'classic'
                                                        ? 'bg-white text-emerald-600 shadow-sm border border-slate-100'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                            >
                                                مجاني
                                            </button>
                                            <button
                                                onClick={() => setLabs(prev => prev.map(l => l.id === lab.id ? { ...l, access_type: 'premium' } : l))}
                                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                                                    lab.access_type === 'premium'
                                                        ? 'bg-amber-500 text-white shadow-md'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                            >
                                                مدفوع
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price Input */}
                                    {lab.access_type === 'premium' && (
                                        <div className="relative animate-in slide-in-from-top-2 duration-200">
                                            <input
                                                type="number"
                                                min="0"
                                                value={lab.price}
                                                onChange={e => setLabs(prev => prev.map(l => l.id === lab.id ? { ...l, price: parseInt(e.target.value) || 0 } : l))}
                                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-amber-400 transition-all font-black text-slate-700 text-sm pr-10"
                                                placeholder="السعر بالعملات"
                                            />
                                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
                                        </div>
                                    )}

                                    {/* Save Button */}
                                    <button
                                        onClick={() => handleUpdateLab(lab)}
                                        disabled={savingLabId === lab.id}
                                        className="mt-auto w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-50 text-sm"
                                    >
                                        {savingLabId === lab.id ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        حفظ
                                    </button>
                                </div>
                            ))}
                            {filteredLabs.length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-400 font-bold">
                                    لا توجد مخابر تطابق معايير البحث.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'ledger' && (
                    <motion.div
                        key="ledger"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-black text-slate-400 uppercase">إجمالي المعاملات المحاسبية</span>
                                    <h3 className="text-3xl font-black text-slate-800 mt-1">{financialLedger.summary?.total_transactions || 0}</h3>
                                </div>
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <CreditCard size={28} />
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-black text-slate-400 uppercase">إجمالي الاستهلاكات (عملات)</span>
                                    <h3 className="text-3xl font-black text-amber-600 mt-1">{financialLedger.summary?.total_coins_debited || 0}</h3>
                                </div>
                                <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                                    <Coins size={28} />
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-black text-slate-400 uppercase">التفعيلات المقبولة (إيداعات)</span>
                                    <h3 className="text-3xl font-black text-emerald-600 mt-1">{financialLedger.summary?.total_approved_credits || 0}</h3>
                                </div>
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                    <CheckCircle size={28} />
                                </div>
                            </div>
                        </div>

                        {/* Filters and Export Actions */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                <div className="relative w-full sm:w-72">
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
                                        <Search size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="بحث باسم الطالب أو البيان..."
                                        value={ledgerSearch}
                                        onChange={(e) => setLedgerSearch(e.target.value)}
                                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-sky-500 text-sm font-medium transition-colors"
                                    />
                                </div>
                                <select
                                    value={ledgerTypeFilter}
                                    onChange={(e) => setLedgerTypeFilter(e.target.value)}
                                    className="w-full sm:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-sky-500 text-sm font-bold transition-colors text-slate-600"
                                >
                                    <option value="all">جميع الحركات</option>
                                    <option value="credit">إيداعات وتفعيلات</option>
                                    <option value="debit">اقتطاعات العملات</option>
                                </select>
                            </div>
                            <button
                                onClick={exportLedgerToCSV}
                                disabled={filteredLedger.length === 0}
                                className="w-full md:w-auto px-6 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-95 text-sm"
                            >
                                <Download size={18} /> تصدير تقرير المحاسبة (CSV)
                            </button>
                        </div>

                        {/* Ledger Table */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <DollarSign className="text-emerald-500" size={22} />
                                    سجل القيود المالية والتدقيق التراكمي (ERP Audit Ledger)
                                </h3>
                                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">
                                    عدد السجلات المصفاة: {filteredLedger.length}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-black text-xs uppercase">
                                            <th className="pb-3 px-3">المعاملة</th>
                                            <th className="pb-3 px-3">التاريخ</th>
                                            <th className="pb-3 px-3">الطالب</th>
                                            <th className="pb-3 px-3">وسيلة الدفع</th>
                                            <th className="pb-3 px-3">النوع</th>
                                            <th className="pb-3 px-3">العملات / القيمة</th>
                                            <th className="pb-3 px-3">الوصف</th>
                                            <th className="pb-3 px-3">المصادق</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                                        {filteredLedger.map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-3 font-mono font-bold text-slate-400">#{row.id}</td>
                                                <td className="py-3 px-3 text-xs text-slate-500">{new Date(row.created_at).toLocaleString('ar-DZ')}</td>
                                                <td className="py-3 px-3 font-black text-slate-800">{row.user?.name || `مستخدم #${row.user_id}`}</td>
                                                <td className="py-3 px-3">
                                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-xs font-bold">{row.payment_method}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    {row.transaction_type === 'credit' ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-black">
                                                            <ArrowDownLeft size={14} /> إيداع / تفعيل
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-black">
                                                            <ArrowUpRight size={14} /> اقتطاع عملات
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 font-mono font-black">
                                                    {row.coins_amount > 0 ? `${row.coins_amount} عملة` : `${row.amount_dzd} دج`}
                                                </td>
                                                <td className="py-3 px-3 text-xs max-w-xs truncate">{row.description}</td>
                                                <td className="py-3 px-3 text-xs font-bold text-slate-500">{row.approver?.name || 'آلي'}</td>
                                            </tr>
                                        ))}
                                        {(!financialLedger.ledger?.data || financialLedger.ledger.data.length === 0) && (
                                            <tr>
                                                <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">لا توجد قيود مالية مسجلة في الدفتر بعد.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

