import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Switch, 
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withTiming,
  useAnimatedGestureHandler
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/assets/fonts/colors';
import { TabBarContext } from './_layout';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
}

const SWIPE_THRESHOLD = -100;
const DELETE_BUTTON_WIDTH = 100;

const SwipeableItem = ({ 
  item, 
  onDelete, 
  onToggle 
}: { 
  item: NotificationItem; 
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) => {
  const translateX = useSharedValue(0);

  const panGesture = useAnimatedGestureHandler({
    onActive: (event) => {
      if (event.translationX < 0) { // Only allow left swipe
        translateX.value = event.translationX;
      }
    },
    onEnd: (event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-DELETE_BUTTON_WIDTH);
      } else {
        translateX.value = withTiming(0);
      }
    },
  });

  const handleDelete = () => {
    // Reset the position when deleting
    translateX.value = withTiming(0);
    // Call the delete function passed from parent
    onDelete(item.id);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    const width = Math.min(DELETE_BUTTON_WIDTH, Math.abs(translateX.value));
    return {
      width: DELETE_BUTTON_WIDTH,
      opacity: width / DELETE_BUTTON_WIDTH,
      right: 0,
    };
  });

  return (
    <View style={styles.itemContainer}>
      <Animated.View style={[styles.deleteButtonContainer, deleteButtonStyle]}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              "Thông báo",
              "Bạn có chắc chắn muốn xóa thông báo này?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => {
                    translateX.value = withTiming(0);
                  }
                },
                { 
                  text: "Delete", 
                  onPress: handleDelete,
                  style: "destructive"
                }
              ]
            );
          }}
        >
          <AntDesign name="delete" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
      
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View style={[styles.notificationItem, animatedStyle, 
          !item.read ? styles.unreadNotification : {}]}>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationBody}>{item.body}</Text>
            <Text style={styles.notificationDate}>{item.date}</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const NotificationScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { hideTabBar, showTabBar } = useContext(TabBarContext);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  
  useEffect(() => {
    // Load stored notifications when component mounts
    loadStoredNotifications();
    
    // Request permission for notifications
    registerForPushNotifications();
    
    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const newNotification: NotificationItem = {
        id: Date.now().toString(),
        title: notification.request.content.title || 'Notification',
        body: notification.request.content.body || 'You have a new notification',
        date: new Date().toLocaleString(),
        read: false
      };
      
      // Add the new notification to state and storage
      addNotification(newNotification);
    });
    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification response (user tapped notification)
      const notificationId = response.notification.request.identifier;
      markAsRead(notificationId);
    });
    
    // Clean up listeners on unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  
  const registerForPushNotifications = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Only ask if permissions have not already been determined
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Stop here if no permissions granted
    if (finalStatus !== 'granted') {
      Alert.alert('Notification permission denied', 'Please enable notifications in your device settings to receive updates.');
      return;
    }
    
    if (!Device.isDevice) {
      Alert.alert('Physical device required', 'Push notifications require a physical device to function properly.');
      return;
    }
    
    // Get push token
    try {
      const token = (await Notifications.getDevicePushTokenAsync()).data;
      
      // Store the token in SecureStore
      await SecureStore.setItemAsync('pushToken', token);
      
      // You would normally send this token to your server
      // sendTokenToServer(token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  };
  
  const loadStoredNotifications = async () => {
    try {
      const storedNotifications = await SecureStore.getItemAsync('notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };
  
  const saveNotifications = async (notificationsToSave: NotificationItem[]) => {
    try {
      await SecureStore.setItemAsync('notifications', JSON.stringify(notificationsToSave));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };
  
  const addNotification = (notification: NotificationItem) => {
    setNotifications((prevNotifications) => {
      const updatedNotifications = [notification, ...prevNotifications];
      saveNotifications(updatedNotifications);
      return updatedNotifications;
    });
  };
  
  const toggleNotification = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: !notification.read } 
        : notification
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };
  
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id || notification.id === id.toString()
        ? { ...notification, read: true } 
        : notification
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };
  
  const deleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };
  
  const clearAllNotifications = () => {
    Alert.alert(
      "Thông báo",
      "Bạn có chắc chắn muốn xóa tất cả thông báo?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear All", 
          onPress: () => {
            setNotifications([]);
            saveNotifications([]);
          },
          style: "destructive"
        }
      ]
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{...styles.container, paddingBottom: insets.bottom + 70, paddingTop: insets.top}}>
      <GestureHandlerRootView style={{flex: 1}}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          {notifications.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={clearAllNotifications}
            >
              <Text style={styles.clearButtonText}>Xóa tất cả</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView style={styles.notificationList}
          contentContainerStyle={{paddingBottom: 70}}>
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <SwipeableItem 
                key={item.id}
                item={item} 
                onDelete={deleteNotification}
                onToggle={toggleNotification}
              />
            ))
          ) : (
            <View style={{alignItems: 'center', flex: 1, paddingTop:120}} >
               <Ionicons name="notifications-outline" size={100} color={colors.primary} />
               <Text style={styles.emptyText}>Không có thông báo nào</Text>
            </View>
          )}
        </ScrollView>
        
        {/* For testing purposes - triggers a local notification */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={async () => {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Thông báo thử nghiệm",
                body: "Đây là một thông báo thử nghiệm để kiểm tra tính năng",
              },
              trigger: null, // show immediately
            });
          }}
        >
          <AntDesign name="bells" size={34} color="white" />
        </TouchableOpacity>
      </GestureHandlerRootView>  
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    left:5
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 18,
  },
  notificationList: {
    flex: 1,
    paddingVertical: 8,
    paddingTop: 16,
  },
  itemContainer: {
    position: 'relative',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  deleteButtonContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  notificationItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },
  unreadNotification: {
    borderLeftWidth: 5,
    borderLeftColor: colors.orange100,
  },
  notificationInfo: {
    flex: 1,
    paddingRight: 12,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notificationBody: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    marginLeft: 14,
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
    marginLeft: 14,
  },
  deleteButton: {
    backgroundColor: 'rgb(206, 46, 46)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    height: '80%',
    borderRadius: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: colors.primary,
    width: 70,
    height: 70,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 20,
    color: '#8E8E93',
  },
});

export default NotificationScreen;