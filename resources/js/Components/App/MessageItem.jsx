import { usePage } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { useState } from 'react';
import UserAvatar from '@/Components/App/UserAvatar';
import MessageOptionsDropdown from '@/Components/App/MessageOptionsDropdown';
import { formatMessageDateLong } from '@/helpers';
import {
    PaperClipIcon,
    ArrowDownTrayIcon,
    DocumentIcon,
} from '@heroicons/react/24/solid';
import axios from 'axios';

const MessageItem = ({ message, openImageViewer, onDelete, onReply, onForward, onUpdate }) => {
    const currentUser = usePage().props.auth.user;
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.message || '');

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

    const handleJumpToParent = (e) => {
        e.preventDefault();
        if (!message.parent_id) return;
        const parentElement = document.getElementById(`message-${message.parent_id}`);
        if (parentElement) {
            parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add visual flash highlight
            parentElement.classList.add('bg-slate-700/50', 'transition-colors', 'duration-500');
            setTimeout(() => {
                parentElement.classList.remove('bg-slate-700/50');
            }, 1500);
        }
    };

    const handleSaveEdit = async () => {
        if (!editText.trim()) return;

        try {
            const response = await axios.patch(route('message.update', message.id), {
                message: editText,
            });
            onUpdate?.(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to edit message:', error);
            alert(error.response?.data?.message || 'Failed to edit message. Please try again.');
        }
    };

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

    const isOwnMessage = message.sender_id === currentUser.id;

    return (
        <div
            id={`message-${message.id}`}
            className={
                'chat group ' +
                (isOwnMessage ? 'chat-end' : 'chat-start')
            }
        >
            <div className="chat-image avatar">
                <UserAvatar user={message.sender} />
            </div>
            <div className="chat-header">
                {!isOwnMessage ? message.sender.name : ''}
                <time className="text-xs opacity-50 ml-2">
                    {formatMessageDateLong(message.created_at)}
                    {message.is_edited && <span className="ml-1 text-[10px] italic opacity-70">(edited)</span>}
                </time>
            </div>
            <div className="flex items-center gap-1">
                {/* Options dropdown for own messages (left of bubble) */}
                {isOwnMessage && (
                    <MessageOptionsDropdown 
                        message={message} 
                        onDelete={onDelete} 
                        onReply={onReply}
                        onForward={onForward}
                        onStartEdit={() => {
                            setEditText(message.message || '');
                            setIsEditing(true);
                        }}
                    />
                )}
                
                <div
                    className={
                        'chat-bubble relative max-w-sm ' +
                        (isOwnMessage ? 'chat-bubble-info' : '')
                    }
                >
                    {/* Forwarded Badge */}
                    {message.is_forwarded && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-200/90 mb-1.5 italic font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-slate-350">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Forwarded
                        </div>
                    )}

                    {/* Reply Quotation Box */}
                    {message.parent && (
                        <div 
                            onClick={handleJumpToParent}
                            className="bg-black/20 border-l-4 border-info rounded px-2 py-1 mb-2 text-xs cursor-pointer hover:bg-black/30 transition-colors max-w-full truncate"
                        >
                            <div className="font-bold text-gray-300 truncate">
                                {message.parent.sender_id === currentUser.id ? 'You' : message.parent.sender.name}
                            </div>
                            <div className="text-gray-400 truncate">
                                {message.parent.message || 'Attachment'}
                            </div>
                        </div>
                    )}

                    {/* Image Grid */}
                    {renderImageGrid()}

                    {/* Other Attachments (video, audio, files) */}
                    {otherAttachments.map((attachment, index) =>
                        renderOtherAttachment(attachment, index)
                    )}

                    {/* Inline Editing vs Standard Message Text */}
                    {isEditing ? (
                        <div className="w-[260px] md:w-[320px] p-1">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full rounded-lg bg-slate-950/75 border border-slate-750/70 text-slate-100 text-sm p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                                rows={3}
                                autoFocus
                            />
                            <div className="flex justify-end gap-1.5 mt-2">
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveEdit}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    disabled={!editText.trim() || editText === message.message}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        message.message && (
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
                        )
                    )}
                </div>

                {/* Options dropdown for received messages (right of bubble) */}
                {!isOwnMessage && (
                    <MessageOptionsDropdown 
                        message={message} 
                        onDelete={onDelete} 
                        onReply={onReply}
                        onForward={onForward}
                        onStartEdit={() => {
                            setEditText(message.message || '');
                            setIsEditing(true);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default MessageItem;
