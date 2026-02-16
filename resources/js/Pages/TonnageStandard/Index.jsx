import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function TonnageStandardIndex({ auth, tonnageStandards }) {
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this tonnage standard?')) {
            router.delete(route('tonnage-standards.destroy', id));
        }
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    ⚙️ Standards Stroke Setup
                </h2>
            }
        >
            <Head title="Standards Stroke" />

            <div className="py-6 px-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage standards stroke, lot sizes, and PPM thresholds
                        </p>
                    </div>
                    <Link
                        href={route('tonnage-standards.create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i> Add Standard Stroke

                    </Link>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        📋 PPM Logic Info
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                        PPM checkpoints are calculated based on <strong>"Every 4 Lots"</strong> rule.
                        Make sure lot_size is configured correctly so that PPM checkpoints make sense.
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                        Example: Standard 6,000 strokes ÷ Lot Size 375 = 16 lots → 4 PPM checkpoints (at lots 4, 8, 12, 16)
                    </p>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Tonnage
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Grade
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Standard Stroke
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Lot Size
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Total Lots
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        PPM Checkpoints
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Used By
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {tonnageStandards && tonnageStandards.length > 0 ? (
                                    tonnageStandards.map((ts) => (
                                        <tr key={ts.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {ts.tonnage}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                                {ts.grade || '-'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                                {ts.type || '-'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right font-medium text-gray-900 dark:text-gray-100">
                                                {ts.standard_stroke?.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded text-sm font-medium">
                                                    {ts.lot_size?.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-gray-600 dark:text-gray-400">
                                                {ts.total_lots} lots
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-sm font-medium">
                                                    {ts.ppm_checkpoints}x PPM
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {ts.machine_models_count} models
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={route('tonnage-standards.edit', ts.id)}
                                                        className="text-yellow-600 hover:text-yellow-800"
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(ts.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete"
                                                        disabled={ts.machine_models_count > 0}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <i className="fas fa-cog text-4xl text-gray-400 mb-2"></i>
                                                <p className="text-gray-500 dark:text-gray-400">No tonnage standards found</p>
                                                <Link
                                                    href={route('tonnage-standards.create')}
                                                    className="mt-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    Add your first tonnage standard →
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
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total: {tonnageStandards?.length || 0} tonnage standards
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
