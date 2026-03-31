import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import StatusBadge from '@/Components/PPM/StatusBadge';
import LotProgress from '@/Components/PPM/LotProgress';
import { confirmAction, confirmDelete } from '@/Utils/swal';
import { PROCESS_TYPES, getChecklistItems, getProcessTypeLabel, initializeChecklistResults } from '@/Utils/PpmChecklistData';

export default function DiesIndex({ auth, dies, filters, customers, machineModels, lines, lineStats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [customerId, setCustomerId] = useState(filters?.customer_id || '');
    const [modelId, setModelId] = useState(filters?.machine_model_id || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [lineFilter, setLineFilter] = useState(filters?.line || '');
    const [perPage, setPerPage] = useState(dies?.per_page || 15);
    const [viewMode, setViewMode] = useState(localStorage.getItem('dies_view_mode') || 'monitoring');
    const searchTimeout = useRef(null);
    const isFirstRender = useRef(true);

    // Batch selection state
    const [selectedDies, setSelectedDies] = useState([]);
    const [showBatchRecordModal, setShowBatchRecordModal] = useState(false);
    const [showBatchLotDateModal, setShowBatchLotDateModal] = useState(false);
    const [batchLotDateData, setBatchLotDateData] = useState({
        last_lot_date: new Date().toISOString().split('T')[0],
        set_by: '',
    });
    const [batchRecordData, setBatchRecordData] = useState({
        ppm_date: new Date().toISOString().split('T')[0],
        pic: '',
        maintenance_type: 'routine',
        checked_by: '',
        approved_by: '',
    });
    // Per-die data: { [dieId]: { process_type, checklist_results, work_performed, ... } }
    const [dieChecklistData, setDieChecklistData] = useState({});
    // Track which die accordion is expanded
    const [expandedDieId, setExpandedDieId] = useState(null);
    const [batchProcessing, setBatchProcessing] = useState(false);

    // Check if user can edit dies (admin or mtn_dies only)
    const canEditDies = ['admin', 'mtn_dies'].includes(auth.user.role);
    const canBatchAction = ['admin', 'mtn_dies', 'production', 'ppic'].includes(auth.user.role);

    // Build params helper
    const buildParams = useCallback((overrides = {}) => {
        const params = {
            search: search || undefined,
            customer_id: customerId || undefined,
            machine_model_id: modelId || undefined,
            status: status || undefined,
            line: lineFilter || undefined,
            per_page: perPage !== 15 ? perPage : undefined,
            ...overrides,
        };
        // Remove empty/falsy values
        Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key];
        });
        return params;
    }, [search, customerId, modelId, status, lineFilter, perPage]);

    // Persist view mode
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('dies_view_mode', mode);
    };

    // Apply filter with optional overrides (for instant dropdown changes)
    const handleFilter = (overrides = {}) => {
        router.get(route('dies.index'), buildParams(overrides), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Debounced search - auto-search after 400ms of typing
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            handleFilter({ search: search || undefined });
        }, 400);
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [search]);

    // Instant filter when dropdown changes
    const handleCustomerChange = (value) => {
        setCustomerId(value);
        handleFilter({ customer_id: value || undefined });
    };

    const handleModelChange = (value) => {
        setModelId(value);
        handleFilter({ machine_model_id: value || undefined });
    };

    const handleLineChange = (value) => {
        setLineFilter(value);
        handleFilter({ line: value || undefined });
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        handleFilter({ status: value || undefined });
    };

    const handlePerPageChange = (value) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);
        router.get(route('dies.index'), buildParams({ per_page: newPerPage !== 15 ? newPerPage : undefined }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Navigate to specific page
    const goToPage = (url) => {
        if (!url) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearch('');
        setCustomerId('');
        setModelId('');
        setStatus('');
        setLineFilter('');
        setPerPage(15);
        router.get(route('dies.index'));
    };

    // Batch selection helpers
    const diesData = dies?.data || [];
    console.log(diesData) // Debug: check the structure of dies data
    const pagination = dies || {};

    const isAllSelected = diesData.length > 0 && diesData.every(d => selectedDies.includes(d.id));
    const isSomeSelected = selectedDies.length > 0;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedDies([]);
        } else {
            setSelectedDies(diesData.map(d => d.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedDies(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Clear selection when page/filters change
    useEffect(() => {
        setSelectedDies([]);
    }, [dies]);

    // Compute available batch actions based on selected dies' statuses
    const selectedDiesData = useMemo(() =>
        diesData.filter(d => selectedDies.includes(d.id)),
        [diesData, selectedDies]
    );

    const batchActions = useMemo(() => {
        const actions = [];
        if (selectedDiesData.length === 0) return actions;

        const statuses = selectedDiesData.map(d => d.ppm_alert_status);
        const ppmStatuses = selectedDiesData.map(d => d.ppm_status);

        // Transfer to MTN: red_alerted dies (PROD role)
        const transferable = selectedDiesData.filter(d => d.ppm_alert_status === 'red_alerted');
        if (transferable.length > 0 && ['admin', 'production'].includes(auth.user.role)) {
            actions.push({
                key: 'transfer',
                label: `🚚 Transfer to MTN (${transferable.length})`,
                color: 'bg-orange-600 hover:bg-orange-700',
                count: transferable.length,
            });
        }

        // Start PPM: transferred_to_mtn dies (MTN Dies role)
        const startable = selectedDiesData.filter(d => d.ppm_alert_status === 'transferred_to_mtn');
        if (startable.length > 0 && ['admin', 'mtn_dies'].includes(auth.user.role)) {
            actions.push({
                key: 'start-ppm',
                label: `▶️ Start PPM (${startable.length})`,
                color: 'bg-blue-600 hover:bg-blue-700',
                count: startable.length,
            });
        }

        // Record PPM: transferred_to_mtn / ppm_in_progress / additional_repair
        const recordable = selectedDiesData.filter(d =>
            ['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'].includes(d.ppm_alert_status)
        );
        if (recordable.length > 0 && ['admin', 'mtn_dies'].includes(auth.user.role)) {
            actions.push({
                key: 'record-ppm',
                label: `📝 Record PPM (${recordable.length})`,
                color: 'bg-green-600 hover:bg-green-700',
                count: recordable.length,
            });
        }

        // Additional Repair: ppm_in_progress dies (MTN Dies role)
        const repairable = selectedDiesData.filter(d => d.ppm_alert_status === 'ppm_in_progress');
        if (repairable.length > 0 && ['admin', 'mtn_dies'].includes(auth.user.role)) {
            actions.push({
                key: 'additional-repair',
                label: `🔧 Additional Repair (${repairable.length})`,
                color: 'bg-amber-600 hover:bg-amber-700',
                count: repairable.length,
            });
        }

        // Resume PPM: additional_repair dies (MTN Dies role)
        const resumable = selectedDiesData.filter(d => d.ppm_alert_status === 'additional_repair');
        if (resumable.length > 0 && ['admin', 'mtn_dies'].includes(auth.user.role)) {
            actions.push({
                key: 'resume-ppm',
                label: `▶️ Resume PPM (${resumable.length})`,
                color: 'bg-blue-600 hover:bg-blue-700',
                count: resumable.length,
            });
        }

        // Transfer Back: ppm_completed dies (MTN Dies role)
        const returnable = selectedDiesData.filter(d => d.ppm_alert_status === 'ppm_completed');
        if (returnable.length > 0 && ['admin', 'mtn_dies'].includes(auth.user.role)) {
            actions.push({
                key: 'transfer-back',
                label: `🏭 Transfer Back (${returnable.length})`,
                color: 'bg-green-600 hover:bg-green-700',
                count: returnable.length,
            });
        }

        // Set Last LOT Date: orange/red dies not yet transferred (PPIC role)
        const lotDateEligible = selectedDiesData.filter(d =>
            ['orange', 'red'].includes(d.ppm_status) &&
            !['transferred_to_mtn', 'ppm_in_progress', 'additional_repair', 'ppm_completed'].includes(d.ppm_alert_status)
        );
        if (lotDateEligible.length > 0 && ['admin', 'ppic'].includes(auth.user.role)) {
            actions.push({
                key: 'set-last-lot-date',
                label: `📅 Set Last LOT Date (${lotDateEligible.length})`,
                color: 'bg-purple-600 hover:bg-purple-700',
                count: lotDateEligible.length,
            });
        }

        return actions;
    }, [selectedDiesData, auth.user.role]);

    // Execute batch action
    const executeBatchAction = async (actionKey) => {
        if (batchProcessing) return;

        const getEligibleIds = (key) => {
            switch (key) {
                case 'transfer':
                    return selectedDiesData.filter(d => d.ppm_alert_status === 'red_alerted').map(d => d.id);
                case 'start-ppm':
                    return selectedDiesData.filter(d => d.ppm_alert_status === 'transferred_to_mtn').map(d => d.id);
                case 'additional-repair':
                    return selectedDiesData.filter(d => d.ppm_alert_status === 'ppm_in_progress').map(d => d.id);
                case 'resume-ppm':
                    return selectedDiesData.filter(d => d.ppm_alert_status === 'additional_repair').map(d => d.id);
                case 'transfer-back':
                    return selectedDiesData.filter(d => d.ppm_alert_status === 'ppm_completed').map(d => d.id);
                case 'record-ppm':
                    return selectedDiesData.filter(d =>
                        ['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'].includes(d.ppm_alert_status)
                    ).map(d => d.id);
                case 'set-last-lot-date':
                    return selectedDiesData.filter(d =>
                        ['orange', 'red'].includes(d.ppm_status) &&
                        !['transferred_to_mtn', 'ppm_in_progress', 'additional_repair', 'ppm_completed'].includes(d.ppm_alert_status)
                    ).map(d => d.id);
                default:
                    return [];
            }
        };

        const eligibleIds = getEligibleIds(actionKey);
        if (eligibleIds.length === 0) return;

        // For Set Last LOT Date, open the LOT date modal
        if (actionKey === 'set-last-lot-date') {
            setBatchLotDateData({
                last_lot_date: new Date().toISOString().split('T')[0],
                set_by: auth.user.name,
            });
            setShowBatchLotDateModal(true);
            return;
        }

        // For Record PPM, initialize per-die data and open modal
        if (actionKey === 'record-ppm') {
            const recordableDies = selectedDiesData.filter(d =>
                ['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'].includes(d.ppm_alert_status)
            );
            // Initialize per-die checklist data
            const initialData = {};
            recordableDies.forEach(d => {
                const processType = d.process_type || '';
                initialData[d.id] = {
                    process_type: processType,
                    checklist_results: processType ? initializeChecklistResults(processType) : [],
                    work_performed: '',
                    parts_replaced: '',
                    findings: '',
                    recommendations: '',
                };
            });
            setDieChecklistData(initialData);
            setExpandedDieId(recordableDies[0]?.id || null);
            setShowBatchRecordModal(true);
            return;
        }

        const actionLabels = {
            'transfer': 'Transfer to MTN Dies',
            'start-ppm': 'Start PPM Processing',
            'additional-repair': 'Additional Repair',
            'resume-ppm': 'Resume PPM',
            'transfer-back': 'Transfer Back to Production',
        };

        const routeMap = {
            'transfer': 'dies.batch-transfer',
            'start-ppm': 'dies.batch-start-ppm',
            'additional-repair': 'dies.batch-additional-repair',
            'resume-ppm': 'dies.batch-resume-ppm',
            'transfer-back': 'dies.batch-transfer-back',
        };

        const ok = await confirmAction({
            title: `Batch ${actionLabels[actionKey]}?`,
            text: `This will perform "${actionLabels[actionKey]}" for ${eligibleIds.length} die at once. Continue?`,
            icon: 'question',
            confirmText: `Yes, Process ${eligibleIds.length} Die`,
            confirmColor: '#2563eb',
        });

        if (!ok) return;

        setBatchProcessing(true);
        router.post(route(routeMap[actionKey]), {
            die_ids: eligibleIds,
            transferred_by: auth.user.name,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                setBatchProcessing(false);
                setSelectedDies([]);
            },
        });
    };

    // Helper: update per-die checklist data
    const updateDieData = (dieId, field, value) => {
        setDieChecklistData(prev => ({
            ...prev,
            [dieId]: { ...prev[dieId], [field]: value },
        }));
    };

    // Helper: update process type and reinitialize checklist
    const updateDieProcessType = (dieId, processType) => {
        setDieChecklistData(prev => ({
            ...prev,
            [dieId]: {
                ...prev[dieId],
                process_type: processType,
                checklist_results: processType ? initializeChecklistResults(processType) : [],
            },
        }));
    };

    // Helper: update a single checklist item
    const updateChecklistItem = (dieId, index, field, value) => {
        setDieChecklistData(prev => {
            const updated = [...(prev[dieId]?.checklist_results || [])];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, [dieId]: { ...prev[dieId], checklist_results: updated } };
        });
    };

    // Check if all checklists are filled for all dies
    const allChecklistsFilled = useMemo(() => {
        return Object.entries(dieChecklistData).every(([, data]) => {
            if (!data.process_type) return false;
            return data.checklist_results.length > 0 && data.checklist_results.every(c => c.result);
        });
    }, [dieChecklistData]);

    // Handle batch Set Last LOT Date submit
    const handleBatchSetLastLotDate = () => {
        const eligibleIds = selectedDiesData.filter(d =>
            ['orange', 'red'].includes(d.ppm_status) &&
            !['transferred_to_mtn', 'ppm_in_progress', 'additional_repair', 'ppm_completed'].includes(d.ppm_alert_status)
        ).map(d => d.id);

        if (eligibleIds.length === 0) return;

        setBatchProcessing(true);
        router.post(route('dies.batch-set-last-lot-date'), {
            die_ids: eligibleIds,
            ...batchLotDateData,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                setBatchProcessing(false);
                setSelectedDies([]);
                setShowBatchLotDateModal(false);
            },
        });
    };

    // Reusable pagination component
    const renderPagination = () => (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left: Status legend & info */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex gap-3">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500"></span> OK</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500"></span> Warning</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500"></span> Critical</span>
                    </div>
                    {pagination.last_page > 1 && (
                        <span className="text-gray-400 dark:text-gray-500">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>
                    )}
                </div>

                {/* Right: Pagination buttons */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => goToPage(pagination.first_page_url)}
                            disabled={pagination.current_page === 1}
                            className={`px-2.5 py-1.5 text-sm rounded transition ${
                                pagination.current_page === 1
                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            title="First page"
                        >
                            <i className="fas fa-angle-double-left"></i>
                        </button>
                        <button
                            onClick={() => goToPage(pagination.prev_page_url)}
                            disabled={!pagination.prev_page_url}
                            className={`px-2.5 py-1.5 text-sm rounded transition ${
                                !pagination.prev_page_url
                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            title="Previous page"
                        >
                            <i className="fas fa-angle-left"></i>
                        </button>
                        {pagination.links?.slice(1, -1).map((link, index) => (
                            <button
                                key={index}
                                onClick={() => goToPage(link.url)}
                                disabled={!link.url || link.active}
                                className={`min-w-[32px] px-2.5 py-1.5 text-sm rounded transition ${
                                    link.active
                                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                        : link.url
                                            ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            : 'text-gray-400 dark:text-gray-500 cursor-default'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                        <button
                            onClick={() => goToPage(pagination.next_page_url)}
                            disabled={!pagination.next_page_url}
                            className={`px-2.5 py-1.5 text-sm rounded transition ${
                                !pagination.next_page_url
                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            title="Next page"
                        >
                            <i className="fas fa-angle-right"></i>
                        </button>
                        <button
                            onClick={() => goToPage(pagination.last_page_url)}
                            disabled={pagination.current_page === pagination.last_page}
                            className={`px-2.5 py-1.5 text-sm rounded transition ${
                                pagination.current_page === pagination.last_page
                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            title="Last page"
                        >
                            <i className="fas fa-angle-double-right"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // Handle batch Record PPM submit
    const handleBatchRecordPpm = () => {
        const eligibleIds = selectedDiesData
            .filter(d => ['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'].includes(d.ppm_alert_status))
            .map(d => d.id);

        if (eligibleIds.length === 0) return;

        setBatchProcessing(true);
        router.post(route('dies.batch-record-ppm'), {
            die_ids: eligibleIds,
            ppm_date: batchRecordData.ppm_date,
            pic: batchRecordData.pic,
            maintenance_type: batchRecordData.maintenance_type,
            checked_by: batchRecordData.checked_by,
            approved_by: batchRecordData.approved_by,
            die_data: dieChecklistData,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                setBatchProcessing(false);
                setSelectedDies([]);
                setShowBatchRecordModal(false);
                setDieChecklistData({});
                setBatchRecordData({
                    ppm_date: new Date().toISOString().split('T')[0],
                    pic: '',
                    maintenance_type: 'routine',
                    checked_by: '',
                    approved_by: '',
                });
            },
        });
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dies Monitoring List
                </h2>
            }
        >
            <Head title="Dies List" />

            <div className="py-6 px-6 space-y-4">

                {/* Header Actions + View Mode Toggle */}
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Manage and monitor all dies preventive maintenance
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle */}
                        <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-100 dark:bg-gray-700">
                            <button
                                onClick={() => handleViewModeChange('monitoring')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                    viewMode === 'monitoring'
                                        ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                                title="PPM Monitoring view with lot progress & conditions"
                            >
                                <i className="fas fa-heartbeat mr-1.5"></i>
                                Monitoring
                            </button>
                            <button
                                onClick={() => handleViewModeChange('master')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                    viewMode === 'master'
                                        ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                                title="Master data view - compact table like spreadsheet"
                            >
                                <i className="fas fa-table mr-1.5"></i>
                                Master Data
                            </button>
                        </div>
                        {canEditDies && (
                            <Link
                                href={route('dies.create')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                            >
                                <i className="fas fa-plus"></i> Add Die
                            </Link>
                        )}
                    </div>
                </div>

                {/* Line Filter Tabs */}
                {lines && lines.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => handleLineChange('')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all border ${
                                !lineFilter
                                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                            }`}
                        >
                            All Lines
                            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                                !lineFilter ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                                {Object.values(lineStats || {}).reduce((a, b) => a + b, 0)}
                            </span>
                        </button>
                        {lines.map((line) => (
                            <button
                                key={line}
                                onClick={() => handleLineChange(line)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all border ${
                                    lineFilter === line
                                        ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                            >
                                {line}
                                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                                    lineFilter === line ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                    {lineStats?.[line] || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg p-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-search text-gray-400 text-sm"></i>
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Type to search part number or name..."
                                    className="w-full pl-9 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                                {search && (
                                    <button
                                        onClick={() => { setSearch(''); handleFilter({ search: undefined }); }}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <i className="fas fa-times text-sm"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="w-44">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Customer
                            </label>
                            <select
                                value={customerId}
                                onChange={(e) => handleCustomerChange(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Customers</option>
                                {customers?.map((c) => (
                                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-44">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Model
                            </label>
                            <select
                                value={modelId}
                                onChange={(e) => handleModelChange(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Models</option>
                                {machineModels?.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.code} ({m.tonnage_standard?.tonnage})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-36">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Status</option>
                                <option value="green">🟢 Green (OK)</option>
                                <option value="orange">🟠 Orange (Warning)</option>
                                <option value="red">🔴 Red (Critical)</option>
                                <option value="ppm">🔧 PPM Process</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-1.5 text-sm"
                            >
                                <i className="fas fa-redo text-xs"></i> Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dies Table — MONITORING VIEW */}
                {viewMode === 'monitoring' && (
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                    {/* DataTable Header - Per Page & Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>Show</span>
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(e.target.value)}
                                className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 text-sm py-1 px-2 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={200}>200</option>
                            </select>
                            <span>entries</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {pagination.total > 0 ? (
                                <span>
                                    Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{pagination.from}</span> to{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{pagination.to}</span> of{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{pagination.total}</span> entries
                                </span>
                            ) : (
                                <span>No entries</span>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {canBatchAction && (
                                        <th className="px-3 py-3 text-center w-10">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                                            />
                                        </th>
                                    )}
                                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">
                                        No
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Part Number
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Part Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Line
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Model / Tonnage
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Lot Progress
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        PPM Condition
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Last PPM
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Last Stroke
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {diesData && diesData.length > 0 ?  (
                                    diesData.map((die, index) => (
                                        <tr key={die.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition ${selectedDies.includes(die.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                            {canBatchAction && (
                                                <td className="px-3 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDies.includes(die.id)}
                                                        onChange={() => toggleSelect(die.id)}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                                {(pagination.from || 0) + index}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Link
                                                    href={route('dies.show', { die: die.encrypted_id })}
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                                >
                                                    {die.part_number}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900 dark:text-gray-100 max-w-[200px] truncate" title={die.part_name}>
                                                    {die.part_name}
                                                    {die.is_4lot_check && (
                                                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" title="4-Lot Check: Reset after PPM">
                                                            4LC
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {die.line || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {die.customer}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {die.model}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400 ml-1 text-xs">
                                                        ({die.tonnage})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 min-w-[250px]">
                                                <LotProgress
                                                    lots={die.lot_progress || []}
                                                    percentage={die.stroke_percentage || 0}
                                                    accumulationStroke={die.accumulation_stroke || 0}
                                                    standardStroke={die.standard_stroke || 0}
                                                />
                                            </td>
                                            <td className="px-4 py-3 min-w-[200px]">
                                                <div className="space-y-1.5">
                                                    {/* Condition 1: Standard Stroke */}
                                                    <div className={`flex items-center gap-2 text-xs ${
                                                        die.ppm_conditions_info?.condition_1?.is_active
                                                            ? 'text-blue-700 dark:text-blue-400 font-semibold'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                            die.ppm_conditions_info?.condition_1?.is_active
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                        }`}>1</span>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <span title="Kondisi 1: PPM berdasarkan batas Standard Stroke">Std Stroke</span>
                                                                <span>{die.ppm_conditions_info?.condition_1?.target?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-0.5">
                                                                <div
                                                                    className={`h-1 rounded-full ${
                                                                        die.ppm_conditions_info?.condition_1?.percentage >= 100 ? 'bg-red-500' :
                                                                        die.ppm_conditions_info?.condition_1?.percentage >= 75 ? 'bg-orange-500' : 'bg-blue-500'
                                                                    }`}
                                                                    style={{ width: `${Math.min(die.ppm_conditions_info?.condition_1?.percentage || 0, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Condition 2: 4-Lot Checkpoint */}
                                                    <div className={`flex items-center gap-2 text-xs ${
                                                        die.ppm_conditions_info?.condition_2?.is_active
                                                            ? 'text-purple-700 dark:text-purple-400 font-semibold'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                            die.ppm_conditions_info?.condition_2?.is_active
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                        }`}>2</span>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <span title="Kondisi 2: PPM berdasarkan setiap kelipatan 4 lot produksi">PPM #{(die.ppm_count || 0) + 1}</span>
                                                                <span>{die.ppm_conditions_info?.condition_2?.target?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-0.5">
                                                                <div
                                                                    className={`h-1 rounded-full ${
                                                                        die.ppm_conditions_info?.condition_2?.percentage >= 100 ? 'bg-red-500' :
                                                                        die.ppm_conditions_info?.condition_2?.percentage >= 75 ? 'bg-orange-500' : 'bg-purple-500'
                                                                    }`}
                                                                    style={{ width: `${Math.min(die.ppm_conditions_info?.condition_2?.percentage || 0, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Active Trigger Indicator */}
                                                    {die.ppm_trigger_condition?.type === 'both' && (
                                                        <div className="text-[10px] text-center text-orange-600 dark:text-orange-400 font-medium">
                                                            ⚡ Final PPM (Both conditions)
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <StatusBadge
                                                    status={die.ppm_status}
                                                    label={die.ppm_status_label}
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {die.last_ppm_date || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {die.last_stroke != null ? die.last_stroke.toLocaleString() : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('dies.show', { die: die.encrypted_id })}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                        <span className="hidden sm:inline">Details</span>
                                                    </Link>
                                                    {canEditDies && (
                                                        <Link
                                                            href={route('dies.edit', { die: die.encrypted_id })}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-md hover:bg-yellow-100 transition dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </Link>
                                                    )}
                                                    {canEditDies && (
                                                        <button
                                                            onClick={async () => {
                                                                const ok = await confirmDelete(die.part_number);
                                                                if (ok) router.delete(route('dies.destroy', { die: die.encrypted_id }));
                                                            }}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                            <span className="hidden sm:inline">Delete</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={canBatchAction ? 12 : 11} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <i className="fas fa-box-open text-4xl text-gray-400 mb-2"></i>
                                                <p className="text-gray-500 dark:text-gray-400">No dies found</p>
                                                {canEditDies && (
                                                    <Link
                                                        href={route('dies.create')}
                                                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Add your first die →
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* DataTable Footer - Pagination */}
                    {renderPagination()}
                </div>
                )}

                {/* Dies Table — MASTER DATA VIEW */}
                {viewMode === 'master' && (
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                    {/* DataTable Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>Show</span>
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(e.target.value)}
                                className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 text-sm py-1 px-2 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={200}>200</option>
                            </select>
                            <span>entries</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {pagination.total > 0 ? (
                                <span>
                                    Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{pagination.from}</span> to{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{pagination.to}</span> of{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{pagination.total}</span> entries
                                </span>
                            ) : (
                                <span>No entries</span>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-[#3C5B2E] text-white">
                                <tr>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider w-12">
                                        No
                                    </th>
                                    <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                                        Part Number
                                    </th>
                                    <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                                        Part Name
                                    </th>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">
                                        Line
                                    </th>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">
                                        Model
                                    </th>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">
                                        Lot Size
                                    </th>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">
                                        Last PPM Dies
                                    </th>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">
                                        Last Stroke
                                    </th>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">
                                        PPM Standard
                                    </th>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider w-20">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {diesData && diesData.length > 0 ? (
                                diesData.map((die, index) => (
                                    <tr key={die.id} className={`transition text-sm ${
                                        index % 2 === 0
                                            ? 'bg-white dark:bg-gray-800'
                                            : 'bg-gray-50 dark:bg-gray-750'
                                    } hover:bg-blue-50 dark:hover:bg-gray-700`}>
                                        <td className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {(pagination.from || 0) + index}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <Link
                                                href={route('dies.show', { die: die.encrypted_id })}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                            >
                                                {die.part_number}
                                            </Link>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="text-sm text-gray-900 dark:text-gray-100" title={die.part_name}>
                                                {die.part_name}
                                                {die.is_4lot_check && (
                                                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" title="4-Lot Check: Reset after PPM">
                                                        4LC
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                {die.line || '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center text-sm text-gray-700 dark:text-gray-300">
                                            {die.model || '-'}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                {die.customer}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {die.lot_size?.toLocaleString() || '-'}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {die.last_ppm_date || '-'}
                                            </span>
                                        </td>
                                          <td className="px-3 py-2 text-center">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {die.last_stroke != null ? die.last_stroke.toLocaleString() : '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {die.standard_stroke?.toLocaleString() || '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <StatusBadge
                                                status={die.ppm_status}
                                                label={die.ppm_status_label}
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link
                                                    href={route('dies.show', { die: die.encrypted_id })}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition dark:hover:bg-blue-900/30"
                                                    title="Detail"
                                                >
                                                    <i className="fas fa-eye text-xs"></i>
                                                </Link>
                                                {canEditDies && (
                                                    <Link
                                                        href={route('dies.edit', { die: die.encrypted_id })}
                                                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition dark:hover:bg-yellow-900/30"
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-edit text-xs"></i>
                                                    </Link>
                                                )}
                                                {canEditDies && (
                                                    <button
                                                        onClick={async () => {
                                                            const ok = await confirmDelete(die.part_number);
                                                            if (ok) router.delete(route('dies.destroy', { die: die.encrypted_id }));
                                                        }}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition dark:hover:bg-red-900/30"
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={11} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <i className="fas fa-box-open text-4xl text-gray-400 mb-2"></i>
                                            <p className="text-gray-500 dark:text-gray-400">No dies found</p>
                                            {canEditDies && (
                                                <Link
                                                    href={route('dies.create')}
                                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    Add your first die →
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* DataTable Footer - Pagination */}
                    {renderPagination()}
                </div>
                )}
            </div>

            {/* Floating Batch Action Toolbar */}
            {isSomeSelected && batchActions.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-gray-900 dark:bg-gray-700 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 border border-gray-700 dark:border-gray-600">
                        <div className="flex items-center gap-2 pr-4 border-r border-gray-600">
                            <span className="bg-blue-600 text-white text-sm font-bold px-2.5 py-1 rounded-full">
                                {selectedDies.length}
                            </span>
                            <span className="text-sm text-gray-300">die selected</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {batchActions.map((action) => (
                                <button
                                    key={action.key}
                                    onClick={() => executeBatchAction(action.key)}
                                    disabled={batchProcessing}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
                                >
                                    {batchProcessing ? (
                                        <><i className="fas fa-spinner fa-spin mr-1"></i> Processing...</>
                                    ) : (
                                        action.label
                                    )}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setSelectedDies([])}
                            className="ml-2 text-gray-400 hover:text-white transition p-1"
                            title="Deselect"
                        >
                            <i className="fas fa-times text-lg"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Batch Set Last LOT Date Modal */}
            {showBatchLotDateModal && (() => {
                const eligibleDies = selectedDiesData.filter(d =>
                    ['orange', 'red'].includes(d.ppm_status) &&
                    !['transferred_to_mtn', 'ppm_in_progress', 'additional_repair', 'ppm_completed'].includes(d.ppm_alert_status)
                );
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                            <div className="bg-purple-600 text-white px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold">📅 Batch Set Last LOT Date</h3>
                                <button onClick={() => setShowBatchLotDateModal(false)} className="text-white/80 hover:text-white">
                                    <i className="fas fa-times text-lg"></i>
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                                    <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">
                                        {eligibleDies.length} die will have Last LOT Date set:
                                    </p>
                                    <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                                        {eligibleDies.map(d => (
                                            <div key={d.id} className="text-xs text-purple-700 dark:text-purple-400 flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${d.ppm_status === 'red' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                                                <span className="font-mono">{d.part_number}</span>
                                                <span className="text-purple-500">— {d.part_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last LOT Date</label>
                                    <input
                                        type="date"
                                        value={batchLotDateData.last_lot_date}
                                        onChange={e => setBatchLotDateData(prev => ({ ...prev, last_lot_date: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Set By</label>
                                    <input
                                        type="text"
                                        value={batchLotDateData.set_by}
                                        onChange={e => setBatchLotDateData(prev => ({ ...prev, set_by: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                        placeholder="Setter's Name"
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-end gap-3 border-t dark:border-gray-600">
                                <button
                                    onClick={() => setShowBatchLotDateModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBatchSetLastLotDate}
                                    disabled={batchProcessing || !batchLotDateData.last_lot_date}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {batchProcessing ? (
                                        <><i className="fas fa-spinner fa-spin mr-1"></i> Processing...</>
                                    ) : (
                                        `Set LOT Date for ${eligibleDies.length} Die`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Batch Record PPM Modal — WIZARD / TAB-BASED per-Die */}
            {showBatchRecordModal && (() => {
                const recordableDies = selectedDiesData.filter(d =>
                    ['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'].includes(d.ppm_alert_status)
                );
                // Dies that are selected but not eligible for Record PPM
                const skippedDies = selectedDiesData.filter(d =>
                    !['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'].includes(d.ppm_alert_status)
                );
                const activeDie = recordableDies.find(d => d.id === expandedDieId) || recordableDies[0];
                const activeDieData = dieChecklistData[activeDie?.id] || {};
                const activeChecklistItems = getChecklistItems(activeDieData.process_type);
                const activeFilledCount = (activeDieData.checklist_results || []).filter(c => c.result).length;
                const activeTotalCount = (activeDieData.checklist_results || []).length;
                const activeIsComplete = activeDieData.process_type && activeTotalCount > 0 && activeFilledCount === activeTotalCount;
                const activeIndex = recordableDies.findIndex(d => d.id === activeDie?.id);

                // Count completed dies
                const completedDiesCount = recordableDies.filter(d => {
                    const dd = dieChecklistData[d.id] || {};
                    const tc = (dd.checklist_results || []).length;
                    const fc = (dd.checklist_results || []).filter(c => c.result).length;
                    return dd.process_type && tc > 0 && fc === tc;
                }).length;

                const goToDie = (dieId) => setExpandedDieId(dieId);
                const goNext = () => {
                    if (activeIndex < recordableDies.length - 1) {
                        setExpandedDieId(recordableDies[activeIndex + 1].id);
                    }
                };
                const goPrev = () => {
                    if (activeIndex > 0) {
                        setExpandedDieId(recordableDies[activeIndex - 1].id);
                    }
                };

                return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
                    <div className="fixed inset-0 bg-black bg-opacity-60" onClick={() => setShowBatchRecordModal(false)}></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col z-10">

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-xl">
                            <div className="text-white">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <i className="fas fa-clipboard-check"></i>
                                    INSPECTION CHECK PPM DIES — Batch Record
                                </h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-indigo-100">
                                    <span><i className="fas fa-layer-group mr-1"></i> {recordableDies.length} die selected</span>
                                    <span><i className="fas fa-check-circle mr-1"></i> {completedDiesCount}/{recordableDies.length} completed</span>
                                    <div className="flex-1 max-w-[200px] bg-white/20 rounded-full h-2 overflow-hidden ml-2">
                                        <div
                                            className="h-2 bg-green-400 rounded-full transition-all"
                                            style={{ width: `${recordableDies.length > 0 ? (completedDiesCount / recordableDies.length) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowBatchRecordModal(false)} className="text-white/70 hover:text-white transition p-1">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {/* Info Banner — Skipped dies that need Transfer/Start PPM first */}
                        {skippedDies.length > 0 && (
                            <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 shrink-0">
                                <div className="flex items-start gap-2">
                                    <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
                                    <div className="text-sm">
                                        <p className="font-semibold text-amber-800 dark:text-amber-200">
                                            {skippedDies.length} die cannot be Record PPM at this time:
                                        </p>
                                        <ul className="mt-1 space-y-0.5 text-amber-700 dark:text-amber-300">
                                            {skippedDies.map(die => {
                                                const statusLabels = {
                                                    'red_alerted': 'Needs "Transfer to MTN" and "Start PPM" first',
                                                    'orange_alerted': 'Still Orange Alert — has not reached RED',
                                                    'lot_date_set': 'Last LOT Date set, not yet scheduled for PPM',
                                                    'ppm_scheduled': 'Already scheduled, waiting for schedule approval',
                                                    'schedule_approved': 'Schedule approved, waiting for RED alert',
                                                    'ppm_completed': 'PPM already completed',
                                                };
                                                const reason = die.ppm_alert_status
                                                    ? (statusLabels[die.ppm_alert_status] || `Status: ${die.ppm_alert_status}`)
                                                    : (die.ppm_status === 'red'
                                                        ? 'RED status but not yet in workflow — needs Transfer to MTN'
                                                        : die.ppm_status === 'orange'
                                                            ? 'Still Orange — has not reached RED threshold'
                                                            : 'Not yet in PPM workflow');
                                                return (
                                                    <li key={die.id} className="flex items-center gap-2">
                                                        <span className="font-mono text-xs bg-amber-100 dark:bg-amber-800 px-1.5 py-0.5 rounded">
                                                            {die.part_number}
                                                        </span>
                                                        <span className="text-xs">— {reason}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                        {skippedDies.some(d => d.ppm_alert_status === 'red_alerted' || (!d.ppm_alert_status && d.ppm_status === 'red')) && (
                                            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 italic">
                                                <i className="fas fa-info-circle mr-1"></i>
                                                For RED status dies: perform "Transfer to MTN" → "Start PPM" first before Record PPM.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Body — Sidebar + Content */}
                        <div className="flex flex-1 overflow-hidden">

                            {/* LEFT SIDEBAR — Die list navigation */}
                            <div className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900">
                                <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <i className="fas fa-list mr-1"></i> Daftar Die ({recordableDies.length})
                                    </p>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {recordableDies.map((die, idx) => {
                                        const dd = dieChecklistData[die.id] || {};
                                        const tc = (dd.checklist_results || []).length;
                                        const fc = (dd.checklist_results || []).filter(c => c.result).length;
                                        const isDone = dd.process_type && tc > 0 && fc === tc;
                                        const isActive = die.id === activeDie?.id;
                                        const hasProcess = !!dd.process_type;

                                        return (
                                            <button
                                                key={die.id}
                                                onClick={() => goToDie(die.id)}
                                                className={`w-full text-left px-3 py-2.5 border-b border-gray-100 dark:border-gray-800 transition-all ${
                                                    isActive
                                                        ? 'bg-white dark:bg-gray-800 border-l-4 border-l-indigo-600 shadow-sm'
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-l-transparent'
                                                }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    {/* Status indicator */}
                                                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                                        isDone
                                                            ? 'bg-green-500 text-white'
                                                            : hasProcess
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                                                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                    }`}>
                                                        {isDone ? <i className="fas fa-check text-[10px]"></i> : idx + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-xs font-semibold truncate ${
                                                            isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'
                                                        }`}>
                                                            {die.part_number}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                                            {die.part_name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {hasProcess ? (
                                                                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                                                                    isDone
                                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                                                                }`}>
                                                                    {getProcessTypeLabel(dd.process_type)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-300">
                                                                    No process selected
                                                                </span>
                                                            )}
                                                            {hasProcess && !isDone && (
                                                                <span className="text-[9px] text-gray-400">
                                                                    {fc}/{tc}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Shared Fields — fixed at bottom of sidebar */}
                                <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2 bg-white dark:bg-gray-800">
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <i className="fas fa-cog mr-1"></i> Data Umum
                                    </p>
                                    <div className="space-y-1.5">
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">PPM Date *</label>
                                            <input
                                                type="date"
                                                value={batchRecordData.ppm_date}
                                                onChange={e => setBatchRecordData(prev => ({ ...prev, ppm_date: e.target.value }))}
                                                className="w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-xs py-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">PIC *</label>
                                            <input
                                                type="text"
                                                value={batchRecordData.pic}
                                                onChange={e => setBatchRecordData(prev => ({ ...prev, pic: e.target.value }))}
                                                placeholder="Person In Charge"
                                                className="w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-xs py-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Type *</label>
                                            <select
                                                value={batchRecordData.maintenance_type}
                                                onChange={e => setBatchRecordData(prev => ({ ...prev, maintenance_type: e.target.value }))}
                                                className="w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-xs py-1"
                                            >
                                                <option value="routine">Routine</option>
                                                <option value="repair">Repair</option>
                                                <option value="overhaul">Overhaul</option>
                                                <option value="emergency">Emergency</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Checked By</label>
                                                <input
                                                    type="text"
                                                    value={batchRecordData.checked_by}
                                                    onChange={e => setBatchRecordData(prev => ({ ...prev, checked_by: e.target.value }))}
                                                    placeholder="..."
                                                    className="w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-xs py-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Approved By</label>
                                                <input
                                                    type="text"
                                                    value={batchRecordData.approved_by}
                                                    onChange={e => setBatchRecordData(prev => ({ ...prev, approved_by: e.target.value }))}
                                                    placeholder="..."
                                                    className="w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-xs py-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT CONTENT — Active die form */}
                            {activeDie && (
                            <div className="flex-1 flex flex-col min-w-0">

                                {/* Die Header Bar */}
                                <div className={`px-5 py-3 border-b flex items-center justify-between shrink-0 ${
                                    activeIsComplete
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                            activeIsComplete
                                                ? 'bg-green-500 text-white'
                                                : 'bg-indigo-600 text-white'
                                        }`}>
                                            {activeIsComplete ? <i className="fas fa-check"></i> : activeIndex + 1}
                                        </span>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                {activeDie.part_number}
                                                <span className="font-normal text-gray-500 dark:text-gray-400 ml-2">
                                                    {activeDie.part_name}
                                                </span>
                                            </h4>
                                            <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                <span><i className="fas fa-user mr-1"></i>{activeDie.customer}</span>
                                                <span><i className="fas fa-industry mr-1"></i>{activeDie.model} ({activeDie.tonnage})</span>
                                                <span><i className="fas fa-tachometer-alt mr-1"></i>{activeDie.accumulation_stroke?.toLocaleString()} / {activeDie.standard_stroke?.toLocaleString()}</span>
                                                <span><i className="fas fa-map-marker-alt mr-1"></i>{activeDie.line || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">Die {activeIndex + 1} of {recordableDies.length}</span>
                                        <button
                                            onClick={goPrev}
                                            disabled={activeIndex === 0}
                                            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <i className="fas fa-chevron-left text-sm text-gray-600 dark:text-gray-300"></i>
                                        </button>
                                        <button
                                            onClick={goNext}
                                            disabled={activeIndex === recordableDies.length - 1}
                                            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <i className="fas fa-chevron-right text-sm text-gray-600 dark:text-gray-300"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Die Form Content (scrollable) */}
                                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

                                    {/* Process Type Selector — PROMINENT */}
                                    <div className={`rounded-lg p-4 border-2 ${
                                        activeDieData.process_type
                                            ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20'
                                            : 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                    }`}>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            <i className={`fas ${activeDieData.process_type ? 'fa-check-circle text-indigo-600' : 'fa-exclamation-circle text-red-500'} mr-1`}></i>
                                            STEP 1: Select Process Type for "{activeDie.part_number}"
                                        </label>
                                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                            {PROCESS_TYPES.map((p) => (
                                                <button
                                                    key={p.value}
                                                    onClick={() => updateDieProcessType(activeDie.id, p.value)}
                                                    className={`px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                                                        activeDieData.process_type === p.value
                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                                                    }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                        {!activeDieData.process_type && (
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                                <i className="fas fa-arrow-up mr-1"></i>
                                                Must select a process type above before filling checklist
                                            </p>
                                        )}
                                    </div>

                                    {/* Inspection Checklist Table — STEP 2 */}
                                    {activeDieData.process_type && activeTotalCount > 0 && (
                                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                            <div className="bg-indigo-600 text-white px-4 py-2.5 flex justify-between items-center">
                                                <h5 className="font-bold text-sm flex items-center gap-2">
                                                    <i className="fas fa-clipboard-list"></i>
                                                    STEP 2: Checklist — {getProcessTypeLabel(activeDieData.process_type)}
                                                    <span className="text-indigo-200 font-normal text-xs ml-1">(for {activeDie.part_number})</span>
                                                </h5>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                                    activeFilledCount === activeTotalCount ? 'bg-green-500' : 'bg-indigo-500'
                                                }`}>
                                                    {activeFilledCount}/{activeTotalCount}
                                                </span>
                                            </div>
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                                <thead className="bg-gray-100 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 w-10">No</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">CHECK LIST ITEM</th>
                                                        <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 w-20">Normal</th>
                                                        <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 w-20">Unusual</th>
                                                        <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 w-40">Remark</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {activeChecklistItems.map((item, index) => {
                                                        const itemResult = activeDieData.checklist_results?.[index]?.result;
                                                        return (
                                                            <tr key={item.no} className={`transition ${
                                                                itemResult === 'normal' ? 'bg-green-50/50 dark:bg-green-900/10' :
                                                                itemResult === 'unusual' ? 'bg-red-50/50 dark:bg-red-900/10' :
                                                                index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                                                            }`}>
                                                                <td className="px-3 py-2 text-center font-medium text-gray-900 dark:text-gray-100 text-xs">{item.no}</td>
                                                                <td className="px-3 py-2">
                                                                    <p className="text-xs text-gray-900 dark:text-gray-100">{item.description_en}</p>
                                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">{item.description_id}</p>
                                                                </td>
                                                                <td className="px-2 py-2 text-center">
                                                                    <label className={`inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition border-2 ${
                                                                        itemResult === 'normal'
                                                                            ? 'bg-green-500 border-green-500 text-white'
                                                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-green-400'
                                                                    }`}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`batch_cl_${activeDie.id}_${item.no}`}
                                                                            checked={itemResult === 'normal'}
                                                                            onChange={() => updateChecklistItem(activeDie.id, index, 'result', 'normal')}
                                                                            className="sr-only"
                                                                        />
                                                                        <i className={`fas fa-check text-xs ${itemResult === 'normal' ? '' : 'text-gray-400'}`}></i>
                                                                    </label>
                                                                </td>
                                                                <td className="px-2 py-2 text-center">
                                                                    <label className={`inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition border-2 ${
                                                                        itemResult === 'unusual'
                                                                            ? 'bg-red-500 border-red-500 text-white'
                                                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-red-400'
                                                                    }`}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`batch_cl_${activeDie.id}_${item.no}`}
                                                                            checked={itemResult === 'unusual'}
                                                                            onChange={() => updateChecklistItem(activeDie.id, index, 'result', 'unusual')}
                                                                            className="sr-only"
                                                                        />
                                                                        <i className={`fas fa-times text-xs ${itemResult === 'unusual' ? '' : 'text-gray-400'}`}></i>
                                                                    </label>
                                                                </td>
                                                                <td className="px-2 py-2">
                                                                    <input
                                                                        type="text"
                                                                        value={activeDieData.checklist_results?.[index]?.remark || ''}
                                                                        onChange={(e) => updateChecklistItem(activeDie.id, index, 'remark', e.target.value)}
                                                                        placeholder="..."
                                                                        className="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 text-xs py-1 px-2"
                                                                    />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* No process selected */}
                                    {!activeDieData.process_type && (
                                        <div className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                                            <i className="fas fa-hand-pointer text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Select a <strong>Process Type</strong> above to display the inspection checklist
                                            </p>
                                        </div>
                                    )}

                                    {/* Additional fields per die — STEP 3 */}
                                    {activeDieData.process_type && (
                                        <div className="space-y-3">
                                            <h5 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                <i className="fas fa-pen mr-1"></i> STEP 3: Additional Notes (Optional)
                                            </h5>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Work Performed</label>
                                                    <textarea
                                                        value={activeDieData.work_performed || ''}
                                                        onChange={(e) => updateDieData(activeDie.id, 'work_performed', e.target.value)}
                                                        rows={2}
                                                        placeholder="Work performed..."
                                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Parts Replaced</label>
                                                    <textarea
                                                        value={activeDieData.parts_replaced || ''}
                                                        onChange={(e) => updateDieData(activeDie.id, 'parts_replaced', e.target.value)}
                                                        rows={2}
                                                        placeholder="Parts replaced..."
                                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2">
                                                <p className="text-[10px] text-blue-600 dark:text-blue-400"># Cleaning Dies Lower & Upper</p>
                                                <p className="text-[10px] text-blue-600 dark:text-blue-400"># Check All Bolt Lower & Upper Dies</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Navigation */}
                                <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0 bg-gray-50 dark:bg-gray-900">
                                    <div className="flex items-center gap-3">
                                        {/* Prev/Next die buttons */}
                                        <button
                                            onClick={goPrev}
                                            disabled={activeIndex === 0}
                                            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            <i className="fas fa-arrow-left"></i> Previous Die
                                        </button>
                                        {activeIndex < recordableDies.length - 1 ? (
                                            <button
                                                onClick={goNext}
                                                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1"
                                            >
                                                Next Die <i className="fas fa-arrow-right"></i>
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                <i className="fas fa-flag-checkered mr-1"></i> Last die
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {allChecklistsFilled ? (
                                                <span className="text-green-600 dark:text-green-400 font-medium">
                                                    <i className="fas fa-check-circle mr-1"></i>{completedDiesCount}/{recordableDies.length} checklist complete
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 dark:text-amber-400">
                                                    <i className="fas fa-exclamation-triangle mr-1"></i>{completedDiesCount}/{recordableDies.length} complete
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowBatchRecordModal(false)}
                                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300 text-xs"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleBatchRecordPpm}
                                            disabled={batchProcessing || !batchRecordData.pic || !batchRecordData.ppm_date || !allChecklistsFilled}
                                            className="px-5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-semibold"
                                        >
                                            {batchProcessing ? (
                                                <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                                            ) : (
                                                <><i className="fas fa-check-double"></i> Record PPM ({recordableDies.length} die)</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
                );
            })()}

        </AppLayout>
    );
}
