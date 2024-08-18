import { useContext, Suspense } from "react";
import { AppContext } from "./appContext";
import { Navigate, useSearchParams } from "react-router-dom";

export default function Anonymous({ children }: { children: JSX.Element }) {
    const { currentUser } = useContext(AppContext);
    const [searchParam] = useSearchParams();

    const getNextLocation = () => {
        const returnUrl = searchParam.get("returnUrl");

        if (returnUrl)
            return returnUrl;

        return "/";
    };

    return (
        <>
            {currentUser && <Navigate to={getNextLocation()} replace />}
            <Suspense>{children}</Suspense>
        </>
    );
}

