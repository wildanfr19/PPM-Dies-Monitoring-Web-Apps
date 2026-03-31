import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import StatusBadge from '@/Components/PPM/StatusBadge';
import LotProgress from '@/Components/PPM/LotProgress';
import { PROCESS_TYPES, CHECKLIST_ITEMS, getChecklistItems, getProcessTypeLabel, initializeChecklistResults } from '@/Utils/PpmChecklistData';
import { confirmAction } from '@/Utils/swal';

export default function DieShow({ auth, die }) {
    const [showPpmModal, setShowPpmModal] = useState(false);
    const [showLotDateModal, setShowLotDateModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showStartPpmModal, setShowStartPpmModal] = useState(false);
    const [showCancelScheduleModal, setShowCancelScheduleModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedProcessTypes, setSelectedProcessTypes] = useState([]);
    const [activeProcess, setActiveProcess] = useState(null); // Track which process is being completed

    // Check roles
    const canEditDies = ['admin', 'mtn_dies'].includes(auth.user.role);
    const isPpic = ['admin', 'ppic'].includes(auth.user.role);
    const isProd = ['admin', 'production'].includes(auth.user.role);
    const isMtnDies = ['admin', 'mtn_dies'].includes(auth.user.role);

    // Check if multi-process PPM is active (has processes that are not all completed)
    const hasActiveProcesses = die.die_processes && die.die_processes.length > 0 &&
        !die.ppm_process_progress?.all_completed;

    const { data, setData, post, processing, errors, reset } = useForm({
        ppm_date: new Date().toISOString().split('T')[0],
        pic:  '',
        maintenance_type: 'routine',
        process_type: die.process_type || '',
        checklist_results: die.process_type ? initializeChecklistResults(die.process_type) : [],
        work_performed: '',
        parts_replaced: '',
        findings: '',
        recommendations: '',
        checked_by: '',
        approved_by: '',
    });

    // Determine if Record PPM button should be enabled
    // Die must be transferred to MTN Dies location first
    const canRecordPpm = canEditDies && ['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'].includes(die.ppm_alert_status);

    // Update checklist when process_type changes
    useEffect(() => {
        if (data.process_type) {
            setData('checklist_results', initializeChecklistResults(data.process_type));
        } else {
            setData('checklist_results', []);
        }
    }, [data.process_type]);

    // PPIC: Last LOT Date form
    const lotDateForm = useForm({
        last_lot_date: new Date().toISOString().split('T')[0],
        set_by: auth.user.name,
    });

    // PROD: Transfer Dies form
    const transferForm = useForm({
        from_location: die.location || 'Production',
        to_location: 'MTN Dies',
        transferred_by: auth.user.name,
    });

    // MTN Dies: Cancel Schedule form
    const cancelScheduleForm = useForm({
        reason: '',
    });

    // MTN Dies: Reschedule form
    const rescheduleForm = useForm({
        new_date: '',
        reason: '',
    });

    // MTN Dies: Remark form
    const mtnRemarkForm = useForm({
        mtn_remark: die.mtn_remark || '',
    });

    // PPIC: Remark form
    const ppicRemarkForm = useForm({
        ppic_remark: die.ppic_remark || '',
    });

    const handleRecordPpm = (e) => {
        e.preventDefault();
        if (activeProcess) {
            // Completing a specific process — post to process-complete route
            post(route('dies.process-complete', { process: activeProcess.encrypted_id }), {
                onSuccess: () => {
                    setShowPpmModal(false);
                    setActiveProcess(null);
                    reset();
                },
            });
        } else {
            // Legacy: record PPM without multi-process
            post(route('dies.record-ppm', { die: die.encrypted_id }), {
                onSuccess: () => {
                    setShowPpmModal(false);
                    reset();
                },
            });
        }
    };

    const openProcessCompleteModal = (proc) => {
        setActiveProcess(proc);
        setData({
            ...data,
            ppm_date: new Date().toISOString().split('T')[0],
            pic: auth.user.name,
            maintenance_type: 'routine',
            process_type: proc.process_type,
            checklist_results: initializeChecklistResults(proc.process_type),
            work_performed: '',
            parts_replaced: '',
            findings: '',
            recommendations: '',
            checked_by: '',
            approved_by: '',
        });
        setShowPpmModal(true);
    };

    const handleSetLotDate = (e) => {
        e.preventDefault();
        lotDateForm.post(route('dies.set-last-lot-date', { die: die.encrypted_id }), {
            onSuccess: () => {
                setShowLotDateModal(false);
                lotDateForm.reset();
            },
        });
    };

    const handleTransferDies = (e) => {
        e.preventDefault();
        transferForm.post(route('dies.transfer', { die: die.encrypted_id }), {
            onSuccess: () => {
                setShowTransferModal(false);
                transferForm.reset();
            },
        });
    };

    const handleStartPpmWithProcesses = (e) => {
        e.preventDefault();
        router.post(route('dies.start-ppm', { die: die.encrypted_id }), {
            process_types: selectedProcessTypes,
        }, {
            onSuccess: () => {
                setShowStartPpmModal(false);
                setSelectedProcessTypes([]);
            },
        });
    };

    const toggleProcessType = (value) => {
        setSelectedProcessTypes(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    const handleCancelSchedule = (e) => {
        e.preventDefault();
        cancelScheduleForm.post(route('dies.cancel-schedule', { die: die.encrypted_id }), {
            onSuccess: () => {
                setShowCancelScheduleModal(false);
                cancelScheduleForm.reset();
            },
        });
    };

    const handleReschedule = (e) => {
        e.preventDefault();
        rescheduleForm.post(route('dies.reschedule', { die: die.encrypted_id }), {
            onSuccess: () => {
                setShowRescheduleModal(false);
                rescheduleForm.reset();
            },
        });
    };

    const handleUpdateMtnRemark = (e) => {
        e.preventDefault();
        mtnRemarkForm.post(route('dies.mtn-remark', { die: die.encrypted_id }));
    };

    const handleUpdatePpicRemark = (e) => {
        e.preventDefault();
        ppicRemarkForm.post(route('dies.ppic-remark', { die: die.encrypted_id }));
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
                            {die.is_4lot_check && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                    4-Lot Check
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {canEditDies && !hasActiveProcesses && (
                            <>
                                <Link
                                    href={route('dies.edit', { die: die.encrypted_id })}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300"
                                >
                                    ✏️ Edit
                                </Link>
                                <button
                                    onClick={() => setShowPpmModal(true)}
                                    disabled={!canRecordPpm}
                                    className={`px-4 py-2 rounded-lg transition ${
                                        canRecordPpm
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    title={!canRecordPpm ? 'Die must be transferred to MTN Dies location first' : 'Record PPM inspection'}
                                >
                                    📝 Record PPM
                                </button>
                            </>
                        )}
                        {/* PPIC: Set Last LOT Date */}
                        {isPpic && ['orange', 'red'].includes(die.ppm_status) && !['transferred_to_mtn', 'ppm_in_progress', 'additional_repair', 'ppm_completed'].includes(die.ppm_alert_status) && (
                            <button
                                onClick={() => setShowLotDateModal(true)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                📅 Set Last LOT Date
                            </button>
                        )}
                        {/* PPIC: Confirm PPM Schedule */}
                        {isPpic && die.ppm_scheduled_date && !['schedule_approved', 'red_alerted', 'transferred_to_mtn', 'ppm_in_progress', 'additional_repair', 'ppm_completed'].includes(die.ppm_alert_status) && (
                            <button
                                onClick={async () => {
                                    const ok = await confirmAction({
                                        title: 'Confirm PPM Schedule?',
                                        text: `Confirm PPM schedule for die ${die.part_number}?`,
                                        icon: 'question',
                                        confirmText: '✅ Yes, Confirm',
                                        confirmColor: '#0891b2',
                                    });
                                    if (ok) router.post(route('dies.approve-schedule', { die: die.encrypted_id }));
                                }}
                                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
                            >
                                ✅ Confirm PPM Schedule
                            </button>
                        )}
                        {/* PROD: Transfer Dies to MTN */}
                        {isProd && die.ppm_status === 'red' && !['transferred_to_mtn', 'ppm_in_progress', 'additional_repair', 'ppm_completed'].includes(die.ppm_alert_status) && (
                            <button
                                onClick={() => setShowTransferModal(true)}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                            >
                                🚚 Transfer to MTN Dies
                            </button>
                        )}
                        {/* MTN Dies: Cancel Schedule */}
                        {isMtnDies && die.ppm_scheduled_date && ['ppm_scheduled', 'schedule_approved'].includes(die.ppm_alert_status) && (
                            <button
                                onClick={() => setShowCancelScheduleModal(true)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                ❌ Cancel Schedule
                            </button>
                        )}
                        {/* MTN Dies: Reschedule */}
                        {isMtnDies && die.ppm_scheduled_date && ['ppm_scheduled', 'schedule_approved'].includes(die.ppm_alert_status) && (
                            <button
                                onClick={() => setShowRescheduleModal(true)}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                            >
                                🔄 Reschedule PPM
                            </button>
                        )}
                        {/* MTN Dies: Start PPM Processing */}
                        {isMtnDies && die.ppm_alert_status === 'transferred_to_mtn' && (
                            <button
                                onClick={() => setShowStartPpmModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                ▶️ Start PPM Processing
                            </button>
                        )}
                        {/* MTN Dies: Additional Repair */}
                        {isMtnDies && die.ppm_alert_status === 'ppm_in_progress' && (
                            <button
                                onClick={async () => {
                                    const ok = await confirmAction({
                                        title: 'Needs Additional Repair?',
                                        text: `Mark die ${die.part_number} as needing additional repair. PPM will resume after repair is completed.`,
                                        icon: 'warning',
                                        confirmText: '🔧 Yes, Needs Repair',
                                        confirmColor: '#d97706',
                                    });
                                    if (ok) router.post(route('dies.additional-repair', { die: die.encrypted_id }));
                                }}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                            >
                                🔧 Additional Repair
                            </button>
                        )}
                        {/* MTN Dies: Resume PPM */}
                        {isMtnDies && die.ppm_alert_status === 'additional_repair' && (
                            <button
                                onClick={async () => {
                                    const ok = await confirmAction({
                                        title: 'Resume PPM Process?',
                                        text: `Continue PPM process for die ${die.part_number} after additional repair is completed.`,
                                        icon: 'question',
                                        confirmText: '▶️ Yes, Resume',
                                        confirmColor: '#2563eb',
                                    });
                                    if (ok) router.post(route('dies.resume-ppm', { die: die.encrypted_id }));
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                ▶️ Resume PPM
                            </button>
                        )}
                        {/* MTN Dies: Transfer Back to Production */}
                        {isMtnDies && die.ppm_alert_status === 'ppm_completed' && (
                            <button
                                onClick={async () => {
                                    const ok = await confirmAction({
                                        title: 'Transfer Back to Production?',
                                        text: `Transfer die ${die.part_number} back to Production. The PPM cycle will be completed and the stroke counter will be reset.`,
                                        icon: 'question',
                                        confirmText: '🏭 Yes, Transfer Back',
                                        confirmColor: '#16a34a',
                                    });
                                    if (ok) router.post(route('dies.transfer-back', { die: die.encrypted_id }));
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                🏭 Transfer Back to Production
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg: grid-cols-3 gap-6">

                    {/* Info banner when Record PPM is disabled */}
                    {canEditDies && !canRecordPpm && die.ppm_status === 'red' && !['ppm_completed'].includes(die.ppm_alert_status) && (
                        <div className="lg:col-span-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                                        Record PPM cannot be performed yet
                                    </p>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        Die must be transferred to <strong>MTN Dies</strong> location by <strong>Production</strong> first.
                                    </p>
                                    {!die.ppm_alert_status && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">📦 Status: Waiting for transfer process from Production</p>
                                    )}
                                    {die.ppm_alert_status === 'red_alerted' && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">🔴 Status: Red Alert sent — waiting for Production to transfer die</p>
                                    )}
                                    {die.ppm_alert_status === 'schedule_approved' && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">✅ Status: PPM schedule approved — waiting for Production to transfer die</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
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
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Last Stroke</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">{die.last_stroke ? die.last_stroke.toLocaleString() : '-'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* PPM Flow Status Card - only show when PPM flow is active */}
                        {die.ppm_alert_status && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    📋 PPM Flow Status
                                </h3>
                                <div className="space-y-3">
                                    {/* Current Alert Status */}
                                    <div className={`p-3 rounded-lg border ${
                                        die.ppm_alert_status === 'orange_alerted' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' :
                                        die.ppm_alert_status === 'red_alerted' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                                        die.ppm_alert_status === 'lot_date_set' ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' :
                                        die.ppm_alert_status === 'transferred_to_mtn' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' :
                                        die.ppm_alert_status === 'ppm_scheduled' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                                        die.ppm_alert_status === 'schedule_approved' ? 'bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800' :
                                        die.ppm_alert_status === 'ppm_in_progress' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                                        die.ppm_alert_status === 'additional_repair' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' :
                                        die.ppm_alert_status === 'ppm_completed' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                                        'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                    }`}>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {die.ppm_alert_status_label}
                                        </p>
                                    </div>

                                    {/* PPIC: Last LOT Date Info */}
                                    {die.last_lot_date && (
                                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase mb-1">
                                                📅 PPIC - Last Date of LOT
                                            </p>
                                            <p className="text-sm font-bold text-purple-900 dark:text-purple-100">{die.last_lot_date}</p>
                                            {die.last_lot_date_set_by && (
                                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Set by: {die.last_lot_date_set_by}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* MTN Dies: PPM Scheduled Info */}
                                    {die.ppm_scheduled_date && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase mb-1">
                                                🗓️ MTN Dies - PPM Schedule
                                            </p>
                                            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                                Scheduled: {die.ppm_scheduled_date}
                                            </p>
                                            {die.ppm_scheduled_by && (
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                    PIC: {die.ppm_scheduled_by}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* PPIC: Schedule Approved Info */}
                                    {die.schedule_approved_at && (
                                        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                                            <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase mb-1">
                                                ✅ PPIC - Schedule Approved
                                            </p>
                                            <p className="text-sm font-bold text-cyan-900 dark:text-cyan-100">
                                                Approved: {die.schedule_approved_at}
                                            </p>
                                            {die.schedule_approved_by && (
                                                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                                                    By: {die.schedule_approved_by}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* PROD: Transfer Dies to MTN Info */}
                                    {die.transferred_at && (
                                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                            <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase mb-1">
                                                🚚 PROD - Transfer Dies to MTN Dies
                                            </p>
                                            <p className="text-sm text-orange-900 dark:text-orange-100">
                                                <span className="font-medium">{die.transfer_from_location}</span>
                                                <span className="mx-2">→</span>
                                                <span className="font-bold">{die.transfer_to_location}</span>
                                            </p>
                                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                                {die.transferred_by && <>By: {die.transferred_by} | </>}Date: {die.transferred_at}
                                            </p>
                                        </div>
                                    )}

                                    {/* MTN Dies: Start PPM Processing Info */}
                                    {die.ppm_started_at && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase mb-1">
                                                ▶️ MTN Dies - Start PPM Processing
                                            </p>
                                            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                                Started: {die.ppm_started_at}
                                            </p>
                                        </div>
                                    )}

                                    {/* MTN Dies: PPM Completed Info */}
                                    {die.ppm_finished_at && (
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase mb-1">
                                                ✅ MTN Dies - PPM Completed
                                            </p>
                                            <p className="text-sm font-bold text-green-900 dark:text-green-100">
                                                Completed: {die.ppm_finished_at}
                                            </p>
                                            {die.ppm_total_days !== null && die.ppm_total_days !== undefined && (
                                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                    Total: {die.ppm_total_days} working days (since RED alert)
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Schedule Cancelled Info */}
                                    {die.schedule_cancelled_at && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase mb-1">
                                                ❌ Schedule Cancelled
                                            </p>
                                            <p className="text-sm text-red-900 dark:text-red-100">
                                                {die.schedule_cancelled_at}
                                                {die.schedule_cancelled_by && <span className="ml-1">by {die.schedule_cancelled_by}</span>}
                                            </p>
                                            {die.schedule_change_reason && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                    Reason: {die.schedule_change_reason}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Schedule Remark */}
                                    {die.schedule_remark && (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                                                📝 Schedule Remark
                                            </p>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{die.schedule_remark}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Multi-Process PPM Progress Card */}
                        {die.die_processes && die.die_processes.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    ⚙️ PPM Process Progress
                                </h3>

                                {/* Progress Summary */}
                                {die.ppm_process_progress && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {die.ppm_process_progress.completed}/{die.ppm_process_progress.total} processes completed
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {die.ppm_process_progress.percentage}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all ${
                                                    die.ppm_process_progress.all_completed ? 'bg-green-500' : 'bg-blue-500'
                                                }`}
                                                style={{ width: `${die.ppm_process_progress.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Process List */}
                                <div className="space-y-2">
                                    {die.die_processes.map((proc) => (
                                        <div key={proc.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                                            proc.ppm_status === 'completed' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                                            proc.ppm_status === 'in_progress' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                                            'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    proc.ppm_status === 'completed' ? 'bg-green-500 text-white' :
                                                    proc.ppm_status === 'in_progress' ? 'bg-blue-500 text-white' :
                                                    'bg-gray-300 text-gray-600 dark:bg-gray-500 dark:text-gray-200'
                                                }`}>{proc.process_order}</span>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{proc.process_label}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {proc.ppm_status === 'completed' && proc.ppm_completed_at && `Completed: ${proc.ppm_completed_at}`}
                                                        {proc.ppm_status === 'in_progress' && proc.ppm_started_at && `Started: ${proc.ppm_started_at}`}
                                                        {proc.ppm_status === 'pending' && 'Pending'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    proc.ppm_status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    proc.ppm_status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                                }`}>{proc.status_label}</span>
                                                {/* Action buttons for MTN Dies */}
                                                {isMtnDies && proc.ppm_status === 'pending' && ['ppm_in_progress', 'additional_repair'].includes(die.ppm_alert_status) && (
                                                    <button
                                                        onClick={async () => {
                                                            const ok = await confirmAction({
                                                                title: 'Start Process?',
                                                                text: `Start process "${proc.process_label}" for die ${die.part_number}?`,
                                                                icon: 'question',
                                                                confirmText: '▶️ Yes, Start',
                                                                confirmColor: '#2563eb',
                                                            });
                                                            if (ok) router.post(route('dies.process-start', { process: proc.encrypted_id }));
                                                        }}
                                                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                                                    >
                                                        ▶️ Start
                                                    </button>
                                                )}
                                                {isMtnDies && proc.ppm_status === 'in_progress' && (
                                                    <button
                                                        onClick={() => openProcessCompleteModal(proc)}
                                                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                                                    >
                                                        📝 Complete & Record
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* MTN Dies Remark */}
                        {(isMtnDies || die.mtn_remark) && die.ppm_alert_status && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    🔧 MTN Dies Remark
                                </h3>
                                {isMtnDies ? (
                                    <form onSubmit={handleUpdateMtnRemark} className="space-y-3">
                                        <textarea
                                            value={mtnRemarkForm.data.mtn_remark}
                                            onChange={(e) => mtnRemarkForm.setData('mtn_remark', e.target.value)}
                                            rows="3"
                                            placeholder="Notes from MTN Dies..."
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={mtnRemarkForm.processing}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                        >
                                            {mtnRemarkForm.processing ? 'Saving...' : '💾 Save Remark'}
                                        </button>
                                    </form>
                                ) : die.mtn_remark ? (
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{die.mtn_remark}</p>
                                ) : null}
                            </div>
                        )}

                        {/* PPIC Remark */}
                        {(isPpic || die.ppic_remark) && die.ppm_alert_status && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    📋 PPIC Remark
                                </h3>
                                {isPpic ? (
                                    <form onSubmit={handleUpdatePpicRemark} className="space-y-3">
                                        <textarea
                                            value={ppicRemarkForm.data.ppic_remark}
                                            onChange={(e) => ppicRemarkForm.setData('ppic_remark', e.target.value)}
                                            rows="3"
                                            placeholder="Notes from PPIC..."
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={ppicRemarkForm.processing}
                                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                                        >
                                            {ppicRemarkForm.processing ? 'Saving...' : '💾 Save Remark'}
                                        </button>
                                    </form>
                                ) : die.ppic_remark ? (
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{die.ppic_remark}</p>
                                ) : null}
                            </div>
                        )}
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
                                    {die.is_4lot_check && (
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                                            🔄 4-Lot Check — Accumulation reset after PPM
                                        </p>
                                    )}
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

                        {/* PPM Conditions Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                🎯 PPM Trigger Conditions
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Condition 1: Standard Stroke */}
                                <div className={`rounded-lg p-4 border-2 ${
                                    die.ppm_conditions_info?.condition_1?.is_active
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                                }`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                            die.ppm_conditions_info?.condition_1?.is_active
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                        }`}>1</span>
                                        <div>
                                            <h4 className={`font-semibold ${
                                                die.ppm_conditions_info?.condition_1?.is_active
                                                    ? 'text-blue-700 dark:text-blue-300'
                                                    : 'text-gray-600 dark:text-gray-400'
                                            }`}>Standard Stroke (RED ALERT)</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                PPM when reaching standard stroke limit
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Target</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {die.ppm_conditions_info?.condition_1?.target?.toLocaleString()} strokes
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Current</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {die.accumulation_stroke?.toLocaleString()} strokes
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {die.ppm_conditions_info?.condition_1?.remaining?.toLocaleString()} strokes
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Progress</span>
                                                <span className={`font-semibold ${
                                                    die.ppm_conditions_info?.condition_1?.percentage >= 100 ? 'text-red-600' :
                                                    die.ppm_conditions_info?.condition_1?.percentage >= 75 ? 'text-orange-600' : 'text-blue-600'
                                                }`}>{die.ppm_conditions_info?.condition_1?.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${
                                                        die.ppm_conditions_info?.condition_1?.percentage >= 100 ? 'bg-red-500' :
                                                        die.ppm_conditions_info?.condition_1?.percentage >= 75 ? 'bg-orange-500' : 'bg-blue-500'
                                                    }`}
                                                    style={{ width: `${Math.min(die.ppm_conditions_info?.condition_1?.percentage || 0, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {die.ppm_conditions_info?.condition_1?.is_active && (
                                        <div className="mt-3 text-xs text-center text-blue-600 dark:text-blue-400 font-medium bg-blue-100 dark:bg-blue-900/30 rounded py-1">
                                            ⚡ Active - This is the final PPM checkpoint
                                        </div>
                                    )}
                                </div>

                                {/* Condition 2: Warning Threshold (Orange) */}
                                <div className={`rounded-lg p-4 border-2 ${
                                    die.ppm_conditions_info?.condition_2?.is_active
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                                }`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                            die.ppm_conditions_info?.condition_2?.is_active
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                        }`}>2</span>
                                        <div>
                                            <h4 className={`font-semibold ${
                                                die.ppm_conditions_info?.condition_2?.is_active
                                                    ? 'text-orange-700 dark:text-orange-300'
                                                    : 'text-gray-600 dark:text-gray-400'
                                            }`}>Warning Threshold (ORANGE ALERT)</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Orange alert at standard stroke - lot size
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Threshold</span>
                                            <span className="font-semibold text-orange-700 dark:text-orange-300">
                                                {die.ppm_conditions_info?.condition_2?.target?.toLocaleString()} strokes
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Formula</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {die.standard_stroke?.toLocaleString()} - {die.lot_size?.toLocaleString()} = {die.ppm_conditions_info?.condition_2?.target?.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Current</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {die.accumulation_stroke?.toLocaleString()} strokes
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Remaining to Warning</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {die.ppm_conditions_info?.condition_2?.remaining?.toLocaleString()} strokes
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Progress to Warning</span>
                                                <span className={`font-semibold ${
                                                    die.ppm_conditions_info?.condition_2?.percentage >= 100 ? 'text-orange-600' : 'text-gray-600'
                                                }`}>{die.ppm_conditions_info?.condition_2?.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${
                                                        die.ppm_conditions_info?.condition_2?.percentage >= 100 ? 'bg-orange-500' : 'bg-gray-400'
                                                    }`}
                                                    style={{ width: `${Math.min(die.ppm_conditions_info?.condition_2?.percentage || 0, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {die.ppm_conditions_info?.condition_2?.is_active && (
                                        <div className="mt-3 text-xs text-center text-orange-600 dark:text-orange-400 font-medium bg-orange-100 dark:bg-orange-900/30 rounded py-1">
                                            ⚠️ Warning threshold reached!
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PPM Completed Info */}
                            {die.ppm_count > 0 && (
                                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-green-700 dark:text-green-300 font-semibold text-sm">
                                        ✅ PPM Completed: {die.ppm_count}x
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        Last PPM recorded at {(die.stroke_at_last_ppm || 0).toLocaleString()} strokes
                                    </p>
                                </div>
                            )}
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
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Process</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Checklist</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {die.ppmHistories.map((history) => (
                                                <tr key={history.id}>
                                                    <td className="px-3 py-2 text-sm">{history.ppm_date}</td>
                                                    <td className="px-3 py-2 text-sm">{history.stroke_at_ppm?. toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-sm">{history. pic}</td>
                                                    <td className="px-3 py-2 text-sm">
                                                        {history.process_type ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                                                {getProcessTypeLabel(history.process_type)}
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm capitalize">{history.maintenance_type}</td>
                                                    <td className="px-3 py-2 text-sm">
                                                        {history.checklist_results && history.checklist_results.length > 0 ? (
                                                            <span className="text-xs">
                                                                <span className="text-green-600">✓ {history.checklist_results.filter(c => c.result === 'normal').length}</span>
                                                                {' / '}
                                                                <span className="text-red-600">✗ {history.checklist_results.filter(c => c.result === 'unusual').length}</span>
                                                            </span>
                                                        ) : '-'}
                                                    </td>
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

            {/* PPM Modal with Process-Specific Inspection Checklist */}
            {showPpmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        {activeProcess
                                            ? `📝 INSPECTION CHECK — ${activeProcess.process_label}`
                                            : '📝 INSPECTION CHECK PPM DIES'
                                        }
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {die.part_number} — {die.part_name}
                                        {activeProcess && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Process {activeProcess.process_order} of {die.die_processes?.length}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setShowPpmModal(false); setActiveProcess(null); }}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Die Info Header - mirrors the paper form */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">PART NAME:</span>
                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{die.part_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">PM ID:</span>
                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">PPM-{(die.ppm_count || 0) + 1}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">PART No.:</span>
                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{die.part_number}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">DIES No.:</span>
                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{die.qty_die}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">MODEL:</span>
                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{die.machineModel?.code}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">CUSTOMER:</span>
                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{die.customer?.code}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">TOTAL STROKE:</span>
                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{die.accumulation_stroke?.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">STANDARD:</span>
                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{die.standard_stroke?.toLocaleString()} STROKE</span>
                                </div>
                            </div>

                            <form onSubmit={handleRecordPpm} className="space-y-4">
                                {/* Basic Info Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            PPM Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={data.ppm_date}
                                            onChange={(e) => setData('ppm_date', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                            required
                                        />
                                        {errors.ppm_date && <p className="text-red-500 text-xs mt-1">{errors.ppm_date}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            PIC *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.pic}
                                            onChange={(e) => setData('pic', e.target.value)}
                                            placeholder="Person In Charge"
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                            required
                                        />
                                        {errors.pic && <p className="text-red-500 text-xs mt-1">{errors.pic}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Maintenance Type *
                                        </label>
                                        <select
                                            value={data.maintenance_type}
                                            onChange={(e) => setData('maintenance_type', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                        >
                                            <option value="routine">Routine</option>
                                            <option value="repair">Repair</option>
                                            <option value="overhaul">Overhaul</option>
                                            <option value="emergency">Emergency</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            PROCESS *
                                        </label>
                                        <select
                                            value={data.process_type}
                                            onChange={(e) => setData('process_type', e.target.value)}
                                            className={`w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm font-semibold ${activeProcess ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                                            required
                                            disabled={!!activeProcess}
                                        >
                                            <option value="">-- Select Process --</option>
                                            {PROCESS_TYPES.map((p) => (
                                                <option key={p.value} value={p.value}>
                                                    {p.label}
                                                </option>
                                            ))}
                                        </select>
                                        {activeProcess && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                🔒 Process type locked — completing: {activeProcess.process_label}
                                            </p>
                                        )}
                                        {errors.process_type && <p className="text-red-500 text-xs mt-1">{errors.process_type}</p>}
                                    </div>
                                </div>

                                {/* Inspection Checklist Table */}
                                {data.process_type && data.checklist_results.length > 0 && (
                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                        <div className="bg-indigo-600 text-white px-4 py-2 flex justify-between items-center">
                                            <h4 className="font-semibold text-sm">
                                                📋 CHECK LIST ITEM — {getProcessTypeLabel(data.process_type)}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded font-medium ${
                                                    data.checklist_results.filter(c => c.result).length === data.checklist_results.length
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-indigo-500 text-white'
                                                }`}>
                                                    {data.checklist_results.filter(c => c.result).length} / {data.checklist_results.length} filled
                                                </span>
                                            </div>
                                        </div>
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-100 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 w-12">No.</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">CHECK LIST ITEM</th>
                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 w-24" colSpan="2">
                                                        Inspection Result
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 w-40">Remark</th>
                                                </tr>
                                                <tr>
                                                    <th></th>
                                                    <th></th>
                                                    <th className="px-2 py-1 text-center text-xs text-gray-500 dark:text-gray-400 w-12">Normal</th>
                                                    <th className="px-2 py-1 text-center text-xs text-gray-500 dark:text-gray-400 w-12">Unusual</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {getChecklistItems(data.process_type).map((item, index) => (
                                                    <tr key={item.no} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}`}>
                                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 text-center align-top">
                                                            {item.no}
                                                        </td>
                                                        <td className="px-3 py-2 align-top">
                                                            <p className="text-sm text-gray-900 dark:text-gray-100">{item.description_en}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">{item.description_id}</p>
                                                        </td>
                                                        <td className="px-2 py-2 text-center align-top">
                                                            <input
                                                                type="radio"
                                                                name={`checklist_${item.no}`}
                                                                checked={data.checklist_results[index]?.result === 'normal'}
                                                                onChange={() => {
                                                                    const updated = [...data.checklist_results];
                                                                    updated[index] = { ...updated[index], result: 'normal' };
                                                                    setData('checklist_results', updated);
                                                                }}
                                                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-2 text-center align-top">
                                                            <input
                                                                type="radio"
                                                                name={`checklist_${item.no}`}
                                                                checked={data.checklist_results[index]?.result === 'unusual'}
                                                                onChange={() => {
                                                                    const updated = [...data.checklist_results];
                                                                    updated[index] = { ...updated[index], result: 'unusual' };
                                                                    setData('checklist_results', updated);
                                                                }}
                                                                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-2 align-top">
                                                            <input
                                                                type="text"
                                                                value={data.checklist_results[index]?.remark || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...data.checklist_results];
                                                                    updated[index] = { ...updated[index], remark: e.target.value };
                                                                    setData('checklist_results', updated);
                                                                }}
                                                                placeholder="..."
                                                                className="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 text-xs py-1 px-2"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* No process selected warning */}
                                {!data.process_type && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            ⚠️ Select a <strong>Process Type</strong> above to display the PPM inspection checklist.
                                        </p>
                                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                            The process type determines which inspection items need to be checked.
                                        </p>
                                    </div>
                                )}

                                {/* Additional Notes Section */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📝 Additional Notes</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Work Performed
                                            </label>
                                            <textarea
                                                value={data.work_performed}
                                                onChange={(e) => setData('work_performed', e.target.value)}
                                                rows="2"
                                                placeholder="Describe the work performed..."
                                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Parts Replaced
                                            </label>
                                            <textarea
                                                value={data.parts_replaced}
                                                onChange={(e) => setData('parts_replaced', e.target.value)}
                                                rows="2"
                                                placeholder="List parts replaced..."
                                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Notes from form: Cleaning Dies Lower & Upper, Check All Bolt Lower & Upper Dies */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Note:</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400"># Cleaning Dies Lower & Upper</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400"># Check All Bolt Lower & Upper Dies</p>
                                </div>

                                {/* Approval Section */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Checked By
                                        </label>
                                        <input
                                            type="text"
                                            value={data.checked_by}
                                            onChange={(e) => setData('checked_by', e.target.value)}
                                            placeholder="e.g., Mr. Kammee"
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Approved By
                                        </label>
                                        <input
                                            type="text"
                                            value={data.approved_by}
                                            onChange={(e) => setData('approved_by', e.target.value)}
                                            placeholder="e.g., Mr. Manop"
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Current Status Info */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <strong>⚠️ Note:</strong> Recording PPM will update the stroke checkpoint. Current stroke: <strong>{die.accumulation_stroke?.toLocaleString()}</strong>
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowPpmModal(false); setActiveProcess(null); }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || !data.process_type || (data.checklist_results.length > 0 && data.checklist_results.some(c => !c.result))}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={(data.checklist_results.length > 0 && data.checklist_results.some(c => !c.result)) ? 'All checklist items must be filled in first' : ''}
                                    >
                                        {processing ? 'Saving...' : activeProcess ? `✓ Complete ${activeProcess.process_label}` : '✓ Record PPM'}
                                    </button>
                                    {data.checklist_results.length > 0 && data.checklist_results.some(c => !c.result) && (
                                        <p className="text-xs text-red-500 mt-1">
                                            ⚠ Complete all checklist items ({data.checklist_results.filter(c => c.result).length}/{data.checklist_results.length}) before submitting
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* PPIC: Set Last LOT Date Modal */}
            {showLotDateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    📅 Set Last Date of LOT
                                </h3>
                                <button
                                    onClick={() => setShowLotDateModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-purple-800 dark:text-purple-200">
                                    <strong>ℹ️ PPIC Action:</strong> Set the estimated last production date for the current LOT of this die.
                                </p>
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                    Die: <strong>{die.part_number}</strong> — Status: <strong className="uppercase">{die.ppm_status}</strong>
                                </p>
                            </div>

                            <form onSubmit={handleSetLotDate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Last LOT Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={lotDateForm.data.last_lot_date}
                                        onChange={(e) => lotDateForm.setData('last_lot_date', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                        required
                                    />
                                    {lotDateForm.errors.last_lot_date && (
                                        <p className="text-red-500 text-xs mt-1">{lotDateForm.errors.last_lot_date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Set By
                                    </label>
                                    <input
                                        type="text"
                                        value={lotDateForm.data.set_by}
                                        onChange={(e) => lotDateForm.setData('set_by', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowLotDateModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={lotDateForm.processing}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                                    >
                                        {lotDateForm.processing ? 'Saving...' : '✓ Set Last LOT Date'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* PROD: Transfer Dies Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    🚚 Transfer Dies to MTN Dies
                                </h3>
                                <button
                                    onClick={() => setShowTransferModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-orange-800 dark:text-orange-200">
                                    <strong>⚠️ PROD Action:</strong> Confirm physical transfer of this die to MTN Dies location for PPM processing.
                                </p>
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                    Die: <strong>{die.part_number}</strong> — Current Location: <strong>{die.location || 'Production'}</strong>
                                </p>
                            </div>

                            <form onSubmit={handleTransferDies} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        From Location
                                    </label>
                                    <input
                                        type="text"
                                        value={transferForm.data.from_location}
                                        onChange={(e) => transferForm.setData('from_location', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        To Location *
                                    </label>
                                    <input
                                        type="text"
                                        value={transferForm.data.to_location}
                                        onChange={(e) => transferForm.setData('to_location', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Transferred By
                                    </label>
                                    <input
                                        type="text"
                                        value={transferForm.data.transferred_by}
                                        onChange={(e) => transferForm.setData('transferred_by', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowTransferModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={transferForm.processing}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                                    >
                                        {transferForm.processing ? 'Processing...' : '✓ Confirm Transfer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MTN Dies: Start PPM with Process Selection Modal */}
            {showStartPpmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    ▶️ Start PPM Processing
                                </h3>
                                <button
                                    onClick={() => setShowStartPpmModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>ℹ️ Info:</strong> This die has <strong>{die.qty_die}</strong> processes (qty die).
                                    Select the processes to perform PPM on. Each process will be tracked separately.
                                </p>
                            </div>

                            <form onSubmit={handleStartPpmWithProcesses} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Select Process Types for PPM:
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PROCESS_TYPES.map((p) => (
                                            <label key={p.value} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition ${
                                                selectedProcessTypes.includes(p.value)
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                                                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProcessTypes.includes(p.value)}
                                                    onChange={() => toggleProcessType(p.value)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {selectedProcessTypes.length > 0 && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                            ✓ {selectedProcessTypes.length} process(es) selected
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowStartPpmModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        ▶️ Start PPM Processing
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MTN Dies: Cancel Schedule Modal */}
            {showCancelScheduleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    ❌ Cancel PPM Schedule
                                </h3>
                                <button
                                    onClick={() => setShowCancelScheduleModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    <strong>⚠️ Warning:</strong> Cancelling PPM schedule for die <strong>{die.part_number}</strong>.
                                    Status will be reverted and will need to be rescheduled.
                                </p>
                            </div>

                            <form onSubmit={handleCancelSchedule} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Cancel Reason *
                                    </label>
                                    <textarea
                                        value={cancelScheduleForm.data.reason}
                                        onChange={(e) => cancelScheduleForm.setData('reason', e.target.value)}
                                        rows="3"
                                        placeholder="Explain the reason for cancelling the PPM schedule..."
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                        required
                                    />
                                    {cancelScheduleForm.errors.reason && (
                                        <p className="text-red-500 text-xs mt-1">{cancelScheduleForm.errors.reason}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCancelScheduleModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={cancelScheduleForm.processing}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                    >
                                        {cancelScheduleForm.processing ? 'Processing...' : '❌ Cancel Schedule'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MTN Dies: Reschedule PPM Modal */}
            {showRescheduleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    🔄 Reschedule PPM
                                </h3>
                                <button
                                    onClick={() => setShowRescheduleModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>ℹ️ Info:</strong> Current PPM schedule: <strong>{die.ppm_scheduled_date}</strong>.
                                    Changing the schedule will require re-approval from PPIC.
                                </p>
                            </div>

                            <form onSubmit={handleReschedule} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        New Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={rescheduleForm.data.new_date}
                                        onChange={(e) => rescheduleForm.setData('new_date', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                        required
                                    />
                                    {rescheduleForm.errors.new_date && (
                                        <p className="text-red-500 text-xs mt-1">{rescheduleForm.errors.new_date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Change Reason *
                                    </label>
                                    <textarea
                                        value={rescheduleForm.data.reason}
                                        onChange={(e) => rescheduleForm.setData('reason', e.target.value)}
                                        rows="3"
                                        placeholder="Explain the reason for rescheduling..."
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                        required
                                    />
                                    {rescheduleForm.errors.reason && (
                                        <p className="text-red-500 text-xs mt-1">{rescheduleForm.errors.reason}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRescheduleModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={rescheduleForm.processing}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                                    >
                                        {rescheduleForm.processing ? 'Processing...' : '🔄 Reschedule'}
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
