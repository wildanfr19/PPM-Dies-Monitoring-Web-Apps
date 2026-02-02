import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';

export default function NotificationsIndex({ auth, notifications }) {
    const getColorClass = (color) => {
        switch (color) {
            case 'red': return 'text-red-500';
            case 'orange': return 'text-orange-500';
            case 'green': return 'text-green-500';
            default: return 'text-blue-500';
        }
    };

    const getBgClass = (notification) => {
        const data = notification.data || {};
        if (notification.read_at) return 'bg-white dark:bg-gray-800';
        return 'bg-blue-50 dark:bg-gray-700';
    };

    const markAsRead = async (id) => {
        await axios.post(route('notifications.read', { id }));
        router.reload({ only: ['notifications'] });
    };

    const markAllAsRead = async () => {
        await axios.post(route('notifications.read-all'));
        router.reload({ only: ['notifications'] });
    };

    const deleteNotification = async (id) => {
        await axios.delete(route('notifications.destroy', { id }));
        router.reload({ only: ['notifications'] });
    };

    const clearAll = async () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            await axios.delete(route('notifications.clear-all'));
            router.reload({ only: ['notifications'] });
        }
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    <i className="fas fa-bell mr-2"></i> All Notifications
                </h2>
            }
        >
            <Head title="Notifications" />

            <div className="py-6 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header Actions */}
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage all your notifications
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <i className="fas fa-check-double"></i> Mark All Read
                            </button>
                            <button
                                onClick={clearAll}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                            >
                                <i className="fas fa-trash"></i> Clear All
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                        {notifications.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <i className="fas fa-bell-slash text-6xl mb-4"></i>
                                <p className="text-xl">No notifications</p>
                                <p className="text-sm mt-2">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {notifications.data.map((notification) => {
                                    const data = notification.data || {};
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${getBgClass(notification)}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                                    data.color === 'red' ? 'bg-red-100' :
                                                    data.color === 'orange' ? 'bg-orange-100' :
                                                    data.color === 'green' ? 'bg-green-100' :
                                                    'bg-blue-100'
                                                }`}>
                                                    <i className={`fas ${data.icon || 'fa-bell'} text-lg ${getColorClass(data.color)}`}></i>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1">
                                                    <p className={`${notification.read_at ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                                                        {data.message || 'Notification'}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                        <span>
                                                            <i className="fas fa-clock mr-1"></i>
                                                            {new Date(notification.created_at).toLocaleString()}
                                                        </span>
                                                        {data.die_id && (
                                                            <Link
                                                                href={route('dies.show', data.die_id)}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                <i className="fas fa-external-link-alt mr-1"></i>
                                                                View Die
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {!notification.read_at && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                                            title="Mark as read"
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {notifications.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Showing {notifications.from} to {notifications.to} of {notifications.total}
                                    </p>
                                    <div className="flex gap-2">
                                        {notifications.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
