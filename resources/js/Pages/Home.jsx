import ChatLayout from '@/Layouts/ChatLayout.jsx';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { useEffect, useRef, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageItem from '@/Components/App/MessageItem';
import MessageInput from '@/Components/App/MessageInput';
import { useEventBus } from '@/EventBus';

function Home({ selectedConversation = null, messages = null }) {
    const [localMessages, setLocalMessages] = useState([]);
    const messagesContainerRef = useRef(null);
    const { on } = useEventBus();

    useEffect(() => {
        setTimeout(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop =
                    messagesContainerRef.current.scrollHeight;
            }
        }, 10);
    }, [selectedConversation, localMessages]);

    useEffect(() => {
        const offCreated = on('message.created', (message) => {
            if (
                selectedConversation &&
                parseInt(message.group_id) === parseInt(selectedConversation.id)
            ) {
                setLocalMessages((prev) => [...prev, message]);
            } else if (
                selectedConversation &&
                parseInt(message.group_id) === 0 &&
                (parseInt(message.sender_id) ===
                    parseInt(selectedConversation.id) ||
                    parseInt(message.receiver_id) ===
                    parseInt(selectedConversation.id))
            ) {
                setLocalMessages((prev) => [...prev, message]);
            }
        });

        return () => {
            offCreated();
        };
    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : []);
    }, [messages]);

    return (
        <>
            {!messages && (
                <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                    <div className="text-2xl md:text-4xl p-16 text-slate-200">
                        Please select conversation to see messages
                    </div>
                    <ChatBubbleLeftRightIcon className="w-32 h-32 inline-block" />
                </div>
            )}
            {messages && (
                <div className="flex flex-col h-full">
                    <ConversationHeader
                        selectedConversation={selectedConversation}
                    />

                    <div
                        ref={messagesContainerRef}
                        className="flex-1 overflow-y-auto p-5"
                    >
                        {localMessages.length === 0 && (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-lg text-slate-200">
                                    No messages found
                                </div>
                            </div>
                        )}
                        {localMessages.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {localMessages.map((msg) => (
                                    <MessageItem key={msg.id} message={msg} />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </div>
            )}
        </>
    );
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
};

export default Home;
