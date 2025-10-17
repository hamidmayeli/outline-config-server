/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from 'pages/layout';
import Anonymous from 'components/anonymous';
import LoginPage from 'pages/Login';
import Protected from 'components/protected';

const Server = lazy(() => import('pages/Server'));
const App = lazy(() => import('pages/App'));
const NewServer = lazy(() => import('pages/NewServer'));
const LocalKeys = lazy(() => import('pages/LocalKeys'));
const Report = lazy(() => import('pages/Report'));
const Usage = lazy(() => import('pages/Usage'));

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
          path: "/local-keys",
          element: <Protected><LocalKeys /></Protected>,
        },
        {
          path: "/login",
          element: <Anonymous><LoginPage /></Anonymous>
        },
        {
          path: "server/:serverId",
          element: <Protected><Server /></Protected>,
        },
        {
          path: "usage/:serverId",
          element: <Protected><Usage /></Protected>,
        },
        {
          path: "report",
          element: <Protected><Report /></Protected>,
        },
      ]
    }
  ]);

export default router;

