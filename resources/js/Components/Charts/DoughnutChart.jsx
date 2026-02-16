import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ data, title, icon }) {
    // console.log('DoughnutChart Data:', data);
    const chartData = {
        labels: data?. labels || ['OK', 'Warning', 'Critical'],
        datasets: [
            {
                data: data?.values || [0, 0, 0],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',  // Green
                    'rgba(249, 115, 22, 0.8)', // Orange
                    'rgba(239, 68, 68, 0.8)',  // Red
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 2,
                hoverOffset: 10,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio:  false,
        plugins: {
            legend: {
                position:  'bottom',
                labels: {
                    padding:  20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const value = context.parsed;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
        cutout: '60%',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                {icon && <i className={`fas ${icon} mr-2 text-blue-500`}></i>}
                {title || 'Dies Status Distribution'}
            </h3>
            <div className="h-64">
                <Doughnut data={chartData} options={options} />
            </div>
            {/* Center Text */}
            <div className="text-center mt-4">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {data?.values?.reduce((a, b) => a + b, 0) || 0}
                </p>
                <p className="text-sm text-gray-500">Total Dies</p>
            </div>
        </div>
    );
}
