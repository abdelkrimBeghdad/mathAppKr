<?php

namespace App\Services\LabVerifiers;

use App\Services\LabVerifiers\Concerns\HasVerificationHelpers;
use Illuminate\Http\Request;

/**
 * Trig domain verifier — one of 5 files split out of the former
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
class TrigVerifier
{
    use HasVerificationHelpers;

    private const TYPES = ['trig-naming-answer', 'trig-identity-answer', 'trig-special-answer', 'trig-length-answer', 'trig-angle-answer'];

    public function handles(string $type): bool
    {
        return in_array($type, self::TYPES, true);
    }

    public function verify(string $type, array $verification, $user, string $labId, Request $request)
    {
        if ($type === 'trig-naming-answer') {
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
            } else {
            return null; // not owned by this domain
        }
        return null; // owned, validation passed
    }
}
