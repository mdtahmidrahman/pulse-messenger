import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

const MessageOptionsDropdown = ({ message, onDelete }) => {
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
                <Menu.Items className="absolute left-0 z-50 mt-1 w-32 origin-top-left rounded-md bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={handleDelete}
                                    className={`${active ? 'bg-slate-700' : ''
                                        } flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300`}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Delete
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default MessageOptionsDropdown;
