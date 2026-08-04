<?php

namespace App\Services\LabVerifiers;

use App\Services\LabVerifiers\Concerns\HasVerificationHelpers;
use Illuminate\Http\Request;

/**
 * Algebra domain verifier — one of 5 files split out of the former
 * ~2000-line RewardController so a mistake editing one subject's math
 * checks can't break the syntax of (or require re-reviewing) the other
 * four domains' verification logic.
 *
 * handles() tells the dispatcher whether this class owns a given
 * verification "type" string. verify() returns:
 *   - a JsonResponse  -> reject (403), the controller returns it immediately
 *   - null            -> validation passed, controller proceeds to award
 * (verify() is only ever called after handles() returned true for $type.)
 */
class AlgebraVerifier
{
    use HasVerificationHelpers;

    private const TYPES = ['system', 'linear', 'pgcd', 'ratio', 'root', 'roots-combine', 'roots-multiply', 'roots-divide', 'expand-simple', 'expand-double', 'identity-sum-sq', 'identity-diff-sq', 'identity-diff-sq2', 'linear-2pt', 'ineq-solve', 'ineq-graph', 'divisor-props', 'eq-product', 'coprime', 'sys-strategy', 'factor-common', 'eq-solve-linear', 'powers-exponent', 'scientific-notation-answer', 'fraction-simplify'];

    public function handles(string $type): bool
    {
        return in_array($type, self::TYPES, true);
    }

    public function verify(string $type, array $verification, $user, string $labId, Request $request)
    {
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
            } else {
            return null; // not owned by this domain
        }
        return null; // owned, validation passed
    }
}
