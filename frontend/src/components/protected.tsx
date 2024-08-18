import { useContext, Suspense } from "react";
import { AppContext } from "./appContext";
import { Navigate, useLocation } from "react-router-dom";

export default function Protected({
    children,
}: {
    children: JSX.Element,
}) {
    const { currentUser } = useContext(AppContext);
    const theLocation = useLocation();

    return (
        <>
            {!currentUser && <Navigate to={`/login?returnUrl=${encodeURIComponent(theLocation.pathname + theLocation.search)}`} replace />}
            <Suspense>{children}</Suspense>
        </>
    );
}

