import React, {memo, useEffect, useMemo} from 'react';
import {Provider} from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {store} from './src/store';

declare global {
  var RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS: boolean;
}

const Providers = memo(({children}: {children: React.ReactNode}) => {
  const providers = useMemo(
    () => (
      <Provider store={store}>
        <SafeAreaProvider>{children}</SafeAreaProvider>
      </Provider>
    ),
    [children],
  );

  return providers;
});

const App = memo(() => {
  useEffect(() => {
    global.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
  }, []);

  return (
    <Providers>
      <AppNavigator />
    </Providers>
  );
});

App.displayName = 'App';
Providers.displayName = 'Providers';

export default App;
