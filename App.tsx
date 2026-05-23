/**
 * Cars24 Dealer Inspection App
 * Production-grade React Native application with Firebase Authentication
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { configureGoogleSignIn } from './src/services/auth';
import { useCatalogViewModel } from './src/viewmodels/catalogViewModel';

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
  }, []);

  return null;
};

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GoogleSignInConfig />
        <CatalogBootstrap />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
