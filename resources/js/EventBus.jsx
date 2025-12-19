import React, { createContext, useContext, useState } from 'react';

const EventBusContext = createContext();

export const EventBusProvider = ({ children }) => {
    const [listeners, setListeners] = useState({});

    const emit = (name, data) => {
        if (listeners[name]) {
            listeners[name].forEach((callback) => callback(data));
        }
    };

    const on = (name, callback) => {
        setListeners((prev) => {
            const callbacks = prev[name] || [];
            callbacks.push(callback);
            return { ...prev, [name]: callbacks };
        });

        // Return unsubscribe function
        return () => {
            setListeners((prev) => {
                const callbacks = prev[name] || [];
                return {
                    ...prev,
                    [name]: callbacks.filter((cb) => cb !== callback),
                };
            });
        };
    };

    return (
        <EventBusContext.Provider value={{ emit, on }}>
            {children}
        </EventBusContext.Provider>
    );
};

export const useEventBus = () => {
    return useContext(EventBusContext);
};
