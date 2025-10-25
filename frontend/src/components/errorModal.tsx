import { useContext, useEffect } from "react";
import { ErrorModalContext } from "components/errorModalContext";

export default function ErrorModal() {
    const { error, clearError } = useContext(ErrorModalContext);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && error) {
                clearError();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [error, clearError]);

    if (!error) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-red-500 text-white px-6 py-4">
                    <h2 className="text-xl font-bold">Error</h2>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-gray-800 dark:text-gray-200 mb-4">
                        {error.message || "An unexpected error occurred."}
                    </p>

                    {error.details && (
                        <div className="mt-4">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Details:
                            </h3>
                            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
                                <pre className="whitespace-pre-wrap break-words">
                                    {error.details}
                                </pre>
                            </div>
                        </div>
                    )}

                    {error.statusCode && (
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Status Code: {error.statusCode}
                        </p>
                    )}

                    {error.url && (
                        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 break-all">
                            URL: {error.url}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
                    <button
                        onClick={clearError}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
