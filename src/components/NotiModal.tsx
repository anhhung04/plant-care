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
  BackHandler,
  ActivityIndicator
} from 'react-native';
import {colors} from '@/assets/fonts/colors';
import {NotificationItem, ReminderItem, BottomSheetModalProps} from '@/src/utils/modal';
import { ScrollView } from 'react-native';
import { useNavigation } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useGarden } from '@/src/context/GreenHouse';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingScreen } from '@/app/auth/waiting';
const { height } = Dimensions.get('window');

// Define type for device history items
interface DeviceHistoryItem {
  value: number;
  unit: string;
  timestamp: string;
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'fan' | 'led' | 'pump'>('fan');
  const navigation = useNavigation();
  // Animation values
  const translateY = useRef(new Animated.Value(height)).current;
  const modalHeight = height * 0.78; // Keep 8% at the top of the screen
  
  const [fanHistory, setFanHistory] = useState<DeviceHistoryItem[]>([]);
  const [ledHistory, setLedHistory] = useState<DeviceHistoryItem[]>([]);
  const [pumpHistory, setPumpHistory] = useState<DeviceHistoryItem[]>([]);
  const [loadingStates, setLoadingStates] = useState<{
    fan: boolean;
    led: boolean;
    pump: boolean;
  }>({
    fan: false,
    led: false,
    pump: false
  });
  
  // Flag to track if data has been fetched for each device type
  const dataFetchedRef = useRef<{
    fan: boolean;
    led: boolean;
    pump: boolean;
  }>({
    fan: false,
    led: false,
    pump: false
  });
  
  // Get greenhouse and field info from context
  const { selectedGreenhouse, selectedFieldIndex } = useGarden();

