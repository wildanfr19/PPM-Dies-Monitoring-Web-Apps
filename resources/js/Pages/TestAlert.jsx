import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { showSuccess, showError, showLoading, closeLoading } from '@/Utils/swal';

export default function TestAlert({ auth, dies, mailConfig }) {
    const { data, setData, post, processing, errors } = useForm({
        die_id: '',
        alert_type: 'orange',
        email: auth.user.email || '',
    });

    const selectedDie = dies?.find(d => d.id === parseInt(data.die_id));

    const handleSubmit = (e) => {
        e.preventDefault();
        showLoading('Sending test alert...');

        post(route('test-alert.send'), {
            onSuccess: () => {
                closeLoading();
            },
            onError: () => {
                closeLoading();
            },
        });
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    <i className="fas fa-bell mr-2"></i>
                    Test Alert Email
                </h2>
            }
        >
            <Head title="Test Alert Email" />

            <div className="py-6 px-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Mail Configuration Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                            <i className="fas fa-info-circle mr-2"></i>
                            Mail Configuration
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-blue-600 dark:text-blue-400">Driver:</span>
                                <span className="ml-2 font-mono text-blue-800 dark:text-blue-200">{mailConfig.driver}</span>
                            </div>
                            <div>
                                <span className="text-blue-600 dark:text-blue-400">Host:</span>
                                <span className="ml-2 font-mono text-blue-800 dark:text-blue-200">{mailConfig.host || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-blue-600 dark:text-blue-400">From:</span>
                                <span className="ml-2 font-mono text-blue-800 dark:text-blue-200">{mailConfig.from || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Test Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                            <i className="fas fa-paper-plane mr-2"></i>
                            Send Test Alert
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Die Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <i className="fas fa-cog mr-1"></i>
                                    Select Die *
                                </label>
                                <select
                                    value={data.die_id}
                                    onChange={(e) => setData('die_id', e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    required
                                >
                                    <option value="">-- Select a Die --</option>
                                    {dies?.map((die) => (
                                        <option key={die.id} value={die.id}>
                                            {die.part_number} - {die.part_name} ({die.customer?.code})
                                        </option>
                                    ))}
                                </select>
                                {errors.die_id && <p className="text-red-500 text-xs mt-1">{errors.die_id}</p>}
                            </div>

                            {/* Selected Die Info */}
                            {selectedDie && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Selected Die Info</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Part Number:</span>
                                            <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">{selectedDie.part_number}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Accumulation:</span>
                                            <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                                                {(selectedDie.accumulation_stroke || 0).toLocaleString()} strokes
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Alert Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    Alert Type *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label
                                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                                            data.alert_type === 'orange'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            value="orange"
                                            checked={data.alert_type === 'orange'}
                                            onChange={(e) => setData('alert_type', e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-full bg-orange-500"></span>
                                                <span className="font-semibold text-orange-700 dark:text-orange-300">Orange Alert</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Warning - Schedule PPM soon</p>
                                            <p className="text-xs text-gray-400 mt-1">Recipients: MGR/GM, MD</p>
                                        </div>
                                        {data.alert_type === 'orange' && (
                                            <i className="fas fa-check-circle text-orange-500 text-xl"></i>
                                        )}
                                    </label>

                                    <label
                                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                                            data.alert_type === 'red'
                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            value="red"
                                            checked={data.alert_type === 'red'}
                                            onChange={(e) => setData('alert_type', e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-full bg-red-500"></span>
                                                <span className="font-semibold text-red-700 dark:text-red-300">Red Alert</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Critical - Stop production!</p>
                                            <p className="text-xs text-gray-400 mt-1">Recipients: MGR/GM, MD, MTN Dies</p>
                                        </div>
                                        {data.alert_type === 'red' && (
                                            <i className="fas fa-check-circle text-red-500 text-xl"></i>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <i className="fas fa-envelope mr-1"></i>
                                    Send To Email *
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="your-email@example.com"
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm"
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                <p className="text-xs text-gray-500 mt-1">
                                    For testing purposes, email will be sent to this address instead of role-based recipients.
                                </p>
                            </div>

                            {/* Submit */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                                        data.alert_type === 'orange'
                                            ? 'bg-orange-600 hover:bg-orange-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    } disabled:opacity-50`}
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-paper-plane mr-2"></i>
                                            Send Test {data.alert_type === 'orange' ? 'Orange' : 'Red'} Alert
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* CLI Instructions */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-200 mb-2">
                            <i className="fas fa-terminal mr-2"></i>
                            CLI Command (Alternative)
                        </h3>
                        <code className="block text-sm text-green-400 bg-gray-900 p-3 rounded font-mono">
                            php artisan alert:test --type=orange --email=your@email.com
                        </code>
                        <p className="text-xs text-gray-400 mt-2">
                            Options: --type=orange|red --email=xxx --die=ID
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
