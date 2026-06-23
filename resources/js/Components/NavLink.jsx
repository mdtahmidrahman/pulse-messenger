import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-primary text-base-content focus:border-primary-focus'
                    : 'border-transparent text-base-content/70 hover:border-base-300 hover:text-base-content focus:border-base-300 focus:text-base-content') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
