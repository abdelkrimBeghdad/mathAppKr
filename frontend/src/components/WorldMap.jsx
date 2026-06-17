import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Lock, CheckCircle2, Star, Mountain, Waves, Landmark } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const regions = [
    { id: 1, name: 'وادي الأعداد', color: 'from-sky-400 to-sky-600', icon: Mountain, x: '20%', y: '30%' },
    { id: 2, name: 'هضبة الهندسة', color: 'from-emerald-400 to-emerald-600', icon: Landmark, x: '60%', y: '50%' },
    { id: 3, name: 'جزيرة الإحصاء', color: 'from-amber-400 to-amber-600', icon: Waves, x: '40%', y: '80%' },
];

export default function WorldMap({ fields }) {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    return (
        <div className={`relative w-full aspect-[16/9] rounded-[3rem] overflow-hidden border-8 shadow-2xl p-4 md:p-12 transition-colors duration-500 ${isDark ? 'bg-slate-900 border-slate-800 shadow-slate-900/50' : 'bg-slate-100 border-white shadow-slate-200/50'}`}>
            {/* Map Texture/Background */}
            <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-[0.05]' : 'opacity-20'}`} />
            <div className={`absolute inset-0 bg-gradient-to-tr transition-colors duration-500 ${isDark ? 'from-slate-900 to-indigo-900/20' : 'from-sky-50 to-indigo-50/30'}`} />

            {/* Path SVG */}
            <svg className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-10' : 'opacity-20'}`}>
                <path d="M 20 30 Q 40 10, 60 50 T 40 80" fill="none" stroke={isDark ? '#334155' : '#94a3b8'} strokeWidth="4" strokeDasharray="12 12" />
            </svg>

            {fields.map((field, idx) => {
                const region = regions[idx] || regions[0];
                return (
                    <motion.div
                        key={field.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.2 }}
                        style={{ left: region.x, top: region.y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                    >
                        <div className="relative group cursor-pointer">
                            {/* Region Label */}
                            <div className={`absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-2xl shadow-xl border opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                <span className={`font-black text-sm ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{field.name}</span>
                            </div>

                            {/* Node Icon */}
                            <div className={clsx(
                                "w-20 h-20 rounded-[2.5rem] bg-gradient-to-br flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110 relative z-10 p-4 border-4",
                                region.color,
                                isDark ? "border-slate-800 shadow-sky-900/30" : "border-white shadow-sky-500/30"
                            )}>
                                <region.icon size={36} />
                            </div>

                            {/* Decorative Rings */}
                            <div className={`absolute inset-0 rounded-[2.5rem] blur-xl animate-pulse -z-10 ${isDark ? 'bg-sky-900/30' : 'bg-sky-400/20'}`} />

                            {/* Lessons List on Hover */}
                            <div className={`absolute top-24 left-1/2 -translate-x-1/2 w-64 rounded-[2rem] shadow-2xl border p-6 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-30 pointer-events-none group-hover:pointer-events-auto ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                <h4 className="font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest mb-4">المحاور التعليمية</h4>
                                <div className="space-y-4">
                                    {field.sections?.map(section => (
                                        <div key={section.id} className="space-y-2">
                                            <div className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{section.name}</div>
                                            <div className="space-y-1">
                                                {section.lessons?.map(lesson => (
                                                    <div
                                                        key={lesson.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!lesson.is_locked || lesson.status !== 'locked') {
                                                                navigate(`/student/lessons/${lesson.id}`);
                                                            }
                                                        }}
                                                        className={clsx(
                                                            "flex items-center justify-between p-2 rounded-xl transition-colors text-[11px] font-bold",
                                                            lesson.status === 'locked' && lesson.is_locked
                                                                ? (isDark ? "text-slate-600 bg-slate-900/30" : "text-slate-300 bg-slate-50 cursor-not-allowed")
                                                                : (isDark ? "text-slate-300 bg-slate-900/50 hover:bg-sky-950 hover:text-sky-400" : "text-slate-600 bg-slate-50 hover:bg-sky-50 hover:text-sky-600 cursor-pointer")
                                                        )}
                                                    >
                                                        <span>{lesson.name}</span>
                                                        {lesson.status === 'completed' ? (
                                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                                        ) : lesson.status === 'locked' && lesson.is_locked ? (
                                                            <Lock size={12} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                                                        ) : (
                                                            <Star size={12} className="text-sky-400" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
