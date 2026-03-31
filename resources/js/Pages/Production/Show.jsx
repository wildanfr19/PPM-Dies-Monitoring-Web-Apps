import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function ProductionShow({ auth, log }) {
    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2">
                    <Link href={route('production.index')} className="text-gray-500 hover:text-gray-700">
                        Production Logs
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span>Detail #{log.id}</span>
                </div>
            }
        >
            <Head title={`Production Log #${log.id}`} />

            <div className="py-6 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">Production Log #{log.id}</h2>
                                    <p className="text-blue-100 mt-1">
                                        {log.production_date} • Shift {log.shift}
                                    </p>
                                </div>
                                <Link
                                    href={route('production.edit', log.encrypted_id)}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                                >
                                    ✏️ Edit
                                </Link>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Die Information */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Die Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Part Number</p>
                                        <Link
                                            href={route('dies.show', log.die?.encrypted_id)}
                                            className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                                        >
                                            {log.die?.part_number}
                                        </Link>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Part Name</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {log.die?.part_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {log.die?.customer?.name || log.die?.customer?.code || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Machine</p>
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {log.die?.machine?.name || log.line || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Production Details */}
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {log.production_date}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Shift</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Shift {log.shift}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Model</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {log.model || '-'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Line</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {log.line || '-'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty Die</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {log.die?.qty_die || 1}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Process</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                        log.running_process === 'Auto'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : log.running_process === 'Blanking'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    }`}>
                                        {log.running_process}
                                    </span>
                                </div>
                            </div>

                            {/* Time Details */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Time Details</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Start Time</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                                            {log.start_time || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Finish Time</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                                            {log.finish_time || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Hours</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                                            {log.total_hours ? `${log.total_hours} hrs` : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Break Time</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                                            {log.break_time ? `${log.break_time} min` : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Output & Accumulation Stroke */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">Total Output / Stroke Count</p>
                                    <p className="text-4xl font-bold text-green-700 dark:text-green-300">
                                        {log.output_qty?.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">strokes</p>
                                </div>
                                <div className={`border rounded-lg p-6 text-center ${
                                    log.die?.ppm_status === 'red'
                                        ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
                                        : log.die?.ppm_status === 'orange'
                                        ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800'
                                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'
                                }`}>
                                    <p className={`text-sm font-medium mb-2 ${
                                        log.die?.ppm_status === 'red' ? 'text-red-600 dark:text-red-400'
                                            : log.die?.ppm_status === 'orange' ? 'text-orange-600 dark:text-orange-400'
                                            : 'text-blue-600 dark:text-blue-400'
                                    }`}>Total Accumulated Stroke</p>
                                    <p className={`text-4xl font-bold ${
                                        log.die?.ppm_status === 'red' ? 'text-red-700 dark:text-red-300'
                                            : log.die?.ppm_status === 'orange' ? 'text-orange-700 dark:text-orange-300'
                                            : 'text-blue-700 dark:text-blue-300'
                                    }`}>
                                        {log.die?.accumulation_stroke?.toLocaleString() || '-'}
                                    </p>
                                    <p className={`text-sm mt-1 ${
                                        log.die?.ppm_status === 'red' ? 'text-red-600 dark:text-red-400'
                                            : log.die?.ppm_status === 'orange' ? 'text-orange-600 dark:text-orange-400'
                                            : 'text-blue-600 dark:text-blue-400'
                                    }`}>
                                        of {log.die?.standard_stroke?.toLocaleString() || '-'} standard
                                    </p>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                <span>Created: {log.created_at}</span>
                                <span>Updated: {log.updated_at}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-between">
                            <Link
                                href={route('production.index')}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ← Back to List
                            </Link>
                            <div className="flex gap-2">
                                <Link
                                    href={route('production.edit', log.encrypted_id)}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                                >
                                    ✏️ Edit
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
