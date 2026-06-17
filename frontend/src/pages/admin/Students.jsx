import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { User, Mail, Shield, Trash2, Edit2, Plus, X, Check, Lock, Unlock } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function StudentManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const [progressOpen, setProgressOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userProgress, setUserProgress] = useState([]);
    const [curriculum, setCurriculum] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, curriculumRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/fields')
            ]);
            setUsers(usersRes.data);
            setCurriculum(curriculumRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/admin/users/${editingUser.id}`, formData);
            } else {
                await api.post('/admin/users', formData);
            }
            setModalOpen(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '' });
            fetchData();
        } catch (e) {
            alert(e.response?.data?.message || 'Error saving user');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const openProgress = async (user) => {
        setSelectedUser(user);
        setProgressOpen(true);
        try {
            const { data } = await api.get(`/admin/users/${user.id}/progress`);
            setUserProgress(data);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleLessonStatus = async (lessonId, currentStatus) => {
        const statuses = ['locked', 'unlocked', 'completed'];
        const currentIndex = statuses.indexOf(currentStatus);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        try {
            await api.put(`/admin/users/${selectedUser.id}/progress/${lessonId}`, { status: nextStatus });
            // Update local state for immediate feedback
            setUserProgress(prev => {
                const existing = prev.find(p => p.lesson_id === lessonId);
                if (existing) {
                    return prev.map(p => p.lesson_id === lessonId ? { ...p, status: nextStatus } : p);
                }
                return [...prev, { lesson_id: lessonId, status: nextStatus }];
            });
        } catch (e) {
            console.error(e);
        }
    };

    if (loading && users.length === 0) return (
        <LoadingScreen message="جاري تحميل قائمة الطلاب..." />
    );

    return (
        <div className="space-y-6 md:space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">إدارة الطلاب</h1>
                    <p className="text-sm md:text-base text-gray-500">إضافة، تعديل، ومتابعة تقدم الطلاب.</p>
                </div>
                <button
                    onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', password: '', phone: '', parent_phone: '', school: '', wilaya: '', birth_date: '', grade_level: '' }); setModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-md font-bold transition-all transform active:scale-95"
                >
                    <Plus size={20} /> إضافة طالب
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold">
                            <th className="px-6 py-4 text-sm">المستخدم</th>
                            <th className="px-6 py-4 text-sm">السنة / الولاية</th>
                            <th className="px-6 py-4 text-sm">الهاتف</th>
                            <th className="px-6 py-4 text-sm text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                                            {u.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm">
                                    {u.grade_level || 'غير محدد'} / {u.wilaya || '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm">
                                    <div className="text-xs">طالب: {u.phone || '-'}</div>
                                    <div className="text-xs text-primary-500">ولي: {u.parent_phone || '-'}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => openProgress(u)}
                                            className="px-3 py-1.5 bg-sky-50 text-sky-600 rounded-lg text-xs font-bold hover:bg-sky-100 transition-colors"
                                        >
                                            التقدم
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingUser(u);
                                                setFormData({
                                                    name: u.name,
                                                    email: u.email,
                                                    password: '',
                                                    phone: u.phone || '',
                                                    parent_phone: u.parent_phone || '',
                                                    school: u.school || '',
                                                    wilaya: u.wilaya || '',
                                                    birth_date: u.birth_date || '',
                                                    grade_level: u.grade_level || ''
                                                });
                                                setModalOpen(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">{editingUser ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">الاسم الكامل</label>
                                    <input required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-right"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
                                    <input required type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-left"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">رقم هاتف الطالب</label>
                                    <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-left"
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">رقم هاتف الولي</label>
                                    <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-left"
                                        value={formData.parent_phone} onChange={e => setFormData({ ...formData, parent_phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">تاريخ الميلاد</label>
                                    <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.birth_date} onChange={e => setFormData({ ...formData, birth_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">السنة الدراسية</label>
                                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.grade_level} onChange={e => setFormData({ ...formData, grade_level: e.target.value })}>
                                        <option value="">اختر السنة</option>
                                        <option value="4AM">رابعة متوسط (4AM)</option>
                                        <option value="3AM">ثالثة متوسط (3AM)</option>
                                        <option value="2AM">ثانية متوسط (2AM)</option>
                                        <option value="1AM">أولى متوسط (1AM)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">الولاية</label>
                                    <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-right"
                                        value={formData.wilaya} onChange={e => setFormData({ ...formData, wilaya: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">المدرسة</label>
                                    <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-right"
                                        value={formData.school} onChange={e => setFormData({ ...formData, school: e.target.value })} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور {editingUser && '(اترك فارغاً للحفاظ على الحالية)'}</label>
                                    <input type="password" required={!editingUser} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-left"
                                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-all">
                                {editingUser ? 'تحديث البيانات' : 'إنشاء حساب طالب'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Progress Management Sidebar */}
            {progressOpen && selectedUser && (
                <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-white shadow-2xl border-r border-gray-100 flex flex-col animate-in slide-in-from-left duration-300">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">التقدم: {selectedUser.name}</h2>
                            <p className="text-sm text-gray-500">التحكم في الوصول إلى الدروس.</p>
                        </div>
                        <button onClick={() => setProgressOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {curriculum.map(field => (
                            <div key={field.id} className="space-y-3">
                                <h3 className="font-bold text-primary-600 uppercase text-xs tracking-widest">{field.name}</h3>
                                {field.sections?.map(section => (
                                    <div key={section.id} className="space-y-2">
                                        <h4 className="text-sm font-bold text-gray-700">{section.name}</h4>
                                        <div className="space-y-1">
                                            {section.lessons?.map(lesson => {
                                                const prog = userProgress.find(p => p.lesson_id === lesson.id);
                                                const status = prog?.status || 'locked';

                                                return (
                                                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                        <span className="text-xs font-medium text-gray-700">{lesson.name}</span>
                                                        <button
                                                            onClick={() => toggleLessonStatus(lesson.id, status)}
                                                            className={`flex flex-row-reverse items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                                                status === 'unlocked' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                                                    'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                                }`}
                                                        >
                                                            {status === 'completed' ? <Check size={10} /> : (status === 'unlocked' ? <Unlock size={10} /> : <Lock size={10} />)}
                                                            <span className="mr-1">{status === 'completed' ? 'مكتمل' : (status === 'unlocked' ? 'مفتوح' : 'مغلق')}</span>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
