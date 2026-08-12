<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\SecurityIncident;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Services\LabVerifiers\AlgebraVerifier;
use App\Services\LabVerifiers\GeometryVerifier;
use App\Services\LabVerifiers\TrigVerifier;
use App\Services\LabVerifiers\VectorVerifier;
use App\Services\LabVerifiers\StatsVerifier;

class RewardController extends Controller
{
    public function getDailyStatus(Request $request)
    {
        $user = $request->user();
        $lastClaim = $user->last_daily_reward_at;

        // Check if claimed today (calendar day)
        $canClaim = !$lastClaim || !Carbon::parse($lastClaim)->isToday();

        return response()->json([
            'can_claim' => $canClaim,
            'last_claimed_at' => $lastClaim,
        ]);
    }

    public function claimDaily(Request $request)
    {
        $user = $request->user();
        $lastClaim = $user->last_daily_reward_at;

        if ($lastClaim && Carbon::parse($lastClaim)->isToday()) {
            return response()->json(['message' => 'لقد حصلت على مكافأتك اليومية بالفعل اليوم'], 422);
        }

        $rewardAmount = rand(50, 150); // Random coins between 50 and 150

        $user->increment('coins', $rewardAmount);
        $user->update(['last_daily_reward_at' => now()]);

        return response()->json([
            'message' => 'مبروك! لقد حصلت على مكافأة يومية',
            'amount' => $rewardAmount,
            'new_balance' => $user->coins,
        ]);
    }

    /**
     * Award rewards for completing an interactive lab.
     */
    public function awardLabCompletion(Request $request)
    {
        $request->validate([
            'lab_id' => 'required|string',
        ]);

        $user = $request->user();
        $labId = $request->lab_id;
        $verification = $request->input('verification');

        // إصلاح خلل حقيقي (race condition): الفحص القديم كان يقرأ الصف، ثم
        // — بفاصل زمني — يكتب عليه، بلا أي قفل. طلبان متزامنان لنفس المختبر
        // كانا يستطيعان كلاهما قراءة reward_claimed_at كـ"فارغ" قبل أن يكتب
        // أيّهما، فيمرّان معاً ويُمنح المستخدم المكافأة مرتين. الآن كل هذا
        // القراءة + التحقق + الكتابة) محاطة بمعاملة DB::transaction مع
        // lockForUpdate على صف LabProgress، فيُجبَر أي طلب ثانٍ يصل بنفس
        // اللحظة على الانتظار حتى تكتمل المعاملة الأولى بالكامل قبل أن يقرأ هو.
        //
        // ملاحظة مهمة (إصلاح ثانٍ اكتُشف عبر php artisan test): كل مسارات
        // الرفض هنا تستخدم return وليس throw. لو استخدمنا throw للخروج من
        // closure المعاملة، كان DB::transaction سيتراجع تلقائياً عن كل
        // الكتابات بداخلها — بما فيها كتابة سجل الحادثة الأمنية نفسها التي
        // نريد الاحتفاظ بها كدليل! بـreturn، تكتمل المعاملة (commit) دائماً
        // بغض النظر عن النتيجة، فتُحفظ سجلات security_incidents في كل الحالات
        // بينما يبقى منح المكافأة الفعلي محمياً بنفس القفل.
        return DB::transaction(function () use ($user, $labId, $verification, $request) {
                // 1. التحقق العام من وجود تقدم للمختبر - مطابقة تامة (exact match) فقط.
                // ملاحظة أمنية: تمت إزالة منطق المطابقة الجزئية/البادئة (prefix matching) القديم
                // لأنه كان يسمح لسجل تقدم واحد بمعرف قصير بمطابقة عشرات المختبرات المختلفة.
                $progress = \App\Models\LabProgress::where('user_id', $user->id)
                    ->where('lab_id', $labId)
                    ->lockForUpdate()
                    ->first();

                if (!$progress || !in_array($progress->phase, ['practice', 'completed'])) {
                    $this->logSecurityIncident($user, 'missing_lab_progress', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'You must start and practice the lab before claiming the reward.'
                    ], 403);
                }

                // 1.b. الحماية من الاستنزاف اللانهائي: مكافأة كل مختبر تُمنح مرة واحدة فقط
                // لكل (user_id, lab_id). أي محاولة لاحقة تُرفض وتُسجَّل كحادثة أمنية.
                if ($progress->reward_claimed_at) {
                    $this->logSecurityIncident($user, 'duplicate_claim', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Reward for this lab has already been claimed.'
                    ], 403);
                }

                // 2. التحقق الرياضي المخصص للمختبرات المفروض عليها التحقق حالياً
                $enforcedLabs = [
                    'sys-add', 'sys-subst', 'pgcd-euclidean',
                    'trig-sin', 'trig-cos', 'trig-tan',
                    'roots-simplification',
                    'pyth-hyp', 'pyth-leg', 'pyth-verify',
                    'roots-addition', 'roots-subtraction', 'roots-multiplication', 'roots-division',
                    'pgcd-divisors', 'pgcd-subtraction', 'exp-simple', 'exp-double',
                    'id1', 'id2', 'id3',
                    'lin-formula', 'lin-image', 'aff-formula', 'aff-image', 'lin-graph', 'aff-graph',
                    'vec-para', 'vec-rand', 'vec-read', 'vec-calc', 'vec-midpoint', 'vec-distance', 'vec-same-end',
                    'thales-shadow', 'thales-prob', 'ineq-solve', 'ineq-graph',
                    'fact-id1', 'fact-id2', 'fact-id3', 'div-props', 'eq-product', 'pyth-prob',
                    'stat-cumulative', 'stat-chart', 'coprime', 'sys-graph', 'sys-strategy', 'geo-volume', 'geo-solids', 'geo-net', 'geo-section', 'geo-pyramid',
                    'fact-common',
                    'eq-solve',
                    'pyth-visual',
                    'thales-verify',
                    'thales-length',
                    'div-discover',
                    'roots-expression',
                    'vec-concept',
                    'vec-chasles',
                    'trig-naming',
                    'trig-identities',
                    'trig-special',
                    'rotation-mastery',
                    'prob-mastery',
                    'powers-rules', 'scientific-not', 'frac-simplify', 'trig-length', 'trig-angle', 'stat-freq', 'stat-mean',
                ];

                if (in_array($labId, $enforcedLabs)) {
                    if (!$verification || !is_array($verification)) {
                        $this->logSecurityIncident($user, 'missing_verification', $labId, $request);
                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'Missing verification payload for enforced security lab.'
                        ], 403);
                    }

