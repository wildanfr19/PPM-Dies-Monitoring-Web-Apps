<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Get notifications for dropdown (latest 10)
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'notifications' => [],
                    'unread_count' => 0,
                ]);
            }

            $notifications = $user
                ->notifications()
                ->latest()
                ->take(10)
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => $notification->data['type'] ?? 'info',
                        'message' => $notification->data['message'] ?? '',
                        'icon' => $notification->data['icon'] ?? 'fa-bell',
                        'color' => $notification->data['color'] ?? 'blue',
                        'die_id' => $notification->data['die_id'] ?? null,
                        'part_number' => $notification->data['part_number'] ?? null,
                        'read_at' => $notification->read_at,
                        'created_at' => $notification->created_at->diffForHumans(),
                    ];
                });

            $unreadCount = $user->unreadNotifications()->count();

            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'notifications' => [],
                'unread_count' => 0,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get all notifications (paginated)
     */
    public function all(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, string $id)
    {
        $request->user()
            ->notifications()
            ->where('id', $id)
            ->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Clear all notifications
     */
    public function clearAll(Request $request)
    {
        $request->user()->notifications()->delete();

        return response()->json(['success' => true]);
    }
}
