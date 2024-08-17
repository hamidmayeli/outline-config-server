import { baseApi } from "./baseApi";

export async function loginApi(
    username: string,
    password: string
): Promise<ICurrentUser | undefined> {
    return await baseApi
        .postApi("/v1/auth/login", {username, password});
}

export function logoutApi(){
    return baseApi.deleteApi("/v1/auth/login");
}

