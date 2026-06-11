<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $messages = Message::with(['sender:id,nom,prenom,role', 'receiver:id,nom,prenom,role'])
            ->where(function ($q) use ($user) {
                $q->where('receiver_id', $user->id)->orWhere('sender_id', $user->id);
            })
            ->orderBy('created_at', 'asc')
            ->get();
        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'contenu'     => 'required_without:content|string',
            'content'     => 'required_without:contenu|string',
        ]);

        $contenu = $validated['contenu'] ?? $validated['content'];

        $message = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $validated['receiver_id'],
            'contenu'     => $contenu,
        ]);

        return response()->json($message->load(['sender', 'receiver']), 201);
    }

    public function show(Message $message)
    {
        return response()->json($message->load(['sender', 'receiver']));
    }

    public function update(Request $request, Message $message)
    {
        if ($message->receiver_id === $request->user()->id && $request->has('lu')) {
            $message->update(['lu' => (bool) $request->lu]);
        }
        return response()->json($message);
    }

    public function destroy(Message $message)
    {
        if ($message->sender_id === request()->user()->id) {
            $message->delete();
            return response()->json(['message' => 'Message supprimé']);
        }
        return response()->json(['message' => 'Non autorisé'], 403);
    }

    public function markAsRead(Message $message, Request $request)
    {
        if ($message->receiver_id === $request->user()->id) {
            $message->update(['lu' => true]);
        }
        return response()->json($message);
    }
}
