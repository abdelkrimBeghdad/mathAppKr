import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'جاري التحميل...', fullScreen = true }) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 transition-all ${fullScreen ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : 'min-h-[400px]'}`}>
            <div className="relative">
                {/* Outer Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-primary-400/20 blur-3xl rounded-full"
                />

                {/* Main Spinner */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="w-20 h-20 border-4 border-slate-100 border-t-primary-500 rounded-full shadow-lg relative z-10"
                />

                {/* Inner Icon Overlay (Optional Math Symbol) */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center z-20"
                >
                    <span className="text-2xl font-black text-primary-500 font-sans select-none">π</span>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-center"
            >
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                    {message}
                </h2>
                <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -5, 0],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            className="w-2 h-2 bg-primary-400 rounded-full"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
