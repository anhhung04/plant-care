import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
  Platform,
  BackHandler
} from 'react-native';
import {colors} from '@/assets/fonts/colors';
import {NotificationItem, ReminderItem, BottomSheetModalProps} from '@/src/utils/modal';
import { ScrollView } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
const { height } = Dimensions.get('window');

// Định nghĩa props cho component

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({ visible, onClose, notification, reminder }) => {
  const [activeTab, setActiveTab] = useState<'notification' | 'reminder'>('notification');
  const navigation = useNavigation();
  // Animation values
  const translateY = useRef(new Animated.Value(height)).current;
  const modalHeight = height * 0.78; // Chừa lại 8% phía trên màn hình
  const [notiState, setNotiState] = useState<NotificationItem[]>(notification || []);
  const [reminderState, setReminderState] = useState<ReminderItem[]>(reminder || []);
  // Set up pan responder để xử lý gesture vuốt
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0; // Chỉ bắt gesture khi vuốt xuống
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Nếu vuốt xuống đủ xa, đóng modal
          hideModal();
        } else {
          // Nếu không, trả về vị trí ban đầu
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
      }, 200);
      showModal();
    } else {
      hideModal();
    }
    setNotiState(notification || []);
    setReminderState(reminder || []);
  }, [visible, notification, reminder]);

    useEffect(() => {
      const handleBackPress = () => {
        if (visible) {
          hideModal(); // Close the modal when back button is pressed
          return true; // Prevent default navigation behavior
        }
        return false; // Allow default behavior if modal is not visible
      };
  
      // Add event listener for back button
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  
      // Cleanup listener on unmount or when visible changes
      return () => backHandler.remove();
    }, [visible]); // Re-run effect when visibility changes

  const showModal = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setTimeout(() => {
      }, 50);
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={hideModal}
      />
      <Animated.View
        style={[
          styles.modalContainer,
          {
            height: modalHeight,
            transform: [
              {
                translateY: translateY.interpolate({
                  inputRange: [0, height],
                  outputRange: [0, height],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <View {...panResponder.panHandlers}>
          <View style={styles.dragIndicator} />
          
          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'notification' && styles.activeTab]}
              onPress={() => setActiveTab('notification')}
            >
              <Text style={[styles.tabText, activeTab === 'notification' && styles.activeTabText]}>
                Thiết bị
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reminder' && styles.activeTab]}
              onPress={() => setActiveTab('reminder')}
            >
              <Text style={[styles.tabText, activeTab === 'reminder' && styles.activeTabText]}>
                Lời nhắc
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          <ScrollView style={styles.content}>
            {activeTab === 'notification' ? (
              notiState.length > 0 ? (
                notiState.map(notifications => (
                  console.log('device:', notifications),
                  <View key={notifications.id} style={styles.item}>
                    <Text style={styles.itemTitle}>{notifications.title}</Text>
                    <Text style={styles.itemMessage}>{notifications.message}</Text>
                    <Text style={styles.itemTime}>{notifications.time}</Text>
                  </View>
                ))
              ) : (
                <View style={{alignItems: 'center' , flex: 1, paddingTop:60}} >
                  <Ionicons name="leaf-outline" size={100} color={colors.primary} />
                  <Text style={styles.emptyText}>Không có thông báo nào</Text>
                </View>
              )
            ) : (
              reminderState.length > 0 ? (
                reminderState.map(item => (
                  console.log('reminder:', item),
                  <View key={item.id} style={styles.item}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                  
                    <Text style={styles.itemDueDate}>{item.dueDate}</Text>
                  </View>
                ))
              ) : (
                <View style={{alignItems: 'center' , flex: 1, paddingTop:60}} >
                  <Ionicons name="leaf-outline" size={100} color={colors.primary} />
                  <Text style={styles.emptyText}>Không có lời nhắc nào</Text>
                </View>
              )
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    elevation: 6,
  },
  dragIndicator: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D3D3D3',
    marginBottom: 10,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'orange',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'orange',
    fontWeight: '600',
  },
  content: {
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  itemMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemTime: {
    position: 'absolute',
    paddingTop: 16,
    paddingRight: 12,
    right:0,
    fontSize: 13,
    color: 'orange',
  },
  itemDueDate: {
    position: 'absolute',
    paddingTop: 12,
    paddingRight: 12,
    right:0,
    fontSize: 14,
    color: 'orange',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 20,
    color: '#8E8E93',
  },
});

// Component để sử dụng trong ứng dụng
export const App: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={appStyles.container}>
      <StatusBar barStyle="dark-content" />
      
      <TouchableOpacity
        style={appStyles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={appStyles.buttonText}>Mở Modal</Text>
      </TouchableOpacity>
      
      {/* <BottomSheetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      /> */}
    </View>
  );
};

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;