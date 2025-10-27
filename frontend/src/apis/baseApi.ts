import { privateStorage } from "tools/privateStorage";
import { hookHack } from "components/hookHack";
import { runWhileShowingSpinner } from "components/spinner";
import { removeCurrentUser, saveCurrentUser } from "tools/userStorage";

class BaseAPI {
    public getApi<T>(url: string): Promise<T | undefined> {
        return this.callWithVerbApi("GET", url, undefined);
    }

    public postApi<I, T>(url: string, data?: I): Promise<T | undefined> {
        return this.callWithVerbApi("POST", url, data);
    }

    public putApi<I, T>(url: string, data?: I): Promise<T | undefined> {
        return this.callWithVerbApi("PUT", url, data);
    }

    public patchApi<I, T>(url: string, data?: I): Promise<T | undefined> {
        return this.callWithVerbApi("PATCH", url, data);
    }

    public deleteApi<I, T>(url: string, data?: I): Promise<T | undefined> {
        return this.callWithVerbApi("DELETE", url, data);
    }

    public getDefaultHeader(): Headers {
        const result = new Headers();

        this.addUserToken(result);

        result.append("Accept", "application/json");
        result.append("Content-Type", "application/json");

        return result;
    }

    public toAbsolute(url: string): string {
        return `${import.meta.env.VITE_API_HOST}${url}`;

    }

    public addUserToken = (headers: Headers) => {
        const user = privateStorage.load<ICurrentUser>("ed457k");
        if (user?.token) {
            headers.append("Authorization", "Bearer " + user.token);
        }
    };

    public refreshUserData = async () => {
        if (hookHack.hostname !== "localhost") {
            const user = await this.refreshToken();

            if (user) {
                try {
                    hookHack.login(user);
                } catch {
                    saveCurrentUser(user);
                }
            } else {
                try {
                    hookHack.logout();
                } catch {
                    removeCurrentUser();
                }
            }
        }
    };

    private async tryAction<T>(action: () => Promise<T | undefined>): Promise<T | undefined> {
        return await runWhileShowingSpinner(action);
    }

    private callWithVerbApi<I, T>(verb: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, data?: I): Promise<T | undefined> {
        return this.tryAction<T>(async () => {
            try {
                const headers = this.getDefaultHeader();

                let theData = data;

                if (data && !Array.isArray(data)) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                    const { rToken = undefined, ...temp } = data as any;

                    theData = temp as I;

                    if (rToken) {
                        headers.append("Recaptcha-Token", rToken as string);
                    }
                }

                const request = new Request(
                    this.toAbsolute(url),
                    {
                        method: verb,
                        mode: "cors",
                        body: theData ? JSON.stringify(theData) : undefined,
                        headers,
                    });

                const response = await fetch(request);

                if (response.status === 401) {
                    const retried = await this.refreshToken();

                    if (retried) {
                        hookHack.login(retried);
                        return this.callWithVerbApi(verb, url, data);
                    } else {
                        hookHack.logout();
                        await hookHack.navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                        throw Error("Token expired");
                    }
                }

                if (response.status === 404) {
                    return;
                }

                if (response.status >= 300) {
                    const errorMessage = await this.getErrorMessage(response);
                    
                    // Show error modal with details
                    try {
                        hookHack.showError({
                            message: errorMessage,
                            statusCode: response.status,
                            url: url,
                            details: response.statusText,
                        });
                    } catch {
                        // Fallback to alert if error modal not initialized
                        alert(errorMessage);
                    }
                    
                    const error = Error(errorMessage);
                    error.name = "Managed-Errors";
                    throw error;
                }

                if (response.status === 204) {
                    return;
                }

                return this.getContent<T>(response);
            } catch (error) {
                // Handle network errors (ERR_CONNECTION_REFUSED, ERR_NETWORK, etc.)
                if (error instanceof Error) {
                    // Check if it's a network error (not an error we already handled)
                    if (error.name !== "Managed-Errors") {
                        const errorMessage = this.getNetworkErrorMessage(error);
                        
                        try {
                            hookHack.showError({
                                message: errorMessage,
                                url: url,
                                details: error.message,
                            });
                        } catch {
                            // Fallback to alert if error modal not initialized
                            alert(errorMessage);
                        }
                    }
                }
                
                throw error;
            }
        });
    }

    private async refreshToken() {
        const request = new Request(
            this.toAbsolute("/v1/auth/refreshToken"),
            {
                method: "GET",
                mode: "cors",
                headers: this.getDefaultHeader(),
            });

        const response = await fetch(request);
        if (response.status === 200)
            return this.getContent<ICurrentUser>(response);
    }

    private async getContent<T>(response: Response): Promise<T | undefined> {
        const contentType = response.headers.get("content-type");
        if (contentType?.indexOf("application/json") === 0) {
            return await response.json() as T;
        }
    }

    private getErrorMessage = async (response: Response): Promise<string> => {
        const contentType = response.headers.get("content-type");
        if (contentType?.indexOf("application/json") === 0) {
            const json = await response.json() as { Message?: string, message?: string };

            const message = json.Message || json.message;

            if (message) { return message; }
        }

        return "Please contact the site administrator.";
    };

    private getNetworkErrorMessage = (error: Error): string => {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes("failed to fetch") || errorMessage.includes("networkerror")) {
            return "Unable to connect to the server. Please check your internet connection or try again later.";
        }
        
        if (errorMessage.includes("connection refused")) {
            return "Connection refused. The server may be offline or unreachable.";
        }
        
        if (errorMessage.includes("timeout")) {
            return "The request timed out. Please try again.";
        }
        
        if (errorMessage.includes("aborted")) {
            return "The request was aborted. Please try again.";
        }
        
        // Generic network error message
        return `Network error: ${error.message}`;
    };
}

const baseApi = new BaseAPI();

export { baseApi };
