import { useState } from 'react';
import {
    PaperAirplaneIcon,
    PaperClipIcon,
    PhotoIcon,
    FaceSmileIcon,
    HandThumbUpIcon,
} from '@heroicons/react/24/solid';
import NewMessageInput from './NewMessageInput';
import axios from 'axios';
import { useEventBus } from '@/EventBus';

const MessageInput = ({ conversation = null }) => {
    const [newMessage, setNewMessage] = useState('');
    const [inputErrorMessage, setInputErrorMessage] = useState('');
    const [messageSending, setMessageSending] = useState(false);
    const { emit } = useEventBus();

    const onSendClick = () => {
        if (messageSending) {
            return;
        }
        if (newMessage.trim() === '') {
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

        setMessageSending(true);
        axios
            .post(route('message.store'), formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded / progressEvent.total) * 100
                    );
                    console.log(progress);
                },
            })
            .then((response) => {
                setNewMessage('');
                setMessageSending(false);
                emit('message.created', response.data);
            })
            .catch((error) => {
                setMessageSending(false);
            });
    };

    const onLikeClick = () => {
        if (messageSending) return;
        const formData = new FormData();
        formData.append('message', '👍');
        if (conversation.is_user) {
            formData.append('receiver_id', conversation.id);
        } else if (conversation.is_group) {
            formData.append('group_id', conversation.id);
        }
        setMessageSending(true);
        axios.post(route('message.store'), formData).then((response) => {
            setMessageSending(false);
            emit('message.created', response.data);
        });
    }

    return (
        <div className="flex items-center gap-4 border-t border-slate-700 py-3 px-3">
            {/* Left: Attachment Icons */}
            <div className="flex gap-1">
                <button className="p-2 text-gray-400 hover:text-gray-300 relative">
                    <PaperClipIcon className="w-5 h-5" />
                    <input
                        type="file"
                        multiple
                        className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-300 relative">
                    <PhotoIcon className="w-5 h-5" />
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
            </div>

            {/* Center: Input Field */}
            <div className="flex-1 relative">
                <div className="rounded-3xl bg-slate-800 border border-slate-700">
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
            <div className="flex gap-1">
                <button className="p-2 text-gray-400 hover:text-gray-300">
                    <FaceSmileIcon className="w-5 h-5" />
                </button>
                <button onClick={onLikeClick} className="p-2 text-gray-400 hover:text-gray-300">
                    <HandThumbUpIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
