import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sigma, TrendingUp, Layers, X, Play, Rocket, Sun, Moon, Binary, Scale, ShieldCheck, Target, LayoutGrid, ChevronLeft, ChevronRight, Triangle, Map, Zap, Calculator, GitBranch, Box, BarChart2, RefreshCcw, Dice5, Navigation, CheckCircle2, Clock, ArrowRight, Search } from 'lucide-react';
import { labProgressService } from '../../utils/labProgressService';
import { useTheme } from '../../context/ThemeContext';
import SEO from '../../components/common/SEO';

// Lab Imports (Preserved)
import ExpansionSimpleLab from '../../components/lesson/ExpansionSimpleLab';
import LabErrorBoundary from '../../components/lesson/LabErrorBoundary';

import ExpansionDoubleLab from '../../components/lesson/ExpansionDoubleLab';
import ExpansionIdentity1Lab from '../../components/lesson/ExpansionIdentity1Lab';
import ExpansionIdentity2Lab from '../../components/lesson/ExpansionIdentity2Lab';
import ExpansionIdentity3Lab from '../../components/lesson/ExpansionIdentity3Lab';
import VisualFactorizationLab from '../../components/lesson/VisualFactorizationLab';
import FactIdentity1Lab from '../../components/lesson/FactIdentity1Lab';
import FactIdentity2Lab from '../../components/lesson/FactIdentity2Lab';
import FactIdentity3Lab from '../../components/lesson/FactIdentity3Lab';
import PGCDDivisorsLab from '../../components/lesson/PGCDDivisorsLab';
import PGCDEuclideanLab from '../../components/lesson/PGCDEuclideanLab';
import PGCDSubtractionLab from '../../components/lesson/PGCDSubtractionLab';
import RootsSimplificationLab from '../../components/lesson/RootsSimplificationLab';
import RootsMultiplicationLab from '../../components/lesson/RootsMultiplicationLab';
import RootsDivisionLab from '../../components/lesson/RootsDivisionLab';
import RootsAdditionLab from '../../components/lesson/RootsAdditionLab';
import RootsSubtractionLab from '../../components/lesson/RootsSubtractionLab';
import RootsExpressionLab from '../../components/lesson/RootsExpressionLab';
import InequalitiesSolveLab from '../../components/lesson/InequalitiesSolveLab';
import InequalitiesGraphLab from '../../components/lesson/InequalitiesGraphLab';
import LinearImageLab from '../../components/lesson/LinearImageLab';
import LinearGraphLab from '../../components/lesson/LinearGraphLab';
import LinearFormulaLab from '../../components/lesson/LinearFormulaLab';
import AffineImageLab from '../../components/lesson/AffineImageLab';
import AffineGraphLab from '../../components/lesson/AffineGraphLab';
import AffineFormulaLab from '../../components/lesson/AffineFormulaLab';
import EquationsLab from '../../components/lesson/EquationsLab';
import EquationsProductLab from '../../components/lesson/EquationsProductLab';
import PythVerifyLab from '../../components/lesson/PythVerifyLab';
import PythHypotenuseLab from '../../components/lesson/PythHypotenuseLab';
import PythLegLab from '../../components/lesson/PythLegLab';
import PythProblemsLab from '../../components/lesson/PythProblemsLab';
import ThalesVerifyLab from '../../components/lesson/ThalesVerifyLab';
import ThalesLengthLab from '../../components/lesson/ThalesLengthLab';
import ThalesProblemsLab from '../../components/lesson/ThalesProblemsLab';
import PowersLab from '../../components/lesson/PowersLab';
import ScientificNotationLab from '../../components/lesson/ScientificNotationLab';
import FractionSimplifyLab from '../../components/lesson/FractionSimplifyLab';
import CoprimeLab from '../../components/lesson/CoprimeLab';
import DivisorDiscovery from '../../components/lesson/DivisorDiscovery';
import DivisorPropertiesLab from '../../components/lesson/DivisorPropertiesLab';
import SysSubstitutionLab from '../../components/lesson/SysSubstitutionLab';
import SysAdditionLab from '../../components/lesson/SysAdditionLab';
import SystemsGraphLab from '../../components/lesson/SystemsGraphLab';
import SysStrategyLab from '../../components/lesson/SysStrategyLab';
import VecConceptLab from '../../components/lesson/VecConceptLab';
import VecReadLab from '../../components/lesson/VecReadLab';
import VecCalcLab from '../../components/lesson/VecCalcLab';
import VecMidpointLab from '../../components/lesson/VecMidpointLab';
import VecDistanceLab from '../../components/lesson/VecDistanceLab';
import VecChaslesLab from '../../components/lesson/VecChaslesLab';
import VecParallelogramLab from '../../components/lesson/VecParallelogramLab';
import VecRandomAddLab from '../../components/lesson/VecRandomAddLab';
import VecSameEndLab from '../../components/lesson/VecSameEndLab';
import TrigNamingLab from '../../components/lesson/TrigNamingLab';
import TrigCosLab from '../../components/lesson/TrigCosLab';
import TrigSinLab from '../../components/lesson/TrigSinLab';
import TrigTanLab from '../../components/lesson/TrigTanLab';
import TrigLengthLab from '../../components/lesson/TrigLengthLab';
import TrigAngleLab from '../../components/lesson/TrigAngleLab';
import TrigIdentitiesLab from '../../components/lesson/TrigIdentitiesLab';
import TrigSpecialLab from '../../components/lesson/TrigSpecialLab';
import GeoSolidsLab from '../../components/lesson/GeoSolidsLab';
import GeoNetLab from '../../components/lesson/GeoNetLab';
import GeoVolumeLab from '../../components/lesson/GeoVolumeLab';
import GeoSectionLab from '../../components/lesson/GeoSectionLab';
import GeoPyramidLab from '../../components/lesson/GeoPyramidLab';
import StatFreqLab from '../../components/lesson/StatFreqLab';
import StatMeanLab from '../../components/lesson/StatMeanLab';
import StatCumulativeLab from '../../components/lesson/StatCumulativeLab';
import StatChartLab from '../../components/lesson/StatChartLab';
import ProbabilityMasteryLab from '../../components/lesson/ProbabilityMasteryLab';
import RotationMasteryLab from '../../components/lesson/RotationMasteryLab';
import PythVisualProofLab from '../../components/lesson/PythVisualProofLab';
import ThalesInteractiveLab from '../../components/lesson/ThalesInteractiveLab';


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
    { id: 'expansion', title: 'النشر والتبسيط', icon: Rocket, color: 'indigo', gradient: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', domain: 'algebra' },
    { id: 'factorization', title: 'التحليل الجبري', icon: Layers, color: 'violet', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', domain: 'algebra' },
    { id: 'pgcd', title: 'القواسم (PGCD)', icon: Target, color: 'emerald', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', domain: 'arithmetic' },
    { id: 'roots', title: 'الجذور التربيعية', icon: Sigma, color: 'rose', gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', domain: 'arithmetic' },
    { id: 'equations', title: 'المعادلات', icon: Binary, color: 'amber', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', domain: 'algebra' },
    { id: 'inequalities', title: 'المتراجحات', icon: ShieldCheck, color: 'cyan', gradient: 'from-cyan-500 to-sky-600', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', domain: 'algebra' },
    { id: 'linear', title: 'الدالة الخطية', icon: TrendingUp, color: 'sky', gradient: 'from-sky-500 to-blue-600', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30', domain: 'algebra' },
    { id: 'affine', title: 'الدالة التآلفية', icon: BookOpen, color: 'orange', gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', domain: 'algebra' },
    { id: 'pythagoras', title: 'نظرية فيثاغورس', icon: Triangle, color: 'rose', gradient: 'from-rose-500 to-red-600', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', domain: 'geometry' },
    { id: 'thales', title: 'نظرية طاليس', icon: Map, color: 'blue', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', domain: 'geometry' },
    { id: 'powers', title: 'القوى', icon: Zap, color: 'yellow', gradient: 'from-yellow-500 to-amber-600', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', domain: 'arithmetic' },
    { id: 'fractions', title: 'الكسور', icon: Calculator, color: 'lime', gradient: 'from-lime-500 to-green-600', bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30', domain: 'arithmetic' },
    { id: 'systems', title: 'جملة معادلتين', icon: GitBranch, color: 'teal', gradient: 'from-teal-500 to-emerald-600', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30', domain: 'algebra' },
    { id: 'vectors', title: 'الأشعة والانسحاب', icon: Navigation, color: 'fuchsia', gradient: 'from-fuchsia-500 to-pink-600', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', domain: 'geometry' },
    { id: 'trig', title: 'الحساب المثلثي', icon: Triangle, color: 'pink', gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30', domain: 'geometry' },
    { id: 'geometry-3d', title: 'الهندسة الفضائية', icon: Box, color: 'purple', gradient: 'from-purple-500 to-indigo-600', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', domain: 'geometry' },
    { id: 'stats', title: 'الإحصاء', icon: BarChart2, color: 'green', gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', domain: 'stats' },
    { id: 'rotation', title: 'الدوران', icon: RefreshCcw, color: 'fuchsia', gradient: 'from-fuchsia-500 to-violet-600', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', domain: 'geometry' },
    { id: 'probability', title: 'الاحتمالات', icon: Dice5, color: 'slate', gradient: 'from-slate-400 to-slate-600', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', domain: 'stats' },
];

export default function MasteryWorld() {
    const { isDark } = useTheme();
    const [activeCategory, setActiveCategory] = useState(null);
    const [playingLab, setPlayingLab] = useState(null);
    const [labProgress, setLabProgress] = useState([]);
    const [activeDomain, setActiveDomain] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProgress();
    }, []);

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
        const p = { isDarkMode: isDark };
        const labs = {
            'exp-simple': <ExpansionSimpleLab {...p} />, 'exp-double': <ExpansionDoubleLab {...p} />,
            'id1': <ExpansionIdentity1Lab {...p} />, 'id2': <ExpansionIdentity2Lab {...p} />, 'id3': <ExpansionIdentity3Lab {...p} />,
            'fact-common': <VisualFactorizationLab {...p} />, 'fact-id1': <FactIdentity1Lab {...p} />, 'fact-id2': <FactIdentity2Lab {...p} />, 'fact-id3': <FactIdentity3Lab {...p} />,
            'pgcd-divisors': <PGCDDivisorsLab {...p} />, 'pgcd-subtraction': <PGCDSubtractionLab {...p} />, 'pgcd-euclidean': <PGCDEuclideanLab {...p} />,
            'roots-simplification': <RootsSimplificationLab {...p} />, 'roots-multiplication': <RootsMultiplicationLab {...p} />,
            'roots-division': <RootsDivisionLab {...p} />, 'roots-addition': <RootsAdditionLab {...p} />,
            'roots-subtraction': <RootsSubtractionLab {...p} />, 'roots-expression': <RootsExpressionLab {...p} />,
            'eq-solve': <EquationsLab {...p} />, 'eq-product': <EquationsProductLab {...p} />,
            'ineq-solve': <InequalitiesSolveLab {...p} />, 'ineq-graph': <InequalitiesGraphLab {...p} />,
            'lin-image': <LinearImageLab {...p} />, 'lin-graph': <LinearGraphLab {...p} />, 'lin-formula': <LinearFormulaLab {...p} />,
            'aff-image': <AffineImageLab {...p} />, 'aff-graph': <AffineGraphLab {...p} />, 'aff-formula': <AffineFormulaLab {...p} />,
            'pyth-verify': <PythVerifyLab {...p} />, 'pyth-hyp': <PythHypotenuseLab {...p} />, 'pyth-leg': <PythLegLab {...p} />, 'pyth-prob': <PythProblemsLab {...p} />,
            'pyth-visual': <PythVisualProofLab {...p} />,
            'thales-verify': <ThalesVerifyLab {...p} />, 'thales-length': <ThalesLengthLab {...p} />, 'thales-prob': <ThalesProblemsLab {...p} />,
            'thales-shadow': <ThalesInteractiveLab {...p} />,
            'powers-rules': <PowersLab {...p} />, 'scientific-not': <ScientificNotationLab {...p} />,
            'frac-simplify': <FractionSimplifyLab {...p} />, 'coprime': <CoprimeLab {...p} />,
            'div-discover': <DivisorDiscovery {...p} />, 'div-props': <DivisorPropertiesLab {...p} />,
            'sys-subst': <SysSubstitutionLab {...p} />, 'sys-add': <SysAdditionLab {...p} />,
            'sys-graph': <SystemsGraphLab {...p} />, 'sys-strategy': <SysStrategyLab {...p} />,
            'vec-concept': <VecConceptLab {...p} />, 'vec-read': <VecReadLab {...p} />,
            'vec-calc': <VecCalcLab {...p} />, 'vec-midpoint': <VecMidpointLab {...p} />,
            'vec-distance': <VecDistanceLab {...p} />, 'vec-chasles': <VecChaslesLab {...p} />,
            'vec-para': <VecParallelogramLab {...p} />, 'vec-rand': <VecRandomAddLab {...p} />,
            'vec-same-end': <VecSameEndLab {...p} />,
            'trig-naming': <TrigNamingLab {...p} />, 'trig-cos': <TrigCosLab {...p} />,
            'trig-sin': <TrigSinLab {...p} />, 'trig-tan': <TrigTanLab {...p} />,
            'trig-length': <TrigLengthLab {...p} />, 'trig-angle': <TrigAngleLab {...p} />,
            'trig-identities': <TrigIdentitiesLab {...p} />, 'trig-special': <TrigSpecialLab {...p} />,
            'geo-solids': <GeoSolidsLab {...p} />, 'geo-net': <GeoNetLab {...p} />,
            'geo-volume': <GeoVolumeLab {...p} />, 'geo-section': <GeoSectionLab {...p} />,
            'geo-pyramid': <GeoPyramidLab {...p} />,
            'stat-freq': <StatFreqLab {...p} />, 'stat-mean': <StatMeanLab {...p} />,
            'stat-cumulative': <StatCumulativeLab {...p} />, 'stat-chart': <StatChartLab {...p} />,
            'rotation-mastery': <RotationMasteryLab {...p} />,
            'prob-mastery': <ProbabilityMasteryLab {...p} />
        };
        return labs[playingLab] || <div className={`text-center p-20 font-bold opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>قيد التطوير...</div>;
    };

    // Stagger variants for grid children
    const gridContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.06, delayChildren: 0.1 }
        }
    };
    const gridItemVariants = {
        hidden: { opacity: 0, y: 24, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 24 } }
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

    // Filter categories based on selected domain
    const filteredCategories = CATEGORIES.filter(cat => 
        activeDomain === 'all' || cat.domain === activeDomain
    );

    // If search query is active, filter labs directly
    const filteredSearchLabs = LABS_MENU.filter(lab => {
        const matchesSearch = lab.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              lab.desc.toLowerCase().includes(searchQuery.toLowerCase());
        
        const category = CATEGORIES.find(c => c.id === lab.type);
        const matchesDomain = activeDomain === 'all' || (category && category.domain === activeDomain);

        return matchesSearch && matchesDomain;
    });

    return (
        <div className="space-y-8 relative" dir="rtl">
            <SEO 
                title="مختبرات الإتقان الرياضي" 
                description="استكشف مختبرات الإتقان الرياضي التفاعلية وجرب بنفسك القوانين والحلول الرياضية."
            />

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
                           className={`relative px-5 py-2.5 rounded-xl font-black text-sm transition-colors duration-300 whitespace-nowrap cursor-pointer z-10 ${
                               activeDomain === domain.id 
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
                                        const labBg = isDark ? catAccent.bg : `bg-${catAccent.color}-500/10`;
                                        const labText = isDark ? catAccent.text : `text-${catAccent.color}-600`;
                                        return (
                                            <motion.div
                                                key={lab.id}
                                                whileHover={{ scale: 1.03, y: -4 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setPlayingLab(lab.id)}
                                                className={`relative p-7 rounded-[2rem] border transition-all cursor-pointer group overflow-hidden ${
                                                    isDark 
                                                        ? 'bg-white/[0.03] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06]' 
                                                        : 'bg-white border-slate-200/60 hover:border-indigo-200 hover:bg-indigo-50/10 shadow-md'
                                                }`}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${catAccent.gradient || 'from-indigo-500 to-purple-600'} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
                                                <div className="relative flex items-center justify-between mb-5">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${status === 'completed' ? 'bg-emerald-500/15' : labBg} group-hover:scale-110`}>
                                                        {status === 'completed' ? (
                                                            <CheckCircle2 size={22} className="text-emerald-400" />
                                                        ) : status === 'in-progress' ? (
                                                            <Clock size={22} className="text-amber-400" />
                                                        ) : (
                                                            <Play size={22} className={`ml-0.5 ${labText}`} />
                                                        )}
                                                    </div>
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
                                const catBg = isDark ? cat.bg : `bg-${cat.color}-500/10`;
                                const catText = isDark ? cat.text : `text-${cat.color}-600`;
                                const categoryLabsCount = LABS_MENU.filter(l => l.type === cat.id).length;

                                return (
                                    <motion.button
                                        key={cat.id}
                                        variants={gridItemVariants}
                                        whileHover={{ scale: 1.04, y: -4 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`relative flex flex-col items-center justify-center p-8 md:p-10 rounded-[2rem] border transition-all duration-300 group overflow-hidden cursor-pointer ${
                                            isDark 
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
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                            isDark 
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
                                                return <Icon size={32} className={isDark ? catAccent.text : `text-${catAccent.color}-600`} />;
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
                                    const labBg = isDark ? catAccent.bg : `bg-${catAccent.color}-500/10`;
                                    const labText = isDark ? catAccent.text : `text-${catAccent.color}-600`;
                                    return (
                                        <motion.div
                                            key={lab.id}
                                            variants={gridItemVariants}
                                            whileHover={{ scale: 1.03, y: -4 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => setPlayingLab(lab.id)}
                                            className={`relative p-7 rounded-[2rem] border transition-all cursor-pointer group overflow-hidden ${
                                                isDark 
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
                                {renderActiveLab()}
                            </LabErrorBoundary>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
