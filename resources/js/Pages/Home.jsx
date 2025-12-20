import ChatLayout from '@/Layouts/ChatLayout.jsx';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { useEffect, useRef, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageItem from '@/Components/App/MessageItem';
import MessageInput from '@/Components/App/MessageInput';
import ImageViewer from '@/Components/App/ImageViewer';
import { useEventBus } from '@/EventBus';

function Home({ selectedConversation = null, messages = null }) {
    const [localMessages, setLocalMessages] = useState([]);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [fetchingOlderMessages, setFetchingOlderMessages] = useState(false);
    const messagesContainerRef = useRef(null);
    const loadMoreIntersect = useRef(null);
    const { on } = useEventBus();

    // Image viewer state
    const [viewerImages, setViewerImages] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [showViewer, setShowViewer] = useState(false);

    const openImageViewer = (images, index) => {
        setViewerImages(images);
        setViewerIndex(index);
        setShowViewer(true);
    };

    const closeImageViewer = () => {
        setShowViewer(false);
        setViewerImages([]);
        setViewerIndex(0);
    };

    const loadOlderMessages = async () => {
        if (noMoreMessages || fetchingOlderMessages || localMessages.length === 0) return;

        const oldestMessage = localMessages[0];
        if (!oldestMessage) return;

        console.log('Fetching older messages before:', oldestMessage.id);
        setFetchingOlderMessages(true);

        const scrollHeightBefore = messagesContainerRef.current.scrollHeight;
        const scrollTopBefore = messagesContainerRef.current.scrollTop;

        try {
            const response = await axios.get(route('message.loadOlder', oldestMessage.id));
            console.log('LoadOlder response:', response.data);

            const messagesData = response.data.data || response.data;
            const newMessages = Array.isArray(messagesData) ? [...messagesData].reverse() : [];

            if (newMessages.length === 0) {
                console.log('No more messages to load');
                setNoMoreMessages(true);
                setFetchingOlderMessages(false);
                return;
            }

            setLocalMessages((prev) => {
                const existingIds = new Set(prev.map(m => m.id));
                const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
                return [...uniqueNewMessages, ...prev];
            });

            if (response.data.links && !response.data.links.next) {
                // No more pages - but we still prepended some messages
            }
            if (response.data.meta && response.data.meta.current_page >= response.data.meta.last_page) {
                setNoMoreMessages(true);
            }

            setTimeout(() => {
                if (messagesContainerRef.current) {
                    const scrollHeightAfter = messagesContainerRef.current.scrollHeight;
                    messagesContainerRef.current.scrollTop =
                        scrollHeightAfter - scrollHeightBefore + scrollTopBefore;
                }
            }, 0);

        } catch (error) {
            console.error("Error loading older messages:", error);
        } finally {
            setFetchingOlderMessages(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                console.log('Intersection Triggered:', entry.isIntersecting);
                if (entry.isIntersecting && !noMoreMessages && localMessages.length > 0) {
                    loadOlderMessages();
                }
            },
            {
                root: messagesContainerRef.current,
                threshold: 0.1, // Trigger when even a little visible
                rootMargin: '100px 0px 0px 0px', // Preload a bit before reaching exact top
            }
        );

        if (loadMoreIntersect.current) {
            observer.observe(loadMoreIntersect.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [noMoreMessages, localMessages]);

    useEffect(() => {
        setTimeout(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop =
                    messagesContainerRef.current.scrollHeight;
            }
        }, 10);
    }, [selectedConversation]);

    useEffect(() => {
        const offCreated = on('message.created', (message) => {
            if (
                selectedConversation &&
                parseInt(message.group_id) === parseInt(selectedConversation.id)
            ) {
                setLocalMessages((prev) => {
                    const exists = prev.find((m) => m.id === message.id);
                    if (exists) return prev;

                    setTimeout(() => {
                        if (messagesContainerRef.current) {
                            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                        }
                    }, 50);

                    return [...prev, message];
                });
            } else if (
                selectedConversation &&
                !message.group_id &&
                (parseInt(message.sender_id) ===
                    parseInt(selectedConversation.id) ||
                    parseInt(message.receiver_id) ===
                    parseInt(selectedConversation.id))
            ) {
                setLocalMessages((prev) => {
                    const exists = prev.find((m) => m.id === message.id);
                    if (exists) return prev;

                    setTimeout(() => {
                        if (messagesContainerRef.current) {
                            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                        }
                    }, 50);

                    return [...prev, message];
                });
            }
        });

        return () => {
            offCreated();
        };
    }, [selectedConversation]);

    useEffect(() => {
        if (messages) {
            setLocalMessages(messages.data.reverse());
            setNoMoreMessages(false); // Reset when conversation changes
        } else {
            setLocalMessages([]);
            setNoMoreMessages(true);
        }
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
                        {/* Loading Spinner / Intersection Target */}
                        <div ref={loadMoreIntersect} className="h-2"></div>

                        {fetchingOlderMessages && (
                            <div className="text-center py-2">
                                <span className="loading loading-spinner loading-md text-slate-400"></span>
                            </div>
                        )}

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
                                    <MessageItem
                                        key={msg.id}
                                        message={msg}
                                        openImageViewer={openImageViewer}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </div>
            )}

            {/* Image Viewer Modal */}
            {showViewer && viewerImages.length > 0 && (
                <ImageViewer
                    images={viewerImages}
                    initialIndex={viewerIndex}
                    onClose={closeImageViewer}
                />
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
