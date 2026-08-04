<?php

namespace App\Services\LabVerifiers;

use App\Services\LabVerifiers\Concerns\HasVerificationHelpers;
use Illuminate\Http\Request;

/**
 * Stats domain verifier — one of 5 files split out of the former
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
class StatsVerifier
{
    use HasVerificationHelpers;

    private const TYPES = ['stat-cumulative', 'stat-chart', 'prob-mastery-answer', 'stat-mean-answer', 'stat-freq-answer'];

    public function handles(string $type): bool
    {
        return in_array($type, self::TYPES, true);
    }

    public function verify(string $type, array $verification, $user, string $labId, Request $request)
    {
        if ($type === 'stat-cumulative') {
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
            return null; // not owned by this domain
        }
        return null; // owned, validation passed
    }
}
