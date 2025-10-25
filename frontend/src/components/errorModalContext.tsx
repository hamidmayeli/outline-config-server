import { createContext, useCallback, useMemo, useState } from "react";
import { hookHack } from "./hookHack";

export interface IErrorDetails {
    message: string;
    details?: string;
    statusCode?: number;
    url?: string;
}

export const ErrorModalContext = createContext<{
    error: IErrorDetails | null;
    showError: (error: IErrorDetails) => void;
    clearError: () => void;
}>({
    error: null,
    showError: () => { },
    clearError: () => { },
});

export function ErrorModalContextProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [error, setError] = useState<IErrorDetails | null>(null);

    const showError = useCallback((errorDetails: IErrorDetails) => {
        setError(errorDetails);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const contextValue = useMemo(() => ({
        error,
        showError,
        clearError,
    }), [error, showError, clearError]);

    // Connect to hookHack for use outside React components
    hookHack.showError = contextValue.showError;

    return (
        <ErrorModalContext.Provider value={contextValue}>
            {children}
        </ErrorModalContext.Provider>
    );
}
