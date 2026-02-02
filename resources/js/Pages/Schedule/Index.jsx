import React, { useState, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';

export default function ScheduleIndex({ auth, year, scheduleData, customers, tonnages, filters }) {
    const [selectedYear, setSelectedYear] = useState(year);
    const [customerId, setCustomerId] = useState(filters?.customer_id || '');
    const [tonnageId, setTonnageId] = useState(filters?.tonnage_id || '');
    const tableRef = useRef(null);

    const months = [
        { name: 'Jan', short: 'Jan' },
        { name: 'Feb', short: 'Feb' },
        { name: 'Mar', short: 'Mar' },
        { name: 'Apr', short: 'Apr' },
        { name: 'May', short: 'May' },
        { name: 'Jun', short: 'Jun' },
        { name: 'Jul', short: 'Jul' },
        { name: 'Aug', short: 'Aug' },
        { name: 'Sep', short: 'Sep' },
        { name: 'Oct', short: 'Oct' },
        { name: 'Nov', short: 'Nov' },
        { name: 'Dec', short: 'Dec' },
    ];

    const weeks = ['I', 'II', 'III', 'IV'];

    const handleFilter = () => {
        router.get(route('schedule.index'), {
            year: selectedYear,
            customer_id: customerId || undefined,
            tonnage_id:  tonnageId || undefined,
        }, {
            preserveState:  true,
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'red':  return 'bg-red-100 text-red-800';
            case 'orange': return 'bg-orange-100 text-orange-800';
            case 'green': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderCell = (value, type = 'text') => {
        if (value === null || value === undefined || value === '') {
            return <span className="text-gray-300">-</span>;
        }

        if (type === 'actual' && value === true) {
            return <span className="text-xl">●</span>;
        }

        if (type === 'plan' && value) {
            return (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-green-600 text-white text-xs font-bold rounded">
                    {value}
                </span>
            );
        }

        if (type === 'forecast' && value) {
            return <span className="text-xs">{value}</span>;
        }

        if (type === 'stroke' && value) {
            return <span className="text-xs font-medium text-blue-600">{value}</span>;
        }

        return <span className="text-xs">{value}</span>;
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    📅 PPM Schedule Calendar
                </h2>
            }
        >
            <Head title="PPM Schedule" />

            <div className="py-4 px-4">
                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target. value)}
                                className="rounded-md border-gray-300 text-sm w-24"
                            >
                                {[2023, 2024, 2025, 2026, 2027]. map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Customer</label>
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className="rounded-md border-gray-300 text-sm w-40"
                            >
                                <option value="">All Customers</option>
                                {customers?. map((c) => (
                                    <option key={c.id} value={c.id}>{c. code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tonnage</label>
                            <select
                                value={tonnageId}
                                onChange={(e) => setTonnageId(e.target.value)}
                                className="rounded-md border-gray-300 text-sm w-40"
                            >
                                <option value="">All Tonnages</option>
                                {tonnages?.map((t) => (
                                    <option key={t.id} value={t.id}>{t.tonnage} (Grade {t.grade})</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleFilter}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                            🔍 Apply Filter
                        </button>
                    </div>
                </div>

                {/* Schedule Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    {/* Title Header */}
                    <div className="bg-green-700 text-white text-center py-3">
                        <h3 className="text-lg font-bold">SCHEDULE</h3>
                        <h4 className="text-md">PREVENTIVE MAINTENANCE DIES</h4>
                        <p className="text-green-200 text-sm mt-1">Year:  {selectedYear}</p>
                    </div>

                    {/* Scrollable Table Container */}
                    <div className="overflow-x-auto" ref={tableRef}>
                        <table className="min-w-full border-collapse text-xs">
                            {/* Header Row 1 - Month Names */}
                            <thead>
                                <tr className="bg-green-600 text-white">
                                    <th className="border border-green-500 px-2 py-2 text-center sticky left-0 bg-green-600 z-20 min-w-[40px]" rowSpan={2}>NO</th>
                                    <th className="border border-green-500 px-2 py-2 text-left sticky left-[40px] bg-green-600 z-20 min-w-[180px]" rowSpan={2}>NAME/PART<br/>NUMBER DIE</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[50px]" rowSpan={2}>MODEL</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[45px]" rowSpan={2}>TOTAL<br/>DIE</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[100px]" rowSpan={2}>ACCUMULATION</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[140px]" rowSpan={2}>PPM<br/>CONDITION</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[70px]" rowSpan={2}>LAST<br/>STROKE</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[60px]" rowSpan={2}>PLAN</th>
                                    {months.map((month, idx) => (
                                        <th key={month.name} className="border border-green-500 px-1 py-2 text-center min-w-[120px]" colSpan={4}>
                                            {month. name}
                                        </th>
                                    ))}
                                </tr>
                                {/* Header Row 2 - Week Numbers */}
                                <tr className="bg-green-500 text-white">
                                    {months.map((month) => (
                                        weeks.map((week, idx) => (
                                            <th key={`${month.name}-${week}`} className="border border-green-400 px-1 py-1 text-center min-w-[30px]">
                                                {week}
                                            </th>
                                        ))
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {scheduleData?. length > 0 ? (
                                    scheduleData.map((group, groupIndex) => (
                                        <React.Fragment key={`group-${groupIndex}`}>
                                            {/* Group Header */}
                                            <tr className="bg-green-100">
                                                <td colSpan={8 + 48} className="border px-3 py-2 font-semibold text-green-800 sticky left-0 bg-green-100 z-10">
                                                    {group.customer} ({group.tonnage})
                                                </td>
                                            </tr>

                                            {/* Dies in Group */}
                                            {group.dies?. map((die, dieIndex) => (
                                                <React.Fragment key={`die-${die.id}`}>
                                                    {/* Row 1: Part Number + Forecast */}
                                                    <tr key={`${die.id}-1`} className="border-t-2 border-gray-300 hover:bg-gray-50">
                                                        <td className="border px-2 py-1 text-center font-medium bg-gray-50 sticky left-0 z-10" rowSpan={6}>
                                                            {groupIndex * 100 + dieIndex + 1}
                                                        </td>
                                                        <td className="border px-2 py-1 sticky left-[40px] bg-white z-10">
                                                            <a href={route('dies.show', die.id)} className="text-blue-600 hover:underline font-medium">
                                                                {die.part_number}
                                                            </a>
                                                        </td>
                                                        <td className="border px-2 py-1 text-center bg-gray-50" rowSpan={6}>
                                                            {die.model}
                                                        </td>
                                                        <td className="border px-2 py-1 text-center bg-gray-50" rowSpan={6}>
                                                            {die.total_die}
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs text-gray-600">
                                                            ACCUMULATION STROKE
                                                        </td>
                                                        {/* PPM Condition Column */}
                                                        <td className="border px-1 py-1 bg-gray-50" rowSpan={6}>
                                                            <div className="space-y-1">
                                                                {/* Condition 1 */}
                                                                <div className={`flex items-center gap-1 text-[10px] ${
                                                                    die.ppm_conditions_info?.condition_1?.is_active
                                                                        ? 'text-blue-700 font-semibold'
                                                                        : 'text-gray-400'
                                                                }`}>
                                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                                                        die.ppm_conditions_info?.condition_1?.is_active
                                                                            ? 'bg-blue-500 text-white'
                                                                            : 'bg-gray-200 text-gray-500'
                                                                    }`}>1</span>
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between">
                                                                            <span>Std</span>
                                                                            <span>{die.ppm_conditions_info?.condition_1?.target?.toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                                                            <div
                                                                                className={`h-1 rounded-full ${
                                                                                    die.ppm_conditions_info?.condition_1?.percentage >= 100 ? 'bg-red-500' :
                                                                                    die.ppm_conditions_info?.condition_1?.percentage >= 75 ? 'bg-orange-500' : 'bg-blue-500'
                                                                                }`}
                                                                                style={{ width: `${Math.min(die.ppm_conditions_info?.condition_1?.percentage || 0, 100)}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Condition 2 */}
                                                                <div className={`flex items-center gap-1 text-[10px] ${
                                                                    die.ppm_conditions_info?.condition_2?.is_active
                                                                        ? 'text-purple-700 font-semibold'
                                                                        : 'text-gray-400'
                                                                }`}>
                                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                                                        die.ppm_conditions_info?.condition_2?.is_active
                                                                            ? 'bg-purple-500 text-white'
                                                                            : 'bg-gray-200 text-gray-500'
                                                                    }`}>2</span>
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between">
                                                                            <span>PPM#{(die.ppm_count || 0) + 1}</span>
                                                                            <span>{die.ppm_conditions_info?.condition_2?.target?.toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                                                            <div
                                                                                className={`h-1 rounded-full ${
                                                                                    die.ppm_conditions_info?.condition_2?.percentage >= 100 ? 'bg-red-500' :
                                                                                    die.ppm_conditions_info?.condition_2?.percentage >= 75 ? 'bg-orange-500' : 'bg-purple-500'
                                                                                }`}
                                                                                style={{ width: `${Math.min(die.ppm_conditions_info?.condition_2?.percentage || 0, 100)}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Both conditions indicator */}
                                                                {die.ppm_trigger_condition?.type === 'both' && (
                                                                    <div className="text-[8px] text-center text-orange-600 font-medium">
                                                                        ⚡ Final
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="border px-2 py-1 text-center">
                                                            <span className={`px-1 py-0.5 rounded text-xs font-medium ${getStatusColor(die.ppm_status)}`}>
                                                                {die.accumulation_stroke?. toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs bg-gray-50 font-medium">
                                                            Forecast
                                                        </td>
                                                        {/* Forecast cells */}
                                                        {months.map((_, monthIdx) => (
                                                            weeks.map((_, weekIdx) => (
                                                                <td key={`${die.id}-forecast-${monthIdx}-${weekIdx}`} className="border px-1 py-1 text-center">
                                                                    {renderCell(die.monthly_data?.[monthIdx + 1]?. forecast?.[weekIdx], 'forecast')}
                                                                </td>
                                                            ))
                                                        ))}
                                                    </tr>

                                                    {/* Row 2: Part Name + Plan */}
                                                    <tr key={`${die.id}-2`} className="hover:bg-gray-50">
                                                        <td className="border px-2 py-1 text-gray-600 text-xs sticky left-[40px] bg-white z-10 truncate max-w-[180px]" title={die.part_name}>
                                                            {die.part_name}
                                                        </td>
                                                        <td className="border px-2 py-1"></td>
                                                        <td className="border px-2 py-1"></td>
                                                        <td className="border px-2 py-1 text-xs bg-gray-50 font-medium">
                                                            Plan
                                                        </td>
                                                        {months.map((_, monthIdx) => (
                                                            weeks.map((_, weekIdx) => (
                                                                <td key={`${die.id}-plan-${monthIdx}-${weekIdx}`} className="border px-1 py-1 text-center">
                                                                    {renderCell(die.monthly_data?.[monthIdx + 1]?.plan?.[weekIdx], 'plan')}
                                                                </td>
                                                            ))
                                                        ))}
                                                    </tr>

                                                    {/* Row 3: Accumulation All + Actual */}
                                                    <tr key={`${die.id}-3`} className="hover:bg-gray-50">
                                                        <td className="border px-2 py-1 sticky left-[40px] bg-white z-10"></td>
                                                        <td className="border px-2 py-1 text-xs text-gray-600">
                                                            ACCUMULATION ALL STROKE
                                                        </td>
                                                        <td className="border px-2 py-1 text-center text-xs">
                                                            {die.standard_stroke?. toLocaleString()}
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs bg-gray-50 font-medium">
                                                            Actual
                                                        </td>
                                                        {months.map((_, monthIdx) => (
                                                            weeks.map((_, weekIdx) => (
                                                                <td key={`${die.id}-actual-${monthIdx}-${weekIdx}`} className="border px-1 py-1 text-center">
                                                                    {renderCell(die.monthly_data?.[monthIdx + 1]?.actual?.[weekIdx], 'actual')}
                                                                </td>
                                                            ))
                                                        ))}
                                                    </tr>

                                                    {/* Row 4: Control Stroke + Stroke */}
                                                    <tr key={`${die.id}-4`} className="hover:bg-gray-50">
                                                        <td className="border px-2 py-1 sticky left-[40px] bg-white z-10"></td>
                                                        <td className="border px-2 py-1 text-xs text-gray-600">
                                                            CONTROL STROKE
                                                        </td>
                                                        <td className="border px-2 py-1 text-center text-xs font-medium">
                                                            {die. control_stroke?.toLocaleString()}
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs bg-gray-50 font-medium">
                                                            Stroke
                                                        </td>
                                                        {months.map((_, monthIdx) => (
                                                            weeks.map((_, weekIdx) => (
                                                                <td key={`${die.id}-stroke-${monthIdx}-${weekIdx}`} className="border px-1 py-1 text-center">
                                                                    {renderCell(die.monthly_data?.[monthIdx + 1]?.stroke?.[weekIdx], 'stroke')}
                                                                </td>
                                                            ))
                                                        ))}
                                                    </tr>

                                                    {/* Row 5: PPM Date */}
                                                    <tr key={`${die.id}-5`} className="hover:bg-gray-50">
                                                        <td className="border px-2 py-1 sticky left-[40px] bg-white z-10"></td>
                                                        <td className="border px-2 py-1"></td>
                                                        <td className="border px-2 py-1"></td>
                                                        <td className="border px-2 py-1 text-xs bg-gray-50 font-medium">
                                                            PPM Date
                                                        </td>
                                                        {months. map((_, monthIdx) => (
                                                            weeks.map((_, weekIdx) => (
                                                                <td key={`${die.id}-ppmdate-${monthIdx}-${weekIdx}`} className="border px-1 py-1 text-center">
                                                                    {renderCell(die.monthly_data?.[monthIdx + 1]?.ppm_date?.[weekIdx])}
                                                                </td>
                                                            ))
                                                        ))}
                                                    </tr>

                                                    {/* Row 6: PIC */}
                                                    <tr key={`${die.id}-6`} className="hover:bg-gray-50 border-b-2 border-gray-200">
                                                        <td className="border px-2 py-1 sticky left-[40px] bg-white z-10"></td>
                                                        <td className="border px-2 py-1"></td>
                                                        <td className="border px-2 py-1"></td>
                                                        <td className="border px-2 py-1 text-xs bg-gray-50 font-medium">
                                                            Pic
                                                        </td>
                                                        {months.map((_, monthIdx) => (
                                                            weeks.map((_, weekIdx) => (
                                                                <td key={`${die.id}-pic-${monthIdx}-${weekIdx}`} className="border px-1 py-1 text-center">
                                                                    {renderCell(die.monthly_data?.[monthIdx + 1]?.pic?.[weekIdx])}
                                                                </td>
                                                            ))
                                                        ))}
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8 + 48} className="px-4 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl mb-2">📅</span>
                                                <p>No schedule data found</p>
                                                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="bg-gray-50 px-4 py-3 border-t flex flex-wrap items-center gap-6 text-sm">
                        <span className="font-medium text-gray-700">Legend:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">●</span>
                            <span>PPM Done</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-green-600 text-white text-xs font-bold rounded">4</span>
                            <span>Planned Week</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">5000</span>
                            <span>Critical</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">4500</span>
                            <span>Warning</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">2000</span>
                            <span>OK</span>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {scheduleData?.reduce((sum, g) => sum + (g.dies?.length || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-gray-500">Total Dies</div>
                    </div>
                    <div className="bg-green-50 rounded-lg shadow-sm p-4 text-center border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                            {scheduleData?.reduce((sum, g) => sum + (g.dies?.filter(d => d.ppm_status === 'green').length || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-green-700">OK Status</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg shadow-sm p-4 text-center border border-orange-200">
                        <div className="text-2xl font-bold text-orange-600">
                            {scheduleData?.reduce((sum, g) => sum + (g.dies?.filter(d => d.ppm_status === 'orange').length || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-orange-700">Warning</div>
                    </div>
                    <div className="bg-red-50 rounded-lg shadow-sm p-4 text-center border border-red-200">
                        <div className="text-2xl font-bold text-red-600">
                            {scheduleData?.reduce((sum, g) => sum + (g.dies?.filter(d => d.ppm_status === 'red').length || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-red-700">Critical</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
