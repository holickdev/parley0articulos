<?php
$championship = App\Models\Championship::find(2);
if (!$championship) {
    echo "Championship not found";
    exit;
}

$coleadoresCount = $championship->coleadores_count;
$availableColeadores = $championship->coleadores()->pluck('coleadores.id')->toArray();
$created = 0;
$attempts = 0;

echo "Starting creation of 1000 entries...\n";

while ($created < 1000 && $attempts < 10000) {
    $attempts++;
    
    // Pick random coleadores
    $keys = array_rand($availableColeadores, $coleadoresCount);
    $selected = [];
    foreach((array)$keys as $key) {
        $selected[] = $availableColeadores[$key];
    }
    
    sort($selected);
    $hash = implode('-', $selected);
    
    // Check if hash exists for this championship
    $exists = App\Models\Entry::where('championship_id', 2)
        ->where('combination_hash', $hash)
        ->exists();
        
    if (!$exists) {
        try {
            \Illuminate\Support\Facades\DB::transaction(function() use ($championship, $selected, $hash, &$created) {
                $entry = App\Models\Entry::create([
                    'championship_id' => $championship->id,
                    'name' => 'Cuadro ' . (100 + $created), // Just a dummy name
                    'phone' => '0412' . rand(1000000, 9999999),
                    'payment_type' => 'pago movil',
                    'reference' => 'T-REF-' . bin2hex(random_bytes(4)),
                    'status' => 'approved',
                    'combination_hash' => $hash,
                ]);
                
                $entry->coleadores()->sync($selected);
                $created++;
                
                if ($created % 100 === 0) {
                    echo "Created $created entries...\n";
                }
            });
        } catch (\Exception $e) {
            echo "Error at $created: " . $e->getMessage() . "\n";
        }
    }
}

echo "Finished. Total created: $created in $attempts attempts.\n";
