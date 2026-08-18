<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Student\LearningPathController;
use App\Http\Controllers\Student\TournamentController;
use App\Http\Controllers\Student\ArcadeController;
use App\Http\Controllers\Student\TutorController;
use App\Http\Controllers\Student\RewardController;
use App\Http\Controllers\Student\ForumController;
use App\Http\Controllers\Student\LabProgressController;


Route::middleware('throttle:10,1')->post('/register', [AuthController::class , 'register']);
Route::middleware('throttle:10,1')->post('/login', [AuthController::class , 'login']);

// Parent Login (public)
// إصلاح خلل حقيقي: هذا المسار لم يكن محميًا بأي حد لعدد المحاولات إطلاقًا،
// خلافاً لـ/login و/register (10 محاولات/دقيقة). وهو أخطر من الدخول العادي
// لأنه يعتمد على رقم هاتف + إيميل الطالب فقط بلا كلمة سر — عرضة لهجوم
// تخمين آلي (brute-force) على مجموعات محتملة من الأرقام/الإيميلات. الحد هنا
// أشد (5 بدل 10) لأن سطح الهجوم المحتمل أخطر.
Route::middleware('throttle:5,1')->post('/parent/login', [\App\Http\Controllers\ParentController::class , 'login']);

// Broadcast Auth Route for Sanctum
Route::post('/broadcasting/auth', function (Request $request) {
    return Broadcast::auth($request);
})->middleware('auth:sanctum');


