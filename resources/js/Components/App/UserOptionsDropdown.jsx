import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
    EllipsisVerticalIcon,
    LockClosedIcon,
    LockOpenIcon,
    ShieldCheckIcon,
    UserIcon
} from '@heroicons/react/24/solid';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';

export default function UserOptionsDropdown({ conversation }) {
    const page = usePage();
    const currentUser = page.props.auth.user;

    // Only show for admin users and for user conversations (not groups)
    if (!currentUser.is_admin || !conversation.is_user) {
        return null;
    }

    // Don't show actions for self
    if (conversation.id === currentUser.id) {
        return null;
    }

    const onBlockUnblock = () => {
        axios.post(route('user.blockUnblock', conversation.id))
            .then((res) => {
                console.log(res.data);
                // Refresh the page to show updated status
                router.reload({ only: ['conversations'] });
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const onChangeRole = () => {
        axios.post(route('user.changeRole', conversation.id))
            .then((res) => {
                console.log(res.data);
                // Refresh the page to show updated status
                router.reload({ only: ['conversations'] });
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/40 transition-colors">
                    <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {/* Change Role Option */}
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={onChangeRole}
                                    className={`${active ? 'bg-slate-700' : ''
                                        } group flex w-full items-center px-4 py-2 text-sm text-gray-200`}
                                >
                                    {conversation.is_admin ? (
                                        <>
                                            <UserIcon className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                                            Make Regular User
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheckIcon className="mr-2 h-5 w-5 text-emerald-400" aria-hidden="true" />
                                            Make Admin
                                        </>
                                    )}
                                </button>
                            )}
                        </Menu.Item>

                        {/* Block/Unblock Option */}
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={onBlockUnblock}
                                    className={`${active ? 'bg-slate-700' : ''
                                        } group flex w-full items-center px-4 py-2 text-sm ${conversation.blocked_at ? 'text-emerald-400' : 'text-red-400'
                                        }`}
                                >
                                    {conversation.blocked_at ? (
                                        <>
                                            <LockOpenIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                                            Unblock User
                                        </>
                                    ) : (
                                        <>
                                            <LockClosedIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                                            Block User
                                        </>
                                    )}
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
