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
        // Log for debugging
        \Log::info('Broadcasting auth request', [
            'user' => $request->user()?->id,
            'channel' => $request->input('channel_name'),
            'socket_id' => $request->input('socket_id'),
        ]);

        if (!$request->user()) {
            \Log::error('Broadcasting auth failed: No authenticated user');
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            return Broadcast::auth($request);
        } catch (\Exception $e) {
            \Log::error('Broadcasting auth exception', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
