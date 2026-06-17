import React from 'react';

// Base shimmer animation class
const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

export function SkeletonBlock({ className = '', rounded = 'rounded-2xl' }) {
    return (
        <div className={`bg-slate-200 dark:bg-slate-700 ${rounded} ${shimmer} ${className}`} />
    );
}

export function SkeletonText({ lines = 3, className = '' }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`h-3 bg-slate-200 dark:bg-slate-700 rounded-full ${shimmer} ${i === lines - 1 ? 'w-3/4' : 'w-full'
                        }`}
                />
            ))}
        </div>
    );
}

export function SkeletonCircle({ size = 'w-12 h-12' }) {
    return (
        <div className={`${size} bg-slate-200 dark:bg-slate-700 rounded-full ${shimmer}`} />
    );
}

export function SkeletonCard({ className = '' }) {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 ${className}`}>
            <div className="flex items-center gap-4 mb-6">
                <SkeletonCircle size="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <SkeletonBlock className="h-4 w-1/2" rounded="rounded-full" />
                    <SkeletonBlock className="h-3 w-1/3" rounded="rounded-full" />
                </div>
            </div>
            <SkeletonText lines={3} />
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300" dir="rtl">
            {/* Hero Skeleton */}
            <div className="bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
                <div className={`absolute inset-0 ${shimmer}`} />
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-6 relative z-10">
                        <SkeletonBlock className="h-10 w-2/3" rounded="rounded-xl" />
                        <SkeletonBlock className="h-5 w-1/2" rounded="rounded-lg" />
                        <div className="flex gap-4">
                            <SkeletonBlock className="h-14 w-32" rounded="rounded-2xl" />
                            <SkeletonBlock className="h-14 w-32" rounded="rounded-2xl" />
                            <SkeletonBlock className="h-14 w-32" rounded="rounded-2xl" />
                        </div>
                    </div>
                    <SkeletonBlock className="w-[250px] h-[200px]" rounded="rounded-[2rem]" />
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex justify-center">
                <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-[2rem] shadow-sm inline-flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <SkeletonBlock key={i} className={`h-10 ${i === 1 ? 'w-24 bg-sky-200 dark:bg-sky-800' : 'w-20'}`} rounded="rounded-full" />
                    ))}
                </div>
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <div className="space-y-6">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        </div>
    );
}

export function SkeletonLesson() {
    return (
        <div className="max-w-4xl mx-auto pb-16 animate-in fade-in duration-300" dir="rtl">
            {/* Header skeleton */}
            <div className="bg-slate-900 pt-10 pb-16 px-6 rounded-b-[3.5rem] mb-[-4rem]">
                <div className="max-w-2xl mx-auto space-y-4">
                    <SkeletonBlock className="h-4 w-32 mx-auto bg-white/10" rounded="rounded-full" />
                    <SkeletonBlock className="h-10 w-3/4 mx-auto bg-white/20" rounded="rounded-xl" />
                    <SkeletonBlock className="h-4 w-2/3 mx-auto bg-white/10" rounded="rounded-lg" />
                </div>
            </div>

            {/* Tabs skeleton */}
            <div className="max-w-3xl mx-auto px-4 mb-8">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-[2rem] shadow-lg flex justify-center gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 p-4">
                            <SkeletonCircle size="w-10 h-10" />
                            <SkeletonBlock className="h-3 w-12" rounded="rounded-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Content card skeleton */}
            <div className="px-4">
                <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-8">
                        <SkeletonBlock className="w-14 h-14" rounded="rounded-2xl" />
                        <SkeletonBlock className="h-8 w-48" rounded="rounded-xl" />
                    </div>
                    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] space-y-4">
                        <SkeletonBlock className="h-6 w-1/3" rounded="rounded-lg" />
                        <SkeletonText lines={4} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SkeletonForum() {
    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300" dir="rtl">
            {/* Header skeleton */}
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <SkeletonBlock className="h-8 w-48" rounded="rounded-xl" />
                    <SkeletonBlock className="h-4 w-72" rounded="rounded-lg" />
                </div>
                <SkeletonBlock className="h-12 w-36" rounded="rounded-xl" />
            </div>

            {/* Filter pills skeleton */}
            <div className="flex gap-2 mb-6">
                {[1, 2, 3].map(i => (
                    <SkeletonBlock key={i} className={`h-9 ${i === 1 ? 'w-20' : 'w-28'}`} rounded="rounded-full" />
                ))}
            </div>

            {/* Question cards skeleton */}
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 min-w-[80px]">
                            <SkeletonBlock className="h-14 w-16" rounded="rounded-lg" />
                            <SkeletonBlock className="h-14 w-16" rounded="rounded-lg" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <SkeletonBlock className="h-6 w-3/4" rounded="rounded-lg" />
                            <SkeletonText lines={2} />
                            <div className="flex items-center gap-3 mt-4">
                                <SkeletonCircle size="w-6 h-6" />
                                <SkeletonBlock className="h-3 w-24" rounded="rounded-full" />
                                <SkeletonBlock className="h-3 w-16" rounded="rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SkeletonDashboard;
