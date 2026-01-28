import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import StatusBadge from '@/Components/PPM/StatusBadge';
import LotProgress from '@/Components/PPM/LotProgress';

export default function DieShow({ auth, die }) {
    const [showPpmModal, setShowPpmModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        ppm_date: new Date().toISOString().split('T')[0],
        pic:  '',
        maintenance_type: 'routine',
        work_performed: '',
        parts_replaced: '',
        findings: '',
        recommendations: '',
        checked_by: '',
        approved_by: '',
    });

    const handleRecordPpm = (e) => {
        e.preventDefault();
        post(route('dies.record-ppm', { die: die.id }), {
            onSuccess: () => {
                setShowPpmModal(false);
                reset();
            },
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'green':  return 'text-green-600';
            case 'orange': return 'text-orange-600';
            case 'red': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2">
                    <Link href={route('dies.index')} className="text-gray-500 hover:text-gray-700">
                        Dies
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span>{die.part_number}</span>
                </div>
            }
        >
            <Head title={`Die - ${die.part_number}`} />

            <div className="py-6 px-6 space-y-6">

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark: text-gray-100">
                            {die.part_number}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {die.part_name}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('dies.edit', { die: die.id })}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300"
                        >
                            ✏️ Edit
                        </Link>
                        <button
                            onClick={() => setShowPpmModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            📝 Record PPM
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg: grid-cols-3 gap-6">
                    {/* Left Column - Die Info */}
                    <div className="space-y-6">
                        {/* Die Information Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                🔧 Die Information
                            </h3>
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Customer</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">{die.customer?. code}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Model</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">{die.machineModel?.code}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Tonnage</dt>
                                    <dd className="font-medium text-gray-900 dark: text-gray-100">{die.tonnage}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark: text-gray-400">Qty Die</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">{die.qty_die}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Line</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">{die.line || '-'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Standard Stroke</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">{die. standard_stroke?. toLocaleString()}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Lot Size</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">{die.lot_size?. toLocaleString()}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Last PPM</dt>
                                    <dd className="font-medium text-gray-900 dark: text-gray-100">{die.last_ppm_date || '-'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Middle Column - Stroke Status */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stroke Status Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                📊 Stroke Status
                            </h3>

                            {/* Big Status Display */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Accumulation Stroke</p>
                                    <p className={`text-4xl font-bold ${getStatusColor(die.ppm_status)}`}>
                                        {die.accumulation_stroke?. toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        of {die.standard_stroke?.toLocaleString()} standard
                                    </p>
                                </div>
                                <div className="text-right">
                                    <StatusBadge status={die.ppm_status} label={die.ppm_status_label} />
                                    <p className={`text-3xl font-bold mt-2 ${getStatusColor(die.ppm_status)}`}>
                                        {die. stroke_percentage}%
                                    </p>
                                </div>
                            </div>

                            {/* Lot Progress */}
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Lot Progress (Current:  Lot {die.current_lot} of {die.total_lots})
                                </p>
                                <LotProgress
                                    lots={die.lot_progress || []}
                                    percentage={die. stroke_percentage}
                                    accumulationStroke={die.accumulation_stroke}
                                    standardStroke={die.standard_stroke}
                                />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {die.remaining_strokes?. toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 dark: text-gray-400">Remaining Strokes</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {die.remaining_lots?.toFixed(1)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Remaining Lots</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {die.current_lot}/{die.total_lots}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Lot</p>
                                </div>
                            </div>
                        </div>

                        {/* PPM History */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                📋 PPM History
                            </h3>
                            {die.ppmHistories && die.ppmHistories.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead>
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stroke</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">PIC</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {die.ppmHistories.map((history) => (
                                                <tr key={history.id}>
                                                    <td className="px-3 py-2 text-sm">{history.ppm_date}</td>
                                                    <td className="px-3 py-2 text-sm">{history.stroke_at_ppm?. toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-sm">{history. pic}</td>
                                                    <td className="px-3 py-2 text-sm capitalize">{history.maintenance_type}</td>
                                                    <td className="px-3 py-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {history. status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No PPM history yet
                                </div>
                            )}
                        </div>

                        {/* Production Logs */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    ⚙️ Recent Production Logs
                                </h3>
                                <Link
                                    href={route('production.index', { die_id: die.id })}
                                    className="text-sm text-blue-600 hover: text-blue-800"
                                >
                                    View All →
                                </Link>
                            </div>
                            {die.productionLogs && die.productionLogs.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead>
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Output</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Process</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {die.productionLogs.slice(0, 10).map((log) => (
                                                <tr key={log.id}>
                                                    <td className="px-3 py-2 text-sm">{log.production_date}</td>
                                                    <td className="px-3 py-2 text-sm">{log.shift}</td>
                                                    <td className="px-3 py-2 text-sm font-medium">{log.output_qty?. toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-sm">{log.running_process}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No production logs yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PPM Modal */}
            {showPpmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    📝 Record PPM - {die.part_number}
                                </h3>
                                <button
                                    onClick={() => setShowPpmModal(false)}
                                    className="text-gray-500 hover: text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleRecordPpm} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            PPM Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={data.ppm_date}
                                            onChange={(e) => setData('ppm_date', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                            required
                                        />
                                        {errors.ppm_date && <p className="text-red-500 text-xs mt-1">{errors.ppm_date}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            PIC (Person In Charge) *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.pic}
                                            onChange={(e) => setData('pic', e.target.value)}
                                            placeholder="e.g., Rydha RG"
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                            required
                                        />
                                        {errors.pic && <p className="text-red-500 text-xs mt-1">{errors.pic}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark: text-gray-300 mb-1">
                                        Maintenance Type *
                                    </label>
                                    <select
                                        value={data.maintenance_type}
                                        onChange={(e) => setData('maintenance_type', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    >
                                        <option value="routine">Routine</option>
                                        <option value="repair">Repair</option>
                                        <option value="overhaul">Overhaul</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Work Performed
                                    </label>
                                    <textarea
                                        value={data. work_performed}
                                        onChange={(e) => setData('work_performed', e.target. value)}
                                        rows="2"
                                        placeholder="Describe the work performed..."
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Parts Replaced
                                    </label>
                                    <textarea
                                        value={data.parts_replaced}
                                        onChange={(e) => setData('parts_replaced', e.target.value)}
                                        rows="2"
                                        placeholder="List any parts that were replaced..."
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark: text-gray-300 mb-1">
                                            Checked By
                                        </label>
                                        <input
                                            type="text"
                                            value={data.checked_by}
                                            onChange={(e) => setData('checked_by', e.target.value)}
                                            placeholder="e.g., Mr. Kammee"
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Approved By
                                        </label>
                                        <input
                                            type="text"
                                            value={data.approved_by}
                                            onChange={(e) => setData('approved_by', e.target.value)}
                                            placeholder="e.g., Mr. Manop"
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                        />
                                    </div>
                                </div>

                                {/* Current Status Info */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark: border-yellow-800 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <strong>⚠️ Note:</strong> Recording PPM will reset the accumulation stroke counter to 0.
                                    </p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                        Current stroke:  <strong>{die.accumulation_stroke?.toLocaleString()}</strong>
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPpmModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : '✓ Record PPM'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
