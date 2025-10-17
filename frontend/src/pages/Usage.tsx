import { baseApi } from "apis/baseApi";
import { ServerName } from "components/serverName";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toHumanReadableBytes } from "tools/misc";

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FFC658', '#FF6B9D', '#C084FC', '#34D399',
    '#F472B6', '#60A5FA', '#A78BFA', '#FB923C', '#4ADE80',
    '#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
    '#6366F1', '#F43F5E', '#22D3EE', '#A855F7', '#FBBF24'
];

export default function Usage() {
    const { serverId } = useParams();
    const [serverInfo, setServerInfo] = useState<IServerInfo | undefined>();
    const [keys, setKeys] = useState<IAccessKeyResponse[]>([]);

    useEffect(() => {
        baseApi.getApi<IServerInfo>(`/v1/server/${serverId}`)
            .then(res => {
                setServerInfo(res);
            })
            .catch(err => console.error(err));

        baseApi.getApi<IAccessKeyResponse[]>(`/v1/server/${serverId}/keys`)
            .then(keys => {
                if (keys) {
                    setKeys(keys);
                }
            })
            .catch(err => console.error(err));
    }, [serverId]);

    const getChartData = () => {
        return keys
            .filter(key => key.dataLimit.consumed > 0)
            .map(key => ({
                name: key.name,
                value: key.dataLimit.consumed,
                displayValue: toHumanReadableBytes(key.dataLimit.consumed)
            }));
    };

    const getTotalUsage = () => {
        let result = 0;
        keys.forEach(key => result += key.dataLimit.consumed);
        return toHumanReadableBytes(result);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p className="text-sm">{payload[0].payload.displayValue}</p>
                </div>
            );
        }
        return null;
    };

    if (serverInfo) {
        const chartData = getChartData();
        const hasData = chartData.length > 0;

        return (
            <>
                <ServerName serverInfo={serverInfo} />
                
                <div className="flex gap-5 mb-5">
                    <div className="boxed-area text-center grow">
                        <h3 className="text-lg font-semibold mb-2">Total Usage</h3>
                        <p className="text-2xl">{getTotalUsage()}</p>
                    </div>
                    <div className="boxed-area text-center grow">
                        <h3 className="text-lg font-semibold mb-2">Active Keys</h3>
                        <p className="text-2xl">{chartData.length} / {keys.length}</p>
                    </div>
                </div>

                <div className="boxed-area mb-5 overflow-hidden">
                    <h2 className="text-xl font-bold mb-4 text-center">Usage Distribution by Key</h2>
                    
                    {hasData ? (
                        <div className="w-full" style={{ height: '450px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={130}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.map((_entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={COLORS[index % COLORS.length]} 
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <p className="text-lg">No usage data available yet</p>
                            <p className="text-sm mt-2">Keys will appear here once they start consuming data</p>
                        </div>
                    )}
                </div>

                {hasData && (
                    <div className="boxed-area">
                        <h3 className="text-lg font-semibold mb-3">Usage Details</h3>
                        <div className="space-y-2">
                            {[...chartData].sort((a, b) => b.value - a.value).map((item, index) => {
                                const totalUsage = chartData.reduce((sum, d) => sum + d.value, 0);
                                const percentage = ((item.value / totalUsage) * 100).toFixed(1);
                                const originalIndex = chartData.findIndex(d => d.name === item.name);
                                
                                return (
                                    <div 
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: COLORS[originalIndex % COLORS.length] }}
                                            />
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {item.displayValue}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400 font-semibold min-w-[3.5rem] text-right">
                                                {percentage}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </>
        );
    } else {
        return (<h3>Loading...</h3>);
    }
}
