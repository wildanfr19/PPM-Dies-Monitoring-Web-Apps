import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import StatsCard from '@/Components/PPM/StatsCard';
import StatusBadge from '@/Components/PPM/StatusBadge';
import LotProgress from '@/Components/PPM/LotProgress';
import DoughnutChart from '@/Components/Charts/DoughnutChart';
import BarChart from '@/Components/Charts/BarChart';
import LineChart from '@/Components/Charts/LineChart';
import HorizontalBarChart from '@/Components/Charts/HorizontalBarChart';
import GaugeChart from '@/Components/Charts/GaugeChart';

export default function Dashboard({ auth, stats, diesByTonnage, criticalDies, upcomingPpm, chartData }) {

    // Calculate overall health percentage
    const totalDies = stats?. total || 0;
    const okDies = stats?.ok || 0;
    const healthPercentage = totalDies > 0 ? Math.round((okDies / totalDies) * 100) : 0;

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    <i className="fas fa-chart-pie mr-2"></i> Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6 px-6 space-y-6">

                {/* Row 1: Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Dies"
                        value={stats?.total || 0}
                        icon="fa-wrench"
                        color="blue"
                    />
                    <StatsCard
                        title="OK Status"
                        value={stats?. ok || 0}
                        icon="fa-check-circle"
                        color="green"
                        subtitle="PPM up to date"
                    />
                    <StatsCard
                        title="Warning"
                        value={stats?. warning || 0}
                        icon="fa-exclamation-triangle"
                        color="orange"
                        subtitle="Plan PPM soon"
                    />
                    <StatsCard
                        title="Critical"
                        value={stats?.critical || 0}
                        icon="fa-times-circle"
                        color="red"
                        subtitle="Need PPM now!"
                    />
                </div>

                {/* Row 2: Charts - Status Distribution & Dies by Tonnage */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Status Distribution - Doughnut */}
                    <div className="lg:col-span-1">
                        <DoughnutChart
                            data={chartData?. statusDistribution}
                            title="Dies Status Distribution"
                            icon="fa-bullseye"
                        />
                    </div>

                    {/* Dies by Tonnage - Stacked Bar */}
                    <div className="lg:col-span-2">
                        <BarChart
                            data={chartData?.diesByTonnage}
                            title="Dies Status by Tonnage"
                            icon="fa-industry"
                            stacked={true}
                        />
                    </div>
                </div>

                {/* Row 3: Production Trend & Top Dies */}
                <div className="grid grid-cols-1 lg: grid-cols-2 gap-6">
                    {/* Production Trend - Line Chart */}
                    <LineChart
                        data={chartData?.productionTrend}
                        title="Production Trend (Last 30 Days)"
                        icon="fa-chart-line"
                        fill={true}
                    />

                    {/* Top Dies by Stroke - Horizontal Bar */}
                    <HorizontalBarChart
                        data={chartData?.topDiesByStroke}
                        title="Top 10 Dies by Stroke Progress"
                        icon="fa-sort-amount-up"
                    />
                </div>

                {/* Row 4: Monthly PPM & Health Gauge */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly PPM Count */}
                    <div className="lg:col-span-2">
                        <LineChart
                            data={chartData?.monthlyPpmCount}
                            title={`PPM Completed per Month (${new Date().getFullYear()})`}
                            icon="fa-calendar-check"
                            fill={false}
                        />
                    </div>

                    {/* Overall Health Gauge */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                            <i className="fas fa-heartbeat text-green-500 mr-2"></i> Overall PPM Health
                        </h3>
                        <div className="flex justify-center">
                            <GaugeChart
                                percentage={healthPercentage}
                                label="Dies in Good Condition"
                                size="lg"
                            />
                        </div>
                        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="bg-green-50 rounded-lg p-2">
                                <div className="font-bold text-green-600">{stats?.ok || 0}</div>
                                <div className="text-green-700 text-xs">OK</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-2">
                                <div className="font-bold text-orange-600">{stats?.warning || 0}</div>
                                <div className="text-orange-700 text-xs">Warning</div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-2">
                                <div className="font-bold text-red-600">{stats?.critical || 0}</div>
                                <div className="text-red-700 text-xs">Critical</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 5: Critical Alert & Upcoming PPM */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Critical Alert */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <div className="bg-red-600 text-white px-6 py-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <i className="fas fa-exclamation-circle"></i> Critical Alert - Needs Immediate PPM
                            </h3>
                        </div>
                        <div className="p-4">
                            {criticalDies && criticalDies.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead>
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acc.  Stroke</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {criticalDies.slice(0, 5).map((die) => (
                                                <tr key={die.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-3 py-2">
                                                        <Link
                                                            href={route('dies.show', die.id)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            {die.part_number}
                                                        </Link>
                                                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                                            {die.part_name}
                                                        </p>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm font-medium">
                                                        {die. accumulation_stroke?. toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <StatusBadge
                                                            status={die.ppm_status}
                                                            label={`${die.stroke_percentage}%`}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <span className="text-4xl">✅</span>
                                    <p className="text-gray-500 mt-2">No critical dies.  All good!</p>
                                </div>
                            )}

                            {criticalDies && criticalDies.length > 5 && (
                                <div className="mt-3 text-center">
                                    <Link
                                        href={route('dies.index')}
                                        className="text-sm text-blue-600 hover: text-blue-800"
                                    >
                                        View all {criticalDies.length} critical dies →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming PPM */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <div className="bg-orange-600 text-white px-6 py-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span>📅</span> Upcoming PPM (Next 14 Days)
                            </h3>
                        </div>
                        <div className="p-4">
                            {upcomingPpm && upcomingPpm.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead>
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Est. Days</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {upcomingPpm.slice(0, 5).map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-3 py-2">
                                                        <Link
                                                            href={route('dies.show', item.die. id)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            {item.die.part_number}
                                                        </Link>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm">
                                                        {item. remaining_strokes?. toLocaleString()} strokes
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {item.estimated_days !== null ? (
                                                            <span className={`font-medium ${item.estimated_days <= 7 ? 'text-red-600' : 'text-orange-600'}`}>
                                                                ~{item.estimated_days} days
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">N/A</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <span className="text-4xl">📋</span>
                                    <p className="text-gray-500 mt-2">No upcoming PPM scheduled</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        ⚡ Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={route('dies.create')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <span>➕</span> Add New Die
                        </Link>
                        <Link
                            href={route('production.create')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <span>📝</span> Log Production
                        </Link>
                        <Link
                            href={route('schedule.index')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                        >
                            <span>📅</span> View Schedule
                        </Link>
                        <Link
                            href={route('reports.index')}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
                        >
                            <span>📊</span> Generate Reports
                        </Link>
                        <Link
                            href={route('import.index')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                        >
                            <span>📤</span> Import Data
                        </Link>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
