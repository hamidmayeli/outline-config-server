import Logo from 'assets/logo';
import { Link } from "react-router-dom";

function App() {

  return (
    <>
      <div className='flex justify-center'>
        <Logo className='fill-black dark:fill-white w-12 h-12' />
      </div>
      <h1 className='text-center font-bold text-5xl mb-20'>Outline Manager</h1>
      <Link to="/new-server" className='text-blue-500'>Add a new server to the list.</Link>
    </>
  )
}

export default App

