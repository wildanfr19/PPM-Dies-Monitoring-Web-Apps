<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Dies Status Report</title>
    <style>
        * {
            margin: 0;
            padding:  0;
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
            border-bottom: 2px solid #2E7D32;
            padding-bottom: 15px;
        }
        . header h1 {
            color: #2E7D32;
            font-size: 18px;
            margin-bottom: 5px;
        }
        .header p {
            color: #666;
            font-size: 10px;
        }
        .stats {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .stats td {
            padding: 10px;
            border: 1px solid #ddd;
            vertical-align: top;
        }
        .stat-box {
            text-align: center;
        }
        .stat-box. total { background:  #E3F2FD; }
        .stat-box.ok { background: #E8F5E9; }
        .stat-box.warning { background: #FFF3E0; }
        .stat-box.critical { background: #FFEBEE; }
        .stat-box . number {
            font-size: 24px;
            font-weight: bold;
        }
        .stat-box . label {
            font-size:  10px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background: #2E7D32;
            color: white;
            padding: 8px 4px;
            text-align:  left;
            font-size: 9px;
        }
        td {
            padding: 6px 4px;
            border-bottom: 1px solid #ddd;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        .status-critical {
            background: #FFCDD2 !important;
            color: #C62828;
            font-weight: bold;
        }
        .status-warning {
            background: #FFE0B2 !important;
            color: #E65100;
            font-weight:  bold;
        }
        . status-ok {
            background:  #C8E6C9 !important;
            color: #2E7D32;
        }
        .footer {
            position: fixed;
            bottom: 20px;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #999;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏭 DIES STATUS REPORT</h1>
        <p>PT. Indonesia Thai Summit Auto - PPM Dies Monitoring System</p>
        <p>Generated: {{ $generatedAt }}</p>
    </div>

    <table class="stats">
        <tr>
            <td class="stat-box total">
                <div class="number">{{ $stats['total'] }}</div>
                <div class="label">Total Dies</div>
            </td>
            <td class="stat-box ok">
                <div class="number">{{ $stats['ok'] }}</div>
                <div class="label">OK Status</div>
            </td>
            <td class="stat-box warning">
                <div class="number">{{ $stats['warning'] }}</div>
                <div class="label">Warning</div>
            </td>
            <td class="stat-box critical">
                <div class="number">{{ $stats['critical'] }}</div>
                <div class="label">Critical</div>
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th style="width: 3%">No</th>
                <th style="width: 12%">Part Number</th>
                <th style="width: 18%">Part Name</th>
                <th style="width: 6%">Cust</th>
                <th style="width: 6%">Model</th>
                <th style="width: 6%">Tonnage</th>
                <th style="width: 10%" class="text-right">Acc.  Stroke</th>
                <th style="width: 10%" class="text-right">Std. Stroke</th>
                <th style="width: 10%" class="text-right">Remaining</th>
                <th style="width: 7%" class="text-center">Progress</th>
                <th style="width: 12%">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($dies as $index => $die)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $die['part_number'] }}</td>
                <td>{{ Str::limit($die['part_name'], 30) }}</td>
                <td>{{ $die['customer'] }}</td>
                <td>{{ $die['model'] }}</td>
                <td>{{ $die['tonnage'] }}</td>
                <td class="text-right">{{ number_format($die['accumulation_stroke']) }}</td>
                <td class="text-right">{{ number_format($die['standard_stroke']) }}</td>
                <td class="text-right">{{ number_format($die['remaining_strokes']) }}</td>
                <td class="text-center">{{ $die['stroke_percentage'] }}%</td>
                <td class="status-{{ $die['ppm_status'] }}">{{ $die['ppm_status_label'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>PPM Dies Monitoring System - Confidential</p>
    </div>
</body>
</html>
