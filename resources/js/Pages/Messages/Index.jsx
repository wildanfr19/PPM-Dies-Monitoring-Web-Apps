import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const CATEGORIES = [
    { value: 'coordination', label: 'Coordination' },
    { value: 'schedule_change', label: 'Schedule Change' },
    { value: 'urgent_issue', label: 'Urgent Issue' },
    { value: 'ppm_update', label: 'PPM Update' },
    { value: 'general', label: 'General' },
];

const PRIORITIES = [
    { value: 'normal', label: '🟢 Normal', color: 'green' },
    { value: 'urgent', label: '🟠 Urgent', color: 'yellow' },
    { value: 'critical', label: '🔴 Critical', color: 'red' },
];

export default function MessagesIndex({ auth, messages, filter, unreadCount, dies, recipients, search }) {
    const [showCompose, setShowCompose] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        receiver_id: '',
        receiver_role: '',
        die_id: '',
        subject: '',
        message: '',
        priority: 'normal',
        category: 'general',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('messages.store'), {
            onSuccess: () => { reset(); setShowCompose(false); },
        });
    };

    const filters = [
        { key: 'inbox', label: 'Inbox', icon: 'fa-inbox' },
        { key: 'sent', label: 'Sent', icon: 'fa-paper-plane' },
        { key: 'urgent', label: 'Urgent', icon: 'fa-exclamation-triangle' },
    ];

    return (
        <AppLayout
            user={auth.user}
            header={<span className="text-lg font-semibold text-gray-800 dark:text-gray-200">💬 Messages {unreadCount > 0 && `(${unreadCount} unread)`}</span>}
        >
            <Head title="Messages" />

            <div className="py-6 px-6">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <div className="w-64 shrink-0">
                        <button
                            onClick={() => setShowCompose(true)}
                            className="w-full mb-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                        >
                            <i className="fas fa-plus mr-2"></i> New Message
                        </button>

                        <nav className="space-y-1">
                            {filters.map(f => (
                                <Link
                                    key={f.key}
                                    href={route('messages.index', { filter: f.key })}
                                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition ${
                                        filter === f.key
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <i className={`fas ${f.icon} mr-3 w-4 text-center`}></i>
                                    {f.label}
                                    {f.key === 'inbox' && unreadCount > 0 && (
                                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Compose Modal */}
                        {showCompose && (
                            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Message</h3>
                                    <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Send To (User)</label>
                                            <select value={data.receiver_id} onChange={e => setData('receiver_id', e.target.value)}
                                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm">
                                                <option value="">-- Or select role below --</option>
                                                {recipients?.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Or Send to Role</label>
                                            <select value={data.receiver_role} onChange={e => setData('receiver_role', e.target.value)}
                                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm">
                                                <option value="">-- Select role --</option>
                                                <option value="mtn_dies">MTN Dies</option>
                                                <option value="ppic">PPIC</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                            <select value={data.priority} onChange={e => setData('priority', e.target.value)}
                                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm">
                                                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                            <select value={data.category} onChange={e => setData('category', e.target.value)}
                                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm">
                                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Related Die</label>
                                            <select value={data.die_id} onChange={e => setData('die_id', e.target.value)}
                                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm">
                                                <option value="">-- None --</option>
                                                {dies?.map(d => <option key={d.id} value={d.id}>{d.part_number} - {d.part_name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                                        <input type="text" value={data.subject} onChange={e => setData('subject', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                            required />
                                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
                                        <textarea value={data.message} onChange={e => setData('message', e.target.value)}
                                            rows="4" className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                            required />
                                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowCompose(false)}
                                            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                                        <button type="submit" disabled={processing}
                                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                            {processing ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Messages List */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            {messages?.data?.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <i className="fas fa-inbox text-4xl mb-3 block opacity-30"></i>
                                    <p>No messages</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {messages?.data?.map(msg => (
                                        <Link
                                            key={msg.id}
                                            href={route('messages.show', msg.encrypted_id)}
                                            className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                                                !msg.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {!msg.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
                                                        <span className={`text-sm font-medium truncate ${!msg.is_read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                                                            {msg.subject}
                                                        </span>
                                                        {msg.priority !== 'normal' && (
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                                                msg.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {msg.priority}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{msg.sender?.name} ({msg.sender?.role})</span>
                                                        <span>·</span>
                                                        <span>{new Date(msg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                        {msg.replies_count > 0 && (
                                                            <>
                                                                <span>·</span>
                                                                <span>{msg.replies_count} replies</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1 truncate">{msg.message}</p>
                                                </div>
                                                {msg.die && (
                                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300 shrink-0">
                                                        {msg.die.part_number}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {messages?.links && messages.last_page > 1 && (
                                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-1">
                                    {messages.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-sm rounded ${
                                                link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                                            } ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
