<?php

namespace Tests\Feature;

use App\Models\Championship;
use App\Models\Coleador;
use App\Models\Round;
use App\Models\Score;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScoreUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_update_a_score_to_zero()
    {
        $user = User::factory()->create();
        $championship = Championship::factory()->create();
        $round = Round::factory()->create(['championship_id' => $championship->id]);
        $coleador = Coleador::factory()->create();
        $championship->coleadores()->attach($coleador->id);

        // Crear un score inicial con valores > 0
        Score::create([
            'round_id' => $round->id,
            'coleador_id' => $coleador->id,
            'effective_coleadas' => 5,
            'null_coleadas' => 2,
            'gate_bulls' => 1,
            'articles' => ['test' => 1]
        ]);

        $this->actingAs($user);

        // Intentar actualizar todos los valores a 0
        $response = $this->post(route('admin.championships.scores.store', $championship->id), [
            'scores' => [
                $round->id => [
                    $coleador->id => [
                        'effective_coleadas' => 0,
                        'null_coleadas' => 0,
                        'gate_bulls' => 0,
                        'articles' => []
                    ]
                ]
            ]
        ]);

        $response->assertRedirect();
        
        $updatedScore = Score::where('round_id', $round->id)
            ->where('coleador_id', $coleador->id)
            ->first();

        $this->assertNull($updatedScore, 'Score record should be deleted when all values are 0');
    }

    public function test_it_can_update_a_single_field_to_zero_while_keeping_others()
    {
        $user = User::factory()->create();
        $championship = Championship::factory()->create();
        $round = Round::factory()->create(['championship_id' => $championship->id]);
        $coleador = Coleador::factory()->create();
        $championship->coleadores()->attach($coleador->id);

        // Score inicial: CE=5, CN=2, TP=1
        Score::create([
            'round_id' => $round->id,
            'coleador_id' => $coleador->id,
            'effective_coleadas' => 5,
            'null_coleadas' => 2,
            'gate_bulls' => 1,
            'articles' => []
        ]);

        $this->actingAs($user);

        // Cambiamos TP a 0, mantenemos los otros
        $this->post(route('admin.championships.scores.store', $championship->id), [
            'scores' => [
                $round->id => [
                    $coleador->id => [
                        'effective_coleadas' => 5,
                        'null_coleadas' => 2,
                        'gate_bulls' => 0,
                        'articles' => []
                    ]
                ]
            ]
        ]);

        $updatedScore = Score::where('round_id', $round->id)
            ->where('coleador_id', $coleador->id)
            ->first();

        $this->assertNotNull($updatedScore);
        $this->assertEquals(5, $updatedScore->effective_coleadas);
        $this->assertEquals(2, $updatedScore->null_coleadas);
        $this->assertEquals(0, $updatedScore->gate_bulls, 'TP should have been updated to 0');
    }
}
