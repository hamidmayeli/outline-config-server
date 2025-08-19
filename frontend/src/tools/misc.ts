export const forceEnglishDigits = (value: string): string => {
    return value
        // iOS digits
        .replace(/٠/g, "0")
        .replace(/١/g, "1")
        .replace(/٢/g, "2")
        .replace(/٣/g, "3")
        .replace(/۴/g, "4")
        .replace(/۵/g, "5")
        .replace(/۶/g, "6")
        .replace(/٧/g, "7")
        .replace(/٨/g, "8")
        .replace(/٩/g, "9")
        // Android digits
        .replace(/۰/g, "0")
        .replace(/۱/g, "1")
        .replace(/۲/g, "2")
        .replace(/۳/g, "3")
        .replace(/۴/g, "4")
        .replace(/۵/g, "5")
        .replace(/۶/g, "6")
        .replace(/۷/g, "7")
        .replace(/۸/g, "8")
        .replace(/۹/g, "9");
};

export const simpleCrypto = {
    hideObject: <T>(data: T) => {
        const serializedState = JSON.stringify(data);
        return btoa(new TextEncoder().encode(serializedState).toString());
    },

    revealObject: <T>(data: string) => {
        const serializedState = new TextDecoder().decode(new Uint8Array(atob(data).split(",").map(x => +x)));
        return JSON.parse(serializedState) as T;
    }
};

export function toParagraph(value: string) {
    return value
        .replace("\r\n", "\n")
        .split("\n");
}

export function toHumanReadableBytes(value: number){
    const round = (v: number) => Math.round(v * 100) / 100;
    
    if(value < 1000)
        return `${value} B`;

    if(value < 1000000)
        return `${round(value / 1000)} KB`;

    if(value < 1000000000)
        return `${round(value / 1000000)} MB`;

    if(value < 1000000000000)
        return `${round(value / 1000000000)} GB`;

    return `${round(value / 1000000000000)} TB`;

}
