self.addEventListener('push', function (event) {
    if (!event.data) {
        return;
    }

    try {
        const payload = event.data.json();
        const title = payload.title || 'New Message';
        const options = {
            body: payload.body || '',
            icon: payload.icon || '/images/logo.png',
            badge: payload.badge || '/images/logo.png',
            data: payload.data || {},
            vibrate: [100, 50, 100],
            actions: payload.actions || []
        };

        event.waitUntil(
            clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(function (clientList) {
                // If the app is open in any tab, suppress the background push notification.
                // The active tab's WebSocket / Echo listener will handle it.
                if (clientList && clientList.length > 0) {
                    console.log('App tab is open. Suppressing push notification.');
                    return;
                }
                return self.registration.showNotification(title, options);
            })
        );
    } catch (e) {
        console.error('Error handling push event:', e);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const actionUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (clientList) {
            // Try to find an existing open tab for the app and focus it
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                // Check if the client is at the same origin or matches action URL
                if ('focus' in client) {
                    return client.focus().then(fClient => {
                        // If browser supports postMessage, we can navigate the focused client
                        if (fClient.url !== actionUrl) {
                            return fClient.navigate(actionUrl);
                        }
                    });
                }
            }
            // If no open tabs, open a new window/tab
            if (clients.openWindow) {
                return clients.openWindow(actionUrl);
            }
        })
    );
});
