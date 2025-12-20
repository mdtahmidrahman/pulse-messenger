import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/solid';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const fileInput = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            avatar: null,
            _method: 'PATCH',
        });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const triggerFileInput = () => {
        fileInput.current.click();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
        });
    };

    // Determine avatar source
    const getAvatarSrc = () => {
        if (previewUrl) return previewUrl;
        if (user.avatar) return `/storage/${user.avatar}`;
        // Generate initials avatar
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`;
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-base-content">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-base-content/60">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <img
                            src={getAvatarSrc()}
                            alt="Profile Avatar"
                            className="w-20 h-20 rounded-full object-cover border-2 border-base-300"
                        />
                        <button
                            type="button"
                            onClick={triggerFileInput}
                            className="absolute bottom-0 right-0 bg-primary text-primary-content rounded-full p-1.5 shadow-lg hover:bg-primary-focus transition-colors"
                        >
                            <CameraIcon className="w-4 h-4" />
                        </button>
                        <input
                            type="file"
                            ref={fileInput}
                            className="hidden"
                            accept="image/jpeg,image/png,image/jpg,image/gif"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={triggerFileInput}
                            className="btn btn-sm btn-outline"
                        >
                            Change Avatar
                        </button>
                        <p className="text-xs text-base-content/60 mt-1">
                            JPG, PNG or GIF. Max 2MB.
                        </p>
                    </div>
                </div>

                <InputError className="mt-2" message={errors.avatar} />

                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-base-content">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-base-content/60 underline hover:text-base-content focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-base-content/60">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
