<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Cuadros - {{ $championship->name }}</title>
    <style>
        @page {
            margin: 0.5cm;
        }
        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 8px;
            color: #2A1B15; /* parley-brown */
            margin: 0;
            padding: 0;
            background-color: #fff;
        }
        .header {
            position: relative;
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 3px solid #8B1E1E; /* parley-red */
            padding-bottom: 10px;
            height: 60px;
        }
        .logo {
            position: absolute;
            left: 0;
            top: 0;
            height: 50px;
        }
        .header-text {
            display: inline-block;
            margin-top: 5px;
        }
        .header h1 {
            margin: 0;
            color: #8B1E1E; /* parley-red */
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 900;
        }
        .header .brand {
            color: #B38B4D; /* parley-gold */
            font-size: 10px;
            font-weight: bold;
            margin-top: 2px;
        }
        .header .championship-name {
            color: #2A1B15;
            font-size: 12px;
            font-weight: bold;
            display: block;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }
        th {
            background-color: #2A1B15; /* parley-brown */
            color: #FDF8F1; /* parley-cream */
            padding: 6px 3px;
            text-align: center;
            text-transform: uppercase;
            font-size: 7px;
            border: 1px solid #B38B4D;
        }
        td {
            padding: 5px 3px;
            border: 1px solid #B38B4D44;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .text-bold {
            font-weight: bold;
        }

        /* Colors matching scores table */
        .bg-ce { background-color: #d1fae5; color: #065f46; } /* Green 100 */
        .bg-cn { background-color: #fee2e2; color: #991b1b; } /* Red 100 */
        .bg-tp { background-color: #dbeafe; color: #1e40af; } /* Blue 100 */
        .bg-ar { background-color: #fef9c3; color: #854d0e; } /* Yellow 100 */
        
        .row-ce { color: #065f46; font-weight: bold; }
        .row-cn { color: #991b1b; font-weight: bold; }
        .row-tp { color: #1e40af; font-weight: bold; }
        .row-ar { color: #b91c1c; font-weight: bold; }

        .total-header {
            background-color: #2A1B15;
            color: #FDF8F1;
        }

        .coleador-col {
            background-color: transparent;
        }
        
        .footer {
            position: fixed;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 20px;
            text-align: center;
            font-size: 7px;
            color: #B38B4D;
            border-top: 1px solid #B38B4D33;
            padding-top: 5px;
        }
        .rank-cell {
            width: 20px;
            text-align: center;
            font-weight: bold;
            background-color: #FDF8F1;
            color: #8B1E1E;
        }
        .entry-name {
            font-weight: bold;
            color: #2A1B15;
            width: 100px;
        }
        .stripe {
            background-color: #FDF8F1;
        }
    </style>
</head>
<body>
    <div class="header">
        @php
            $logoPath = public_path('logo.webp');
            $logoData = '';
            if (file_exists($logoPath)) {
                $logoData = base64_encode(file_get_contents($logoPath));
            }
        @endphp
        @if($logoData)
            <img src="data:image/webp;base64,{{ $logoData }}" class="logo">
        @endif
        
        <div class="header-text">
            <h1>PARLEY0ARTICULOS</h1>
            <div class="brand">CONTROL DE CUADROS</div>
            <span class="championship-name">{{ $championship->name }}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="rank-cell" rowspan="2">#</th>
                <th rowspan="2">Nombre del Cuadro</th>
                @for ($i = 1; $i <= $championship->coleadores_count; $i++)
                    <th colspan="2">Coleador {{ $i }}</th>
                @endfor
                <th colspan="4" class="total-header">TOTALES CUADRO</th>
            </tr>
            <tr>
                @for ($i = 1; $i <= $championship->coleadores_count; $i++)
                    <th>Nombre</th>
                    <th class="bg-ce">CE</th>
                @endfor
                <th class="bg-ce">CE</th>
                <th class="bg-cn">CN</th>
                <th class="bg-tp">TP</th>
                <th class="bg-ar">AR</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($entries as $index => $entry)
                <tr class="{{ $index % 2 == 0 ? '' : 'stripe' }}">
                    <td class="rank-cell">{{ $index + 1 }}</td>
                    <td class="entry-name">{{ $entry->name }}</td>
                    
                    @foreach ($entry->coleadores as $coleador)
                        <td class="coleador-col">{{ $coleador->name }}</td>
                        <td class="text-center row-ce">{{ $coleador->total_ce }}</td>
                    @endforeach
                    
                    {{-- Rellenar columnas vacías si el cuadro tiene menos coleadores de los esperados --}}
                    @for ($i = count($entry->coleadores); $i < $championship->coleadores_count; $i++)
                        <td>-</td>
                        <td class="text-center">-</td>
                    @endfor

                    <td class="text-center row-ce bg-ce">{{ $entry->total_ce }}</td>
                    <td class="text-center row-cn bg-cn">{{ $entry->total_cn }}</td>
                    <td class="text-center row-tp bg-tp">{{ $entry->total_tp }}</td>
                    <td class="text-center row-ar bg-ar">{{ $entry->total_ar > 0 ? '-' . $entry->total_ar : '0' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        PARLEY0ARTICULOS — {{ $championship->name }} — Generado el {{ $date }}
    </div>
</body>
</html>
