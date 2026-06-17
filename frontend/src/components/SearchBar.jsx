import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader, BookOpen, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const response = await axios.get(`/search?q=${query}`);
                    setResults(response.data.results);
                    setShowResults(true);
                } catch (error) {
                    console.error("Search error", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleResultClick = (url) => {
        setShowResults(false);
        setQuery('');
        navigate(url);
    };

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    placeholder="بحث عن دروس، أسئلة..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Loader size={18} className="text-indigo-500 animate-spin" />
                    </div>
                )}
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-96 overflow-y-auto">
                    <ul>
                        {results.map((result, index) => (
                            <li key={`${result.type}-${result.id}`} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <button
                                    onClick={() => handleResultClick(result.url)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-right"
                                >
                                    <div className="flex-shrink-0">
                                        {result.type === 'lesson' ? (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <BookOpen size={16} />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                                <MessageCircle size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {result.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {result.description}
                                        </p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showResults && results.length === 0 && !loading && (
                 <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    لا توجد نتائج
                </div>
            )}
        </div>
    );
};

export default SearchBar;
