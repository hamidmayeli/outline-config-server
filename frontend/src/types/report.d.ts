interface IUsageSnapshot {
    timeStamp: string;
    usage: Record<string, number>;
    details?: Array<{
        server: string,
        key: string,
        usage: number,
    }>
}

interface IChartData {
    date: string; // ISO string representation of date
    [key: string]: number | string; // Allows dynamic keys for each name
}
