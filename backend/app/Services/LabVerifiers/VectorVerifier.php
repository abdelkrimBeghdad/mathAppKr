<?php

namespace App\Services\LabVerifiers;

use App\Services\LabVerifiers\Concerns\HasVerificationHelpers;
use Illuminate\Http\Request;

/**
 * Vector domain verifier — one of 5 files split out of the former
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
class VectorVerifier
{
    use HasVerificationHelpers;

    private const TYPES = ['vec-parallelogram', 'vec-sum', 'vec-read', 'vec-calc', 'vec-midpoint', 'vec-distance', 'vec-concept-match', 'vec-chasles-chain'];

    public function handles(string $type): bool
    {
        return in_array($type, self::TYPES, true);
    }

    public function verify(string $type, array $verification, $user, string $labId, Request $request)
    {
        if ($type === 'vec-parallelogram') {
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
            } else {
            return null; // not owned by this domain
        }
        return null; // owned, validation passed
    }
}
