import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';

export default function Ruler({ onClose }) {
    const [rotation, setRotation] = useState(0);

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed top-1/4 left-1/4 z-[90] cursor-grab active:cursor-grabbing select-none"
            style={{ rotate: rotation + 'deg' }}
        >
            <div className="relative w-[500px] h-16 bg-amber-50/90 backdrop-blur-md border border-amber-200 rounded-lg shadow-2xl flex flex-col justify-end pb-1 overflow-hidden">
                {/* Control Panel */}
                <div className="absolute top-1 right-1 flex gap-1 z-10">
                    <button
                        onClick={() => setRotation(r => r + 15)}
                        className="p-1 bg-white/50 hover:bg-white rounded text-[10px] font-bold"
                    >
                        +15°
                    </button>
                    <button
                        onClick={onClose}
                        className="p-0.5 bg-rose-500 text-white rounded hover:bg-rose-600"
                    >
                        <X size={12} />
                    </button>
                </div>

                <div className="absolute top-1 left-2 text-[10px] font-bold text-amber-800 opacity-50">
                    <GripVertical size={14} />
                </div>

                {/* Ruler Marks */}
                <div className="flex items-end h-full px-4 relative">
                    {[...Array(51)].map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center flex-1"
                        >
                            <div className={`w-px bg-amber-900/40 ${i % 10 === 0 ? 'h-6' : i % 5 === 0 ? 'h-4' : 'h-2'}`} />
                            {i % 10 === 0 && (
                                <span className="text-[10px] font-bold text-amber-900 mt-1">{i / 10}</span>
                            )}
                        </div>
                    ))}
                    <div className="absolute top-0 right-4 text-[8px] font-black text-amber-900/20 uppercase tracking-widest mt-1">
                        cm - 4AM MATH
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
