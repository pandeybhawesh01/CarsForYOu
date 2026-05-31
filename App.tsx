/**
 * Cars24 Dealer Inspection App
 * Production-grade React Native application with Firebase Authentication
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { configureGoogleSignIn } from './src/services/auth';
import { firebaseAuthService } from './src/services/auth';
import { setAuthTokenProvider } from './src/services/api/httpClient';
import { useCatalogViewModel } from './src/viewmodels/catalogViewModel';
import { offlineQueue } from './src/services/offline/offlineQueue';

/**
 * CatalogBootstrap — triggers catalog fetch the moment the app mounts.
 * Kept as a separate component so it doesn't re-render the entire tree.
 */
const CatalogBootstrap: React.FC = () => {
  const loadCatalog = useCatalogViewModel((s) => s.loadCatalog);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  return null;
};

/**
 * GoogleSignInConfig — configures Google Sign-In on app mount
 */
const GoogleSignInConfig: React.FC = () => {
  useEffect(() => {
    configureGoogleSignIn();
    // Wire the HTTP client to the Firebase ID token so every API request
    // automatically carries an `Authorization: Bearer <token>` header.
    setAuthTokenProvider(() => firebaseAuthService.getIdToken());
  }, []);

  return null;
};

/**
 * OfflineQueueBootstrap — H-22.
 * Starts the AppState listener so failed draft saves and submits drain
 * automatically when the app foregrounds (or comes back from a stale state).
 */
const OfflineQueueBootstrap: React.FC = () => {
  useEffect(() => {
    offlineQueue.start();
    return () => offlineQueue.stop();
  }, []);
  return null;
};

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GoogleSignInConfig />
        <CatalogBootstrap />
        <OfflineQueueBootstrap />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
