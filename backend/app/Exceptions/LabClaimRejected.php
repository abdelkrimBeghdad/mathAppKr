<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * Carries a ready-made JsonResponse out of a DB::transaction() closure in
 * RewardController::awardLabCompletion. Thrown for any rejection (missing
 * progress, duplicate claim, failed verification) so the transaction rolls
 * back cleanly (nothing was written yet at that point) and the controller
 * can just return $e->response afterwards — no partial writes, no awkward
 * multi-value closure return contract.
 */
class LabClaimRejected extends Exception
{
    public JsonResponse $response;

    public function __construct(JsonResponse $response)
    {
        parent::__construct('Lab reward claim rejected');
        $this->response = $response;
    }
}
