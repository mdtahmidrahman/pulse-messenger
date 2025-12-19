const UserAvatar = ({ user, online = null, profile = false }) => {
    const sizeClass = profile ? 'w-40 h-40' : 'w-8 h-8';
    const indicatorSize = profile ? 'w-4 h-4' : 'w-2.5 h-2.5';

    return (
        <div className="relative">
            {user.avatar_url && (
                <div className="avatar">
                    <div className={`rounded-full ${sizeClass}`}>
                        <img src={user.avatar_url} alt={user.name} />
                    </div>
                </div>
            )}

            {!user.avatar_url && (
                <div className="avatar placeholder">
                    <div
                        className={`bg-gray-400 text-gray-800 rounded-full flex items-center justify-center ${sizeClass}`}
                    >
                        <span className={profile ? 'text-3xl' : 'text-sm'}>
                            {user.name.substring(0, 1).toUpperCase()}
                        </span>
                    </div>
                </div>
            )}

            {online !== null && (
                <span
                    className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-slate-800 ${indicatorSize} ${online ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                />
            )}
        </div>
    );
};

export default UserAvatar;
