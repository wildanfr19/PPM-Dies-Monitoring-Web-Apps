import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StatusBadge from '@/Components/PPM/StatusBadge';
import LotProgress from '@/Components/PPM/LotProgress';

export default function DiesIndex({ auth, dies, filters, customers, machineModels }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [customerId, setCustomerId] = useState(filters?.customer_id || '');
    const [modelId, setModelId] = useState(filters?.machine_model_id || '');

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
                    <Link
                        href={route('dies.create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <span>+</span> Add Die
                    </Link>
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
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                🔍 Filter
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
                                                <Link
                                                    href={route('dies.show', { die: die.id })}
                                                    className="text-blue-600 hover:text-blue-800 mr-3"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={route('dies.edit', { die: die.id })}
                                                    className="text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl mb-2">📦</span>
                                                <p className="text-gray-500 dark:text-gray-400">No dies found</p>
                                                <Link
                                                    href={route('dies.create')}
                                                    className="mt-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    Add your first die →
                                                </Link>
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
