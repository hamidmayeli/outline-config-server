import { createContext, useState, useMemo, useCallback } from "react";
import { hookHack } from "./hookHack";
import { loadCurrentUser, removeCurrentUser, saveCurrentUser } from "tools/userStorage";
import { logoutApi } from "apis/user";

export const AppContext = createContext({} as {
    currentUser?: ICurrentUser,
    login: (user: ICurrentUser) => void,
    logout: () => void,
});

export default function AppContextProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [currentUser, setCurrentUser] = useState(loadCurrentUser());

    const login = useCallback((user: ICurrentUser) => {
        saveCurrentUser(user);
        setCurrentUser(user);
    }, []);

    const logout = useCallback(() => {
        logoutApi()
            .then(() => {
                removeCurrentUser();
                setCurrentUser(undefined);
            })
            .catch(() => { });
    }, []);

    const contextValue = useMemo(() => ({
        currentUser,
        login,
        logout,
    }), [currentUser, login, logout]);

    hookHack.logout = contextValue.logout;
    hookHack.login = contextValue.login;

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

