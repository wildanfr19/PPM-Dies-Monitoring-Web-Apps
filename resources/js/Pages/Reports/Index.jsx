import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function ReportsIndex({ auth, customers, machineModels, stats }) {
    const [filters, setFilters] = useState({
        customer_id: '',
        machine_model_id: '',
        status: '',
        date_from: '',
        date_to: '',
    });

    const buildQueryString = (params) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) query.append(key, value);
        });
        return query.toString();
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Reports & Export
                </h2>
            }
        >
            <Head title="Reports" />

            <div className="py-6 px-6">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Stats Summary */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-blue-600">{stats?. total || 0}</div>
                            <div className="text-sm text-blue-700">Total Dies</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-green-600">{stats?.ok || 0}</div>
                            <div className="text-sm text-green-700">OK Status</div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-orange-600">{stats?.warning || 0}</div>
                            <div className="text-sm text-orange-700">Warning</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-red-600">{stats?.critical || 0}</div>
                            <div className="text-sm text-red-700">Critical</div>
                        </div>
                    </div>

                    {/* Report Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Dies Status Report */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-green-600 text-white px-6 py-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <i className="fas fa-chart-bar"></i> Dies Status Report
                                </h3>
                                <p className="text-green-100 text-sm mt-1">
                                    Complete status of all dies with PPM progress
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Filters */}
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        value={filters.customer_id}
                                        onChange={(e) => setFilters({...filters, customer_id: e.target.value})}
                                        className="rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="">All Customers</option>
                                        {customers?. map((c) => (
                                            <option key={c.id} value={c.id}>{c. code}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                                        className="rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="">All Status</option>
                                        <option value="green">OK</option>
                                        <option value="orange">Warning</option>
                                        <option value="red">Critical</option>
                                    </select>
                                </div>

                                {/* Export Buttons */}
                                <div className="flex gap-3">
                                    <a
                                        href={`${route('reports.dies.excel')}?${buildQueryString(filters)}`}
                                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center font-medium flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-file-excel"></i> Export Excel
                                    </a>
                                    <a
                                        href={`${route('reports.dies.pdf')}?${buildQueryString(filters)}`}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-center font-medium flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-file-pdf"></i> Export PDF
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Critical Dies Report */}
                        <div className="bg-white dark: bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-red-600 text-white px-6 py-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <i className="fas fa-exclamation-circle"></i> Critical Dies Report
                                </h3>
                                <p className="text-red-100 text-sm mt-1">
                                    Dies requiring immediate PPM attention
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <div className="text-4xl font-bold text-red-600">
                                        {(stats?.critical || 0) + (stats?.warning || 0)}
                                    </div>
                                    <div className="text-sm text-red-700 mt-1">
                                        Dies need attention
                                    </div>
                                </div>

                                <a
                                    href={route('reports.critical.pdf')}
                                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover: bg-red-700 transition text-center font-medium flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-file-pdf"></i> Download Critical Report (PDF)
                                </a>
                            </div>
                        </div>

                        {/* PPM History Report */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-blue-600 text-white px-6 py-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <i className="fas fa-clipboard-list"></i> PPM History Report
                                </h3>
                                <p className="text-blue-100 text-sm mt-1">
                                    Historical PPM records and maintenance logs
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">From</label>
                                        <input
                                            type="date"
                                            value={filters.date_from}
                                            onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                                            className="w-full rounded-md border-gray-300 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={filters.date_to}
                                            onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                                            className="w-full rounded-md border-gray-300 text-sm"
                                        />
                                    </div>
                                </div>

                                <a
                                    href={`${route('reports.ppm-history.excel')}?${buildQueryString({
                                        date_from:  filters.date_from,
                                        date_to: filters. date_to,
                                    })}`}
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-file-excel"></i> Export PPM History (Excel)
                                </a>
                            </div>
                        </div>

                        {/* Production Report */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-purple-600 text-white px-6 py-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <i className="fas fa-cogs"></i> Production Report
                                </h3>
                                <p className="text-purple-100 text-sm mt-1">
                                    Daily production output and stroke records
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">From</label>
                                        <input
                                            type="date"
                                            value={filters.date_from}
                                            onChange={(e) => setFilters({...filters, date_from: e. target.value})}
                                            className="w-full rounded-md border-gray-300 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={filters.date_to}
                                            onChange={(e) => setFilters({...filters, date_to: e. target.value})}
                                            className="w-full rounded-md border-gray-300 text-sm"
                                        />
                                    </div>
                                </div>

                                <a
                                    href={`${route('reports.production.excel')}?${buildQueryString({
                                        date_from:  filters.date_from,
                                        date_to: filters. date_to,
                                    })}`}
                                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-center font-medium flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-file-excel"></i> Export Production (Excel)
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
