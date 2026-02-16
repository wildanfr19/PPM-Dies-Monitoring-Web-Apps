import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function TonnageStandardEdit({ auth, tonnageStandard }) {
    const { data, setData, put, processing, errors } = useForm({
        tonnage: tonnageStandard.tonnage || '',
        grade: tonnageStandard.grade || '',
        type: tonnageStandard.type || '',
        standard_stroke: tonnageStandard.standard_stroke || '',
        lot_size: tonnageStandard.lot_size || '',
        description: tonnageStandard.description || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('tonnage-standards.update', tonnageStandard.id));
    };

    // Calculate preview
    const totalLots = data.standard_stroke && data.lot_size
        ? Math.ceil(parseInt(data.standard_stroke) / parseInt(data.lot_size))
        : 0;
    const ppmCheckpoints = Math.ceil(totalLots / 4);

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2">
                    <Link href={route('tonnage-standards.index')} className="text-gray-500 hover:text-gray-700">
                         Standards Stroke
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span>Edit: {tonnageStandard.tonnage}</span>
                </div>
            }
        >
            <Head title={`Edit Tonnage Standard - ${tonnageStandard.tonnage}`} />

            <div className="py-6 px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                ✏️ Edit Tonnage Standard
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tonnage */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tonnage <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.tonnage}
                                            onChange={(e) => setData('tonnage', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="e.g., 800T, 1200T"
                                        />
                                        {errors.tonnage && (
                                            <p className="mt-1 text-sm text-red-600">{errors.tonnage}</p>
                                        )}
                                    </div>

                                    {/* Grade */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Grade
                                        </label>
                                        <input
                                            type="text"
                                            value={data.grade}
                                            onChange={(e) => setData('grade', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="e.g., A, B, C"
                                        />
                                        {errors.grade && (
                                            <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
                                        )}
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Type
                                        </label>
                                        <input
                                            type="text"
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="e.g., Standard, Heavy Duty"
                                        />
                                        {errors.type && (
                                            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                        )}
                                    </div>

                                    {/* Standard Stroke */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Standard Stroke <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={data.standard_stroke}
                                            onChange={(e) => setData('standard_stroke', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="e.g., 6000"
                                            min="1"
                                        />
                                        {errors.standard_stroke && (
                                            <p className="mt-1 text-sm text-red-600">{errors.standard_stroke}</p>
                                        )}
                                    </div>

                                    {/* Lot Size */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Lot Size <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={data.lot_size}
                                            onChange={(e) => setData('lot_size', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="e.g., 375"
                                            min="1"
                                        />
                                        {errors.lot_size && (
                                            <p className="mt-1 text-sm text-red-600">{errors.lot_size}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Strokes per production lot
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows="2"
                                            placeholder="Optional description..."
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Preview Box */}
                                {data.standard_stroke && data.lot_size && (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            📊 PPM Preview
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Total Lots:</span>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">{totalLots} lots</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">PPM Checkpoints:</span>
                                                <p className="font-semibold text-purple-600">{ppmCheckpoints}x PPM</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Strokes per 4 Lots:</span>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {(parseInt(data.lot_size) * 4).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Valid for 4-Lot Rule:</span>
                                                <p className={`font-semibold ${totalLots >= 4 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {totalLots >= 4 ? '✅ Yes' : '❌ No (< 4 lots)'}
                                                </p>
                                            </div>
                                        </div>
                                        {totalLots < 4 && (
                                            <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                                                ⚠️ With less than 4 lots, PPM will only trigger at standard stroke (Condition 1 only)
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Link
                                        href={route('tonnage-standards.index')}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Update Tonnage Standard'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
