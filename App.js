import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import AppProviders from './src/context/AppProviders';
import {COLORS} from './src/constants/colors';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    primary: COLORS.primary,
  },
};

function App() {
  return (
    <AppProviders>
      <NavigationContainer theme={navTheme}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <AppNavigator />
      </NavigationContainer>
    </AppProviders>
  );
}

export default App;
