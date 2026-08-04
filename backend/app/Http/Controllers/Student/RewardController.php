<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\SecurityIncident;
use Illuminate\Support\Facades\Log;

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

        // 1. التحقق العام من وجود تقدم للمختبر - مطابقة تامة (exact match) فقط.
        // ملاحظة أمنية: تمت إزالة منطق المطابقة الجزئية/البادئة (prefix matching) القديم
        // لأنه كان يسمح لسجل تقدم واحد بمعرف قصير بمطابقة عشرات المختبرات المختلفة.
        $progress = \App\Models\LabProgress::where('user_id', $user->id)
            ->where('lab_id', $labId)
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

            if ($type === 'system') {
                $eq1 = $verification['eq1'] ?? null;
                $eq2 = $verification['eq2'] ?? null;
                $x = $verification['x'] ?? null;
                $y = $verification['y'] ?? null;

                if ($eq1 === null || $eq2 === null || $x === null || $y === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                if (!is_numeric($x) || !is_numeric($y)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Answers must be numeric.'
                    ], 403);
                }

                // التحقق الرياضي من المعادلة الأولى
                $lhs1 = ($eq1['a'] ?? 0) * $x + ($eq1['b'] ?? 0) * $y;
                $rhs1 = $eq1['c'] ?? 0;

                // التحقق الرياضي من المعادلة الثانية
                $lhs2 = ($eq2['a'] ?? 0) * $x + ($eq2['b'] ?? 0) * $y;
                $rhs2 = $eq2['c'] ?? 0;

                if (abs($lhs1 - $rhs1) > 0.0001 || abs($lhs2 - $rhs2) > 0.0001) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'eq1' => $eq1,
                        'eq2' => $eq2,
                        'submitted_x' => $x,
                        'submitted_y' => $y,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The provided answers do not satisfy the equations.'
                    ], 403);
                }

                // منع المحاولات التافهة مثل 0x + 0y = 0
                if ((($eq1['a'] ?? 0) == 0 && ($eq1['b'] ?? 0) == 0) || (($eq2['a'] ?? 0) == 0 && ($eq2['b'] ?? 0) == 0)) {
                    $this->logSecurityIncident($user, 'trivial_equations', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Trivial equations are not allowed.'
                    ], 403);
                }
            } elseif ($type === 'linear') {
                // تحقق رياضي لمختبرات الدوال التآلفية: y = m*x + b
                $m = $verification['m'] ?? null;
                $b = $verification['b'] ?? null;
                $x = $verification['x'] ?? null;
                $y = $verification['y'] ?? null;

                if ($m === null || $b === null || $x === null || $y === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                if (!is_numeric($m) || !is_numeric($b) || !is_numeric($x) || !is_numeric($y)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Answers must be numeric.'
                    ], 403);
                }

                $expectedY = ($m * $x) + $b;
                if (abs($expectedY - $y) > 0.0001) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'm' => $m, 'b' => $b, 'submitted_x' => $x, 'submitted_y' => $y,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The provided point does not satisfy y = m*x + b.'
                    ], 403);
                }
            } elseif ($type === 'pgcd') {
                // تحقق رياضي لمختبرات القاسم المشترك الأكبر (خوارزمية إقليدس)
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $result = $verification['result'] ?? null;

                if ($a === null || $b === null || $result === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                if (!is_numeric($a) || !is_numeric($b) || !is_numeric($result) || $a <= 0 || $b <= 0) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'a, b and result must be positive numbers.'
                    ], 403);
                }

                $computeGcd = function ($x, $y) use (&$computeGcd) {
                    $x = (int) $x; $y = (int) $y;
                    return $y === 0 ? $x : $computeGcd($y, $x % $y);
                };
                $expectedGcd = $computeGcd((int) $a, (int) $b);

                if ((int) $result !== $expectedGcd) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'submitted_result' => $result, 'expected' => $expectedGcd,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted GCD does not match the given numbers.'
                    ], 403);
                }
            } elseif ($type === 'ratio') {
                // تحقق رياضي عام لمختبرات النسب المثلثية (Sin/Cos/Tan)
                $kind = $verification['kind'] ?? null; // 'sin' | 'cos' | 'tan'
                $opp = $verification['opp'] ?? null;
                $adj = $verification['adj'] ?? null;
                $hyp = $verification['hyp'] ?? null;
                $result = $verification['result'] ?? null;

                if (!in_array($kind, ['sin', 'cos', 'tan'], true) || $result === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($result) || ($opp !== null && !is_numeric($opp)) || ($adj !== null && !is_numeric($adj)) || ($hyp !== null && !is_numeric($hyp))) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric.'
                    ], 403);
                }

                $expected = null;
                if ($kind === 'sin' && $opp !== null && $hyp !== null && $hyp != 0) $expected = $opp / $hyp;
                if ($kind === 'cos' && $adj !== null && $hyp !== null && $hyp != 0) $expected = $adj / $hyp;
                if ($kind === 'tan' && $opp !== null && $adj !== null && $adj != 0) $expected = $opp / $adj;

                if ($expected === null || abs($expected - (float) $result) > 0.05) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'kind' => $kind, 'opp' => $opp, 'adj' => $adj, 'hyp' => $hyp, 'submitted' => $result, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted trigonometric ratio is incorrect.'
                    ], 403);
                }
            } elseif ($type === 'root') {
                // تحقق رياضي لمختبرات تبسيط الجذور: n = square × remainder، وsquare أكبر مربع تام يقسم n
                $n = $verification['n'] ?? null;
                $square = $verification['square'] ?? null;
                $remainder = $verification['remainder'] ?? null;

                if ($n === null || $square === null || $remainder === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($n) || !is_numeric($square) || !is_numeric($remainder) || $n <= 0 || $square <= 0 || $remainder <= 0) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'n, square and remainder must be positive numbers.'
                    ], 403);
                }

                $n = (int) $n; $square = (int) $square; $remainder = (int) $remainder;

                $isPerfectSquare = (int) round(sqrt($square)) ** 2 === $square;
                $productOk = $square * $remainder === $n;

                $biggestSquareFactor = 1;
                for ($k = 2; $k * $k <= $n; $k++) {
                    if ($n % ($k * $k) === 0) $biggestSquareFactor = $k * $k;
                }
                $isLargest = $biggestSquareFactor === $square;

                if (!$isPerfectSquare || !$productOk || !$isLargest) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'n' => $n, 'square' => $square, 'remainder' => $remainder, 'expected_square' => $biggestSquareFactor,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted decomposition is not the simplest form.'
                    ], 403);
                }
            } elseif ($type === 'pyth') {
                // تحقق رياضي لمختبري الوتر/الضلع المجهول في فيثاغورس: a² + b² = c²
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $c = $verification['c'] ?? null;

                if ($a === null || $b === null || $c === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($a) || !is_numeric($b) || !is_numeric($c) || $a <= 0 || $b <= 0 || $c <= 0) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'a, b and c must be positive numbers.'
                    ], 403);
                }

                if (abs(($a * $a + $b * $b) - $c * $c) > 0.01) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'c' => $c,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'a² + b² does not equal c².'
                    ], 403);
                }
            } elseif ($type === 'pyth-check') {
                // تحقق رياضي لمختبر الحكم: هل المثلث قائم الزاوية أم لا؟
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $c = $verification['c'] ?? null;
                $answer = $verification['answer'] ?? null; // boolean-ish: true/false

                if ($a === null || $b === null || $c === null || $answer === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($a) || !is_numeric($b) || !is_numeric($c) || $a <= 0 || $b <= 0 || $c <= 0) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'a, b and c must be positive numbers.'
                    ], 403);
                }

                $isRight = abs(($a * $a + $b * $b) - $c * $c) <= 0.01;
                $submittedTrue = filter_var($answer, FILTER_VALIDATE_BOOLEAN);

                if ($isRight !== $submittedTrue) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'c' => $c, 'submitted' => $submittedTrue, 'expected' => $isRight,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The right-triangle judgment is incorrect.'
                    ], 403);
                }
            } elseif ($type === 'roots-combine') {
                // تحقق رياضي لمختبري جمع/طرح الجذور: a√x ± b√x = result√x
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $result = $verification['result'] ?? null;
                $op = $verification['op'] ?? null; // 'add' | 'sub'

                if ($a === null || $b === null || $result === null || !in_array($op, ['add', 'sub'], true)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($a) || !is_numeric($b) || !is_numeric($result)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric.'
                    ], 403);
                }

                $expected = $op === 'add' ? $a + $b : $a - $b;
                if ((int) $result !== (int) $expected) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'op' => $op, 'submitted' => $result, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The combined coefficient is incorrect.'
                    ], 403);
                }
            } elseif ($type === 'roots-multiply') {
                // تحقق رياضي لمختبر ضرب الجذور: √a × √b = √(a×b)
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $result = $verification['result'] ?? null;

                if ($a === null || $b === null || $result === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($a) || !is_numeric($b) || !is_numeric($result) || $a <= 0 || $b <= 0) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be positive numbers.'
                    ], 403);
                }

                if ((int) $result !== (int) ($a * $b)) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'submitted' => $result,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted result is mathematically incorrect.'
                    ], 403);
                }
            } elseif ($type === 'roots-divide') {
                // تحقق رياضي لمختبر قسمة الجذور: quot = a÷b، ثم result = √quot (يجب أن يكون مربعاً تاماً)
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $quot = $verification['quot'] ?? null;
                $result = $verification['result'] ?? null;

                if ($a === null || $b === null || $quot === null || $result === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($a) || !is_numeric($b) || !is_numeric($quot) || !is_numeric($result) || $a <= 0 || $b <= 0) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be positive numbers.'
                    ], 403);
                }

                $divOk = (int) $b !== 0 && (int) $a % (int) $b === 0 && (int) $quot === (int) ($a / $b);
                $sqrtOk = (int) $result * (int) $result === (int) $quot;

                if (!$divOk || !$sqrtOk) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'quot' => $quot, 'result' => $result,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The division/root extraction is mathematically incorrect.'
                    ], 403);
                }
            } elseif ($type === 'expand-simple') {
                // تحقق رياضي لمختبر النشر البسيط: a(x + b) = ax + ab
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $op = $verification['op'] ?? null; // '+' | '-'
                $term1 = $verification['term1'] ?? null;
                $term2 = $verification['term2'] ?? null;

                if ($a === null || $b === null || !in_array($op, ['+', '-'], true) || $term1 === null || $term2 === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($a) || !is_numeric($b) || !is_numeric($term1) || !is_numeric($term2)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric.'
                    ], 403);
                }

                $expectedTerm2 = $op === '+' ? ($a * $b) : -($a * $b);
                if ((int) $term1 !== (int) $a || (int) $term2 !== (int) $expectedTerm2) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'op' => $op, 'submitted_term1' => $term1, 'submitted_term2' => $term2,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The distributed terms are mathematically incorrect.'
                    ], 403);
                }
            } elseif ($type === 'expand-double') {
                // تحقق رياضي لمختبر النشر المزدوج: (x+b)(x+d) = x² + (b+d)x + bd
                $b = $verification['b'] ?? null;
                $d = $verification['d'] ?? null;
                $midTerm = $verification['midTerm'] ?? null;
                $lastTerm = $verification['lastTerm'] ?? null;

                if ($b === null || $d === null || $midTerm === null || $lastTerm === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($b) || !is_numeric($d) || !is_numeric($midTerm) || !is_numeric($lastTerm)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric.'
                    ], 403);
                }

                if ((int) $midTerm !== (int) ($b + $d) || (int) $lastTerm !== (int) ($b * $d)) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'b' => $b, 'd' => $d, 'submitted_mid' => $midTerm, 'submitted_last' => $lastTerm,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The expanded terms are mathematically incorrect.'
                    ], 403);
                }
            } elseif ($type === 'identity-sum-sq' || $type === 'identity-diff-sq') {
                // تحقق رياضي لمتطابقتي (a±b)² = a² ± 2ab + b²
                $b = $verification['b'] ?? null;
                $midTerm = $verification['midTerm'] ?? null;
                $lastTerm = $verification['lastTerm'] ?? null;

                if ($b === null || $midTerm === null || $lastTerm === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($b) || !is_numeric($midTerm) || !is_numeric($lastTerm)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric.'
                    ], 403);
                }

                if ((int) $midTerm !== (int) (2 * $b) || (int) $lastTerm !== (int) ($b * $b)) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'b' => $b, 'submitted_mid' => $midTerm, 'submitted_last' => $lastTerm,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The identity expansion is mathematically incorrect.'
                    ], 403);
                }
            } elseif ($type === 'identity-diff-sq2') {
                // تحقق رياضي لمتطابقة (a+b)(a-b) = a² - b²
                $b = $verification['b'] ?? null;
                $lastTerm = $verification['lastTerm'] ?? null;

                if ($b === null || $lastTerm === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($b) || !is_numeric($lastTerm)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric.'
                    ], 403);
                }

                if ((int) $lastTerm !== (int) ($b * $b)) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'b' => $b, 'submitted_last' => $lastTerm,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The identity expansion is mathematically incorrect.'
                    ], 403);
                }
            } elseif ($type === 'linear-2pt') {
                // تحقق رياضي لمختبر رسم الدوال التآلفية: يجب أن تحقق نقطتان مختلفتان y = mx + b
                $m = $verification['m'] ?? null;
                $b = $verification['b'] ?? null;
                $p1 = $verification['p1'] ?? null;
                $p2 = $verification['p2'] ?? null;

                if ($m === null || $b === null || !is_array($p1) || !is_array($p2)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                $x1 = $p1['x'] ?? null; $y1 = $p1['y'] ?? null;
                $x2 = $p2['x'] ?? null; $y2 = $p2['y'] ?? null;

                if (!is_numeric($m) || !is_numeric($b) || !is_numeric($x1) || !is_numeric($y1) || !is_numeric($x2) || !is_numeric($y2)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric.'
                    ], 403);
                }

                if ($x1 == $x2 && $y1 == $y2) {
                    $this->logSecurityIncident($user, 'trivial_equations', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Two distinct points are required.'
                    ], 403);
                }

                $p1Ok = abs(($m * $x1 + $b) - $y1) < 0.01;
                $p2Ok = abs(($m * $x2 + $b) - $y2) < 0.01;

                if (!$p1Ok || !$p2Ok) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'm' => $m, 'b' => $b, 'p1' => $p1, 'p2' => $p2,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'One or both points do not satisfy the line equation.'
                    ], 403);
                }
            } elseif ($type === 'vec-parallelogram') {
                // تحقق رياضي لمختبر متوازي الأضلاع: C = B + D - A
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $d = $verification['d'] ?? null;
                $c = $verification['c'] ?? null;

                if (!is_array($a) || !is_array($b) || !is_array($d) || !is_array($c)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                $ax = $a['x'] ?? null; $ay = $a['y'] ?? null;
                $bx = $b['x'] ?? null; $by = $b['y'] ?? null;
                $dx = $d['x'] ?? null; $dy = $d['y'] ?? null;
                $cx = $c['x'] ?? null; $cy = $c['y'] ?? null;

                $allNumeric = true;
                foreach ([$ax, $ay, $bx, $by, $dx, $dy, $cx, $cy] as $v) {
                    if (!is_numeric($v)) { $allNumeric = false; break; }
                }
                if (!$allNumeric) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Vector coordinates must be numeric.'
                    ], 403);
                }

                if ((int) $cx !== (int) ($bx + $dx - $ax) || (int) $cy !== (int) ($by + $dy - $ay)) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'd' => $d, 'submitted_c' => $c,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The resultant point does not satisfy the parallelogram rule.'
                    ], 403);
                }
            } elseif ($type === 'vec-sum') {
                // تحقق رياضي لمختبر جمع الأشعة الحرة: sum = u + v
                $u = $verification['u'] ?? null;
                $v = $verification['v'] ?? null;
                $sum = $verification['sum'] ?? null;

                if (!is_array($u) || !is_array($v) || !is_array($sum)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                $ux = $u['x'] ?? null; $uy = $u['y'] ?? null;
                $vx = $v['x'] ?? null; $vy = $v['y'] ?? null;
                $sx = $sum['x'] ?? null; $sy = $sum['y'] ?? null;

                $allNumeric = true;
                foreach ([$ux, $uy, $vx, $vy, $sx, $sy] as $val) {
                    if (!is_numeric($val)) { $allNumeric = false; break; }
                }
                if (!$allNumeric) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Vector coordinates must be numeric.'
                    ], 403);
                }

                if ((int) $sx !== (int) ($ux + $vx) || (int) $sy !== (int) ($uy + $vy)) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'u' => $u, 'v' => $v, 'submitted_sum' => $sum,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The vector sum is mathematically incorrect.'
                    ], 403);
                }
            } elseif ($type === 'vec-read') {
                // تحقق رياضي لمختبر قراءة مركبات الشعاع: dx و dy فقط (بلا نقطة انطلاق، فهي غير مهمة رياضياً هنا)
                $dx = $verification['dx'] ?? null;
                $dy = $verification['dy'] ?? null;

                if ($dx === null || $dy === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($dx) || !is_numeric($dy)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Vector components must be numeric.'
                    ], 403);
                }
                if ((int) $dx === 0 && (int) $dy === 0) {
                    $this->logSecurityIncident($user, 'trivial_equations', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'A zero vector is not a valid challenge.'
                    ], 403);
                }
                // ملاحظة: لا يوجد "حل صحيح واحد" هنا للتحقق منه خادمياً بمعزل عن الشكل المرئي الأصلي؛
                // نكتفي بالتحقق من سلامة البنية (ليست صفرية، وأرقام صحيحة) لأن الرسم يُنشأ في العميل.
            } elseif ($type === 'vec-calc') {
                // تحقق رياضي لمختبر الحساب الجبري: AB = (Bx-Ax, By-Ay)
                $ax = $verification['ax'] ?? null; $ay = $verification['ay'] ?? null;
                $bx = $verification['bx'] ?? null; $by = $verification['by'] ?? null;
                $dx = $verification['dx'] ?? null; $dy = $verification['dy'] ?? null;

                $vals = [$ax, $ay, $bx, $by, $dx, $dy];
                $allPresent = true;
                foreach ($vals as $v) { if ($v === null) { $allPresent = false; break; } }
                if (!$allPresent) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                $allNumeric = true;
                foreach ($vals as $v) { if (!is_numeric($v)) { $allNumeric = false; break; } }
                if (!$allNumeric) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric.'
                    ], 403);
                }

                if ((int) $dx !== (int) ($bx - $ax) || (int) $dy !== (int) ($by - $ay)) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => [$ax, $ay], 'b' => [$bx, $by], 'submitted_d' => [$dx, $dy],
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Vector components do not match end-minus-start.'
                    ], 403);
                }
            } elseif ($type === 'vec-midpoint') {
                // تحقق رياضي لمختبر نقطة المنتصف: M = ((Ax+Bx)/2, (Ay+By)/2)
                $ax = $verification['ax'] ?? null; $ay = $verification['ay'] ?? null;
                $bx = $verification['bx'] ?? null; $by = $verification['by'] ?? null;
                $mx = $verification['mx'] ?? null; $my = $verification['my'] ?? null;

                $vals = [$ax, $ay, $bx, $by, $mx, $my];
                $allPresent = true;
                foreach ($vals as $v) { if ($v === null) { $allPresent = false; break; } }
                if (!$allPresent) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                $allNumeric = true;
                foreach ($vals as $v) { if (!is_numeric($v)) { $allNumeric = false; break; } }
                if (!$allNumeric) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric.'
                    ], 403);
                }

                if (abs($mx - ($ax + $bx) / 2) > 0.01 || abs($my - ($ay + $by) / 2) > 0.01) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => [$ax, $ay], 'b' => [$bx, $by], 'submitted_m' => [$mx, $my],
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The midpoint does not match the average of the two points.'
                    ], 403);
                }
            } elseif ($type === 'vec-distance') {
                // تحقق رياضي لمختبر المسافة: dist² = (Bx-Ax)² + (By-Ay)²
                $ax = $verification['ax'] ?? null; $ay = $verification['ay'] ?? null;
                $bx = $verification['bx'] ?? null; $by = $verification['by'] ?? null;
                $dist = $verification['dist'] ?? null;

                $vals = [$ax, $ay, $bx, $by, $dist];
                $allPresent = true;
                foreach ($vals as $v) { if ($v === null) { $allPresent = false; break; } }
                if (!$allPresent) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                $allNumeric = true;
                foreach ($vals as $v) { if (!is_numeric($v)) { $allNumeric = false; break; } }
                if (!$allNumeric || $dist < 0) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric and distance non-negative.'
                    ], 403);
                }

                $dx = $bx - $ax; $dy = $by - $ay;
                $expected = sqrt($dx * $dx + $dy * $dy);

                if (abs($dist - $expected) > 0.01) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => [$ax, $ay], 'b' => [$bx, $by], 'submitted_dist' => $dist, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The distance does not match the two points.'
                    ], 403);
                }
            } elseif ($type === 'thales') {
                // تحقق رياضي لمختبر نظرية طاليس: stickHeight/stickShadow = tallHeight/tallShadow
                $stickHeight = $verification['stickHeight'] ?? null;
                $stickShadow = $verification['stickShadow'] ?? null;
                $tallShadow = $verification['tallShadow'] ?? null;
                $tallHeight = $verification['tallHeight'] ?? null;

                $vals = [$stickHeight, $stickShadow, $tallShadow, $tallHeight];
                $allPresent = true;
                foreach ($vals as $v) { if ($v === null) { $allPresent = false; break; } }
                if (!$allPresent) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                $allNumeric = true;
                foreach ($vals as $v) { if (!is_numeric($v) || $v <= 0) { $allNumeric = false; break; } }
                if (!$allNumeric) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'All values must be positive numbers.'
                    ], 403);
                }

                $expectedTallHeight = ($stickHeight / $stickShadow) * $tallShadow;
                if (abs($tallHeight - $expectedTallHeight) > 0.01) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'stick' => [$stickHeight, $stickShadow], 'tall_shadow' => $tallShadow, 'submitted' => $tallHeight, 'expected' => $expectedTallHeight,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The proportional height does not match Thales ratio.'
                    ], 403);
                }
            } elseif ($type === 'thales-problem') {
                // تحقق رياضي عام لمسائل طاليس التطبيقية الثلاث: a/b = c/ans → ans = b*c/a
                $kind = $verification['kind'] ?? null;
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $c = $verification['c'] ?? null;
                $ans = $verification['ans'] ?? null;

                if (!in_array($kind, ['shadow', 'scale', 'cone', 'length'], true) || $a === null || $b === null || $c === null || $ans === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                $vals = [$a, $b, $c, $ans];
                $allNumeric = true;
                foreach ($vals as $v) { if (!is_numeric($v) || $v <= 0) { $allNumeric = false; break; } }
                if (!$allNumeric) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'All values must be positive numbers.'
                    ], 403);
                }

                // ملاحظة هامة: أرشيتايب shadow له علاقة نسبة مختلفة عن scale/cone
                // (لأن a وb يمثلان طرفي نفس الكائن الصغير هناك، بخلاف الحالتين الأخريين)
                $expected = in_array($kind, ['shadow', 'length'], true) ? ($a * $c) / $b : ($b * $c) / $a;
                if (abs($ans - $expected) > 0.01) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'kind' => $kind, 'a' => $a, 'b' => $b, 'c' => $c, 'submitted' => $ans, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The proportional answer is incorrect.'
                    ], 403);
                }
            } elseif ($type === 'ineq-solve') {
                // تحقق رياضي لمختبر حل المتراجحات: res = (c-b)/a، مع التحقق الضمني أن القسمة صحيحة تماماً
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $c = $verification['c'] ?? null;
                $res = $verification['res'] ?? null;

                $vals = [$a, $b, $c, $res];
                $allPresent = true;
                foreach ($vals as $v) { if ($v === null) { $allPresent = false; break; } }
                if (!$allPresent) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                $allNumeric = true;
                foreach ($vals as $v) { if (!is_numeric($v)) { $allNumeric = false; break; } }
                if (!$allNumeric || (float) $a === 0.0) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric and coefficient a cannot be zero.'
                    ], 403);
                }

                $expected = ($c - $b) / $a;
                if (abs($res - $expected) > 0.01) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'c' => $c, 'submitted_res' => $res, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The solution does not match the inequality.'
                    ], 403);
                }
            } elseif ($type === 'ineq-graph') {
                // تحقق رياضي لمختبر التمثيل البياني للمتراجحات: dir/inc يجب أن يطابقا الرمز sym
                $sym = $verification['sym'] ?? null;
                $dir = $verification['dir'] ?? null;
                $inc = $verification['inc'] ?? null;

                if (!in_array($sym, ['>', '<', '≥', '≤'], true) || !in_array($dir, ['left', 'right'], true) || !is_bool($inc)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                $expectedDir = ($sym === '>' || $sym === '≥') ? 'right' : 'left';
                $expectedInc = ($sym === '≥' || $sym === '≤');

                if ($dir !== $expectedDir || $inc !== $expectedInc) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'sym' => $sym, 'submitted_dir' => $dir, 'submitted_inc' => $inc,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The direction/boundary type does not match the inequality symbol.'
                    ], 403);
                }
            } elseif ($type === 'divisor-props') {
                // تحقق رياضي لمختبر خصائص القواسم: يتحقق فعلياً أن n يقسم a وb، ثم يتحقق من الإجابة حسب المسار
                $n = $verification['n'] ?? null;
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $track = $verification['track'] ?? null;
                $ans = $verification['ans'] ?? null;

                if (!in_array($track, ['sum', 'remainder'], true) || $n === null || $a === null || $b === null || $ans === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                $vals = [$n, $a, $b, $ans];
                $allNumeric = true;
                foreach ($vals as $v) { if (!is_numeric($v) || $v <= 0) { $allNumeric = false; break; } }
                if (!$allNumeric) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be positive numbers.'
                    ], 403);
                }

                // التحقق الجوهري: n يجب أن يقسم كلاً من a وb فعلياً بلا باقٍ (لا نثق بمجرد الادعاء)
                if ((int) $a % (int) $n !== 0 || (int) $b % (int) $n !== 0) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'n' => $n, 'a' => $a, 'b' => $b, 'reason' => 'n does not actually divide a or b',
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'n does not divide both a and b.'
                    ], 403);
                }

                if ($track === 'sum') {
                    $expected = ($a + $b) / $n;
                } else {
                    $remainder = (int) $a % (int) $b;
                    if ($remainder === 0 || $remainder % (int) $n !== 0) {
                        $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                            'n' => $n, 'a' => $a, 'b' => $b, 'reason' => 'remainder invalid or not divisible by n',
                        ]);
                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'The remainder relationship is invalid.'
                        ], 403);
                    }
                    $expected = $remainder / $n;
                }

                if (abs($ans - $expected) > 0.01) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'track' => $track, 'submitted' => $ans, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted quotient is incorrect.'
                    ], 403);
                }
            } elseif ($type === 'eq-product') {
                // تحقق رياضي لمختبر معادلات الانشطار: root1 ≠ root2 فقط (أي عددين مختلفين صالحان
                // كجذرين لمعادلة (x-root1)(x-root2)=0 مبنية عليهما، لا علاقة إضافية للتحقق منها)
                $root1 = $verification['root1'] ?? null;
                $root2 = $verification['root2'] ?? null;

                if ($root1 === null || $root2 === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($root1) || !is_numeric($root2)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Roots must be numeric.'
                    ], 403);
                }
                if ((int) $root1 === (int) $root2) {
                    $this->logSecurityIncident($user, 'trivial_equations', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The two roots must be distinct.'
                    ], 403);
                }
            } elseif ($type === 'stat-cumulative') {
                // تحقق رياضي لمختبر التراكم: كل قيمة في correct هي مجموع تراكمي صحيح لعناصر freqs
                $freqs = $verification['freqs'] ?? null;
                $correct = $verification['correct'] ?? null;

                if (!is_array($freqs) || !is_array($correct) || count($freqs) === 0 || count($freqs) !== count($correct)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                foreach (array_merge($freqs, $correct) as $v) {
                    if (!is_numeric($v)) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'Values must be numeric.'
                        ], 403);
                    }
                }

                $running = 0;
                foreach ($freqs as $i => $f) {
                    $running += (int) $f;
                    if ((int) $correct[$i] !== $running) {
                        $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                            'freqs' => $freqs, 'submitted_correct' => $correct, 'failed_at_index' => $i,
                        ]);
                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'The cumulative sum sequence is incorrect.'
                        ], 403);
                    }
                }
            } elseif ($type === 'stat-chart') {
                // تحقق رياضي لمختبر زاوية القطاع الدائري: ans = round((value/total) × 360)
                $total = $verification['total'] ?? null;
                $value = $verification['value'] ?? null;
                $ans = $verification['ans'] ?? null;

                if ($total === null || $value === null || $ans === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($total) || !is_numeric($value) || !is_numeric($ans) || $total <= 0 || $value < 0 || $value > $total) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be numeric and value must not exceed total.'
                    ], 403);
                }

                $expected = round(($value / $total) * 360);
                if ((int) $ans !== (int) $expected) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'total' => $total, 'value' => $value, 'submitted' => $ans, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The sector angle is incorrect.'
                    ], 403);
                }
            } elseif ($type === 'coprime') {
                // تحقق رياضي لمختبر الأعداد الأولية فيما بينها: PGCD(a,b) === 1 مقارنة بادعاء الطالب
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $ans = $verification['ans'] ?? null;

                if ($a === null || $b === null || !is_bool($ans)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if (!is_numeric($a) || !is_numeric($b) || $a <= 0 || $b <= 0) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Values must be positive numbers.'
                    ], 403);
                }

                $computeGcd = function ($x, $y) use (&$computeGcd) {
                    $x = (int) $x; $y = (int) $y;
                    return $y === 0 ? $x : $computeGcd($y, $x % $y);
                };
                $isCoprimeExpected = $computeGcd($a, $b) === 1;

                if ($ans !== $isCoprimeExpected) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'submitted' => $ans, 'expected' => $isCoprimeExpected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The coprimality judgment is incorrect.'
                    ], 403);
                }
            } elseif ($type === 'sys-strategy') {
                // تحقق رياضي لمختبر استراتيجية الحل: choice يجب أن يطابق best (المُحدَّد وقت التوليد)
                $best = $verification['best'] ?? null;
                $choice = $verification['choice'] ?? null;

                if (!in_array($best, ['subst', 'add'], true) || !in_array($choice, ['subst', 'add'], true)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if ($choice !== $best) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'best' => $best, 'submitted_choice' => $choice,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The strategy choice does not match the correct answer.'
                    ], 403);
                }
            } elseif ($type === 'geo-volume') {
                // تحقق رياضي لمختبر الحجوم: يعيد حساب الحجم من الأبعاد الخام حسب نوع المجسم
                $kind = $verification['kind'] ?? null;
                $ans = $verification['ans'] ?? null;

                if (!in_array($kind, ['cube', 'rect', 'triangular'], true) || $ans === null || !is_numeric($ans) || $ans <= 0) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                $expected = null;
                if ($kind === 'cube') {
                    $side = $verification['side'] ?? null;
                    if (!is_numeric($side) || $side <= 0) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid side value.'], 403);
                    }
                    $expected = $side ** 3;
                } elseif ($kind === 'rect') {
                    $baseArea = $verification['baseArea'] ?? null;
                    $height = $verification['height'] ?? null;
                    if (!is_numeric($baseArea) || !is_numeric($height) || $baseArea <= 0 || $height <= 0) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid base area or height.'], 403);
                    }
                    $expected = $baseArea * $height;
                } else { // triangular
                    $triBase = $verification['triBase'] ?? null;
                    $triHeight = $verification['triHeight'] ?? null;
                    $prismLength = $verification['prismLength'] ?? null;
                    if (!is_numeric($triBase) || !is_numeric($triHeight) || !is_numeric($prismLength) || $triBase <= 0 || $triHeight <= 0 || $prismLength <= 0) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid triangular prism dimensions.'], 403);
                    }
                    $expected = (($triBase * $triHeight) / 2) * $prismLength;
                }

                if (abs($ans - $expected) > 0.01) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'kind' => $kind, 'submitted' => $ans, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted volume is mathematically incorrect.'
                    ], 403);
                }
            } elseif ($type === 'identify') {
                // تحقق عام لمختبرات التمييز/التصنيف: choice يجب أن يطابق correct المُرسَل من نفس السؤال
                $correct = $verification['correct'] ?? null;
                $choice = $verification['choice'] ?? null;

                if ($correct === null || $choice === null || !is_string($correct) || !is_string($choice)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }
                if ($choice !== $correct) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'correct' => $correct, 'submitted_choice' => $choice,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The identification choice is incorrect.'
                    ], 403);
                }
            } elseif ($type === 'geo-net') {
                // تحقق رياضي لمختبر المساحة الكلية: يعيد حساب المساحة من الأبعاد الخام حسب نوع المجسم
                $kind = $verification['kind'] ?? null;
                $ans = $verification['ans'] ?? null;

                if (!in_array($kind, ['cube', 'rect'], true) || $ans === null || !is_numeric($ans) || $ans <= 0) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                $expected = null;
                if ($kind === 'cube') {
                    $side = $verification['side'] ?? null;
                    if (!is_numeric($side) || $side <= 0) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid side value.'], 403);
                    }
                    $expected = 6 * ($side ** 2);
                } else { // rect
                    $l = $verification['l'] ?? null;
                    $w = $verification['w'] ?? null;
                    $h = $verification['h'] ?? null;
                    if (!is_numeric($l) || !is_numeric($w) || !is_numeric($h) || $l <= 0 || $w <= 0 || $h <= 0) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid prism dimensions.'], 403);
                    }
                    $expected = 2 * ($l * $w + $l * $h + $w * $h);
                }

                if (abs($ans - $expected) > 0.01) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'kind' => $kind, 'submitted' => $ans, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted surface area is mathematically incorrect.'
                    ], 403);
                }
            } elseif ($type === 'geo-pyramid') {
                // تحقق رياضي لمختبر قانون الثلث: V = (مساحة القاعدة × الارتفاع) / 3
                $kind = $verification['kind'] ?? null;
                $ans = $verification['ans'] ?? null;

                if (!in_array($kind, ['cylinderCone', 'pyramid'], true) || $ans === null || !is_numeric($ans) || $ans <= 0) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                $expected = null;
                if ($kind === 'cylinderCone') {
                    $cylinderVol = $verification['cylinderVol'] ?? null;
                    if (!is_numeric($cylinderVol) || $cylinderVol <= 0) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid cylinder volume.'], 403);
                    }
                    $expected = $cylinderVol / 3;
                } else { // pyramid
                    $baseArea = $verification['baseArea'] ?? null;
                    $height = $verification['height'] ?? null;
                    if (!is_numeric($baseArea) || !is_numeric($height) || $baseArea <= 0 || $height <= 0) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid base area or height.'], 403);
                    }
                    $expected = ($baseArea * $height) / 3;
                }

                if (abs($ans - $expected) > 0.01) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'kind' => $kind, 'submitted' => $ans, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted volume is mathematically incorrect.'
                    ], 403);
                }
            } elseif ($type === 'factor-common') {
                // تحقق رياضي لمختبر التحليل بالعامل المشترك: a×x + a×c = a(x + c)
                $a = $verification['a'] ?? null;
                $c = $verification['c'] ?? null;

                if ($a === null || $c === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                if (!is_numeric($a) || !is_numeric($c) || (int) $a < 2) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'a must be a numeric common factor of at least 2.'
                    ], 403);
                }
            } elseif ($type === 'eq-solve-linear') {
                // تحقق رياضي لمختبر حل المعادلات: a×x + b = c
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $c = $verification['c'] ?? null;
                $x = $verification['x'] ?? null;

                if ($a === null || $b === null || $c === null || $x === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                if (!is_numeric($a) || !is_numeric($b) || !is_numeric($c) || !is_numeric($x) || (int) $a === 0) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'a, b, c and x must be numeric and a must not be zero.'
                    ], 403);
                }

                if ((int) $a * (int) $x + (int) $b !== (int) $c) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'c' => $c, 'x' => $x,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted x does not satisfy the equation.'
                    ], 403);
                }
            } elseif ($type === 'pyth-visual-triple') {
                // تحقق رياضي لمختبر فيثاغورس البصري: a² + b² = c²
                $a = $verification['a'] ?? null;
                $b = $verification['b'] ?? null;
                $c = $verification['c'] ?? null;

                if ($a === null || $b === null || $c === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                if (!is_numeric($a) || !is_numeric($b) || !is_numeric($c) || (int) $a <= 0 || (int) $b <= 0 || (int) $c <= 0) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'a, b and c must be positive numbers.'
                    ], 403);
                }

                if (((int) $a) ** 2 + ((int) $b) ** 2 !== ((int) $c) ** 2) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'a' => $a, 'b' => $b, 'c' => $c,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted triple does not satisfy the Pythagorean identity.'
                    ], 403);
                }
            } elseif ($type === 'thales-verify-parallel') {
                // تحقق رياضي لمختبر التحقق من التوازي: (AD/AB == AE/AC) يجب أن يطابق الإجابة المُرسلة
                $ad = $verification['ad'] ?? null;
                $ab = $verification['ab'] ?? null;
                $ae = $verification['ae'] ?? null;
                $ac = $verification['ac'] ?? null;
                $answer = $verification['answer'] ?? null;

                if ($ad === null || $ab === null || $ae === null || $ac === null || !is_bool($answer)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                $vals = [$ad, $ab, $ae, $ac];
                $allNumeric = true;
                foreach ($vals as $v) { if (!is_numeric($v) || $v <= 0) { $allNumeric = false; break; } }
                if (!$allNumeric) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'All lengths must be positive numbers.'
                    ], 403);
                }

                $isActuallyParallel = abs(($ad / $ab) - ($ae / $ac)) < 0.01;
                if ($isActuallyParallel !== $answer) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'ad' => $ad, 'ab' => $ab, 'ae' => $ae, 'ac' => $ac, 'submitted' => $answer, 'expected' => $isActuallyParallel,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The parallel/non-parallel judgment does not match the ratios.'
                    ], 403);
                }
            } elseif ($type === 'div-discover') {
                // تحقق رياضي لمختبر اكتشاف القواسم: يعيد الخادم حساب المجموعة الحقيقية
                // لقواسم target ويقارنها بالمجموعة المُرسلة (بعد الترتيب والتفرّد).
                $target = $verification['target'] ?? null;
                $divisors = $verification['divisors'] ?? null;

                if ($target === null || !is_array($divisors)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                if (!is_numeric($target) || (int) $target < 4 || (int) $target > 1000) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Target must be a reasonable positive integer.'
                    ], 403);
                }

                $target = (int) $target;
                $expectedDivisors = [];
                for ($i = 1; $i <= $target; $i++) {
                    if ($target % $i === 0) { $expectedDivisors[] = $i; }
                }

                $submitted = array_values(array_unique(array_map('intval', $divisors)));
                sort($submitted);

                if ($submitted !== $expectedDivisors) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'target' => $target, 'submitted' => $submitted, 'expected' => $expectedDivisors,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted divisor set does not match the target number.'
                    ], 403);
                }
            } elseif ($type === 'vec-concept-match') {
                // تحقق رياضي لمختبر مفهوم الشعاع: تساوٍ أو تعاكس فعلي بين المركبتين
                $kind = $verification['kind'] ?? null;
                $tdx = $verification['targetDx'] ?? null;
                $tdy = $verification['targetDy'] ?? null;
                $cdx = $verification['chosenDx'] ?? null;
                $cdy = $verification['chosenDy'] ?? null;

                if (!in_array($kind, ['equal', 'opposite'], true) || $tdx === null || $tdy === null || $cdx === null || $cdy === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                foreach ([$tdx, $tdy, $cdx, $cdy] as $v) {
                    if (!is_numeric($v)) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'Vector components must be numeric.'
                        ], 403);
                    }
                }

                $matches = $kind === 'equal'
                    ? ((int) $cdx === (int) $tdx && (int) $cdy === (int) $tdy)
                    : ((int) $cdx === -(int) $tdx && (int) $cdy === -(int) $tdy);

                if (!$matches) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'kind' => $kind, 'target' => [$tdx, $tdy], 'chosen' => [$cdx, $cdy],
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The chosen vector does not satisfy the requested relationship.'
                    ], 403);
                }
            } elseif ($type === 'vec-chasles-chain') {
                // تحقق رياضي لمختبر علاقة شال: إعادة بناء السلسلة من الأشعة (بأي ترتيب)
                // والتحقق أن نقطة البداية/النهاية المُرسلتين تطابقان طرفي السلسلة الفعليين.
                $vectors = $verification['vectors'] ?? null;
                $ansStart = $verification['ansStart'] ?? null;
                $ansEnd = $verification['ansEnd'] ?? null;

                if (!is_array($vectors) || count($vectors) < 2 || $ansStart === null || $ansEnd === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                $edges = [];
                $startsSet = [];
                $endsSet = [];
                foreach ($vectors as $v) {
                    if (!is_string($v) || strlen($v) !== 2) {
                        $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'Each vector must be a 2-letter string.'
                        ], 403);
                    }
                    $a = $v[0]; $b = $v[1];
                    $edges[$a] = $b;
                    $startsSet[$a] = true;
                    $endsSet[$b] = true;
                }

                // نقطة البداية الحقيقية: الحرف الذي لا يظهر أبداً كنهاية شعاع آخر
                $possibleStarts = array_diff(array_keys($startsSet), array_keys($endsSet));
                if (count($possibleStarts) !== 1) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['vectors' => $vectors]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The vector chain is not a valid telescoping sequence.'
                    ], 403);
                }

                $current = array_values($possibleStarts)[0];
                $expectedStart = $current;
                $steps = 0;
                while (isset($edges[$current]) && $steps < 20) {
                    $current = $edges[$current];
                    $steps++;
                }
                $expectedEnd = $current;

                if (strtoupper((string) $ansStart) !== strtoupper($expectedStart) || strtoupper((string) $ansEnd) !== strtoupper($expectedEnd)) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'vectors' => $vectors, 'submitted' => [$ansStart, $ansEnd], 'expected' => [$expectedStart, $expectedEnd],
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted resultant vector does not match the chain.'
                    ], 403);
                }
            } elseif ($type === 'trig-naming-answer') {
                // تحقق منطقي لمختبر تسمية الأضلاع: المثلث ثابت البنية (الزاوية القائمة
                // دائماً في C)، لذا يمكن للخادم إعادة حساب الإجابة الصحيحة بشكل مستقل تماماً.
                $kind = $verification['kind'] ?? null;
                $target = $verification['target'] ?? null;
                $answer = $verification['answer'] ?? null;

                if (!in_array($kind, ['adjacent', 'opposite', 'hypotenuse'], true) || $answer === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                if ($kind === 'hypotenuse') {
                    $expected = 'الوتر';
                } else {
                    if (!in_array($target, ['A', 'B'], true)) {
                        $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'Invalid target angle.'
                        ], 403);
                    }
                    $adjacentSide = $target === 'A' ? 'AC' : 'BC';
                    $oppositeSide = $target === 'A' ? 'BC' : 'AC';
                    $expected = $kind === 'adjacent' ? $adjacentSide : $oppositeSide;
                }

                if ($answer !== $expected) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'kind' => $kind, 'target' => $target, 'submitted' => $answer, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted side name is incorrect for this triangle.'
                    ], 403);
                }
            } elseif ($type === 'trig-identity-answer') {
                // تحقق رياضي لمختبر الترابط المثلثي: يعيد الخادم اشتقاق الإجابة الصحيحة من
                // القيم الأساسية (cosX, sinX) ولا يثق بحقل "ans" القادم من العميل مباشرة.
                $kind = $verification['kind'] ?? null;
                $submitted = $verification['submitted'] ?? null;
                $cosX = $verification['cosX'] ?? null;
                $sinX = $verification['sinX'] ?? null;

                if (!in_array($kind, ['identity', 'tan-from-ratio', 'find-cos-from-sin'], true) || $submitted === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                if (!is_numeric($submitted)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Submitted value must be numeric.'
                    ], 403);
                }

                $tolerance = 0.03;
                if ($kind === 'identity') {
                    $expected = 1.0;
                } else {
                    if (!is_numeric($cosX) || !is_numeric($sinX) || (float) $cosX <= 0 || (float) $cosX > 1 || (float) $sinX <= 0 || (float) $sinX > 1) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'cosX and sinX must be valid ratios between 0 and 1.'
                        ], 403);
                    }
                    $expected = $kind === 'tan-from-ratio'
                        ? (float) $sinX / (float) $cosX
                        : sqrt(max(0, 1 - ((float) $sinX) ** 2));
                }

                if (abs((float) $submitted - $expected) > $tolerance) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'kind' => $kind, 'submitted' => $submitted, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted trigonometric value is incorrect.'
                    ], 403);
                }
            } elseif ($type === 'trig-special-answer') {
                // تحقق منطقي لمختبر الزوايا الشهيرة: جدول القيم ثابت ومعروف، فيعيد
                // الخادم اشتقاق الإجابة الصحيحة بشكل مستقل تماماً عن العميل.
                $kind = $verification['kind'] ?? null;
                $angle = $verification['angle'] ?? null;
                $func = $verification['func'] ?? null;
                $answer = $verification['answer'] ?? null;

                $table = [
                    30 => ['sin' => '1/2', 'cos' => '√3/2', 'tan' => '√3/3'],
                    45 => ['sin' => '√2/2', 'cos' => '√2/2', 'tan' => '1'],
                    60 => ['sin' => '√3/2', 'cos' => '1/2', 'tan' => '√3'],
                ];

                if (!in_array($kind, ['value-forward', 'angle-reverse'], true) || !in_array((int) $angle, [30, 45, 60], true) || !in_array($func, ['sin', 'cos', 'tan'], true) || $answer === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                $angle = (int) $angle;
                $expected = $kind === 'value-forward' ? $table[$angle][$func] : "{$angle}°";

                if ($answer !== $expected) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'kind' => $kind, 'angle' => $angle, 'func' => $func, 'submitted' => $answer, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted value does not match the special angles table.'
                    ], 403);
                }
            } elseif ($type === 'rotation-answer') {
                // تحقق رياضي لمختبر الرادار: يعيد الخادم اشتقاق القيمة الجبرية الصحيحة
                $kind = $verification['kind'] ?? null;
                $mag = $verification['mag'] ?? null;
                $ans = $verification['ans'] ?? null;

                if (!in_array($kind, ['sign-only', 'reduce'], true) || !is_numeric($mag) || !is_numeric($ans)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                $mag = (int) $mag;
                $ans = (int) $ans;

                if ($kind === 'sign-only') {
                    if (abs($ans) !== abs($mag) || $mag <= 0) {
                        $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['mag' => $mag, 'ans' => $ans]);
                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'The submitted signed angle does not match the magnitude.'
                        ], 403);
                    }
                } else {
                    $expected = $mag > 180 ? $mag - 360 : $mag;
                    if ($ans !== $expected) {
                        $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['mag' => $mag, 'ans' => $ans, 'expected' => $expected]);
                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'The submitted reduced angle is incorrect.'
                        ], 403);
                    }
                }
            } elseif ($type === 'prob-mastery-answer') {
                // تحقق رياضي لمختبر الاحتمالات: النسبة المئوية يجب أن تطابق (الجزء ÷ الكل) × 100
                $red = $verification['red'] ?? null;
                $blue = $verification['blue'] ?? null;
                $total = $verification['total'] ?? null;
                $askBlue = $verification['askBlue'] ?? false;
                $ans = $verification['ans'] ?? null;

                if (!is_numeric($red) || !is_numeric($blue) || !is_numeric($total) || !is_numeric($ans)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                $red = (int) $red; $blue = (int) $blue; $total = (int) $total; $ans = (int) $ans;

                if ($total <= 0 || $red < 0 || $blue < 0 || ($red + $blue) !== $total) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['red' => $red, 'blue' => $blue, 'total' => $total]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The bag composition is inconsistent.'
                    ], 403);
                }

                $target = $askBlue ? $blue : $red;
                $expected = (int) round(($target / $total) * 100);

                if ($ans !== $expected) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'red' => $red, 'blue' => $blue, 'total' => $total, 'submitted' => $ans, 'expected' => $expected,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The submitted probability percentage is incorrect.'
                    ], 403);
                }
            } elseif ($type === 'powers-exponent') {
                // تحقق رياضي لمختبر الأسس: نتيجة الضرب/القسمة/قوة القوة على الأسس فقط
                $base = $verification['base'] ?? null;
                $op = $verification['op'] ?? null;
                $e1 = $verification['e1'] ?? null;
                $e2 = $verification['e2'] ?? null;
                $ans = $verification['ans'] ?? null;

                if (!in_array($op, ['mul', 'div', 'pow'], true) || $e1 === null || $e2 === null || $ans === null || !is_numeric($base)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid verification payload structure.'], 403);
                }

                $e1 = (int) $e1; $e2 = (int) $e2; $ans = (int) $ans;
                $expected = $op === 'mul' ? $e1 + $e2 : ($op === 'div' ? $e1 - $e2 : $e1 * $e2);

                if ($ans !== $expected) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['op' => $op, 'e1' => $e1, 'e2' => $e2, 'submitted' => $ans, 'expected' => $expected]);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'The submitted exponent is incorrect.'], 403);
                }
            } elseif ($type === 'scientific-notation-answer') {
                // تحقق رياضي لمختبر الصيغة العلمية: mantissa × 10^exp يجب أن يطابق العدد الأصلي q
                $q = $verification['q'] ?? null;
                $mantissa = $verification['mantissa'] ?? null;
                $exp = $verification['exp'] ?? null;

                if ($q === null || !is_numeric($mantissa) || !is_numeric($exp)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid verification payload structure.'], 403);
                }

                $mantissa = (float) $mantissa; $exp = (int) $exp; $original = (float) $q;
                if ($mantissa < 1 || $mantissa >= 10) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['mantissa' => $mantissa]);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'Mantissa must be between 1 and 10.'], 403);
                }
                $reconstructed = $mantissa * (10 ** $exp);
                if (abs($reconstructed - $original) > max(0.05, abs($original) * 0.02)) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['q' => $q, 'mantissa' => $mantissa, 'exp' => $exp, 'reconstructed' => $reconstructed]);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'The scientific notation does not reconstruct the original number.'], 403);
                }
            } elseif ($type === 'fraction-simplify') {
                // تحقق رياضي لمختبر تبسيط الكسور: القيمة المبسطة يجب أن تساوي num/gcd, den/gcd فعلياً
                $num = $verification['num'] ?? null;
                $den = $verification['den'] ?? null;
                $simplifiedNum = $verification['simplifiedNum'] ?? null;
                $simplifiedDen = $verification['simplifiedDen'] ?? null;

                if (!is_numeric($num) || !is_numeric($den) || !is_numeric($simplifiedNum) || !is_numeric($simplifiedDen) || (int) $den === 0) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid verification payload structure.'], 403);
                }

                $num = (int) $num; $den = (int) $den;
                $g = $this->gcdCalc(abs($num), abs($den));
                $expectedNum = $g === 0 ? $num : intdiv($num, $g);
                $expectedDen = $g === 0 ? $den : intdiv($den, $g);

                if ((int) $simplifiedNum !== $expectedNum || (int) $simplifiedDen !== $expectedDen) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['num' => $num, 'den' => $den, 'submitted' => [$simplifiedNum, $simplifiedDen], 'expected' => [$expectedNum, $expectedDen]]);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'The submitted fraction is not fully reduced or is incorrect.'], 403);
                }
            } elseif ($type === 'trig-length-answer') {
                // تحقق رياضي لمختبر أطوال المثلثات: x = وتر × sin/cos(الزاوية)
                $angle = $verification['angle'] ?? null;
                $hyp = $verification['hyp'] ?? null;
                $ratio = $verification['ratio'] ?? null;
                $ans = $verification['ans'] ?? null;

                if (!is_numeric($angle) || !is_numeric($hyp) || !in_array($ratio, ['Sin', 'Cos'], true) || !is_numeric($ans)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid verification payload structure.'], 403);
                }

                $angleRad = ((float) $angle) * M_PI / 180;
                $expected = ((float) $hyp) * ($ratio === 'Sin' ? sin($angleRad) : cos($angleRad));

                if (abs((float) $ans - $expected) > 0.15) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['angle' => $angle, 'hyp' => $hyp, 'ratio' => $ratio, 'submitted' => $ans, 'expected' => $expected]);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'The submitted side length is incorrect.'], 403);
                }
            } elseif ($type === 'trig-angle-answer') {
                // تحقق رياضي لمختبر إيجاد الزاوية: يعيد الخادم حساب sin/cos/tan للزاوية المُرسلة
                $ratioName = $verification['ratioName'] ?? null;
                $ratioValue = $verification['ratioValue'] ?? null;
                $ans = $verification['ans'] ?? null;

                if (!in_array($ratioName, ['sin', 'cos', 'tan'], true) || !is_numeric($ratioValue) || !is_numeric($ans)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid verification payload structure.'], 403);
                }

                $angleRad = ((float) $ans) * M_PI / 180;
                $recomputed = $ratioName === 'sin' ? sin($angleRad) : ($ratioName === 'cos' ? cos($angleRad) : tan($angleRad));

                if (abs($recomputed - (float) $ratioValue) > 0.02) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['ratioName' => $ratioName, 'ratioValue' => $ratioValue, 'submitted' => $ans, 'recomputed' => $recomputed]);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'The submitted angle does not match the given ratio.'], 403);
                }
            } elseif ($type === 'stat-mean-answer') {
                // تحقق رياضي لمختبر الوسط الحسابي: يعيد الخادم حساب المتوسط من البيانات الخام
                $data = $verification['data'] ?? null;
                $ans = $verification['ans'] ?? null;

                if (!is_array($data) || count($data) === 0 || !is_numeric($ans)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid verification payload structure.'], 403);
                }
                foreach ($data as $v) {
                    if (!is_numeric($v)) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json(['error' => 'Cheat detected', 'message' => 'Data values must be numeric.'], 403);
                    }
                }
                $expected = array_sum($data) / count($data);
                if (abs((float) $ans - $expected) > 0.15) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['data' => $data, 'submitted' => $ans, 'expected' => $expected]);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'The submitted mean is incorrect.'], 403);
                }
            } elseif ($type === 'stat-freq-answer') {
                // تحقق رياضي لمختبر التكرار: يعيد الخادم عدّ كل قيمة في البيانات الخام
                $data = $verification['data'] ?? null;
                $counts = $verification['counts'] ?? null;

                if (!is_array($data) || count($data) === 0 || !is_array($counts)) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json(['error' => 'Cheat detected', 'message' => 'Invalid verification payload structure.'], 403);
                }

                $expectedCounts = [];
                foreach ($data as $v) {
                    if (!is_numeric($v)) {
                        $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                        return response()->json(['error' => 'Cheat detected', 'message' => 'Data values must be numeric.'], 403);
                    }
                    $key = (string) (int) $v;
                    $expectedCounts[$key] = ($expectedCounts[$key] ?? 0) + 1;
                }

                foreach ($expectedCounts as $key => $expectedCount) {
                    $submitted = $counts[$key] ?? null;
                    if ((int) $submitted !== $expectedCount) {
                        $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, ['data' => $data, 'submitted' => $counts, 'expected' => $expectedCounts]);
                        return response()->json(['error' => 'Cheat detected', 'message' => 'The submitted frequency table is incorrect.'], 403);
                    }
                }
            } else {
                $this->logSecurityIncident($user, 'unknown_verification_type', $labId, $request);
                return response()->json([
                    'error' => 'Cheat detected',
                    'message' => 'Unknown verification type.'
                ], 403);
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

    /** Greatest common divisor — used by the fraction-simplify verification. */
    private function gcdCalc($a, $b)
    {
        $a = abs((int) $a);
        $b = abs((int) $b);
        while ($b !== 0) {
            [$a, $b] = [$b, $a % $b];
        }
        return $a;
    }
}
