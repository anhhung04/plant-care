import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Interface for notification data
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
}

// Initialize notifications configuration
export const initializeNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

// Register for push notifications and return the token
export const registerForPushNotificationsAsync = async () => {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Get the token
    token = (await Notifications.getExpoPushTokenAsync()).data;
    
    console.log('Push Notification Token:', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
};

// Save notification to SecureStore
export const saveNotification = async (notification: NotificationItem) => {
  try {
    // Get existing notifications
    const existingNotificationsJSON = await SecureStore.getItemAsync('notifications');
    let notifications: NotificationItem[] = [];
    
    if (existingNotificationsJSON) {
      notifications = JSON.parse(existingNotificationsJSON);
    }
    
    // Add the new notification at the beginning
    notifications = [notification, ...notifications];
    
    // Save back to SecureStore
    await SecureStore.setItemAsync('notifications', JSON.stringify(notifications));
    
    return notifications;
  } catch (error) {
    console.error('Error saving notification:', error);
    return null;
  }
};

// Process incoming FCM message
export const processFCMNotification = async (message: any) => {
  try {
    const { notification, messageId } = message;
    
    if (!notification) return null;
    
    // Create notification object
    const newNotification: NotificationItem = {
      id: messageId || Date.now().toString(),
      title: notification.title || 'Notification',
      body: notification.body || 'You have a new notification',
      date: new Date().toLocaleString(),
      read: false
    };
    
    // Save to storage
    return await saveNotification(newNotification);
  } catch (error) {
    console.error('Error processing FCM notification:', error);
    return null;
  }
};

// Function to get all stored notifications
export const getStoredNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const notificationsJSON = await SecureStore.getItemAsync('notifications');
    return notificationsJSON ? JSON.parse(notificationsJSON) : [];
  } catch (error) {
    console.error('Error getting stored notifications:', error);
    return [];
  }
};

// Function to mark notification as read
export const markNotificationAsRead = async (id: string): Promise<NotificationItem[]> => {
  try {
    const notifications = await getStoredNotifications();
    const updatedNotifications = notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true } 
        : notification
    );
    
    await SecureStore.setItemAsync('notifications', JSON.stringify(updatedNotifications));
    return updatedNotifications;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return await getStoredNotifications();
  }
};

// Function to delete notification
export const deleteNotification = async (id: string): Promise<NotificationItem[]> => {
  try {
    const notifications = await getStoredNotifications();
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    
    await SecureStore.setItemAsync('notifications', JSON.stringify(updatedNotifications));
    return updatedNotifications;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return await getStoredNotifications();
  }
};

// Function to clear all notifications
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await SecureStore.setItemAsync('notifications', JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};