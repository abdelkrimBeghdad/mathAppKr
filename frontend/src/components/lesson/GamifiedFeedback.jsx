import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Flame, Star, Zap, Trophy, Target } from 'lucide-react';
import clsx from 'clsx';
import confetti from 'canvas-confetti';

/**
 * نظام المكافآت والملاحظات المُلعبة
 */

// --- مكوّن XP العائم ---
export function XPPopup({ amount, x = '50%', y = '50%' }) {
    return (
        <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -80, scale: 1.2 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ left: x, top: y }}
            className="fixed z-[200] pointer-events-none"
        >
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-lg shadow-2xl shadow-amber-500/40">
                <Zap size={18} className="fill-white" />
                <span>+{amount} XP</span>
            </div>
        </motion.div>
    );
}

// --- مكوّن عدّاد السلسلة ---
export function StreakBadge({ streak, animate = false }) {
    if (streak <= 0) return null;

    return (
        <motion.div
            initial={animate ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-sm',
                streak >= 5
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-red-500/30'
                    : streak >= 3
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
            )}
        >
            <span className={clsx(streak >= 3 && 'animate-streak-fire inline-block')}>🔥</span>
            <span>×{streak}</span>
        </motion.div>
    );
}

// --- مكوّن شارة الإنجاز ---
export function AchievementBadge({ id, title, icon, show }) {
    const ACHIEVEMENTS = {
        first_try: { title: 'من المحاولة الأولى!', icon: '🎯', color: 'sky' },
        streak_3: { title: 'سلسلة ثلاثية!', icon: '🔥', color: 'amber' },
        streak_5: { title: 'سلسلة خماسية!', icon: '⚡', color: 'orange' },
        no_hints: { title: 'بدون تلميحات!', icon: '🧠', color: 'violet' },
        perfect: { title: 'بلا أخطاء!', icon: '💎', color: 'emerald' },
        speed: { title: 'سريع البرق!', icon: '⏱️', color: 'rose' },
    };

    const config = ACHIEVEMENTS[id] || { title: title || id, icon: icon || '🏆', color: 'sky' };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.3, rotate: -12 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[200]"
                >
                    <div className={clsx(
                        'px-6 py-2 rounded-2xl border-2 shadow-2xl flex items-center gap-4',
                        `bg-${config.color}-50 dark:bg-${config.color}-500/15`,
                        `border-${config.color}-200 dark:border-${config.color}-500/40`,
                        `shadow-${config.color}-500/20`
                    )}>
                        <span className="text-2xl animate-achievement-pop">{config.icon}</span>
                        <div>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">🏆 إنجاز جديد!</p>
                            <p className={`font-black text-lg text-${config.color}-700 dark:text-${config.color}-300`}>
                                {config.title}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// --- شاشة الاحتفال بإكمال الدرس ---
export function LessonCompleteOverlay({
    show,
    stats,
    onContinue,
    onQuiz,
}) {
    useEffect(() => {
        if (show) {
            // ألعاب نارية كبيرة!
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'],
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'],
                });

                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
        }
    }, [show]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[1rem] shadow-2xl p-8 text-center space-y-6 border-2 border-slate-100 dark:border-slate-700"
                    >
                        {/* أيقونة الاحتفال */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                            className="text-xl"
                        >
                            🎊
                        </motion.div>

                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                            أحسنت! أكملت الدرس 🎉
                        </h2>

                        {/* إحصائيات */}
                        {stats && (
                            <div className="grid grid-cols-2 gap-3">
                                <StatCard icon={<Zap size={20} />} label="XP مكتسبة" value={stats.xpEarned} color="amber" />
                                <StatCard icon={<Target size={20} />} label="الدقة" value={`${stats.accuracy}%`} color="emerald" />
                                <StatCard icon={<Flame size={20} />} label="أطول سلسلة" value={stats.maxStreak} color="orange" />
                                <StatCard icon={<Star size={20} />} label="التلميحات" value={stats.hintsUsed} color="sky" />
                            </div>
                        )}

                        {/* الأزرار */}
                        <div className="space-y-3 pt-2">
                            {onQuiz && (
                                <button
                                    onClick={onQuiz}
                                    className="w-full px-6 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
                                >
                                    <Trophy size={22} />
                                    ابدأ الاختبار واكسب XP 🚀
                                </button>
                            )}

                            <button
                                onClick={onContinue}
                                className="w-full px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                            >
                                العودة للوحة القيادة
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// --- بطاقة إحصائية صغيرة ---
function StatCard({ icon, label, value, color }) {
    return (
        <div className={clsx(
            'p-3 rounded-xl border',
            `bg-${color}-50 dark:bg-${color}-500/10`,
            `border-${color}-200/60 dark:border-${color}-500/30`
        )}>
            <div className={`text-${color}-500 mb-1 flex justify-center`}>{icon}</div>
            <p className={`text-xl font-black text-${color}-600 dark:text-${color}-400`}>{value}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    );
}

// --- مكوّن GamifiedFeedback الكامل ---
export default function GamifiedFeedback({ children }) {
    const [xpPopups, setXpPopups] = useState([]);
    const [activeAchievement, setActiveAchievement] = useState(null);

    const showXP = useCallback((amount) => {
        const id = Date.now();
        setXpPopups(prev => [...prev, { id, amount }]);
        setTimeout(() => {
            setXpPopups(prev => prev.filter(p => p.id !== id));
        }, 1600);
    }, []);

    const showAchievement = useCallback((achievementId) => {
        setActiveAchievement(achievementId);
        setTimeout(() => setActiveAchievement(null), 3500);
    }, []);

    return (
        <>
            {/* XP popups */}
            <AnimatePresence>
                {xpPopups.map(popup => (
                    <XPPopup key={popup.id} amount={popup.amount} />
                ))}
            </AnimatePresence>

            {/* Achievement banner */}
            <AchievementBadge id={activeAchievement} show={!!activeAchievement} />

            {/* Render children with gamification context */}
            {typeof children === 'function'
                ? children({ showXP, showAchievement })
                : children}
        </>
    );
}
