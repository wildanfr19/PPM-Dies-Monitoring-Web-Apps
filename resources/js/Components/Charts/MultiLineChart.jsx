import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function MultiLineChart({ data, title }) {
    const colors = [
        { border: 'rgba(59, 130, 246, 1)', bg: 'rgba(59, 130, 246, 0.1)' },
        { border: 'rgba(16, 185, 129, 1)', bg: 'rgba(16, 185, 129, 0.1)' },
        { border: 'rgba(245, 158, 11, 1)', bg: 'rgba(245, 158, 11, 0.1)' },
        { border: 'rgba(239, 68, 68, 1)', bg: 'rgba(239, 68, 68, 0.1)' },
        { border: 'rgba(139, 92, 246, 1)', bg: 'rgba(139, 92, 246, 0.1)' },
    ];

    const chartData = {
        labels: data?.labels || [],
        datasets: data?.datasets?. map((dataset, idx) => ({
            label: dataset.label,
            data: dataset.values,
            borderColor: colors[idx % colors.length]. border,
            backgroundColor: colors[idx % colors.length].bg,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
        })) || [],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend:  {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 15,
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks:  {
                    callback: function (value) {
                        return value.toLocaleString();
                    },
                },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect:  false,
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {title || 'Monthly Comparison'}
            </h3>
            <div className="h-72">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
