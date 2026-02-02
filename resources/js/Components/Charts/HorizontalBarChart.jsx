import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HorizontalBarChart({ data, title, icon, showLegend = true }) {
    const chartData = {
        labels: data?.labels || [],
        datasets: data?.datasets || [
            {
                label: 'Value',
                data: data?.values || [],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(236, 72, 153, 1)',
                ],
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: showLegend,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 15,
                },
            },
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 14,
                    weight: 'bold',
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    // Dynamic stepSize to prevent too many ticks
                    callback: function(value) {
                        if (Number.isInteger(value)) {
                            return value.toLocaleString();
                        }
                        return null;
                    },
                },
            },
            y: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {icon && <i className={`fas ${icon} mr-2 text-blue-500`}></i>}
                {title || 'Top Dies by Stroke'}
            </h3>
            <div className="h-72">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}
