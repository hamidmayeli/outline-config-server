/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from 'pages/layout';
import Anonymous from 'components/anonymous';
import LoginPage from 'pages/Login';
import Protected from 'components/protected';
import Server from 'pages/Server';

const App = lazy(() => import('pages/App'));
const NewServer = lazy(() => import('pages/NewServer'));

const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "/",
          element: <Protected><App /></Protected>,
        },
        {
          path: "/new-server",
          element: <Protected><NewServer /></Protected>,
        },
        {
          path: "/login",
          element: <Anonymous><LoginPage /></Anonymous>
        },
        {
          path: "server/:serverId",
          element: <Protected><Server /></Protected>,
        },
      ]
    }
  ]);

export default router;