Route::middleware(['auth:sanctum', 'restrict.parent'])->group(function () {
    Route::post('/logout', [AuthController::class , 'logout']);
    Route::get('/user', function (Request $request) {
            return $request->user();
        }
        );

        // Notification Routes
        Route::get('/notifications', [\App\Http\Controllers\NotificationController::class , 'index']);
        Route::put('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class , 'markAsRead']);
        Route::put('/notifications/read-all', [\App\Http\Controllers\NotificationController::class , 'markAllAsRead']);

        // Parent Dashboard Route
        Route::get('/parent/dashboard', [\App\Http\Controllers\ParentController::class , 'dashboard'])->name('parent.dashboard');

        // Admin Routes
        Route::group(['prefix' => 'admin', 'middleware' => ['admin', 'admin.audit']], function () {
            Route::get('/fields', [\App\Http\Controllers\Admin\ContentController::class , 'indexFields']);
            Route::post('/fields', [\App\Http\Controllers\Admin\ContentController::class , 'storeField']);
            Route::put('/fields/{field}', [\App\Http\Controllers\Admin\ContentController::class , 'updateField']);
            Route::delete('/fields/{field}', [\App\Http\Controllers\Admin\ContentController::class , 'destroyField']);

            Route::post('/sections', [\App\Http\Controllers\Admin\ContentController::class , 'storeSection']);
            Route::put('/sections/{section}', [\App\Http\Controllers\Admin\ContentController::class , 'updateSection']);
            Route::delete('/sections/{section}', [\App\Http\Controllers\Admin\ContentController::class , 'destroySection']);

            Route::get('/lessons/{lesson}', [\App\Http\Controllers\Admin\ContentController::class , 'getLesson']);
            Route::post('/lessons', [\App\Http\Controllers\Admin\ContentController::class , 'storeLesson']);
            Route::put('/lessons/{lesson}', [\App\Http\Controllers\Admin\ContentController::class , 'updateLesson']);
            Route::delete('/lessons/{lesson}', [\App\Http\Controllers\Admin\ContentController::class , 'destroyLesson']);

            Route::get('/users', [\App\Http\Controllers\Admin\UserController::class , 'index']);
            Route::post('/users', [\App\Http\Controllers\Admin\UserController::class , 'store']);
            Route::put('/users/{user}', [\App\Http\Controllers\Admin\UserController::class , 'update']);
            Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserController::class , 'destroy']);
            Route::get('/users/{user}/progress', [\App\Http\Controllers\Admin\UserController::class , 'showProgress']);
            Route::put('/users/{user}/progress/{lesson}', [\App\Http\Controllers\Admin\UserController::class , 'updateLessonStatus']);

            // Analytics
            Route::get('/analytics', function () {
                    return redirect('/api/admin/analytics/stats');
                }
                );
                Route::get('/analytics/stats', [\App\Http\Controllers\Admin\AnalyticsController::class , 'index']);
                Route::get('/analytics/deep-insights', [\App\Http\Controllers\Admin\AnalyticsController::class , 'deepInsights']);
                Route::get('/analytics/activity', [\App\Http\Controllers\Admin\AnalyticsController::class , 'studentActivity']);

                // Broadcast
                Route::post('/broadcast/send', [\App\Http\Controllers\Admin\BroadcastController::class , 'send']);

                Route::apiResource('/tournaments', \App\Http\Controllers\Admin\TournamentController::class);

                // Security Monitoring
                Route::get('/security/stats', [\App\Http\Controllers\Admin\SecurityController::class , 'statistics']);
                Route::get('/security/incidents', [\App\Http\Controllers\Admin\SecurityController::class , 'index']);
                Route::post('/security/users/{user}/suspend', [\App\Http\Controllers\Admin\SecurityController::class , 'suspendUser']);
                Route::post('/security/users/{user}/unsuspend', [\App\Http\Controllers\Admin\SecurityController::class , 'unsuspendUser']);

                // Forum Moderation
                Route::get('/forum/stats', [\App\Http\Controllers\Admin\ForumController::class , 'statistics']);
                Route::get('/forum/questions', [\App\Http\Controllers\Admin\ForumController::class , 'index']);
                Route::delete('/forum/questions/{question}', [\App\Http\Controllers\Admin\ForumController::class , 'destroy']);
                Route::delete('/forum/answers/{answer}', [\App\Http\Controllers\Admin\ForumController::class , 'destroyAnswer']);
                Route::post('/forum/questions/{question}/pin', [\App\Http\Controllers\Admin\ForumController::class , 'togglePin']);
                Route::post('/forum/questions/{question}/lock', [\App\Http\Controllers\Admin\ForumController::class , 'toggleLock']);

                // Store Management
                Route::get('/store/stats', [\App\Http\Controllers\Admin\StoreController::class , 'statistics']);
                Route::get('/store/items', [\App\Http\Controllers\Admin\StoreController::class , 'index']);
                Route::post('/store/items', [\App\Http\Controllers\Admin\StoreController::class , 'store']);
                Route::put('/store/items/{item}', [\App\Http\Controllers\Admin\StoreController::class , 'update']);
                Route::delete('/store/items/{item}', [\App\Http\Controllers\Admin\StoreController::class , 'destroy']);

                // Backup Management
                Route::get('/backups', [\App\Http\Controllers\Admin\BackupController::class , 'index']);
                Route::post('/backups', [\App\Http\Controllers\Admin\BackupController::class , 'create']);
                Route::get('/backups/{fileName}/download', [\App\Http\Controllers\Admin\BackupController::class , 'download']);
                Route::delete('/backups/{fileName}', [\App\Http\Controllers\Admin\BackupController::class , 'destroy']);
            }
            );

            // Student Routes (Protected by Suspension check)
            Route::middleware(['check.suspension', 'throttle:60,1'])->group(function () {
            Route::get('/student/structure', [\App\Http\Controllers\Student\LearningController::class , 'index']);
            Route::get('/student/lessons/{lesson}', [\App\Http\Controllers\Student\LearningController::class , 'showLesson'])
                ->middleware('strict.access');
            Route::post('/student/lessons/{lesson}/progress', [\App\Http\Controllers\Student\LearningController::class , 'updateProgress']);

            // Gamification Routes
            Route::get('/leaderboard', [\App\Http\Controllers\LeaderboardController::class , 'index']);
            Route::get('/student/stats', [\App\Http\Controllers\LeaderboardController::class , 'userStats']);
            Route::get('/student/mastery', [\App\Http\Controllers\Student\LearningController::class , 'getMasteryStats']);
            Route::get('/students/players', [\App\Http\Controllers\LeaderboardController::class , 'getPlayers']);

            // Store Routes
            Route::get('/store', [\App\Http\Controllers\Student\StoreController::class , 'index'])
                ->middleware('strict.access:store');
            Route::post('/store/items/{item}/purchase', [\App\Http\Controllers\Student\StoreController::class , 'purchase']);
            Route::post('/store/items/{item}/equip', [\App\Http\Controllers\Student\StoreController::class , 'equip']);

            // Learning Path Route
            Route::get('/learning-path', [LearningPathController::class , 'getRecommendations']);

            // Tournament Routes
            Route::get('/tournaments', [TournamentController::class , 'index'])
                ->middleware('strict.access:tournaments');
            Route::get('/tournaments/{tournament}', [TournamentController::class , 'show']);
            Route::post('/tournaments/{tournament}/join', [TournamentController::class , 'join']);
            Route::get('/tournaments/{tournament}/questions', [TournamentController::class , 'getQuestions']);
            Route::post('/tournaments/{tournament}/submit', [TournamentController::class , 'submitScore'])
                ->middleware(['throttle:30,1', \App\Http\Middleware\AntiCheatMiddleware::class]);
            Route::get('/tournaments/{tournament}/leaderboard', [TournamentController::class , 'leaderboard']);

            // Arcade Routes
            Route::get('/arcade/questions', [ArcadeController::class , 'getQuestions'])
                ->middleware('strict.access:arcade');
            Route::post('/arcade/submit', [ArcadeController::class , 'submitScore'])
                ->middleware(['throttle:30,1', \App\Http\Middleware\AntiCheatMiddleware::class]);
            Route::get('/arcade/leaderboard', [ArcadeController::class , 'leaderboard']);

            // AI Tutor Routes
            Route::post('/tutor/hint', [TutorController::class , 'getHint']);
            Route::get('/tutor/explain/{lesson}', [TutorController::class , 'explainStep']);

            // Daily Reward Routes
            Route::get('/rewards/daily/status', [RewardController::class , 'getDailyStatus']);
            Route::post('/rewards/daily/claim', [RewardController::class , 'claimDaily']);
            Route::post('/rewards/lab/claim', [RewardController::class , 'awardLabCompletion'])
                ->middleware('throttle:30,1');

            // Forum Routes
            Route::get('/forum', [ForumController::class , 'index']);
            Route::post('/forum', [ForumController::class , 'store']);
            Route::get('/forum/{question}', [ForumController::class , 'show']);
            Route::post('/forum/{question}/vote', [ForumController::class , 'voteQuestion']);
            Route::get('/forum/{question}/vote', [ForumController::class , 'getQuestionVotes']);
            Route::post('/forum/{question}/answers', [ForumController::class , 'storeAnswer']);
            Route::post('/forum/answers/{answer}/vote', [ForumController::class , 'voteAnswer']);
            Route::post('/forum/answers/{answer}/accept', [ForumController::class , 'markSolved']);

            // Personal Goals Routes
            Route::get('/student/goals', [\App\Http\Controllers\PersonalGoalController::class , 'index']);
            Route::post('/student/goals', [\App\Http\Controllers\PersonalGoalController::class , 'store']);
            Route::put('/student/goals/{goal}/progress', [\App\Http\Controllers\PersonalGoalController::class , 'updateProgress']);
            Route::delete('/student/goals/{goal}', [\App\Http\Controllers\PersonalGoalController::class , 'destroy']);

            // Search Route
            Route::get('/search', [\App\Http\Controllers\Student\SearchController::class , 'search']);

            // Quiz Routes
            Route::get('/student/lessons/{lesson}/quiz', [\App\Http\Controllers\Student\QuizController::class , 'getQuiz'])
                ->middleware('strict.access');
            Route::post('/student/lessons/{lesson}/quiz', [\App\Http\Controllers\Student\QuizController::class , 'submitQuiz'])
                ->middleware(['throttle:30,1', \App\Http\Middleware\AntiCheatMiddleware::class]);

            // Live Activity Routes
            Route::post('/student/lessons/{lesson}/activity', [\App\Http\Controllers\Student\ActivityController::class , 'log']);

            // Battle Routes
            Route::get('/student/battles', [\App\Http\Controllers\Student\BattleController::class , 'index']);
            Route::post('/student/battles', [\App\Http\Controllers\Student\BattleController::class , 'createChallenge']);
            Route::post('/student/battles/{battle}/submit', [\App\Http\Controllers\Student\BattleController::class , 'submitScore'])
                ->middleware(['throttle:30,1', \App\Http\Middleware\AntiCheatMiddleware::class]);
            // Content Access & Unlocking
            Route::post('/access/unlock-coins', [\App\Http\Controllers\ContentAccessController::class , 'unlockWithCoins']);
            Route::post('/access/submit-receipt', [\App\Http\Controllers\ContentAccessController::class , 'submitReceipt']);

            // Site Features Access (Public for Students)
            Route::get('/settings/features', [\App\Http\Controllers\SiteSettingsController::class , 'getFeatureStats']);

            // Lab Progress Routes
            Route::get('/lab-progress', [LabProgressController::class, 'index']);
            Route::get('/lab-progress/{labId}', [LabProgressController::class, 'show']);
            Route::post('/lab-progress', [LabProgressController::class, 'update'])
                ->middleware('throttle:60,1');

            // Labs access settings for students (public lab list with access_type / price)
            Route::get('/labs', [\App\Http\Controllers\Admin\AdminLabController::class, 'index']);
        }

        );

        // Site Governance & Feature Access (Admin/Teacher)
        Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
            Route::post('/settings/features', [\App\Http\Controllers\SiteSettingsController::class , 'updateFeatureStatus']);
            Route::post('/settings/content-pricing', [\App\Http\Controllers\SiteSettingsController::class , 'updateContentPricing']);

            Route::get('/access/pending-receipts', [\App\Http\Controllers\ContentAccessController::class , 'getPendingReceipts']);
            Route::get('/access/financial-ledger', [\App\Http\Controllers\ContentAccessController::class , 'getFinancialLedger']);
            Route::post('/access/approve-receipt/{record}', [\App\Http\Controllers\ContentAccessController::class , 'approveAccess']);

            // Labs Management (Admin)
            Route::get('/labs', [\App\Http\Controllers\Admin\AdminLabController::class, 'index']);
            Route::put('/labs/{lab}', [\App\Http\Controllers\Admin\AdminLabController::class, 'update']);
            Route::post('/labs/bulk-update', [\App\Http\Controllers\Admin\AdminLabController::class, 'bulkUpdate']);
        }
        );
    });
