import { useState } from 'react';
import { Target, CheckCircle, Gift, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import confetti from 'canvas-confetti';

export default function DailyQuestsWidget() {
    const { isDark } = useTheme();
    const addXp = useAuthStore(state => state.addXp);
    const addCoins = useAuthStore(state => state.addCoins);

    // Mock quests for gamification presentation
    const [quests, setQuests] = useState([
        { id: 1, title: 'حل 5 تمارين الجبر', max: 5, current: 3, reward: { xp: 50, coins: 10 }, claimed: false },
        { id: 2, title: 'الفوز بمعركة واحدة', max: 1, current: 1, reward: { xp: 100, coins: 25 }, claimed: false },
        { id: 3, title: 'تسجيل الدخول', max: 1, current: 1, reward: { xp: 20, coins: 5 }, claimed: true }
    ]);

    const handleClaim = (quest) => {
        if (quest.current < quest.max || quest.claimed) return;

        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
        });

        toast.success(`أحسنت! حصلت على ${quest.reward.xp} XP و ${quest.reward.coins} ذهبة`);

        // Update global state
        if (addXp) addXp(quest.reward.xp);
        if (addCoins) addCoins(quest.reward.coins);

        // Update local state
        setQuests(quests.map(q => q.id === quest.id ? { ...q, claimed: true } : q));
    };

    return (
        <div className={clsx(
            "rounded-[2.5rem] p-8 shadow-xl border relative overflow-hidden",
            isDark ? "bg-indigo-900/20 border-indigo-800/50" : "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100"
        )}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className={clsx("text-xl font-black flex items-center gap-3", isDark ? "text-indigo-300" : "text-indigo-800")}>
                    <Sparkles size={24} className="text-amber-500" />
                    المهام اليومية
                </h3>
                <div className={clsx("px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5", isDark ? "bg-indigo-900/50 text-indigo-300" : "bg-white text-indigo-600 shadow-sm")}>
                    <Target size={14} />
                    <span>{quests.filter(q => q.current >= q.max && !q.claimed).length} متاحة</span>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <AnimatePresence>
                    {quests.map(quest => {
                        const isComplete = quest.current >= quest.max;
                        const progressPercent = (quest.current / quest.max) * 100;

                        return (
                            <motion.div
                                layout
                                key={quest.id}
                                className={clsx(
                                    "p-4 rounded-2xl border-2 transition-all",
                                    quest.claimed
                                        ? (isDark ? "bg-slate-800/50 border-slate-700 opacity-60" : "bg-slate-50 border-slate-200 opacity-70")
                                        : isComplete
                                            ? (isDark ? "bg-indigo-900/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "bg-white border-indigo-300 shadow-lg shadow-indigo-200/50")
                                            : (isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-100")
                                )}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                                            quest.claimed ? "bg-slate-200 text-slate-400 dark:bg-slate-700" :
                                                isComplete ? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white" :
                                                    "bg-indigo-100 text-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-400"
                                        )}>
                                            {quest.claimed ? <CheckCircle size={20} /> : <Gift size={20} />}
                                        </div>
                                        <div>
                                            <h4 className={clsx("font-bold text-sm md:text-base", isDark ? "text-slate-200" : "text-slate-800", quest.claimed && "line-through")}>
                                                {quest.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 rounded">+ {quest.reward.xp} XP</span>
                                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 rounded">+ {quest.reward.coins} ذهب</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isComplete && !quest.claimed ? (
                                        <button
                                            onClick={() => handleClaim(quest)}
                                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-black rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
                                        >
                                            استلام المكافأة!
                                        </button>
                                    ) : (
                                        <div className={clsx("text-xs font-black", quest.claimed ? "text-slate-400" : "text-indigo-500")}>
                                            {quest.current} / {quest.max}
                                        </div>
                                    )}
                                </div>

                                {!quest.claimed && (
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            className={clsx(
                                                "h-full rounded-full transition-all duration-1000",
                                                isComplete ? "bg-indigo-500" : "bg-indigo-400"
                                            )}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
