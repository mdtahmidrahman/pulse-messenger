import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import UserAvatar from './UserAvatar';
import axios from 'axios';

const ForwardMessageModal = ({ message, onClose }) => {
    const page = usePage();
    const conversations = page.props.conversations || [];
    const [searchQuery, setSearchQuery] = useState('');
    const [forwardingTargets, setForwardingTargets] = useState({}); // stores state of each: 'sending', 'sent', 'error'

    const filteredConversations = conversations.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleForward = async (conversation) => {
        const targetId = `${conversation.is_group ? 'group' : 'user'}-${conversation.id}`;
        
        setForwardingTargets((prev) => ({ ...prev, [targetId]: 'sending' }));
        
        try {
            const payload = {
                message_id: message.id,
            };
            if (conversation.is_user) {
                payload.receiver_id = conversation.id;
            } else if (conversation.is_group) {
                payload.group_id = conversation.id;
            }

            await axios.post(route('message.forward'), payload);
            
            setForwardingTargets((prev) => ({ ...prev, [targetId]: 'sent' }));
        } catch (err) {
            console.error('Failed to forward message:', err);
            setForwardingTargets((prev) => ({ ...prev, [targetId]: 'error' }));
            alert(err.response?.data?.message || 'Failed to forward message. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="flex flex-col w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
                    <h3 className="text-lg font-bold text-gray-100">Forward Message</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-slate-800"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Preview of Forwarded Message */}
                <div className="px-6 py-3 bg-slate-850/50 border-b border-slate-700/40 text-xs">
                    <span className="text-gray-400 font-semibold uppercase tracking-wider block mb-1">Preview</span>
                    <div className="text-gray-300 italic truncate max-w-full">
                        {message.message || (message.attachments?.length > 0 ? `${message.attachments.length} attachment(s)` : 'Attachment')}
                    </div>
                </div>

                {/* Search Box */}
                <div className="px-6 py-3">
                    <div className="relative flex items-center bg-slate-800 border border-slate-700 rounded-xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 ml-3 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search people or groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-gray-200 text-sm py-2.5 px-3"
                        />
                    </div>
                </div>

                {/* Recipient List */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 divide-y divide-slate-800/60">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No contacts found
                        </div>
                    ) : (
                        filteredConversations.map((conversation) => {
                            const targetId = `${conversation.is_group ? 'group' : 'user'}-${conversation.id}`;
                            const status = forwardingTargets[targetId];

                            return (
                                <div 
                                    key={targetId} 
                                    className="flex items-center justify-between py-3.5"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <UserAvatar user={conversation} />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold text-gray-200 truncate">
                                                {conversation.name}
                                            </span>
                                            {conversation.is_group && (
                                                <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-0.5">
                                                    Group
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleForward(conversation)}
                                        disabled={status === 'sending' || status === 'sent'}
                                        className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out shrink-0 ${
                                            status === 'sent'
                                                ? 'bg-emerald-700 cursor-default opacity-80'
                                                : status === 'sending'
                                                ? 'bg-slate-700 cursor-not-allowed opacity-50'
                                                : status === 'error'
                                                ? 'bg-red-600 hover:bg-red-500 active:bg-red-700'
                                                : 'bg-emerald-600 hover:bg-emerald-500 focus:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:bg-emerald-700'
                                        }`}
                                    >
                                        {status === 'sending' && 'Sending...'}
                                        {status === 'sent' && 'Sent ✓'}
                                        {status === 'error' && 'Retry'}
                                        {!status && 'Forward'}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForwardMessageModal;
