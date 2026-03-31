import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import StatusBadge from '@/Components/PPM/StatusBadge';
import { useState } from 'react';

export default function Index({ auth, repairs, stats, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [typeFilter, setTypeFilter] = useState(filters?.repair_type || '');

    const applyFilters = () => {
        router.get(route('special-repair.index'), {
            search: search || undefined,
            status: statusFilter || undefined,
            repair_type: typeFilter || undefined,
        }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setTypeFilter('');
        router.get(route('special-repair.index'));
    };

    const priorityBadge = (priority) => {
        const colors = {
            emergency: 'bg-red-100 text-red-700 border-red-200',
            critical: 'bg-orange-100 text-orange-700 border-orange-200',
            high: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
        return colors[priority] || 'bg-gray-100 text-gray-700';
    };

    const statusBadge = (status) => {
        const colors = {
            approved: 'bg-blue-100 text-blue-700',
            in_progress: 'bg-orange-100 text-orange-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-gray-100 text-gray-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    <i className="fas fa-tools mr-2"></i> Special Dies Repair
                </h2>
            }
        >
            <Head title="Special Dies Repair" />

            <div className="py-6 px-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-gray-700">{stats?.total || 0}</div>
                        <div className="text-xs text-gray-500">Total Repairs</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats?.active || 0}</div>
                        <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div>
                        <div className="text-xs text-gray-500">Completed</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{stats?.urgent_delivery || 0}</div>
                        <div className="text-xs text-gray-500">Urgent Delivery</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats?.severe_damage || 0}</div>
                        <div className="text-xs text-gray-500">Severe Damage</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats?.ppm_interrupted || 0}</div>
                        <div className="text-xs text-gray-500">PPM Interrupted</div>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                placeholder="Part number or name..."
                                className="w-full rounded-md border-gray-300 text-sm"
                            />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
                                <option value="">All Status</option>
                                <option value="approved">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="w-48">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
                                <option value="">All Types</option>
                                <option value="urgent_delivery">Urgent Delivery</option>
                                <option value="severe_damage">Severe Damage</option>
                                <option value="special_request">Special Request</option>
                            </select>
                        </div>
                        <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                            <i className="fas fa-search mr-1"></i> Filter
                        </button>
                        <button onClick={resetFilters} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400">
                            Reset
                        </button>
                        <Link href={route('special-repair.create')} className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 ml-auto">
                            <i className="fas fa-plus mr-1"></i> New Request
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Priority</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">PPM Interrupted</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Deadline</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Requested</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {repairs && repairs.length > 0 ? (
                                    repairs.map((repair, idx) => (
                                        <tr key={repair.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <Link href={route('special-repair.show', repair.encrypted_id)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                                    {repair.part_number}
                                                </Link>
                                                <p className="text-xs text-gray-400">{repair.part_name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{repair.customer}</td>
                                            <td className="px-4 py-3 text-sm">{repair.repair_type_label}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge(repair.priority)}`}>
                                                    {repair.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(repair.status)}`}>
                                                    {repair.status_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{repair.reason}</td>
                                            <td className="px-4 py-3 text-center">
                                                {repair.is_ppm_interrupted ? (
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Yes</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs">{repair.delivery_deadline || '-'}</td>
                                            <td className="px-4 py-3 text-center text-xs">{repair.requested_at}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Link href={route('special-repair.show', repair.encrypted_id)} className="text-blue-600 hover:text-blue-800 text-sm">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                                            <span className="text-3xl">🔧</span>
                                            <p className="mt-2">No special repairs found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
