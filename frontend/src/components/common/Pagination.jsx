import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const pages = [];
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, currentPage + 2);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const pages = getVisiblePages();

    return (
        <div className="flex items-center justify-center gap-2 mt-8 dir-rtl" dir="rtl">
            {/* Previous */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all font-bold disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-700"
            >
                <ChevronRight size={18} />
            </button>

            {/* First page + ellipsis */}
            {pages[0] > 1 && (
                <>
                    <button
                        onClick={() => onPageChange(1)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300"
                    >
                        1
                    </button>
                    {pages[0] > 2 && (
                        <span className="text-slate-400 font-bold px-1">…</span>
                    )}
                </>
            )}

            {/* Visible pages */}
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all text-sm font-black ${page === currentPage
                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 scale-110'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-700'
                        }`}
                >
                    {page}
                </button>
            ))}

            {/* Last page + ellipsis */}
            {pages[pages.length - 1] < totalPages && (
                <>
                    {pages[pages.length - 1] < totalPages - 1 && (
                        <span className="text-slate-400 font-bold px-1">…</span>
                    )}
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            {/* Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all font-bold disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-700"
            >
                <ChevronLeft size={18} />
            </button>
        </div>
    );
}
