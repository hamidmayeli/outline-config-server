import { privateStorage } from "./privateStorage";

const userStorageKey = "ed457k";

export function loadCurrentUser() {
    return privateStorage.load<ICurrentUser>(userStorageKey);
}

export function saveCurrentUser(user: ICurrentUser) {
    privateStorage.save(userStorageKey, user);
}

export function removeCurrentUser() {
    privateStorage.remove(userStorageKey);
}

