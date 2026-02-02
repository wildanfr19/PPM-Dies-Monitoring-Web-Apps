import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StatusBadge from '@/Components/PPM/StatusBadge';
import LotProgress from '@/Components/PPM/LotProgress';

export default function DiesIndex({ auth, dies, filters, customers, machineModels }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [customerId, setCustomerId] = useState(filters?.customer_id || '');
    const [modelId, setModelId] = useState(filters?.machine_model_id || '');

    // Check if user can edit dies (admin or mtn_dies only)
    const canEditDies = ['admin', 'mtn_dies'].includes(auth.user.role);

    const handleFilter = () => {
        router.get(route('dies.index'), {
            search:  search || undefined,
            customer_id:  customerId || undefined,
            machine_model_id: modelId || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setCustomerId('');
        setModelId('');
        router.get(route('dies.index'));
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dies Monitoring List
                </h2>
            }
        >
            <Head title="Dies List" />

            <div className="py-6 px-6 space-y-6">

                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage and monitor all dies preventive maintenance
                        </p>
                    </div>
                    {canEditDies && (
                        <Link
                            href={route('dies.create')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <i className="fas fa-plus"></i> Add Die
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg p-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Search
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                placeholder="Part number or name..."
                                className="w-full rounded-md border-gray-300 dark: border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-48">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Customer
                            </label>
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e. target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">All Customers</option>
                                {customers?. map((c) => (
                                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-48">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Model
                            </label>
                            <select
                                value={modelId}
                                onChange={(e) => setModelId(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark: border-gray-700 dark: bg-gray-900 dark: text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">All Models</option>
                                {machineModels?.map((m) => (
                                    <option key={m.id} value={m. id}>
                                        {m.code} ({m.tonnage_standard?. tonnage})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <i className="fas fa-search"></i> Filter
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dies Table */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Part Number
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Part Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark: text-gray-300 uppercase tracking-wider">
                                        Model / Tonnage
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Lot Progress
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        PPM Condition
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Last PPM
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {dies && dies.length > 0 ?  (
                                    dies.map((die) => (
                                        <tr key={die.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <Link
                                                    href={route('dies.show', { die: die.id })}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    {die.part_number}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-900 dark:text-gray-100 max-w-[200px] truncate" title={die.part_name}>
                                                    {die.part_name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {die.customer}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {die.model}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                                                        ({die.tonnage})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 min-w-[250px]">
                                                <LotProgress
                                                    lots={die.lot_progress || []}
                                                    percentage={die.stroke_percentage || 0}
                                                    accumulationStroke={die.accumulation_stroke || 0}
                                                    standardStroke={die.standard_stroke || 0}
                                                />
                                            </td>
                                            <td className="px-4 py-4 min-w-[200px]">
                                                <div className="space-y-1.5">
                                                    {/* Condition 1: Standard Stroke */}
                                                    <div className={`flex items-center gap-2 text-xs ${
                                                        die.ppm_conditions_info?.condition_1?.is_active
                                                            ? 'text-blue-700 dark:text-blue-400 font-semibold'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                            die.ppm_conditions_info?.condition_1?.is_active
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                        }`}>1</span>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <span>Std Stroke</span>
                                                                <span>{die.ppm_conditions_info?.condition_1?.target?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-0.5">
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

                                                    {/* Condition 2: 4-Lot Checkpoint */}
                                                    <div className={`flex items-center gap-2 text-xs ${
                                                        die.ppm_conditions_info?.condition_2?.is_active
                                                            ? 'text-purple-700 dark:text-purple-400 font-semibold'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                            die.ppm_conditions_info?.condition_2?.is_active
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                        }`}>2</span>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <span>PPM #{(die.ppm_count || 0) + 1}</span>
                                                                <span>{die.ppm_conditions_info?.condition_2?.target?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-0.5">
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

                                                    {/* Active Trigger Indicator */}
                                                    {die.ppm_trigger_condition?.type === 'both' && (
                                                        <div className="text-[10px] text-center text-orange-600 dark:text-orange-400 font-medium">
                                                            ⚡ Final PPM (Both conditions)
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <StatusBadge
                                                    status={die.ppm_status}
                                                    label={die.ppm_status_label}
                                                />
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {die.last_ppm_date || '-'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={route('dies.show', { die: die.id })}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="View Details"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                    {canEditDies && (
                                                        <Link
                                                            href={route('dies.edit', { die: die.id })}
                                                            className="text-yellow-600 hover:text-yellow-800"
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <i className="fas fa-box-open text-4xl text-gray-400 mb-2"></i>
                                                <p className="text-gray-500 dark:text-gray-400">No dies found</p>
                                                {canEditDies && (
                                                    <Link
                                                        href={route('dies.create')}
                                                        className="mt-2 text-blue-600 hover:text-blue-800"
                                                    >
                                                        Add your first die →
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                            <span>Total:  {dies?. length || 0} dies</span>
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> OK</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500"></span> Warning</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span> Critical</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
