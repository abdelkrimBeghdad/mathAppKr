<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\SecurityIncident;

class LabRewardSecurityTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();

        // Create initial lab progress record so that generic progress check passes
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
<<<<<<< HEAD
            'lab_id' => 'sys-add',
=======
            'lab_id' => 'sys-add-mastery',
>>>>>>> df929630834ba2afb74a060109d3bcd680dbd5a9
            'phase' => 'practice'
        ]);
    }

    /**
     * Test successful claim with correct mathematical verification.
     */
    public function test_allows_reward_with_correct_math_verification()
    {
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
<<<<<<< HEAD
            'lab_id' => 'sys-add',
=======
            'lab_id' => 'sys-add-mastery',
>>>>>>> df929630834ba2afb74a060109d3bcd680dbd5a9
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 2, 'b' => 1, 'c' => 4],
                'eq2' => ['a' => 1, 'b' => -2, 'c' => -3],
                'x' => 1,
                'y' => 2
            ]
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['status', 'message', 'reward']);

        // Check user balance incremented
        $this->user->refresh();
        $this->assertEquals(100, $this->user->coins);
        $this->assertEquals(200, $this->user->xp);
    }

    /**
     * Test block and log when verification payload is missing entirely.
     */
    public function test_blocks_and_logs_missing_verification()
    {
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
<<<<<<< HEAD
            'lab_id' => 'sys-add'
=======
            'lab_id' => 'sys-add-mastery'
>>>>>>> df929630834ba2afb74a060109d3bcd680dbd5a9
            // Missing verification
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');

        // Check if security incident is recorded
        $this->assertDatabaseHas('security_incidents', [
            'user_id' => $this->user->id,
            'type' => 'lab_cheating',
            'severity' => 'high'
        ]);

        $incident = SecurityIncident::where('user_id', $this->user->id)->first();
        $this->assertEquals('missing_verification', $incident->details['cheat_type']);
    }

    /**
     * Test block and log when incorrect math answers are supplied.
     */
    public function test_blocks_and_logs_incorrect_math_solution()
    {
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
<<<<<<< HEAD
            'lab_id' => 'sys-add',
=======
            'lab_id' => 'sys-add-mastery',
>>>>>>> df929630834ba2afb74a060109d3bcd680dbd5a9
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 2, 'b' => 1, 'c' => 4],
                'eq2' => ['a' => 1, 'b' => -2, 'c' => -3],
                'x' => 9, // Wrong answer (should be 1)
                'y' => 9  // Wrong answer (should be 2)
            ]
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');

        $this->assertDatabaseHas('security_incidents', [
            'user_id' => $this->user->id,
            'type' => 'lab_cheating',
            'severity' => 'high'
        ]);

        $incident = SecurityIncident::where('user_id', $this->user->id)->first();
        $this->assertEquals('invalid_math_solution', $incident->details['cheat_type']);
    }

    /**
     * Test block and log when trivial/forged equations (like 0x + 0y = 0) are used.
     */
    public function test_blocks_and_logs_trivial_equations()
    {
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
<<<<<<< HEAD
            'lab_id' => 'sys-add',
=======
            'lab_id' => 'sys-add-mastery',
>>>>>>> df929630834ba2afb74a060109d3bcd680dbd5a9
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 0, 'b' => 0, 'c' => 0], // Trivial
                'eq2' => ['a' => 1, 'b' => -2, 'c' => -3],
                'x' => 1,
                'y' => 2
            ]
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');

        $this->assertDatabaseHas('security_incidents', [
            'user_id' => $this->user->id,
            'type' => 'lab_cheating',
            'severity' => 'high'
        ]);

        $incident = SecurityIncident::where('user_id', $this->user->id)->first();
        $this->assertEquals('trivial_equations', $incident->details['cheat_type']);
    }

    /**
     * Test block and log when student tries to claim a reward without any progress in the lab.
     */
    public function test_blocks_and_logs_when_no_progress_exists()
    {
        // Delete the progress created in setUp
        \App\Models\LabProgress::where('user_id', $this->user->id)->delete();

        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
<<<<<<< HEAD
            'lab_id' => 'sys-add',
=======
            'lab_id' => 'sys-add-mastery',
>>>>>>> df929630834ba2afb74a060109d3bcd680dbd5a9
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 2, 'b' => 1, 'c' => 4],
                'eq2' => ['a' => 1, 'b' => -2, 'c' => -3],
                'x' => 1,
                'y' => 2
            ]
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');

        $this->assertDatabaseHas('security_incidents', [
            'user_id' => $this->user->id,
            'type' => 'lab_cheating',
            'severity' => 'high'
        ]);

        $incident = SecurityIncident::where('user_id', $this->user->id)->first();
        $this->assertEquals('missing_lab_progress', $incident->details['cheat_type']);
    }
