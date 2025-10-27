import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useLocation } from 'react-router-dom';

export default function UpdateNotification() {
  const [showReload, setShowReload] = useState(false);
  const location = useLocation();
  
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowReload(true);
    }
  }, [needRefresh]);

  // Check for updates when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page is visible, checking for updates...');
        // Trigger SW update check by dispatching a custom event
        navigator.serviceWorker?.getRegistration().then((registration) => {
          registration?.update();
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Check for updates on route changes
  useEffect(() => {
    console.log('Route changed, checking for updates...');
    navigator.serviceWorker?.getRegistration().then((registration) => {
      registration?.update();
    });
  }, [location.pathname]);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setShowReload(false);
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  if (!showReload && !offlineReady) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex flex-col gap-2">
        {offlineReady && (
          <p className="text-sm">App ready to work offline</p>
        )}
        {needRefresh && (
          <>
            <p className="text-sm font-semibold">New version available!</p>
            <p className="text-xs">Click reload to update to the latest version.</p>
          </>
        )}
        <div className="flex gap-2 mt-2">
          {needRefresh && (
            <button
              onClick={handleUpdate}
              className="bg-white text-blue-600 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-100"
            >
              Reload
            </button>
          )}
          <button
            onClick={close}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
