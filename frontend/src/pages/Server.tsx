import { baseApi } from "apis/baseApi";
import { ServerName } from "components/serverName";
import { TextInput } from "components/textInput";
import { startTransition, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toHumanReadableBytes } from "tools/misc";

export default function Server() {
    const { serverId } = useParams();

    const [deleteConfirmed, setDeleteConfirmed] = useState<string[]>([]);
    const [lastLoaded, setLastLoaded] = useState(Date.now);
    const [updatingKeyId, setUpdatingKeyId] = useState<string | undefined>();
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

    const save = () => {
        const promise = updatingKeyId ? update() : create();

        promise.then(() => alert("Saved")).catch(err => console.error(err));
    };

    const create = async () => {
        if (formData) {
            console.log({
                formData,
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await baseApi.postApi<any, IAccessKeyResponse>(`/v1/key/${serverId}`, {
                name: formData.name,
                limit: formData.limit ? ({ bytes: formData.limit * 1000000000 }) : null,
            });

            if (response) {
                const list = [...keys, response];
                list.sort(compare);
                setKeys(list);
                setFormData({ limit: 0, name: "" });
            }
        }
    }

    const update = async () => {
        if (formData) {
            console.log({
                formData,
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await baseApi.putApi<any, IAccessKeyResponse>(`/v1/key/${serverId}/${updatingKeyId}`, {
                name: formData.name,
                limit: formData.limit ? ({ bytes: formData.limit * 1000000000 }) : null,
            });

            startTransition(() => {
                setLastLoaded(Date.now);
                setFormData({ limit: 0, name: "" });
                setUpdatingKeyId(undefined);
            });
        }
    }

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
    }, [serverId, lastLoaded]);

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

    const getUpdatingKeyName = () => {
        const key = keys.find(x => x.id === updatingKeyId);

        return key?.name ?? "ERROR";
    };

    const deleteKey = (id: string) => {
        if (deleteConfirmed.indexOf(id) >= 0) {
            baseApi.deleteApi(`/v1/key/${serverId}/${id}`)
                .then(() => {
                    setKeys(keys.filter(x => x.id !== id));
                })
                .catch(err => console.error(err));
        } else {
            setDeleteConfirmed([...deleteConfirmed, id]);
        }
    };

    const selectForUpdate = (key: IAccessKeyResponse) => {
        startTransition(() => {
            setUpdatingKeyId(key.id);
            setFormData({
                limit: (key.dataLimit.bytes ?? 0) / 1000000000,
                name: key.name,
            });
        });
    };

    if (serverInfo)
        return (
            <>
                <ServerName serverInfo={serverInfo} />
                <div className="flex gap-5 mb-5">
                    <div className="boxed-area text-center grow">{getTotalUsage()}</div>
                    <div className="boxed-area text-center grow">{keys.length} Keys</div>
                </div>

                {keys.map(key => (<div key={key.id} className="flex boxed-area mb-2 items-center">
                    <div className="w-1/3" onClick={() => selectForUpdate(key)}>{key.name}</div>
                    <div className="grow">
                        <span>{toHumanReadableBytes(key.dataLimit.consumed)}</span>{key.dataLimit.bytes ? (<span> / {toHumanReadableBytes(key.dataLimit.bytes)}</span>) : null}
                    </div>
                    <div className="flex flex-col gap-1">
                        <button className="btn w-20"
                            onClick={() => copyToClipboard(`${key.accessUrl}#${encodeURIComponent(key.name + " - " + serverInfo.name)}`)}>
                            Url
                        </button>
                        <button className="btn w-20"
                            onClick={() => deleteKey(key.id)}>
                            {deleteConfirmed.indexOf(key.id) >= 0 ? "Delete" : "X"}
                        </button>
                        {key.configUrl ? (
                            <button className="btn w-20"
                                onClick={() => copyToClipboard(key.configUrl!)}>
                                Config
                            </button>
                        ) : null}
                        {key.cfUrl ? (
                            <button className="btn w-20"
                                onClick={() => copyToClipboard(key.cfUrl!)}>
                                CF
                            </button>
                        ) : null}
                    </div>
                </div>))}

                <div className="boxed-area mb-2 items-center">
                    <p>Add or update keys: {updatingKeyId ? `(Updating "${getUpdatingKeyName()}")` : "(Adding a new key)"}</p>
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
                                value={formData.name}
                            />
                        </div>
                        <div className="grow flex items-center">
                            <TextInput
                                className="w-full"
                                id="limit"
                                name="limit"
                                type="number"
                                placeholder="Limit"
                                onChange={handleChange}
                                required
                                value={formData.limit}
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
