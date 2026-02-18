import './global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ToastProvider } from './src/contexts/ToastContext';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';

import LoadingPage from './src/pages/LoadingPage/LoadingPage';
import IntroPage from './src/pages/IntroPage/IntroPage';
import DashboardPage from './src/pages/DashboardPage/DashboardPage';
import UserRegistrationPage from './src/pages/UserRegistrationPage/UserRegistrationPage';
import AgeSelectionPage from './src/pages/AgeSelectionPage/AgeSelectionPage';
import HeightSelectionPage from './src/pages/HeightSelectionPage/HeightSelectionPage';
import WeightSelectionPage from './src/pages/WeightSelectionPage/WeightSelectionPage';
import GenderSelectionPage from './src/pages/GenderSelectionPage/GenderSelectionPage';
import AddCapsulePage from './src/pages/AddCapsulePage/AddCapsulePage';
import KVKKPage from './src/pages/KVKKPage/KVKKPage';
import NotificationController from './src/components/NotificationController/NotificationController';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'PPNeueMontreal-Regular': require('./src/assets/fonts/PPNeueMontreal-Regular.woff2'),
    'PPNeueMontreal-Medium': require('./src/assets/fonts/PPNeueMontreal-Medium.woff2'),
    'pp-neue': require('./src/assets/fonts/PPNeueMontreal-Regular.woff2'),
    'pp-neue-medium': require('./src/assets/fonts/PPNeueMontreal-Medium.woff2'),
  });

  // If fonts fail to load, we still want to render the app, just with system fonts.
  // In development, we might see the error.
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0171E4" />
      </View>
    );
  }

  return (
    <ToastProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Loading">
          <Stack.Screen name="Loading" component={LoadingPage} />
          <Stack.Screen name="Intro" component={IntroPage} />
          <Stack.Screen name="Dashboard" component={DashboardPage} />
          <Stack.Screen name="UserRegistration" component={UserRegistrationPage} />
          <Stack.Screen name="AgeSelection" component={AgeSelectionPage} />
          <Stack.Screen name="HeightSelection" component={HeightSelectionPage} />
          <Stack.Screen name="WeightSelection" component={WeightSelectionPage} />
          <Stack.Screen name="GenderSelection" component={GenderSelectionPage} />
          <Stack.Screen name="AddCapsule" component={AddCapsulePage} />
          <Stack.Screen name="KVKK" component={KVKKPage} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <NotificationController />
    </ToastProvider>
  );
}
