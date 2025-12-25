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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
            
        $messages->load(['sender', 'attachments']);

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
            
        $messages->load(['sender', 'attachments']);

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
        
        $messages->load(['sender', 'attachments']);
        
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
                    $directory = 'attachments/'.Str::random(32);
                    Storage::makeDirectory($directory);

                    $model = [
                        'message_id' => $message->id,
                        'name' => $file->getClientOriginalName(),
                        'path' => $file->store($directory, 'public'),
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

            $message->load('attachments');
            
            try {
                error_log('=== BROADCASTING MESSAGE ===');
                error_log('Message ID: ' . $message->id);
                error_log('Sender: ' . $message->sender_id);
                error_log('Receiver: ' . ($message->receiver_id ?? 'null'));
                error_log('Group: ' . ($message->group_id ?? 'null'));
                
                broadcast(new SocketMessage($message));
                
                error_log('=== BROADCAST SUCCESS ===');
            } catch (\Exception $broadcastError) {
                error_log('=== BROADCAST ERROR ===');
                error_log('Error: ' . $broadcastError->getMessage());
                error_log('File: ' . $broadcastError->getFile() . ':' . $broadcastError->getLine());
                \Log::error('Broadcast error: ' . $broadcastError->getMessage());
                // Continue without broadcast - message still saved
            }
            
            return new MessageResource($message);
        } catch (\Exception $e) {
            \Log::error('Message store error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
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
        return Storage::disk('public')->download($attachment->path, $attachment->name);
    }

}
