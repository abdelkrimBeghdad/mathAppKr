import React from 'react';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">سياسة الخصوصية</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-sm mt-1">تحديث: فبراير 2026</p>
                        </div>
                    </div>

                    <div className="space-y-10 rtl text-right">
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                                <Lock size={20} className="text-sky-500" />
                                التزامنا بالأمان
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                نحن في منصة النجاح نضع أمان بيانات تلاميذنا في المقام الأول. نستخدم أحدث تقنيات التشفير والبروتوكولات الأمنية لضمان بقاء معلوماتكم الشخصية وتفاصيل تقدمكم الدراسي محمية تماماً.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                                <Eye size={20} className="text-sky-500" />
                                البيانات التي نجمعها
                            </h2>
                            <ul className="space-y-3">
                                {[
                                    'الاسم والبريد الإلكتروني للتواصل وتخصيص التجربة.',
                                    'إحصائيات الدروس والنتائج لتحسين مسارك التعليمي.',
                                    'معلومات الجهاز لضمان أداء المنصة بشكل أمثل.',
                                    'التفاعلات في المنتدى لتعزيز بيئة تعلم تعاونية.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 font-medium">
                                        <CheckCircle size={18} className="text-emerald-500 mt-1 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">كيف نستخدم بياناتك؟</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                يتم استخدام بياناتك فقط لأداء وظائف المنصة الأساسية. نحن لا نقوم ببيع أو مشاركة بياناتك مع أي طرف ثالث لأغراض تسويقية. يتم تخزين البيانات بشكل آمن وتشفير كلمات المرور باستخدام أقوى الخوارزميات المتاحة.
                            </p>
                        </section>

                        <div className="pt-8 border-t dark:border-slate-800 flex flex-col items-center text-center">
                            <p className="text-slate-400 dark:text-slate-500 text-sm font-bold">لديك أسئلة حول بياناتك؟</p>
                            <a href="mailto:privacy@algeriamath.dz" className="mt-2 text-sky-500 font-black hover:underline underline-offset-4">
                                privacy@algeriamath.dz
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
