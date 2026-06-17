import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Plus, X, Award, Flame } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';

export default function PersonalGoalsWidget() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const { isDark } = useTheme();

    const [newGoal, setNewGoal] = useState({
        title: '',
        type: 'lessons',
        target: 5
    });

    const goalTypes = {
        lessons: { label: 'إكمال دروس', icon: Award, color: 'text-sky-500', bg: 'bg-sky-500' },
        xp: { label: 'جمع نقاط XP', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500' },
        battles: { label: 'الفوز بالمعارك', icon: Target, color: 'text-rose-500', bg: 'bg-rose-500' },
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const { data } = await api.get('/student/goals');
            setGoals(data);
        } catch (e) {
            console.error('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/student/goals', newGoal);
            setGoals([data, ...goals]);
            setIsCreating(false);
            setNewGoal({ title: '', type: 'lessons', target: 5 });
            toast.success('تمت إضافة الهدف بنجاح!');
        } catch (e) {
            toast.error('أخفق إنشاء الهدف.');
        }
    };

    const addProgress = async (goal) => {
        try {
            const { data } = await api.put(`/student/goals/${goal.id}/progress`, { progress_added: 1 });
            setGoals(goals.map(g => g.id === goal.id ? data : g));
            if (data.is_completed && !goal.is_completed) {
                toast.success('تهانينا! أكملت هدفك.');
            }
        } catch (e) {
            toast.error('لم نتمكن من تحديث التقدم');
        }
    };

    const deleteGoal = async (id) => {
        try {
            await api.delete(`/student/goals/${id}`);
            setGoals(goals.filter(g => g.id !== id));
            toast.success('تم الحذف');
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return null;

    return (
        <div className={clsx("rounded-[2.5rem] p-8 shadow-xl border relative overflow-hidden", isDark ? "bg-slate-900 border-slate-800 shadow-slate-900/50" : "bg-white border-slate-100 shadow-slate-200/50")}>
            <div className="flex items-center justify-between mb-8">
                <h3 className={clsx("text-xl font-black flex items-center gap-3", isDark ? "text-slate-100" : "text-slate-800")}>
                    <Target size={24} className="text-emerald-500" />
                    أهدافي الشخصية
                </h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors font-bold flex items-center gap-2 text-sm"
                >
                    <Plus size={18} /> هدف جديد
                </button>
            </div>

            <AnimatePresence>
                {isCreating && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleCreate}
                        className={clsx("mb-6 p-6 rounded-3xl border-2 space-y-4", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-emerald-100")}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-slate-500">إنشاء هدف جديد</span>
                            <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-rose-500">
                                <X size={18} />
                            </button>
                        </div>

                        <div>
                            <input
                                required
                                type="text"
                                placeholder="عنوان الهدف (مثال: إنهاء 5 دروس متتالية)"
                                className={clsx("w-full px-4 py-3 rounded-xl border-2 font-medium focus:ring-4 focus:outline-none transition-all", isDark ? "bg-slate-900 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20" : "bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20")}
                                value={newGoal.title}
                                onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <select
                                className={clsx("px-4 py-3 rounded-xl border-2 font-medium focus:ring-4 focus:outline-none transition-all", isDark ? "bg-slate-900 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20" : "bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20")}
                                value={newGoal.type}
                                onChange={e => setNewGoal({ ...newGoal, type: e.target.value })}
                            >
                                {Object.entries(goalTypes).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>

                            <input
                                required
                                type="number"
                                min="1"
                                placeholder="الهدف الرقمي (مثال: 5)"
                                className={clsx("px-4 py-3 rounded-xl border-2 font-medium focus:ring-4 focus:outline-none transition-all", isDark ? "bg-slate-900 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20" : "bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20")}
                                value={newGoal.target}
                                onChange={e => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 1 })}
                            />
                        </div>

                        <button type="submit" className="w-full py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                            حفظ الهدف الاّن!
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                {goals.length === 0 && !isCreating ? (
                    <div className="text-center py-8 text-slate-400 font-bold border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                        لم تحدد أي أهداف شخصية بعد. ابدأ الآن!
                    </div>
                ) : (
                    goals.map(goal => {
                        const typeInfo = goalTypes[goal.type] || goalTypes.lessons;
                        const progressPercent = Math.min((goal.progress / goal.target) * 100, 100);
                        const TypeIcon = typeInfo.icon;

                        return (
                            <motion.div
                                layout
                                key={goal.id}
                                className={clsx("p-5 rounded-3xl border-2 transition-all relative overflow-hidden group",
                                    goal.is_completed
                                        ? (isDark ? "bg-emerald-900/20 border-emerald-800" : "bg-emerald-50 border-emerald-100")
                                        : (isDark ? "bg-slate-800 border-slate-700 hover:border-slate-600" : "bg-white border-slate-100 hover:border-slate-200")
                                )}
                            >
                                <div className="flex items-start justify-between mb-3 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", typeInfo.bg, goal.is_completed && "opacity-50")}>
                                            <TypeIcon size={20} />
                                        </div>
                                        <div>
                                            <h4 className={clsx("font-bold text-base", isDark ? "text-slate-200" : "text-slate-700", goal.is_completed && "line-through opacity-70")}>{goal.title}</h4>
                                            <span className="text-[10px] font-black uppercase text-slate-400">{typeInfo.label}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {goal.is_completed && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-200 dark:border-emerald-800">
                                                <CheckCircle2 size={12} /> منجز
                                            </span>
                                        )}
                                        <button
                                            onClick={() => deleteGoal(goal.id)}
                                            className="w-8 h-8 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10 w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden mt-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        className={clsx("h-full rounded-full", goal.is_completed ? "bg-emerald-500" : typeInfo.bg)}
                                    />
                                </div>

                                <div className="flex justify-between items-center mt-2 text-[11px] font-black px-1 relative z-10">
                                    <span className="text-slate-400">{progressPercent.toFixed(0)}%</span>
                                    <span className={clsx(goal.is_completed ? "text-emerald-500" : "text-slate-500")}>
                                        {goal.progress} / {goal.target}
                                    </span>
                                </div>

                                {goal.is_completed && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/10 pointer-events-none">
                                        <CheckCircle2 size={120} />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
