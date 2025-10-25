import { RouterNavigateOptions, To } from "react-router-dom";

interface IHookHack {
    navigate: (to: To | null, opts?: RouterNavigateOptions) => Promise<void>;
    login: (user: ICurrentUser) => void,
    logout: () => void,
    hostname: string,
    showError: (error: IErrorDetails) => void,
}

export const hookHack: IHookHack = {
    navigate: () => { throw new Error("not set yet"); },
    logout: () => { throw new Error("not set yet"); },
    login: () => { throw new Error("not set yet"); },
    hostname: window.location.hostname,
    showError: () => { throw new Error("not set yet"); },
};
