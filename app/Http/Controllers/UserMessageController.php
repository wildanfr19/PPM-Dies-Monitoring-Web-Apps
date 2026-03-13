<?php

namespace App\Http\Controllers;

use App\Models\DieModel;
use App\Models\UserMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserMessageController extends Controller
{
    /**
     * Display messages for current user (MTN Dies <-> PPIC communication)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $filter = $request->input('filter', 'inbox');
        $search = $request->input('search');

        $query = UserMessage::with(['sender:id,name,role', 'receiver:id,name,role', 'die:id,part_number,part_name'])
            ->whereNull('parent_id'); // Only top-level messages

        if ($filter === 'inbox') {
            $query->where(function ($q) use ($user) {
                $q->where('receiver_id', $user->id)
                  ->orWhere('receiver_role', $user->role);
            });
        } elseif ($filter === 'sent') {
            $query->where('sender_id', $user->id);
        } elseif ($filter === 'urgent') {
            $query->where(function ($q) use ($user) {
                $q->where('receiver_id', $user->id)
                  ->orWhere('receiver_role', $user->role);
            })->whereIn('priority', ['urgent', 'critical']);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $messages = $query->withCount('replies')
            ->orderByDesc('created_at')
            ->paginate(20);

        // Unread count
        $unreadCount = UserMessage::where(function ($q) use ($user) {
            $q->where('receiver_id', $user->id)
              ->orWhere('receiver_role', $user->role);
        })->where('is_read', false)->count();

        // Get dies list for linking messages to specific dies
        $dies = DieModel::active()
            ->select('id', 'part_number', 'part_name')
            ->orderBy('part_number')
            ->get();

        // Get MTN Dies and PPIC users for receiver selection
        $recipients = User::where('is_active', true)
            ->whereIn('role', [User::ROLE_MTN_DIES, User::ROLE_PPIC, User::ROLE_ADMIN])
            ->select('id', 'name', 'role')
            ->get();

        return Inertia::render('Messages/Index', [
            'messages' => $messages,
            'filter' => $filter,
            'unreadCount' => $unreadCount,
            'dies' => $dies,
            'recipients' => $recipients,
            'search' => $search,
        ]);
    }

    /**
     * Store a new message
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'nullable|exists:users,id',
            'receiver_role' => 'nullable|in:mtn_dies,ppic,admin',
            'die_id' => 'nullable|exists:dies,id',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|max:2000',
            'priority' => 'required|in:normal,urgent,critical',
            'category' => 'required|in:coordination,schedule_change,urgent_issue,ppm_update,general',
        ]);

        $validated['sender_id'] = $request->user()->id;

        UserMessage::create($validated);

        return redirect()->back()
            ->with('success', 'Message sent successfully.');
    }

    /**
     * Show a message thread
     */
    public function show(UserMessage $message)
    {
        $message->load([
            'sender:id,name,role',
            'receiver:id,name,role',
            'die:id,part_number,part_name',
            'replies' => fn($q) => $q->with(['sender:id,name,role'])->orderBy('created_at'),
        ]);

        // Mark as read
        $user = auth()->user();
        if (!$message->is_read &&
            ($message->receiver_id === $user->id || $message->receiver_role === $user->role)) {
            $message->update(['is_read' => true, 'read_at' => now()]);
        }

        return Inertia::render('Messages/Show', [
            'message' => $message,
        ]);
    }

    /**
     * Reply to a message
     */
    public function reply(Request $request, UserMessage $message)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        UserMessage::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $message->sender_id, // Reply goes back to original sender
            'die_id' => $message->die_id,
            'subject' => 'Re: ' . $message->subject,
            'message' => $validated['message'],
            'priority' => $message->priority,
            'category' => $message->category,
            'parent_id' => $message->id,
        ]);

        return redirect()->back()
            ->with('success', 'Reply sent.');
    }

    /**
     * Mark message as read
     */
    public function markRead(UserMessage $message)
    {
        $message->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Get unread message count for current user (API endpoint for nav badge)
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = UserMessage::where(function ($q) use ($user) {
            $q->where('receiver_id', $user->id)
              ->orWhere('receiver_role', $user->role);
        })->where('is_read', false)->count();

        return response()->json(['count' => $count]);
    }
}
