import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import ImagePreviewScreen from '../screens/ImagePreviewScreen';
import ProcessingScreen from '../screens/ProcessingScreen';
import TableEditorScreen from '../screens/TableEditorScreen';
import ExportOptionsScreen from '../screens/ExportOptionsScreen';
import LibraryScreen from '../screens/LibraryScreen';
import DocumentDetailScreen from '../screens/DocumentDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import TrainingDataScreen from '../screens/TrainingDataScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerTitleAlign: 'center',
  animation: 'slide_from_right',
};

const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Splash" screenOptions={screenOptions}>
    <Stack.Screen name="Splash" component={SplashScreen} options={{headerShown: false}} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{headerShown: false}} />
    <Stack.Screen name="Home" component={HomeScreen} options={{title: 'SCANkar'}} />
    <Stack.Screen
      name="Camera"
      component={CameraScreen}
      options={{title: 'Capture', headerShown: false}}
    />
    <Stack.Screen
      name="ImagePreview"
      component={ImagePreviewScreen}
      options={{title: 'Image Preview'}}
    />
    <Stack.Screen name="Processing" component={ProcessingScreen} options={{title: 'Processing'}} />
    <Stack.Screen
      name="TableEditor"
      component={TableEditorScreen}
      options={{title: 'Edit Table'}}
    />
    <Stack.Screen name="ExportOptions" component={ExportOptionsScreen} options={{title: 'Export'}} />
    <Stack.Screen name="Library" component={LibraryScreen} options={{title: 'Library'}} />
    <Stack.Screen
      name="DocumentDetail"
      component={DocumentDetailScreen}
      options={{title: 'Document'}}
    />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{title: 'Settings'}} />
    <Stack.Screen name="Help" component={HelpScreen} options={{title: 'Help'}} />
    <Stack.Screen
      name="TrainingData"
      component={TrainingDataScreen}
      options={{title: 'Training Data'}}
    />
  </Stack.Navigator>
);

export default AppNavigator;
