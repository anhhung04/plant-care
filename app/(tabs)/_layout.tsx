import React from "react";
import { Redirect, Slot, SplashScreen, Tabs } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/assets/fonts/colors";
import { fonts } from "@/assets/fonts/font";
import { useState, createContext, useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, BottomNavigation } from "react-native-paper";
import { CommonActions } from "@react-navigation/native";
import Dashboard from "./dashboard";
import Reminder from "./reminder";
import HomeScreen from ".";
import Setting from "./setting";
import Profile from "./profile";
import { useAuth } from "@/src/context/AuthContext";
import SettingTab from "./setting";
import ConfigScreen from "./setting/[device_name]";
import { useGarden } from "@/src/context/GreenHouse";
import GardenSetting from "./gsetting";

export const TabBarContext = createContext({
  showTabBar: () => {},
  hideTabBar: () => {},
});

export type SettingStackParamList = {
  SettingTab: undefined;
  ConfigScreen: { device_name: string };
};

const Stack = createNativeStackNavigator<SettingStackParamList>();

export default function TabLayout() {
  const Tab = createBottomTabNavigator();
  const [tabBarVisible, setTabBarVisible] = useState(true);

  const authContext = useAuth();
  const authState = authContext?.authState;
  const isFirstTimeUser = authContext?.isFirstTimeUser;
  const loading = authContext?.loading;

  const { selectedGreenhouse, selectedField } = useGarden();

    if (loading){
      return <Text style={{fontSize: 100}}>Loading...</Text>;
    }

    if (!authState?.authenticated) {
      if (isFirstTimeUser) {
        return <Redirect href={'/auth/onboarding'} />;
      } else {
        return <Redirect href={'/auth/signin'} />;
      }
    }

    if (!selectedGreenhouse || !selectedField) {
        return (
          <GardenSetting/>
        );
    }
    

  return (
    <TabBarContext.Provider value={{ showTabBar: () => setTabBarVisible(true), hideTabBar: () => setTabBarVisible(false) }}>  
      <Tab.Navigator
        tabBar={({ navigation, state, descriptors, insets }) => (
          <BottomNavigation.Bar
            navigationState={state}
            safeAreaInsets={insets}
            activeColor={colors.primary}
            inactiveColor={colors.secondary}
            style={{ ...styles.tabBar, display: tabBarVisible ? "flex" : "none" }}
            onTabPress={({ route, preventDefault }) => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (event.defaultPrevented) {
                preventDefault();
              } else {
              navigation.dispatch({
                  ...CommonActions.navigate(route.name, route.params),
                  target: state.key,
                });
              }
            }}
            renderIcon={({ route, focused, color }) => {
              const { options } = descriptors[route.key];
              if (options.tabBarIcon) {
                return options.tabBarIcon({ focused, color, size: 24 });
              }

              return null;
            }}
            getLabelText={({ route }) => {
              const { options } = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              return typeof label === 'string' ? label : undefined;
            }} 
            keyboardHidesNavigationBar={true}
            theme={{
              colors: {
                secondaryContainer: '#b8e7bb', // Semi-transparent white
              }
            }}
          />
        )}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {...styles.tabBar, display: tabBarVisible ? "flex" : "none" },
          // tabBarActiveTintColor: colors.primary,
          // tabBarInactiveTintColor: colors.secondary,
          // tabBarLabelStyle: styles.tabBarLabel,
          // tabBarShowLabel: true,
          // tabBarHideOnKeyboard: true,
          // tabBarBackground: () => (
          //   <View style={styles.tabBarBackground} />
          // ),
        }}
        initialRouteName='index'
      >
        
        <Tab.Screen 
          name="dashboard" 
          component={Dashboard}
          options={{ 
            title: 'Thống kê',
            tabBarIcon: ({ color, size }) => (
              <Feather name="bar-chart-2" size={size} color={color} />
            ),
          }} 
        />
        
        <Tab.Screen 
          name="reminder" 
          component={Reminder}
          options={{ 
            title: 'Nhắc nhở',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.reminderIconContainer}>
                <Feather name="bell" size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="index"
          component={HomeScreen}
          options={{
            title: "Trang chủ",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="setting"
          component={SettingStack}
          options={{
            title: "Thiết bị",
            tabBarIcon: ({ color, size }) => (
              <Feather name="settings" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="profile"
          component={Profile}
          options={{
            title: "Cá nhân",
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </TabBarContext.Provider>
  );
}

function SettingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingTab"
        component={SettingTab}
        options={{ title: "Thiết bị", headerShown: false }}
      />
      <Stack.Screen
        name="ConfigScreen"
        component={ConfigScreen}
        options={{ title: "Cài đặt thiết bị", headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 75,
    elevation: 0, // Bỏ shadow trên Android
    backgroundColor: "rgba(255, 255, 255, 0.6)", // Tab bar trong suốt
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.85)", // Nền trắng mờ
    // Hình nền
  },
  tabBarLabel: {
    fontFamily: fonts.Regular,
    fontSize: 14,
    marginBottom: 5,
  },
  reminderIconContainer: {
    // Tùy chọn làm nổi bật tab Reminder
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
