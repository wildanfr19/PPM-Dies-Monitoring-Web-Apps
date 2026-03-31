import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ auth, repair }) {
    const [workPerformed, setWorkPerformed] = useState('');
    const [partsReplaced, setPartsReplaced] = useState('');
    const [findings, setFindings] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [actualHours, setActualHours] = useState('');
    const [pic, setPic] = useState('');
    const [showCompleteForm, setShowCompleteForm] = useState(false);

    const isAdmin = auth.user.role === 'admin';
    const isMtnDies = auth.user.role === 'mtn_dies';
    const canManage = isAdmin || isMtnDies;

    const handleStartRepair = () => {
        router.post(route('special-repair.start', repair.encrypted_id), { pic });
    };

    const handleComplete = (e) => {
        e.preventDefault();
        router.post(route('special-repair.complete', repair.encrypted_id), {
            work_performed: workPerformed,
            parts_replaced: partsReplaced,
            findings,
            recommendations,
            actual_hours: actualHours || null,
        });
    };

    const statusColors = {
        approved: 'bg-blue-100 text-blue-800 border-blue-300',
        in_progress: 'bg-orange-100 text-orange-800 border-orange-300',
        completed: 'bg-green-100 text-green-800 border-green-300',
        cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    const timelineSteps = [
        { label: 'Created', date: repair.requested_at, done: true },
        { label: 'Started', date: repair.started_at, done: !!repair.started_at },
        { label: 'Completed', date: repair.completed_at, done: !!repair.completed_at },
    ];

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    <i className="fas fa-tools mr-2"></i> Special Repair - {repair.die?.part_number}
                </h2>
            }
        >
            <Head title={`Special Repair - ${repair.die?.part_number}`} />

            <div className="py-6 px-6 max-w-5xl mx-auto space-y-6">
                {/* Status Banner */}
                <div className={`rounded-lg border-2 p-4 ${statusColors[repair.status] || 'bg-gray-100'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">{repair.repair_type_label}</h3>
                            <p className="text-sm">{repair.status_label}</p>
                        </div>
                        <div className="text-right">
                            <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full border ${statusColors[repair.status]}`}>
                                {repair.priority}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timeline Progress */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h4 className="font-semibold text-gray-700 mb-4">Repair Timeline</h4>
                    <div className="flex items-center justify-between">
                        {timelineSteps.map((step, idx) => (
                            <div key={idx} className="flex-1 text-center relative">
                                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${
                                    step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {step.done ? '✓' : idx + 1}
                                </div>
                                <p className="text-xs mt-1 font-medium">{step.label}</p>
                                <p className="text-xs text-gray-400">{step.date || '-'}</p>
                                {idx < timelineSteps.length - 1 && (
                                    <div className={`absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5 ${
                                        step.done ? 'bg-green-500' : 'bg-gray-200'
                                    }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Die Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h4 className="font-semibold text-gray-700 mb-3">
                            <i className="fas fa-info-circle text-blue-500 mr-1"></i> Die Information
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Part Number</span><Link href={route('dies.show', repair.die?.encrypted_id)} className="text-blue-600 font-medium">{repair.die?.part_number}</Link></div>
                            <div className="flex justify-between"><span className="text-gray-500">Part Name</span><span>{repair.die?.part_name}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{repair.die?.customer?.code}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Tonnage</span><span>{repair.die?.tonnage}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Location</span><span>{repair.die?.location || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Accumulation</span><span>{repair.die?.accumulation_stroke?.toLocaleString()}</span></div>
                        </div>
                    </div>

                    {/* Repair Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h4 className="font-semibold text-gray-700 mb-3">
                            <i className="fas fa-wrench text-orange-500 mr-1"></i> Repair Details
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Requested By</span><span>{repair.requested_by}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">PIC</span><span>{repair.pic || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">PPM Interrupted</span><span>{repair.is_ppm_interrupted ? 'Yes' : 'No'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Previous Status</span><span>{repair.previous_ppm_status || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Estimated Hours</span><span>{repair.estimated_hours || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Actual Hours</span><span>{repair.actual_hours || repair.duration_hours || '-'}</span></div>
                            {repair.delivery_deadline && (
                                <div className="flex justify-between"><span className="text-gray-500">Delivery Deadline</span><span className="text-red-600 font-medium">{repair.delivery_deadline}</span></div>
                            )}
                            {repair.customer_po && (
                                <div className="flex justify-between"><span className="text-gray-500">Customer PO</span><span>{repair.customer_po}</span></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reason & Description */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h4 className="font-semibold text-gray-700 mb-3">Reason & Description</h4>
                    <div className="space-y-3 text-sm">
                        <div>
                            <label className="text-xs text-gray-500 font-medium uppercase">Reason</label>
                            <p className="mt-1">{repair.reason}</p>
                        </div>
                        {repair.description && (
                            <div>
                                <label className="text-xs text-gray-500 font-medium uppercase">Description</label>
                                <p className="mt-1">{repair.description}</p>
                            </div>
                        )}
                        {repair.work_performed && (
                            <div>
                                <label className="text-xs text-gray-500 font-medium uppercase">Work Performed</label>
                                <p className="mt-1">{repair.work_performed}</p>
                            </div>
                        )}
                        {repair.findings && (
                            <div>
                                <label className="text-xs text-gray-500 font-medium uppercase">Findings</label>
                                <p className="mt-1">{repair.findings}</p>
                            </div>
                        )}
                        {repair.notes && (
                            <div>
                                <label className="text-xs text-gray-500 font-medium uppercase">Notes</label>
                                <p className="mt-1">{repair.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                {canManage && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Actions</h4>

                        {repair.status === 'approved' && (
                            <div className="flex items-end gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">PIC</label>
                                    <input type="text" value={pic} onChange={e => setPic(e.target.value)} placeholder="Person in charge" className="rounded-md border-gray-300 text-sm" />
                                </div>
                                <button onClick={handleStartRepair} className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700">
                                    <i className="fas fa-play mr-1"></i> Start Repair
                                </button>
                            </div>
                        )}

                        {repair.status === 'in_progress' && (
                            <button onClick={() => setShowCompleteForm(!showCompleteForm)} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                                <i className="fas fa-check-double mr-1"></i> Complete Repair
                            </button>
                        )}

                        {/* Complete Form */}
                        {showCompleteForm && repair.status === 'in_progress' && (
                            <form onSubmit={handleComplete} className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Performed *</label>
                                    <textarea value={workPerformed} onChange={e => setWorkPerformed(e.target.value)} rows={3} required className="w-full rounded-md border-gray-300 text-sm" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Parts Replaced</label>
                                        <textarea value={partsReplaced} onChange={e => setPartsReplaced(e.target.value)} rows={2} className="w-full rounded-md border-gray-300 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
                                        <textarea value={findings} onChange={e => setFindings(e.target.value)} rows={2} className="w-full rounded-md border-gray-300 text-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                                        <textarea value={recommendations} onChange={e => setRecommendations(e.target.value)} rows={2} className="w-full rounded-md border-gray-300 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Actual Hours</label>
                                        <input type="number" value={actualHours} onChange={e => setActualHours(e.target.value)} min="0" className="w-full rounded-md border-gray-300 text-sm" />
                                    </div>
                                </div>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                                    Confirm Complete
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Back Button */}
                <div className="flex justify-start">
                    <Link href={route('special-repair.index')} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400">
                        <i className="fas fa-arrow-left mr-1"></i> Back to List
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
