import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '@/Components/App/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, options = {}) => {
        const { isGroup = false, duration = 5000 } = options;
        // Generate unique ID to force re-render for same message
        const id = Date.now();
        setToast({ message, isGroup, id });

        // Auto-dismiss after duration
        setTimeout(() => {
            setToast((current) => {
                if (current?.id === id) {
                    return null;
                }
                return current;
            });
        }, duration);
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <Toast
                message={toast?.message}
                isGroup={toast?.isGroup}
                onClose={hideToast}
            />
        </ToastContext.Provider>
    );
};

export default ToastContext;