<<<<<<< HEAD

    /**
     * Test that a second claim for the same lab is blocked (infinite farming fix).
     */
    public function test_blocks_and_logs_duplicate_claim_for_same_lab()
    {
        $firstResponse = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-add',
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 2, 'b' => 1, 'c' => 4],
                'eq2' => ['a' => 1, 'b' => -2, 'c' => -3],
                'x' => 1,
                'y' => 2
            ]
        ]);
        $firstResponse->assertStatus(200);

        $secondResponse = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-add',
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 2, 'b' => 1, 'c' => 4],
                'eq2' => ['a' => 1, 'b' => -2, 'c' => -3],
                'x' => 1,
                'y' => 2
            ]
        ]);

        $secondResponse->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');

        // Coins/xp must NOT have doubled
        $this->user->refresh();
        $this->assertEquals(100, $this->user->coins);
        $this->assertEquals(200, $this->user->xp);

        $incident = SecurityIncident::where('user_id', $this->user->id)
            ->latest('id')->first();
        $this->assertEquals('duplicate_claim', $incident->details['cheat_type']);
    }

    /**
     * Test that a short/generic progress lab_id can no longer be used to
     * fuzzy-match and unlock rewards for an unrelated real lab_id.
     */
    public function test_blocks_prefix_spoofed_lab_id()
    {
        // Attacker creates a short, generic progress record.
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'sys',
            'phase' => 'completed'
        ]);

        // Tries to claim a real, unrelated lab that merely shares the prefix.
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-mult-mastery',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');

        $incident = SecurityIncident::where('user_id', $this->user->id)->first();
        $this->assertEquals('missing_lab_progress', $incident->details['cheat_type']);
    }

    /**
     * sys-subst is now enforced (pilot batch) — a valid solution must pass.
     */
    public function test_valid_substitution_solution_awards_reward()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'sys-subst',
            'phase' => 'practice'
        ]);

        // x + 2y = 8  و  3x - y = 10  →  x=4, y=2
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-subst',
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 1, 'b' => 2, 'c' => 8],
                'eq2' => ['a' => 3, 'b' => -1, 'c' => 10],
                'x' => 4,
                'y' => 2,
            ]
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_invalid_substitution_solution_is_rejected()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'sys-subst',
            'phase' => 'practice'
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-subst',
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 1, 'b' => 2, 'c' => 8],
                'eq2' => ['a' => 3, 'b' => -1, 'c' => 10],
                'x' => 99,
                'y' => 99,
            ]
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * pgcd-euclidean is now enforced (pilot batch).
     */
    public function test_valid_pgcd_result_awards_reward()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'pgcd-euclidean',
            'phase' => 'practice'
        ]);

        // gcd(84, 60) = 12
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'pgcd-euclidean',
            'verification' => [
                'type' => 'pgcd',
                'a' => 84,
                'b' => 60,
                'result' => 12,
            ]
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_pgcd_result_is_rejected()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'pgcd-euclidean',
            'phase' => 'practice'
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'pgcd-euclidean',
            'verification' => [
                'type' => 'pgcd',
                'a' => 84,
                'b' => 60,
                'result' => 7, // خطأ متعمد — الصحيح هو 12
            ]
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * trig-sin/cos/tan-mastery are now enforced (batch 5).
     */
    public function test_valid_trig_sin_ratio_awards_reward()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'trig-sin',
            'phase' => 'practice'
        ]);

        // مثلث 3-4-5: sin = opp/hyp = 3/5 = 0.6
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'trig-sin',
            'verification' => ['type' => 'ratio', 'kind' => 'sin', 'opp' => 3, 'hyp' => 5, 'result' => 0.6],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_trig_sin_ratio_is_rejected()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'trig-sin',
            'phase' => 'practice'
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'trig-sin',
            'verification' => ['type' => 'ratio', 'kind' => 'sin', 'opp' => 3, 'hyp' => 5, 'result' => 0.99],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * roots-simplification is now enforced (batch 5).
     */
    public function test_valid_root_decomposition_awards_reward()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'roots-simplification',
            'phase' => 'practice'
        ]);

        // √50 = √(25×2) — 25 هو أكبر مربع تام يقسم 50
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'roots-simplification',
            'verification' => ['type' => 'root', 'n' => 50, 'square' => 25, 'remainder' => 2],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_non_largest_root_decomposition_is_rejected()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'roots-simplification',
            'phase' => 'practice'
        ]);

        // 50 = 4 × 12.5 ليس تفكيكاً صحيحاً أصلاً (وليس أكبر مربع تام أيضاً)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'roots-simplification',
            'verification' => ['type' => 'root', 'n' => 50, 'square' => 4, 'remainder' => 12],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * pyth-hyp / pyth-leg / pyth-verify are now enforced (batch 7).
     */
    public function test_valid_pyth_triple_awards_reward()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'pyth-hyp',
            'phase' => 'practice'
        ]);

        // 3-4-5 مثلث قائم صحيح
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'pyth-hyp',
            'verification' => ['type' => 'pyth', 'a' => 3, 'b' => 4, 'c' => 5],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_invalid_pyth_triple_is_rejected()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'pyth-hyp',
            'phase' => 'practice'
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'pyth-hyp',
            'verification' => ['type' => 'pyth', 'a' => 3, 'b' => 4, 'c' => 6], // 5 هو الصحيح لا 6
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    public function test_valid_pyth_check_true_awards_reward()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'pyth-verify',
            'phase' => 'practice'
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'pyth-verify',
            'verification' => ['type' => 'pyth-check', 'a' => 3, 'b' => 4, 'c' => 5, 'answer' => true],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_pyth_check_judgment_is_rejected()
    {
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'pyth-verify',
            'phase' => 'practice'
        ]);

        // 3-5-7 ليس مثلثاً قائماً، لكن الطالب ادّعى أنه قائم
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'pyth-verify',
            'verification' => ['type' => 'pyth-check', 'a' => 3, 'b' => 5, 'c' => 7, 'answer' => true],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * roots-addition/subtraction/multiplication/division-mastery enforced (batch 8).
     */
    public function test_valid_roots_addition_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'roots-addition', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'roots-addition',
            'verification' => ['type' => 'roots-combine', 'a' => 3, 'b' => 5, 'result' => 8, 'op' => 'add'],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_roots_subtraction_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'roots-subtraction', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'roots-subtraction',
            'verification' => ['type' => 'roots-combine', 'a' => 3, 'b' => 5, 'result' => 99, 'op' => 'sub'], // الصحيح -2
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    public function test_valid_roots_multiplication_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'roots-multiplication', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'roots-multiplication',
            'verification' => ['type' => 'roots-multiply', 'a' => 2, 'b' => 3, 'result' => 6],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_roots_division_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'roots-division', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'roots-division',
            'verification' => ['type' => 'roots-divide', 'a' => 50, 'b' => 2, 'quot' => 25, 'result' => 5],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_roots_division_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'roots-division', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'roots-division',
            'verification' => ['type' => 'roots-divide', 'a' => 50, 'b' => 2, 'quot' => 25, 'result' => 4], // الصحيح 5
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * pgcd-divisors / pgcd-subtraction now enforced (batch 9) — reuse the existing 'pgcd' type.
     */
    public function test_valid_pgcd_divisors_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'pgcd-divisors', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'pgcd-divisors',
            'verification' => ['type' => 'pgcd', 'a' => 12, 'b' => 18, 'result' => 6],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_pgcd_subtraction_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'pgcd-subtraction', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'pgcd-subtraction',
            'verification' => ['type' => 'pgcd', 'a' => 48, 'b' => 18, 'result' => 6],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_pgcd_subtraction_result_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'pgcd-subtraction', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'pgcd-subtraction',
            'verification' => ['type' => 'pgcd', 'a' => 48, 'b' => 18, 'result' => 9], // الصحيح 6
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * exp-simple enforced (batch 10).
     */
    public function test_valid_expand_simple_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'exp-simple', 'phase' => 'practice']);
        // 3(x + 4) = 3x + 12
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'exp-simple',
            'verification' => ['type' => 'expand-simple', 'a' => 3, 'b' => 4, 'op' => '+', 'term1' => 3, 'term2' => 12],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_expand_simple_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'exp-simple', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'exp-simple',
            'verification' => ['type' => 'expand-simple', 'a' => 3, 'b' => 4, 'op' => '-', 'term1' => 3, 'term2' => 12], // يجب أن يكون -12
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * exp-double enforced (batch 11).
     */
    public function test_valid_expand_double_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'exp-double', 'phase' => 'practice']);
        // (x+2)(x+3) = x² + 5x + 6
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'exp-double',
            'verification' => ['type' => 'expand-double', 'b' => 2, 'd' => 3, 'midTerm' => 5, 'lastTerm' => 6],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_expand_double_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'exp-double', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'exp-double',
            'verification' => ['type' => 'expand-double', 'b' => 2, 'd' => 3, 'midTerm' => 5, 'lastTerm' => 99],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * id1/id2/id3 (famous identities) enforced (batch 12).
     */
    public function test_valid_identity_sum_sq_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'id1', 'phase' => 'practice']);
        // (x+5)² = x² + 10x + 25
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'id1',
            'verification' => ['type' => 'identity-sum-sq', 'b' => 5, 'midTerm' => 10, 'lastTerm' => 25],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_identity_diff_sq_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'id2', 'phase' => 'practice']);
        // (x-4)² = x² - 8x + 16
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'id2',
            'verification' => ['type' => 'identity-diff-sq', 'b' => 4, 'midTerm' => 8, 'lastTerm' => 16],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_identity_diff_sq2_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'id3', 'phase' => 'practice']);
        // (x+6)(x-6) = x² - 36
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'id3',
            'verification' => ['type' => 'identity-diff-sq2', 'b' => 6, 'lastTerm' => 36],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_identity_diff_sq2_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'id3', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'id3',
            'verification' => ['type' => 'identity-diff-sq2', 'b' => 6, 'lastTerm' => 99], // الصحيح 36
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * lin-formula / lin-image enforced (batch 13) — reuse existing 'linear' type.
     */
    public function test_valid_lin_formula_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'lin-formula', 'phase' => 'practice']);
        // f(x) = 3x, x=4 -> y=12
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'lin-formula',
            'verification' => ['type' => 'linear', 'x' => 4, 'y' => 12, 'm' => 3, 'b' => 0],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_lin_image_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'lin-image', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'lin-image',
            'verification' => ['type' => 'linear', 'x' => 4, 'y' => 99, 'm' => 3, 'b' => 0], // الصحيح 12
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * aff-formula / aff-image enforced (batch 14) — reuse existing 'linear' type.
     */
    public function test_valid_aff_formula_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'aff-formula', 'phase' => 'practice']);
        // f(x) = 2x + 3, x=1 -> y=5
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'aff-formula',
            'verification' => ['type' => 'linear', 'x' => 1, 'y' => 5, 'm' => 2, 'b' => 3],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_aff_image_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'aff-image', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'aff-image',
            'verification' => ['type' => 'linear', 'x' => 4, 'y' => 999, 'm' => 2, 'b' => 3], // الصحيح 11
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * lin-graph (reuse 'linear') / aff-graph (new 'linear-2pt') enforced (batch 15).
     */
    public function test_valid_lin_graph_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'lin-graph', 'phase' => 'practice']);
        // f(x) = 2x, point (1,2)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'lin-graph',
            'verification' => ['type' => 'linear', 'x' => 1, 'y' => 2, 'm' => 2, 'b' => 0],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_aff_graph_two_points_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'aff-graph', 'phase' => 'practice']);
        // f(x) = 2x + 1: (0,1) و (1,3)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'aff-graph',
            'verification' => [
                'type' => 'linear-2pt', 'm' => 2, 'b' => 1,
                'p1' => ['x' => 0, 'y' => 1], 'p2' => ['x' => 1, 'y' => 3],
            ],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_aff_graph_with_one_wrong_point_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'aff-graph', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'aff-graph',
            'verification' => [
                'type' => 'linear-2pt', 'm' => 2, 'b' => 1,
                'p1' => ['x' => 0, 'y' => 1], 'p2' => ['x' => 1, 'y' => 99], // خطأ متعمد
            ],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    public function test_aff_graph_with_identical_points_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'aff-graph', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'aff-graph',
            'verification' => [
                'type' => 'linear-2pt', 'm' => 2, 'b' => 1,
                'p1' => ['x' => 0, 'y' => 1], 'p2' => ['x' => 0, 'y' => 1], // نقطتان متطابقتان
            ],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * vec-para / vec-rand enforced (batch 16).
     */
    public function test_valid_vec_parallelogram_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-para', 'phase' => 'practice']);
        // A=(0,0), B=(3,1), D=(1,3) -> C=(4,4)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-para',
            'verification' => [
                'type' => 'vec-parallelogram',
                'a' => ['x' => 0, 'y' => 0], 'b' => ['x' => 3, 'y' => 1], 'd' => ['x' => 1, 'y' => 3], 'c' => ['x' => 4, 'y' => 4],
            ],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_vec_parallelogram_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-para', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-para',
            'verification' => [
                'type' => 'vec-parallelogram',
                'a' => ['x' => 0, 'y' => 0], 'b' => ['x' => 3, 'y' => 1], 'd' => ['x' => 1, 'y' => 3], 'c' => ['x' => 2, 'y' => 2], // خطأ متعمد
            ],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    public function test_valid_vec_sum_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-rand', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-rand',
            'verification' => [
                'type' => 'vec-sum',
                'u' => ['x' => 2, 'y' => 3], 'v' => ['x' => 1, 'y' => -2], 'sum' => ['x' => 3, 'y' => 1],
            ],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_vec_sum_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-rand', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-rand',
            'verification' => [
                'type' => 'vec-sum',
                'u' => ['x' => 2, 'y' => 3], 'v' => ['x' => 1, 'y' => -2], 'sum' => ['x' => 99, 'y' => 99],
            ],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * vec-read / vec-calc enforced (batch 17).
     */
    public function test_valid_vec_read_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-read', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-read',
            'verification' => ['type' => 'vec-read', 'dx' => 3, 'dy' => -2],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_zero_vec_read_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-read', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-read',
            'verification' => ['type' => 'vec-read', 'dx' => 0, 'dy' => 0],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    public function test_valid_vec_calc_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-calc', 'phase' => 'practice']);
        // A(-2,3), B(1,5) -> AB=(3,2)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-calc',
            'verification' => ['type' => 'vec-calc', 'ax' => -2, 'ay' => 3, 'bx' => 1, 'by' => 5, 'dx' => 3, 'dy' => 2],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_vec_calc_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-calc', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-calc',
            'verification' => ['type' => 'vec-calc', 'ax' => -2, 'ay' => 3, 'bx' => 1, 'by' => 5, 'dx' => 99, 'dy' => 99],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * vec-midpoint enforced (batch 18).
     */
    public function test_valid_vec_midpoint_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-midpoint', 'phase' => 'practice']);
        // A(2,4), B(8,6) -> M(5,5)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-midpoint',
            'verification' => ['type' => 'vec-midpoint', 'ax' => 2, 'ay' => 4, 'bx' => 8, 'by' => 6, 'mx' => 5, 'my' => 5],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_vec_midpoint_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-midpoint', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-midpoint',
            'verification' => ['type' => 'vec-midpoint', 'ax' => 2, 'ay' => 4, 'bx' => 8, 'by' => 6, 'mx' => 99, 'my' => 99],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * vec-distance enforced (batch 19).
     */
    public function test_valid_vec_distance_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-distance', 'phase' => 'practice']);
        // A(1,2), B(4,6) -> dist = sqrt(9+16) = 5
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-distance',
            'verification' => ['type' => 'vec-distance', 'ax' => 1, 'ay' => 2, 'bx' => 4, 'by' => 6, 'dist' => 5],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_vec_distance_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-distance', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-distance',
            'verification' => ['type' => 'vec-distance', 'ax' => 1, 'ay' => 2, 'bx' => 4, 'by' => 6, 'dist' => 99],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * vec-same-end enforced (batch 20) — reuses existing 'vec-sum' type.
     */
    public function test_valid_vec_same_end_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-same-end', 'phase' => 'practice']);
        // A(0,0), B(4,0), C(2,3) -> AC=(2,3), BC=(-2,3), sum=(0,6)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-same-end',
            'verification' => [
                'type' => 'vec-sum',
                'u' => ['x' => 2, 'y' => 3], 'v' => ['x' => -2, 'y' => 3], 'sum' => ['x' => 0, 'y' => 6],
            ],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_vec_same_end_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'vec-same-end', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'vec-same-end',
            'verification' => [
                'type' => 'vec-sum',
                'u' => ['x' => 2, 'y' => 3], 'v' => ['x' => -2, 'y' => 3], 'sum' => ['x' => 99, 'y' => 99],
            ],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * thales-shadow enforced (batch 21).
     */
    public function test_valid_thales_ratio_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'thales-shadow', 'phase' => 'practice']);
        // عصا 2م ظلها 3م، ظل الهرم 210م -> ارتفاع 140م
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'thales-shadow',
            'verification' => ['type' => 'thales', 'stickHeight' => 2, 'stickShadow' => 3, 'tallShadow' => 210, 'tallHeight' => 140],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_thales_ratio_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'thales-shadow', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'thales-shadow',
            'verification' => ['type' => 'thales', 'stickHeight' => 2, 'stickShadow' => 3, 'tallShadow' => 210, 'tallHeight' => 999],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * thales-prob enforced (batch 21) — covers all 3 archetypes (shadow/scale/cone),
     * each with a DIFFERENT ratio formula (shadow: ans=a*c/b, scale/cone: ans=b*c/a).
     */
    public function test_valid_thales_problem_shadow_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'thales-prob', 'phase' => 'practice']);
        // مبنى ظله 15، عصا 2م ظلها 3م -> ارتفاع = 2*15/3 = 10
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'thales-prob',
            'verification' => ['type' => 'thales-problem', 'kind' => 'shadow', 'a' => 2, 'b' => 3, 'c' => 15, 'ans' => 10],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_thales_problem_scale_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'thales-prob', 'phase' => 'practice']);
        // realA=12, drawnA=4, realB=18 -> drawnB = 4*18/12 = 6
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'thales-prob',
            'verification' => ['type' => 'thales-problem', 'kind' => 'scale', 'a' => 12, 'b' => 4, 'c' => 18, 'ans' => 6],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_thales_problem_cone_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'thales-prob', 'phase' => 'practice']);
        // H=12, R=4, h=3 -> r = 4*3/12 = 1
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'thales-prob',
            'verification' => ['type' => 'thales-problem', 'kind' => 'cone', 'a' => 12, 'b' => 4, 'c' => 3, 'ans' => 1],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_shadow_formula_confused_with_scale_formula_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'thales-prob', 'phase' => 'practice']);
        // نفس أرقام اختبار shadow أعلاه، لكن بصيغة scale/cone الخاطئة: b*c/a = 3*15/2 = 22.5 (ليس 10)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'thales-prob',
            'verification' => ['type' => 'thales-problem', 'kind' => 'shadow', 'a' => 2, 'b' => 3, 'c' => 15, 'ans' => 22.5],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * ineq-solve enforced (batch 22).
     */
    public function test_valid_ineq_solve_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'ineq-solve', 'phase' => 'practice']);
        // 2x + 6 > 14 -> x > 4
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'ineq-solve',
            'verification' => ['type' => 'ineq-solve', 'a' => 2, 'b' => 6, 'c' => 14, 'res' => 4],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_ineq_solve_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'ineq-solve', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'ineq-solve',
            'verification' => ['type' => 'ineq-solve', 'a' => 2, 'b' => 6, 'c' => 14, 'res' => 999],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    public function test_ineq_solve_zero_coefficient_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'ineq-solve', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'ineq-solve',
            'verification' => ['type' => 'ineq-solve', 'a' => 0, 'b' => 6, 'c' => 14, 'res' => 4],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * ineq-graph enforced (batch 22).
     */
    public function test_valid_ineq_graph_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'ineq-graph', 'phase' => 'practice']);
        // x ≥ 0 -> right, inclusive
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'ineq-graph',
            'verification' => ['type' => 'ineq-graph', 'sym' => '≥', 'dir' => 'right', 'inc' => true],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_ineq_graph_direction_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'ineq-graph', 'phase' => 'practice']);
        // x < -2 should be 'left', not 'right'
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'ineq-graph',
            'verification' => ['type' => 'ineq-graph', 'sym' => '<', 'dir' => 'right', 'inc' => false],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    public function test_wrong_ineq_graph_boundary_type_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'ineq-graph', 'phase' => 'practice']);
        // x > 3 should be exclusive (inc=false), not inclusive
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'ineq-graph',
            'verification' => ['type' => 'ineq-graph', 'sym' => '>', 'dir' => 'right', 'inc' => true],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * fact-id1/2/3 enforced (batch 23) — reuse existing identity verification types.
     */
    public function test_valid_fact_id1_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'fact-id1', 'phase' => 'practice']);
        // x²+10x+25 = (x+5)²
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'fact-id1',
            'verification' => ['type' => 'identity-sum-sq', 'b' => 5, 'midTerm' => 10, 'lastTerm' => 25],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_fact_id2_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'fact-id2', 'phase' => 'practice']);
        // x²-8x+16 = (x-4)²
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'fact-id2',
            'verification' => ['type' => 'identity-diff-sq', 'b' => 4, 'midTerm' => 8, 'lastTerm' => 16],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_fact_id3_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'fact-id3', 'phase' => 'practice']);
        // x²-36 = (x-6)(x+6)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'fact-id3',
            'verification' => ['type' => 'identity-diff-sq2', 'b' => 6, 'lastTerm' => 36],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_fact_id1_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'fact-id1', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'fact-id1',
            'verification' => ['type' => 'identity-sum-sq', 'b' => 5, 'midTerm' => 99, 'lastTerm' => 25],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * div-props enforced (batch 24) — covers both sum and remainder tracks.
     */
    public function test_valid_divisor_props_sum_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'div-props', 'phase' => 'practice']);
        // n=5, a=35, b=15 -> (35+15)/5 = 10
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'div-props',
            'verification' => ['type' => 'divisor-props', 'n' => 5, 'a' => 35, 'b' => 15, 'track' => 'sum', 'ans' => 10],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_divisor_props_remainder_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'div-props', 'phase' => 'practice']);
        // n=5, a=35, b=15 -> remainder = 35%15 = 5 -> 5/5 = 1
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'div-props',
            'verification' => ['type' => 'divisor-props', 'n' => 5, 'a' => 35, 'b' => 15, 'track' => 'remainder', 'ans' => 1],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_divisor_props_fake_divisibility_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'div-props', 'phase' => 'practice']);
        // يدّعي أن n=7 يقسم a=35 وb=16 (16 ليس من مضاعفات 7)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'div-props',
            'verification' => ['type' => 'divisor-props', 'n' => 7, 'a' => 35, 'b' => 16, 'track' => 'sum', 'ans' => 7],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    public function test_wrong_divisor_props_answer_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'div-props', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'div-props',
            'verification' => ['type' => 'divisor-props', 'n' => 5, 'a' => 35, 'b' => 15, 'track' => 'sum', 'ans' => 999],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * eq-product / pyth-prob enforced (batch 25 — final individual labs batch).
     */
    public function test_valid_eq_product_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'eq-product', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'eq-product',
            'verification' => ['type' => 'eq-product', 'root1' => 3, 'root2' => -5],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_eq_product_identical_roots_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'eq-product', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'eq-product',
            'verification' => ['type' => 'eq-product', 'root1' => 3, 'root2' => 3],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    public function test_valid_pyth_prob_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'pyth-prob', 'phase' => 'practice']);
        // سلم 5م، قاعدة 3م -> ارتفاع 4م (مثلث 3-4-5)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'pyth-prob',
            'verification' => ['type' => 'pyth', 'a' => 3, 'b' => 4, 'c' => 5],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_pyth_prob_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'pyth-prob', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'pyth-prob',
            'verification' => ['type' => 'pyth', 'a' => 3, 'b' => 99, 'c' => 5],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * stat-cumulative / stat-chart enforced (batch 26).
     */
    public function test_valid_stat_cumulative_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'stat-cumulative', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'stat-cumulative',
            'verification' => ['type' => 'stat-cumulative', 'freqs' => [3, 5, 2], 'correct' => [3, 8, 10]],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_stat_cumulative_sequence_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'stat-cumulative', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'stat-cumulative',
            'verification' => ['type' => 'stat-cumulative', 'freqs' => [3, 5, 2], 'correct' => [3, 8, 999]],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    public function test_valid_stat_chart_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'stat-chart', 'phase' => 'practice']);
        // total=20, value=5 -> (5/20)*360 = 90
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'stat-chart',
            'verification' => ['type' => 'stat-chart', 'total' => 20, 'value' => 5, 'ans' => 90],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_stat_chart_angle_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'stat-chart', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'stat-chart',
            'verification' => ['type' => 'stat-chart', 'total' => 20, 'value' => 5, 'ans' => 999],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * coprime enforced (batch 27) — fixes a real pre-existing labId mismatch bug
     * (was claiming 'coprime-mastery' while progress was tracked as 'coprime').
     */
    public function test_valid_coprime_true_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'coprime', 'phase' => 'practice']);
        // gcd(8,15) = 1 -> coprime
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'coprime',
            'verification' => ['type' => 'coprime', 'a' => 8, 'b' => 15, 'ans' => true],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_coprime_false_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'coprime', 'phase' => 'practice']);
        // gcd(8,12) = 4 -> not coprime
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'coprime',
            'verification' => ['type' => 'coprime', 'a' => 8, 'b' => 12, 'ans' => false],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_coprime_judgment_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'coprime', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'coprime',
            'verification' => ['type' => 'coprime', 'a' => 8, 'b' => 12, 'ans' => true],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * sys-graph (reuse linear-2pt) / sys-strategy (new type) enforced (batch 28).
     */
    public function test_valid_sys_graph_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'sys-graph', 'phase' => 'practice']);
        // y = 2x + 1: (0,1) و (3,7)
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-graph',
            'verification' => [
                'type' => 'linear-2pt', 'm' => 2, 'b' => 1,
                'p1' => ['x' => 0, 'y' => 1], 'p2' => ['x' => 3, 'y' => 7],
            ],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_sys_strategy_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'sys-strategy', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-strategy',
            'verification' => ['type' => 'sys-strategy', 'best' => 'subst', 'choice' => 'subst'],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_sys_strategy_choice_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'sys-strategy', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-strategy',
            'verification' => ['type' => 'sys-strategy', 'best' => 'add', 'choice' => 'subst'],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * geo-volume enforced (batch 29) — covers cube, rect prism, triangular prism.
     */
    public function test_valid_geo_volume_cube_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-volume', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-volume',
            'verification' => ['type' => 'geo-volume', 'kind' => 'cube', 'side' => 3, 'ans' => 27],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_geo_volume_rect_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-volume', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-volume',
            'verification' => ['type' => 'geo-volume', 'kind' => 'rect', 'baseArea' => 10, 'height' => 5, 'ans' => 50],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_geo_volume_triangular_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-volume', 'phase' => 'practice']);
        // base=4, triHeight=6 -> baseArea=12, prismLength=5 -> vol=60
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-volume',
            'verification' => ['type' => 'geo-volume', 'kind' => 'triangular', 'triBase' => 4, 'triHeight' => 6, 'prismLength' => 5, 'ans' => 60],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_geo_volume_cube_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-volume', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-volume',
            'verification' => ['type' => 'geo-volume', 'kind' => 'cube', 'side' => 3, 'ans' => 999],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * geo-solids enforced (batch 30) — generic 'identify' verification type.
     */
    public function test_valid_geo_solids_identify_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-solids', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-solids',
            'verification' => ['type' => 'identify', 'correct' => 'المكعب', 'choice' => 'المكعب'],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_geo_solids_identify_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-solids', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-solids',
            'verification' => ['type' => 'identify', 'correct' => 'المكعب', 'choice' => 'الكرة'],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * geo-net enforced (batch 31) — covers cube and rectangular prism surface area.
     */
    public function test_valid_geo_net_cube_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-net', 'phase' => 'practice']);
        // faceArea=9 -> total = 54
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-net',
            'verification' => ['type' => 'geo-net', 'kind' => 'cube', 'side' => 3, 'ans' => 54],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_geo_net_rect_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-net', 'phase' => 'practice']);
        // l=3,w=4,h=5 -> 2*(12+15+20) = 94
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-net',
            'verification' => ['type' => 'geo-net', 'kind' => 'rect', 'l' => 3, 'w' => 4, 'h' => 5, 'ans' => 94],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_geo_net_cube_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-net', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-net',
            'verification' => ['type' => 'geo-net', 'kind' => 'cube', 'side' => 3, 'ans' => 999],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }

    /**
     * geo-section (reuse 'identify') / geo-pyramid (new type) enforced (batch 32 — geo-* family complete).
     */
    public function test_valid_geo_section_identify_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-section', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-section',
            'verification' => ['type' => 'identify', 'correct' => 'دائرة', 'choice' => 'دائرة'],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_geo_pyramid_cylinder_cone_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-pyramid', 'phase' => 'practice']);
        // cylinderVol=30 -> coneVol=10
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-pyramid',
            'verification' => ['type' => 'geo-pyramid', 'kind' => 'cylinderCone', 'cylinderVol' => 30, 'ans' => 10],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_valid_geo_pyramid_shape_awards_reward()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-pyramid', 'phase' => 'practice']);
        // baseArea=12, height=5 -> (12*5)/3=20
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-pyramid',
            'verification' => ['type' => 'geo-pyramid', 'kind' => 'pyramid', 'baseArea' => 12, 'height' => 5, 'ans' => 20],
        ]);
        $response->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_wrong_geo_pyramid_is_rejected()
    {
        \App\Models\LabProgress::create(['user_id' => $this->user->id, 'lab_id' => 'geo-pyramid', 'phase' => 'practice']);
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'geo-pyramid',
            'verification' => ['type' => 'geo-pyramid', 'kind' => 'cylinderCone', 'cylinderVol' => 30, 'ans' => 999],
        ]);
        $response->assertStatus(403)->assertJsonPath('error', 'Cheat detected');
    }
=======
>>>>>>> df929630834ba2afb74a060109d3bcd680dbd5a9
}
