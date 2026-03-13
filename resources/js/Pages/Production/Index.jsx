import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { confirmDelete, showSuccess } from '@/Utils/swal';

export default function ProductionIndex({ auth, logs, filters, dies }) {
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [dieId, setDieId] = useState(filters?.die_id || '');

    const handleFilter = () => {
        router.get(route('production.index'), {
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            die_id: dieId || undefined,
        }, {
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setDieId('');
        router.get(route('production.index'));
    };

    const handleDelete = async (encryptedId, partNumber) => {
        const confirmed = await confirmDelete(`production log for ${partNumber}`);
        if (confirmed) {
            router.delete(route('production.destroy', encryptedId));
        }
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Production Result
                </h2>
            }
        >
            <Head title="Production Logs" />

            <div className="py-6 px-6 space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        Track daily production output and stroke counts
                    </p>
                    <div className="flex gap-2">
                        <a
                            href={route('reports.production.excel', {
                                date_from: dateFrom || undefined,
                                date_to: dateTo || undefined,
                                die_id: dieId || undefined,
                            })}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <i className="fas fa-file-excel"></i> Export Excel
                        </a>
                        <Link
                            href={route('production.create')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <i className="fas fa-plus"></i> Add Production Result
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Date From
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Date To
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="w-64">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Die
                            </label>
                            <select
                                value={dieId}
                                onChange={(e) => setDieId(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                            >
                                <option value="">All Dies</option>
                                {dies?.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.part_number} - {d.part_name?. substring(0, 30)}
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
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark: bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Shift</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Part Number</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Part Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Model</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Line</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Qty Die</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Process</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Output</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {logs?.data && logs.data.length > 0 ? (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {log.production_date}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    Shift {log.shift}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Link
                                                    href={route('dies.show', { die: log.die_id })}
                                                    className="text-blue-600 hover: text-blue-800 font-medium"
                                                >
                                                    {log. die?. part_number}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                                {log.die?.part_name}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {log.model || log.die?.machine_model?.code || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {log.line || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-400">
                                                {log.die?.qty_die || 1}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                    log.running_process === 'Auto'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : log.running_process === 'Blanking'
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                    {log.running_process}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    {log.output_qty?. toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route('production.show', log.encrypted_id)}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="View"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                    <Link
                                                        href={route('production.edit', log.encrypted_id)}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(log.encrypted_id, log.die?.part_number)}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl mb-2">📦</span>
                                                <p className="text-gray-500 dark:text-gray-400">No production logs found</p>
                                                <Link
                                                    href={route('production.create')}
                                                    className="mt-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    Add your first production log →
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs?.links && logs.links.length > 3 && (
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {logs.from} to {logs.to} of {logs.total} results
                                </p>
                                <div className="flex gap-1">
                                    {logs.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={! link.url}
                                            className={`px-3 py-1 text-sm rounded ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                        ? 'bg-white text-gray-700 hover: bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
