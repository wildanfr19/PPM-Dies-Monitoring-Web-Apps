<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Critical Dies Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px solid #C62828;
            padding-bottom: 15px;
        }
        .header h1 {
            color: #C62828;
            font-size: 20px;
            margin-bottom:  5px;
        }
        .header . subtitle {
            color: #666;
            font-size: 11px;
        }
        . alert-box {
            background: #FFEBEE;
            border:  2px solid #C62828;
            border-radius: 8px;
            padding: 15px;
            margin-bottom:  20px;
            text-align: center;
        }
        .alert-box h2 {
            color: #C62828;
            font-size: 14px;
        }
        .alert-box p {
            color: #666;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background: #C62828;
            color: white;
            padding:  10px 6px;
            text-align:  left;
            font-size:  10px;
        }
        td {
            padding: 8px 6px;
            border-bottom: 1px solid #ddd;
            font-size: 10px;
        }
        tr:nth-child(even) {
            background: #FFF5F5;
        }
        . status-red {
            background: #FFCDD2;
            color: #C62828;
            font-weight: bold;
            padding: 3px 8px;
            border-radius: 4px;
        }
        . status-orange {
            background: #FFE0B2;
            color: #E65100;
            font-weight: bold;
            padding: 3px 8px;
            border-radius: 4px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .progress-bar {
            background: #eee;
            border-radius: 4px;
            height: 12px;
            overflow: hidden;
        }
        .progress-bar . fill {
            height: 100%;
            border-radius: 4px;
        }
        .progress-bar . fill. critical { background: #C62828; }
        .progress-bar .fill.warning { background: #FF9800; }
        .footer {
            position: fixed;
            bottom: 20px;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚠️ CRITICAL DIES REPORT</h1>
        <p class="subtitle">Dies Requiring Immediate PPM Attention</p>
        <p class="subtitle">Generated: {{ $generatedAt }}</p>
    </div>

    <div class="alert-box">
        <h2>🚨 {{ $dies->count() }} Dies Need Immediate Attention! </h2>
        <p>These dies have exceeded or are close to their PPM threshold</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 3%">No</th>
                <th style="width: 12%">Part Number</th>
                <th style="width: 20%">Part Name</th>
                <th style="width: 6%">Cust</th>
                <th style="width:  6%">Tonnage</th>
                <th style="width: 10%" class="text-right">Acc. Stroke</th>
                <th style="width: 10%" class="text-right">Std. Stroke</th>
                <th style="width: 10%" class="text-right">Remaining</th>
                <th style="width: 10%">Progress</th>
                <th style="width: 13%">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($dies as $index => $die)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td><strong>{{ $die['part_number'] }}</strong></td>
                <td>{{ Str::limit($die['part_name'], 35) }}</td>
                <td>{{ $die['customer'] }}</td>
                <td>{{ $die['tonnage'] }}</td>
                <td class="text-right"><strong>{{ number_format($die['accumulation_stroke']) }}</strong></td>
                <td class="text-right">{{ number_format($die['standard_stroke']) }}</td>
                <td class="text-right" style="color: {{ $die['remaining_strokes'] <= 0 ? '#C62828' : '#E65100' }}">
                    <strong>{{ number_format($die['remaining_strokes']) }}</strong>
                </td>
                <td>
                    <div class="progress-bar">
                        <div class="fill {{ $die['ppm_status'] === 'red' ? 'critical' : 'warning' }}"
                             style="width: {{ min($die['stroke_percentage'], 100) }}%"></div>
                    </div>
                    <small>{{ $die['stroke_percentage'] }}%</small>
                </td>
                <td>
                    <span class="status-{{ $die['ppm_status'] }}">
                        {{ $die['ppm_status'] === 'red' ? '🔴 CRITICAL' : '🟠 WARNING' }}
                    </span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>PPM Dies Monitoring System - PT. Indonesia Thai Summit Auto</p>
    </div>
</body>
</html>
