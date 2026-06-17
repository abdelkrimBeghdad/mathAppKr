import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Award, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BaseLabLayout
 * A highly controlled, no-scroll layout for all mastery labs.
 * Ensures strict pedagogical focus, responsive scaling, and immersive "cyber-pedagogical" aesthetics.
 * 
 * Props:
 * - title (string): Lab title
 * - score (number): Current mastery score or points
 * - progress (number): 0-100 percentage
 * - stepsPanel (ReactNode): The side panel content (e.g. StepRevealer)
 * - controls (ReactNode): The bottom bar actions
 * - children (ReactNode): The main interactive canvas
 * - onExit (function): Optional custom exit handler, defaults to navigate(-1)
 */
export default function BaseLabLayout({ 
  title, 
  score = 0, 
  progress = 0, 
  stepsPanel, 
  controls, 
  children,
  onExit
}) {
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const handleExit = () => {
        if (onExit) {
            onExit();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className={`fixed inset-0 overflow-hidden flex flex-col z-[100] ${isDark ? 'bg-[#05050A] text-slate-100' : 'bg-[#e8edf5] text-slate-900'} selection:bg-sky-500/30 font-sans`} dir="rtl">
            
            {/* Ultra Premium Animated Mesh Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large colorful orbs for mesh gradient */}
                <motion.div 
                    animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute top-[-15%] right-[-8%] w-[900px] h-[900px] rounded-full blur-[100px] ${isDark ? 'bg-sky-600/15' : 'bg-sky-300/70'}`} 
                />
                <motion.div 
                    animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute top-[15%] left-[-12%] w-[1100px] h-[1100px] rounded-full blur-[130px] ${isDark ? 'bg-indigo-600/15' : 'bg-indigo-300/60'}`} 
                />
                <motion.div 
                    animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute bottom-[-12%] right-[5%] w-[900px] h-[900px] rounded-full blur-[110px] ${isDark ? 'bg-purple-600/15' : 'bg-violet-300/60'}`} 
                />
                <motion.div 
                    animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute top-[35%] right-[30%] w-[700px] h-[700px] rounded-full blur-[120px] ${isDark ? 'bg-teal-600/10' : 'bg-cyan-200/50'}`} 
                />
                <motion.div 
                    animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute bottom-[20%] left-[20%] w-[500px] h-[500px] rounded-full blur-[100px] ${isDark ? 'bg-rose-600/8' : 'bg-pink-200/40'}`} 
                />

                {/* Subtle dot grid pattern for depth */}
                <div className={`absolute inset-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.015]'}`}
                    style={{
                        backgroundImage: `radial-gradient(circle, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Premium Frosted Header */}
            <header className={`h-[72px] shrink-0 flex items-center justify-between px-8 border-b ${isDark ? 'bg-[#05050A]/50 border-white/[0.06]' : 'bg-white/30 border-white/50'} backdrop-blur-[50px] z-20`}>
                <div className="flex items-center gap-4 w-1/3">
                    <button 
                        onClick={handleExit}
                        className={`p-2.5 rounded-2xl transition-all active:scale-90 ${isDark ? 'hover:bg-white/5 text-slate-500 hover:text-rose-400' : 'hover:bg-black/5 text-slate-400 hover:text-rose-500'}`}
                        title="خروج"
                    >
                        <X size={22} strokeWidth={2.5} />
                    </button>
                    <h1 className={`text-lg lg:text-xl font-black tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h1>
                </div>

                {/* Premium Progress Bar (Center) */}
                <div className="flex-1 max-w-sm flex flex-col gap-1.5 mx-6 hidden md:flex">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em] font-bold">
                        <span className={isDark ? 'text-sky-400' : 'text-sky-600'}>التقدم</span>
                        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{progress}%</span>
                    </div>
                    <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`}>
                        <motion.div 
                            className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 rounded-full relative overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {/* Shimmer effect on progress bar */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" 
                                style={{ animationDuration: '2s', backgroundSize: '200% 100%' }}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Gamification Badge (Left in RTL) */}
                <div className="flex items-center justify-end gap-3 w-1/3">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-black transition-all cursor-default ${isDark ? 'bg-white/[0.06] text-sky-400 border border-white/[0.06]' : 'bg-white/50 text-sky-600 border border-white/60 shadow-sm'} backdrop-blur-xl`}
                    >
                        <Sparkles size={16} className="text-amber-400 fill-amber-400" />
                        <span>{score}</span>
                        <span className={`hidden lg:inline ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>نقطة</span>
                    </motion.div>
                </div>
            </header>

            {/* Mobile Progress Bar */}
            <div className={`md:hidden h-1 w-full shrink-0 ${isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`}>
                <motion.div 
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* 2. Main Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
                
                {/* Steps Panel (Side for Desktop, Top for Mobile) */}
                {stepsPanel && (
                    <aside className={`w-full lg:w-80 xl:w-[420px] shrink-0 border-b lg:border-b-0 lg:border-l ${isDark ? 'bg-[#0A0A10]/30 border-white/[0.04]' : 'bg-white/25 border-white/50'} backdrop-blur-[50px] z-10 flex flex-col relative`}>
                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8">
                            {stepsPanel}
                        </div>
                    </aside>
                )}

                {/* Canvas Area (Central & Primary) */}
                <main className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden">
                    {/* Content Area */}
                    <div className="relative z-10 w-full h-full flex flex-col p-4 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Premium Controls Footer */}
            {controls && (
                <footer className={`shrink-0 p-5 lg:p-7 border-t ${isDark ? 'bg-[#05050A]/50 border-white/[0.06]' : 'bg-white/30 border-white/50'} backdrop-blur-[50px] z-20`}>
                    <div className="max-w-4xl mx-auto w-full flex items-center justify-center gap-4">
                        {controls}
                    </div>
                </footer>
            )}

            {/* CSS Animation for shimmer */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
