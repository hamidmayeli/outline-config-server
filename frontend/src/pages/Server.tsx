import { baseApi } from "apis/baseApi";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toHumanReadableBytes } from "tools/misc";

export default function Server() {
    const { serverId } = useParams();

    const [serverInfo, setServerInfo] = useState<IServerInfo | undefined>();
    const [keys, setKeys] = useState<IAccessKeyResponse[]>([]);

    const compare = (a: IAccessKeyResponse, b: IAccessKeyResponse) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    };

    useEffect(() => {
        baseApi.getApi<IServerInfo>(`/v1/server/${serverId}`)
            .then(res => {
                setServerInfo(res);
            })
            .catch(err => console.error(err));

        baseApi.getApi<IAccessKeyResponse[]>(`/v1/server/${serverId}/keys`)
            .then(keys => {
                if (keys) {
                    keys.sort(compare)
                    setKeys(keys);
                }
            })
            .catch(err => console.error(err));
    }, [serverId]);

    const copyToClipboard = (accessUrl: string) => {
        navigator.clipboard.writeText(accessUrl)
            .then(() => alert("Copied!"))
            .catch(() => { });
    };

    if (serverInfo)
        return (
            <>
                <h1 className="text-2xl text-center mb-5">{serverInfo.name}</h1>
                {keys.map(key => (<div key={key.id} className="flex boxed-area mb-2 items-center">
                    <div className="w-1/3">{key.name}</div>
                    <div className="flex-grow">
                        <span>{toHumanReadableBytes(key.dataLimit.consumed)}</span>{key.dataLimit.bytes ? (<span> / {toHumanReadableBytes(key.dataLimit.bytes)}</span>) : null}
                    </div>
                    <div className="flex flex-col gap-1">
                        <button className="btn"
                            onClick={() => copyToClipboard(key.accessUrl + '#' + key.name)}>
                            Copy
                        </button>
                        {key.configUrl ? (
                            <button className="btn"
                                onClick={() => copyToClipboard(key.configUrl!)}>
                                Copy as Config
                            </button>
                        ) : null}
                    </div>
                </div>))}
            </>
        );
    else
        return (<h3>Loading...</h3>);
}