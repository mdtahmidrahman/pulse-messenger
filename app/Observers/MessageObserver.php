<?php

namespace App\Observers;

use App\Models\Message;
use App\Models\Group;
use App\Models\Conversation;
use App\Events\SocketMessageDeleted;
use Illuminate\Support\Facades\Storage;

class MessageObserver
{
    public function deleting(Message $message)
    {
        // Store data for broadcast before deletion
        $message->_broadcast_data = [
            'id' => $message->id,
            'group_id' => $message->group_id,
            'receiver_id' => $message->receiver_id,
            'sender_id' => $message->sender_id,
        ];

        // Iterate over the message's attachments and delete them from file system
        $message->attachments->each(function ($attachment) {
            // Delete attachment file from file system saved on public disk
            $dir = dirname($attachment->path);
            Storage::disk('public')->deleteDirectory($dir);

        });

        // delete all attachments related to the message from the database
        $message->attachments()->delete();

        // Update Group and Conversation's last message if the message is the last message
        if($message->group_id) {
            $group = Group::where('last_message_id', $message->id)->first();
            if($group) {
                $prevMessage = Message::where('group_id', $message->group_id)
                ->where('id', '!=', $message->id)
                ->latest()
                ->limit(1)
                ->first();

                if($prevMessage) {
                    $group->last_message_id = $prevMessage->id;
                } else {
                    $group->last_message_id = null;
                }
                $group->save();
            }
        }
        else {
            $conversation = Conversation::where('last_message_id', $message->id)->first();

            // if the message is the last message in the conversation
            if($conversation) {
                $prevMessage = Message::where(function ($query) use ($message) {
                    $query->where('sender_id', $message->sender_id)
                    ->where('receiver_id', $message->receiver_id)
                    ->orWhere('sender_id', $message->receiver_id)
                    ->where('receiver_id', $message->sender_id);
                })
                ->where('id', '!=', $message->id)
                ->latest()
                ->limit(1)
                ->first();

                if($prevMessage) {
                    $conversation->last_message_id = $prevMessage->id;
                } else {
                    $conversation->last_message_id = null;
                }
                $conversation->save();
            }
        }
    }

    public function deleted(Message $message)
    {
        // Broadcast the deletion to all conversation participants
        try {
            $data = $message->_broadcast_data ?? [
                'id' => $message->id,
                'group_id' => $message->group_id,
                'receiver_id' => $message->receiver_id,
                'sender_id' => $message->sender_id,
            ];

            broadcast(new SocketMessageDeleted(
                $data['id'],
                $data['group_id'],
                $data['receiver_id'],
                $data['sender_id']
            ));
        } catch (\Exception $e) {
            \Log::error('Broadcast delete error: ' . $e->getMessage());
        }
    }
}
