import AppLayout from '@/Layouts/AppLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function TransferIndex({ auth, toMtn, toProduction, atMtn, recentTransfers, tab, stats }) {
    const [activeTab, setActiveTab] = useState(tab || 'to_mtn');
    const [selectedIds, setSelectedIds] = useState([]);
    const [processing, setProcessing] = useState(false);

    const tabs = [
        { key: 'to_mtn', label: 'Pending Transfer to MTN', count: stats.pending_to_mtn, color: 'red' },
        { key: 'at_mtn', label: 'Currently at MTN', count: stats.at_mtn, color: 'yellow' },
        { key: 'to_prod', label: 'Pending Return to Prod', count: stats.pending_to_prod, color: 'green' },
        { key: 'history', label: 'Recent History', count: recentTransfers?.length || 0, color: 'gray' },
    ];

    const currentData = {
        to_mtn: toMtn,
        at_mtn: atMtn,
        to_prod: toProduction,
        history: recentTransfers,
    }[activeTab] || [];

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedIds.length === currentData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(currentData.map(d => d.id));
        }
    };

    const handleBatchTransferToMtn = () => {
        if (selectedIds.length === 0) return;
        setProcessing(true);
        router.post(route('transfer-dies.batch-to-mtn'), {
            die_ids: selectedIds,
            transferred_by: auth.user.name,
        }, {
            onFinish: () => { setProcessing(false); setSelectedIds([]); },
        });
    };

    const handleBatchTransferToProd = () => {
        if (selectedIds.length === 0) return;
        setProcessing(true);
        router.post(route('transfer-dies.batch-to-production'), {
            die_ids: selectedIds,
        }, {
            onFinish: () => { setProcessing(false); setSelectedIds([]); },
        });
    };

    const handleSingleTransferToMtn = (die) => {
        router.post(route('transfer-dies.to-mtn', die.encrypted_id), {
            transferred_by: auth.user.name,
        });
    };

    const handleSingleTransferToProd = (die) => {
        router.post(route('transfer-dies.to-production', die.encrypted_id), {});
    };

    const isProduction = auth.user.role === 'production' || auth.user.role === 'admin';
    const isMtnDies = auth.user.role === 'mtn_dies' || auth.user.role === 'admin';

    return (
        <AppLayout
            user={auth.user}
            header={<span className="text-lg font-semibold text-gray-800 dark:text-gray-200">🔄 Transfer Dies</span>}
        >
            <Head title="Transfer Dies" />

            <div className="py-6 px-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => { setActiveTab(t.key); setSelectedIds([]); }}
                            className={`p-4 rounded-lg border-2 transition text-left ${
                                activeTab === t.key
                                    ? `border-${t.color}-500 bg-${t.color}-50 dark:bg-${t.color}-900/20`
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                            }`}
                        >
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.label}</p>
                            <p className={`text-2xl font-bold ${
                                t.color === 'red' ? 'text-red-600' :
                                t.color === 'yellow' ? 'text-yellow-600' :
                                t.color === 'green' ? 'text-green-600' : 'text-gray-600'
                            }`}>
                                {t.count}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Batch Actions */}
                {selectedIds.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {selectedIds.length} die(s) selected
                        </span>
                        <div className="flex gap-2">
                            {activeTab === 'to_mtn' && isProduction && (
                                <button
                                    onClick={handleBatchTransferToMtn}
                                    disabled={processing}
                                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processing ? 'Transferring...' : `Transfer ${selectedIds.length} to MTN Dies`}
                                </button>
                            )}
                            {activeTab === 'to_prod' && isMtnDies && (
                                <button
                                    onClick={handleBatchTransferToProd}
                                    disabled={processing}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {processing ? 'Transferring...' : `Return ${selectedIds.length} to Production`}
                                </button>
                            )}
                            <button onClick={() => setSelectedIds([])} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    {(activeTab === 'to_mtn' || activeTab === 'to_prod') && (
                                        <th className="px-4 py-3">
                                            <input type="checkbox" onChange={toggleAll}
                                                checked={currentData.length > 0 && selectedIds.length === currentData.length}
                                                className="rounded border-gray-300 text-blue-600"
                                            />
                                        </th>
                                    )}
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {activeTab === 'to_mtn' ? 'Red Alerted' :
                                         activeTab === 'history' ? 'Returned' : 'Transferred'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentData.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No dies in this category.
                                        </td>
                                    </tr>
                                ) : currentData.map(die => (
                                    <tr key={die.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        {(activeTab === 'to_mtn' || activeTab === 'to_prod') && (
                                            <td className="px-4 py-3">
                                                <input type="checkbox"
                                                    checked={selectedIds.includes(die.id)}
                                                    onChange={() => toggleSelect(die.id)}
                                                    className="rounded border-gray-300 text-blue-600"
                                                />
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {die.part_number}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{die.part_name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{die.customer}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{die.line || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{die.location || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                die.ppm_alert_status === 'red_alerted' ? 'bg-red-100 text-red-700' :
                                                die.ppm_alert_status === 'ppm_completed' ? 'bg-green-100 text-green-700' :
                                                die.ppm_alert_status === 'ppm_in_progress' ? 'bg-blue-100 text-blue-700' :
                                                !die.ppm_alert_status ? 'bg-green-100 text-green-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {die.ppm_alert_status_label || die.ppm_alert_status || 'Returned to Production'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {activeTab === 'to_mtn' ? die.red_alerted_at :
                                             activeTab === 'history' ? die.returned_at :
                                             die.transferred_at || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {activeTab === 'to_mtn' && isProduction && (
                                                <button
                                                    onClick={() => handleSingleTransferToMtn(die)}
                                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                >
                                                    Transfer to MTN
                                                </button>
                                            )}
                                            {activeTab === 'to_prod' && isMtnDies && (
                                                <button
                                                    onClick={() => handleSingleTransferToProd(die)}
                                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                                >
                                                    Return to Prod
                                                </button>
                                            )}
                                            {(activeTab === 'at_mtn' || activeTab === 'history') && (
                                                <a href={route('dies.show', die.encrypted_id)}
                                                   className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">
                                                    View
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
