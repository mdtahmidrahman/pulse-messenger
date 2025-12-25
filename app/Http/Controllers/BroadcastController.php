<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;

class BroadcastController extends Controller
{
    /**
     * Authenticate the request for channel access.
     */
    public function authenticate(Request $request)
    {
        // Write directly to stderr for Render logs
        error_log('=== BROADCAST AUTH HIT ===');
        error_log('User: ' . ($request->user()?->id ?? 'NULL'));
        error_log('Channel: ' . $request->input('channel_name'));
        error_log('Socket ID: ' . $request->input('socket_id'));
        
        // If no user, return 401
        if (!$request->user()) {
            error_log('=== NO USER - RETURNING 401 ===');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        try {
            $result = Broadcast::auth($request);
            error_log('=== BROADCAST AUTH RESULT ===');
            error_log(print_r($result, true));
            return $result;
        } catch (\Exception $e) {
            error_log('=== BROADCAST AUTH EXCEPTION ===');
            error_log($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }
}
