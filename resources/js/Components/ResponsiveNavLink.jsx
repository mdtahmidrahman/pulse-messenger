import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${active
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400 focus:border-emerald-500 focus:bg-emerald-500/20 focus:text-emerald-300'
                    : 'border-transparent text-gray-100 hover:border-gray-500 hover:bg-gray-700/50 hover:text-white focus:border-gray-500 focus:bg-gray-700/50 focus:text-white'
                } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
