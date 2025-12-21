interface IHourlyUsageItem {
    id: string;
    name: string;
    value: number;
}

interface IHourlyUsage {
    time: number; // Unix timestamp in seconds
    usage: IHourlyUsageItem[];
}
