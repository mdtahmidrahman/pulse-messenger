import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import TextInput from '@/Components/TextInput';
import ConversationItem from '@/Components/App/ConversationItem';
import { useEventBus } from '@/EventBus';

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const { on } = useEventBus();

    const isUserOnline = (userId) => !!onlineUsers[userId];

    const onSearch = (ev) => {
        const search = ev.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search);
            })
        );
    };

    // Listen for new messages and update conversation list
    useEffect(() => {
        const offMessageCreated = on('message.created', (message) => {
            console.log('ChatLayout received message:', message);
            setLocalConversations((prevConversations) => {
                return prevConversations.map((conversation) => {
                    // Check if this message belongs to this conversation
                    let isMatch = false;

                    if (message.group_id) {
                        // Group message
                        isMatch = conversation.is_group && parseInt(conversation.id) === parseInt(message.group_id);
                    } else {
                        // Direct message - match if conversation is with sender OR receiver
                        isMatch = !conversation.is_group && (
                            parseInt(conversation.id) === parseInt(message.sender_id) ||
                            parseInt(conversation.id) === parseInt(message.receiver_id)
                        );
                    }

                    if (isMatch) {
                        console.log('Updating conversation:', conversation.name, 'with new message');

                        // Determine last message text
                        let lastMessageText = message.message;
                        if (!lastMessageText && message.attachments?.length > 0) {
                            const hasImage = message.attachments.some(a => a.mime?.startsWith('image/'));
                            const hasVideo = message.attachments.some(a => a.mime?.startsWith('video/'));
                            if (hasImage) lastMessageText = 'Photo';
                            else if (hasVideo) lastMessageText = 'Video';
                            else lastMessageText = 'Attachment';
                            if (message.attachments.length > 1) {
                                lastMessageText += ` (${message.attachments.length})`;
                            }
                        }

                        return {
                            ...conversation,
                            last_message: lastMessageText,
                            last_message_sender: conversation.is_group && message.sender?.name
                                ? message.sender.name.split(' ')[0]
                                : null,
                            last_message_sender_id: message.sender_id,
                            last_message_date: message.created_at,
                        };
                    }
                    return conversation;
                });
            });
        });

        return () => {
            offMessageCreated();
        };
    }, [on]);

    // Listen for message deletions and update sidebar
    useEffect(() => {
        const offMessageDeleted = on('message.deleted', (deletedMessage) => {
            console.log('ChatLayout received message deleted:', deletedMessage);
            setLocalConversations((prevConversations) => {
                return prevConversations.map((conversation) => {
                    let isMatch = false;

                    if (deletedMessage.group_id) {
                        isMatch = conversation.is_group && parseInt(conversation.id) === parseInt(deletedMessage.group_id);
                    } else {
                        isMatch = !conversation.is_group && (
                            parseInt(conversation.id) === parseInt(deletedMessage.sender_id) ||
                            parseInt(conversation.id) === parseInt(deletedMessage.receiver_id)
                        );
                    }

                    if (isMatch) {
                        return {
                            ...conversation,
                            last_message: 'Message deleted',
                            last_message_sender: null,
                            last_message_sender_id: null,
                        };
                    }
                    return conversation;
                });
            });
        });

        return () => {
            offMessageDeleted();
        };
    }, [on]);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        const sorted = [...localConversations].sort((a, b) => {
            if (a.blocked_at && b.blocked_at) {
                return a.blocked_at > b.blocked_at ? 1 : -1;
            } else if (a.blocked_at) {
                return -1;
            } else if (b.blocked_at) {
                return 1;
            }
            if (a.last_message_date && b.last_message_date)
                return b.last_message_date.localeCompare(
                    a.last_message_date,
                );
            else if (a.last_message_date) return -1;
            else if (b.last_message_date) return 1;
            else return 0;
        });
        setSortedConversations(sorted);
    }, [localConversations]);

    useEffect(() => {
        Echo.join('online')
            .here((users) => {
                const onlineUsersObj = Object.fromEntries(
                    users.map((user) => [user.id, user]),
                );
                setOnlineUsers((prevOnlineUsers) => {
                    return { ...prevOnlineUsers, ...onlineUsersObj };
                });
            })
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                });
            })
            .leaving((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    delete updatedUsers[user.id];
                    return updatedUsers;
                });
            })
            .error((error) => {
                console.log('error', error);
            });

        return () => {
            Echo.leave('online');
        };
    }, []);

    return (
        <>
            <div className="flex w-full h-full flex-1 overflow-hidden">
                {/* Sidebar - Conversation List */}
                <div
                    className={`
                        absolute inset-0 z-20 flex flex-col overflow-hidden bg-slate-800 transition-transform duration-300 ease-in-out
                        sm:relative sm:z-auto sm:w-[220px] md:w-[300px] sm:translate-x-0
                        ${selectedConversation ? '-translate-x-full' : 'translate-x-0'}
                    `}
                >
                    <div className='flex items-center justify-between py-2 px-3 text-xl'>
                        My Conversations

                        <div className='tooltip tooltip-left'
                            data-tip="Create New Group">
                        </div>

                        <button className='text-gray-400 hover:text-gray-200'>
                            <svg className="w-4 h-4 inline-block ml-2"
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                            </svg>
                        </button>
                    </div>
                    <div className='p-3'>
                        <TextInput onKeyUp={onSearch}
                            placeholder="Filter Users and Groups"
                            className="w-full"
                        >
                        </TextInput>
                    </div>

                    <div className='flex-1 overflow-auto'>
                        {
                            sortedConversations && sortedConversations.map((conversation) => (
                                <ConversationItem
                                    key={`${conversation.is_group ? 'group_' : 'user_'}${conversation.id}`}
                                    conversation={conversation}
                                    online={isUserOnline(conversation.id)}
                                    selectedConversation={selectedConversation}
                                />
                            ))
                        }
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </>
    );
};
export default ChatLayout;
