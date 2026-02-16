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

ChartJS. register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data, title, icon, stacked = true }) {
    const chartData = {
        labels: data?.labels || [],
        datasets: [
            {
                label: 'GREEN (OK)',
                data: data?.ok || [],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label:  'ORANGE (Warning)',
                data:  data?.warning || [],
                backgroundColor: 'rgba(249, 115, 22, 0.8)',
                borderColor: 'rgba(249, 115, 22, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label:  'RED (Critical)',
                data:  data?.critical || [],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
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
            title: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales:  {
            x: {
                stacked: stacked,
                grid: {
                    display: false,
                },
            },
            y:  {
                stacked: stacked,
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {icon && <i className={`fas ${icon} mr-2 text-blue-500`}></i>}
                {title || 'Dies by Tonnage'}
            </h3>
            <div className="h-72">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}
