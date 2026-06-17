import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ArrowRight, Star, AlertCircle, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const PersonalizedPath = () => {
    const { data: recommendations = [], isLoading, isError } = useQuery({
        queryKey: ['learningPath'],
        queryFn: async () => {
            const response = await api.get('/learning-path');
            return response.data;
        }
    });

    if (isLoading) return (
        <div className="mt-12 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-3xl"></div>)}
            </div>
        </div>
    );

    if (isError) return null;
    
    // Explicitly check for empty array to help debugging
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
        console.log("No recommendations found or not an array:", recommendations);
        return null;
    }

    const colorClasses = {
        rose: 'border-rose-100 hover:border-rose-500 bg-rose-50/30 text-rose-600 shadow-rose-500/10',
        indigo: 'border-indigo-100 hover:border-indigo-500 bg-indigo-50/30 text-indigo-600 shadow-indigo-500/10',
        amber: 'border-amber-100 hover:border-amber-500 bg-amber-50/30 text-amber-600 shadow-amber-500/10',
    };

    const buttonClasses = {
        rose: 'bg-rose-500 shadow-rose-500/30 hover:bg-rose-600',
        indigo: 'bg-indigo-500 shadow-indigo-500/30 hover:bg-indigo-600',
        amber: 'bg-amber-500 shadow-amber-500/30 hover:bg-amber-600',
    };

    return (
        <section className="mt-12" dir="rtl">
            <div className="flex items-center gap-4 mb-8 px-2">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
                    <Sparkles size={24} className="animate-spin-slow" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">مسارك التعليمي المخصص</h2>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">تحليل ذكي لمستواك لاقتراح أفضل الخطوات</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {recommendations.map((rec, index) => (
                    <motion.div
                        key={rec.lesson.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2rem] border-2 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between min-h-[240px]
                            ${colorClasses[rec.color] || colorClasses.indigo}`}
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm
                                    ${rec.type === 'remedial' ? 'bg-rose-100 text-rose-600 border border-rose-200/50' :
                                      rec.type === 'next' ? 'bg-indigo-100 text-indigo-600 border border-indigo-200/50' :
                                      'bg-amber-100 text-amber-600 border border-amber-200/50'}`}>
                                    {rec.badge}
                                </span>
                                {rec.type === 'remedial' && (
                                    <div className="bg-rose-50 p-1.5 rounded-full">
                                        <AlertCircle size={16} className="text-rose-500 animate-pulse" />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-3 leading-tight group-hover:text-sky-600 transition-colors">
                                {rec.lesson.name}
                            </h3>
                            
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                                {rec.reason}
                            </p>
                        </div>

                        <div className="relative z-10 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                            <Link
                                to={`/student/lessons/${rec.lesson.id}`}
                                className={`flex items-center justify-between w-full px-5 py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-lg
                                    ${buttonClasses[rec.color] || buttonClasses.indigo}`}
                            >
                                <span>ابدأ الدرس الآن</span>
                                <ArrowRight size={18} className="-rotate-180 transform group-hover:translate-x-[-4px] transition-transform" />
                            </Link>
                        </div>

                        {/* Background subtle decoration */}
                        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl" />
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default PersonalizedPath;
