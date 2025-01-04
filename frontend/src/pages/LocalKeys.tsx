import { baseApi } from "apis/baseApi";
import { TextInput } from "components/textInput";
import { startTransition, useEffect, useState } from "react";

export default function Server() {
    const [loading, setLoading] = useState<boolean>(true);
    const [keys, setKeys] = useState<ILocalKey[]>([]);
    const [lastLoaded, setLastLoaded] = useState(Date.now);
    const [formData, setFormData] = useState<{ name?: string, accessKey?: string, id?: string, configUrl: string }>({ configUrl: "" });
    const [deleteConfirmed, setDeleteConfirmed] = useState<string[]>([]);

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = evt.target;

        // save field values
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const compare = (a: ILocalKey, b: ILocalKey) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    };

    useEffect(() => {
        baseApi.getApi<ILocalKey[]>("/v1/config")
            .then(keys => {
                if (keys) {
                    keys.sort(compare)
                    setKeys(keys);
                }
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [lastLoaded]);

    const copyToClipboard = (accessUrl: string) => {
        navigator.clipboard.writeText(accessUrl)
            .then(() => alert("Copied!"))
            .catch(() => { });
    };

    const makeItReadable = (accessKey: string) => {
        const atIndex = accessKey.indexOf("@");
        const slashIndex = accessKey.indexOf("/?");
        return accessKey.substring(atIndex + 1, slashIndex);
    };

    const getUpdatingKeyName = () => {
        const key = keys.find(x => x.id === formData.id);

        return key?.name ?? "ERROR";
    };

    const save = () => {
        if (formData.name && formData.accessKey) {
            baseApi.postApi("/v1/config", formData)
                .then(() => {
                    alert("Saved");

                    startTransition(() => {
                        setFormData({ configUrl: "" });
                        setLastLoaded(Date.now);
                        setLoading(true);
                    });
                }).catch(err => console.error(err));
        }
    };

    const selectForUpdate = (key: ILocalKey) => {
        setFormData(key);
    };

    const deleteKey = (id: string) => {
        if (deleteConfirmed.indexOf(id) >= 0) {
            baseApi.deleteApi(`/v1/config/${id}`)
              .then(() => {
                setKeys(keys.filter(x => x.id !== id));
              })
              .catch(err => console.error(err));
          } else {
            setDeleteConfirmed([...deleteConfirmed, id]);
          }
    };

    const updateDomain = () => {
        baseApi.putApi("/v1/config")
            .then(() => {
                alert("Updated");
            })
            .catch(err => console.error(err));
    };

    if (!loading)
        return (
            <>
                <h1 className="text-2xl text-center mb-5">Local Keys</h1>
                <p className="mb-5">The keys that can be point to different servers.</p>

                {keys.map(key => (<div key={key.id} className="flex boxed-area mb-2 items-center">
                    <div className="w-1/3" onClick={() => selectForUpdate(key)}>{key.name}</div>
                    <div className="grow">{makeItReadable(key.accessKey)}</div>
                    <div className="flex flex-col gap-1">
                        <button className="btn"
                            onClick={() => copyToClipboard(key.configUrl)}>
                            Copy
                        </button>
                        <button className="btn w-20"
                            onClick={() => deleteKey(key.id)}>
                            {deleteConfirmed.indexOf(key.id) >= 0 ? "Delete" : "X"}
                        </button>
                    </div>
                </div>))}

                <div className="boxed-area mb-2 items-center">
                    <p>Add or update keys: {formData.id ? `(Updating "${getUpdatingKeyName()}")` : "(Adding a new key)"}</p>
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
                        <div className="grow">
                            <TextInput
                                className="w-full"
                                id="accessKey"
                                name="accessKey"
                                type="text"
                                placeholder="Access Key"
                                onChange={handleChange}
                                required
                                value={formData.accessKey}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <button className="btn" onClick={save}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>

                <div className="boxed-area mb-2 items-center">
                    <button className="btn" onClick={updateDomain}>Update the domain of the configs</button>
                </div>
            </>
        );
    else
        return (<h3>Loading...</h3>);
}
