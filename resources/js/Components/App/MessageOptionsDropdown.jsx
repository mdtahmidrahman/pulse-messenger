import { useState } from 'react';
import { 
    EllipsisVerticalIcon, 
    TrashIcon, 
    PencilIcon, 
    ArrowUturnLeftIcon, 
    ArrowRightIcon 
} from '@heroicons/react/24/solid';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

const MessageOptionsDropdown = ({ message, onDelete, onReply, onForward, onStartEdit }) => {
    const currentUser = usePage().props.auth.user;
    const isOwnMessage = message.sender_id === currentUser.id;
    const [isOpen, setIsOpen] = useState(false);

    // Check if the message is editable (within 5 minutes of sending)
    const isEditable = isOwnMessage && (new Date() - new Date(message.created_at)) < 5 * 60 * 1000;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }

        try {
            await axios.delete(route('message.destroy', message.id));
            onDelete?.(message.id);
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('Failed to delete message. Please try again.');
        }
    };

    return (
        <div className="relative inline-flex items-center">
            {/* Trigger Button */}
            <button 
                onClick={() => setIsOpen(true)}
                className="p-1 rounded-full hover:bg-black/20 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
                <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
            </button>

            {isOpen && (
                <>
                    {/* Click outside backdrop for desktop & mobile */}
                    <div 
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none transition-opacity duration-200" 
                        onClick={() => setIsOpen(false)} 
                    />

                    {/* Desktop Menu Options (sm+) */}
                    <div 
                        className={`hidden sm:block absolute z-50 mt-1 w-32 rounded-md bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
                            isOwnMessage ? 'left-0 top-full origin-top-left' : 'right-0 top-full origin-top-right'
                        }`}
                    >
                        <div className="py-1">
                            {/* Reply */}
                            <button
                                onClick={() => { onReply?.(message); setIsOpen(false); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors text-left"
                            >
                                <ArrowUturnLeftIcon className="w-4 h-4 text-slate-400" />
                                Reply
                            </button>

                            {/* Forward */}
                            <button
                                onClick={() => { onForward?.(message); setIsOpen(false); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors text-left"
                            >
                                <ArrowRightIcon className="w-4 h-4 text-slate-400" />
                                Forward
                            </button>

                            {/* Edit */}
                            {isEditable && (
                                <button
                                    onClick={() => { onStartEdit?.(); setIsOpen(false); }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors text-left"
                                >
                                    <PencilIcon className="w-4 h-4 text-slate-400" />
                                    Edit
                                </button>
                            )}

                            {/* Delete */}
                            {isOwnMessage && (
                                <button
                                    onClick={() => { handleDelete(); setIsOpen(false); }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-355 transition-colors text-left"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Bottom Sheet Menu (<sm) */}
                    <div 
                        className="sm:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setIsOpen(false)}
                    >
                        <div 
                            className="w-full bg-[#1e293b] border-t border-slate-700/60 rounded-t-2xl p-4 shadow-2xl animate-slide-up"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Visual Drag Handle Indicator */}
                            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />
                            
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
                                Message Options
                            </h4>
                            
                            <div className="flex flex-col gap-1">
                                {/* Reply */}
                                <button
                                    onClick={() => { onReply?.(message); setIsOpen(false); }}
                                    className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-slate-200 hover:bg-slate-800 active:bg-slate-800 rounded-xl transition-colors text-left"
                                >
                                    <ArrowUturnLeftIcon className="w-5 h-5 text-slate-455" />
                                    <span className="font-semibold text-slate-200">Reply</span>
                                </button>

                                {/* Forward */}
                                <button
                                    onClick={() => { onForward?.(message); setIsOpen(false); }}
                                    className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-slate-200 hover:bg-slate-800 active:bg-slate-800 rounded-xl transition-colors text-left"
                                >
                                    <ArrowRightIcon className="w-5 h-5 text-slate-455" />
                                    <span className="font-semibold text-slate-200">Forward</span>
                                </button>

                                {/* Edit */}
                                {isEditable && (
                                    <button
                                        onClick={() => { onStartEdit?.(); setIsOpen(false); }}
                                        className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-slate-200 hover:bg-slate-800 active:bg-slate-800 rounded-xl transition-colors text-left"
                                    >
                                        <PencilIcon className="w-5 h-5 text-slate-455" />
                                        <span className="font-semibold text-slate-200">Edit Message</span>
                                    </button>
                                )}

                                {/* Delete */}
                                {isOwnMessage && (
                                    <button
                                        onClick={() => { handleDelete(); setIsOpen(false); }}
                                        className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-red-400 hover:bg-slate-800 active:bg-slate-800 rounded-xl transition-colors text-left"
                                    >
                                        <TrashIcon className="w-5 h-5 text-red-500/80" />
                                        <span className="font-semibold">Delete Message</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MessageOptionsDropdown;
