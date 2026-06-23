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
        error_log('=== BROADCAST AUTH HIT ===');
        error_log('User: ' . ($request->user()?->id ?? 'NULL'));
        error_log('Channel: ' . $request->input('channel_name'));
        
        if (!$request->user()) {
            error_log('=== NO USER - RETURNING 401 ===');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $channelName = $request->input('channel_name');
        $socketId = $request->input('socket_id');
        
        // Manually authorize based on channel patterns
        $authorized = $this->authorizeChannel($request->user(), $channelName);
        
        if ($authorized === false) {
            error_log('=== CHANNEL NOT AUTHORIZED ===');
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Generate the auth signature manually
        $appKey = config('reverb.apps.apps.0.key');
        $appSecret = config('reverb.apps.apps.0.secret');
        
        // For presence channels, we need to include channel_data
        $isPresenceChannel = str_starts_with($channelName, 'presence-');
        
        if ($isPresenceChannel && is_array($authorized)) {
            // Presence channel with user data
            $channelData = json_encode($authorized);
            $stringToSign = $socketId . ':' . $channelName . ':' . $channelData;
            $signature = hash_hmac('sha256', $stringToSign, $appSecret);
            $auth = $appKey . ':' . $signature;
            
            error_log('=== PRESENCE AUTH SUCCESS ===');
            
            return response()->json([
                'auth' => $auth,
                'channel_data' => $channelData,
            ]);
        } else {
            // Private channel
            $signature = hash_hmac('sha256', $socketId . ':' . $channelName, $appSecret);
            $auth = $appKey . ':' . $signature;
            
            error_log('=== AUTH SUCCESS ===');
            error_log('Auth: ' . $auth);
            
            return response()->json(['auth' => $auth]);
        }
    }
    
    private function authorizeChannel($user, string $channelName): bool|array
    {
        // Presence online channel - returns user data for presence
        if ($channelName === 'presence-online') {
            return [
                'user_id' => $user->id,
                'user_info' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ],
            ];
        }
        
        // User-to-user message channel: private-message.user.{id1}-{id2}
        if (preg_match('/^private-message\.user\.(\d+)-(\d+)$/', $channelName, $matches)) {
            $userId1 = (int) $matches[1];
            $userId2 = (int) $matches[2];
            return $user->id === $userId1 || $user->id === $userId2;
        }
        
        // Group message channel: private-message.group.{groupId}
        if (preg_match('/^private-message\.group\.(\d+)$/', $channelName, $matches)) {
            $groupId = (int) $matches[1];
            return $user->groups->contains('id', $groupId);
        }
        
        error_log('Unknown channel pattern: ' . $channelName);
        return false;
    }
}
