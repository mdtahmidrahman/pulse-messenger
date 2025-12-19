import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import TextInput from '@/Components/TextInput';
import ConversationItem from '@/Components/App/ConversationItem';
import { useEventBus } from '@/EventBus';

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversations = page.props.selectedConversations || [];
    console.log('conversations', conversations);
    console.log('selectedConversation', selectedConversations);
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const { emit } = useEventBus();

    const isUserOnline = (userId) => !!onlineUsers[userId];

    const onSearch = (ev) => {
        const search = ev.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search);
            })
        );
    };

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        setLocalConversations(conversations);

        conversations.forEach((conversation) => {
            let channel = `message.group.${conversation.id}`;
            if (conversation.is_user) {
                channel = `message.user.${[
                    parseInt(page.props.auth.user.id),
                    parseInt(conversation.id),
                ]
                    .sort((a, b) => a - b)
                    .join('-')}`;
            }

            Echo.private(channel)
                .error((error) => {
                    console.error(error);
                })
                .listen('SocketMessage', (e) => {
                    console.log('SocketMessage', e);
                    const message = e.message;
                    emit('message.created', message);
                    if (message.sender_id === page.props.auth.user.id) {
                        return;
                    }
                    emit('newMessageNotification', {
                        user: message.sender,
                        route_name: route('chat.user', message.sender_id),
                        message: `Sent you a message: ${message.message.substring(
                            0,
                            20
                        )}`,
                    });
                });
        });

        return () => {
            conversations.forEach((conversation) => {
                let channel = `message.group.${conversation.id}`;
                if (conversation.is_user) {
                    channel = `message.user.${[
                        parseInt(page.props.auth.user.id),
                        parseInt(conversation.id),
                    ]
                        .sort((a, b) => a - b)
                        .join('-')}`;
                }
                Echo.leave(channel);
            });
        };
    }, [conversations]);

    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
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
            }),
        );
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
                <div
                    className={`flex w-full h-full flex-col overflow-hidden bg-slate-800 transition-all sm:w-[220px] md:w-[300px] ${selectedConversations ? '-ml-[100%] sm:ml-0' : ''}`}
                >

                    <div className='flex items-center justify-between py-2 px-3 text-xl'
                    >
                        My Conversation

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
                    <div className='p-3 '>
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
                                    selectedConversation={selectedConversations}
                                />
                            ))
                        }
                    </div>


                </div>

                <div className="flex flex-1 flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </>
    );
};
export default ChatLayout;
