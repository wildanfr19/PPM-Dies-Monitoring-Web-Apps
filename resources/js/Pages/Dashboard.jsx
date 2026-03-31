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

export default function Dashboard({ auth, stats, diesByTonnage, criticalDies, upcomingPpm, chartData, ppmTimeline, activeSpecialRepairs }) {

    // Calculate overall health percentage
    const totalDies = stats?. total || 0;
    const okDies = stats?.ok || 0;
    const healthPercentage = totalDies > 0 ? Math.round((okDies / totalDies) * 100) : 0;

    const groupColors = {
        A1: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
        A2: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
        B1: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' },
        B2: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
    };

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
                        title="Green Status"
                        value={stats?. ok || 0}
                        icon="fa-check-circle"
                        color="green"
                        subtitle="PPM up to date"
                    />
                    <StatsCard
                        title="Orange Status"
                        value={stats?. warning || 0}
                        icon="fa-exclamation-triangle"
                        color="orange"
                        subtitle="Plan PPM soon"
                    />
                    <StatsCard
                        title="Red Status"
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

                {/* Row 3: TOP 10 Dies by Group (A1, A2, B1, B2) */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        <i className="fas fa-layer-group text-blue-500 mr-2"></i>
                        TOP 10 Dies by Group
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {chartData?.topDiesByGroup && Object.entries(chartData.topDiesByGroup).map(([groupKey, group]) => (
                            <div key={groupKey} className={`rounded-lg border-2 ${groupColors[groupKey]?.border || 'border-gray-200'} ${groupColors[groupKey]?.bg || 'bg-gray-50'} p-4`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className={`font-bold text-base ${groupColors[groupKey]?.text || 'text-gray-700'}`}>
                                        {group.label}
                                    </h4>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${groupColors[groupKey]?.badge || 'bg-gray-100 text-gray-600'}`}>
                                        {group.count || 0}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {group.dies && group.dies.length > 0 ? (
                                        group.dies.map((die, idx) => (
                                            <div key={die.id} className="flex items-center justify-between text-sm bg-white dark:bg-gray-700 rounded px-2 py-1.5 shadow-sm">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-gray-400 text-xs w-4">{idx + 1}.</span>
                                                    <Link
                                                        href={route('dies.show', die.encrypted_id)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium truncate"
                                                        title={die.part_number}
                                                    >
                                                        {die.part_number}
                                                    </Link>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-xs text-gray-500">{die.customer}</span>
                                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${
                                                                die.ppm_status === 'red' ? 'bg-red-500' :
                                                                die.ppm_status === 'orange' ? 'bg-orange-500' : 'bg-green-500'
                                                            }`}
                                                            style={{ width: `${Math.min(die.stroke_percentage, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-medium w-10 text-right">{die.stroke_percentage}%</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 text-center py-4">No dies in this group</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 4: Top Dies by Stroke (Horizontal Bar) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <HorizontalBarChart
                        data={chartData?.topDiesByStroke}
                        title="Top 10 Dies by Stroke Progress"
                        icon="fa-sort-amount-up"
                    />

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

                {/* Row 5: Monthly PPM Chart */}
                <div className="grid grid-cols-1 gap-6">
                    <LineChart
                        data={chartData?.monthlyPpmCount}
                        title={`PPM Completed per Month (${new Date().getFullYear()})`}
                        icon="fa-calendar-check"
                        fill={false}
                    />
                </div>

                {/* Row 6: PPM Timeline Tracking Table (RED alert max 5 days) */}
                {ppmTimeline && ppmTimeline.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <div className="bg-indigo-600 text-white px-6 py-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <i className="fas fa-clock"></i> PPM Timeline Tracking (Max 5 Working Days)
                            </h3>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Date RED alert appeared">RED Alert</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Target day 1: Transfer die to MTN">Transfer (H+1)</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Target day 3: Start PPM process">PPM Start (H+3)</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Target day 4: PPM completed">PPM Finish (H+4)</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Days</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Was PPM completed on time (max 5 working days)?">On Time?</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {ppmTimeline.map((item) => (
                                        <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${item.is_overdue ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                            <td className="px-3 py-2">
                                                <Link href={route('dies.show', item.encrypted_id)} className="text-blue-600 hover:text-blue-800 font-medium">
                                                    {item.part_number}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">{item.customer}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                    item.ppm_alert_status === 'ppm_in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    item.ppm_alert_status === 'additional_repair' ? 'bg-amber-100 text-amber-700' :
                                                    item.ppm_alert_status === 'ppm_completed' ? 'bg-green-100 text-green-700' :
                                                    item.ppm_alert_status === 'transferred_to_mtn' ? 'bg-purple-100 text-purple-700' :
                                                    item.ppm_alert_status === 'ppm_scheduled' ? 'bg-indigo-100 text-indigo-700' :
                                                    item.ppm_alert_status === 'schedule_approved' ? 'bg-cyan-100 text-cyan-700' :
                                                    item.ppm_alert_status === 'special_repair' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {item.ppm_alert_status_label || item.ppm_alert_status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center text-xs">{item.red_alerted_at || '-'}</td>
                                            <td className="px-3 py-2 text-center">
                                                {item.transferred_at ? (
                                                    <span className={`text-xs ${item.transfer_sla === 'overdue' ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                                                        {item.transferred_at}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {item.ppm_started_at ? (
                                                    <span className="text-xs text-green-600">{item.ppm_started_at}</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {item.ppm_finished_at ? (
                                                    <span className={`text-xs ${item.ppm_finish_sla === 'overdue' ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                                                        {item.ppm_finished_at}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`font-bold ${item.days_since_red > 5 ? 'text-red-600' : item.days_since_red > 3 ? 'text-orange-600' : 'text-green-600'}`}>
                                                    {item.days_since_red ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {item.total_sla === 'on_track' && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">On Track</span>
                                                )}
                                                {item.total_sla === 'overdue' && (
                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">OVERDUE</span>
                                                )}
                                                {item.total_sla === 'pending' && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Row 7: Critical Alert & Upcoming PPM */}
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
                                                            href={route('dies.show', die.encrypted_id)}
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
                                                            href={route('dies.show', item.die.encrypted_id)}
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
                        {['admin', 'mtn_dies'].includes(auth.user.role) && (
                            <Link
                                href={route('dies.create')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <span>➕</span> Add New Die
                            </Link>
                        )}
                        {['admin', 'mtn_dies', 'production', 'pe'].includes(auth.user.role) && (
                            <Link
                                href={route('production.create')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                            >
                                <span>📝</span> Log Production
                            </Link>
                        )}
                        {['admin', 'mtn_dies', 'ppic'].includes(auth.user.role) && (
                            <Link
                                href={route('schedule.index')}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                            >
                                <span>📅</span> View Schedule
                            </Link>
                        )}
                        {['admin', 'mtn_dies', 'production'].includes(auth.user.role) && (
                            <Link
                                href={route('special-repair.index')}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
                            >
                                <span>🔧</span> Special Repair
                            </Link>
                        )}
                        <Link
                            href={route('reports.index')}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
                        >
                            <span>📊</span> Reports
                        </Link>
                        {['admin', 'mtn_dies', 'production', 'pe'].includes(auth.user.role) && (
                            <Link
                                href={route('import.index')}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                            >
                                <span>📤</span> Import Data
                            </Link>
                        )}
                    </div>
                </div>

                {/* Row 8: Active Special Repairs */}
                {activeSpecialRepairs && activeSpecialRepairs.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <div className="bg-yellow-600 text-white px-6 py-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <i className="fas fa-tools"></i> Active Special Repairs
                            </h3>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Priority</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Deadline</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {activeSpecialRepairs.map((repair) => (
                                        <tr key={repair.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-3 py-2">
                                                <Link href={route('special-repair.show', repair.encrypted_id)} className="text-blue-600 hover:text-blue-800 font-medium">
                                                    {repair.part_number}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-2">{repair.repair_type_label}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-${repair.priority_color}-100 text-${repair.priority_color}-700`}>
                                                    {repair.priority}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-${repair.status_color}-100 text-${repair.status_color}-700`}>
                                                    {repair.status_label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center text-xs">{repair.delivery_deadline || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-3 text-center">
                                <Link href={route('special-repair.index')} className="text-sm text-blue-600 hover:text-blue-800">
                                    View all special repairs →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
