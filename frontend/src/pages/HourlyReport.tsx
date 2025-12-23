import { baseApi } from "apis/baseApi";
import { TextInput } from "components/textInput";
import { startTransition, useEffect, useState } from "react";
import { Brush, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toHumanReadableBytes } from "tools/misc";

export default function HourlyReport() {
    const lightColors = ["#6a5acd", "#ff6347", "#ffd700", "#40e0d0", "#ff69b4", "#ba55d3", "#87cefa", "#32cd32", "#ff4500", "#7fffd4"];
    const darkColors = ["#ff7f50", "#00ced1", "#7fff00", "#ff1493", "#ff4500", "#1e90ff", "#32cd32", "#ff6347", "#8a2be2", "#ffd700"];

    const [data, setData] = useState<IChartData[]>([]);
    const [dataKeys, setDataKeys] = useState<string[]>([]);
    const [totalData, setTotalData] = useState<{ date: string; total: number }[]>([]);
    const [count, setCount] = useState(720);
    const [iranTime, setIranTime] = useState(true);
    const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

    const isDark = () => document.body.classList.contains("dark");

    useEffect(() => {
        baseApi.getApi<IHourlyUsage[]>(`/v1/report/hourly?count=${count}`)
            .then(response => {
                const temp = convertToChartData(response ?? []);
                const tempKeys = Array.from(new Set(temp.flatMap(Object.keys))).filter(key => key !== 'date').sort();
                
                // Calculate total usage for each time point
                const tempTotal = temp.map(item => {
                    const total = tempKeys.reduce((sum, key) => {
                        const value = item[key];
                        return sum + (typeof value === 'number' ? value : 0);
                    }, 0);
                    return { date: item.date, total };
                });

                startTransition(() => {
                    setData(temp);
                    setDataKeys(tempKeys);
                    setTotalData(tempTotal);
                });
            })
            .catch(err => console.error(err));
    }, [count, iranTime]);

    const convertToChartData = (hourlyUsage: IHourlyUsage[]) => {
        return hourlyUsage.map(hourly => {
            const date = new Date(hourly.time * 1000);
            
            // Convert to Iran time (UTC+3:30) if checkbox is selected
            const displayDate = iranTime 
                ? new Date(date.getTime() + (3.5 * 60 * 60 * 1000))
                : date;
            
            const chartData: IChartData = {
                date: displayDate.toISOString()
            };

            hourly.usage?.forEach(item => {
                chartData[item.name] = item.value;
            });

            return chartData;
        });
    };

    const formatXAxis = (tickItem: number) => {
        const date = new Date(tickItem);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return hours === "00" ? `${year}-${month}-${day}` : `${hours}:${minutes}`;
    };

    const formatYAxis = (tickItem: number) => toHumanReadableBytes(tickItem) ?? "";

    const formatTooltip = (value: number | undefined, name: string | undefined) => {
        if (value === undefined) return ["", name ?? ""];
        return [toHumanReadableBytes(value), name ?? ""];
    };

    const handleLegendClick = (dataKey: string) => {
        setHiddenKeys(prev => {
            const newHidden = new Set(prev);
            
            if (newHidden.has(dataKey)) {
                newHidden.delete(dataKey);
            } else {
                newHidden.add(dataKey);
            }
            
            return newHidden;
        });
    };

    const visibleKeys = dataKeys.filter(key => !hiddenKeys.has(key));

    return (
        <div className="px-2">
            <div style={{ height: "calc(100vh - 40px)" }} className="pr-5">
                <h3 className="text-lg font-semibold mb-2">Usage by Server</h3>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        {visibleKeys.map((key, index) => (
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
                        <Legend onClick={(e) => e.dataKey && handleLegendClick(e.dataKey as string)} wrapperStyle={{ cursor: 'pointer' }} />
                        <Brush dataKey="date" height={30} stroke="#4d78f7" startIndex={data.length > 24 ? data.length - 24 : 0} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div style={{ height: "calc(100vh - 40px)" }} className="pr-5 mt-4">
                <h3 className="text-lg font-semibold mb-2">Total Usage</h3>
                <ResponsiveContainer>
                    <LineChart data={totalData}>
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke={isDark() ? "#00ced1" : "#6a5acd"}
                            strokeWidth={2}
                        />
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatXAxis} />
                        <YAxis tickFormatter={formatYAxis} />
                        <Tooltip formatter={formatTooltip} />
                        <Brush dataKey="date" height={30} stroke="#4d78f7" startIndex={totalData.length > 24 ? totalData.length - 24 : 0} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="flex gap-2 flex-col pt-10 pb-20">
                <div className="flex gap-1 items-center">
                    <TextInput
                        className="grow"
                        type="number"
                        onChange={e => setCount(+e.target.value)}
                        value={count}
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={iranTime}
                            onChange={e => setIranTime(e.target.checked)}
                            className="cursor-pointer"
                        />
                        <span>Iran Time</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
