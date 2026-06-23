import { Head, Link } from '@inertiajs/react';
import { ChatBubbleLeftRightIcon, ShieldCheckIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ canLogin, canRegister, isLoggedIn }) {
    // Primary brand colors
    const primaryColor = '#1fb6c0';

    return (
        <>
            <Head title="Welcome to Pulse Messenger" />
            
            <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-[#1fb6c0] selection:text-white flex flex-col font-sans">
                {/* Navbar - Distinct White/Dark background */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center">
                            {/* Increased logo size from h-8 to h-12 */}
                            <ApplicationLogo className="block h-12 w-auto fill-current" />
                        </div>
                        <div className="flex items-center gap-4">
                            {isLoggedIn ? (
                                <Link 
                                    href={route('home')} 
                                    className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all rounded-xl shadow-sm bg-[#1fb6c0] hover:bg-[#1898a0]"
                                >
                                    Open Chat
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link href={route('login')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                            Log in
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link 
                                            href={route('register')} 
                                            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all rounded-xl shadow-sm bg-[#1fb6c0] hover:bg-[#1898a0]"
                                        >
                                            Try Live Demo
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hero Section - Subtle off-white/gray gradient to differentiate from Navbar */}
                <main className="flex-grow flex flex-col justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900/50">
                    <div className="relative pt-20 pb-24 sm:pt-28 sm:pb-32">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                            <h1 className="max-w-4xl mx-auto text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6 leading-tight">
                                Self-hosted communication for <br className="hidden sm:block" />
                                <span style={{ color: primaryColor }}>modern teams.</span>
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                                Take back control of your data. Pulse Messenger is a blazing fast, self-hosted communication platform built strictly for privacy, speed, and technical teams.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-4">
                                {isLoggedIn ? (
                                    <Link 
                                        href={route('home')} 
                                        className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all rounded-xl shadow-sm bg-[#1fb6c0] hover:bg-[#1898a0]"
                                    >
                                        Go to Application
                                    </Link>
                                ) : (
                                    <>
                                        <Link 
                                            href={route('register')} 
                                            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all rounded-xl shadow-sm bg-[#1fb6c0] hover:bg-[#1898a0]"
                                        >
                                            Try Live Demo
                                        </Link>
                                        <Link 
                                            href={route('login')} 
                                            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors rounded-xl shadow-sm"
                                        >
                                            Login to Demo
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Features Section - Solid white/dark background to alternate with Hero */}
                    <div className="py-20 sm:py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-base font-semibold leading-7" style={{ color: primaryColor }}>Enterprise-Ready</h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">No-compromise messaging</p>
                            </div>
                            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                                <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                                    <div className="flex flex-col p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-slate-900 dark:text-white">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                                <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                            Real-time Sync
                                        </dt>
                                        <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                                            <p className="flex-auto">Experience instantaneous message delivery with optimized WebSockets. Never miss a critical update in your conversations.</p>
                                        </dd>
                                    </div>
                                    <div className="flex flex-col p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-slate-900 dark:text-white">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                                <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                            Secure & Private
                                        </dt>
                                        <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                                            <p className="flex-auto">Your data is safeguarded with robust security measures and a privacy-first architectural foundation.</p>
                                        </dd>
                                    </div>
                                    <div className="flex flex-col p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-slate-900 dark:text-white">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                                <DevicePhoneMobileIcon className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                            Cross-Platform
                                        </dt>
                                        <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                                            <p className="flex-auto">Maintain connectivity anywhere. Pulse Messenger provides a consistently responsive experience across all devices.</p>
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-10 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        {/* Increased logo size from h-6 to h-10 */}
                        <ApplicationLogo className="h-10 w-auto" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            &copy; 2026 Pulse Messenger. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
