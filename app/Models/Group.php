<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'owner_id',
        'last_message_id',
    ];
    //
    public function users(){
        return $this->belongsToMany(User::class,'group_user');
    }
    public function messages(){
        return $this->hasMany(Message::class);
    }
    public function owner(){
        return $this->belongsTo(User::class);
    }

    public static function getGroupsForUser(User $user)
    {
        $query = self::select(['groups.*', 'messages.message as last_message', 'messages.created_at as last_message_date'])
            ->join('group_users', 'group_users.group_id', '=', 'groups.id' )
            ->leftJoin('messages', 'messages.id', '=', 'groups.last_message_id' )
            ->where('group_users.user_id', $user->id)
            ->orderBy('messages.created_at', 'desc' )
            ->orderBy('groups.name');

        $groups = $query->get();
        
        // Check if last message has attachments
        foreach ($groups as $group) {
            if (!$group->last_message && $group->last_message_id) {
                $attachment = MessageAttachment::where('message_id', $group->last_message_id)->first();
                if ($attachment) {
                    if (str_starts_with($attachment->mime, 'image/')) {
                        $group->last_message = 'Photo';
                    } elseif (str_starts_with($attachment->mime, 'video/')) {
                        $group->last_message = 'Video';
                    } else {
                        $group->last_message = 'Attachment';
                    }
                }
            }
        }
        
        return $groups;
    }

    public function toConversationArray()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'is_group' => true,
            'is_user' => false,
            'owner_id' => $this->owner_id,
            'users' => $this->users,
            'user_ids' => $this->users->pluck('id'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date,
        ];
    }

    public static function updateGroupWithMessage($groupId, $message)
    {
        // Create or update group with received group id and message
        return self :: updateOrCreate(
            ['id' => $groupId],
            ['last_message_id' => $message->id]
        );
    }
}
