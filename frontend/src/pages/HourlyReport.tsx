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
    const [weekComparisonData, setWeekComparisonData] = useState<any[]>([]);
    const [weekComparisonKeys, setWeekComparisonKeys] = useState<string[]>([]);
    const [count, setCount] = useState(720);
    const [iranTime, setIranTime] = useState(true);
    const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

    const isDark = () => document.body.classList.contains("dark");

    const calculateWeekComparison = (hourlyUsage: IHourlyUsage[]) => {
        if (hourlyUsage.length === 0) return [];
        
        // Get the last Unix timestamp
        const lastTimestamp = Math.max(...hourlyUsage.map(h => h.time));
        const weekInSeconds = 7 * 24 * 60 * 60; // 7 days in seconds

        // Calculate beginning of the week for the last timestamp
        const beginningOfLastWeekTimestamp = lastTimestamp - weekInSeconds;
        
        // Group data by week index and position within week
        const weekData: { [weekIndex: number]: { timestamp: number; total: number }[] } = {};
        
        hourlyUsage.forEach(hourly => {
            const timeDiff = lastTimestamp - hourly.time;
            const weekIndex = Math.floor(timeDiff / weekInSeconds);

            // Calculate position within the week
            const weekStartTimestamp = beginningOfLastWeekTimestamp - (weekIndex * weekInSeconds);
            const positionInWeek = hourly.time - weekStartTimestamp;
            
            // Calculate total usage for this time point
            const total = hourly.usage?.reduce((sum, item) => sum + item.value, 0) || 0;
            
            if (!weekData[weekIndex]) weekData[weekIndex] = [];
            weekData[weekIndex].push({ timestamp: beginningOfLastWeekTimestamp + positionInWeek, total });
        });
        
        // Get sorted week indices
        const weekIndices = Object.keys(weekData).map(Number).sort((a, b) => a - b);
        if (weekIndices.length === 0) return [];
        
        // Find the week with most data points to use as reference
        const referenceWeekIndex = weekIndices.reduce((maxIdx, idx) => 
            weekData[idx].length > weekData[maxIdx].length ? idx : maxIdx
        , weekIndices[0]);
        
        // Sort each week's data by timestamp
        weekIndices.forEach(idx => {
            weekData[idx].sort((a, b) => a.timestamp - b.timestamp);
        });
        
        // Create comparison data based on position in week
        const maxLength = Math.max(...weekIndices.map(idx => weekData[idx].length));
        const comparison = [];
        
        for (let i = 0; i < maxLength; i++) {
            const dataPoint: any = {};
            
            // Use the reference week's timestamp for the x-axis
            if (i < weekData[referenceWeekIndex].length) {
                const refTime = weekData[referenceWeekIndex][i].timestamp;
                const date = new Date(refTime * 1000);
                const displayDate = iranTime 
                    ? new Date(date.getTime() + (3.5 * 60 * 60 * 1000))
                    : date;
                dataPoint.time = displayDate.toISOString();
            } else {
                continue; // Skip if no reference data
            }
            
            // Add data from each week
            weekIndices.forEach(weekIndex => {
                const weekLabel = weekIndex === 0 ? 'Current Week' 
                    : weekIndex === 1 ? 'Last Week'
                    : `${weekIndex} Weeks Ago`;

                const week = weekData[weekIndex];
                const targetTimestamp = weekData[referenceWeekIndex][i].timestamp;
                
                dataPoint[weekLabel] = week.find(item => Math.abs(item.timestamp - targetTimestamp) < 30)?.total ?? null;
            });
            
            comparison.push(dataPoint);
        }
        
        return comparison;
    };

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

                // Calculate week-over-week comparison using raw Unix time data
                const tempComparison = calculateWeekComparison(response ?? []);
                const tempComparisonKeys = tempComparison.length > 0 
                    ? Object.keys(tempComparison[0]).filter(key => key !== 'time')
                    : [];

                startTransition(() => {
                    setData(temp);
                    setDataKeys(tempKeys);
                    setTotalData(tempTotal);
                    setWeekComparisonData(tempComparison);
                    setWeekComparisonKeys(tempComparisonKeys);
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
        <div className="px-2 grid grid-cols-1 gap-10">
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
            <div style={{ height: "calc(100vh - 40px)" }} className="pr-5">
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
            <div style={{ height: "calc(100vh - 40px)" }} className="pr-5">
                <h3 className="text-lg font-semibold mb-2">Week-over-Week Comparison</h3>
                <ResponsiveContainer>
                    <LineChart data={weekComparisonData}>
                        {weekComparisonKeys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={isDark() ? darkColors[index % darkColors.length] : lightColors[index % lightColors.length]}
                                strokeWidth={2}
                                name={key}
                                connectNulls
                            />
                        ))}
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={formatXAxis} />
                        <YAxis tickFormatter={formatYAxis} />
                        <Tooltip formatter={formatTooltip} />
                        <Legend />
                        <Brush dataKey="time" height={30} stroke="#4d78f7" startIndex={weekComparisonData.length > 24 ? weekComparisonData.length - 24 : 0} />
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
