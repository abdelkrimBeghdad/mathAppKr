<?php

namespace App\Services\LabVerifiers\Concerns;

use App\Models\SecurityIncident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Shared helpers used by every domain Verifier (extracted verbatim from the
 * former monolithic RewardController so branch bodies below didn't need to
 * change at all — they still call $this->logSecurityIncident(...) etc.
 */
trait HasVerificationHelpers
{
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
