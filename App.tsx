/**
 * Cars24 Dealer Inspection App
 * Production-grade React Native application
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
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

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <CatalogBootstrap />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
