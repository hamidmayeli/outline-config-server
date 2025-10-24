/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from 'pages/layout';
import Anonymous from 'components/anonymous';
import LoginPage from 'pages/Login';
import Protected from 'components/protected';

// Wrapper to retry lazy imports on failure
const lazyRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn('Lazy load failed, reloading page...', error);
      window.location.reload();
      // Return a never-resolving promise to prevent rendering
      return new Promise(() => {});
    }
  });

const Server = lazyRetry(() => import('pages/Server'));
const App = lazyRetry(() => import('pages/App'));
const NewServer = lazyRetry(() => import('pages/NewServer'));
const LocalKeys = lazyRetry(() => import('pages/LocalKeys'));
const Report = lazyRetry(() => import('pages/Report'));
const Usage = lazyRetry(() => import('pages/Usage'));

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

