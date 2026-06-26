import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
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
        <Menu as="div" className="relative inline-flex items-center">
            <Menu.Button className="p-1 rounded-full hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100">
                <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-50 mt-1 w-32 origin-top-right rounded-md bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {/* Reply Option */}
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => onReply?.(message)}
                                    className={`${
                                        active ? 'bg-slate-700' : ''
                                    } flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200`}
                                >
                                    <ArrowUturnLeftIcon className="w-4 h-4 text-slate-400" />
                                    Reply
                                </button>
                            )}
                        </Menu.Item>

                        {/* Forward Option */}
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => onForward?.(message)}
                                    className={`${
                                        active ? 'bg-slate-700' : ''
                                    } flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200`}
                                >
                                    <ArrowRightIcon className="w-4 h-4 text-slate-400" />
                                    Forward
                                </button>
                            )}
                        </Menu.Item>

                        {/* Edit Option (Own & within 5 min only) */}
                        {isEditable && (
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => onStartEdit?.()}
                                        className={`${
                                            active ? 'bg-slate-700' : ''
                                        } flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200`}
                                    >
                                        <PencilIcon className="w-4 h-4 text-slate-400" />
                                        Edit
                                    </button>
                                )}
                            </Menu.Item>
                        )}

                        {/* Delete Option (Own only) */}
                        {isOwnMessage && (
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={handleDelete}
                                        className={`${
                                            active ? 'bg-slate-700' : ''
                                        } flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                    </button>
                                )}
                            </Menu.Item>
                        )}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default MessageOptionsDropdown;
