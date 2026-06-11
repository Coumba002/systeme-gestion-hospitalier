<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        // Réservé aux admins
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $query = AuditLog::query()->with('user:id,nom,prenom,email,role');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }
        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('entity_label', 'like', "%{$s}%")
                  ->orWhere('user_name', 'like', "%{$s}%");
            });
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $limit = (int) ($request->input('limit', 100));
        $limit = min(max($limit, 10), 500);

        return response()->json($query->orderByDesc('created_at')->limit($limit)->get());
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json([
            'total'           => AuditLog::count(),
            'derniere_24h'    => AuditLog::where('created_at', '>=', now()->subDay())->count(),
            'logins'          => AuditLog::where('action', 'login')->count(),
            'logins_failed'   => AuditLog::where('action', 'login_failed')->count(),
            'creations'       => AuditLog::where('action', 'created')->count(),
            'modifications'   => AuditLog::where('action', 'updated')->count(),
            'suppressions'    => AuditLog::where('action', 'deleted')->count(),
            'top_users'       => AuditLog::selectRaw('user_id, user_name, COUNT(*) as actions')
                                  ->whereNotNull('user_id')
                                  ->groupBy('user_id', 'user_name')
                                  ->orderByDesc('actions')
                                  ->limit(5)
                                  ->get(),
        ]);
    }
}
