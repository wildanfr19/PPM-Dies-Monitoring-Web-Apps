import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Test({ auth, message }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Test Page - PPM Dies Monitoring
                </h2>
            }
        >
            <Head title="Test" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg: px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-2xl font-bold mb-4">
                                🎉 Laravel + Inertia + React Success!
                            </h3>
                            <p className="mb-4">Message from Controller: <strong>{message}</strong></p>

                            {/* Test Lot Visualization */}
                            <div className="mt-6">
                                <h4 className="font-semibold mb-2">Test Lot Progress: </h4>
                                <div className="flex gap-2">
                                    <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center text-white font-bold">1</div>
                                    <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center text-white font-bold">2</div>
                                    <div className="w-12 h-12 bg-orange-500 rounded flex items-center justify-center text-white font-bold">3</div>
                                    <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center text-gray-500 font-bold">4</div>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    🟢 Green = OK | 🟠 Orange = Warning | 🔴 Red = Critical | ⬜ Gray = Empty
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