                    $type = $verification['type'] ?? '';

                    $verifierResult = $this->dispatchLabVerification($type, $verification, $user, $labId, $request);
                    if ($verifierResult !== null) {
                        return $verifierResult;
                    }
                }

                // Base reward for any lab completion
                $coins = 100;
                $xp = 200;

                $user->increment('coins', $coins);
                $user->increment('xp', $xp);

                // منع أي مطالبة لاحقة بنفس المختبر
                $progress->reward_claimed_at = now();
                $progress->save();

                // Logic for awarding a special badge if they complete many labs
                $completionCount = \App\Models\UserProgress::where('user_id', $user->id)
                    ->where('is_completed', true)
                    ->count();

                $badgeAwarded = null;
                if ($completionCount >= 5) {
                    $badge = \App\Models\Badge::where('slug', 'algebra-explorer')->first();
                    if ($badge && !$user->badges->contains($badge->id)) {
                        $user->badges()->attach($badge->id);
                        $badgeAwarded = $badge;
                    }
                }

                return response()->json([
                    'status' => 'success',
                    'message' => 'أحسنت! لقد أتممت المختبر بنجاح وحصلت على مكافأة',
                    'reward' => [
                        'coins' => $coins,
                        'xp' => $xp
                    ],
                    'badge' => $badgeAwarded ? [
                        'name' => $badgeAwarded->name,
                        'icon' => $badgeAwarded->icon,
                        'description' => $badgeAwarded->description
                    ] : null
                ]);
            });
    }

    private function logSecurityIncident($user, $type, $labId, Request $request, $extraDetails = [])
    {
        SecurityIncident::create([
            'user_id' => $user->id,
            'type' => 'lab_cheating',
            'severity' => 'high',
            'details' => array_merge([
                'cheat_type' => $type,
                'lab_id' => $labId,
                'path' => $request->path()
            ], $extraDetails),
            'ip_address' => $request->ip(),
        ]);
        Log::warning("AntiCheat: Lab cheating detected from User {$user->id} on lab {$labId} - Type: {$type}");
    }

    /**
     * Dispatches a verification "type" to whichever of the 5 domain Verifier
     * classes owns it (see app/Services/LabVerifiers/). Replaces what used to
     * be a single ~1850-line if/elseif chain living directly in this
     * controller — same behavior, but a mistake editing e.g. the trig math
     * can no longer risk a syntax error that breaks reward claims for every
     * other subject's labs too.
     *
     * @return \Illuminate\Http\JsonResponse|null  a 403 response to return immediately, or null if verification passed
     */
    private function dispatchLabVerification(string $type, array $verification, $user, string $labId, Request $request)
    {
        $verifiers = [
            new AlgebraVerifier(),
            new GeometryVerifier(),
            new TrigVerifier(),
            new VectorVerifier(),
            new StatsVerifier(),
        ];

        foreach ($verifiers as $verifier) {
            if ($verifier->handles($type)) {
                return $verifier->verify($type, $verification, $user, $labId, $request);
            }
        }

        $this->logSecurityIncident($user, 'unknown_verification_type', $labId, $request);
        return response()->json([
            'error' => 'Cheat detected',
            'message' => 'Unknown verification type.'
        ], 403);
                }
}
