import { useState, useRef } from 'react';
import {
    PaperAirplaneIcon,
    PaperClipIcon,
    PhotoIcon,
    FaceSmileIcon,
    XMarkIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/solid';
import NewMessageInput from './NewMessageInput';
import axios from 'axios';
import { useEventBus } from '@/EventBus';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ conversation = null, replyingMessage = null, setReplyingMessage = null }) => {
    const [newMessage, setNewMessage] = useState('');
    const [inputErrorMessage, setInputErrorMessage] = useState('');
    const [messageSending, setMessageSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);
    const [chosenFiles, setChosenFiles] = useState([]);
    const { emit } = useEventBus();

    // Refs for file inputs
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const onFileChange = (ev) => {
        const files = Array.from(ev.target.files);
        setChosenFiles((prevFiles) => [...prevFiles, ...files]);
        ev.target.value = ''; // Reset input to allow selecting same file again
    };

    const removeFile = (index) => {
        setChosenFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const onSendClick = () => {
        if (messageSending) {
            return;
        }
        if (newMessage.trim() === '' && chosenFiles.length === 0) {
            setInputErrorMessage('Please provide a message or upload attachment.');
            setTimeout(() => {
                setInputErrorMessage('');
            }, 3000);
            return;
        }
        const formData = new FormData();
        formData.append('message', newMessage);
        if (conversation.is_user) {
            formData.append('receiver_id', conversation.id);
        } else if (conversation.is_group) {
            formData.append('group_id', conversation.id);
        }
        if (replyingMessage) {
            formData.append('parent_id', replyingMessage.id);
        }

        // Append files to FormData
        chosenFiles.forEach((file) => {
            formData.append('attachments[]', file);
        });

        setMessageSending(true);
        axios
            .post(route('message.store'), formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded / progressEvent.total) * 100
                    );
                    console.log('Upload progress:', progress + '%');
                },
            })
            .then((response) => {
                setNewMessage('');
                setChosenFiles([]);
                setReplyingMessage?.(null);
                setMessageSending(false);
                emit('message.created', response.data);
            })
            .catch((error) => {
                setMessageSending(false);
                console.error('Upload error:', error);
            });
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(newMessage + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="flex flex-col border-t border-slate-700">
            {/* Reply Preview */}
            {replyingMessage && (
                <div className="flex items-center justify-between bg-slate-850 px-4 py-2 border-b border-slate-700/60 transition-all animate-pop">
                    <div className="flex flex-col border-l-4 border-cyan-400 pl-3 min-w-0">
                        <span className="text-xs text-cyan-400 font-semibold">
                            Replying to {replyingMessage.sender.name}
                        </span>
                        <span className="text-xs text-gray-300 truncate">
                            {replyingMessage.message || 'Attachment'}
                        </span>
                    </div>
                    <button 
                        onClick={() => setReplyingMessage?.(null)}
                        className="text-gray-400 hover:text-gray-200 transition-colors p-1"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* File Preview Badges */}
            {chosenFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 pb-0">
                    {chosenFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-1.5 text-sm"
                        >
                            {file.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-8 h-8 object-cover rounded"
                                />
                            ) : (
                                <PaperClipIcon className="w-4 h-4 text-gray-400" />
                            )}
                            <div className="flex flex-col">
                                <span className="text-gray-200 max-w-[120px] truncate">
                                    {file.name}
                                </span>
                                <span className="text-gray-500 text-xs">
                                    {formatFileSize(file.size)}
                                </span>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="text-gray-400 hover:text-red-400 ml-1"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="flex items-center gap-2 sm:gap-4 py-3 px-2 sm:px-3">
                {/* Left: Attachment Icons */}
                <div className="flex items-center relative">
                    {/* Mobile Expand Attachments Button */}
                    <button
                        onClick={() => setShowAttachments(!showAttachments)}
                        className="sm:hidden p-2 text-gray-400 hover:text-gray-300 transition-transform"
                        style={{ transform: showAttachments ? 'rotate(45deg)' : 'rotate(0)' }}
                    >
                        <PlusCircleIcon className="w-6 h-6" />
                    </button>

                    {/* Mobile Floating Attachment Menu */}
                    {showAttachments && (
                        <>
                            {/* Backdrop */}
                            <div 
                                className="fixed inset-0 z-10 sm:hidden" 
                                onClick={() => setShowAttachments(false)} 
                            />
                            
                            <div className="absolute bottom-full left-0 mb-2 z-20 bg-slate-800 border border-slate-700 rounded-2xl p-2 shadow-lg flex flex-col gap-1 w-48 sm:hidden transform origin-bottom-left animate-pop">
                                <button
                                    onClick={() => { fileInputRef.current?.click(); setShowAttachments(false); }}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700 rounded-xl transition-colors text-gray-200 text-left"
                                >
                                    <div className="bg-indigo-500 p-2 rounded-full shadow-sm">
                                        <PaperClipIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-medium">Document</span>
                                </button>
                                
                                <button
                                    onClick={() => { imageInputRef.current?.click(); setShowAttachments(false); }}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700 rounded-xl transition-colors text-gray-200 text-left"
                                >
                                    <div className="bg-pink-500 p-2 rounded-full shadow-sm">
                                        <PhotoIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-medium text-sm">Photos & Videos</span>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Desktop Inline Attachment Buttons */}
                    <div className="hidden sm:flex gap-1">
                        <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-gray-300"
                    >
                        <PaperClipIcon className="w-5 h-5" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={onFileChange}
                        className="hidden"
                    />

                    <button
                        onClick={() => imageInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-gray-300"
                    >
                        <PhotoIcon className="w-5 h-5" />
                    </button>
                    <input
                        ref={imageInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={onFileChange}
                        className="hidden"
                    />
                    </div>
                </div>

                {/* Center: Input Field */}
                <div className="flex-1 relative">
                    <div className="rounded-2xl bg-slate-800 border border-slate-700 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all shadow-sm">
                        <NewMessageInput
                            value={newMessage}
                            onSend={onSendClick}
                            onChange={(ev) => setNewMessage(ev.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-gray-200 resize-none py-3 px-4 min-h-[44px] max-h-40"
                        />
                    </div>
                    {inputErrorMessage && (
                        <p className="text-xs text-red-400 mt-1 pl-2">{inputErrorMessage}</p>
                    )}
                </div>

                {/* Send Button */}
                <button
                    onClick={onSendClick}
                    disabled={messageSending}
                    className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 rounded-full p-3 shrink-0 transition-colors disabled:opacity-50 flex items-center justify-center w-12 h-12"
                >
                    {messageSending ? (
                        <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                        <PaperAirplaneIcon className="w-6 h-6" />
                    )}
                </button>

                {/* Right: Additional Icons */}
                <div className="flex gap-1 relative">
                    {/* Emoji Button */}
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-400 hover:text-gray-300"
                    >
                        <FaceSmileIcon className="w-5 h-5" />
                    </button>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <>
                            {/* Backdrop - closes picker when clicking outside */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowEmojiPicker(false)}
                            />
                            {/* Picker */}
                            <div className="absolute bottom-full right-0 z-20 mb-2">
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    theme="dark"
                                    width={320}
                                    height={400}
                                    searchPlaceholder="Search emoji..."
                                    previewConfig={{ showPreview: false }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageInput;
