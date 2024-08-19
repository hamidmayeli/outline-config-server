import "global.css";
import Header from "components/header";
import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import AppContextProvider from "components/appContext";
import { Spinner } from "components/spinner";
import { AlertContextProvider } from "components/alertContext";
import Alert from "components/alert";

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
            <AlertContextProvider>
                <Suspense></Suspense><Alert />
                <Spinner />
                <div className="bg-slate-50 dark:bg-gray-950">
                    <Header
                        themeChanged={changeTheme}
                        isDark={isDark}
                    />
                    <div className={`max-w-5xl p-1 md:p-2 mx-auto
                          min-h-[calc(100vh-theme(space.14))]
                          text-slate-800 dark:text-slate-200
                          h-14`}>
                        <Outlet />
                    </div>
                </div>
            </AlertContextProvider>
        </AppContextProvider>
    );
}
