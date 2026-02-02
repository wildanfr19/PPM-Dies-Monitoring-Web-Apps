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
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function LineChart({ data, title, icon, fill = true }) {
    const chartData = {
        labels: data?.labels || [],
        datasets: [
            {
                label:  data?.datasetLabel || 'Production Output',
                data: data?.values || [],
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: fill ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderWidth: 2,
                fill: fill,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth:  2,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label:  function (context) {
                        return `Output: ${context.parsed.y?. toLocaleString()} strokes`;
                    },
                },
            },
        },
        scales: {
            x:  {
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
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
                {icon && <i className={`fas ${icon} mr-2 text-blue-500`}></i>}
                {title || 'Production Trend'}
            </h3>
            <div className="h-72">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
