import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon, LockClosedIcon, LockOpenIcon, UserIcon } from '@heroicons/react/24/solid';
import { Link, usePage } from '@inertiajs/react';

export default function UserOptionsDropdown({ conversation }) {
    const page = usePage();
    const currentUser = page.props.auth.user;

    const onBlockUser = () => {
        console.log('Block/Unblock user');
        if (!conversation.is_user) {
            return;
        }

        const method = conversation.blocked_at ? 'delete' : 'post';
        const routeName = conversation.blocked_at ? 'user.unblock' : 'user.block';

        axios[method](route(routeName, conversation.id))
            .then((res) => {
                console.log(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/40">
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
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={onBlockUser}
                                    className={`${active ? 'bg-gray-700 text-gray-100' : 'text-gray-200'
                                        } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                    {conversation.blocked_at ? (
                                        <>
                                            <LockOpenIcon className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                                            Unblock User
                                        </>
                                    ) : (
                                        <>
                                            <LockClosedIcon className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
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
    )
}
