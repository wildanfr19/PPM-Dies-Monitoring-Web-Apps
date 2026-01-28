import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function MachineModelsEdit({ auth, machineModel, tonnageStandards }) {
    const { data, setData, put, processing, errors } = useForm({
        code: machineModel.code || '',
        name: machineModel.name || '',
        tonnage_standard_id: machineModel.tonnage_standard_id || '',
        description: machineModel.description || '',
        is_active: machineModel.is_active ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('machine-models.update', machineModel.id));
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Edit Machine Model
                </h2>
            }
        >
            <Head title="Edit Machine Model" />

            <div className="py-6 px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="e.g. KS, 4L45W"
                                />
                                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Model Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Full model name"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            {/* Tonnage Standard */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tonnage Standard <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.tonnage_standard_id}
                                    onChange={(e) => setData('tonnage_standard_id', e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Select Tonnage Standard</option>
                                    {tonnageStandards?.map((ts) => (
                                        <option key={ts.id} value={ts.id}>
                                            {ts.tonnage} T - {ts.grade || ts.type || 'Standard'} (Stroke: {ts.standard_stroke?.toLocaleString()}, Lot: {ts.lot_size?.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                                {errors.tonnage_standard_id && <p className="mt-1 text-sm text-red-500">{errors.tonnage_standard_id}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Optional description..."
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                                    Active
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    href={route('machine-models.index')}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Update Machine Model'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
