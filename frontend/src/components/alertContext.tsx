import { createContext, useCallback, useMemo, useState } from "react";

interface IMessage {
    text: string,
    key: number,
}

export const AlertContext = createContext<{
    alert: (message: string) => void,
    remove: (key: number) => void,
    messages: IMessage[],
}>({
    alert: window.alert,
    remove: () => { },
    messages: [],
});

export function AlertContextProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [messages, setMessages] = useState<IMessage[]>([]);

    const remove = useCallback((key: number) => {
        setMessages(messages.filter(m => m.key !== key));
    }, [messages]);

    const theAlert = useCallback((text: string) => {
        if (!messages.find(x => x.text === text))
            {
                const key = Date.now();
                setMessages([...messages, { text, key }]);
                setTimeout(() => remove(key), 15000);
            }
    }, [messages, remove]);

    window.alert = theAlert;

    const contextValue = useMemo(() => ({
        alert: theAlert,
        remove,
        messages,
    }), [theAlert, remove, messages]);

    return (
        <AlertContext.Provider value={contextValue}>{children}</AlertContext.Provider>
    );
}
