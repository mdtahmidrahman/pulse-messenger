import { Head, Link } from '@inertiajs/react';

export default function Error({ status }) {
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
    }[status];

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers.',
        404: 'Message Undeliverable: The page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page.',
    }[status];

    return (
        <>
            <Head title={title} />
            <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 text-base-content">
                <div className="text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="rounded-full bg-base-100 p-6 shadow-xl">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-24 w-24 text-error"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10C22 6.48 17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-6h2v2H8zm4 0h2v2h-2zm4 0h2v2h-2z" />
                                <path
                                    d="M9 10a3 3 0 0 1 3-3 3 3 0 0 1 3 3v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2z"
                                    opacity=".3"
                                />
                                <path d="M12 2a9 9 0 0 0-9 9v11l3-3 3 3 3-3 3 3 3-3 3 3v-11a9 9 0 0 0-9-9zM8 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
                        {status}
                    </h1>

                    <p className="mb-8 text-xl text-base-content/80">{description}</p>

                    <Link href="/" className="btn btn-primary btn-lg gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                            />
                        </svg>
                        Return to Home
                    </Link>
                </div>
            </div>
        </>
    );
}
