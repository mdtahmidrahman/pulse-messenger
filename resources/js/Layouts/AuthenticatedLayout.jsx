import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useEventBus } from '@/EventBus';
import { useToast } from '@/ToastContext';

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const user = page.props.auth.user;
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const { emit, on } = useEventBus();
    const { showToast } = useToast();

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    // Listen for new message notifications and show toast
    useEffect(() => {
        const offNotification = on('newMessageNotification', (data) => {
            // Check if the message is from the currently selected conversation
            let isCurrentConversation = false;

            if (selectedConversation) {
                if (data.group_id) {
                    // Group message
                    isCurrentConversation = selectedConversation.is_group &&
                        parseInt(selectedConversation.id) === parseInt(data.group_id);
                } else {
                    // Direct message
                    isCurrentConversation = !selectedConversation.is_group &&
                        parseInt(selectedConversation.id) === parseInt(data.user.id);
                }
            }

            // Show toast only if NOT from the current conversation
            if (!isCurrentConversation) {
                const senderName = data.user.name.split(' ')[0];
                const messagePreview = data.message.length > 50
                    ? data.message.substring(0, 50) + '...'
                    : data.message;
                showToast(`${senderName}: ${messagePreview}`, { isGroup: !!data.group_id });
            }
        });

        return () => {
            offNotification();
        };
    }, [on, selectedConversation, showToast]);

    useEffect(() => {
        conversations.forEach((conversation) => {
            let channel = `message.group.${conversation.id}`;

            if (conversation.is_user) {
                channel = `message.user.${[
                    parseInt(user.id),
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

                    if (message.sender_id === user.id) {
                        return;
                    }

                    emit('newMessageNotification', {
                        user: message.sender,
                        group_id: message.group_id,
                        message:
                            message.message ||
                            `Shared ${message.attachments.length === 1
                                ? 'an attachment'
                                : message.attachments.length + ' attachments'
                            }`,
                    });
                })
                .listen('SocketMessageDeleted', (e) => {
                    console.log('SocketMessageDeleted', e);
                    emit('message.deleted', e.message);
                });
        });

        return () => {
            conversations.forEach((conversation) => {
                let channel = `message.group.${conversation.id}`;

                if (conversation.is_user) {
                    channel = `message.user.${[
                        parseInt(user.id),
                        parseInt(conversation.id),
                    ]
                        .sort((a, b) => a - b)
                        .join('-')}`;
                }
                Echo.leave(channel);
            });
        };
    }, [conversations]);
    return (
        <div className="h-screen flex flex-col bg-base-200 overflow-hidden">
            <nav className="border-b border-base-300 bg-base-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-base-content" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('home')}
                                    active={route().current('home')}
                                >
                                    Home
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-md border border-transparent bg-base-100 px-3 py-2 text-sm font-medium leading-4 text-base-content transition duration-150 ease-in-out hover:text-base-content/80 focus:outline-none"
                                            >
                                                {/* Avatar */}
                                                {user.avatar_url ? (
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.name}
                                                        className="w-6 h-6 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="w-6 h-6 rounded-full bg-gray-400 text-gray-800 flex items-center justify-center text-xs font-medium">
                                                        {user.name.substring(0, 1).toUpperCase()}
                                                    </span>
                                                )}
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-base-content transition duration-150 ease-in-out hover:bg-base-200 hover:text-base-content focus:bg-base-200 focus:text-base-content focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('home')}
                            active={route().current('home')}
                        >
                            Home
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-base-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-base-content">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-base-content/70">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-base-100 shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
