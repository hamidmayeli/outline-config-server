import { baseApi } from 'apis/baseApi';
import Logo from 'assets/logo';
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

function App() {
  const [servers, setServers] = useState<IServerDto[]>([]);

  useEffect(() => {
    baseApi.getApi<IServerDto[]>("/v1/server")
      .then(res => {
        if (res)
          setServers(res);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <div className='flex justify-center'>
        <Logo className='w-12 h-12' />
      </div>
      <h1 className='text-center font-bold text-5xl mb-5'>Outline Manager</h1>

      {servers.map(server => (
        <Link to={`/server/${server.id}`}>
          <div key={server.id} className="boxed-area mb-5">
            {server.name}
          </div>
        </Link>
      ))}

      <Link to="/new-server" className='text-blue-500'>Add a new server to the list.</Link>
    </>
  )
}

export default App

