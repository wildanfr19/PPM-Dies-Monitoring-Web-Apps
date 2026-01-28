import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

export default function GaugeChart({ percentage, label, size = 'md' }) {
    const getColor = (pct) => {
        if (pct >= 100) return { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' };
        if (pct >= 75) return { bg: 'rgba(249, 115, 22, 0.8)', border: 'rgba(249, 115, 22, 1)' };
        return { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgba(34, 197, 94, 1)' };
    };

    const color = getColor(percentage);
    const remaining = Math.max(0, 100 - percentage);

    const chartData = {
        datasets: [
            {
                data: [Math.min(percentage, 100), remaining],
                backgroundColor: [color.bg, 'rgba(229, 231, 235, 0.5)'],
                borderColor: [color.border, 'rgba(229, 231, 235, 0.8)'],
                borderWidth: 2,
                circumference: 270,
                rotation: 225,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            tooltip: {
                enabled: false,
            },
        },
    };

    const sizeClasses = {
        sm: 'h-24 w-24',
        md: 'h-32 w-32',
        lg: 'h-40 w-40',
    };

    return (
        <div className="flex flex-col items-center">
            <div className={`relative ${sizeClasses[size]}`}>
                <Doughnut data={chartData} options={options} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-bold ${size === 'sm' ? 'text-lg' : 'text-2xl'}`} style={{ color: color.border }}>
                        {percentage}%
                    </span>
                </div>
            </div>
            {label && (
                <p className="text-sm text-gray-500 mt-2 text-center">{label}</p>
            )}
        </div>
    );
}
