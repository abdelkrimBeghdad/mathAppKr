import React, { useState, useEffect } from 'react';
import echo from '../../echo';
import api from '../../api/axios';
import { Users, AlertCircle, CheckCircle, HelpCircle, Activity, LayoutDashboard, Send, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveSessionBoard() {
    const [lessonId, setLessonId] = useState('');
    const [activeRoom, setActiveRoom] = useState(null);
    const [students, setStudents] = useState([]); // Array of connected students
    const [activities, setActivities] = useState([]); // List of recent actions

    const joinRoom = () => {
        if (!lessonId) return;
        if (activeRoom) {
            echo.leave(`lesson.${activeRoom}`);
        }

        const channel = echo.join(`lesson.${lessonId}`);

        channel.here((users) => {
            setStudents(users.filter(u => String(u.is_admin) !== '1' && u.is_admin !== true));
        })
            .joining((user) => {
                if (String(user.is_admin) !== '1' && user.is_admin !== true) {
                    setStudents(prev => {
                        const existing = prev.find(u => u.id === user.id);
                        if (existing) return prev;
                        return [...prev, user];
                    });
                    addActivity(user.name, 'دخل إلى قاعة الدرس', 'joined');
                }
            })
            .leaving((user) => {
                setStudents(prev => prev.filter(u => u.id !== user.id));
                addActivity(user.name, 'غادر قاعة الدرس', 'left');
            })
            .listen('.student.activity', (e) => {
                handleStudentActivity(e.user, e.type, e.payload);
            });

        setActiveRoom(lessonId);
    };

    const addActivity = (name, action, type) => {
        setActivities(prev => [{ id: Date.now() + Math.random(), name, action, type, time: new Date() }, ...prev].slice(0, 50));
    };

    const handleStudentActivity = (user, type, payload) => {
        let actionStr = '';
        let status = 'active';

        if (type === 'correct_answer') {
            actionStr = `أجاب بشكل صحيح ✔️`;
            status = 'correct';
        } else if (type === 'mistake') {
            actionStr = `أخطأ في الإجابة: ${payload.value || payload.answer || '؟'} ❌`;
            status = 'mistake';
        } else if (type === 'requested_hint') {
            actionStr = `طلب مساعدة / تلميح 💡`;
            status = 'hint';
        } else {
            actionStr = type;
        }

        addActivity(user.name, actionStr, type);

        setStudents(prev => {
            if (!prev.find(s => s.id === user.id)) {
                return [...prev, { ...user, lastStatus: status, lastAction: actionStr, updatedAt: new Date() }];
            }
            return prev.map(s => {
                if (s.id === user.id) {
                    return { ...s, lastStatus: status, lastAction: actionStr, updatedAt: new Date() };
                }
                return s;
            });
        });
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'correct': return 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-500/10 ring-1 ring-emerald-500/20';
            case 'mistake': return 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-500/10 ring-1 ring-rose-500/20';
            case 'hint': return 'bg-amber-50 border-amber-200 text-amber-800 shadow-amber-500/10 ring-1 ring-amber-500/20';
            default: return 'bg-white border-slate-100 text-slate-700 hover:border-sky-200 shadow-sm';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'correct': return <CheckCircle size={20} className="text-emerald-500" />;
            case 'mistake': return <AlertCircle size={20} className="text-rose-500" />;
            case 'hint': return <HelpCircle size={20} className="text-amber-500" />;
            default: return <Activity size={20} className="text-sky-400 opacity-50" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">

            {/* Glassmorphism Header */}
            <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-sky-500/20 text-white relative overflow-hidden flex flex-col items-start gap-4">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 blur-[80px] rounded-full pointer-events-none" />

                <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 relative z-10 w-full mb-2">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/20">
                        <LayoutDashboard size={32} />
                    </div>
                    غرفة التحكم المباشرة
                </h1>
                <p className="text-sky-100 font-medium text-lg relative z-10">
                    راقب تفاعل طلابك مع مختبرات الذكاء، وقدم التوجيه الفوري في الوقت المناسب.
                </p>

                {/* Connection Box */}
                <div className="w-full max-w-xl bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 flex gap-2 mt-4 relative z-10 shadow-lg">
                    <input
                        type="number"
                        value={lessonId}
                        onChange={e => setLessonId(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && joinRoom()}
                        className="flex-1 bg-white rounded-xl px-5 py-3 text-slate-800 font-black outline-none placeholder-slate-400 text-lg text-center"
                        placeholder="رقم الدرس (مثال: 12)"
                        dir="ltr"
                    />
                    <button
                        onClick={joinRoom}
                        disabled={!lessonId}
                        className="px-8 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:bg-slate-500 text-white font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                        <Users size={20} />
                        اتصال
                    </button>
                </div>
            </div>

            {activeRoom && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">

                    {/* Students Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                            <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                                <span className="relative flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                                </span>
                                الطلاب المتصلون حالياً
                            </h2>
                            <div className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 border border-slate-200">
                                درس <span dir="ltr" className="font-black text-sky-600">#{activeRoom}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {students.map(student => (
                                    <motion.div
                                        key={student.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${getStatusStyles(student.lastStatus)}`}
                                    >
                                        <div className="absolute top-0 right-0 w-2 h-full bg-black/5" />

                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-xl text-slate-700">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-lg line-clamp-1">{student.name}</div>
                                                        <div className="text-xs opacity-75 font-bold mt-0.5 flex items-center gap-1" dir="ltr">
                                                            {student.updatedAt ? student.updatedAt.toLocaleTimeString() : 'الآن'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/50 p-2 rounded-xl backdrop-blur-sm">
                                                    {getStatusIcon(student.lastStatus)}
                                                </div>
                                            </div>

                                            <div className="bg-white/50 p-3 rounded-xl backdrop-blur-sm mt-1">
                                                <div className="text-sm font-bold min-h-[1.5rem] flex items-center">
                                                    {student.lastAction || 'يتصفح الدرس...'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <button className="text-xs font-black px-4 py-2 bg-white/60 hover:bg-white rounded-lg transition-colors flex items-center gap-2 border border-black/5 hover:border-black/10 hover:shadow-sm">
                                                <Zap size={14} className="text-amber-500 fill-amber-500" /> تشجيع
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {students.length === 0 && (
                                <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center gap-4">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                        <Users size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-700 mb-2">القاعة فارغة</h3>
                                        <p className="font-medium text-slate-500">لا يوجد طلاب يدرسون هذا المحور حالياً. راقب ظهورهم هنا فور اتصالهم.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Feed Sidebar */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 h-[600px] flex flex-col sticky top-24">
                        <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                            <Activity size={24} className="text-sky-500" />
                            السجل الحي للأنشطة
                        </h2>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {activities.map(act => (
                                    <motion.div
                                        key={act.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-sm p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100"
                                    >
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <span className="font-black text-sky-700 text-base">{act.name}</span>
                                            <span className="text-[10px] font-bold bg-white text-slate-500 px-2 py-1 rounded-lg border border-slate-100" dir="ltr">
                                                {act.time.toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="text-slate-600 font-medium">
                                            {act.action}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {activities.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-3 opacity-60">
                                    <Activity size={32} />
                                    <span className="font-bold">المحطة هادئة...</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
