import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import StorageService from '../services/storage/StorageService';

const defaultSettings = {
  autoSave: true,
  lowConfidenceThreshold: 0.7,
  mediumConfidenceThreshold: 0.9,
};

const SettingsContext = createContext({
  settings: defaultSettings,
  updateSetting: () => {},
});

export const SettingsProvider = ({children}) => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    let mounted = true;
    StorageService.getSettings()
      .then(saved => {
        if (mounted && saved) {
          setSettings({...defaultSettings, ...saved});
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const updateSetting = async (key, value) => {
    const next = {...settings, [key]: value};
    setSettings(next);
    await StorageService.saveSettings(next);
  };

  const value = useMemo(
    () => ({
      settings,
      updateSetting,
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
