<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PushSubscriptionController extends Controller
{
    /**
     * Store or update user push subscription.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|url',
            'keys.p256dh' => 'required',
            'keys.auth' => 'required',
        ]);

        $endpoint = $request->input('endpoint');
        $key = $request->input('keys.p256dh');
        $token = $request->input('keys.auth');

        $request->user()->updatePushSubscription($endpoint, $key, $token);

        return response()->json(['success' => true]);
    }

    /**
     * Delete user push subscription.
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|url',
        ]);

        $endpoint = $request->input('endpoint');

        $request->user()->deletePushSubscription($endpoint);

        return response()->json(['success' => true]);
    }
}
