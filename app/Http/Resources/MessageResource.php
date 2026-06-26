<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'sender_id' => $this->sender_id,
            'receiver_id' => $this->receiver_id,
            'sender' => new UserResource($this->whenLoaded('sender')),
            'group_id' => $this->group_id,
            'attachments' => MessageAttachmentResource::collection($this->whenLoaded('attachments')),
            'parent_id' => $this->parent_id,
            'parent' => new MessageResource($this->whenLoaded('parent')),
            'is_edited' => (bool) $this->is_edited,
            'is_forwarded' => (bool) $this->is_forwarded,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
