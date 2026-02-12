import React from 'react';
import {SettingsProvider} from './SettingsContext';
import {DocumentProvider} from './DocumentContext';

const AppProviders = ({children}) => (
  <SettingsProvider>
    <DocumentProvider>{children}</DocumentProvider>
  </SettingsProvider>
);

export default AppProviders;
