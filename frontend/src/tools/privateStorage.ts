import { simpleCrypto } from "./misc";

class PrivateStorage {
    public load<T>(key: string) {
        const serializedState = localStorage.getItem(key);
        try {
            return serializedState ? simpleCrypto.revealObject<T>(serializedState) : undefined;
        } catch (error) {
            localStorage.removeItem(key);
        }
    }

    public remove(key: string) {
        localStorage.removeItem(key);
    }

    public save<T>(key: string, content: T) {
        localStorage.setItem(key, simpleCrypto.hideObject(content));
    }

    public purge() {
        localStorage.clear();
    }

    public has(key: string) {
        return localStorage.getItem(key) !== null;
    }
}

export const privateStorage = new PrivateStorage();

