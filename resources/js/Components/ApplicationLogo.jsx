export default function ApplicationLogo({ className = '' }) {
    return (
        <img
            src="/images/logo.png"
            alt="Pulse Messenger"
            className={`h-16 w-auto ${className}`}
        />
    );
}
