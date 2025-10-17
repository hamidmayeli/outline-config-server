import { baseApi } from "apis/baseApi";
import { ServerName } from "components/serverName";
import { TextInput } from "components/textInput";
import { startTransition, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toHumanReadableBytes } from "tools/misc";

type SortCriteria = 'name' | 'consumed' | 'limit';
type SortDirection = 'asc' | 'desc';

export default function Server() {
    const { serverId } = useParams();

    const [deleteConfirmed, setDeleteConfirmed] = useState<string[]>([]);
    const [lastLoaded, setLastLoaded] = useState(Date.now);
    const [updatingKeyId, setUpdatingKeyId] = useState<string | undefined>();
    const [serverInfo, setServerInfo] = useState<IServerInfo | undefined>();
    const [keys, setKeys] = useState<IAccessKeyResponse[]>([]);
    const [formData, setFormData] = useState<{ name?: string, limit: number }>({ limit: 0 });
    const [sortCriteria, setSortCriteria] = useState<SortCriteria>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
                setKeys([...keys, response]);
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
        let comparison = 0;
        
        switch (sortCriteria) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'consumed':
                comparison = a.dataLimit.consumed - b.dataLimit.consumed;
                break;
            case 'limit':
                const aLimit = a.dataLimit.bytes ?? 0;
                const bLimit = b.dataLimit.bytes ?? 0;
                comparison = aLimit - bLimit;
                break;
            default:
                comparison = a.name.localeCompare(b.name);
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
    };

    const handleSort = (criteria: SortCriteria) => {
        if (sortCriteria === criteria) {
            // Toggle direction if same criteria
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new criteria with ascending direction
            setSortCriteria(criteria);
            setSortDirection('asc');
        }
    };

    const getSortedKeys = () => {
        return [...keys].sort(compare);
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
                    <Link to={`/usage/${serverId}`} className="boxed-area text-center grow bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors flex items-center justify-center gap-2" title="View Usage Chart">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                            <path d="M11 2v9.5c0 .3.2.5.5.5H21c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8z"/>
                            <path d="M13 2c4.4 0 8 3.6 8 8h-8V2z" opacity="0.7"/>
                        </svg>
                    </Link>
                </div>

                {/* Sort Header */}
                <div className="flex boxed-area mb-2 items-center bg-gray-100 dark:bg-gray-800 font-semibold">
                    <div className="w-1/3">
                        <button 
                            className="text-left hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded flex items-center gap-1"
                            onClick={() => handleSort('name')}
                        >
                            Name
                            {sortCriteria === 'name' && (
                                <span className="text-xs">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="grow">
                        <button 
                            className="text-left hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded flex items-center gap-1"
                            onClick={() => handleSort('consumed')}
                        >
                            Usage
                            {sortCriteria === 'consumed' && (
                                <span className="text-xs">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </button>
                        <button 
                            className="text-left hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded flex items-center gap-1 ml-4"
                            onClick={() => handleSort('limit')}
                        >
                            Limit
                            {sortCriteria === 'limit' && (
                                <span className="text-xs">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="flex flex-col gap-1 w-20">
                        Actions
                    </div>
                </div>

                {getSortedKeys().map(key => (<div key={key.id} className="flex boxed-area mb-2 items-center">
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
