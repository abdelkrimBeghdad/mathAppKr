import React, { useEffect, useState, lazy, Suspense, useRef, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AITutorWidget from '../../components/AITutorWidget';
import StepRevealer from '../../components/StepRevealer';
import DivisorDiscovery from '../../components/lesson/DivisorDiscovery';
import DivisorPropertiesLab from '../../components/lesson/DivisorPropertiesLab';
import PGCDDiscovery from '../../components/lesson/PGCDDiscovery';
import PGCDSubtraction from '../../components/lesson/PGCDSubtraction';
import EuclideanAlgorithm from '../../components/lesson/EuclideanAlgorithm';
import PGCDMethodsChooser from '../../components/lesson/PGCDMethodsChooser';
import CoprimeLab from '../../components/lesson/CoprimeLab';
import FractionSimplifyLab from '../../components/lesson/FractionSimplifyLab';
import RootsLab from '../../components/lesson/RootsLab';
import RootsSimplificationLab from '../../components/lesson/RootsSimplificationLab';
import RootsMultiplicationLab from '../../components/lesson/RootsMultiplicationLab';
import RootsDivisionLab from '../../components/lesson/RootsDivisionLab';
import RootsAdditionLab from '../../components/lesson/RootsAdditionLab';
import RootsSubtractionLab from '../../components/lesson/RootsSubtractionLab';
import RootsExpressionLab from '../../components/lesson/RootsExpressionLab';
import RationalRootsLab from '../../components/lesson/RationalRootsLab';
import PowersLab from '../../components/lesson/PowersLab';
import ScientificNotationLab from '../../components/lesson/ScientificNotationLab';
import EquationsLab from '../../components/lesson/EquationsLab';
import EquationsProductLab from '../../components/lesson/EquationsProductLab';
import InequalitiesSolveLab from '../../components/lesson/InequalitiesSolveLab';
import InequalitiesGraphLab from '../../components/lesson/InequalitiesGraphLab';
import IdentitiesLab from '../../components/lesson/IdentitiesLab';
import FactorizationLab from '../../components/lesson/FactorizationLab';
import WordProblemsLab from '../../components/lesson/InteractiveMathLesson';
import SystemsLab from '../../components/lesson/SystemsLab';
import SystemsGraphLab from '../../components/lesson/SystemsGraphLab';
import TrigonometryLab from '../../components/lesson/TrigNamingLab';
import TrigRelationsLab from '../../components/lesson/TrigIdentitiesLab';
import VectorsLab from '../../components/lesson/VecConceptLab';
import VectorCoordinatesLab from '../../components/lesson/VecReadLab';
import MidpointDistanceLab from '../../components/lesson/VecMidpointLab';
import LinearImageLab from '../../components/lesson/LinearImageLab';
import LinearGraphLab from '../../components/lesson/LinearGraphLab';
import LinearFormulaLab from '../../components/lesson/LinearFormulaLab';
import AffineImageLab from '../../components/lesson/AffineImageLab';
import AffineGraphLab from '../../components/lesson/AffineGraphLab';
import AffineFormulaLab from '../../components/lesson/AffineFormulaLab';
import ThalesLab from '../../components/lesson/ThalesInteractiveLab';
import PythagorasLab from '../../components/lesson/PythVisualProofLab';
import RotationLab from '../../components/lesson/RotationMasteryLab';
import RegularPolygonsLab from '../../components/lesson/GeoSolidsLab';
import ProbabilityLab from '../../components/lesson/ProbabilityMasteryLab';
import Calculator from '../../components/Calculator';
import Ruler from '../../components/Ruler';
import { SkeletonLesson } from '../../components/SkeletonLoader';
import MathText from '../../components/MathText';
import SEO from '../../components/common/SEO';
import PremiumLock from '../../components/common/PremiumLock';
import echo from '../../echo';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, ArrowLeft, Lightbulb, Calculator as CalcIcon, PenTool, MousePointer2,
    ClipboardCheck, Layers, Box, TrendingUp, BarChart2, Sparkles, MessageSquare,
    Sigma, Navigation, RefreshCw, Ruler as RulerIcon, X, Loader2,
    CheckCircle, XCircle, BookOpen, Brain, Zap, ChevronLeft, ChevronRight, ChevronDown, List, FolderOpen,
    Trophy, FlaskConical, Star, Clock
} from 'lucide-react';

// Lazy loaded heavy components
const QuizModal = lazy(() => import('../../components/QuizModal'));
const GeometryLab = lazy(() => import('../../components/GeometryLab'));
const MathLab = lazy(() => import('../../components/MathLab'));
const GeometryLab3D = lazy(() => import('../../components/GeometryLab3D'));
const FunctionGrapher = lazy(() => import('../../components/FunctionGrapher'));
const StatisticsGrapher = lazy(() => import('../../components/StatisticsGrapher'));
const EquationSolver = lazy(() => import('../../components/EquationSolver'));
const VectorLab = lazy(() => import('../../components/VectorLab'));
const TransformationLab = lazy(() => import('../../components/TransformationLab'));
const NotationConverter = lazy(() => import('../../components/NotationConverter'));

const TABS = [
    { id: 'summary',     label: 'الملخص',    icon: BookOpen,      color: 'sky'    },
    { id: 'example',     label: 'المثال',     icon: FlaskConical,  color: 'violet' },
    { id: 'application', label: 'التطبيق',    icon: Brain,         color: 'rose'   },
    { id: 'quiz',        label: 'الاختبار',   icon: Trophy,        color: 'amber'  },
];

