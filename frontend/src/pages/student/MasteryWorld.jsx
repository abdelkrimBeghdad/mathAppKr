import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sigma, TrendingUp, Layers, X, Play, Rocket, Sun, Moon, Binary, Scale, ShieldCheck, Target, LayoutGrid, ChevronLeft, ChevronRight, Triangle, Map, Zap, Calculator, GitBranch, Box, BarChart2, RefreshCcw, Dice5, Navigation, CheckCircle2, Clock, ArrowRight, Search, Lock, Coins } from 'lucide-react';
import { labProgressService } from '../../utils/labProgressService';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import SEO from '../../components/common/SEO';
import WelcomeBanner from '../student/WelcomeBanner';
import SkillPathTrig from '../student/SkillPathTrig';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Lab Imports (Preserved)
import LabErrorBoundary from '../../components/lesson/LabErrorBoundary';

// Lab Imports — lazily loaded (code-split) so the bundle doesn't ship all 80+ labs upfront
const ExpansionSimpleLab = lazy(() => import('../../components/lesson/ExpansionSimpleLab'));
const ExpansionDoubleLab = lazy(() => import('../../components/lesson/ExpansionDoubleLab'));
const ExpansionIdentity1Lab = lazy(() => import('../../components/lesson/ExpansionIdentity1Lab'));
const ExpansionIdentity2Lab = lazy(() => import('../../components/lesson/ExpansionIdentity2Lab'));
const ExpansionIdentity3Lab = lazy(() => import('../../components/lesson/ExpansionIdentity3Lab'));
const VisualFactorizationLab = lazy(() => import('../../components/lesson/VisualFactorizationLab'));
const FactIdentity1Lab = lazy(() => import('../../components/lesson/FactIdentity1Lab'));
const FactIdentity2Lab = lazy(() => import('../../components/lesson/FactIdentity2Lab'));
const FactIdentity3Lab = lazy(() => import('../../components/lesson/FactIdentity3Lab'));
const PGCDDivisorsLab = lazy(() => import('../../components/lesson/PGCDDivisorsLab'));
const PGCDEuclideanLab = lazy(() => import('../../components/lesson/PGCDEuclideanLab'));
const PGCDSubtractionLab = lazy(() => import('../../components/lesson/PGCDSubtractionLab'));
const RootsSimplificationLab = lazy(() => import('../../components/lesson/RootsSimplificationLab'));
const RootsMultiplicationLab = lazy(() => import('../../components/lesson/RootsMultiplicationLab'));
const RootsDivisionLab = lazy(() => import('../../components/lesson/RootsDivisionLab'));
const RootsAdditionLab = lazy(() => import('../../components/lesson/RootsAdditionLab'));
const RootsSubtractionLab = lazy(() => import('../../components/lesson/RootsSubtractionLab'));
const RootsExpressionLab = lazy(() => import('../../components/lesson/RootsExpressionLab'));
const InequalitiesSolveLab = lazy(() => import('../../components/lesson/InequalitiesSolveLab'));
const InequalitiesGraphLab = lazy(() => import('../../components/lesson/InequalitiesGraphLab'));
const LinearImageLab = lazy(() => import('../../components/lesson/LinearImageLab'));
const LinearGraphLab = lazy(() => import('../../components/lesson/LinearGraphLab'));
const LinearFormulaLab = lazy(() => import('../../components/lesson/LinearFormulaLab'));
const AffineImageLab = lazy(() => import('../../components/lesson/AffineImageLab'));
const AffineGraphLab = lazy(() => import('../../components/lesson/AffineGraphLab'));
const AffineFormulaLab = lazy(() => import('../../components/lesson/AffineFormulaLab'));
const EquationsLab = lazy(() => import('../../components/lesson/EquationsLab'));
const EquationsProductLab = lazy(() => import('../../components/lesson/EquationsProductLab'));
const PythVerifyLab = lazy(() => import('../../components/lesson/PythVerifyLab'));
const PythHypotenuseLab = lazy(() => import('../../components/lesson/PythHypotenuseLab'));
const PythLegLab = lazy(() => import('../../components/lesson/PythLegLab'));
const PythProblemsLab = lazy(() => import('../../components/lesson/PythProblemsLab'));
const ThalesVerifyLab = lazy(() => import('../../components/lesson/ThalesVerifyLab'));
const ThalesLengthLab = lazy(() => import('../../components/lesson/ThalesLengthLab'));
const ThalesProblemsLab = lazy(() => import('../../components/lesson/ThalesProblemsLab'));
const PowersLab = lazy(() => import('../../components/lesson/PowersLab'));
const ScientificNotationLab = lazy(() => import('../../components/lesson/ScientificNotationLab'));
const FractionSimplifyLab = lazy(() => import('../../components/lesson/FractionSimplifyLab'));
const CoprimeLab = lazy(() => import('../../components/lesson/CoprimeLab'));
const DivisorDiscovery = lazy(() => import('../../components/lesson/DivisorDiscovery'));
const DivisorPropertiesLab = lazy(() => import('../../components/lesson/DivisorPropertiesLab'));
const SysSubstitutionLab = lazy(() => import('../../components/lesson/SysSubstitutionLab'));
const SysAdditionLab = lazy(() => import('../../components/lesson/SysAdditionLab'));
const SystemsGraphLab = lazy(() => import('../../components/lesson/SystemsGraphLab'));
const SysStrategyLab = lazy(() => import('../../components/lesson/SysStrategyLab'));
const VecConceptLab = lazy(() => import('../../components/lesson/VecConceptLab'));
const VecReadLab = lazy(() => import('../../components/lesson/VecReadLab'));
const VecCalcLab = lazy(() => import('../../components/lesson/VecCalcLab'));
const VecMidpointLab = lazy(() => import('../../components/lesson/VecMidpointLab'));
const VecDistanceLab = lazy(() => import('../../components/lesson/VecDistanceLab'));
const VecChaslesLab = lazy(() => import('../../components/lesson/VecChaslesLab'));
const VecParallelogramLab = lazy(() => import('../../components/lesson/VecParallelogramLab'));
const VecRandomAddLab = lazy(() => import('../../components/lesson/VecRandomAddLab'));
const VecSameEndLab = lazy(() => import('../../components/lesson/VecSameEndLab'));
const TrigNamingLab = lazy(() => import('../../components/lesson/TrigNamingLab'));
const TrigCosLab = lazy(() => import('../../components/lesson/TrigCosLab'));
const TrigSinLab = lazy(() => import('../../components/lesson/TrigSinLab'));
const TrigTanLab = lazy(() => import('../../components/lesson/TrigTanLab'));
const TrigLengthLab = lazy(() => import('../../components/lesson/TrigLengthLab'));
const TrigAngleLab = lazy(() => import('../../components/lesson/TrigAngleLab'));
const TrigIdentitiesLab = lazy(() => import('../../components/lesson/TrigIdentitiesLab'));
const TrigSpecialLab = lazy(() => import('../../components/lesson/TrigSpecialLab'));
const GeoSolidsLab = lazy(() => import('../../components/lesson/GeoSolidsLab'));
const GeoNetLab = lazy(() => import('../../components/lesson/GeoNetLab'));
const GeoVolumeLab = lazy(() => import('../../components/lesson/GeoVolumeLab'));
const GeoSectionLab = lazy(() => import('../../components/lesson/GeoSectionLab'));
const GeoPyramidLab = lazy(() => import('../../components/lesson/GeoPyramidLab'));
const StatFreqLab = lazy(() => import('../../components/lesson/StatFreqLab'));
const StatMeanLab = lazy(() => import('../../components/lesson/StatMeanLab'));
const StatCumulativeLab = lazy(() => import('../../components/lesson/StatCumulativeLab'));
const StatChartLab = lazy(() => import('../../components/lesson/StatChartLab'));
const ProbabilityMasteryLab = lazy(() => import('../../components/lesson/ProbabilityMasteryLab'));
const RotationMasteryLab = lazy(() => import('../../components/lesson/RotationMasteryLab'));
const PythVisualProofLab = lazy(() => import('../../components/lesson/PythVisualProofLab'));
const ThalesInteractiveLab = lazy(() => import('../../components/lesson/ThalesInteractiveLab'));



