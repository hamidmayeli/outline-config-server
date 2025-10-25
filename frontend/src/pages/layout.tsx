import "global.css";
import Header from "components/header";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppContextProvider from "components/appContext";
import { Spinner } from "components/spinner";
import { AlertContextProvider } from "components/alertContext";
import Alert from "components/alert";
import UpdateNotification from "components/UpdateNotification";
import { ErrorModalContextProvider } from "components/errorModalContext";
import ErrorModal from "components/errorModal";

export default function RootLayout() {
    const stored = localStorage.getItem("isDark")?.toLocaleLowerCase();
    const currentTheme = stored ? stored === "true" :
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    const [isDark, setIsDark] = useState(currentTheme);

    document.body.className = isDark ? "dark" : "";

    const changeTheme = (dark: boolean) => {
        setIsDark(dark);
        localStorage.setItem("isDark", dark.toString());
    };

    return (
        <AppContextProvider>
            <ErrorModalContextProvider>
                <AlertContextProvider>
                    <Alert />
                    <ErrorModal />
                    <Spinner />
                    <UpdateNotification />
                    <div className="bg-slate-50 dark:bg-gray-950 flex flex-col-reverse md:flex-col min-h-screen">
                        <Header
                            themeChanged={changeTheme}
                            isDark={isDark}
                        />
                        <div className={`max-w-5xl p-1 md:p-2 mx-auto w-full flex-1
                          text-slate-800 dark:text-slate-200`}>
                            <Outlet />
                        </div>
                    </div>
                </AlertContextProvider>
            </ErrorModalContextProvider>
        </AppContextProvider>
    );
}
