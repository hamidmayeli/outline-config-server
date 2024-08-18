import { baseApi } from "apis/baseApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewServer() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<string | undefined>();

    const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(evt.target.value);
    };

    const save = async () => {
        if (formData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await baseApi.postApi<any, { serverId: string }>("/v1/server", JSON.parse(formData));

            if(response){
                navigate(`/server/${response.serverId}`);
            }
        }
    };

    return (
        <>
            <article>
                <h1 className="py-4 text-2xl">Follow the instructions below</h1>
                <p className="mb-6">These steps will help you install Outline on a Linux server.</p>

                <div className="mb-6">
                    <p>Log into your server, and run this command.</p>
                    <textarea className="w-full border">sudo bash -c "$(wget -qO- https://raw.githubusercontent.com/Jigsaw-Code/outline-server/master/src/server_manager/install_scripts/install_server.sh)"</textarea>
                </div>

                <div className="mb-6">
                    <p>Paste your installation output here.</p>
                    <textarea
                        onChange={handleChange}
                        placeholder='{"apiUrl":"https://xx.xx.xx.xx:xxxx/xxxxxxxxxx","certSha256":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}'
                        className="w-full border"
                        defaultValue={formData}
                    ></textarea>
                </div>

                <div className="flex gap-1">
                    <button className="btn" onClick={() => navigate(-1)}>Cancel</button>
                    <button className="btn" onClick={save}>Save</button>
                </div>
            </article>
        </>
    );
}
