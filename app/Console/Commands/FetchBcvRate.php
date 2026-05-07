<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

#[Signature('bcv:fetch-rate')]
#[Description('Command description')]
class FetchBcvRate extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Consultando API del BCV...');

        try {
            // Creamos el contexto exactamente como ellos lo documentan
            $context = stream_context_create([
                'http' => [
                    'header' => "Authorization: " . env('BCV_API_KEY') . "\r\n",
                    // Añadimos un timeout prudencial de 10 segundos para no colgar tu servidor
                    'timeout' => 10,
                    // Evitamos que PHP arroje un Fatal Error si la API devuelve un 404 o 500
                    'ignore_errors' => true
                ]
            ]);

            // Hacemos la petición silenciosa
            $response = file_get_contents(
                "https://bcvapi.tech/api/v1/dolar",
                false,
                $context
            );

            // Verificamos si la respuesta contiene el JSON esperado (la llave 'tasa')
            if ($response && strpos($response, '"tasa"') !== false) {

                $data = json_decode($response, true);

                if (json_last_error() === JSON_ERROR_NONE && isset($data['tasa'])) {
                    $tasa = (float) $data['tasa'];

                    // Guardamos en la base de datos (caché)
                    Cache::forever('bcv_usd_rate', $tasa);
                    Cache::forever('bcv_last_update', $data['fecha']);

                    $this->info("✅ Tasa actualizada exitosamente: {$tasa} Bs. Fecha BCV: {$data['fecha']}");
                } else {
                    $this->error("❌ El JSON devuelto no es válido o falta la llave 'tasa'.");
                }

            } else {
                // Si vuelve a caer en el HTML del CAPTCHA, esta condición lo atrapará
                Log::error('Error o bloqueo de Firewall al consultar API BCV. Respuesta: ' . substr($response, 0, 100));
                $this->error("❌ La API no devolvió la data esperada. Posible bloqueo. Revisa los logs.");
            }

        } catch (\Exception $e) {
            Log::error('Excepción al conectar con API BCV: ' . $e->getMessage());
            $this->error("❌ Error de conexión: " . $e->getMessage());
        }
    }
}
