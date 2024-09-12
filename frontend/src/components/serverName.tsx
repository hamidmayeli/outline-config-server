import { startTransition, useState } from "react";
import { TextInput } from "./textInput";
import { baseApi } from "apis/baseApi";

export function ServerName({ serverInfo }: { serverInfo: IServerInfo }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(serverInfo.name);

    const save = () => {
        baseApi.putApi(`/v1/server/${serverInfo.serverId}/name`, { name })
            .then(() => setEditing(false))
            .catch(err => console.error(err));
    };

    const cancel = () => {
        startTransition(() => {
            setEditing(false);
            setName(serverInfo.name);
        });
    };

    if (!editing)
        return (
            <>
                <h1
                    className="text-2xl text-center"
                    onClick={() => setEditing(true)}
                >
                    {name}
                </h1>
                <h2 className="text-sm text-center mb-5">
                    {serverInfo.hostnameForAccessKeys}
                </h2>
            </>
        );

    return (
        <div className="flex gap-1 mb-5">
            <TextInput
                className="w-full"
                id="name"
                name="name"
                type="text"
                placeholder="Name"
                required
                defaultValue={name}
                onChange={e => setName(e.target.value)}
            />
            <button className="btn" onClick={save}>Save</button>
            <button className="btn" onClick={cancel}>Cancel</button>
        </div>
    );
}