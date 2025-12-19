const UserAvatar = ({ user, online = null, profile = false }) => {
    let onlineClass =
        online === true ? 'online' : online === false ? 'offline' : '';
    const sizeClass = profile ? 'w-40 h-40' : 'w-8 h-8';

    return (
        <>
            {user.avatar_url && (
                <div className={`avatar ${onlineClass}`}>
                    <div className={`rounded-full ${sizeClass}`}>
                        <img src={user.avatar_url} alt={user.name} />
                    </div>
                </div>
            )}

            {!user.avatar_url && (
                <div className={`avatar placeholder ${onlineClass}`}>
                    <div
                        className={`bg-gray-400 text-gray-800 rounded-full flex items-center justify-center ${sizeClass}`}
                    >
                        <span className={profile ? 'text-3xl' : 'text-sm'}>
                            {user.name.substring(0, 1).toUpperCase()}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserAvatar;
