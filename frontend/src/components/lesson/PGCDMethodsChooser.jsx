import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Grip, LayoutGrid, ArrowRight, Play } from 'lucide-react';

import PGCDDiscovery from './PGCDDiscovery';
import PGCDSubtraction from './PGCDSubtraction';
import EuclideanAlgorithm from './EuclideanAlgorithm';

export default function PGCDMethodsChooser() {
    const [numA, setNumA] = useState(3356);
    const [numB, setNumB] = useState(1528);
    const [selectedMethod, setSelectedMethod] = useState(null);

    const methods = [
        {
            id: 'discovery',
            title: 'إيجاد القواسم المشتركة',
            description: 'نبحث عن قواسم كل عدد ثم نحدد القواسم المشتركة لنستخرج الأكبر. مناسبة للأعداد الصغيرة.',
            icon: <LayoutGrid className="w-8 h-8 text-emerald-500" />,
            color: 'emerald',
            component: PGCDDiscovery
        },
        {
            id: 'subtraction',
            title: 'الفروق المتتالية',
            description: 'نعتمد على عمليات الطرح المتتالية (العدد الأكبر ناقص العدد الأصغر) حتى نصل إلى الصفر.',
            icon: <Grip className="w-8 h-8 text-sky-500" />,
            color: 'sky',
            component: PGCDSubtraction
        },
        {
            id: 'euclidean',
            title: 'خوارزمية إقليدس',
            description: 'طريقة القسمة الإقليدية. سريعة جداً ومناسبة للأعداد الكبيرة جداً.',
            icon: <Calculator className="w-8 h-8 text-violet-500" />,
            color: 'violet',
            component: EuclideanAlgorithm
        }
    ];

    const handleMethodSelect = (methodId) => {
        let a = parseInt(numA);
        let b = parseInt(numB);

        // Validation
        if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
            alert('يرجى إدخال أعداد طبيعية أكبر من الصفر.');
            return;
        }

        // Ensure A is always greater than or equal to B for the algorithms
        if (b > a) {
            const temp = a;
            a = b;
            b = temp;
            setNumA(a);
            setNumB(b);
        }

        setSelectedMethod(methodId);
    };

    if (selectedMethod) {
        const MethodComponent = methods.find(m => m.id === selectedMethod)?.component;
        const colorClass = methods.find(m => m.id === selectedMethod)?.color;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
                dir="rtl"
            >
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setSelectedMethod(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl shadow-sm hover:shadow transition-all border border-slate-200 dark:border-slate-600"
                    >
                        <ArrowRight size={18} />
                        اختر طريقة أخرى
                    </button>
                    <div className="text-lg font-black text-slate-700 dark:text-slate-200">
                        PGCD({numA}, {numB})
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 md:p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                    {MethodComponent && (
                        selectedMethod === 'discovery' ? (
                            <MethodComponent a={parseInt(numA)} b={parseInt(numB)} />
                        ) : (
                            <MethodComponent initialA={parseInt(numA)} initialB={parseInt(numB)} />
                        )
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-8"
            dir="rtl"
        >
            <div className="text-center space-y-4">
                <h2 className="text-xl font-black text-slate-800 dark:text-white">حساب القاسم المشترك الأكبر</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">اختر العددين والمنهجية التي تفضل التدرب عليها.</p>
            </div>

            {/* Input Section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 md:p-5 shadow-xl border border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">العدد الأول (A)</label>
                        <input
                            type="number"
                            value={numA}
                            onChange={(e) => setNumA(e.target.value)}
                            className="w-full text-center text-xl font-black text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-2 focus:border-sky-500 dark:focus:border-sky-500 transition-colors outline-none"
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">العدد الثاني (B)</label>
                        <input
                            type="number"
                            value={numB}
                            onChange={(e) => setNumB(e.target.value)}
                            className="w-full text-center text-xl font-black text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-2 focus:border-sky-500 dark:focus:border-sky-500 transition-colors outline-none"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>

            {/* Methods Selection Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {methods.map((method, index) => (
                    <motion.div
                        key={method.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleMethodSelect(method.id)}
                        className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border-2 border-slate-100 dark:border-slate-700 hover:border-${method.color}-500 dark:hover:border-${method.color}-500 transition-all cursor-pointer group hover:-translate-y-2 flex flex-col justify-between h-full`}
                    >
                        <div className="space-y-4">
                            <div className={`w-16 h-16 rounded-2xl bg-${method.color}-50 dark:bg-${method.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                {method.icon}
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                {method.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                {method.description}
                            </p>
                        </div>
                        
                        <div className={`mt-6 w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-${method.color}-500 group-hover:text-white transition-colors self-end`}>
                            <Play className="w-5 h-5 fill-current" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