const LABS_MENU = [
    { id: 'exp-simple', title: 'النشر البسيط', type: 'expansion', isReady: true, desc: 'توزيع الضرب على الجمع والطرح.', difficulty: 'مبتدئ' },
    { id: 'exp-double', title: 'النشر المزدوج', type: 'expansion', isReady: true, desc: 'توزيع الأقواس المزدوجة.', difficulty: 'متوسط' },
    { id: 'id1', title: 'المتطابقة الأولى', type: 'expansion', isReady: true, desc: '(a + b)² = a² + 2ab + b²', difficulty: 'متوسط' },
    { id: 'id2', title: 'المتطابقة الثانية', type: 'expansion', isReady: true, desc: '(a - b)² = a² - 2ab + b²', difficulty: 'متوسط' },
    { id: 'id3', title: 'المتطابقة الثالثة', type: 'expansion', isReady: true, desc: '(a - b)(a + b) = a² - b²', difficulty: 'متقدم' },
    { id: 'fact-common', title: 'التحليل بالعامل المشترك', type: 'factorization', isReady: true, desc: 'استخراج العوامل المشتركة.', difficulty: 'متوسط' },
    { id: 'fact-id1', title: 'التحليل بالمتطابقة 1', type: 'factorization', isReady: true, desc: 'من الشكل a² + 2ab + b².', difficulty: 'متقدم' },
    { id: 'fact-id2', title: 'التحليل بالمتطابقة 2', type: 'factorization', isReady: true, desc: 'من الشكل a² - 2ab + b².', difficulty: 'متقدم' },
    { id: 'fact-id3', title: 'التحليل بالمتطابقة 3', type: 'factorization', isReady: true, desc: 'من الشكل a² - b².', difficulty: 'خبير' },
    { id: 'pgcd-divisors', title: 'القواسم المشتركة', type: 'pgcd', isReady: true, desc: 'سرد القواسم وتحديد المشترك.', difficulty: 'مبتدئ' },
    { id: 'pgcd-subtraction', title: 'الفروق المتتالية', type: 'pgcd', isReady: true, desc: 'حساب PGCD بالطرح المتتالي.', difficulty: 'متوسط' },
    { id: 'pgcd-euclidean', title: 'خوارزمية إقليدس', type: 'pgcd', isReady: true, desc: 'حساب PGCD بالقسمة المتتالية.', difficulty: 'متوسط' },
    { id: 'roots-simplification', title: 'تبسيط الجذور', type: 'roots', isReady: true, desc: 'استخراج المربعات التامة.', difficulty: 'متوسط' },
    { id: 'roots-multiplication', title: 'ضرب الجذور', type: 'roots', isReady: true, desc: 'دمج جذرين تحت جذر واحد.', difficulty: 'متوسط' },
    { id: 'roots-division', title: 'قسمة الجذور', type: 'roots', isReady: true, desc: 'توحيد الكسور الجذريّة.', difficulty: 'متوسط' },
    { id: 'roots-addition', title: 'جمع الجذور', type: 'roots', isReady: true, desc: 'تجميع الجذور المتشابهة.', difficulty: 'متقدم' },
    { id: 'roots-subtraction', title: 'طرح الجذور', type: 'roots', isReady: true, desc: 'طرح الجذور المتشابهة.', difficulty: 'متقدم' },
    { id: 'roots-expression', title: 'تبسيط العبارات', type: 'roots', isReady: true, desc: 'تجميع الحدود الجذريّة المتشابهة.', difficulty: 'خبير' },
    { id: 'eq-solve', title: 'حل المعادلات', type: 'equations', isReady: true, desc: 'عزل المجهول x وإيجاد قيمته.', difficulty: 'مبتدئ' },
    { id: 'eq-product', title: 'الجداء المعدوم', type: 'equations', isReady: true, desc: 'حل معادلات من الشكل (A)(B)=0.', difficulty: 'متوسط' },
    { id: 'ineq-solve', title: 'حل المتراجحات', type: 'inequalities', isReady: true, desc: 'إيجاد مجالات الحلول الجبرية.', difficulty: 'متوسط' },
    { id: 'ineq-graph', title: 'التمثيل البياني', type: 'inequalities', isReady: true, desc: 'تمثيل الحلول على مستقيم مدرج.', difficulty: 'متقدم' },
    { id: 'lin-image', title: 'صور الدالة الخطية', type: 'linear', isReady: true, desc: 'حساب صورة عدد بدالة خطية.', difficulty: 'مبتدئ' },
    { id: 'lin-graph', title: 'تمثيل الدالة الخطية', type: 'linear', isReady: true, desc: 'رسم مستقيم يمر من المبدأ.', difficulty: 'متوسط' },
    { id: 'lin-formula', title: 'استخراج المعامل الخطّي', type: 'linear', isReady: true, desc: 'تحديد a من رسم بياني أو جدول.', difficulty: 'متقدم' },
    { id: 'aff-image', title: 'صور الدالة التآلفية', type: 'affine', isReady: true, desc: 'حساب صورة عدد بدالة تآلفية.', difficulty: 'مبتدئ' },
    { id: 'aff-graph', title: 'تمثيل الدالة التآلفية', type: 'affine', isReady: true, desc: 'رسم مستقيم الدالة ax + b.', difficulty: 'متقدم' },
    { id: 'aff-formula', title: 'استخراج العبارة الجبرية', type: 'affine', isReady: true, desc: 'تحديد a و b من معطيات.', difficulty: 'خبير' },
    { id: 'pyth-verify', title: 'التحقق من مثلث قائم', type: 'pythagoras', isReady: true, desc: 'استخدام الخاصية العكسية.', difficulty: 'مبتدئ' },
    { id: 'pyth-hyp', title: 'حساب الوتر', type: 'pythagoras', isReady: true, desc: 'إيجاد أطول ضلع في مثلث قائم.', difficulty: 'متوسط' },
    { id: 'pyth-leg', title: 'حساب ضلع قائم', type: 'pythagoras', isReady: true, desc: 'إيجاد أحد ضلعي الزاوية القائمة.', difficulty: 'متقدم' },
    { id: 'pyth-prob', title: 'مسائل فيثاغورس', type: 'pythagoras', isReady: true, desc: 'تطبيقات ومسائل هندسية.', difficulty: 'خبير' },
    { id: 'pyth-visual', title: 'البرهان البصري', type: 'pythagoras', isReady: true, desc: 'شاهد المساحات تملأ المربع الكبير.', difficulty: 'خبير' },
    { id: 'thales-verify', title: 'التحقق من التوازي', type: 'thales', isReady: true, desc: 'طاليس العكسية لاختبار التوازي.', difficulty: 'مبتدئ' },
    { id: 'thales-length', title: 'حساب طول مجهول', type: 'thales', isReady: true, desc: 'استخدام الرابع المتناسب.', difficulty: 'متوسط' },
    { id: 'thales-prob', title: 'مسائل طاليس', type: 'thales', isReady: true, desc: 'تطبيقات لحساب مسافات غير قابلة للقياس.', difficulty: 'متقدم' },
    { id: 'thales-shadow', title: 'ظل الأهرامات', type: 'thales', isReady: true, desc: 'محاكاة تاريخية لقياس الارتفاعات.', difficulty: 'خبير' },
    { id: 'powers-rules', title: 'قواعد القوى', type: 'powers', isReady: true, desc: 'حساب وتبسيط القوى.', difficulty: 'مبتدئ' },
    { id: 'scientific-not', title: 'الكتابة العلمية', type: 'powers', isReady: true, desc: 'تحويل الأعداد إلى الشكل العلمي.', difficulty: 'متوسط' },
    { id: 'frac-simplify', title: 'اختزال الكسور', type: 'fractions', isReady: true, desc: 'تبسيط الكسور باستخدام القواسم.', difficulty: 'متوسط' },
    { id: 'coprime', title: 'عددان أوليان فيما بينهما', type: 'pgcd', isReady: true, desc: 'التحقق من أن الـ PGCD يساوي 1.', difficulty: 'مبتدئ' },
    { id: 'div-discover', title: 'اكتشاف القواسم', type: 'pgcd', isReady: true, desc: 'إيجاد جميع قواسم عدد طبيعي.', difficulty: 'مبتدئ' },
    { id: 'div-props', title: 'قابلية القسمة', type: 'pgcd', isReady: true, desc: 'معايير قابلية القسمة.', difficulty: 'مبتدئ' },
    { id: 'sys-subst', title: 'طريقة التعويض', type: 'systems', isReady: true, desc: 'عزل مجهول وحقنه في المعادلة الأخرى.', difficulty: 'مبتدئ' },
    { id: 'sys-add', title: 'طريقة الجمع', type: 'systems', isReady: true, desc: 'موازنة المعاملات وتفجير أحد المجاهيل.', difficulty: 'متوسط' },
    { id: 'sys-graph', title: 'التفسير البياني', type: 'systems', isReady: true, desc: 'إيجاد الحل عن طريق تقاطع مستقيمين.', difficulty: 'متقدم' },
    { id: 'sys-strategy', title: 'إستراتيجية الحل', type: 'systems', isReady: true, desc: 'اختر الطريقة الأسرع للحل بذكاء.', difficulty: 'خبير' },
    { id: 'vec-concept', title: 'مفهوم الشعاع', type: 'vectors', isReady: true, desc: 'التعرف على خصائص الشعاع والانسحاب.', difficulty: 'مبتدئ' },
    { id: 'vec-read', title: 'القراءة البيانية', type: 'vectors', isReady: true, desc: 'استخراج المركبات من الشبكة.', difficulty: 'مبتدئ' },
    { id: 'vec-calc', title: 'الحساب الجبري', type: 'vectors', isReady: true, desc: 'قانون النهاية ناقص البداية.', difficulty: 'متوسط' },
    { id: 'vec-midpoint', title: 'نقطة المنتصف', type: 'vectors', isReady: true, desc: 'حساب مركز قطعة مستقيم.', difficulty: 'متوسط' },
    { id: 'vec-distance', title: 'المسافة والطويلة', type: 'vectors', isReady: true, desc: 'حساب المسافة بين نقطتين.', difficulty: 'متقدم' },
    { id: 'vec-chasles', title: 'علاقة شال', type: 'vectors', isReady: true, desc: 'جمع الأشعة المتسلسلة.', difficulty: 'متوسط' },
    { id: 'vec-para', title: 'متوازي الأضلاع', type: 'vectors', isReady: true, desc: 'جمع أشعة لها نفس البداية.', difficulty: 'متقدم' },
    { id: 'vec-rand', title: 'الأشعة الكيفية', type: 'vectors', isReady: true, desc: 'جمع أشعة متباعدة بالانسحاب.', difficulty: 'متقدم' },
    { id: 'vec-same-end', title: 'نفس النهاية', type: 'vectors', isReady: true, desc: 'جمع أشعة تصب في نقطة واحدة.', difficulty: 'خبير' },
    { id: 'trig-naming', title: 'تسمية الأضلاع', type: 'trig', isReady: true, desc: 'تحديد المقابل والمجاور والوتر.', difficulty: 'مبتدئ' },
    { id: 'trig-cos', title: 'جيب التمام (Cos)', type: 'trig', isReady: true, desc: 'حساب نسبة المجاور إلى الوتر.', difficulty: 'مبتدئ' },
    { id: 'trig-sin', title: 'الجيب (Sin)', type: 'trig', isReady: true, desc: 'حساب نسبة المقابل إلى الوتر.', difficulty: 'مبتدئ' },
    { id: 'trig-tan', title: 'الظل (Tan)', type: 'trig', isReady: true, desc: 'حساب نسبة المقابل إلى المجاور.', difficulty: 'مبتدئ' },
    { id: 'trig-length', title: 'حساب الأطوال', type: 'trig', isReady: true, desc: 'إيجاد أضلاع مجهولة بالنسب.', difficulty: 'متوسط' },
    { id: 'trig-angle', title: 'استنتاج الزوايا', type: 'trig', isReady: true, desc: 'حساب الدرجات من النسب.', difficulty: 'متوسط' },
    { id: 'trig-identities', title: 'العلاقات الأساسية', type: 'trig', isReady: true, desc: 'القوانين التي تربط النسب ببعضها.', difficulty: 'متقدم' },
    { id: 'trig-special', title: 'الزوايا الشهيرة', type: 'trig', isReady: true, desc: 'حفظ وفهم قيم 30, 45, 60.', difficulty: 'متقدم' },
    { id: 'geo-solids', title: 'عالم المجسمات', type: 'geometry-3d', isReady: true, desc: 'التعرف على المجسمات وخصائصها.', difficulty: 'مبتدئ' },
    { id: 'geo-net', title: 'المساحة والنشر', type: 'geometry-3d', isReady: true, desc: 'تحويل المجسم إلى شكل مسطح.', difficulty: 'متوسط' },
    { id: 'geo-volume', title: 'مختبر السعة', type: 'geometry-3d', isReady: true, desc: 'حساب الحجوم وسعة المجسمات.', difficulty: 'متوسط' },
    { id: 'geo-section', title: 'مختبر القواطع', type: 'geometry-3d', isReady: true, desc: 'المقاطع المستوية للمجسمات.', difficulty: 'متقدم' },
    { id: 'geo-pyramid', title: 'مختبر القمم', type: 'geometry-3d', isReady: true, desc: 'الهرم ومخروط الدوران.', difficulty: 'متقدم' },
    { id: 'stat-freq', title: 'مختبر التكرارات', type: 'stats', isReady: true, desc: 'تنظيم البيانات في جداول.', difficulty: 'مبتدئ' },
    { id: 'stat-mean', title: 'مختبر المعدلات', type: 'stats', isReady: true, desc: 'حساب الوسط الحسابي والوسيط.', difficulty: 'متوسط' },
    { id: 'stat-cumulative', title: 'مختبر التراكم', type: 'stats', isReady: true, desc: 'التكرار المجمع الصاعد والنازل.', difficulty: 'متوسط' },
    { id: 'stat-chart', title: 'مختبر الألوان', type: 'stats', isReady: true, desc: 'التمثيلات البيانية والدوائر.', difficulty: 'متقدم' },
    { id: 'rotation-mastery', title: 'مختبر الرادار', type: 'rotation', isReady: true, desc: 'هندسة الدوران والزوايا.', difficulty: 'متوسط' },
    { id: 'prob-mastery', title: 'مختبر الصدفة', type: 'probability', isReady: true, desc: 'حساب احتمالات الحوادث البسيطة.', difficulty: 'متوسط' },
];

