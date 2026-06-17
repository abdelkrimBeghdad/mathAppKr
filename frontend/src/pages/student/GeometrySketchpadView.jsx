import GeometrySketchpad from '../../components/GeometrySketchpad';
import { Compass, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function GeometrySketchpadView() {
    const { isDark } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-5xl mx-auto"
        >
            <div className={clsx("p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl", isDark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-100")}>
                <div className="w-16 h-16 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
                    <Compass size={32} />
                </div>
                <div>
                    <h1 className={clsx("text-3xl font-black mb-2", isDark ? "text-slate-100" : "text-slate-800")}>
                        كراسة الرسم الهندسي
                    </h1>
                    <p className={clsx("font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
                        أداة حرة لرسم الأشكال الهندسية، المستقيمات، والدوائر لتطبيق مبرهنات طالس وفيثاغورس.
                    </p>
                </div>
            </div>

            <div className={clsx("p-6 rounded-[2.5rem] text-sm flex items-start gap-4", isDark ? "bg-sky-900/20 text-sky-200 border border-sky-800" : "bg-sky-50 text-sky-800 border border-sky-100")}>
                <Info className="shrink-0 mt-0.5" />
                <p className="leading-relaxed font-bold">
                    يمكنك استخدام أدوات الرسم الحرة، رسم مستقيمات دقيقة، أو إنشاء دوائر بتحديد المركز ونقطة على المحيط. عند الانتهاء يمكنك تحميل الشكل بالضغط على أيقونة التحميل.
                </p>
            </div>

            <GeometrySketchpad />
        </motion.div>
    );
}
