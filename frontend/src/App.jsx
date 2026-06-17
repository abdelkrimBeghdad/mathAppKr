import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import GuestLayout from './layouts/GuestLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import LoadingScreen from './components/LoadingScreen';
import FeatureGate from './components/FeatureGate';
import { Toaster } from 'react-hot-toast';
import { Activity } from 'lucide-react';
import { HelmetProvider } from 'react-helmet-async';
import ContentManagement from './pages/admin/Content';
import SiteGovernance from './pages/admin/SiteGovernance';

const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const BackupManagement = lazy(() => import('./pages/admin/BackupManagement'));
const LiveSessionBoard = lazy(() => import('./pages/admin/LiveSessionBoard'));
const StudentManagement = lazy(() => import('./pages/admin/Students'));
const AdminTournaments = lazy(() => import('./pages/admin/Tournaments'));
const SecurityMonitor = lazy(() => import('./pages/admin/SecurityMonitor'));
const ForumModerator = lazy(() => import('./pages/admin/ForumModerator'));
const StoreManager = lazy(() => import('./pages/admin/StoreManager'));
const PedagogicalAnalytics = lazy(() => import('./pages/admin/PedagogicalAnalytics'));
const BroadcastCenter = lazy(() => import('./pages/admin/BroadcastCenter'));
// const SiteGovernance = lazy(() => import('./pages/admin/SiteGovernance')); (moved to top)
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const LessonView = lazy(() => import('./pages/student/LessonView'));
const Certificates = lazy(() => import('./pages/student/Certificates'));
const Store = lazy(() => import('./pages/student/Store'));
const Forum = lazy(() => import('./pages/student/Forum'));
const ForumCreate = lazy(() => import('./pages/student/ForumCreate'));
const QuestionDetail = lazy(() => import('./pages/student/QuestionDetail'));
const Tournaments = lazy(() => import('./pages/student/Tournaments'));
const TournamentDetail = lazy(() => import('./pages/student/TournamentDetail'));
const TournamentArena = lazy(() => import('./pages/student/TournamentArena'));
const ArcadeMode = lazy(() => import('./pages/student/ArcadeMode'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const GeometrySketchpadView = lazy(() => import('./pages/student/GeometrySketchpadView'));
const EquationSystemLab = lazy(() => import('./pages/student/labs/EquationSystemLab'));
const LinearFunctionLab = lazy(() => import('./pages/student/labs/LinearFunctionLab'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const InteractiveLessonView = lazy(() => import('./pages/student/InteractiveLessonView'));
const LabsExplorer = lazy(() => import('./pages/student/LabsExplorer'));
const MasteryWorld = lazy(() => import('./pages/student/MasteryWorld'));
const RootsLab = lazy(() => import('./components/lesson/RootsLab'));
const EuclideanAlgorithm = lazy(() => import('./components/lesson/EuclideanAlgorithm'));
const PowersLab = lazy(() => import('./components/lesson/PowersLab'));
const FractionSimplifyLab = lazy(() => import('./components/lesson/FractionSimplifyLab'));
const PythagorasLab = lazy(() => import('./components/lesson/PythVisualProofLab'));
const ThalesLab = lazy(() => import('./components/lesson/ThalesInteractiveLab'));
const TrigonometryLab = lazy(() => import('./components/lesson/TrigNamingLab'));
const VectorsLab = lazy(() => import('./components/lesson/VecConceptLab'));
const FactorizationLab = lazy(() => import('./components/lesson/FactorizationLab'));
const SystemsLab = lazy(() => import('./components/lesson/SystemsLab'));
const ScientificNotationLab = lazy(() => import('./components/lesson/ScientificNotationLab'));
const InequalitiesLab = lazy(() => import('./components/lesson/InequalitiesLab'));
const RotationLab = lazy(() => import('./components/lesson/RotationMasteryLab'));
const ProbabilityLab = lazy(() => import('./components/lesson/ProbabilityMasteryLab'));
const AffineFunctionsLab = lazy(() => import('./components/lesson/AffineFunctionsLab'));
const CoprimeLab = lazy(() => import('./components/lesson/CoprimeLab'));
const DivisorDiscovery = lazy(() => import('./components/lesson/DivisorDiscovery'));
const EquationsProductLab = lazy(() => import('./components/lesson/EquationsProductLab'));
const IdentitiesLab = lazy(() => import('./components/lesson/IdentitiesLab'));
const MidpointDistanceLab = lazy(() => import('./components/lesson/VecMidpointLab'));
const RegularPolygonsLab = lazy(() => import('./components/lesson/GeoSolidsLab'));
const TrigRelationsLab = lazy(() => import('./components/lesson/TrigIdentitiesLab'));
const VectorCoordinatesLab = lazy(() => import('./components/lesson/VecReadLab'));
const WordProblemsLab = lazy(() => import('./components/lesson/InteractiveMathLesson'));

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <Suspense fallback={<LoadingScreen message="جاري التحميل..." />}>
          <Routes>
            <Route path="/login" element={<GuestLayout />}>
              <Route index element={<Login />} />
            </Route>

            <Route path="/privacy" element={<PrivacyPolicy />} />

            <Route path="/parent" element={<ParentDashboard />} />

            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="content" element={<ContentManagement />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="tournaments" element={<AdminTournaments />} />
              <Route path="security" element={<SecurityMonitor />} />
              <Route path="forum" element={<ForumModerator />} />
              <Route path="store" element={<StoreManager />} />
              <Route path="analytics-deep" element={<PedagogicalAnalytics />} />
              <Route path="broadcast" element={<BroadcastCenter />} />
              <Route path="live-session" element={<LiveSessionBoard />} />
              <Route path="backups" element={<BackupManagement />} />
              <Route path="settings" element={<SiteGovernance />} />
            </Route>

            <Route path="/student" element={
              <ProtectedRoute requireStudent={true}>
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StudentDashboard />} />
              <Route path="lessons/:lessonId" element={<LessonView />} />
              <Route path="lessons/:lessonId/interactive" element={<InteractiveLessonView />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="store" element={<FeatureGate featureName="store"><Store /></FeatureGate>} />
              <Route path="forum" element={<Forum />} />
              <Route path="forum/create" element={<ForumCreate />} />
              <Route path="forum/:questionId" element={<QuestionDetail />} />
              <Route path="tournaments" element={<FeatureGate featureName="arena"><Tournaments /></FeatureGate>} />
              <Route path="tournaments/:tournamentId" element={<TournamentDetail />} />
              <Route path="tournaments/:tournamentId/arena" element={<TournamentArena />} />
              <Route path="arcade" element={<FeatureGate featureName="arcade"><ArcadeMode /></FeatureGate>} />
              <Route path="sketchpad" element={<GeometrySketchpadView />} />
              <Route path="labs" element={<FeatureGate featureName="labs"><LabsExplorer /></FeatureGate>} />
              <Route path="labs/roots" element={<FeatureGate featureName="labs"><RootsLab /></FeatureGate>} />
              <Route path="labs/pgcd" element={<FeatureGate featureName="labs"><EuclideanAlgorithm /></FeatureGate>} />
              <Route path="labs/powers" element={<FeatureGate featureName="labs"><PowersLab /></FeatureGate>} />
              <Route path="labs/fractions" element={<FeatureGate featureName="labs"><FractionSimplifyLab /></FeatureGate>} />
              <Route path="labs/pythagoras" element={<FeatureGate featureName="labs"><PythagorasLab /></FeatureGate>} />
              <Route path="labs/thales" element={<FeatureGate featureName="labs"><ThalesLab /></FeatureGate>} />
              <Route path="labs/trigonometry" element={<FeatureGate featureName="labs"><TrigonometryLab /></FeatureGate>} />
              <Route path="labs/vectors" element={<FeatureGate featureName="labs"><VectorsLab /></FeatureGate>} />
              <Route path="labs/factorization" element={<FeatureGate featureName="labs"><FactorizationLab /></FeatureGate>} />
              <Route path="labs/systems" element={<FeatureGate featureName="labs"><SystemsLab /></FeatureGate>} />
              <Route path="labs/scientific" element={<FeatureGate featureName="labs"><ScientificNotationLab /></FeatureGate>} />
              <Route path="labs/inequalities" element={<FeatureGate featureName="labs"><InequalitiesLab /></FeatureGate>} />
              <Route path="labs/rotation" element={<FeatureGate featureName="labs"><RotationLab /></FeatureGate>} />
              <Route path="labs/probability" element={<FeatureGate featureName="labs"><ProbabilityLab /></FeatureGate>} />
              <Route path="labs/affine-functions" element={<FeatureGate featureName="labs"><AffineFunctionsLab /></FeatureGate>} />
              <Route path="labs/coprime" element={<FeatureGate featureName="labs"><CoprimeLab /></FeatureGate>} />
              <Route path="labs/divisor-discovery" element={<FeatureGate featureName="labs"><DivisorDiscovery /></FeatureGate>} />
              <Route path="labs/equations-product" element={<FeatureGate featureName="labs"><EquationsProductLab /></FeatureGate>} />
              <Route path="labs/identities" element={<FeatureGate featureName="labs"><IdentitiesLab /></FeatureGate>} />
              <Route path="labs/midpoint-distance" element={<FeatureGate featureName="labs"><MidpointDistanceLab /></FeatureGate>} />
              <Route path="labs/regular-polygons" element={<FeatureGate featureName="labs"><RegularPolygonsLab /></FeatureGate>} />
              <Route path="labs/trig-relations" element={<FeatureGate featureName="labs"><TrigRelationsLab /></FeatureGate>} />
              <Route path="labs/vector-coordinates" element={<FeatureGate featureName="labs"><VectorCoordinatesLab /></FeatureGate>} />
              <Route path="labs/word-problems" element={<FeatureGate featureName="labs"><WordProblemsLab /></FeatureGate>} />
              <Route path="mastery-world" element={<MasteryWorld />} />
              <Route path="labs/equations" element={<FeatureGate featureName="labs"><EquationSystemLab /></FeatureGate>} />
              <Route path="labs/linear-function" element={<FeatureGate featureName="labs"><LinearFunctionLab /></FeatureGate>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
        <PWAInstallPrompt />
      </AuthProvider>
    </HelmetProvider >
  );
}

export default App;
