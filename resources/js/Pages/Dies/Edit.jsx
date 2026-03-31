import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PROCESS_TYPES } from '@/Utils/PpmChecklistData';

export default function DieEdit({ auth, die, customers, machineModels }) {
    const { data, setData, patch, processing, errors } = useForm({
        part_number: die.part_number || '',
        part_name: die.part_name || '',
        machine_model_id: die. machine_model_id || '',
        customer_id: die.customer_id || '',
        qty_die: die.qty_die || 1,
        line: die.line || '',
        process_type: die.process_type || '',
        control_stroke: die.control_stroke || '',
        last_ppm_date: die.last_ppm_date ? new Date(die.last_ppm_date).toISOString().split('T')[0] : '',
        last_stroke: die.last_stroke ?? '',
        location: die.location || '',
        notes: die. notes || '',
        is_4lot_check: die.is_4lot_check || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('dies.update', { die: die.encrypted_id }));
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2">
                    <Link href={route('dies.index')} className="text-gray-500 hover: text-gray-700">
                        Dies
                    </Link>
                    <span className="text-gray-400">/</span>
                    <Link href={route('dies.show', die.encrypted_id)} className="text-gray-500 hover:text-gray-700">
                        {die.part_number}
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span>Edit</span>
                </div>
            }
        >
            <Head title={`Edit Die - ${die.part_number}`} />

            <div className="py-6 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark: text-gray-100 mb-6">
                            ✏️ Edit Die:  {die.part_number}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Part Number & Name */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Part Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.part_number}
                                        onChange={(e) => setData('part_number', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                        required
                                    />
                                    {errors.part_number && <p className="text-red-500 text-xs mt-1">{errors.part_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Qty Die *
                                    </label>
                                    <input
                                        type="number"
                                        value={data.qty_die}
                                        onChange={(e) => setData('qty_die', e.target.value)}
                                        min="1"
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                        required
                                    />
                                    {errors.qty_die && <p className="text-red-500 text-xs mt-1">{errors.qty_die}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Part Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.part_name}
                                    onChange={(e) => setData('part_name', e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    required
                                />
                                {errors.part_name && <p className="text-red-500 text-xs mt-1">{errors.part_name}</p>}
                            </div>

                            {/* Customer & Model */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Customer *
                                    </label>
                                    <select
                                        value={data.customer_id}
                                        onChange={(e) => setData('customer_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                        required
                                    >
                                        <option value="">-- Select Customer --</option>
                                        {customers?.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c. code} - {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Machine Model *
                                    </label>
                                    <select
                                        value={data.machine_model_id}
                                        onChange={(e) => setData('machine_model_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                        required
                                    >
                                        <option value="">-- Select Model --</option>
                                        {machineModels?.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.code} - {m.name} ({m.tonnage_standard?.tonnage})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.machine_model_id && <p className="text-red-500 text-xs mt-1">{errors.machine_model_id}</p>}
                                </div>
                            </div>

                            {/* Line & Process Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Line
                                    </label>
                                    <input
                                        type="text"
                                        value={data.line}
                                        onChange={(e) => setData('line', e.target.value)}
                                        placeholder="e.g., 800T, 1200T"
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Process Type
                                    </label>
                                    <select
                                        value={data.process_type}
                                        onChange={(e) => setData('process_type', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    >
                                        <option value="">-- Select Process --</option>
                                        {PROCESS_TYPES.map((p) => (
                                            <option key={p.value} value={p.value}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.process_type && <p className="text-red-500 text-xs mt-1">{errors.process_type}</p>}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Determines PPM inspection checklist form
                                    </p>
                                </div>
                            </div>

                            {/* Control Stroke & Last Stroke */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Control Stroke (Override)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.control_stroke}
                                        onChange={(e) => setData('control_stroke', e.target.value)}
                                        placeholder="Leave empty to use standard"
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Last Stroke
                                    </label>
                                    <input
                                        type="number"
                                        value={data.last_stroke}
                                        onChange={(e) => setData('last_stroke', e.target.value)}
                                        placeholder="e.g., 0"
                                        min="0"
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Stroke count at last PPM check
                                    </p>
                                </div>
                            </div>

                            {/* Last PPM Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Last PPM Date
                                    </label>
                                    <input
                                        type="date"
                                        value={data.last_ppm_date}
                                        onChange={(e) => setData('last_ppm_date', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Date of latest PPM inspection
                                    </p>
                                </div>
                                <div></div>
                            </div>

                            {/* 4-Lot Check */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_4lot_check"
                                    checked={data.is_4lot_check}
                                    onChange={(e) => setData('is_4lot_check', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
                                />
                                <label htmlFor="is_4lot_check" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    4-Lot Check <span className="text-xs text-gray-500">(Reset accumulation after PPM/polishing)</span>
                                </label>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Storage Location
                                </label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows="3"
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                />
                            </div>

                            {/* Current Status Info */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Current Status</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Accumulation Stroke:</span>
                                        <span className="ml-2 font-medium">{die.accumulation_stroke?. toLocaleString() || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Last PPM:</span>
                                        <span className="ml-2 font-medium">{die.last_ppm_date || 'Never'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Status:</span>
                                        <span className="ml-2 font-medium capitalize">{die.status}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    href={route('dies.show', die.encrypted_id)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Saving.. .' : '💾 Update Die'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
