import { baseApi } from "apis/baseApi";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toHumanReadableBytes } from "tools/misc";

export default function Server() {
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
                if (keys)
                    setKeys(keys);
            })
            .catch(err => console.error(err));
    }, [serverId]);

    if (serverInfo)
        return (
            <>
                <h1>{serverInfo.name}</h1>
                {keys.map(key => (<div key={key.id} className="flex border-b">
                    <div className="w-1/3">{key.name}</div>
                    <div><span>{toHumanReadableBytes(key.dataLimit.consumed)}</span> / <span>{(key.dataLimit.bytes ? toHumanReadableBytes(key.dataLimit.bytes) : "∞")}</span></div>
                </div>))}
            </>
        );
    else
        return (<h3>Loading...</h3>);
}