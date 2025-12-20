<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SocketMessageDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $messageId;
    public ?int $groupId;
    public ?int $receiverId;
    public int $senderId;

    /**
     * Create a new event instance.
     */
    public function __construct(int $messageId, ?int $groupId, ?int $receiverId, int $senderId)
    {
        $this->messageId = $messageId;
        $this->groupId = $groupId;
        $this->receiverId = $receiverId;
        $this->senderId = $senderId;
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->messageId,
                'group_id' => $this->groupId,
                'receiver_id' => $this->receiverId,
                'sender_id' => $this->senderId,
            ],
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        if ($this->groupId) {
            return [new PrivateChannel('message.group.' . $this->groupId)];
        } else {
            $ids = [$this->senderId, $this->receiverId];
            sort($ids);
            return [new PrivateChannel('message.user.' . implode('-', $ids))];
        }
    }
}
