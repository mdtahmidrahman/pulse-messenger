import { usePage } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';
import UserAvatar from '@/Components/App/UserAvatar';
import { formatMessageDateLong } from '@/helpers';
import {
    PaperClipIcon,
    ArrowDownTrayIcon,
    PlayIcon,
} from '@heroicons/react/24/solid';

const MessageItem = ({ message, attachmentClick }) => {
    const currentUser = usePage().props.auth.user;

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const isImage = (attachment) => {
        return attachment.mime?.startsWith('image/');
    };

    const isVideo = (attachment) => {
        return attachment.mime?.startsWith('video/');
    };

    const isAudio = (attachment) => {
        return attachment.mime?.startsWith('audio/');
    };

    const isPdf = (attachment) => {
        return attachment.mime === 'application/pdf';
    };

    const renderAttachment = (attachment, index) => {
        if (isImage(attachment)) {
            return (
                <div key={index} className="relative group">
                    <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-[200px] max-h-[200px] rounded-lg cursor-pointer object-cover"
                        onClick={() => attachmentClick?.(attachment)}
                    />
                    <a
                        href={route('message.downloadAttachment', attachment.id)}
                        className="absolute bottom-2 right-2 bg-black/60 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4 text-white" />
                    </a>
                </div>
            );
        }

        if (isVideo(attachment)) {
            return (
                <div key={index} className="relative">
                    <video
                        src={attachment.url}
                        controls
                        className="max-w-[300px] max-h-[200px] rounded-lg"
                    />
                </div>
            );
        }

        if (isAudio(attachment)) {
            return (
                <div key={index} className="w-full">
                    <audio src={attachment.url} controls className="w-full max-w-[300px]" />
                </div>
            );
        }

        // File card for other types (PDF, ZIP, etc.)
        return (
            <a
                key={index}
                href={route('message.downloadAttachment', attachment.id)}
                className="flex items-center gap-3 bg-slate-800 rounded-lg p-3 hover:bg-slate-700 transition-colors max-w-[250px]"
            >
                <div className="bg-slate-700 rounded-lg p-2">
                    <PaperClipIcon className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                </div>
                <ArrowDownTrayIcon className="w-5 h-5 text-gray-400 shrink-0" />
            </a>
        );
    };

    const getGridClass = (count) => {
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-2';
        return 'grid-cols-2 md:grid-cols-3';
    };

    return (
        <div
            className={
                'chat ' +
                (message.sender_id === currentUser.id
                    ? 'chat-end'
                    : 'chat-start')
            }
        >
            {<div className="chat-image avatar">
                <UserAvatar user={message.sender} />
            </div>}
            <div className="chat-header">
                {message.sender_id !== currentUser.id
                    ? message.sender.name
                    : ''}
                <time className="text-xs opacity-50 ml-2">
                    {formatMessageDateLong(message.created_at)}
                </time>
            </div>
            <div
                className={
                    'chat-bubble relative max-w-md ' +
                    (message.sender_id === currentUser.id
                        ? 'chat-bubble-info'
                        : '')
                }
            >
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className={`grid gap-2 mb-2 ${getGridClass(message.attachments.length)}`}>
                        {message.attachments.map((attachment, index) =>
                            renderAttachment(attachment, index)
                        )}
                    </div>
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
    );
};

export default MessageItem;
