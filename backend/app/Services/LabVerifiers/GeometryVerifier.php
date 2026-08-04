<?php

namespace App\Services\LabVerifiers;

use App\Services\LabVerifiers\Concerns\HasVerificationHelpers;
use Illuminate\Http\Request;

/**
 * Geometry domain verifier — one of 5 files split out of the former
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
class GeometryVerifier
{
    use HasVerificationHelpers;

    private const TYPES = ['pyth', 'pyth-check', 'thales', 'thales-problem', 'geo-volume', 'identify', 'geo-net', 'geo-pyramid', 'pyth-visual-triple', 'thales-verify-parallel', 'div-discover', 'rotation-answer'];

    public function handles(string $type): bool
    {
        return in_array($type, self::TYPES, true);
    }

    public function verify(string $type, array $verification, $user, string $labId, Request $request)
    {
        if ($type === 'pyth') {
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
            } else {
            return null; // not owned by this domain
        }
        return null; // owned, validation passed
    }
}
