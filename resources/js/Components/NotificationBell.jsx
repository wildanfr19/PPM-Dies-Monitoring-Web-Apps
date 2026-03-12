import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            const response = await axios.get(route('notifications.index'), {
                signal: abortControllerRef.current.signal
            });
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            // Ignore abort errors
            if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                console.error('Failed to fetch notifications:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and polling every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => {
            clearInterval(interval);
            // Cancel any pending request on unmount
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mark single notification as read
    const markAsRead = async (id) => {
        try {
            await axios.post(route('notifications.read', { id }));
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            ));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await axios.post(route('notifications.read-all'));
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Get color class based on notification type
    const getColorClass = (color) => {
        switch (color) {
            case 'red': return 'text-red-500';
            case 'orange': return 'text-orange-500';
            case 'green': return 'text-green-500';
            case 'purple': return 'text-purple-500';
            case 'cyan': return 'text-cyan-500';
            default: return 'text-blue-500';
        }
    };

    // Get background color for icon circle
    const getIconBgClass = (color) => {
        switch (color) {
            case 'red': return 'bg-red-100 dark:bg-red-900/30';
            case 'orange': return 'bg-orange-100 dark:bg-orange-900/30';
            case 'green': return 'bg-green-100 dark:bg-green-900/30';
            case 'purple': return 'bg-purple-100 dark:bg-purple-900/30';
            case 'cyan': return 'bg-cyan-100 dark:bg-cyan-900/30';
            default: return 'bg-blue-100 dark:bg-blue-900/30';
        }
    };

    // Get background class for unread
    const getBgClass = (notification) => {
        if (notification.read_at) return 'bg-white dark:bg-gray-800';
        return 'bg-blue-50 dark:bg-gray-700';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 focus:outline-none"
            >
                <i className="fas fa-bell text-xl"></i>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <i className="fas fa-bell mr-2"></i> Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <i className="fas fa-bell-slash text-4xl mb-2"></i>
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${getBgClass(notification)}`}
                                    onClick={() => {
                                        if (!notification.read_at) markAsRead(notification.id);
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconBgClass(notification.color)}`}>
                                            <i className={`fas ${notification.icon} ${getColorClass(notification.color)}`}></i>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${notification.read_at ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {notification.created_at}
                                                </span>
                                                {notification.die_id && (
                                                    <Link
                                                        href={route('dies.show', notification.die_id)}
                                                        className="text-xs text-blue-600 hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        View Die →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        {/* Unread indicator */}
                                        {!notification.read_at && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
                            <Link
                                href={route('notifications.all')}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                                View all notifications →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
