import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function UserModal({ show, onClose, user = null }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        is_admin: false,
    });

    useEffect(() => {
        if (user) {
            // Edit mode - pre-fill form
            setData({
                name: user.name || '',
                email: user.email || '',
                is_admin: user.is_admin || false,
            });
        } else {
            // Create mode - reset form
            reset();
        }
    }, [user, show]);

    const submit = (e) => {
        e.preventDefault();

        if (user?.id) {
            // Update existing user
            put(route('user.update', user.id), {
                onSuccess: () => {
                    closeModal();
                },
            });
        } else {
            // Create new user
            post(route('user.store'), {
                onSuccess: () => {
                    closeModal();
                },
            });
        }
    };

    const closeModal = () => {
        reset();
        onClose();
    };

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-white"
                                    >
                                        {user ? 'Edit User' : 'Add New User'}
                                    </Dialog.Title>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={submit} className="space-y-4">
                                    <div>
                                        <InputLabel htmlFor="name" value="Name" className="text-gray-300" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            className="mt-1 block w-full bg-slate-700 border-slate-600 text-white"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            placeholder="Enter user's name"
                                        />
                                        <InputError className="mt-2" message={errors.name} />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="email" value="Email" className="text-gray-300" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full bg-slate-700 border-slate-600 text-white"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            placeholder="Enter user's email"
                                        />
                                        <InputError className="mt-2" message={errors.email} />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            id="is_admin"
                                            type="checkbox"
                                            className="checkbox checkbox-primary"
                                            checked={data.is_admin}
                                            onChange={(e) => setData('is_admin', e.target.checked)}
                                        />
                                        <InputLabel htmlFor="is_admin" value="Admin User" className="text-gray-300 cursor-pointer" />
                                    </div>

                                    {!user && (
                                        <p className="text-xs text-gray-400">
                                            A random password will be generated for the new user.
                                        </p>
                                    )}

                                    <div className="flex justify-end gap-3 mt-6">
                                        <SecondaryButton type="button" onClick={closeModal}>
                                            Cancel
                                        </SecondaryButton>
                                        <PrimaryButton type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : (user ? 'Update User' : 'Create User')}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
