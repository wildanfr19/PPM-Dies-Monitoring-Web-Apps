import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({ auth, dies }) {
    const { data, setData, post, processing, errors } = useForm({
        die_id: '',
        repair_type: 'urgent_delivery',
        priority: 'high',
        reason: '',
        description: '',
        pic: '',
        is_urgent_delivery: false,
        delivery_deadline: '',
        customer_po: '',
        estimated_hours: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('special-repair.store'));
    };

    const selectedDie = dies?.find(d => d.id == data.die_id);

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    <i className="fas fa-plus-circle mr-2"></i> New Special Dies Repair Request
                </h2>
            }
        >
            <Head title="New Special Repair" />

            <div className="py-6 px-6 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Die Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Die *</label>
                                <select
                                    value={data.die_id}
                                    onChange={e => setData('die_id', e.target.value)}
                                    className="w-full rounded-md border-gray-300 text-sm"
                                >
                                    <option value="">-- Select Die --</option>
                                    {dies?.map(die => (
                                        <option key={die.id} value={die.id}>
                                            {die.part_number} - {die.part_name} ({die.customer?.code})
                                        </option>
                                    ))}
                                </select>
                                {errors.die_id && <p className="text-red-500 text-xs mt-1">{errors.die_id}</p>}
                            </div>

                            {selectedDie && (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
                                    <p><strong>Location:</strong> {selectedDie.location || 'N/A'}</p>
                                    <p><strong>PPM Status:</strong> {selectedDie.ppm_alert_status || 'Normal'}</p>
                                    <p><strong>Accumulation:</strong> {selectedDie.accumulation_stroke?.toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        {/* Type & Priority */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Repair Type *</label>
                                <select
                                    value={data.repair_type}
                                    onChange={e => {
                                        setData('repair_type', e.target.value);
                                        if (e.target.value === 'urgent_delivery') {
                                            setData('is_urgent_delivery', true);
                                        }
                                    }}
                                    className="w-full rounded-md border-gray-300 text-sm"
                                >
                                    <option value="urgent_delivery">Urgent Delivery (PPM interrupted)</option>
                                    <option value="severe_damage">Severe Damage (Extended repair)</option>
                                    <option value="special_request">Special Request (Other)</option>
                                </select>
                                {errors.repair_type && <p className="text-red-500 text-xs mt-1">{errors.repair_type}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                                <select
                                    value={data.priority}
                                    onChange={e => setData('priority', e.target.value)}
                                    className="w-full rounded-md border-gray-300 text-sm"
                                >
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                                {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
                            </div>
                        </div>

                        {/* Urgent Delivery Fields */}
                        {(data.repair_type === 'urgent_delivery') && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-semibold text-red-700 mb-3">
                                    <i className="fas fa-shipping-fast mr-1"></i> Urgent Delivery Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Deadline *</label>
                                        <input
                                            type="date"
                                            value={data.delivery_deadline}
                                            onChange={e => setData('delivery_deadline', e.target.value)}
                                            className="w-full rounded-md border-gray-300 text-sm"
                                        />
                                        {errors.delivery_deadline && <p className="text-red-500 text-xs mt-1">{errors.delivery_deadline}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer PO</label>
                                        <input
                                            type="text"
                                            value={data.customer_po}
                                            onChange={e => setData('customer_po', e.target.value)}
                                            placeholder="PO Number"
                                            className="w-full rounded-md border-gray-300 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reason & Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                            <textarea
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                                rows={3}
                                placeholder="Why is this special repair needed?"
                                className="w-full rounded-md border-gray-300 text-sm"
                            />
                            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Damage Details)</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={3}
                                placeholder="Detailed description of damage or issue..."
                                className="w-full rounded-md border-gray-300 text-sm"
                            />
                        </div>

                        {/* PIC & Estimated Hours */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PIC (Person in Charge)</label>
                                <input
                                    type="text"
                                    value={data.pic}
                                    onChange={e => setData('pic', e.target.value)}
                                    placeholder="Name of person responsible"
                                    className="w-full rounded-md border-gray-300 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                                <input
                                    type="number"
                                    value={data.estimated_hours}
                                    onChange={e => setData('estimated_hours', e.target.value)}
                                    min="1"
                                    placeholder="Hours"
                                    className="w-full rounded-md border-gray-300 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                rows={2}
                                placeholder="Additional notes..."
                                className="w-full rounded-md border-gray-300 text-sm"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Link href={route('special-repair.index')} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400">
                                Cancel
                            </Link>
                            <button type="submit" disabled={processing} className="px-6 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 disabled:opacity-50">
                                {processing ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
