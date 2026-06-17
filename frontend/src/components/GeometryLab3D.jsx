import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Text, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { X, Box, Circle, Cylinder as CylIcon, Triangle, Info } from 'lucide-react';
import clsx from 'clsx';

function Shape({ type, dimensions }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
        }
    });

    switch (type) {
        case 'box':
            return (
                <mesh ref={meshRef} castShadow receiveShadow>
                    <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
                    <meshStandardMaterial color="#0ea5e9" roughness={0.3} metalness={0.2} />
                </mesh>
            );
        case 'sphere':
            return (
                <mesh ref={meshRef} castShadow receiveShadow>
                    <sphereGeometry args={[dimensions.radius, 32, 32]} />
                    <meshStandardMaterial color="#f43f5e" roughness={0.3} metalness={0.2} />
                </mesh>
            );
        case 'cylinder':
            return (
                <mesh ref={meshRef} castShadow receiveShadow>
                    <cylinderGeometry args={[dimensions.radius, dimensions.radius, dimensions.height, 32]} />
                    <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.2} />
                </mesh>
            );
        case 'cone':
            return (
                <mesh ref={meshRef} castShadow receiveShadow>
                    <coneGeometry args={[dimensions.radius, dimensions.height, 32]} />
                    <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.2} />
                </mesh>
            );
        default:
            return null;
    }
}

export default function GeometryLab3D({ onClose, defaultShape = 'box' }) {
    const [shapeType, setShapeType] = useState(defaultShape);
    const [dimensions, setDimensions] = useState({
        width: 2, height: 2, depth: 2, radius: 1.5
    });

    const calculateVolume = () => {
        const { width, height, depth, radius } = dimensions;
        switch (shapeType) {
            case 'box': return (width * height * depth).toFixed(2);
            case 'sphere': return ((4 / 3) * Math.PI * Math.pow(radius, 3)).toFixed(2);
            case 'cylinder': return (Math.PI * Math.pow(radius, 2) * height).toFixed(2);
            case 'cone': return ((1 / 3) * Math.PI * Math.pow(radius, 2) * height).toFixed(2);
            default: return 0;
        }
    };

    const updateDim = (key, val) => {
        setDimensions(prev => ({ ...prev, [key]: parseFloat(val) }));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
            <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-lg hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                    <X size={24} />
                </button>

                {/* 3D Viewport */}
                <div className="flex-1 bg-slate-50 relative group">
                    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading 3D Engine...</div>}>
                        <Canvas shadows>
                            <PerspectiveCamera makeDefault position={[5, 5, 5]} />
                            <OrbitControls makeDefault minDistance={3} maxDistance={10} />

                            <Stage />
                            <Shape type={shapeType} dimensions={dimensions} />

                            <Environment preset="city" />
                            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#000000" />
                        </Canvas>
                    </Suspense>

                    <div className="absolute bottom-8 left-8 p-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white/40 shadow-xl">
                        <div className="text-[10px] font-black uppercase text-slate-500 mb-1">الحجم المحسوب</div>
                        <div className="text-3xl font-black text-slate-900">{calculateVolume()} <span className="text-lg opacity-40 italic">cm³</span></div>
                    </div>
                </div>

                {/* Controls Sidebar */}
                <div className="w-full md:w-96 border-l border-slate-100 p-8 flex flex-col gap-8 bg-white overflow-y-auto">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">المختبر الثلاثي الأبعاد 🧊</h2>
                        <p className="text-sm text-slate-500 font-medium">استكشف الأشكال الهندسية في الفضاء.</p>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { id: 'box', icon: Box, color: 'bg-sky-500' },
                            { id: 'sphere', icon: Circle, color: 'bg-rose-500' },
                            { id: 'cylinder', icon: CylIcon, color: 'bg-emerald-500' },
                            { id: 'cone', icon: Triangle, color: 'bg-amber-500' }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setShapeType(item.id)}
                                className={clsx(
                                    "aspect-square rounded-2xl flex items-center justify-center transition-all border-4",
                                    shapeType === item.id ? `border-${item.id === 'box' ? 'sky' : item.id === 'sphere' ? 'rose' : item.id === 'cylinder' ? 'emerald' : 'amber'}-200 ${item.color} text-white scale-110 shadow-lg` : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                                )}
                            >
                                <item.icon size={24} />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {(shapeType === 'box') && (
                            <>
                                <ControlRange label="العرض (w)" value={dimensions.width} min={1} max={4} onChange={(v) => updateDim('width', v)} />
                                <ControlRange label="الارتفاع (h)" value={dimensions.height} min={1} max={4} onChange={(v) => updateDim('height', v)} />
                                <ControlRange label="العمق (d)" value={dimensions.depth} min={1} max={4} onChange={(v) => updateDim('depth', v)} />
                            </>
                        )}
                        {(shapeType === 'sphere' || shapeType === 'cylinder' || shapeType === 'cone') && (
                            <ControlRange label="نصف القطر (r)" value={dimensions.radius} min={1} max={3} onChange={(v) => updateDim('radius', v)} />
                        )}
                        {(shapeType === 'cylinder' || shapeType === 'cone') && (
                            <ControlRange label="الارتفاع (h)" value={dimensions.height} min={1} max={4} onChange={(v) => updateDim('height', v)} />
                        )}
                    </div>

                    <div className="mt-auto p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 flex items-start gap-3">
                        <Info className="text-indigo-500 shrink-0" size={20} />
                        <p className="text-[11px] text-indigo-700 font-bold leading-relaxed">
                            يمكنك تدوير الشكل باستخدام الماوس، والتكبير والتصغير باستخدام العجلة لرؤية التفاصيل من جميع الزوايا.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function Stage() {
    return (
        <>
            <gridHelper args={[10, 10, '#cbd5e1', '#f1f5f9']} position={[0, -2, 0]} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
            <pointLight position={[-10, -10, -10]} />
        </>
    );
}

function ControlRange({ label, value, min, max, onChange }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-black text-slate-400">
                <span>{label}</span>
                <span>{value} cm</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step="0.1"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
        </div>
    );
}
