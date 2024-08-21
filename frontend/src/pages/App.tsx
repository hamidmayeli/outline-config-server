import { baseApi } from 'apis/baseApi';
import Logo from 'assets/logo';
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

function App() {
  const [servers, setServers] = useState<IServerDto[]>([]);
  const [deleteConfirmed, setDeleteConfirmed] = useState<string[]>([]);

  useEffect(() => {
    baseApi.getApi<IServerDto[]>("/v1/server")
      .then(res => {
        if (res)
          setServers(res);
      })
      .catch(err => console.error(err));
  }, []);

  const deleteServer = (id: string) => {
    if (deleteConfirmed.indexOf(id) >= 0) {
      baseApi.deleteApi(`/v1/server/${id}`)
        .then(() => {
          setServers(servers.filter(x => x.id !== id));
        })
        .catch(err => console.error(err));
    } else {
      setDeleteConfirmed([...deleteConfirmed, id]);
    }
  };

  return (
    <>
      <div className='flex justify-center'>
        <Logo className='w-12 h-12' />
      </div>
      <h1 className='text-center font-bold text-5xl mb-5'>Outline Manager</h1>

      <Link to="/local-keys">
        <div className="boxed-area mb-5">Local Keys</div>
      </Link>

      {servers.map(server => (
        <div key={server.id} className="boxed-area mb-5 flex">
          <Link className="grow" to={`/server/${server.id}`}>
            <div>{server.name}</div>
          </Link>
          <button
            className="btn"
            onClick={() => deleteServer(server.id)}
          >{deleteConfirmed.indexOf(server.id) >= 0 ? "Delete" : "X"}
          </button>
        </div>
      ))}

      <Link to="/new-server" className='text-blue-500'>Add a new server to the list.</Link>
    </>
  )
}

export default App

