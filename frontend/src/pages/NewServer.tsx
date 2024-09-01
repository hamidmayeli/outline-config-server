import { baseApi } from "apis/baseApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewServer() {
    const emptyGuid = "00000000-0000-0000-0000-000000000000";
    const navigate = useNavigate();

    const [formData, setFormData] = useState<string | undefined>();
    const [servers, setServers] = useState<IServerDto[]>([]);
    const [selectedServer, setSelectedServer] = useState(emptyGuid);

    useEffect(() => {
        baseApi.getApi<IServerDto[]>("/v1/server")
            .then(data => {
                data = data ?? [];
                data = [{id: emptyGuid, name: "Nothing"}, ...data]
                setServers(data);
            })
            .catch(err => console.error(err));
    }, []);

    const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(evt.target.value);
    };

    const save = async () => {
        if (formData) {
            const data = JSON.parse(formData) as INewServerDto;
            const response = await baseApi.postApi<INewServerDto, { serverId: string }>(
                "/v1/server",
                {
                    ...data,
                    copyFrom: selectedServer === emptyGuid ? undefined : selectedServer,
                }
            );

            if (response) {
                navigate(`/server/${response.serverId}`);
            }
        }
    };

    return (
        <>
            <article>
                <h1 className="py-4 text-2xl">Follow the instructions below</h1>
                <p className="mb-6">These steps will help you install Outline on a Linux server.</p>

                <div className="mb-6 boxed-area">
                    <p>Log into your server, and run this command.</p>
                    <textarea className="w-full border">sudo bash -c "$(wget -qO- https://raw.githubusercontent.com/Jigsaw-Code/outline-server/master/src/server_manager/install_scripts/install_server.sh)"</textarea>
                </div>

                <div className="mb-6 boxed-area">
                    <p>Paste your installation output here.</p>
                    <textarea
                        onChange={handleChange}
                        placeholder='{"apiUrl":"https://xx.xx.xx.xx:xxxx/xxxxxxxxxx","certSha256":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}'
                        className="w-full border"
                        defaultValue={formData}
                    ></textarea>
                </div>

                <div className="mb-6 boxed-area">
                    <p className="mb-2">Copy from an existig server.</p>
                    
                    {servers.map(server => (
                        <div key={server.id} className="items-center">
                            <input type="radio" id={`server-${server.id}`} name="server" className="me-1" onChange={() => setSelectedServer(server.id)} />
                            <label htmlFor={`server-${server.id}`}>{server.name}</label>
                        </div>
                    ))}
                </div>

                <div className="flex gap-1">
                    <button className="btn" onClick={() => navigate(-1)}>Cancel</button>
                    <button className="btn" onClick={save}>Save</button>
                </div>
            </article>
        </>
    );
}
