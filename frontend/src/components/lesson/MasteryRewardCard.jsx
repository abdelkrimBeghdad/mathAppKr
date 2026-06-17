import React from 'react';
import { motion } from 'framer-motion';
import { Award, Coins, Zap as ZapIcon } from 'lucide-react';

export default function MasteryRewardCard({ reward }) {
    if (!reward) return null;

    return (
        <div className="w-full">
            {/* Reward Summary */}
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="mt-6 flex gap-4 justify-center">
                <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full border border-amber-500/30">
                    <Coins size={18} /> <span className="font-bold">+{reward.reward.coins}</span>
                </div>
                <div className="flex items-center gap-2 bg-sky-500/20 text-sky-400 px-4 py-2 rounded-full border border-sky-500/30">
                    <ZapIcon size={18} /> <span className="font-bold">+{reward.reward.xp} XP</span>
                </div>
            </motion.div>

            {/* Badge Earned Card */}
            {reward?.badge && (
                <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="mt-4 bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-indigo-400 p-6 rounded-[1rem] shadow-[0_0_30px_rgba(129,140,248,0.3)] text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[40px] rounded-full" />
                    <Award className="text-indigo-400 w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                    <h3 className="text-xl font-black text-white mb-2 underline decoration-indigo-500 underline-offset-4">وسام جديد!</h3>
                    <div className="text-2xl font-black text-indigo-300">{reward.badge.name}</div>
                    <p className="text-slate-400 mt-2 text-sm">{reward.badge.description}</p>
                </motion.div>
            )}
        </div>
    );
}
