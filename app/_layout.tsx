import { Redirect, Slot, Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { StatusBar, Text } from "react-native";
import { LoadingScreen } from "./auth/waiting";
import { GardenProvider } from "@/src/context/GreenHouse";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
// Component chính để quản lý layout và điều hướng

const queryClient = new QueryClient();

const RootLayoutNav = () => {
  const authContext = useAuth();
  const authState = authContext?.authState;
  const isFirstTimeUser = authContext?.isFirstTimeUser;
  const loading = authContext?.loading;
  const [isDelayedLoading, setIsDelayedLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      // Reduced delay to 1 second
      const timer = setTimeout(() => {
        setIsDelayedLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Add error boundary
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Loading is taking too long - might be stuck");
        setIsDelayedLoading(false);
      }
    }, 10000); // Force timeout after 10 seconds

    return () => clearTimeout(timeoutId);
  }, []);

  if (loading || isDelayedLoading) {
    return <LoadingScreen />;
  }

  // Default to onboarding for first time users
  if (isFirstTimeUser) {
    return <Redirect href="/auth/onboarding" />;
  }

  // Default to auth flow if not authenticated
  if (!authState?.authenticated) {
    return <Redirect href="/auth/signin" />;
  }

  return (
    <React.Fragment>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/onboarding" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/signin" />
        <Stack.Screen name="auth/waiting" />
        <Stack.Screen name="auth/forgot" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </React.Fragment>
  );
};

export default function RootLayout() {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor("transparent");
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <GardenProvider>
          <RootLayoutNav />
        </GardenProvider>
      </QueryClientProvider>
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

export const unstable_settings = {
  initialRouteName: "(tabs)",
  navigationPersistence: false,
};
