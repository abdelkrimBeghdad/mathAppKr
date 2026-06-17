<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use App\Models\SecurityIncident;

class AntiCheatMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Require time_taken for these endpoints when submitting scores
        if ($request->has('answers') || $request->has('score')) {

            // Limit maximum score possible in a single transaction
            if ($request->has('score') && is_numeric($request->score)) {
                if ($request->score > 1000) {
                    SecurityIncident::create([
                        'user_id' => $request->user()->id,
                        'type' => 'high_score',
                        'severity' => 'high',
                        'details' => ['score' => $request->score, 'path' => $request->path()],
                        'ip_address' => $request->ip(),
                    ]);
                    Log::warning("AntiCheat: High score detected from User " . $request->user()->id . " - Score: {$request->score}");
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Score exceeds maximum allowed bound.'
                    ], 403);
                }
            }

            // Check for unexpectedly fast completion times relative to score or number of questions
            $timeTaken = $request->input('time_taken');

            if (is_numeric($timeTaken)) {
                // Heuristic 1: Impossible minimum time. Minimum 1.5 second per answer logic.
                if ($request->has('answers') && is_array($request->answers)) {
                    $minTime = count($request->answers) * 1.5;
                    if ($timeTaken < $minTime) {
                        SecurityIncident::create([
                            'user_id' => $request->user()->id,
                            'type' => 'impossible_time',
                            'severity' => 'medium',
                            'details' => [
                                'time_taken' => $timeTaken,
                                'min_expected' => $minTime,
                                'questions_count' => count($request->answers),
                                'path' => $request->path()
                            ],
                            'ip_address' => $request->ip(),
                        ]);
                        Log::warning("AntiCheat: Impossible time detected from User " . $request->user()->id . " - Time: {$timeTaken}s for " . count($request->answers) . " answers.");

                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'Impossible completion time detected.'
                        ], 403);
                    }
                }

                // Heuristic 2: For arcade/tournament where 'score' and 'time_taken' is submitted
                if ($request->has('score') && is_numeric($request->score)) {
                    $estimatedCorrect = $request->score / 10;
                    if ($estimatedCorrect > 0 && $timeTaken < ($estimatedCorrect * 1.5)) {
                        SecurityIncident::create([
                            'user_id' => $request->user()->id,
                            'type' => 'fast_arcade_completion',
                            'severity' => 'medium',
                            'details' => [
                                'time_taken' => $timeTaken,
                                'score' => $request->score,
                                'path' => $request->path()
                            ],
                            'ip_address' => $request->ip(),
                        ]);
                        Log::warning("AntiCheat: Fast completion for score from User " . $request->user()->id . " - Time: {$timeTaken}s, Score: {$request->score}");

                        return response()->json([
                            'error' => 'Cheat detected',
                            'message' => 'Completion time is too fast for the submitted score.'
                        ], 403);
                    }
                }
            }
        }

        return $next($request);
    }
}
