import { XMarkIcon, ChatBubbleLeftIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const Toast = ({ message, isGroup, onClose }) => {
    if (!message) return null;

    // Different styles for group vs direct messages
    const gradientClass = isGroup
        ? 'from-violet-600 to-purple-500 border-violet-400/30'
        : 'from-emerald-600 to-green-500 border-emerald-400/30';

    const labelText = isGroup ? 'New Group Message' : 'New Message';
    const labelColor = isGroup ? 'text-violet-100' : 'text-emerald-100';
    const Icon = isGroup ? UserGroupIcon : ChatBubbleLeftIcon;

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`bg-gradient-to-r ${gradientClass} text-white shadow-2xl rounded-xl px-4 py-3 max-w-sm border`}>
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="bg-white/20 rounded-full p-2 shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${labelColor} mb-0.5`}>{labelText}</p>
                        <p className="text-sm font-medium truncate">{message}</p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors shrink-0"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toast;