  // Set up pan responder for swipe gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0; // Only capture gesture when swiping down
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // If swiped down far enough, close modal
          hideModal();
        } else {
          // Otherwise, return to initial position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  // Fetch data when tab changes, but only if not already fetched
  useEffect(() => {
    if (visible && selectedGreenhouse && selectedFieldIndex !== undefined) {
      if (!dataFetchedRef.current[activeTab]) {
        fetchDeviceHistory(activeTab);
      }
    }
  }, [activeTab, visible]);

  // Initial data fetch when modal becomes visible
  useEffect(() => {
    if (visible && selectedGreenhouse && selectedFieldIndex !== undefined) {
      // Only fetch if we haven't fetched this type before
      if (!dataFetchedRef.current[activeTab]) {
        fetchDeviceHistory(activeTab);
      }
    }
    
    // Reset the data fetched flags when modal is closed
    if (!visible) {
      dataFetchedRef.current = {
        fan: false,
        led: false,
        pump: false
      };
    }
  }, [visible]);

  // Show/hide modal based on visibility prop
  useEffect(() => {
    if (visible) {
      showModal();
    } else {
      hideModal();
    }
  }, [visible]);

  // Handle back button press
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

  // Function to fetch device history
  const fetchDeviceHistory = async (deviceType: 'fan' | 'led' | 'pump') => {
    if (!selectedGreenhouse || selectedFieldIndex === undefined) return;
    
    // Update loading state for specific tab
    setLoadingStates(prev => ({
      ...prev,
      [deviceType]: true
    }));
    
    const sensorType = `${deviceType}_status`;
    const greenhouseId = selectedGreenhouse.greenhouse_id;
    const fieldIndex = selectedFieldIndex;
    
    try {
      const url = `http://104.214.177.9:8080/mobileBE/greenhouses/ds-get-field-history/${greenhouseId}/field/${fieldIndex}?sensor_type=${sensorType}&start_time=2020-01-01&end_time=2026-01-01`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success && result.data) {
        const trimmedData = result.data.slice(0, 8); // Limit to 10 items
        switch (deviceType) {
          case 'fan':
            setFanHistory(trimmedData);
            break;
          case 'led':
            setLedHistory(trimmedData);
            break;
          case 'pump':
            setPumpHistory(trimmedData);
            break;
        }
        
        // Mark this data type as fetched
        dataFetchedRef.current = {
          ...dataFetchedRef.current,
          [deviceType]: true
        };
      }
    } catch (error) {
      console.error(`Error fetching ${deviceType} history:`, error);
    } finally {
      // Update loading state for specific tab
      setLoadingStates(prev => ({
        ...prev,
        [deviceType]: false
      }));
    }
  };

  // Format timestamp to display in a readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = new Date(
      date.getTime() +
        7 * 60 * 60 * 1000
    ).toLocaleTimeString("en-GB");

    return [ formattedDate, formattedTime ];
  };

  // Get device state description based on value
  const getDeviceState = (value: number) => {
    return value > 0 ? `Bật Mức ${value}` : "Tắt";
  };

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
    });
  };

  // Function to handle tab change
  const handleTabChange = (newTab: 'fan' | 'led' | 'pump') => {
    setActiveTab(newTab);
    
    // If data for this tab hasn't been fetched yet, fetch it
    if (!dataFetchedRef.current[newTab]) {
      fetchDeviceHistory(newTab);
    }
  };

  // Get the appropriate icon for the device type
  const getDeviceIcon = (deviceType: 'fan' | 'led' | 'pump') => {
    switch (deviceType) {
      case 'fan':
        return <MaterialCommunityIcons name="fan" size={24} color="cyan" />;
      case 'led':
        return <Ionicons name="bulb-outline" size={24} color="gold" />;
      case 'pump':
        return <Ionicons name="water" size={24} color="blue" />;
    }
  };

  // Get current history data based on active tab
  const getCurrentHistory = () => {
    switch (activeTab) {
      case 'fan':
        return fanHistory;
      case 'led':
        return ledHistory;
      case 'pump':
        return pumpHistory;
      default:
        return [];
    }
  };

  // Get current loading state based on active tab
  const isCurrentTabLoading = () => {
    return loadingStates[activeTab];
  };

  // Get device name based on tab
  const getDeviceName = () => {
    switch (activeTab) {
      case 'fan':
        return 'Quạt';
      case 'led':
        return 'Đèn';
      case 'pump':
        return 'Máy bơm';
    }
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
              style={[styles.tab, activeTab === 'fan' && styles.activeTab]}
              onPress={() => handleTabChange('fan')}
            >
              <Text style={[styles.tabText, activeTab === 'fan' && styles.activeTabText]}>
              Quạt
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'led' && styles.activeTab]}
              onPress={() => handleTabChange('led')}
            >
              <Text style={[styles.tabText, activeTab === 'led' && styles.activeTabText]}>
                Đèn LED
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'pump' && styles.activeTab]}
              onPress={() => handleTabChange('pump')}
            >
              <Text style={[styles.tabText, activeTab === 'pump' && styles.activeTabText]}>
              Máy bơm
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          <ScrollView style={styles.content}>
            {isCurrentTabLoading() ? (
              <LoadingScreen message='Đang tải lịch sử...' />
            ) : (
              <>
                {getCurrentHistory().length > 0 ? (
                  getCurrentHistory().map((item, index) => (
                    <View key={`${activeTab}-${index}`} style={styles.item}>
                      <View style={styles.itemHeader}>

                        {item.value == 0 ?
                          (
                            <Feather name="slash" size={24} color="red" />
                          ) :
                          (
                            getDeviceIcon(activeTab)
                          )
                        }
                        <Text style={styles.itemTitle}>{"  "}{getDeviceState(item.value)}</Text>
                      </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}></View>
                        <Text style={[styles.itemMessage, { marginRight: 8 }]}>{formatTimestamp(item.timestamp)[0]}</Text>
                        <Text style={styles.itemTime}>{formatTimestamp(item.timestamp)[1]}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="leaf-outline" size={100} color={colors.primary} />
                    <Text style={styles.emptyText}>Không có lịch sử nào</Text>
                  </View>
                )}
              </>
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
    fontSize: 12,
    color: '#666',
    right: 0,
    fontStyle: 'italic',
    alignContent: 'center',
    bottom: 2,
    position: 'absolute',
  },
  itemTime: {
    position: 'absolute',
    paddingTop: 6,
    paddingRight: 12,
    right:0,
    fontSize: 16,
    color: 'orange',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
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