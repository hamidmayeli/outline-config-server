import { baseApi } from "apis/baseApi";
import { TextInput } from "components/textInput";
import { startTransition, useEffect, useState } from "react";
import { Brush, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toHumanReadableBytes } from "tools/misc";

export default function Report() {
    const lightColors = ["#6a5acd", "#ff6347", "#ffd700", "#40e0d0", "#ff69b4", "#ba55d3", "#87cefa", "#32cd32", "#ff4500", "#7fffd4"];
    const darkColors = ["#ff7f50", "#00ced1", "#7fff00", "#ff1493", "#ff4500", "#1e90ff", "#32cd32", "#ff6347", "#8a2be2", "#ffd700"];

    const [data, setData] = useState<IChartData[]>([]);
    const [dataKeys, setDataKeys] = useState<string[]>([]);
    const [oldLogs, setOldLogs] = useState(30);
    const [loadCount, reload] = useState(1);

    const isDark = () => document.body.classList.contains("dark");

    useEffect(() => {
        baseApi.getApi<IUsageSnapshot[]>("/v1/report")
            .then(response => {
                const temp = convertToChartData(response ?? [])
                const tempKeys = Array.from(new Set(temp.flatMap(Object.keys))).filter(key => key !== 'date').sort();

                startTransition(() => {
                    setData(temp);
                    setDataKeys(tempKeys);
                });
            })
            .catch(err => console.error(err));

    }, [loadCount]);

    const convertToChartData = (usageSnapshots: IUsageSnapshot[]) => {
        const groupedData: Record<string, IChartData> = {};

        // Iterate over each snapshot
        usageSnapshots.forEach(snapshot => {
            const dateKey = new Date(snapshot.timeStamp).toISOString(); // Use ISO format for consistent key

            // Initialize the object for this date if it doesn't exist
            if (!groupedData[dateKey]) {
                groupedData[dateKey] = { date: dateKey };
            }

            // Add each usage entry to the corresponding date object
            for (const [name, value] of Object.entries(snapshot.usage)) {
                groupedData[dateKey][name] = value;
            }

            let sum = 0;

            for (const [name, value] of Object.entries(snapshot.usage)) {
                if (name !== "date")
                    sum += value;
            }

            groupedData[dateKey]["_all"] = sum;
        });

        // Convert grouped data into an array
        return Object.values(groupedData);
    };

    const formatXAxis = (tickItem: number) => {
        const date = new Date(tickItem);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const formatYAxis = (tickItem: number) => toHumanReadableBytes(tickItem) ?? "";

    const formatTooltip = (value: number, name: string) => {
        return [toHumanReadableBytes(value), name];
    };

    const createALog = () => {
        baseApi.putApi("/v1/report")
            .then(() => reload(loadCount + 1))
            .catch(err => console.error(err));
    };

    const deleteOldLogs = () => {
        baseApi.deleteApi(`/v1/report/${oldLogs}`)
            .then(() => reload(loadCount + 1))
            .catch(err => console.error(err));
    };

    return (
        <>
            <div style={{ height: "calc(100vh - 70px)" }}>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        {dataKeys.map((key, index) => (
                            <Line
                                key={index}
                                type="monotone"
                                dataKey={key}
                                stroke={isDark() ? darkColors[index % darkColors.length] : lightColors[index % lightColors.length]}
                            />
                        ))}
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatXAxis} />
                        <YAxis tickFormatter={formatYAxis} />
                        <Tooltip formatter={formatTooltip} />
                        <Legend />
                        <Brush dataKey="date" height={30} stroke="#4d78f7" startIndex={data.length > 10 ? data.length - 10 : 0} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="flex gap-2 flex-col pt-10">
                <button className="btn" onClick={createALog}>Create a log</button>
                <div className="flex gap-1">
                    <TextInput
                        className="grow"
                        type="number"
                        onChange={e => setOldLogs(+e.target.value)}
                        value={oldLogs}
                    />
                    <button className="btn grow" onClick={deleteOldLogs}>Delete old logs</button>
                </div>
            </div>
        </>
    );
}
