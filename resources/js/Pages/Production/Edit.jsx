import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ProductionEdit({ auth, log, dies }) {
    const { data, setData, put, processing, errors } = useForm({
        die_id: log.die_id || '',
        model: log.model || '',
        production_date: log.production_date || '',
        shift: log.shift || '1',
        line: log.line || '',
        running_process: log.running_process || 'Auto',
        start_time: log.start_time || '',
        finish_time: log.finish_time || '',
        total_hours: log.total_hours || '',
        total_minutes: log.total_minutes || '',
        break_time: log.break_time || '',
        output_qty: log.output_qty || '',
    });

    // Get selected die info
    const selectedDie = dies?.find(d => d.id === parseInt(data.die_id));

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('production.update', log.id));
    };

    // Auto-fill line when die is selected
    const handleDieChange = (dieId) => {
        setData('die_id', dieId);
        const selectedDie = dies?.find(d => d.id === parseInt(dieId));
        if (selectedDie?.line) {
            setData(prev => ({ ...prev, die_id: dieId, line: selectedDie.line }));
        }
    };

    // Calculate total hours when times change
    const calculateTotalTime = (start, finish) => {
        if (start && finish) {
            const startDate = new Date(`2000-01-01T${start}`);
            const finishDate = new Date(`2000-01-01T${finish}`);
            let diff = (finishDate - startDate) / 1000 / 60; // in minutes
            if (diff < 0) diff += 24 * 60; // handle overnight shifts
            setData(prev => ({
                ...prev,
                start_time: start,
                finish_time: finish,
                total_hours: (diff / 60).toFixed(2),
                total_minutes: Math.round(diff),
            }));
        }
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2">
                    <Link href={route('production.index')} className="text-gray-500 hover:text-gray-700">
                        Production Logs
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span>Edit #{log.id}</span>
                </div>
            }
        >
            <Head title="Edit Production Log" />

            <div className="py-6 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                            ✏️ Edit Production Log
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Die Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Select Die *
                                </label>
                                <select
                                    value={data.die_id}
                                    onChange={(e) => handleDieChange(e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    required
                                >
                                    <option value="">-- Select Die --</option>
                                    {dies?.map((die) => (
                                        <option key={die.id} value={die.id}>
                                            {die.part_number} - {die.part_name} ({die.customer?.code})
                                        </option>
                                    ))}
                                </select>
                                {errors.die_id && <p className="text-red-500 text-xs mt-1">{errors.die_id}</p>}
                            </div>

                            {/* Model */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Model
                                </label>
                                <input
                                    type="text"
                                    value={data.model}
                                    onChange={(e) => setData('model', e.target.value.toUpperCase())}
                                    placeholder="e.g., YHA, KS, 2JX, Y4L"
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                />
                                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                            </div>

                            {/* Date and Shift */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Production Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={data.production_date}
                                        onChange={(e) => setData('production_date', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                        required
                                    />
                                    {errors.production_date && <p className="text-red-500 text-xs mt-1">{errors.production_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Shift *
                                    </label>
                                    <select
                                        value={data.shift}
                                        onChange={(e) => setData('shift', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                        required
                                    >
                                        <option value="1">Shift 1</option>
                                        <option value="2">Shift 2</option>
                                        <option value="3">Shift 3</option>
                                    </select>
                                    {errors.shift && <p className="text-red-500 text-xs mt-1">{errors.shift}</p>}
                                </div>
                            </div>

                            {/* Line, Qty Die, and Process */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Line
                                    </label>
                                    <select
                                        value={data.line}
                                        onChange={(e) => setData('line', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    >
                                        <option value="">-- Select Line --</option>
                                        <option value="250T">250T</option>
                                        <option value="800T">800T</option>
                                        <option value="1200T">1200T</option>
                                        <option value="Progressive">Progressive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Qty Die <span className="text-xs text-gray-400">(from Die)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedDie?.qty_die || log.die?.qty_die || '-'}
                                        readOnly
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-100 dark:text-gray-500 shadow-sm bg-gray-50 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Running Process
                                    </label>
                                    <select
                                        value={data.running_process}
                                        onChange={(e) => setData('running_process', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    >
                                        <option value="Auto">Auto</option>
                                        <option value="Manual">Manual</option>
                                        <option value="Blanking">Blanking</option>
                                    </select>
                                </div>
                            </div>

                            {/* Time */}
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => calculateTotalTime(e.target.value, data.finish_time)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Finish Time
                                    </label>
                                    <input
                                        type="time"
                                        value={data.finish_time}
                                        onChange={(e) => calculateTotalTime(data.start_time, e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Total (hours)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.total_hours}
                                        onChange={(e) => setData('total_hours', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm bg-gray-50"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Break Time (min)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.break_time}
                                        onChange={(e) => setData('break_time', e.target.value)}
                                        placeholder="0"
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Output - THE MAIN FIELD */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                    Total Output / Stroke Count *
                                </label>
                                <input
                                    type="number"
                                    value={data.output_qty}
                                    onChange={(e) => setData('output_qty', e.target.value)}
                                    placeholder="Enter stroke count..."
                                    className="w-full rounded-md border-yellow-300 dark:border-yellow-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm text-2xl font-bold text-center"
                                    required
                                    min="1"
                                />
                                {errors.output_qty && <p className="text-red-500 text-xs mt-1">{errors.output_qty}</p>}
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                                    ⚠️ Changing this value will adjust the die's accumulation stroke count accordingly
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Original output: <span className="font-semibold">{log.output_qty?.toLocaleString()}</span> strokes
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    href={route('production.index')}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : '💾 Update Production Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