const CATEGORIES = [
    { id: 'expansion', title: 'النشر والتبسيط', icon: Rocket, color: 'indigo', gradient: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', domain: 'algebra', bgLight: 'bg-indigo-500/10', textLight: 'text-indigo-600' },
    { id: 'factorization', title: 'التحليل الجبري', icon: Layers, color: 'violet', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', domain: 'algebra', bgLight: 'bg-violet-500/10', textLight: 'text-violet-600' },
    { id: 'pgcd', title: 'القواسم (PGCD)', icon: Target, color: 'emerald', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', domain: 'arithmetic' },
    { id: 'roots', title: 'الجذور التربيعية', icon: Sigma, color: 'rose', gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', domain: 'arithmetic', bgLight: 'bg-rose-500/10', textLight: 'text-rose-600' },
    { id: 'equations', title: 'المعادلات', icon: Binary, color: 'amber', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', domain: 'algebra', bgLight: 'bg-amber-500/10', textLight: 'text-amber-600' },
    { id: 'inequalities', title: 'المتراجحات', icon: ShieldCheck, color: 'cyan', gradient: 'from-cyan-500 to-sky-600', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', domain: 'algebra', bgLight: 'bg-cyan-500/10', textLight: 'text-cyan-600' },
    { id: 'linear', title: 'الدالة الخطية', icon: TrendingUp, color: 'sky', gradient: 'from-sky-500 to-blue-600', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30', domain: 'algebra', bgLight: 'bg-sky-500/10', textLight: 'text-sky-600' },
    { id: 'affine', title: 'الدالة التآلفية', icon: BookOpen, color: 'orange', gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', domain: 'algebra', bgLight: 'bg-orange-500/10', textLight: 'text-orange-600' },
    { id: 'pythagoras', title: 'نظرية فيثاغورس', icon: Triangle, color: 'rose', gradient: 'from-rose-500 to-red-600', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', domain: 'geometry', bgLight: 'bg-rose-500/10', textLight: 'text-rose-600' },
    { id: 'thales', title: 'نظرية طاليس', icon: Map, color: 'blue', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', domain: 'geometry', bgLight: 'bg-blue-500/10', textLight: 'text-blue-600' },
    { id: 'powers', title: 'القوى', icon: Zap, color: 'yellow', gradient: 'from-yellow-500 to-amber-600', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', domain: 'arithmetic', bgLight: 'bg-yellow-500/10', textLight: 'text-yellow-600' },
    { id: 'fractions', title: 'الكسور', icon: Calculator, color: 'lime', gradient: 'from-lime-500 to-green-600', bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30', domain: 'arithmetic', bgLight: 'bg-lime-500/10', textLight: 'text-lime-600' },
    { id: 'systems', title: 'جملة معادلتين', icon: GitBranch, color: 'teal', gradient: 'from-teal-500 to-emerald-600', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30', domain: 'algebra', bgLight: 'bg-teal-500/10', textLight: 'text-teal-600' },
    { id: 'vectors', title: 'الأشعة والانسحاب', icon: Navigation, color: 'fuchsia', gradient: 'from-fuchsia-500 to-pink-600', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', domain: 'geometry', bgLight: 'bg-fuchsia-500/10', textLight: 'text-fuchsia-600' },
    { id: 'trig', title: 'الحساب المثلثي', icon: Triangle, color: 'pink', gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30', domain: 'geometry', bgLight: 'bg-pink-500/10', textLight: 'text-pink-600' },
    { id: 'geometry-3d', title: 'الهندسة الفضائية', icon: Box, color: 'purple', gradient: 'from-purple-500 to-indigo-600', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', domain: 'geometry', bgLight: 'bg-purple-500/10', textLight: 'text-purple-600' },
    { id: 'stats', title: 'الإحصاء', icon: BarChart2, color: 'green', gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', domain: 'stats', bgLight: 'bg-green-500/10', textLight: 'text-green-600' },
    { id: 'rotation', title: 'الدوران', icon: RefreshCcw, color: 'fuchsia', gradient: 'from-fuchsia-500 to-violet-600', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', domain: 'geometry', bgLight: 'bg-fuchsia-500/10', textLight: 'text-fuchsia-600' },
    { id: 'probability', title: 'الاحتمالات', icon: Dice5, color: 'slate', gradient: 'from-slate-400 to-slate-600', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', domain: 'stats', bgLight: 'bg-slate-500/10', textLight: 'text-slate-600' },
];


// Lightweight loading state shown while a lab chunk is being fetched
function LabLoadingFallback({ isDark }) {
    return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className={`w-12 h-12 rounded-full border-4 border-t-transparent ${isDark ? 'border-indigo-400' : 'border-indigo-500'}`}
            />
            <p className={`text-sm font-bold ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                جارٍ تحميل المختبر...
            </p>
        </div>
    );
}

export default function MasteryWorld() {
    const { isDark } = useTheme();
    const [activeCategory, setActiveCategory] = useState(null);
    const [playingLab, setPlayingLab] = useState(null);
    const [labProgress, setLabProgress] = useState([]);
    const [activeDomain, setActiveDomain] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [labSettings, setLabSettings] = useState({}); // lab_key -> { id, access_type, price, is_unlocked }
    const [premiumLockLab, setPremiumLockLab] = useState(null); // lab shown in premium gate
    const [unlocking, setUnlocking] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProgress();
        fetchLabSettings();
    }, []);

    const fetchLabSettings = async () => {
        try {
            const res = await api.get('/labs');
            const map = {};
            (res.data || []).forEach(l => { map[l.lab_key] = l; });
            setLabSettings(map);
        } catch (err) {
            console.error('Failed to fetch lab settings', err);
        }
    };

    const isLabLocked = (labId) => {
        const setting = labSettings[labId];
        if (!setting) return false;
        if (setting.access_type === 'premium' && !setting.is_unlocked) {
            return true;
        }
        return false;
    };

    const getLabPrice = (labId) => {
        return labSettings[labId]?.price || 0;
    };

    const handleOpenLab = (labId) => {
        if (isLabLocked(labId)) {
            setPremiumLockLab(labId);
        } else {
            setPlayingLab(labId);
        }
    };

    const handleUnlockWithCoins = async (labId) => {
        const setting = labSettings[labId];
        if (!setting) return;
        setUnlocking(true);
        try {
            await api.post('/access/unlock-coins', {
                accessible_type: 'lab',
                accessible_id: setting.id
            });
            toast.success('تم فتح المختبر بنجاح! 🚀');
            await fetchLabSettings();
            setPremiumLockLab(null);
            setPlayingLab(labId);
        } catch (err) {
            toast.error(err.response?.data?.message || 'فشل فتح المختبر. تأكد من رصيدك.');
        } finally {
            setUnlocking(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const data = await labProgressService.getAll();
            setLabProgress(data || []);
        } catch (err) {
            console.error('Failed to fetch progress', err);
        }
    };

    const getLabStatus = (labId) => {
        const p = labProgress.find(item => item.lab_id === labId);
        if (!p) return null;
        if (p.phase === 'completed') return 'completed';
        if (p.phase !== 'intro') return 'in-progress';
        return null;
    };

    const handleBackFromLab = () => {
        setPlayingLab(null);
        fetchProgress(); // Refresh progress when returning
    };

    const renderActiveLab = () => {
        // Static map: lab-id → lazy component (no JSX instantiated until needed)
        const LAB_COMPONENTS = {
            'exp-simple': ExpansionSimpleLab, 'exp-double': ExpansionDoubleLab,
            'id1': ExpansionIdentity1Lab, 'id2': ExpansionIdentity2Lab, 'id3': ExpansionIdentity3Lab,
            'fact-common': VisualFactorizationLab, 'fact-id1': FactIdentity1Lab, 'fact-id2': FactIdentity2Lab, 'fact-id3': FactIdentity3Lab,
            'pgcd-divisors': PGCDDivisorsLab, 'pgcd-subtraction': PGCDSubtractionLab, 'pgcd-euclidean': PGCDEuclideanLab,
            'roots-simplification': RootsSimplificationLab, 'roots-multiplication': RootsMultiplicationLab,
            'roots-division': RootsDivisionLab, 'roots-addition': RootsAdditionLab,
            'roots-subtraction': RootsSubtractionLab, 'roots-expression': RootsExpressionLab,
            'eq-solve': EquationsLab, 'eq-product': EquationsProductLab,
            'ineq-solve': InequalitiesSolveLab, 'ineq-graph': InequalitiesGraphLab,
            'lin-image': LinearImageLab, 'lin-graph': LinearGraphLab, 'lin-formula': LinearFormulaLab,
            'aff-image': AffineImageLab, 'aff-graph': AffineGraphLab, 'aff-formula': AffineFormulaLab,
            'pyth-verify': PythVerifyLab, 'pyth-hyp': PythHypotenuseLab, 'pyth-leg': PythLegLab, 'pyth-prob': PythProblemsLab,
            'pyth-visual': PythVisualProofLab,
            'thales-verify': ThalesVerifyLab, 'thales-length': ThalesLengthLab, 'thales-prob': ThalesProblemsLab,
            'thales-shadow': ThalesInteractiveLab,
            'powers-rules': PowersLab, 'scientific-not': ScientificNotationLab,
            'frac-simplify': FractionSimplifyLab, 'coprime': CoprimeLab,
            'div-discover': DivisorDiscovery, 'div-props': DivisorPropertiesLab,
            'sys-subst': SysSubstitutionLab, 'sys-add': SysAdditionLab,
            'sys-graph': SystemsGraphLab, 'sys-strategy': SysStrategyLab,
            'vec-concept': VecConceptLab, 'vec-read': VecReadLab,
            'vec-calc': VecCalcLab, 'vec-midpoint': VecMidpointLab,
            'vec-distance': VecDistanceLab, 'vec-chasles': VecChaslesLab,
            'vec-para': VecParallelogramLab, 'vec-rand': VecRandomAddLab,
            'vec-same-end': VecSameEndLab,
            'trig-naming': TrigNamingLab, 'trig-cos': TrigCosLab,
            'trig-sin': TrigSinLab, 'trig-tan': TrigTanLab,
            'trig-length': TrigLengthLab, 'trig-angle': TrigAngleLab,
            'trig-identities': TrigIdentitiesLab, 'trig-special': TrigSpecialLab,
            'geo-solids': GeoSolidsLab, 'geo-net': GeoNetLab,
            'geo-volume': GeoVolumeLab, 'geo-section': GeoSectionLab,
            'geo-pyramid': GeoPyramidLab,
            'stat-freq': StatFreqLab, 'stat-mean': StatMeanLab,
            'stat-cumulative': StatCumulativeLab, 'stat-chart': StatChartLab,
            'rotation-mastery': RotationMasteryLab,
            'prob-mastery': ProbabilityMasteryLab
        };
        const LabComp = LAB_COMPONENTS[playingLab];
        if (!LabComp) return <div className={`text-center p-20 font-bold opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>قيد التطوير...</div>;
        return <LabComp isDarkMode={isDark} />;
    };

    // Stagger variants for grid children
    const gridContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.05 }
        }
    };
    const gridItemVariants = {
        hidden: { opacity: 0, y: 16, scale: 0.97 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 26 } }
    };

    const DOMAINS = [
        { id: 'all', title: 'الكل' },
        { id: 'arithmetic', title: 'الأعداد والحساب' },
        { id: 'algebra', title: 'الجبر والدوال' },
        { id: 'geometry', title: 'الهندسة والقياس' },
        { id: 'stats', title: 'الإحصاء والاحتمالات' },
    ];

    const selectedCatData = activeCategory ? CATEGORIES.find(c => c.id === activeCategory) : null;
    const catAccent = selectedCatData || {};

    // Pre-compute lab counts per category (avoids repeated .filter() inside render)
    const categoryLabCounts = useMemo(() => {
        const counts = {};
        for (const lab of LABS_MENU) {
            counts[lab.type] = (counts[lab.type] || 0) + 1;
        }
        return counts;
    }, []);

    // Filter categories based on selected domain
    const filteredCategories = useMemo(() =>
        CATEGORIES.filter(cat => activeDomain === 'all' || cat.domain === activeDomain),
        [activeDomain]
    );

    // If search query is active, filter labs directly
    const filteredSearchLabs = useMemo(() => {
        if (!searchQuery) return [];
        const q = searchQuery.toLowerCase();
        return LABS_MENU.filter(lab => {
            const matchesSearch = lab.title.toLowerCase().includes(q) ||
                lab.desc.toLowerCase().includes(q);
            const category = CATEGORIES.find(c => c.id === lab.type);
            const matchesDomain = activeDomain === 'all' || (category && category.domain === activeDomain);
            return matchesSearch && matchesDomain;
        });
    }, [searchQuery, activeDomain]);

    return (
        <div className="space-y-8 relative" dir="rtl">
            <SEO
                title="مختبرات الإتقان الرياضي"
                description="استكشف مختبرات الإتقان الرياضي التفاعلية وجرب بنفسك القوانين والحلول الرياضية."
            />
            <div>
                <WelcomeBanner
                    show={labProgress.length === 0}
                    studentName={"ss"}
                    recommendedCategory={CATEGORIES.find(c => c.id === 'expansion')}
                    onStart={() => setActiveCategory('expansion')}
                    isDark={isDark}
                />
            </div>
            <SkillPathTrig onOpenLab={(labId) => console.log('فتح:', labId)} />
            {/* Ambient Background blur (low-key, adapted for theme) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className={`absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? 'bg-indigo-600/5' : 'bg-indigo-500/5'}`} />
                <div className={`absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? 'bg-purple-600/5' : 'bg-purple-500/5'}`} style={{ animationDelay: '2s' }} />
            </div>

            {/* Hero Header */}
            <header className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-[2.5rem] p-8 md:p-10 shadow-xl border-2 text-center relative overflow-hidden z-10`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full" />

                <div className="relative z-10 space-y-4">
                    <div className={`w-20 h-20 ${isDark ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-800/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'} rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-md`}>
                        <LayoutGrid size={40} />
                    </div>
                    <h1 className={`text-3xl md:text-4xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'} font-cairo`}>مختبرات الإتقان الرياضي</h1>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium max-w-2xl mx-auto text-sm md:text-base`}>
                        استكشف عالمًا من المختبرات التفاعلية المصغرة. جرب المفاهيم، حل التحديات، وحقق الإتقان الرياضي خطوة بخطوة.
                    </p>
                </div>
            </header>

            {/* Controls: Search & Domain Filters */}
            <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl border shadow-lg p-4 md:p-6 flex flex-col lg:flex-row gap-4 items-center justify-between z-10 relative`}>
                {/* Search Input */}
                <div className="relative w-full lg:w-96">
                    <Search className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={20} />
                    <input
                        type="text"
                        placeholder="ابحث عن وحدة أو مختبر..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full border-2 rounded-2xl py-3 pr-12 pl-4 focus:border-indigo-500 outline-none transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black cursor-pointer hover:underline ${isDark ? 'text-rose-400' : 'text-rose-500'}`}
                        >
                            إلغاء
                        </button>
                    )}
                </div>

                {/* Domain Selection Tabs with Sliding Indicator */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 no-scrollbar w-full lg:w-auto relative">
                    {DOMAINS.map(domain => (
                        <button
                            key={domain.id}
                            onClick={() => {
                                setActiveDomain(domain.id);
                                setActiveCategory(null);
                            }}
                            className={`relative px-5 py-2.5 rounded-xl font-black text-sm transition-colors duration-300 whitespace-nowrap cursor-pointer z-10 ${activeDomain === domain.id
                                ? 'text-white'
                                : `${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'}`
                                }`}
                        >
                            {activeDomain === domain.id && (
                                <motion.span
                                    layoutId="activeDomainPill"
                                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/25"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{domain.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            <main className="relative z-10">
                <AnimatePresence mode="wait">
                    {searchQuery ? (
                        <motion.div
                            key="search-results"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <h2 className={`text-xl font-black ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                                نتائج البحث ({filteredSearchLabs.length})
                            </h2>
                            {filteredSearchLabs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSearchLabs.map((lab) => {
                                        const catAccent = CATEGORIES.find(c => c.id === lab.type) || {};
                                        const status = getLabStatus(lab.id);
                                        const labBg = isDark ? catAccent.bg : catAccent.bgLight;
                                        const labText = isDark ? catAccent.text : catAccent.textLight;
                                        const isLocked = isLabLocked(lab.id);
                                        return (
                                            <motion.div
                                                key={lab.id}
                                                whileHover={{ scale: 1.03, y: -4 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleOpenLab(lab.id)}
                                                className={`relative p-7 rounded-[2rem] border transition-all cursor-pointer group overflow-hidden ${isDark
                                                    ? 'bg-white/[0.03] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06]'
                                                    : 'bg-white border-slate-200/60 hover:border-indigo-200 hover:bg-indigo-50/10 shadow-md'
                                                    }`}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${catAccent.gradient || 'from-indigo-500 to-purple-600'} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
                                                <div className="relative flex items-center justify-between mb-5">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${status === 'completed' ? 'bg-emerald-500/15' : isLocked ? 'bg-amber-500/15' : labBg} group-hover:scale-110`}>
                                                        {isLocked ? (
                                                            <Lock size={22} className="text-amber-400" />
                                                        ) : status === 'completed' ? (
                                                            <CheckCircle2 size={22} className="text-emerald-400" />
                                                        ) : status === 'in-progress' ? (
                                                            <Clock size={22} className="text-amber-400" />
                                                        ) : (
                                                            <Play size={22} className={`ml-0.5 ${labText}`} />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isLocked ? (
                                                            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/30 flex items-center gap-1">
                                                                <Lock size={10} /> {getLabPrice(lab.id)} عملة
                                                            </span>
                                                        ) : status ? (
                                                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                                                                {status === 'completed' ? 'مكتمل ✅' : 'قيد العمل 🔄'}
                                                            </span>
                                                        ) : null}
                                                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5 text-white/40 border border-white/5' : 'bg-slate-100 text-slate-500 border border-slate-200/50'}`}>
                                                            {lab.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h3 className={`relative text-xl font-black mb-2 transition-colors ${isDark ? 'text-white/90 group-hover:text-white' : 'text-slate-800 group-hover:text-indigo-955'}`}>{lab.title}</h3>
                                                <p className={`relative text-sm leading-relaxed font-medium transition-colors ${isDark ? 'text-white/35 group-hover:text-white/50' : 'text-slate-500 group-hover:text-slate-650'}`}>{lab.desc}</p>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={`text-center py-16 rounded-[2.5rem] border ${isDark ? 'bg-slate-800/10 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 text-rose-500">
                                        <X size={28} />
                                    </div>
                                    <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-850'} mb-2`}>لا توجد نتائج تطابق بحثك</h3>
                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-6`}>جرب كلمات مفتاحية أخرى أو تصفح الأقسام الرئيسية.</p>
                                    <button onClick={() => setSearchQuery('')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">إظهار كافة المختبرات</button>
                                </div>
                            )}
                        </motion.div>
                    ) : !activeCategory ? (
                        <motion.div
                            key={`grid-${activeDomain}`}
                            variants={gridContainerVariants}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
                        >
                            {filteredCategories.map(cat => {
                                const catBg = isDark ? cat.bg : cat.bgLight;
                                const catText = isDark ? cat.text : cat.textLight;
                                const categoryLabsCount = categoryLabCounts[cat.id] || 0;

                                return (
                                    <motion.button
                                        key={cat.id}
                                        variants={gridItemVariants}
                                        whileHover={{ scale: 1.04, y: -4 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`relative flex flex-col items-center justify-center p-8 md:p-10 rounded-[2rem] border transition-all duration-300 group overflow-hidden cursor-pointer ${isDark
                                            ? 'bg-white/[0.03] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-xl'
                                            : 'bg-white border-slate-200/50 hover:border-indigo-200 hover:bg-indigo-50/10 shadow-md hover:shadow-lg'
                                            }`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                        <motion.div
                                            className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${catBg} ${catText} group-hover:shadow-lg`}
                                            whileHover={{ scale: 1.15, rotate: 6 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                        >
                                            <cat.icon size={32} />
                                        </motion.div>
                                        <span className={`relative font-black text-base md:text-lg text-center leading-tight transition-colors ${isDark ? 'text-white/80 group-hover:text-white' : 'text-slate-700 group-hover:text-indigo-950'}`}>{cat.title}</span>
                                        <span className={`relative text-[10px] font-black mt-3 px-3 py-1 rounded-full ${isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'}`}>
                                            {categoryLabsCount} مختبر
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="labs"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-5">
                                    <button
                                        onClick={() => setActiveCategory(null)}
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${isDark
                                            ? 'border-white/10 bg-white/5 hover:bg-white/10'
                                            : 'border-slate-200 bg-white hover:bg-slate-100 shadow-sm'
                                            }`}
                                    >
                                        <ChevronLeft size={22} className={`rotate-180 ${isDark ? 'text-white/60' : 'text-slate-500'}`} />
                                    </button>
                                    <div>
                                        <h2 className={`text-2xl md:text-4xl font-black tracking-tight flex items-center gap-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                            {selectedCatData && (() => {
                                                const Icon = selectedCatData.icon;
                                                return <Icon size={32} className={isDark ? catAccent.text : catAccent.textLight} />;
                                            })()}
                                            <span>{selectedCatData?.title}</span>
                                        </h2>
                                        <p className={`${isDark ? 'text-white/30' : 'text-slate-400'} mt-1 font-medium italic text-sm`}>اختر التحدي الذي تود إتقانه الآن</p>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                variants={gridContainerVariants}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {LABS_MENU.filter(l => l.type === activeCategory).map((lab) => {
                                    const status = getLabStatus(lab.id);
                                    const labBg = isDark ? catAccent.bg : catAccent.bgLight;
                                    const labText = isDark ? catAccent.text : catAccent.textLight;
                                    return (
                                        <motion.div
                                            key={lab.id}
                                            variants={gridItemVariants}
                                            whileHover={{ scale: 1.03, y: -4 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => setPlayingLab(lab.id)}
                                            className={`relative p-7 rounded-[2rem] border transition-all cursor-pointer group overflow-hidden ${isDark
                                                ? 'bg-white/[0.03] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06] backdrop-blur-xl'
                                                : 'bg-white border-slate-200/60 hover:border-indigo-200 hover:bg-indigo-50/10 shadow-md'
                                                }`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${catAccent.gradient || 'from-indigo-500 to-purple-600'} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
                                            <div className="relative flex items-center justify-between mb-5">
                                                <motion.div
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${status === 'completed' ? 'bg-emerald-500/15' : labBg}`}
                                                    whileHover={{ scale: 1.15, rotate: -8 }}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                                >
                                                    {status === 'completed' ? (
                                                        <CheckCircle2 size={22} className="text-emerald-400" />
                                                    ) : status === 'in-progress' ? (
                                                        <Clock size={22} className="text-amber-400" />
                                                    ) : (
                                                        <Play size={22} className={`ml-0.5 ${labText}`} />
                                                    )}
                                                </motion.div>
                                                <div className="flex items-center gap-2">
                                                    {status && (
                                                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                                                            {status === 'completed' ? 'مكتمل ✅' : 'قيد العمل 🔄'}
                                                        </span>
                                                    )}
                                                    <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5 text-white/40 border border-white/5' : 'bg-slate-100 text-slate-500 border border-slate-200/50'}`}>
                                                        {lab.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className={`relative text-xl font-black mb-2 transition-colors ${isDark ? 'text-white/90 group-hover:text-white' : 'text-slate-800 group-hover:text-indigo-950'}`}>{lab.title}</h3>
                                            <p className={`relative text-sm leading-relaxed font-medium transition-colors ${isDark ? 'text-white/35 group-hover:text-white/50' : 'text-slate-500 group-hover:text-slate-650'}`}>{lab.desc}</p>
                                            {/* Launch arrow indicator */}
                                            <motion.div
                                                className={`absolute bottom-5 left-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                                initial={{ x: 10 }}
                                                whileHover={{ x: 0 }}
                                            >
                                                <ArrowRight size={18} className={isDark ? 'text-white/40' : 'text-indigo-400'} />
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Premium Lock Modal */}
            <AnimatePresence>
                {premiumLockLab && (() => {
                    const labMeta = LABS_MENU.find(l => l.id === premiumLockLab);
                    const price = getLabPrice(premiumLockLab);
                    return (
                        <motion.div
                            key="premium-lock"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={() => setPremiumLockLab(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.85, y: 40 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.85, y: 40 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl border border-amber-100"
                                dir="rtl"
                            >
                                <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-amber-200">
                                    <Lock size={40} className="text-amber-500" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 mb-2">مختبر مميز 🔒</h2>
                                <p className="text-slate-500 font-medium mb-2">هذا المختبر من النوع المدفوع:</p>
                                <p className="text-xl font-black text-slate-800 mb-6">{labMeta?.title}</p>
                                <div className="flex items-center justify-center gap-2 mb-8 bg-amber-50 px-6 py-4 rounded-2xl border border-amber-200">
                                    <Coins size={24} className="text-amber-500" />
                                    <span className="text-3xl font-black text-amber-600">{price}</span>
                                    <span className="text-slate-500 font-bold">عملة ذهبية</span>
                                </div>
                                <p className="text-sm text-slate-400 font-medium mb-8">
                                    يمكنك فتح هذا المختبر بالعملات الذهبية التي تجمعها من حل الدروس والتحديات أو بالشراء من المتجر.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setPremiumLockLab(null)}
                                        disabled={unlocking}
                                        className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={() => handleUnlockWithCoins(premiumLockLab)}
                                        disabled={unlocking}
                                        className="flex-1 py-3.5 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {unlocking ? <Loader2 size={18} className="animate-spin" /> : <Coins size={18} />}
                                        فتح بالعملات الان
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Lab Playing Overlay with smooth transition */}
            <AnimatePresence>
                {playingLab && (
                    <motion.div
                        key="lab-overlay"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className={`fixed inset-0 z-50 overflow-hidden flex flex-col p-4 md:p-8 ${isDark ? 'bg-[#050510] text-white' : 'bg-[#f8faff] text-slate-900'}`}
                        dir="rtl"
                    >
                        {/* Ambient Backgrounds */}
                        <motion.div
                            className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"
                            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                        />

                        <motion.button
                            onClick={handleBackFromLab}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(244,63,94,0.9)' }}
                            whileTap={{ scale: 0.9 }}
                            className={`absolute top-6 left-6 p-3 rounded-full transition-all border shadow-lg z-50 backdrop-blur-xl ${isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-md'}`}
                        >
                            <X size={24} />
                        </motion.button>
                        <div className="max-w-6xl mx-auto w-full h-full relative z-10 flex flex-col justify-center">
                            <LabErrorBoundary onReset={() => setPlayingLab(playingLab)} onBack={handleBackFromLab}>
                                <Suspense fallback={<LabLoadingFallback isDark={isDark} />}>
                                    {renderActiveLab()}
                                </Suspense>
                            </LabErrorBoundary>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
