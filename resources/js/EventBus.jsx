import React, { createContext, useContext, useState } from 'react';

const EventBusContext = createContext();

export const EventBusProvider = ({ children }) => {
    const listenersRef = React.useRef({});

    const emit = (name, data) => {
        if (listenersRef.current[name]) {
            listenersRef.current[name].forEach((callback) => callback(data));
        }
    };

    const on = (name, callback) => {
        if (!listenersRef.current[name]) {
            listenersRef.current[name] = [];
        }
        listenersRef.current[name].push(callback);

        // Return unsubscribe function
        return () => {
            if (listenersRef.current[name]) {
                listenersRef.current[name] = listenersRef.current[name].filter(
                    (cb) => cb !== callback
                );
            }
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
