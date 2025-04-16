  import { Redirect, Slot, Stack, useRouter } from 'expo-router';
  import {AuthProvider, useAuth } from '../src/context/AuthContext';
  import { useContext, useEffect, useState } from 'react';
  import { StatusBar,Text } from 'react-native';
  import { LoadingScreen } from './auth/waiting';
  import { GardenProvider } from '@/src/context/GreenHouse';

  // Component chính để quản lý layout và điều hướng


  const RootLayoutNav = () => {
    const authContext = useAuth();
    const authState = authContext?.authState;
    const isFirstTimeUser = authContext?.isFirstTimeUser;
    const loading = authContext?.loading;
    const [isDelayedLoading, setIsDelayedLoading] = useState(true); // Tracks delay

    // Handle the 2-second delay
    useEffect(() => {
      if (!loading) {
        // If auth loading is done, wait 2 seconds before clearing the delayed loading state
        const timer = setTimeout(() => {
          setIsDelayedLoading(false);
        }, 5000); // 2000ms = 2 seconds

        // Cleanup timer if component unmounts or authLoading changes
        return () => clearTimeout(timer);
      }
    }, [loading]);

    // Show loading screen if either auth is loading or delay hasn't completed
    if (loading || isDelayedLoading) {
      return <LoadingScreen />; // Your loading component
    }

      return (
        <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/onboarding" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="auth/signin" />
          <Stack.Screen name="auth/waiting" />
          <Stack.Screen name="auth/forgot" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </>
      );
    }

export default function RootLayout() {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
      return (
        <AuthProvider>
          <GardenProvider>
            <RootLayoutNav />
          </GardenProvider>
        </AuthProvider>
      );
}
    // useEffect(() => {
    //   // Ngăn splash screen ẩn cho đến khi điều hướng hoàn tất
    //   SplashScreen.preventAutoHideAsync();
    //   if (isFirstLaunch) {
    //     router.replace('/(auth)/onboarding');
    //   } else if (!user) {
    //     router.replace('/(auth)/signin'); // Nếu chưa đăng nhập, đi tới signin
    //   } else {
    //     router.replace('/(tabs)/(home)'); // Nếu đã đăng nhập, đi tới tabs
    //   }
    //   SplashScreen.hideAsync();
    //   // Ẩn splash screen sau khi điều hướng
    // }, [user, isFirstLaunch, router]);