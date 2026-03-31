import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

export default function ProductionCreate({ auth, dies }) {
    const { data, setData, post, processing, errors } = useForm({
        die_id: '',
        model: '',
        production_date: new Date().toISOString().split('T')[0],
        shift: '1',
        line: '',
        running_process: 'Auto',
        start_time: '',
        finish_time: '',
        total_hours: '',
        total_minutes: '',
        break_time: '',
        output_qty: '',
    });

    // Get selected die info
    const selectedDie = dies?.find(d => d.id === parseInt(data.die_id));

    // Calculate alert proximity guidance
    const alertGuidance = useMemo(() => {
        if (!selectedDie) return null;

        const newOutput = parseInt(data.output_qty) || 0;
        const currentAccum = selectedDie.accumulation_stroke;
        const effectiveAccum = currentAccum + newOutput;

        const standardStroke = selectedDie.standard_stroke;
        const lotSize = selectedDie.lot_size_value;
        const orangeThreshold = standardStroke - lotSize;

        const currentStatus = currentAccum >= standardStroke ? 'red' : currentAccum >= orangeThreshold ? 'orange' : 'green';
        const predictedStatus = effectiveAccum >= standardStroke ? 'red' : effectiveAccum >= orangeThreshold ? 'orange' : 'green';

        const outputToOrange = Math.max(0, orangeThreshold - currentAccum);
        const outputToRed = Math.max(0, standardStroke - currentAccum);
        const remainingToOrange = Math.max(0, orangeThreshold - effectiveAccum);
        const remainingToRed = Math.max(0, standardStroke - effectiveAccum);

        return {
            currentAccum,
            effectiveAccum,
            standardStroke,
            lotSize,
            orangeThreshold,
            currentStatus,
            predictedStatus,
            statusChanged: currentStatus !== predictedStatus,
            outputToOrange,
            outputToRed,
            remainingToOrange,
            remainingToRed,
        };
    }, [selectedDie, data.output_qty]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('production.store'));
    };

    // Auto-fill line and model when die is selected
    const handleDieChange = (dieId) => {
        const selectedDie = dies?.find(d => d.id === parseInt(dieId));
        setData(prev => ({
            ...prev,
            die_id: dieId,
            line: selectedDie?.line || '',
            model: selectedDie?.machine_model?.code || ''
            // model: selectedDie?.code || ''
        }));
    };

    // Calculate total hours when times change
    const calculateTotalTime = (start, finish) => {
        setData(prev => {
            const nextData = {
                ...prev,
                start_time: start,
                finish_time: finish,
            };

            if (!start || !finish) {
                return {
                    ...nextData,
                    total_hours: '',
                    total_minutes: '',
                };
            }

            const startDate = new Date(`2000-01-01T${start}`);
            const finishDate = new Date(`2000-01-01T${finish}`);
            let diff = (finishDate - startDate) / 1000 / 60; // in minutes

            if (diff < 0) {
                diff += 24 * 60; // handle overnight shifts
            }

            return {
                ...nextData,
                total_hours: (diff / 60).toFixed(2),
                total_minutes: Math.round(diff),
            };
        });
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
                    <span>Add New</span>
                </div>
            }
        >
            <Head title="Add Production Result" />

            <div className="py-6 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                            ⚙️ Add Production Result
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
                                            {die.part_number} - {die.part_name} ({die.customer?. code})
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
                                        onChange={(e) => setData('production_date', e.target. value)}
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

                            {/* Line, Qty Die (from Die), and Process */}
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
                                        value={selectedDie?.qty_die || '-'}
                                        readOnly
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-100 dark:text-gray-500 shadow-sm bg-gray-50 cursor-not-allowed"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Current Total Stroke <span className="text-xs text-gray-400">(Accumulated Stroke)</span>
                                    </label>
                                    <div className="w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 bg-gray-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
                                        {selectedDie ? selectedDie.accumulation_stroke?.toLocaleString() + ' strokes' : '-'}
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Standard Stroke
                                    </label>
                                    <div className="w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {selectedDie ? selectedDie.standard_stroke?.toLocaleString() + ' strokes' : '-'}
                                    </div>
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
                                        onChange={(e) => calculateTotalTime(e.target. value, data.finish_time)}
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
                                        onChange={(e) => calculateTotalTime(data. start_time, e.target. value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark: text-gray-300 mb-1">
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
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark: border-blue-800 rounded-lg p-4">
                                <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                    Total Output / Stroke Count *
                                </label>
                                <input
                                    type="number"
                                    value={data.output_qty}
                                    onChange={(e) => setData('output_qty', e.target.value)}
                                    placeholder="Enter stroke count..."
                                    className="w-full rounded-md border-blue-300 dark:border-blue-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm text-2xl font-bold text-center"
                                    required
                                    min="1"
                                />
                                {errors.output_qty && <p className="text-red-500 text-xs mt-1">{errors.output_qty}</p>}
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                    ⚠️ This value will be added to the die's accumulation stroke count
                                </p>
                            </div>

                            {/* Alert Proximity Guidance */}
                            {alertGuidance && (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            📊 PPM Alert Status Guide
                                        </h4>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {/* Status preview */}
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-gray-500">Current status:</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                alertGuidance.currentStatus === 'red' ? 'bg-red-100 text-red-700' :
                                                alertGuidance.currentStatus === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {alertGuidance.currentStatus === 'red' ? '🔴' : alertGuidance.currentStatus === 'orange' ? '🟠' : '🟢'}
                                                {alertGuidance.currentStatus.toUpperCase()}
                                            </span>
                                            {alertGuidance.statusChanged && (
                                                <>
                                                    <span className="text-gray-400">→</span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-2 ${
                                                        alertGuidance.predictedStatus === 'red' ? 'bg-red-100 text-red-700 ring-red-400' :
                                                        alertGuidance.predictedStatus === 'orange' ? 'bg-orange-100 text-orange-700 ring-orange-400' :
                                                        'bg-green-100 text-green-700 ring-green-400'
                                                    }`}>
                                                        {alertGuidance.predictedStatus === 'red' ? '🔴' : alertGuidance.predictedStatus === 'orange' ? '🟠' : '🟢'}
                                                        {alertGuidance.predictedStatus.toUpperCase()}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Accumulation preview */}
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Current accumulated stroke:</span>
                                                <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{alertGuidance.currentAccum.toLocaleString()}</span>
                                            </div>
                                            {data.output_qty && (
                                                <div className="flex justify-between">
                                                    <span>Accumulated stroke after input:</span>
                                                    <span className={`font-mono font-medium ${
                                                        alertGuidance.predictedStatus === 'red' ? 'text-red-600' :
                                                        alertGuidance.predictedStatus === 'orange' ? 'text-orange-600' :
                                                        'text-green-600'
                                                    }`}>{alertGuidance.effectiveAccum.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>Standard Stroke:</span>
                                                <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{alertGuidance.standardStroke.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Orange threshold (std - lot):</span>
                                                <span className="font-mono font-medium text-orange-600">{alertGuidance.orangeThreshold.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Threshold guidance */}
                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <div className={`rounded-lg p-2.5 ${
                                                alertGuidance.predictedStatus === 'orange' || alertGuidance.predictedStatus === 'red'
                                                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200'
                                                    : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600'
                                            }`}>
                                                <div className="text-xs text-gray-500 mb-1">🟠 Towards ORANGE</div>
                                                {alertGuidance.currentStatus === 'orange' || alertGuidance.currentStatus === 'red' ? (
                                                    <div className="text-xs font-medium text-orange-600">Already passed</div>
                                                ) : (
                                                    <>
                                                        <div className="text-sm font-bold text-orange-600">
                                                            Output ≥ {alertGuidance.outputToOrange.toLocaleString()}
                                                        </div>
                                                        {alertGuidance.remainingToOrange > 0 && data.output_qty && (
                                                            <div className="text-xs text-gray-400 mt-0.5">
                                                                {alertGuidance.remainingToOrange.toLocaleString()} strokes remaining
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <div className={`rounded-lg p-2.5 ${
                                                alertGuidance.predictedStatus === 'red'
                                                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200'
                                                    : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600'
                                            }`}>
                                                <div className="text-xs text-gray-500 mb-1">🔴 Towards RED</div>
                                                {alertGuidance.currentStatus === 'red' ? (
                                                    <div className="text-xs font-medium text-red-600">Already passed</div>
                                                ) : (
                                                    <>
                                                        <div className="text-sm font-bold text-red-600">
                                                            Output ≥ {alertGuidance.outputToRed.toLocaleString()}
                                                        </div>
                                                        {alertGuidance.remainingToRed > 0 && data.output_qty && (
                                                            <div className="text-xs text-gray-400 mt-0.5">
                                                                {alertGuidance.remainingToRed.toLocaleString()} strokes remaining
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Warning if status will change */}
                                        {alertGuidance.statusChanged && (
                                            <div className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                                                alertGuidance.predictedStatus === 'red'
                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                                    : alertGuidance.predictedStatus === 'orange'
                                                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                                                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                            }`}>
                                                <span className="mt-0.5">⚠️</span>
                                                <span>
                                                    {alertGuidance.predictedStatus === 'red'
                                                        ? 'With this output, the die will change to RED status! PPM must be performed immediately.'
                                                        : alertGuidance.predictedStatus === 'orange'
                                                        ? 'With this output, the die will change to ORANGE status. Schedule PPM soon.'
                                                        : 'With this output, the die will return to GREEN status.'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : '💾 Save Production Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
