import { baseApi } from "apis/baseApi";
import { TextInput } from "components/textInput";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toHumanReadableBytes } from "tools/misc";

export default function Server() {
    const { serverId } = useParams();

    const [serverInfo, setServerInfo] = useState<IServerInfo | undefined>();
    const [keys, setKeys] = useState<IAccessKeyResponse[]>([]);
    const [formData, setFormData] = useState<{ name?: string, limit: number }>({ limit: 0 });

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = evt.target;

        // save field values
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const save = async () => {
        if (formData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await baseApi.postApi<any, IAccessKeyResponse>(`/v1/key/${serverId}`, {
                name: formData.name,
                limit: formData.limit ? ({ bytes: formData.limit * 1000000000 }) : null,
            });

            if (response) {
                const list = [...keys, response];
                list.sort(compare);
                setKeys(list);
            }
        }
    };

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

    const getTotalUsage = () => {
        let result = 0;

        keys.map(key => result += key.dataLimit.consumed);

        return toHumanReadableBytes(result);
    };

    if (serverInfo)
        return (
            <>
                <h1 className="text-2xl text-center mb-5">{serverInfo.name}</h1>
                <div className="flex gap-5 mb-5">
                    <div className="boxed-area text-center grow">{getTotalUsage()}</div>
                    <div className="boxed-area text-center grow">{keys.length} Keys</div>
                </div>

                {keys.map(key => (<div key={key.id} className="flex boxed-area mb-2 items-center">
                    <div className="w-1/3">{key.name}</div>
                    <div className="flex-grow">
                        <span>{toHumanReadableBytes(key.dataLimit.consumed)}</span>{key.dataLimit.bytes ? (<span> / {toHumanReadableBytes(key.dataLimit.bytes)}</span>) : null}
                    </div>
                    <div className="flex flex-col gap-1">
                        <button className="btn w-20"
                            onClick={() => copyToClipboard(`${key.accessUrl}#${encodeURIComponent(key.name + " - " + serverInfo.name)}`)}>
                            Url
                        </button>
                        {key.configUrl ? (
                            <button className="btn w-20"
                                onClick={() => copyToClipboard(key.configUrl!)}>
                                Config
                            </button>
                        ) : null}
                    </div>
                </div>))}

                <div className="boxed-area mb-2 items-center">
                    <div className="flex gap-1">
                        <div className="w-1/3">
                            <TextInput
                                className="w-full"
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Name"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grow flex items-center">
                            <TextInput
                                className="w-full"
                                id="accessKey"
                                name="accessKey"
                                type="number"
                                placeholder="Limit"
                                onChange={handleChange}
                                required
                            />
                            <span className="-ms-7">GB</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button className="btn w-20" onClick={save}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    else
        return (<h3>Loading...</h3>);
}
