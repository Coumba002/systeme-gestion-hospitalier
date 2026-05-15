<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $messages = Message::with(['sender', 'receiver'])
            ->where('receiver_id', $user->id)
            ->orWhere('sender_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'contenu' => 'required|string'
        ]);

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'contenu' => $request->contenu,
        ]);

        return response()->json($message->load(['sender', 'receiver']), 201);
    }

    public function markAsRead(Message $message, Request $request)
    {
        if ($message->receiver_id === $request->user()->id) {
            $message->update(['lu' => true]);
        }
        return response()->json($message);
    }
}
