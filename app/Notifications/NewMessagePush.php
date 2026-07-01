<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;
use App\Models\Message;

class NewMessagePush extends Notification
{
    use Queueable;

    protected Message $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    /**
     * Get the WebPush representation of the notification.
     */
    public function toWebPush(object $notifiable, mixed $notification): WebPushMessage
    {
        $senderName = $this->message->sender->name;
        
        // Handle message content preview
        $messagePreview = $this->message->message;
        if (!$messagePreview) {
            $attachment = $this->message->attachments()->first();
            if ($attachment) {
                if (str_starts_with($attachment->mime, 'image/')) {
                    $messagePreview = 'Shared a photo';
                } elseif (str_starts_with($attachment->mime, 'video/')) {
                    $messagePreview = 'Shared a video';
                } else {
                    $messagePreview = 'Shared an attachment';
                }
            } else {
                $messagePreview = 'New message';
            }
        }
        
        // Determine group or user context
        if ($this->message->group_id) {
            $title = $this->message->group->name;
            $body = explode(' ', $senderName)[0] . ': ' . $messagePreview;
            $url = route('chat.group', $this->message->group_id);
        } else {
            $title = $senderName;
            $body = $messagePreview;
            $url = route('chat.user', $this->message->sender_id);
        }

        return (new WebPushMessage)
            ->title($title)
            ->body($body)
            ->icon($this->message->sender->avatar_url ?? '/images/logo.png')
            ->badge('/images/logo.png')
            ->data([
                'url' => $url,
                'message_id' => $this->message->id,
            ]);
    }
}
