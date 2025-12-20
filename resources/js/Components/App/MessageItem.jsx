import { usePage } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';
import UserAvatar from '@/Components/App/UserAvatar';
import MessageOptionsDropdown from '@/Components/App/MessageOptionsDropdown';
import { formatMessageDateLong } from '@/helpers';
import {
    PaperClipIcon,
    ArrowDownTrayIcon,
    DocumentIcon,
} from '@heroicons/react/24/solid';

const MessageItem = ({ message, openImageViewer, onDelete }) => {
    const currentUser = usePage().props.auth.user;

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const isImage = (attachment) => attachment.mime?.startsWith('image/');
    const isVideo = (attachment) => attachment.mime?.startsWith('video/');
    const isAudio = (attachment) => attachment.mime?.startsWith('audio/');

    // Separate images from other attachments
    const imageAttachments = message.attachments?.filter(isImage) || [];
    const otherAttachments = message.attachments?.filter(a => !isImage(a)) || [];

    // Get image grid layout class based on count (like WhatsApp/Telegram)
    const getImageGridClass = (count) => {
        switch (count) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-2'; // 2 top, 1 bottom
            case 4: return 'grid-cols-2'; // 2x2 grid
            default: return 'grid-cols-3'; // 3 columns for 5+
        }
    };

    // Get image size class based on count
    const getImageSizeClass = (count, index) => {
        if (count === 1) return 'w-full max-w-[280px] h-auto max-h-[300px]';
        if (count === 2) return 'w-full h-[140px]';
        if (count === 3 && index === 0) return 'col-span-2 w-full h-[180px]';
        if (count === 3) return 'w-full h-[120px]';
        if (count === 4) return 'w-full h-[120px]';
        return 'w-full h-[100px]'; // 5+ images
    };

    const renderImageGrid = () => {
        if (imageAttachments.length === 0) return null;

        return (
            <div className={`grid gap-1 mb-2 ${getImageGridClass(imageAttachments.length)}`}>
                {imageAttachments.map((attachment, index) => (
                    <div
                        key={attachment.id || index}
                        className={`relative group overflow-hidden rounded-lg ${imageAttachments.length === 3 && index === 0 ? 'col-span-2' : ''
                            }`}
                    >
                        <img
                            src={attachment.url}
                            alt={attachment.name}
                            className={`object-cover cursor-pointer ${getImageSizeClass(imageAttachments.length, index)}`}
                            onClick={() => openImageViewer?.(imageAttachments, index)}
                        />
                        {/* Download overlay */}
                        <a
                            href={route('message.downloadAttachment', attachment.id)}
                            className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ArrowDownTrayIcon className="w-3 h-3 text-white" />
                        </a>
                        {/* Show +N for extra images */}
                        {imageAttachments.length > 6 && index === 5 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-xl font-bold">+{imageAttachments.length - 6}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderOtherAttachment = (attachment, index) => {
        if (isVideo(attachment)) {
            return (
                <div key={attachment.id || index} className="mb-2">
                    <video
                        src={attachment.url}
                        controls
                        className="w-full max-w-[280px] rounded-lg"
                    />
                </div>
            );
        }

        if (isAudio(attachment)) {
            return (
                <div key={attachment.id || index} className="mb-2">
                    <audio src={attachment.url} controls className="w-full max-w-[280px]" />
                </div>
            );
        }

        // File card for documents (PDF, ZIP, etc.)
        return (
            <a
                key={attachment.id || index}
                href={route('message.downloadAttachment', attachment.id)}
                className="flex items-center gap-3 bg-black/20 rounded-lg p-2.5 hover:bg-black/30 transition-colors mb-2"
            >
                <div className="bg-slate-600 rounded-lg p-2 shrink-0">
                    <DocumentIcon className="w-5 h-5 text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-100 truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(attachment.size)}</p>
                </div>
                <ArrowDownTrayIcon className="w-4 h-4 text-gray-400 shrink-0" />
            </a>
        );
    };

    return (
        <div
            className={
                'chat group ' +
                (message.sender_id === currentUser.id
                    ? 'chat-end'
                    : 'chat-start')
            }
        >
            <div className="chat-image avatar">
                <UserAvatar user={message.sender} />
            </div>
            <div className="chat-header">
                {message.sender_id !== currentUser.id
                    ? message.sender.name
                    : ''}
                <time className="text-xs opacity-50 ml-2">
                    {formatMessageDateLong(message.created_at)}
                </time>
            </div>
            <div className="flex items-center gap-1">
                {/* Delete dropdown for own messages - appears on left side of bubble */}
                {message.sender_id === currentUser.id && (
                    <MessageOptionsDropdown message={message} onDelete={onDelete} />
                )}
                <div
                    className={
                        'chat-bubble relative max-w-sm ' +
                        (message.sender_id === currentUser.id
                            ? 'chat-bubble-info'
                            : '')
                    }
                >
                    {/* Image Grid */}
                    {renderImageGrid()}

                    {/* Other Attachments (video, audio, files) */}
                    {otherAttachments.map((attachment, index) =>
                        renderOtherAttachment(attachment, index)
                    )}

                    {/* Message Text */}
                    {message.message && (
                        <div className="chat-message">
                            <div className="chat-message-content markdown-message">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        a(props) {
                                            return (
                                                <a
                                                    {...props}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                />
                                            )
                                        }
                                    }}
                                >
                                    {message.message}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageItem;