const LAB_BUTTONS = [
    { type: 'geometry_3d',       label: 'فتح المختبر ثلاثي الأبعاد 🧊', color: 'rose',    stateSetter: 'setShowGeo3D'      },
    { type: 'geometry_3d_sphere', label: 'فتح مختبر الكرة ⚽', color: 'rose', stateSetter: 'setShowGeo3D' },
    { type: 'geometry_3d_cylinder', label: 'فتح مختبر الأسطوانة 🧴', color: 'emerald', stateSetter: 'setShowGeo3D' },
    { type: 'geometry_3d_cone', label: 'فتح مختبر المخروط 🍦', color: 'amber', stateSetter: 'setShowGeo3D' },
    { type: 'math_lab',          label: 'فتح مختبر الرياضيات 🔬',        color: 'indigo',  stateSetter: 'setShowMathLab'   },
    { type: 'geometry_2d',       label: 'فتح مختبر الهندسة ✏️',          color: 'amber',   stateSetter: 'setShowLab'       },
    { type: 'function_grapher',  label: 'فتح راسم الدوال 📈',            color: 'emerald', stateSetter: 'setShowGrapher'   },
    { type: 'statistics_grapher',label: 'فتح مختبر الإحصاء 📊',          color: 'amber',   stateSetter: 'setShowStats'     },
    { type: 'equation_solver',   label: 'فتح حلال المعادلات ∑',          color: 'purple',  stateSetter: 'setShowEquation'  },
    { type: 'vector_lab',        label: 'فتح مختبر الأشعة 🧭',           color: 'cyan',    stateSetter: 'setShowVector'    },
    { type: 'transformation_lab',label: 'فتح مختبر التحويلات 🔄',        color: 'pink',    stateSetter: 'setShowTransform' },
    { type: 'notation_converter',label: 'فتح محول الكتابة العلمية 🔢',   color: 'orange',  stateSetter: 'setShowNotation'  },
];

function LessonLabContent({ lesson, setters }) {
    const lt = lesson.lab_type;
    const name = lesson.name || '';

    if (lt === 'divisor_discovery') return <DivisorDiscovery target={36} />;
    if (lt === 'divisor_properties') return <DivisorPropertiesLab />;
    if (lt === 'pgcd_discovery' || lt === 'pgcd_subtraction' || lt === 'euclidean_algorithm' || lt === 'pgcd_all' || (lt === 'math_lab' && name.includes('PGCD'))) return <PGCDMethodsChooser />;
    if (lt === 'coprime_lab') return <CoprimeLab />;
    if (lt === 'fraction_simplify') return <FractionSimplifyLab />;
    if (lt === 'roots_lab') return <RootsLab />;
    if (lt === 'roots_simplification') return <RootsSimplificationLab />;
    if (lt === 'roots_multiplication') return <RootsMultiplicationLab />;
    if (lt === 'roots_division') return <RootsDivisionLab />;
    if (lt === 'roots_addition') return <RootsAdditionLab />;
    if (lt === 'roots_subtraction') return <RootsSubtractionLab />;
    if (lt === 'roots_expression') return <RootsExpressionLab />;
    if (lt === 'rational_roots') return <RationalRootsLab />;
    if (lt === 'powers_lab') return <PowersLab />;
    if (lt === 'scientific_notation') return <ScientificNotationLab />;
    if (lt === 'equations_lab') return <EquationsLab />;
    if (lt === 'equations_product_lab') return <EquationsProductLab />;
    if (lt === 'inequalities_lab') return <InequalitiesSolveLab />;
    if (lt === 'inequalities_graph_lab') return <InequalitiesGraphLab />;
    if (lt === 'identities_lab') return <IdentitiesLab />;
    if (lt === 'factorization_lab') return <FactorizationLab />;
    if (lt === 'word_problems_lab') return <WordProblemsLab />;
    if (lt === 'systems_lab') return <SystemsLab />;
    if (lt === 'systems_graph_lab') return <SystemsGraphLab />;
    if (lt === 'trigonometry_lab') return <TrigonometryLab lessonId={lesson.id} />;
    if (lt === 'trig_relations_lab') return <TrigRelationsLab lessonId={lesson.id} />;
    if (lt === 'vectors_lab') return <VectorsLab lessonId={lesson.id} />;
    if (lt === 'vector_coords_lab') return <VectorCoordinatesLab lessonId={lesson.id} />;
    if (lt === 'midpoint_distance_lab') return <MidpointDistanceLab lessonId={lesson.id} />;
    if (lt === 'linear_functions' || lt === 'linear_image') return <LinearImageLab />;
    if (lt === 'linear_graph') return <LinearGraphLab />;
    if (lt === 'linear_formula') return <LinearFormulaLab />;
    if (lt === 'affine_functions' || lt === 'affine_image') return <AffineImageLab />;
    if (lt === 'affine_graph') return <AffineGraphLab />;
    if (lt === 'affine_formula') return <AffineFormulaLab />;
    if (lt === 'thales_lab') return <ThalesLab />;
    if (lt === 'pythagoras_lab') return <PythagorasLab />;
    if (lt === 'rotation_lab') return <RotationLab />;
    if (lt === 'regular_polygons_lab') return <RegularPolygonsLab />;
    if (lt === 'probability_lab') return <ProbabilityLab />;

    // Labs that open as overlays — show a big launch button in the Example tab
    const labBtn = LAB_BUTTONS.find(b => b.type === lt);
    if (labBtn) {
        const openFn = setters?.[labBtn.stateSetter];
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
                <div className={`w-24 h-24 rounded-3xl bg-${labBtn.color}-100 dark:bg-${labBtn.color}-900/30 flex items-center justify-center text-5xl shadow-inner`}>
                    🔬
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">مختبر تفاعلي</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">انقر على الزر لفتح المختبر التفاعلي الخاص بهذا الدرس.</p>
                </div>
                {openFn && (
                    <button
                        onClick={() => openFn(true)}
                        className={`px-10 py-4 bg-${labBtn.color}-500 hover:bg-${labBtn.color}-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-${labBtn.color}-500/30 transition-all hover:-translate-y-1 active:translate-y-0`}
                    >
                        {labBtn.label}
                    </button>
                )}
            </div>
        );
    }

    if (lesson.example_steps) return <StepRevealer steps={lesson.example_steps} />;
    return null;
}


