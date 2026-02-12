import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  documents: '@scankar/documents',
  settings: '@scankar/settings',
};

class StorageService {
  async getDocuments() {
    const value = await AsyncStorage.getItem(KEYS.documents);
    return value ? JSON.parse(value) : [];
  }

  async saveDocuments(documents) {
    await AsyncStorage.setItem(KEYS.documents, JSON.stringify(documents));
  }

  async getSettings() {
    const value = await AsyncStorage.getItem(KEYS.settings);
    return value ? JSON.parse(value) : null;
  }

  async saveSettings(settings) {
    await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
  }
}

export default new StorageService();
