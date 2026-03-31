import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function ImportIndex({ auth, importLogs = [] }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('production');
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultTab, setResultTab] = useState('success'); // 'success' or 'failed'
    const [selectedLog, setSelectedLog] = useState(null);
    const [showLogDetailModal, setShowLogDetailModal] = useState(false);

    // Auto-open modal when importResult is available
    useEffect(() => {
        if (flash?.importResult) {
            setShowResultModal(true);
            setResultTab('success');
        }
    }, [flash?.importResult]);

    const productionForm = useForm({
        file: null,
    });

    const diesForm = useForm({
        file: null,
    });

    const ppmScheduleForm = useForm({
        file: null,
        year: new Date().getFullYear(),
    });

    const handleProductionSubmit = (e) => {
        e.preventDefault();
        productionForm.post(route('import.production'), {
            forceFormData: true,
        });
    };

    const handleDiesSubmit = (e) => {
        e.preventDefault();
        diesForm.post(route('import.dies'), {
            forceFormData: true,
        });
    };

    const handlePpmScheduleSubmit = (e) => {
        e.preventDefault();
        ppmScheduleForm.post(route('import.ppm-schedule'), {
            forceFormData: true,
        });
    };

    // Sample data for preview
    const sampleDies = [
        {
            no: 1,
            partNumber: '71142-I6000',
            partName: 'REINF-FR PILLAR OTR LWR,RH',
            model: 'KS B',
            totalDie: 4,
            accStroke: 1500,
            lastStroke: 804,
            forecast: [1847, 1822, 1585, 909, 1788, 1131, 2028, 2543, 1848, 2444, 760, 0],
        },
        {
            no:  2,
            partNumber:  '65122-I6000',
            partName: 'PNL CTR FLOOR SIDE,RH',
            model: 'KS B',
            totalDie: 4,
            accStroke: 2075,
            lastStroke: 1467,
            forecast: [1847, 1822, 1585, 909, 1788, 1131, 2028, 2543, 1848, 2444, 760, 0],
        },
    ];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Import / Export Data
                </h2>
            }
        >
            <Head title="Import Data" />

            <div className="py-6 px-6">
                <div className="max-w-12xl mx-auto space-y-6">

                    {/* Flash Messages */}
                    {flash?.success && !flash?.importResult && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative flex items-center gap-2">
                            <i className="fas fa-check-circle text-xl"></i>
                            <span className="block sm:inline">{flash.success}</span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center gap-2">
                            <i className="fas fa-times-circle text-xl"></i>
                            <span className="block sm:inline">{flash.error}</span>
                        </div>
                    )}

                    {/* Import Result Summary Banner */}
                    {flash?.importResult && (
                        <div
                            className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded-lg relative flex items-center justify-between cursor-pointer hover:bg-blue-100 transition"
                            onClick={() => setShowResultModal(true)}
                        >
                            <div className="flex items-center gap-3">
                                <i className="fas fa-info-circle text-xl"></i>
                                <span>
                                    Import completed — <strong className="text-green-700">{flash.importResult.imported} successful</strong>,{' '}
                                    {flash.importResult.type === 'production' && (flash.importResult.accumulated_count || 0) > 0 && (
                                        <><strong className="text-yellow-600">{flash.importResult.accumulated_count} accumulated</strong>,{' '}</>
                                    )}
                                    <strong className="text-red-600">{flash.importResult.skipped_count} skipped</strong>.
                                    Click to view details.
                                </span>
                            </div>
                            <i className="fas fa-chevron-right"></i>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="flex -mb-px">
                                <button
                                    onClick={() => setActiveTab('production')}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                                        activeTab === 'production'
                                            ?  'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover: text-gray-700 hover: border-gray-300'
                                    }`}
                                >
                                    <i className="fas fa-cogs"></i> Production Log (Act_Prod)
                                </button>
                                <button
                                    onClick={() => setActiveTab('dies')}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                                        activeTab === 'dies'
                                            ?  'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover: text-gray-700 hover: border-gray-300'
                                    }`}
                                >
                                    <i className="fas fa-wrench"></i> Dies Master
                                </button>
                                <button
                                    onClick={() => setActiveTab('schedule')}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                                        activeTab === 'schedule'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <i className="fas fa-calendar-alt"></i> PPM Schedule Template
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                                        activeTab === 'history'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <i className="fas fa-history"></i> Import History
                                </button>
                            </nav>
                        </div>

                        <div className="p-6">
                            {/* ==================== Production Log Import ==================== */}
                            {activeTab === 'production' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <i className="fas fa-file-upload text-blue-500"></i> Import Production Result (Act_Prod)
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Import daily production data from Excel file.  Output will be added to die's stroke count.
                                            </p>
                                        </div>
                                        <a
                                            href={route('import.template.production')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <i className="fas fa-download"></i> Download Template
                                        </a>
                                    </div>

                                    {/* Template Preview */}
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-hidden">
                                        <h4 className="font-medium text-gray-900 dark: text-gray-100 mb-3 flex items-center gap-2">
                                            <i className="fas fa-clipboard-list text-gray-600"></i> Template Format Preview:
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="text-xs min-w-full">
                                                <thead>
                                                    <tr className="bg-green-700 text-white">
                                                        <th className="px-2 py-2 border border-green-600 text-left">No</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Date</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Shift</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Part Number</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Part Name</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Model</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Customer</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Line</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Qty Die</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Running Process</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Start</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Finish</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Total (hr)</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Total (min)</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Break Time</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left font-bold bg-green-800">Total Output</th>
                                                        <th className="px-2 py-2 border border-green-600 text-left">Month</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800">
                                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-2 py-1. 5 border text-center">1</td>
                                                        <td className="px-2 py-1.5 border">20-Jan-25</td>
                                                        <td className="px-2 py-1.5 border text-center">1</td>
                                                        <td className="px-2 py-1.5 border font-medium text-blue-600">5240B908/909</td>
                                                        <td className="px-2 py-1.5 border">BRACE DASH SIDE RH</td>
                                                        <td className="px-2 py-1.5 border">4L45W</td>
                                                        <td className="px-2 py-1.5 border">ATS</td>
                                                        <td className="px-2 py-1.5 border">800T</td>
                                                        <td className="px-2 py-1.5 border text-center">3</td>
                                                        <td className="px-2 py-1.5 border">Auto</td>
                                                        <td className="px-2 py-1.5 border">16:18</td>
                                                        <td className="px-2 py-1.5 border">17:45</td>
                                                        <td className="px-2 py-1.5 border">1:27</td>
                                                        <td className="px-2 py-1.5 border">87</td>
                                                        <td className="px-2 py-1.5 border">15</td>
                                                        <td className="px-2 py-1.5 border text-center font-bold text-green-600 bg-green-50">600</td>
                                                        <td className="px-2 py-1.5 border">Jan</td>
                                                    </tr>
                                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-2 py-1.5 border text-center">2</td>
                                                        <td className="px-2 py-1.5 border">20-Jan-25</td>
                                                        <td className="px-2 py-1.5 border text-center">1</td>
                                                        <td className="px-2 py-1.5 border font-medium text-blue-600">71362-I6000</td>
                                                        <td className="px-2 py-1.5 border">REINF CTR PLR OTR UPR,RH</td>
                                                        <td className="px-2 py-1.5 border">KS</td>
                                                        <td className="px-2 py-1.5 border">HMMI</td>
                                                        <td className="px-2 py-1.5 border">1200T</td>
                                                        <td className="px-2 py-1.5 border text-center">4</td>
                                                        <td className="px-2 py-1.5 border">Auto</td>
                                                        <td className="px-2 py-1.5 border">10:00</td>
                                                        <td className="px-2 py-1.5 border">11:44</td>
                                                        <td className="px-2 py-1.5 border">1:44</td>
                                                        <td className="px-2 py-1.5 border">104</td>
                                                        <td className="px-2 py-1.5 border">10</td>
                                                        <td className="px-2 py-1.5 border text-center font-bold text-green-600 bg-green-50">752</td>
                                                        <td className="px-2 py-1.5 border">Jan</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Upload Form */}
                                    <form onSubmit={handleProductionSubmit} className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                            <div className="space-y-2">
                                                <div className="text-4xl">📁</div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Select Excel File (. xlsx, .xls, .csv)
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".xlsx,.xls,.csv"
                                                    onChange={(e) => productionForm.setData('file', e.target.files[0])}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                                />
                                                {productionForm.data. file && (
                                                    <p className="text-sm text-green-600 mt-2">
                                                        ✓ Selected:  {productionForm.data.file.name}
                                                    </p>
                                                )}
                                                {productionForm.errors.file && (
                                                    <p className="text-red-500 text-xs mt-1">{productionForm. errors.file}</p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={productionForm.processing || !productionForm.data.file}
                                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        >
                                            {productionForm.processing ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Importing...
                                                </span>
                                            ) : '📤 Import Production Data'}
                                        </button>
                                    </form>

                                    {/* Info */}
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark: border-yellow-800 rounded-lg p-4">
                                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                                            <span>⚠️</span> Important Notes:
                                        </h4>
                                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 list-disc list-inside space-y-1">
                                            <li><strong>Part Number</strong> must already exist in Dies Master</li>
                                            <li><strong>Total Output</strong> will be added to Die's accumulation stroke automatically</li>
                                            <li>Date format: <code className="bg-yellow-100 px-1 rounded">DD-MMM-YY</code> (e.g., 20-Jan-25)</li>
                                            <li>Shift must be <code className="bg-yellow-100 px-1 rounded">1</code>, <code className="bg-yellow-100 px-1 rounded">2</code>, or <code className="bg-yellow-100 px-1 rounded">3</code></li>
                                            <li>Empty rows will be skipped automatically</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* ==================== Dies Master Import ==================== */}
                            {activeTab === 'dies' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                📤 Import Dies Master
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Import or update dies master data from Excel file
                                            </p>
                                        </div>
                                        <a
                                            href={route('import.template.dies')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap"
                                        >
                                            📥 Download Template
                                        </a>
                                    </div>

                                    {/* Template Preview */}
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-hidden">
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                            📋 Template Format Preview:
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="text-xs min-w-full">
                                                <thead>
                                                    <tr className="bg-blue-700 text-white">
                                                        <th className="px-2 py-2 border border-blue-600 text-left">No</th>
                                                        <th className="px-2 py-2 border border-blue-600 text-left">Part Number</th>
                                                        <th className="px-2 py-2 border border-blue-600 text-left">Part Name</th>
                                                        <th className="px-2 py-2 border border-blue-600 text-left">Model</th>
                                                        <th className="px-2 py-2 border border-blue-600 text-left">Customer</th>
                                                        <th className="px-2 py-2 border border-blue-600 text-left">Total Die</th>
                                                        <th className="px-2 py-2 border border-blue-600 text-left">Line</th>
                                                        <th className="px-2 py-2 border border-blue-600 text-left">Accumulation Stroke</th>
                                                        <th className="px-2 py-2 border border-blue-600 text-left">Control Stroke</th>
                                                        <th className="px-2 py-2 border border-blue-600 text-left">Last PPM Date</th>
                                                        <th className="px-2 py-2 border border-blue-600 text-left">Location</th>
                                                        <th className="px-2 py-2 border border-blue-600 text-left">Notes</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800">
                                                    <tr className="hover: bg-gray-50 dark: hover:bg-gray-700">
                                                        <td className="px-2 py-1.5 border text-center">1</td>
                                                        <td className="px-2 py-1.5 border font-medium text-blue-600">71142-I6000</td>
                                                        <td className="px-2 py-1.5 border">REINF-FR PILLAR OTR LWR,RH</td>
                                                        <td className="px-2 py-1.5 border">KS</td>
                                                        <td className="px-2 py-1.5 border">HMMI</td>
                                                        <td className="px-2 py-1.5 border text-center">4</td>
                                                        <td className="px-2 py-1.5 border">800T</td>
                                                        <td className="px-2 py-1.5 border text-center">0</td>
                                                        <td className="px-2 py-1.5 border text-center">6000</td>
                                                        <td className="px-2 py-1.5 border"></td>
                                                        <td className="px-2 py-1.5 border">Rack A-01</td>
                                                        <td className="px-2 py-1.5 border"></td>
                                                    </tr>
                                                    <tr className="hover:bg-gray-50 dark:hover: bg-gray-700">
                                                        <td className="px-2 py-1.5 border text-center">2</td>
                                                        <td className="px-2 py-1.5 border font-medium text-blue-600">60415-TSEY-X000-H1</td>
                                                        <td className="px-2 py-1.5 border">STIFF R, BHD SIDE MBR</td>
                                                        <td className="px-2 py-1.5 border">2SJ</td>
                                                        <td className="px-2 py-1.5 border">UPIN</td>
                                                        <td className="px-2 py-1.5 border text-center">3</td>
                                                        <td className="px-2 py-1.5 border">250T</td>
                                                        <td className="px-2 py-1.5 border text-center">0</td>
                                                        <td className="px-2 py-1.5 border text-center">10000</td>
                                                        <td className="px-2 py-1.5 border"></td>
                                                        <td className="px-2 py-1.5 border">Rack B-01</td>
                                                        <td className="px-2 py-1.5 border">Progressive die</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Upload Form */}
                                    <form onSubmit={handleDiesSubmit} className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                            <div className="space-y-2">
                                                <div className="text-4xl">📁</div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Select Excel File (. xlsx, .xls, .csv)
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".xlsx,.xls,.csv"
                                                    onChange={(e) => diesForm.setData('file', e.target.files[0])}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                                />
                                                {diesForm. data.file && (
                                                    <p className="text-sm text-green-600 mt-2">
                                                        ✓ Selected: {diesForm.data.file.name}
                                                    </p>
                                                )}
                                                {diesForm.errors.file && (
                                                    <p className="text-red-500 text-xs mt-1">{diesForm.errors.file}</p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={diesForm.processing || !diesForm.data.file}
                                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        >
                                            {diesForm.processing ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Importing...
                                                </span>
                                            ) : '📤 Import Dies Master'}
                                        </button>
                                    </form>

                                    {/* Info */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <h4 className="font-medium text-blue-800 dark: text-blue-200 flex items-center gap-2">
                                            <span>ℹ️</span> Import Behavior:
                                        </h4>
                                        <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 list-disc list-inside space-y-1">
                                            <li>If Part Number already exists → Row will be <strong>skipped</strong> (duplicate)</li>
                                            <li>If Part Number is new → Die will be <strong>created</strong></li>
                                            <li>Model code must match existing:  <code className="bg-blue-100 px-1 rounded">KS</code>, <code className="bg-blue-100 px-1 rounded">4L45W</code>, <code className="bg-blue-100 px-1 rounded">2SJ</code>, <code className="bg-blue-100 px-1 rounded">2SK</code>, etc.</li>
                                            <li>Customer will be auto-created if not exists</li>
                                            <li>Control Stroke overrides standard stroke from tonnage setting</li>
                                        </ul>
                                    </div>

                                    {/* Available Models Reference */}
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">📚 Available Machine Models:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {['KS', '4L45W', '2SJ', '2SK', 'T64', 'YHA', '2JX', '560B']. map((model) => (
                                                <span key={model} className="px-2 py-1 bg-white dark:bg-gray-800 rounded border text-sm">
                                                    {model}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ==================== PPM Schedule Template ==================== */}
                            {activeTab === 'schedule' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            📅 Download PPM Schedule Template
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Download PPM Schedule template matching your original Excel format
                                        </p>
                                    </div>

                                    {/* Template Preview */}
   <div className="border border-gray-300 rounded-lg overflow-hidden">
                                        {/* Header Title */}
                                        <div className="bg-green-700 text-white text-center py-4">
                                            <h4 className="text-xl font-bold">SCHEDULE</h4>
                                            <h5 className="text-lg">PREVENTIVE MAINTENANCE DIES</h5>
                                        </div>

                                        {/* Info Header */}
                                        <div className="bg-white p-4 border-b">
                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Year: </span>
                                                    <span className="font-medium ml-2">2025</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Model:</span>
                                                    <span className="font-medium ml-2">KS (Grade B)</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Customer:</span>
                                                    <span className="font-medium ml-2">HMMI</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-gray-500">Issued:</span>
                                                    <span className="font-medium ml-2">Rydha RG</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs border-collapse">
                                                {/* Main Header */}
                                                <thead>
                                                    <tr className="bg-green-600 text-white">
                                                        <th className="border border-green-500 px-2 py-2 w-10 text-center" rowSpan={2}>NO</th>
                                                        <th className="border border-green-500 px-2 py-2 w-48 text-center" rowSpan={2}>NAME/PART<br/>NUMBER DIE</th>
                                                        <th className="border border-green-500 px-2 py-2 w-16 text-center" rowSpan={2}>MODEL</th>
                                                        <th className="border border-green-500 px-2 py-2 w-14 text-center" rowSpan={2}>TOTAL<br/>DIE</th>
                                                        <th className="border border-green-500 px-2 py-2 w-32 text-center" rowSpan={2}>ACCUMULATION</th>
                                                        <th className="border border-green-500 px-2 py-2 w-20 text-center" rowSpan={2}>LAST<br/>STROKE</th>
                                                        <th className="border border-green-500 px-2 py-2 w-20 text-center" rowSpan={2}>PLAN</th>
                                                        {/* Month Headers */}
                                                        {months.slice(0, 6).map((month) => (
                                                            <th key={month} className="border border-green-500 px-1 py-2 text-center" colSpan={4}>
                                                                {month}
                                                            </th>
                                                        ))}
                                                        <th className="border border-green-500 px-2 py-2 text-center" rowSpan={2}>... </th>
                                                    </tr>
                                                    <tr className="bg-green-500 text-white">
                                                        {/* Week Numbers for each month */}
                                                        {months.slice(0, 6).map((month) => (
                                                            ['I', 'II', 'III', 'IV']. map((week, idx) => (
                                                                <th key={`${month}-${week}`} className="border border-green-400 px-1 py-1 text-center w-8">
                                                                    {week}
                                                                </th>
                                                            ))
                                                        ))}
                                                    </tr>
                                                </thead>

                                                <tbody className="bg-white">
                                                    {/* Customer Section Header */}
                                                    <tr className="bg-green-100">
                                                        <td colSpan={31} className="border px-3 py-2 font-semibold text-green-800">
                                                            HMMI (KS & 800T)
                                                        </td>
                                                    </tr>

                                                    {/* Die Entries */}
                                                    {sampleDies.map((die, dieIndex) => (
                                                        <>
                                                            {/* Row 1: Part Number + Forecast */}
                                                            <tr key={`${die.no}-1`} className="border-t-2 border-gray-300">
                                                                <td className="border px-2 py-1 text-center font-medium bg-gray-50" rowSpan={6}>
                                                                    {die.no}
                                                                </td>
                                                                <td className="border px-2 py-1 text-blue-600 font-medium">
                                                                    {die.partNumber}
                                                                </td>
                                                                <td className="border px-2 py-1 text-center bg-gray-50" rowSpan={6}>
                                                                    {die.model}
                                                                </td>
                                                                <td className="border px-2 py-1 text-center bg-gray-50" rowSpan={6}>
                                                                    {die.totalDie}
                                                                </td>
                                                                <td className="border px-2 py-1 text-xs text-gray-600">
                                                                    ACCUMULATION STROKE
                                                                </td>
                                                                <td className="border px-2 py-1 text-center">
                                                                    {die.accStroke}
                                                                </td>
                                                                <td className="border px-2 py-1 text-xs bg-gray-50">
                                                                    Forecast
                                                                </td>
                                                                {/* Forecast values - Week I of each month */}
                                                                {die.forecast.slice(0, 6).map((val, idx) => (
                                                                    <>
                                                                        <td key={`f-${idx}-1`} className="border px-1 py-1 text-center text-xs">{val}</td>
                                                                        <td key={`f-${idx}-2`} className="border px-1 py-1 text-center text-gray-400">-</td>
                                                                        <td key={`f-${idx}-3`} className="border px-1 py-1 text-center text-gray-400">-</td>
                                                                        <td key={`f-${idx}-4`} className="border px-1 py-1 text-center text-gray-400">-</td>
                                                                    </>
                                                                ))}
                                                                <td className="border px-2 py-1 text-center text-gray-400">... </td>
                                                            </tr>

                                                            {/* Row 2: Part Name + Plan */}
                                                            <tr key={`${die.no}-2`}>
                                                                <td className="border px-2 py-1 text-gray-600 text-xs">
                                                                    {die.partName}
                                                                </td>
                                                                <td className="border px-2 py-1"></td>
                                                                <td className="border px-2 py-1"></td>
                                                                <td className="border px-2 py-1 text-xs bg-gray-50">
                                                                    Plan
                                                                </td>
                                                                {[...Array(24)].map((_, idx) => (
                                                                    <td key={`plan-${idx}`} className="border px-1 py-1 text-center">
                                                                        {idx === 8 && dieIndex === 0 ? (
                                                                            <span className="inline-flex items-center justify-center w-5 h-5 bg-green-600 text-white rounded text-xs font-bold">4</span>
                                                                        ) : ''}
                                                                    </td>
                                                                ))}
                                                                <td className="border px-2 py-1"></td>
                                                            </tr>

                                                            {/* Row 3: Accumulation All + Actual */}
                                                            <tr key={`${die.no}-3`}>
                                                                <td className="border px-2 py-1"></td>
                                                                <td className="border px-2 py-1 text-xs text-gray-600">
                                                                    ACCUMULATION ALL STROKE
                                                                </td>
                                                                <td className="border px-2 py-1"></td>
                                                                <td className="border px-2 py-1 text-xs bg-gray-50">
                                                                    Actual
                                                                </td>
                                                                {[... Array(24)].map((_, idx) => (
                                                                    <td key={`actual-${idx}`} className="border px-1 py-1 text-center">
                                                                        {idx === 8 && dieIndex === 0 ? (
                                                                            <span className="text-lg">●</span>
                                                                        ) : ''}
                                                                    </td>
                                                                ))}
                                                                <td className="border px-2 py-1"></td>
                                                            </tr>

                                                            {/* Row 4: Control Stroke + Stroke */}
                                                            <tr key={`${die.no}-4`}>
                                                                <td className="border px-2 py-1"></td>
                                                                <td className="border px-2 py-1 text-xs text-gray-600">
                                                                    CONTROL STROKE
                                                                </td>
                                                                <td className="border px-2 py-1 text-center">
                                                                    {die.lastStroke}
                                                                </td>
                                                                <td className="border px-2 py-1 text-xs bg-gray-50">
                                                                    Stroke
                                                                </td>
                                                                {[...Array(24)].map((_, idx) => (
                                                                    <td key={`stroke-${idx}`} className="border px-1 py-1 text-center text-xs">
                                                                        {idx === 8 && dieIndex === 0 ? '5230' : ''}
                                                                    </td>
                                                                ))}
                                                                <td className="border px-2 py-1"></td>
                                                            </tr>

                                                            {/* Row 5: PPM Date */}
                                                            <tr key={`${die.no}-5`}>
                                                                <td className="border px-2 py-1"></td>
                                                                <td className="border px-2 py-1"></td>
                                                                <td className="border px-2 py-1"></td>
                                                                <td className="border px-2 py-1 text-xs bg-gray-50">
                                                                    PPM Date
                                                                </td>
                                                                {[... Array(24)].map((_, idx) => (
                                                                    <td key={`ppmdate-${idx}`} className="border px-1 py-1"></td>
                                                                ))}
                                                                <td className="border px-2 py-1"></td>
                                                            </tr>

                                                            {/* Row 6: Pic */}
                                                            <tr key={`${die.no}-6`}>
                                                                <td className="border px-2 py-1"></td>
                                                                <td className="border px-2 py-1"></td>
                                                                <td className="border px-2 py-1"></td>
                                                                <td className="border px-2 py-1 text-xs bg-gray-50">
                                                                    Pic
                                                                </td>
                                                                {[...Array(24)].map((_, idx) => (
                                                                    <td key={`pic-${idx}`} className="border px-1 py-1"></td>
                                                                ))}
                                                                <td className="border px-2 py-1"></td>
                                                            </tr>
                                                        </>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>


                                    {/* Download Button */}
                                    <div className="flex justify-center gap-4">
                                        <a
                                            href={route('import.template.ppm-schedule')}
                                            className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-3 text-lg font-medium shadow-lg"
                                        >
                                            <span className="text-2xl">📥</span>
                                            Download PPM Schedule Template
                                        </a>
                                    </div>

                                    {/* Import Form */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                                            <i className="fas fa-file-upload text-blue-600"></i>
                                            Import PPM Schedule
                                        </h4>
                                        <form onSubmit={handlePpmScheduleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Select Year
                                                    </label>
                                                    <select
                                                        value={ppmScheduleForm.data.year}
                                                        onChange={(e) => ppmScheduleForm.setData('year', e.target.value)}
                                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                    >
                                                        {[2024, 2025, 2026, 2027, 2028].map((y) => (
                                                            <option key={y} value={y}>{y}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Select Excel File
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept=".xlsx,.xls,.csv"
                                                        onChange={(e) => ppmScheduleForm.setData('file', e.target.files[0])}
                                                        className="w-full text-sm text-gray-500 dark:text-gray-400
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:rounded-lg file:border-0
                                                            file:text-sm file:font-semibold
                                                            file:bg-blue-50 file:text-blue-700
                                                            hover:file:bg-blue-100
                                                            dark:file:bg-blue-900 dark:file:text-blue-300"
                                                    />
                                                    {ppmScheduleForm.errors.file && (
                                                        <p className="text-red-500 text-sm mt-1">{ppmScheduleForm.errors.file}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={ppmScheduleForm.processing || !ppmScheduleForm.data.file}
                                                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {ppmScheduleForm.processing ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin"></i>
                                                        Importing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-upload"></i>
                                                        Import PPM Schedule
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Legend */}
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">📝 Template Legend:</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs">●</span>
                                                <span>PPM Done</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">4</span>
                                                <span>Planned Week</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">! </span>
                                                <span>Overdue</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">-</span>
                                                <span>No Activity</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ==================== Import History ==================== */}
                            {activeTab === 'history' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            <i className="fas fa-history text-blue-500"></i> Import History
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            View recent import results and failed uploads
                                        </p>
                                    </div>

                                    {importLogs.length > 0 ? (
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Type</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">File</th>
                                                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                                                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Imported</th>
                                                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Skipped</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">User</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {importLogs.map((log) => (
                                                        <tr key={log.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${log.status === 'failed' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">{log.created_at}</td>
                                                            <td className="px-3 py-2">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                    log.type === 'production' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                                                    log.type === 'dies' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                                                                    'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                                                }`}>
                                                                    {log.type === 'production' ? 'Production Log' : log.type === 'dies' ? 'Dies Master' : 'PPM Schedule'}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300 max-w-[200px] truncate" title={log.file_name}>{log.file_name}</td>
                                                            <td className="px-3 py-2 text-center">
                                                                {log.status === 'success' ? (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                                                        <i className="fas fa-check-circle"></i> Success
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                                                                        <i className="fas fa-times-circle"></i> Failed
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 text-center font-medium text-green-600 dark:text-green-400">{log.status === 'success' ? log.imported_count : '-'}</td>
                                                            <td className="px-3 py-2 text-center font-medium text-red-600 dark:text-red-400">{log.status === 'success' ? log.skipped_count : '-'}</td>
                                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{log.user}</td>
                                                            <td className="px-3 py-2">
                                                                {log.status === 'failed' && log.error_message && (
                                                                    <span className="text-xs text-red-600 dark:text-red-400 block max-w-[250px] truncate" title={log.error_message}>
                                                                        {log.error_message}
                                                                    </span>
                                                                )}
                                                                {log.status === 'success' && log.skipped_rows && log.skipped_rows.length > 0 && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedLog(log);
                                                                            setShowLogDetailModal(true);
                                                                        }}
                                                                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                                                    >
                                                                        View {log.skipped_rows.length} skipped rows
                                                                    </button>
                                                                )}
                                                                {log.status === 'success' && (!log.skipped_rows || log.skipped_rows.length === 0) && (
                                                                    <span className="text-xs text-gray-400">All imported</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            <i className="fas fa-inbox text-4xl mb-3 block"></i>
                                            <p>No import history yet</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Import Result Modal */}
            {showResultModal && flash?.importResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setShowResultModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col z-10">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <i className="fas fa-file-import text-blue-600 dark:text-blue-400"></i>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {flash.importResult.type === 'dies' ? 'Import Dies Master Result' : 'Import Production Log Result'}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Import result summary
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowResultModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className={`px-6 py-4 grid gap-4 border-b border-gray-200 dark:border-gray-700 ${flash.importResult.type === 'production' ? 'grid-cols-4' : 'grid-cols-3'}`}>
                            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                    {flash.importResult.imported + (flash.importResult.type === 'production' ? (flash.importResult.accumulated_count || 0) : 0) + flash.importResult.skipped_count}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">Total Data</div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                    {flash.importResult.imported}
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-300 mt-1">Successfully Imported</div>
                            </div>
                            {flash.importResult.type === 'production' && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                                        {flash.importResult.accumulated_count || 0}
                                    </div>
                                    <div className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">Accumulated</div>
                                </div>
                            )}
                            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                    {flash.importResult.skipped_count}
                                </div>
                                <div className="text-xs text-red-600 dark:text-red-300 mt-1">Skipped / Failed</div>
                            </div>
                        </div>

                        {/* Tab Buttons */}
                        <div className="px-6 pt-3 flex gap-2">
                            <button
                                onClick={() => setResultTab('success')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                                    resultTab === 'success'
                                        ? 'bg-green-600 text-white shadow-sm'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <i className="fas fa-check-circle"></i>
                                Successful ({flash.importResult.imported})
                            </button>
                            {flash.importResult.type === 'production' && (
                                <button
                                    onClick={() => setResultTab('accumulated')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                                        resultTab === 'accumulated'
                                            ? 'bg-yellow-600 text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <i className="fas fa-layer-group"></i>
                                    Accumulated ({flash.importResult.accumulated_count || 0})
                                </button>
                            )}
                            <button
                                onClick={() => setResultTab('failed')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                                    resultTab === 'failed'
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <i className="fas fa-times-circle"></i>
                                Skipped ({flash.importResult.skipped_count})
                            </button>
                        </div>

                        {/* Table Content */}
                        <div className="px-6 py-4 overflow-auto flex-1">
                            {resultTab === 'success' && (
                                <>
                                    {flash.importResult.success_rows && flash.importResult.success_rows.length > 0 ? (
                                        <div className="overflow-x-auto rounded-lg border border-green-200 dark:border-green-800">
                                            <table className="w-full text-sm">
                                                <thead className="bg-green-50 dark:bg-green-900/40">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-green-700 dark:text-green-300 uppercase">Row</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-green-700 dark:text-green-300 uppercase">Part Number</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-green-700 dark:text-green-300 uppercase">Part Name</th>
                                                        {flash.importResult.type === 'dies' ? (
                                                            <>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-green-700 dark:text-green-300 uppercase">Model</th>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-green-700 dark:text-green-300 uppercase">Customer</th>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-green-700 dark:text-green-300 uppercase">Date</th>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-green-700 dark:text-green-300 uppercase">Shift</th>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-green-700 dark:text-green-300 uppercase">Line</th>
                                                                <th className="px-3 py-2 text-right text-xs font-semibold text-green-700 dark:text-green-300 uppercase">Output</th>
                                                            </>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-green-100 dark:divide-green-800">
                                                    {flash.importResult.success_rows.map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-green-50 dark:hover:bg-green-900/20">
                                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.row_number}</td>
                                                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{row.part_number}</td>
                                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.part_name}</td>
                                                            {flash.importResult.type === 'dies' ? (
                                                                <>
                                                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.model}</td>
                                                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.customer}</td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.date}</td>
                                                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.shift}</td>
                                                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.line}</td>
                                                                    <td className="px-3 py-2 text-right font-semibold text-green-700 dark:text-green-400">{row.output?.toLocaleString()}</td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            <i className="fas fa-inbox text-4xl mb-3 block"></i>
                                            <p>No data was successfully imported</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {resultTab === 'accumulated' && (
                                <>
                                    {flash.importResult.accumulated_rows && flash.importResult.accumulated_rows.length > 0 ? (
                                        <div className="overflow-x-auto rounded-lg border border-yellow-200 dark:border-yellow-800">
                                            <table className="w-full text-sm">
                                                <thead className="bg-yellow-50 dark:bg-yellow-900/40">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase">Row</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase">Part Number</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase">Part Name</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase">Date</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase">Shift</th>
                                                        <th className="px-3 py-2 text-right text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase">Old Qty</th>
                                                        <th className="px-3 py-2 text-right text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase">Added</th>
                                                        <th className="px-3 py-2 text-right text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase">New Qty</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-yellow-100 dark:divide-yellow-800">
                                                    {flash.importResult.accumulated_rows.map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
                                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.row_number}</td>
                                                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{row.part_number}</td>
                                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.part_name}</td>
                                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.date}</td>
                                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.shift}</td>
                                                            <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{row.old_qty?.toLocaleString()}</td>
                                                            <td className="px-3 py-2 text-right font-medium text-yellow-600 dark:text-yellow-400">+{row.added_qty?.toLocaleString()}</td>
                                                            <td className="px-3 py-2 text-right font-bold text-yellow-700 dark:text-yellow-300">{row.new_qty?.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            <i className="fas fa-layer-group text-4xl mb-3 block"></i>
                                            <p>No data was accumulated</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {resultTab === 'failed' && (
                                <>
                                    {flash.importResult.skipped_rows && flash.importResult.skipped_rows.length > 0 ? (
                                        <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
                                            <table className="w-full text-sm">
                                                <thead className="bg-red-50 dark:bg-red-900/40">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Row</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Part Number</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Part Name</th>
                                                        {flash.importResult.type === 'dies' ? (
                                                            <th className="px-3 py-2 text-left text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Model</th>
                                                        ) : (
                                                            <>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Date</th>
                                                                <th className="px-3 py-2 text-right text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Output</th>
                                                            </>
                                                        )}
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-red-100 dark:divide-red-800">
                                                    {flash.importResult.skipped_rows.map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.row_number}</td>
                                                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{row.part_number || '-'}</td>
                                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.part_name || '-'}</td>
                                                            {flash.importResult.type === 'dies' ? (
                                                                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.model || '-'}</td>
                                                            ) : (
                                                                <>
                                                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.date || '-'}</td>
                                                                    <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{row.output ?? '-'}</td>
                                                                </>
                                                            )}
                                                            <td className="px-3 py-2">
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                                                                    {row.reason}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            <i className="fas fa-check-double text-4xl mb-3 block text-green-400"></i>
                                            <p>All data imported successfully! Nothing was skipped.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => setShowResultModal(false)}
                                className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Detail Modal (Skipped Rows from History) */}
            {showLogDetailModal && selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setShowLogDetailModal(false)}
                    ></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col z-10">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Skipped Rows Detail
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedLog.file_name} — {selectedLog.created_at}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowLogDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="px-6 py-4 overflow-auto flex-1">
                            <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
                                <table className="w-full text-sm">
                                    <thead className="bg-red-50 dark:bg-red-900/40">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Row</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Part Number</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Part Name</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-100 dark:divide-red-800">
                                        {selectedLog.skipped_rows.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                                                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.row_number}</td>
                                                <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{row.part_number || '-'}</td>
                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.part_name || '-'}</td>
                                                <td className="px-3 py-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                                                        {row.reason}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => setShowLogDetailModal(false)}
                                className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AppLayout>
    );
}
