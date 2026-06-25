<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Message;
use App\Models\User;
use App\Models\Conversation;
use App\Models\MessageAttachment;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Events\SocketMessage;
use App\Events\SocketMessageUpdated;
use App\Notifications\NewMessagePush;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function byuser(User $user)
    {
        $messages = Message::where('sender_id', auth()->id())
            ->where('receiver_id', $user->id)
            ->orWhere('sender_id', $user->id)
            ->where('receiver_id', auth()->id())
            ->latest()
            ->paginate(10);
            
        $messages->load(['sender', 'attachments', 'parent.sender']);

        return inertia('Home', [
            'selectedConversation' => $user->toConversationArray(),
            'messages' => MessageResource::collection($messages),
        ]);
    }

    public function byGroup(Group $group)
    {
        $messages = Message::where('group_id', $group->id)
            ->latest()
            ->paginate(10);
            
        $messages->load(['sender', 'attachments', 'parent.sender']);

        return inertia('Home', [
            'selectedConversation' => $group->toConversationArray(),
            'messages' => MessageResource::collection($messages),
        ]);
    }

    public function loadOlder(Message $message)
    {
        if($message->group_id)
        {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where('group_id', $message->group_id)
                ->latest()
                ->paginate(10);
        }
        else
        {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where((function ($query) use ($message){
                    $query->where('sender_id', $message->sender_id)
                        ->where('receiver_id', $message->receiver_id)
                        ->orWhere('sender_id', $message->receiver_id)
                        ->where('receiver_id', $message->sender_id) ;
                }))
                ->latest()
                ->paginate(10);
        }
        
        $messages->load(['sender', 'attachments', 'parent.sender']);
        
        return MessageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request)
    {
        try {
            $data = $request->validated();
            $data['sender_id'] = auth()->id();
            $receiverId = $data['receiver_id'] ?? null;
            $groupId = $data['group_id'] ?? null;
            $files = $data['attachments'] ?? [];

            $message = Message::create($data);
            $message->load('sender');

            $attachments = [];
            if($files){
                foreach ($files as $file) {
                    $path = $file->store('attachments', 'public');

                    $model = [
                        'message_id' => $message->id,
                        'name' => $file->getClientOriginalName(),
                        'path' => '/storage/' . $path,
                        'mime' => $file->getClientMimeType(),
                        'size' => $file->getSize(),
                    ];

                    $attachment = MessageAttachment::create($model);
                    $attachments[] = $attachment;
                }
                $message->attachments = $attachments;
            }
            if($receiverId){ Conversation::updateConversationWithMessage($receiverId, auth()->id(), $message);}
            if($groupId){ Group::updateGroupWithMessage($groupId, $message);}

            $message->load(['attachments', 'parent.sender']);

            // Send Web Push Notification to recipient(s)
            try {
                if ($receiverId) {
                    $receiver = User::find($receiverId);
                    if ($receiver) {
                        $receiver->notify(new NewMessagePush($message));
                    }
                } elseif ($groupId) {
                    $group = Group::find($groupId);
                    if ($group) {
                        $members = $group->users()->where('users.id', '!=', auth()->id())->get();
                        foreach ($members as $member) {
                            $member->notify(new NewMessagePush($message));
                        }
                    }
                }
            } catch (\Exception $pushError) {
                Log::error('WebPush notification error: ' . $pushError->getMessage());
            }
            
            try {
                error_log('=== BROADCASTING MESSAGE ===');
                error_log('Message ID: ' . $message->id);
                error_log('Sender: ' . $message->sender_id);
                error_log('Receiver: ' . ($message->receiver_id ?? 'null'));
                error_log('Group: ' . ($message->group_id ?? 'null'));
                
                // Debug: Log broadcast config
                $config = config('broadcasting.connections.reverb');
                error_log('Reverb Config: ' . json_encode($config['options'] ?? []));
                error_log('Broadcast Driver: ' . config('broadcasting.default'));
                
                broadcast(new SocketMessage($message));
                
                error_log('=== BROADCAST CALL COMPLETED ===');
            } catch (\Exception $broadcastError) {
                error_log('=== BROADCAST ERROR ===');
                error_log('Error: ' . $broadcastError->getMessage());
                error_log('File: ' . $broadcastError->getFile() . ':' . $broadcastError->getLine());
                error_log('Trace: ' . $broadcastError->getTraceAsString());
                Log::error('Broadcast error: ' . $broadcastError->getMessage());
                // Continue without broadcast - message still saved
            }
            
            return new MessageResource($message);
        } catch (\Exception $e) {
            Log::error('Message store error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            throw $e; // Re-throw to see the actual error
        }
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    public function destroy(Message $message)
    {
        if($message->sender_id !== auth()->id())
        {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $message->delete();
        return response('', 204);
    }

    public function downloadAttachment(MessageAttachment $attachment)
    {
        $path = str_replace('/storage/', '', $attachment->path);
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->download($path, $attachment->name);
        }
        return redirect($attachment->path);
    }

    public function update(Request $request, Message $message)
    {
        if ($message->sender_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($message->created_at->diffInMinutes(now()) >= 5) {
            return response()->json(['message' => 'You can only edit messages within 5 minutes of sending.'], 403);
        }

        $request->validate([
            'message' => 'required|string',
        ]);

        $message->message = $request->input('message');
        $message->is_edited = true;
        $message->save();

        $message->load(['sender', 'attachments', 'parent.sender']);

        try {
            broadcast(new SocketMessageUpdated($message));
        } catch (\Exception $e) {
            Log::error('Broadcast edit error: ' . $e->getMessage());
        }

        return new MessageResource($message);
    }

    public function forward(Request $request)
    {
        $request->validate([
            'message_id' => 'required|exists:messages,id',
            'receiver_id' => 'required_without:group_id|nullable|exists:users,id',
            'group_id' => 'required_without:receiver_id|nullable|exists:groups,id',
        ]);

        $originalMessage = Message::findOrFail($request->input('message_id'));

        $newMessage = Message::create([
            'message' => $originalMessage->message,
            'sender_id' => auth()->id(),
            'receiver_id' => $request->input('receiver_id'),
            'group_id' => $request->input('group_id'),
            'is_forwarded' => true,
        ]);

        $attachments = [];
        foreach ($originalMessage->attachments as $attachment) {
            $newDirectory = 'attachments/' . Str::random(32);
            Storage::disk('public')->makeDirectory($newDirectory);
            $newPath = $newDirectory . '/' . basename($attachment->path);
            
            if (Storage::disk('public')->exists($attachment->path)) {
                Storage::disk('public')->copy($attachment->path, $newPath);
            }

            $newAttachment = MessageAttachment::create([
                'message_id' => $newMessage->id,
                'name' => $attachment->name,
                'path' => $newPath,
                'mime' => $attachment->mime,
                'size' => $attachment->size,
            ]);
            $attachments[] = $newAttachment;
        }

        $newMessage->attachments = $attachments;
        $newMessage->load(['sender', 'attachments', 'parent.sender']);

        $receiverId = $newMessage->receiver_id;
        $groupId = $newMessage->group_id;

        if ($receiverId) {
            Conversation::updateConversationWithMessage($receiverId, auth()->id(), $newMessage);
        }
        if ($groupId) {
            Group::updateGroupWithMessage($groupId, $newMessage);
        }

        // Send Web Push Notification to recipient(s)
        try {
            if ($receiverId) {
                $receiver = User::find($receiverId);
                if ($receiver) {
                    $receiver->notify(new NewMessagePush($newMessage));
                }
            } elseif ($groupId) {
                $group = Group::find($groupId);
                if ($group) {
                    $members = $group->users()->where('users.id', '!=', auth()->id())->get();
                    foreach ($members as $member) {
                        $member->notify(new NewMessagePush($newMessage));
                    }
                }
            }
        } catch (\Exception $pushError) {
            Log::error('WebPush notification error: ' . $pushError->getMessage());
        }

        try {
            broadcast(new SocketMessage($newMessage));
        } catch (\Exception $broadcastError) {
            Log::error('Broadcast error: ' . $broadcastError->getMessage());
        }

        return new MessageResource($newMessage);
    }

}
