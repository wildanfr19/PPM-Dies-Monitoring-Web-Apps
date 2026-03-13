import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function MessagesShow({ auth, message }) {
    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    const handleReply = (e) => {
        e.preventDefault();
        post(route('messages.reply', message.encrypted_id), {
            onSuccess: () => reset(),
        });
    };

    const priorityColors = {
        normal: 'bg-green-100 text-green-700',
        urgent: 'bg-yellow-100 text-yellow-700',
        critical: 'bg-red-100 text-red-700',
    };

    const categoryLabels = {
        coordination: 'Coordination',
        schedule_change: 'Schedule Change',
        urgent_issue: 'Urgent Issue',
        ppm_update: 'PPM Update',
        general: 'General',
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2">
                    <Link href={route('messages.index')} className="text-gray-500 hover:text-gray-700">
                        Messages
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="truncate max-w-xs">{message.subject}</span>
                </div>
            }
        >
            <Head title={message.subject} />

            <div className="py-6 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Main Message */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{message.subject}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[message.priority]}`}>
                                        {message.priority}
                                    </span>
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
                                        {categoryLabels[message.category] || message.category}
                                    </span>
                                    {message.die && (
                                        <Link href={route('dies.show', message.die.encrypted_id)}
                                            className="text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full text-blue-700 dark:text-blue-300 hover:underline">
                                            Die: {message.die.part_number}
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">
                                {new Date(message.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">From:</span>
                            <span>{message.sender?.name} <span className="text-xs text-gray-400">({message.sender?.role})</span></span>
                            {message.receiver && (
                                <>
                                    <span className="font-medium ml-4">To:</span>
                                    <span>{message.receiver?.name} <span className="text-xs text-gray-400">({message.receiver?.role})</span></span>
                                </>
                            )}
                            {message.receiver_role && !message.receiver && (
                                <>
                                    <span className="font-medium ml-4">To Role:</span>
                                    <span className="uppercase text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{message.receiver_role}</span>
                                </>
                            )}
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none border-t border-gray-200 dark:border-gray-700 pt-4">
                            <p className="whitespace-pre-wrap">{message.message}</p>
                        </div>
                    </div>

                    {/* Replies */}
                    {message.replies?.length > 0 && (
                        <div className="space-y-3 mb-4">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Replies ({message.replies.length})
                            </h3>
                            {message.replies.map(reply => (
                                <div key={reply.id} className={`rounded-lg p-4 ${
                                    reply.sender_id === auth.user.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
                                        : 'bg-white dark:bg-gray-800 shadow-sm'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {reply.sender?.name} <span className="text-xs text-gray-400">({reply.sender?.role})</span>
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(reply.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{reply.message}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                        <form onSubmit={handleReply} className="flex gap-3">
                            <textarea
                                value={data.message}
                                onChange={e => setData('message', e.target.value)}
                                placeholder="Type your reply..."
                                rows="2"
                                className="flex-1 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                required
                            />
                            <button
                                type="submit"
                                disabled={processing || !data.message.trim()}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 self-end"
                            >
                                {processing ? 'Sending...' : 'Reply'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
