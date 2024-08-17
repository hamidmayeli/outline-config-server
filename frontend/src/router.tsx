/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from 'pages/layout';
import Anonymous from 'components/anonymous';
import LoginPage from 'pages/Login';
import Protected from 'components/protected';

const App = lazy(() => import('pages/App'));
const SecondPage = lazy(() => import('pages/SecondPage'));

const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "/",
          element: <Suspense><App /></Suspense>,
        },
        {
          path: "/second",
          element: <Protected><SecondPage /></Protected>,
        },
        {
          path: "/login",
          element: <Anonymous><LoginPage /></Anonymous>
        }
      ]
    }
  ]);

export default router;

