import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Lock, Unlock, Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save, X, BookOpen, Layers, Target } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import EquationEditor from '../../components/EquationEditor';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function ContentManagement() {
    const [fields, setFields] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [actionLoading, setActionLoading] = React.useState(false);

    // Modal States
    const [modal, setModal] = React.useState({ open: false, type: '', data: null, parentId: null });
    const [activeField, setActiveField] = React.useState(null);

    const fetchContent = async () => {
        try {
            const { data } = await api.get('/admin/fields');
            setFields(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchContent();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());
        setActionLoading(true);

        try {
            if (modal.type === 'field') {
                if (modal.data) await api.put(`/admin/fields/${modal.data.id}`, values);
                else await api.post('/admin/fields', values);
            } else if (modal.type === 'section') {
                if (modal.data) await api.put(`/admin/sections/${modal.data.id}`, values);
                else await api.post('/admin/sections', { ...values, field_id: modal.parentId });
            } else if (modal.type === 'lesson') {
                const finalValues = { ...values };
                if (values.lab_config) {
                    try {
                        finalValues.lab_config = JSON.parse(values.lab_config);
                    } catch (e) {
                        toast.error('خطأ في تنسيق JSON للإعدادات');
                        return;
                    }
                }
                if (modal.data) await api.put(`/admin/lessons/${modal.data.id}`, finalValues);
                else await api.post('/admin/lessons', { ...finalValues, section_id: modal.parentId });
            }
            setModal({ open: false, type: '', data: null, parentId: null });
            fetchContent();
        } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء حفظ البيانات');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (type, id) => {
        if (!confirm('هل أنت متأكد من حذف هذا العنصر؟ سيتم حذف جميع المحتويات المرتبطة به.')) return;
        try {
            await api.delete(`/admin/${type}s/${id}`);
            fetchContent();
        } catch (e) {
            console.error(e);
            alert('خطأ في الحذف');
        }
    };

    const insertFormula = (latex, cursorOffset) => {
        const el = document.getElementsByName(activeField)[0];
        if (el) {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const text = el.value;
            const newText = text.substring(0, start) + latex + text.substring(end);
            el.value = newText;
            el.focus();
            const newPos = start + latex.length + cursorOffset;
            el.setSelectionRange(newPos, newPos);
        }
    };

    const toggleLock = async (lesson) => {
        try {
            await api.put(`/admin/lessons/${lesson.id}`, {
                ...lesson,
                is_locked: !lesson.is_locked
            });
            fetchContent();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <LoadingScreen message="جاري تحميل المنهج..." />;

    return (
        <div className="space-y-6 md:space-y-8 pb-20">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 font-cairo">بناء المنهج التعليمي</h1>
                    <p className="text-slate-500 font-medium">إدارة المجالات، الفصول والدروس بشكل تفاعلي.</p>
                </div>
                <button
                    onClick={() => setModal({ open: true, type: 'field', data: null })}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/10 font-bold transition-all active:scale-95"
                >
                    <Plus size={20} /> إضافة مجال جديد
                </button>
            </div>

            <div className="space-y-8">
                {fields.map(field => (
                    <div key={field.id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        {/* Field Header */}
                        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                                    <Layers size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800">{field.name}</h2>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setModal({ open: true, type: 'field', data: field })}
                                    className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete('field', field.id)}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => setModal({ open: true, type: 'section', data: null, parentId: field.id })}
                                    className="ms-2 px-4 py-2 bg-white border-2 border-slate-200 text-slate-600 rounded-xl hover:border-sky-500 hover:text-sky-500 text-sm font-bold transition-all"
                                >
                                    + فصل جديد
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-10">
                            {field.sections?.map(section => (
                                <div key={section.id} className="relative ps-8 border-s-2 border-slate-100">
                                    <div className="absolute -start-1.5 top-0 w-3 h-3 bg-slate-200 rounded-full" />

                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-black text-slate-700">{section.name}</h3>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setModal({ open: true, type: 'section', data: section })}
                                                    className="p-1.5 text-slate-300 hover:text-sky-500 transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete('section', section.id)}
                                                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setModal({ open: true, type: 'lesson', data: null, parentId: section.id })}
                                            className="text-xs px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-900 hover:text-white font-bold transition-all"
                                        >
                                            + درس جديد
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {section.lessons?.map(lesson => (
                                            <div key={lesson.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:border-sky-100">
                                                <div className="flex items-center gap-3">
                                                    <div className={clsx(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md",
                                                        lesson.is_locked ? "bg-slate-300" : "bg-emerald-500"
                                                    )}>
                                                        <BookOpen size={18} />
                                                    </div>
                                                    <span className="font-bold text-slate-700">{lesson.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => toggleLock(lesson)}
                                                        className={clsx(
                                                            "p-2 rounded-xl transition-all",
                                                            lesson.is_locked ? "text-rose-500 hover:bg-rose-50" : "text-emerald-500 hover:bg-emerald-50"
                                                        )}
                                                        title={lesson.is_locked ? "إلغاء القفل" : "قفل الدرس"}
                                                    >
                                                        {lesson.is_locked ? <Lock size={18} /> : <Unlock size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => setModal({ open: true, type: 'lesson', data: lesson })}
                                                        className="p-2 text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('lesson', lesson.id)}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModal({ open: false })} />
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-800 font-cairo">
                                {modal.data ? 'تعديل ' : 'إضافة '}
                                {modal.type === 'field' ? 'مجال' : modal.type === 'section' ? 'فصل' : 'درس'}
                            </h3>
                            <button onClick={() => setModal({ open: false })} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ms-2">الاسم</label>
                                <input
                                    name="name"
                                    defaultValue={modal.data?.name}
                                    placeholder="مثال: الأنشطة العددية"
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-500 transition-all font-medium"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ms-2">نوع الوصول</label>
                                    <select
                                        name="access_type"
                                        defaultValue={modal.data?.access_type || 'classic'}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-500 transition-all font-bold"
                                    >
                                        <option value="classic">مجاني (Classic)</option>
                                        <option value="premium">متميز (Premium)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ms-2">السعر (بالعملات)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        defaultValue={modal.data?.price || 0}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-500 transition-all font-bold"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {modal.type === 'lesson' && (
                                <>
                                    <EquationEditor
                                        active={!!activeField}
                                        onInsert={insertFormula}
                                    />
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ms-2">خلاصة (الحوصلة)</label>
                                        <textarea
                                            name="summary"
                                            defaultValue={modal.data?.summary}
                                            rows={3}
                                            onFocus={() => setActiveField('summary')}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ms-2">المسألة التطبيقية</label>
                                        <textarea
                                            name="application_problem"
                                            defaultValue={modal.data?.application_problem}
                                            rows={2}
                                            onFocus={() => setActiveField('application_problem')}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ms-2">نوع المختبر التفاعلي</label>
                                            <select
                                                name="lab_type"
                                                defaultValue={modal.data?.lab_type}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-500 transition-all font-bold"
                                            >
                                                <option value="">لا يوجد</option>
                                                <option value="equation">حلال المعادلات</option>
                                                <option value="geometry">المختبر الهندسي</option>
                                                <option value="transformation">التحويلات النقطية</option>
                                                <option value="scientific">الكتابة العلمية</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ms-2">إعدادات (JSON)</label>
                                            <input
                                                name="lab_config"
                                                defaultValue={modal.data?.lab_config ? JSON.stringify(modal.data.lab_config) : ''}
                                                placeholder='{"mode": "guided"}'
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-500 transition-all font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModal({ open: false })}
                                    className="px-8 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