export default function LessonView() {
    const { lessonId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answer, setAnswer] = useState('');
    const [showSolution, setShowSolution] = useState(false);
    const [showCalc, setShowCalc] = useState(false);
    const [showRuler, setShowRuler] = useState(false);
    const [showLab, setShowLab] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showMathLab, setShowMathLab] = useState(false);
    const [showGeo3D, setShowGeo3D] = useState(false);
    const [showGrapher, setShowGrapher] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showEquation, setShowEquation] = useState(false);
    const [showVector, setShowVector] = useState(false);
    const [showTransform, setShowTransform] = useState(false);
    const [showNotation, setShowNotation] = useState(false);
    const [lockedContent, setLockedContent] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');
    const [answerFeedback, setAnswerFeedback] = useState(null);
    const [currentProblem, setCurrentProblem] = useState(null);
    const [problemsPool, setProblemsPool] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [prevLesson, setPrevLesson] = useState(null);
    const [nextLesson, setNextLesson] = useState(null);
    const [learningStructure, setLearningStructure] = useState([]);
    const [showCourseIndex, setShowCourseIndex] = useState(false);
    const [currentContext, setCurrentContext] = useState({ field: '', section: '' });

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                // Fetch current lesson
                const { data } = await api.get(`/student/lessons/${lessonId}`);
                setLesson(data);
                setLockedContent(null);
                setCurrentProblem({
                    text: data.application_problem,
                    solution: data.application_solution,
                    explanation: data.application_hint,
                    isInitial: true
                });
                setProblemsPool(data.questions || []);

                // Fetch all lessons to get prev/next
                api.get('/student/structure').then(({ data: fieldsData }) => {
                    const allLessons = [];
                    fieldsData.forEach(field => {
                        field.sections.forEach(sec => {
                            sec.lessons.forEach(l => {
                                allLessons.push({ ...l, fieldName: field.name });
                            });
                        });
                    });
                    const curIdx = allLessons.findIndex(l => l.id == lessonId);
                    if (curIdx > 0) setPrevLesson(allLessons[curIdx - 1]);
                    else setPrevLesson(null);
                    
                    if (curIdx > -1 && curIdx < allLessons.length - 1) setNextLesson(allLessons[curIdx + 1]);
                    else setNextLesson(null);

                    // Find current field and section for breadcrumbs
                    fieldsData.forEach(field => {
                        field.sections.forEach(sec => {
                            if (sec.lessons.find(l => l.id == lessonId)) {
                                setCurrentContext({ field: field.name, section: sec.name });
                            }
                        });
                    });

                    setLearningStructure(fieldsData);
                }).catch(err => console.error('Failed to load sibling lessons', err));

            } catch (err) {
                if (err.response?.status === 403 && err.response?.data?.error === 'CONTENT_LOCKED') {
                    setLockedContent(err.response.data);
                } else {
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [lessonId]);

    const handleUnlocked = () => {
        setLockedContent(null);
        setLoading(true);
        api.get(`/student/lessons/${lessonId}`).then(({ data }) => {
            setLesson(data);
            setCurrentProblem({ 
                text: data.application_problem, 
                solution: data.application_solution, 
                explanation: data.application_hint,
                isInitial: true 
            });
            setProblemsPool(data.questions || []);
            setLoading(false);
        });
    };

    useEffect(() => {
        if (location.state?.startQuiz) setShowQuiz(true);
    }, [location.state]);

    useEffect(() => {
        if (!lessonId) return;
        echo.join(`lesson.${lessonId}`);
        return () => echo.leave(`lesson.${lessonId}`);
    }, [lessonId]);

    const normalizeAnswer = (str) => {
        if (!str) return '';
        return str.toString()
            .replace(/\s+/g, '')
            .replace(/[،;]/g, ',')
            .replace(/[\{\}\[\]\(\)\.\$\\]/g, '')
            .replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 0x0660)
            .replace(/[\u06f0-\u06f9]/g, d => d.charCodeAt(0) - 0x06f0)
            .toLowerCase()
            .trim();
    };

    const checkAnswer = () => {
        if (!currentProblem) return;
        const studentNorm = normalizeAnswer(answer);
        const solutionNorm = normalizeAnswer(currentProblem.solution || currentProblem.correct_answer);
        const isMatch = studentNorm !== '' && solutionNorm !== '' && studentNorm === solutionNorm;
        setAnswerFeedback(isMatch ? 'correct' : 'wrong');
        setShowSolution(true);
    };

    const handleTrySimilar = () => {
        if (problemsPool.length === 0) return;
        const randomIndex = Math.floor(Math.random() * problemsPool.length);
        const nextProblem = problemsPool[randomIndex];
        const newPool = [...problemsPool];
        newPool.splice(randomIndex, 1);
        setAnswer('');
        setAnswerFeedback(null);
        setShowSolution(false);
        setShowHint(false);
        setProblemsPool(newPool);
        setCurrentProblem({
            text: nextProblem.question_text,
            solution: nextProblem.correct_answer,
            explanation: nextProblem.explanation,
            isInitial: false
        });
    };

    const scrollToTabs = () => {
        setTimeout(() => {
            const el = document.getElementById('lesson-content-area');
            if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 100);
    };

    const goToNextTab = () => {
        const idx = TABS.findIndex(t => t.id === activeTab);
        if (idx < TABS.length - 1) {
            setActiveTab(TABS[idx + 1].id);
            scrollToTabs();
        }
    };
    const goToPrevTab = () => {
        const idx = TABS.findIndex(t => t.id === activeTab);
        if (idx > 0) {
            setActiveTab(TABS[idx - 1].id);
            scrollToTabs();
        }
    };

    if (loading) return <SkeletonLesson />;

    if (lockedContent) return (
        <div className="max-w-4xl mx-auto py-20 px-4">
            <PremiumLock
                resourceInfo={{ id: lessonId, type: 'lesson', price: lockedContent.price }}
                onUnlocked={handleUnlocked}
            />
        </div>
    );

    if (!lesson) return <div>Lesson not found</div>;

    const activeTabIdx = TABS.findIndex(t => t.id === activeTab);
    const colorMap = { sky: 'sky', violet: 'violet', rose: 'rose', amber: 'amber' };

    return (
        <div className="max-w-4xl mx-auto pb-16 space-y-0" dir="rtl">
            <SEO title={lesson.name} description={lesson.summary} keywords={`${lesson.name}, رياضيات, سنة رابعة متوسط`} />

            {/* Header - Ultra Premium Focus Mode */}
            <div className="bg-[#0B1528] pt-12 pb-24 px-4 sm:px-6 rounded-b-[4rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)] mb-[-5rem] relative overflow-hidden transition-all duration-700 border-b border-sky-500/20">
                {/* Advanced Background Textures & Glows */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/10 blur-[120px] rounded-[100%] pointer-events-none animate-pulse" />
                
                {/* Floating Math Symbols for Vibe */}
                <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 left-[15%] text-sky-500/20 text-4xl font-serif pointer-events-none">∑</motion.div>
                <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-40 right-[10%] text-indigo-500/20 text-5xl font-serif pointer-events-none">π</motion.div>
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-40 right-[20%] text-fuchsia-500/10 text-6xl font-serif pointer-events-none">√</motion.div>

                <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex flex-col items-center gap-4 mb-8"
                    >
                        <Link to="/student" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-all font-bold text-xs group bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg hover:shadow-white/5">
                            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                            العودة للوحة القيادة
                        </Link>
                        
                        {currentContext.field && (
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-sky-400 opacity-60">
                                    <span>{currentContext.field}</span>
                                    <ChevronRight size={10} />
                                    <span>{currentContext.section}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                                        <Zap size={10} />
                                        مستوى: سهل
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                                        <Clock size={10} />
                                        15 دقيقة
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Lesson Title Focus Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1, type: "spring", bounce: 0.3 }}
                        className="relative max-w-3xl mx-auto mb-10 group"
                    >
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-500/40 via-indigo-500/40 to-purple-500/40 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-70 transition duration-700 animate-pulse" />
                        <div className="relative bg-[#101a30]/60 backdrop-blur-2xl border border-white/10 py-12 px-10 rounded-[2.5rem] shadow-2xl overflow-hidden group-hover:border-white/20 transition-all duration-500">
                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-500/20 to-transparent opacity-50 -mr-12 -mt-12 rounded-full blur-2xl" />
                            
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-50 to-indigo-100 leading-tight mb-6 tracking-tight drop-shadow-sm">
                                <MathText text={lesson.name} />
                            </h1>
                            <div className="w-20 h-1.5 bg-gradient-to-r from-sky-500 to-indigo-500 mx-auto rounded-full mb-8 opacity-90 shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
                            <p className="text-slate-300 text-base md:text-xl font-medium leading-relaxed opacity-95 max-w-2xl mx-auto drop-shadow-sm">
                                <MathText text={lesson.summary} />
                            </p>
                        </div>
                    </motion.div>

                    {learningStructure.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                            <button 
                                onClick={() => setShowCourseIndex(true)}
                                className="inline-flex items-center gap-3 mx-auto bg-gradient-to-r from-sky-500/10 to-indigo-500/10 hover:from-sky-500/20 hover:to-indigo-500/20 text-sky-200 border border-sky-400/30 px-8 py-3.5 rounded-full font-black transition-all shadow-[0_0_30px_rgba(14,165,233,0.15)] hover:shadow-[0_0_40px_rgba(14,165,233,0.3)] hover:-translate-y-1 active:translate-y-0 group backdrop-blur-md relative overflow-hidden"
                            >
                                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="w-9 h-9 rounded-full bg-sky-500/20 flex items-center justify-center group-hover:bg-sky-500/40 group-hover:scale-110 transition-all duration-300 shadow-inner">
                                    <List size={18} className="text-sky-300 group-hover:text-white transition-colors" />
                                </div>
                                <span className="tracking-wide group-hover:text-white transition-colors text-sm sm:text-base">تصفح فهرس الدروس</span>
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Lesson Progress Tracker - Floating Dots */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                    {TABS.map((tab, i) => {
                        const activeIdx = TABS.findIndex(t => t.id === activeTab);
                        return (
                            <div 
                                key={tab.id} 
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                    i <= activeIdx ? 'w-8 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.6)]' : 'w-2 bg-white/20'
                                }`}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Tab Navigation */}
            <div id="lesson-content-area" className="max-w-3xl mx-auto px-4 relative z-20">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white/20 dark:border-slate-700/50 flex justify-center">
                    <div className="grid grid-cols-4 w-full">
                        {TABS.map((tab, idx) => {
                            const Icon = tab.icon;
                            const isActive = tab.id === activeTab;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        scrollToTabs();
                                    }}
                                    className={`relative flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-[1.5rem] transition-all duration-500 ${
                                        isActive
                                            ? 'text-slate-900 dark:text-white transform scale-105 z-10'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activePill"
                                            className="absolute inset-0 bg-white dark:bg-slate-700 rounded-[1.5rem] shadow-lg border border-slate-100 dark:border-slate-600"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? `bg-gradient-to-br from-${tab.color}-400 to-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-500/30 scale-110` : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className={`relative z-10 text-xs font-black tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tab Content Area */}
            <div className="px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {/* ── TAB 1: SUMMARY ── */}
                        {activeTab === 'summary' && (
                            <div className="space-y-8 pb-10">
                                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-white dark:border-slate-700/50 p-8 md:p-15 relative overflow-hidden group min-h-[400px] flex flex-col text-right">
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/5 rounded-full blur-[80px] group-hover:bg-sky-500/10 transition-all duration-700" />
                                    
                                    <div className="flex items-center gap-5 mb-10 relative z-10">
                                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 group-hover:scale-110 transition-transform duration-500">
                                            <BookOpen size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">حوصلة الدرس</h2>
                                            <div className="h-1.5 w-16 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full mt-2" />
                                        </div>
                                    </div>

                                    <div className="flex-1 relative z-10 p-8 md:p-12 bg-sky-50/40 dark:bg-sky-900/10 border-r-8 border-sky-400 rounded-[2.5rem] shadow-inner mb-10">
                                        <div className="absolute top-0 left-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                                            <Sigma size={180} />
                                        </div>
                                        <div className="relative z-10 prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-strong:text-sky-600 dark:prose-strong:text-sky-400 prose-p:text-slate-800 dark:prose-p:text-slate-100 prose-p:font-black">
                                            <MathText text={lesson.summary} className="block" />
                                        </div>
                                    </div>

                                    <div className="relative z-10 mt-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-indigo-500/20 overflow-hidden group/mission">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover/mission:scale-110 transition-transform duration-700" />
                                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl animate-bounce">🎯</div>
                                            <div className="flex-1">
                                                <h4 className="text-2xl font-black mb-2 tracking-tight">مهمتك اليوم</h4>
                                                <p className="text-indigo-50 text-base md:text-lg opacity-90 leading-relaxed">السيطرة التامة على {lesson.name.replace(/\$/g,'')} من خلال التدريبات العملية.</p>
                                            </div>
                                            <button onClick={() => { setActiveTab('example'); scrollToTabs(); }} className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-slate-50 transition-all hover:-translate-x-2 active:scale-95 shrink-0">ابدأ التدريب</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB 2: EXAMPLE ── */}
                        {activeTab === 'example' && (
                            <div className="space-y-8 pb-10 text-right">
                                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-white dark:border-slate-700/50 p-8 md:p-15">
                                    <div className="flex items-center gap-5 mb-10">
                                        <div className="w-16 h-16 rounded-[2rem] bg-violet-500/10 flex items-center justify-center text-violet-500 shadow-inner">
                                            <FlaskConical size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">مثال توضيحي</h2>
                                            <div className="h-1.5 w-16 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full mt-2" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-10">
                                        {lesson.example_problem && (
                                            <div className="p-10 bg-violet-50/40 dark:bg-violet-900/10 border-r-8 border-violet-400 rounded-[2.5rem] relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                                                    <Lightbulb size={180} />
                                                </div>
                                                <div className="relative z-10 text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 leading-relaxed">
                                                    <MathText text={lesson.example_problem} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-6 md:p-10 bg-slate-50 dark:bg-slate-900/60 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                                            <LessonLabContent lesson={lesson} setters={{
                                                setShowGeo3D, setShowMathLab, setShowLab, setShowGrapher, setShowStats,
                                                setShowEquation, setShowVector, setShowTransform, setShowNotation,
                                            }} />
                                        </div>
                                        
                                        <div className="flex justify-center pt-6">
                                            <button onClick={() => { setActiveTab('application'); scrollToTabs(); }} className="flex items-center gap-3 bg-slate-900 dark:bg-slate-700 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 group">
                                                انتقل للتطبيق
                                                <ArrowRight size={24} className="rotate-180 group-hover:-translate-x-2 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB 3: APPLICATION ── */}
                        {activeTab === 'application' && (
                            <div className="space-y-8 pb-10 text-right">
                                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-white dark:border-slate-700/50 p-8 md:p-15 flex flex-col">
                                    <div className="flex items-center gap-5 mb-10">
                                        <div className="w-16 h-16 rounded-[2rem] bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
                                            <Brain size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">تطبيق عملي</h2>
                                            <p className="text-slate-500 font-bold opacity-70 mt-1">المرحلة الأخيرة قبل الاختبار!</p>
                                        </div>
                                    </div>

                                    <div className="p-10 bg-rose-50/40 dark:bg-rose-900/10 border-r-8 border-rose-400 rounded-[2.5rem] relative overflow-hidden mb-10">
                                        <div className="flex items-center gap-4 flex-wrap relative z-10">
                                            <MathText text={currentProblem?.text || ''} className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight" />
                                            {!currentProblem?.isInitial && (
                                                <span className="px-5 py-2 bg-amber-400 text-slate-900 text-xs font-black rounded-full shadow-lg animate-bounce">تمرين جديد ✨</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hint */}
                                    {currentProblem?.explanation && (
                                        <div className="flex justify-start">
                                            <button
                                                onClick={() => setShowHint(!showHint)}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${
                                                    showHint
                                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
                                                }`}
                                            >
                                                <Lightbulb size={18} className={showHint ? 'animate-pulse' : ''} />
                                                {showHint ? 'إخفاء المساعدة' : 'أحتاج تلميح!'}
                                            </button>
                                        </div>
                                    )}
                                    <AnimatePresence>
                                        {showHint && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-6 bg-amber-50/50 dark:bg-amber-900/10 border-r-4 border-amber-400 rounded-2xl text-slate-700 dark:text-slate-300 font-bold">
                                                    <MathText text={currentProblem.explanation} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Input & Feedback */}
                                    <div className="space-y-6">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <input
                                                type="text"
                                                value={answer}
                                                onChange={(e) => { setAnswer(e.target.value); setAnswerFeedback(null); setShowSolution(false); }}
                                                className={`flex-1 bg-slate-50 dark:bg-slate-900/60 border-2 rounded-3xl px-8 py-5 text-xl text-slate-800 dark:text-slate-100 focus:outline-none transition-all font-black placeholder-slate-400 ${
                                                    answerFeedback === 'correct' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10' :
                                                    answerFeedback === 'wrong' ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20 shadow-lg shadow-rose-500/10' :
                                                    'border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:shadow-xl focus:shadow-indigo-500/5'
                                                }`}
                                                placeholder="اكتب إجابتك هنا..."
                                                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                                                dir="ltr"
                                            />
                                            <button
                                                onClick={checkAnswer}
                                                disabled={!answer.trim()}
                                                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-3xl font-black text-lg transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0"
                                            >
                                                <PenTool size={22} />
                                                تحقق من الحل
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 px-2 mt-2" dir="ltr">
                                            <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">لوحة المفاتيح:</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setAnswer(answer + '√'); document.querySelector('input[placeholder="اكتب إجابتك هنا..."]')?.focus(); }} className="w-10 h-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-serif text-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 relative group">
                                                    √
                                                    <span className="absolute -top-8 bg-slate-800 text-white text-[10px] font-cairo px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">جذر تربيعي</span>
                                                </button>
                                                <button onClick={() => { setAnswer(answer + '²'); document.querySelector('input[placeholder="اكتب إجابتك هنا..."]')?.focus(); }} className="w-10 h-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-serif text-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 relative group">
                                                    x²
                                                    <span className="absolute -top-8 bg-slate-800 text-white text-[10px] font-cairo px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">قوة (أس)</span>
                                                </button>
                                                <button onClick={() => { setAnswer(answer + 'π'); document.querySelector('input[placeholder="اكتب إجابتك هنا..."]')?.focus(); }} className="w-10 h-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-serif text-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 relative group">
                                                    π
                                                    <span className="absolute -top-8 bg-slate-800 text-white text-[10px] font-cairo px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">بي (Pi)</span>
                                                </button>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {answerFeedback && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center md:items-start gap-6 ${
                                                        answerFeedback === 'correct'
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 shadow-xl shadow-emerald-500/5'
                                                            : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 shadow-xl shadow-rose-500/5'
                                                    }`}
                                                >
                                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${answerFeedback === 'correct' ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-rose-500 text-white shadow-rose-500/30'}`}>
                                                        {answerFeedback === 'correct' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                                                    </div>
                                                    <div className="flex-1 text-center md:text-right">
                                                        <h3 className={`font-black text-2xl mb-3 ${answerFeedback === 'correct' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                                            {answerFeedback === 'correct' ? '🎉 إجابة مذهلة! استمر هكذا' : 'بسيطة! حاول مرة أخرى'}
                                                        </h3>
                                                        
                                                        {answerFeedback === 'wrong' && showSolution && (
                                                            <div className="space-y-6">
                                                                <div className="p-6 bg-white dark:bg-slate-900/60 rounded-3xl border border-rose-100 dark:border-rose-900/30 inline-block">
                                                                    <span className="text-slate-400 block mb-2 font-bold text-sm">الحل الصحيح هو:</span>
                                                                    <MathText text={currentProblem?.solution || currentProblem?.correct_answer} className="text-2xl font-black text-slate-800 dark:text-white" />
                                                                </div>
                                                                
                                                                {problemsPool.length > 0 && (
                                                                    <div className="flex justify-center md:justify-start mt-4">
                                                                        <button
                                                                            onClick={handleTrySimilar}
                                                                            className="flex items-center gap-3 px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-sky-400/30 group animate-bounce"
                                                                        >
                                                                            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                                                                            جرّب هذا المثال بأرقام مختلفة ✨
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {answerFeedback === 'correct' && (
                                                            <div className="p-6 bg-white dark:bg-slate-900/60 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 inline-block">
                                                                <MathText text={currentProblem?.solution || currentProblem?.correct_answer} className="text-2xl font-black text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB 4: QUIZ ── */}
                        {activeTab === 'quiz' && (
                            <div className="flex items-center justify-center min-h-[500px]">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-md w-full mx-auto text-center space-y-8 bg-white dark:bg-slate-800 rounded-[3.5rem] shadow-2xl shadow-amber-500/5 border border-slate-100 dark:border-slate-700 p-12 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 blur-[60px] rounded-full" />
                                    
                                    <div className="w-28 h-28 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner relative z-10">
                                        <Trophy size={56} className="text-amber-500 drop-shadow-lg" />
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100">تحدي المهارة</h2>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-4">اختبر ما تعلمته الآن واكسب نقاط XP لترقية مستواك في المنصة!</p>
                                    </div>
                                    <button
                                        onClick={() => setShowQuiz(true)}
                                        className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-2xl rounded-3xl shadow-2xl shadow-amber-500/40 transition-all hover:-translate-y-1.5 active:translate-y-0 relative z-10"
                                    >
                                        ابدأ الاختبار الآن 🚀
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="mt-12 mb-8 z-40">
                    <div className="max-w-4xl mx-auto flex justify-between items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-4 rounded-full border border-slate-200 dark:border-slate-700 shadow-xl">
                        <button
                            onClick={goToPrevTab}
                            disabled={activeTabIdx === 0}
                            className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all disabled:opacity-0 disabled:pointer-events-none group ${
                                activeTabIdx === 0 ? 'bg-transparent text-slate-300' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-md hover:-translate-x-1 border border-slate-100 dark:border-slate-600'
                            }`}
                        >
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                <ArrowRight size={14} />
                            </div>
                            <span className="hidden sm:inline">السابق</span>
                        </button>

                        <div className="flex gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-100 dark:border-slate-700 shadow-lg px-6">
                            {TABS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm ${
                                        idx === activeTabIdx 
                                            ? 'w-10 bg-gradient-to-r from-sky-500 to-indigo-500 shadow-sky-500/20' 
                                            : idx < activeTabIdx 
                                            ? 'w-2.5 bg-emerald-400' 
                                            : 'w-2.5 bg-slate-200 dark:bg-slate-700'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={goToNextTab}
                            disabled={activeTabIdx === TABS.length - 1}
                            className={`flex items-center gap-3 px-6 py-3 rounded-full font-black transition-all shadow-md hover:translate-x-[-4px] disabled:opacity-0 disabled:pointer-events-none group bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/30`}
                        >
                            <span className="hidden sm:inline">التالي</span>
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <ArrowLeft size={14} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Tools Toggle */}
            <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
                {lesson.lab_type === 'geometry_3d' && (
                    <button onClick={() => setShowGeo3D(!showGeo3D)} className="w-14 h-14 bg-rose-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-rose-700 transition-all active:scale-95 group" title="المختبر ثلاثي الأبعاد">
                        <Box className="group-hover:rotate-12 transition-transform" />
                    </button>
                )}
                {lesson.lab_type === 'math_lab' && (
                    <button onClick={() => setShowMathLab(!showMathLab)} className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-95 group" title="مخبر الرياضيات">
                        <Layers className="group-hover:rotate-12 transition-transform" />
                    </button>
                )}
                {lesson.lab_type === 'geometry_2d' && (
                    <>
                        <button onClick={() => setShowLab(!showLab)} className="w-14 h-14 bg-amber-500 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-amber-600 transition-all active:scale-95 group" title="مخبر الهندسة">
                            <MousePointer2 className="group-hover:rotate-12 transition-transform" />
                        </button>
                        <button onClick={() => setShowRuler(!showRuler)} className="w-14 h-14 bg-emerald-500 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-95 group" title="المسطرة الافتراضية">
                            <PenTool className="group-hover:rotate-12 transition-transform" />
                        </button>
                    </>
                )}
                {lesson.lab_type === 'function_grapher' && (
                    <button onClick={() => setShowGrapher(!showGrapher)} className="w-14 h-14 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-emerald-700 transition-all active:scale-95 group" title="راسم الدوال">
                        <TrendingUp className="group-hover:rotate-12 transition-transform" />
                    </button>
                )}
                {lesson.lab_type === 'statistics_grapher' && (
                    <button onClick={() => setShowStats(!showStats)} className="w-14 h-14 bg-amber-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-amber-700 transition-all active:scale-95 group" title="مخبر الإحصاء">
                        <BarChart2 className="group-hover:rotate-12 transition-transform" />
                    </button>
                )}
                {lesson.lab_type === 'equation_solver' && (
                    <button onClick={() => setShowEquation(!showEquation)} className="w-14 h-14 bg-purple-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-purple-700 transition-all active:scale-95 group" title="حلال المعادلات">
                        <Sigma className="group-hover:rotate-12 transition-transform" />
                    </button>
                )}
                {lesson.lab_type === 'vector_lab' && (
                    <button onClick={() => setShowVector(!showVector)} className="w-14 h-14 bg-cyan-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-cyan-700 transition-all active:scale-95 group" title="مخبر الأشعة">
                        <Navigation className="group-hover:rotate-12 transition-transform" />
                    </button>
                )}
                {lesson.lab_type === 'transformation_lab' && (
                    <button onClick={() => setShowTransform(!showTransform)} className="w-14 h-14 bg-pink-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-pink-700 transition-all active:scale-95 group" title="مخبر التحويلات">
                        <RefreshCw className="group-hover:rotate-12 transition-transform" />
                    </button>
                )}
                {lesson.lab_type === 'notation_converter' && (
                    <button onClick={() => setShowNotation(!showNotation)} className="w-14 h-14 bg-orange-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-orange-700 transition-all active:scale-95 group" title="محول الكتابة العلمية">
                        <RulerIcon className="group-hover:rotate-12 transition-transform" />
                    </button>
                )}
                <button
                    onClick={() => setShowCalc(!showCalc)}
                    className="w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 group"
                    title="الآلة الحاسبة"
                >
                    <CalcIcon className="group-hover:rotate-12 transition-transform" />
                </button>
            </div>

            {/* Pagination Navigation (Next / Prev Lessons) */}
            {(prevLesson || nextLesson) && (
                <div className="max-w-3xl mx-auto mt-16 px-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 md:p-6 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                        {prevLesson ? (
                            <button
                                onClick={() => navigate(`/student/lessons/${prevLesson.id}`, { replace: true })}
                                className="flex-1 flex items-center justify-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors w-full group text-right"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0 group-hover:-translate-x-2 transition-transform">
                                    <ArrowRight className="text-slate-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-slate-400 mb-1">الدرس السابق</div>
                                    <div className="font-black text-slate-800 dark:text-slate-100 truncate"><MathText text={prevLesson.name} /></div>
                                </div>
                            </button>
                        ) : <div className="flex-1 hidden md:block"></div>}

                        {nextLesson ? (
                            <button
                                onClick={() => navigate(`/student/lessons/${nextLesson.id}`, { replace: true })}
                                className="flex-1 flex items-center justify-end gap-4 p-4 rounded-2xl hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-200 dark:hover:border-sky-800 border-2 border-transparent transition-all w-full group text-left"
                            >
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-sky-500 mb-1">الدرس التالي</div>
                                    <div className="font-black text-slate-800 dark:text-slate-100 truncate"><MathText text={nextLesson.name} /></div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center shrink-0 group-hover:translate-x-2 transition-transform">
                                    <ArrowRight className="text-sky-500 rotate-180" />
                                </div>
                            </button>
                        ) : <div className="flex-1 hidden md:block"></div>}
                    </div>
                </div>
            )}

            <AnimatePresence>
                <Suspense fallback={
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                        <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-sky-500" size={32} />
                            <p className="text-slate-700 font-bold font-cairo cursor-wait">جاري تحميل الأداة...</p>
                        </div>
                    </div>
                }>
                    {showQuiz && (
                        <QuizModal
                            key="quiz-modal"
                            lessonId={lesson.id}
                            lessonName={lesson.name}
                            battleId={location.state?.battleId}
                            onClose={() => setShowQuiz(false)}
                        />
                    )}
                    {/* ── OVERLAYS: LABS ── */}
                    {showGeo3D && <GeometryLab3D onClose={() => setShowGeo3D(false)} defaultShape={
                        lesson?.lab_type === 'geometry_3d_sphere' ? 'sphere' :
                        lesson?.lab_type === 'geometry_3d_cylinder' ? 'cylinder' :
                        lesson?.lab_type === 'geometry_3d_cone' ? 'cone' : 'box'
                    } />}
                    {showMathLab && <MathLab key="math-lab" onClose={() => setShowMathLab(false)} />}
                    {showGrapher && <FunctionGrapher key="grapher-lab" onClose={() => setShowGrapher(false)} />}
                    {showStats && <StatisticsGrapher key="stats-lab" onClose={() => setShowStats(false)} />}
                    {showEquation && <EquationSolver key="equation-solver" onClose={() => setShowEquation(false)} />}
                    {showVector && <VectorLab key="vector-lab" onClose={() => setShowVector(false)} />}
                    {showTransform && <TransformationLab key="transform-lab" onClose={() => setShowTransform(false)} />}
                    {showNotation && <NotationConverter key="notation-converter" onClose={() => setShowNotation(false)} />}
                </Suspense>

                {showCalc && <Calculator key="calc-tool" onClose={() => setShowCalc(false)} />}
                {showRuler && <Ruler key="ruler-tool" onClose={() => setShowRuler(false)} />}
                {showLab && (
                    <Suspense fallback={null}>
                        <GeometryLab key="lab-tool" onClose={() => setShowLab(false)} />
                    </Suspense>
                )}
            </AnimatePresence>

            <AITutorWidget contextId={lesson.id} type="lesson" />

            {/* Course Index Modal */}
            <AnimatePresence>
                {showCourseIndex && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
                        onClick={() => setShowCourseIndex(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 md:p-8 bg-white dark:bg-slate-800 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 relative overflow-hidden">
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-sky-500/10 rounded-full blur-[40px] pointer-events-none" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 text-white shrink-0">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">فهرس المنهج</h2>
                                        <p className="text-sm font-bold text-slate-500">اختر الدرس الذي ترغب بالانتقال إليه سريعاً</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowCourseIndex(false)}
                                    className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-all shrink-0"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            
                            {/* Modal Body */}
                            <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                                {learningStructure.map((field, fieldIdx) => (
                                    <div key={field.id} className="space-y-4">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 text-sm">
                                                {fieldIdx + 1}
                                            </div>
                                            <h3 className="text-xl font-black text-slate-700 dark:text-slate-300">{field.name}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {field.sections.map(sec => 
                                                sec.lessons.map(l => {
                                                    const isActive = l.id == lessonId;
                                                    return (
                                                        <button 
                                                            key={l.id}
                                                            onClick={() => { setShowCourseIndex(false); navigate(`/student/lessons/${l.id}`, {replace:true}); }}
                                                            className={`text-right p-4 rounded-2xl transition-all border group ${
                                                                isActive 
                                                                ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/30' 
                                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-xl hover:-translate-y-1 text-slate-700 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                                                    isActive ? 'bg-white/20 text-white' : 'bg-slate-50 dark:bg-slate-900 group-hover:bg-sky-50 dark:group-hover:bg-sky-900/50 text-slate-400 group-hover:text-sky-500'
                                                                }`}>
                                                                    {isActive ? <CheckCircle size={20} /> : <BookOpen size={18} />}
                                                                </div>
                                                                <div className="flex-1 mt-1">
                                                                    <div className={`font-black text-sm md:text-base leading-snug ${isActive ? 'text-white' : 'group-hover:text-sky-600 dark:group-hover:text-sky-400'}`}>
                                                                        <MathText text={l.name} />
                                                                    </div>
                                                                    <div className={`text-xs mt-1.5 font-bold ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                                                                        {sec.name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
