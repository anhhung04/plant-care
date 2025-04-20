import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Switch, Card, Title, Paragraph, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '@/src/styles/PageStyle';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link, router } from 'expo-router';
import { BottomSheetModal } from '@/src/components/NotiModal';
import { NotificationItem, ReminderItem } from '@/src/utils/modal';
import { TabBarContext } from './_layout';
import { getRandomImage, URL } from '@/src/utils/farmpic';
import { useGarden } from '@/src/context/GreenHouse';
import GardenSetting from './gsetting';



// Dữ liệu mẫu cho các thiết bị
type DeviceIcon = "thermometer-outline" | "rainy-outline" | "earth-outline" | "sunny-outline" | "pie-chart-outline";
type EquipIcon = "zap" | "wind" | "droplet";

const devices: { id: number; icon: DeviceIcon; name: string; status: boolean; value: string }[] = [
  { id: 1, icon:'thermometer-outline', name: 'Nhiệt độ', status: false, value: '37°C' },
  { id: 2, icon:'rainy-outline',name: 'Độ ẩm không khí', status: false, value: '50 %' },
  { id: 3, icon:'earth-outline',name: 'Độ ẩm đất', status: false, value: '50 %' },
  { id: 4, icon:'sunny-outline',name: 'Cường độ ánh sáng', status: false, value: '300 lux' },
];

const equipments : { id: number; icon: EquipIcon; name: string; status: boolean}[] = [
  { id: 1, icon:'zap',name: 'Đèn LED', status: false },
  { id: 2, icon:'wind',name: 'Quạt', status: false },
  { id: 3, icon:'droplet',name: 'Bơm nước', status: true },
];

const notifications: NotificationItem[] = ([
  { id: '1', title: 'Quạt được bật thủ công', message: 'Cường độ 50%', time: '15:30, 06/01/2025' },
  { id: '2', title: 'Quạt được tắt tự động', message: 'Cường độ 0%', time: '12:30, 06/01/2025' },
  { id: '3', title: 'Tưới nước được bật tự động', message: 'Cường độ 100%', time: '10:30, 06/01/2025' },
  { id: '4', title: 'Tưới nước được tắt tự động', message: 'Cường độ 0%', time: '08:30, 06/01/2025' },
]);

const reminders: ReminderItem[] = ([
  // { id: '1', title: 'Họp nhóm lúc 14h00', dueDate: 'Hôm nay, 14:00', completed: false },
  // { id: '2', title: 'Kiểm tra phân bón', dueDate: 'Hôm nay, 17:00', completed: false },
]);
// Maximum age for sensor data in milliseconds (e.g., 5 minutes)
const MAX_DATA_AGE = 20000;

const HomeScreen: React.FC = () => {
  const [noti, setNoti] = useState(false);
  const [deviceStates, setDeviceStates] = useState(devices);
  const [equipmentStates, setEquipmentStates] = useState(equipments);
  const [modalVisible, setModalVisible] = useState(false);
  const [dataAgeState, setDataAgeState] = useState<'fresh' | 'stale'>('fresh');
  const [previousSensorTimestamps, setPreviousSensorTimestamps] = useState<Record<string, number>>({});

  const { hideTabBar, showTabBar } = useContext(TabBarContext);
  const [imageState, setImageState] = useState(URL[0]);

  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Lấy dữ liệu từ context greenhouse
  const { 
    selectedGreenhouse, 
    selectedField, 
    selectedFieldIndex, 
    startPolling, 
    stopPolling 
  } = useGarden();

  // Start the blinking animation for active indicators
  useEffect(() => {
    if (dataAgeState === 'fresh') {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.2,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      
      blinkAnimation.start();
      
      // Cleanup on unmount
      return () => blinkAnimation.stop();
    } else {
      // If data is stale, stop animation and set to solid opacity
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [dataAgeState]);
  
  // Check if selected field's sensor data has been updated
  useEffect(() => {
    if (!selectedField) return;
    
    // Function to check if sensor data has been updated
    const checkDataFreshness = () => {
      const now = Date.now();
      let isUpdated = false;
      
      // Get all sensor arrays as a group for easier checking
      const sensorGroups = [
        { key: 'temperature', data: selectedField.temperature_sensor },
        { key: 'humidity', data: selectedField.humidity_sensor },
        { key: 'soil_moisture', data: selectedField.soil_moisture_sensor },
        { key: 'light', data: selectedField.light_sensor },
      ];
      
      // Check if any sensor group has new timestamps
      for (const group of sensorGroups) {
        if (group.data && group.data.length > 0) {
          for (let i = 0; i < group.data.length; i++) {
            const sensor = group.data[i];
            const sensorKey = `${group.key}_${i}`;
            const sensorTime = new Date(sensor.timestamp).getTime();
            const prevTime = previousSensorTimestamps[sensorKey] || 0;
            
            // If timestamp has changed, data is being updated
            if (sensorTime > prevTime) {
              isUpdated = true;
              
              // Update the previous timestamp record
              setPreviousSensorTimestamps(prev => ({
                ...prev,
                [sensorKey]: sensorTime
              }));
            }
            
            // If data is too old, mark as stale
            if (now - sensorTime > MAX_DATA_AGE) {
              setDataAgeState('stale');
              return;
            }
          }
        }
      }
      
      // If we found updated data, mark as fresh
      if (isUpdated) {
        setDataAgeState('fresh');
      }
    };
    
    // Check once immediately when selectedField changes
    checkDataFreshness();
    
    // Set up an interval to check data freshness every few seconds
    const checkInterval = setInterval(checkDataFreshness, 5000);
    
    return () => clearInterval(checkInterval);
  }, [selectedField]);
  
  useEffect(() => {
    if (selectedGreenhouse) {
      startPolling();
      setDataAgeState('fresh');
    }
    
    // Cleanup function to stop polling when component unmounts
    return () => {
      stopPolling();
    };
  }, [selectedGreenhouse?.greenhouse_id]); // Restart polling if greenhouse ID changes

  const toggleNotification = () => {
    setNoti(!noti);
    setModalVisible(true);
    hideTabBar();
  }

  if (!selectedGreenhouse || !selectedField) {
    return (
      <GardenSetting/>
    );
  }

  const insets = useSafeAreaInsets();

  return (
    <>
    <ScrollView style={{...styles.container}}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 100 }}>
      {/* Header */}
      
      <View style={{...styles.header, paddingBottom: 20}}> 
        <Text style={{...styles.headingText}}>Greenhouse 1</Text>
        <TouchableOpacity onPress={toggleNotification}>
          <Feather name="bell" size={28} color="orange" />
        </TouchableOpacity>
      </View>

      {/* Khu vực ABC */}
      <View style={styles.card}>
        <Card>
          <Card.Cover source={{ uri: imageState }} />
          <View style={styles.overlay}>
            <Text style={styles.title}>Field {selectedFieldIndex}</Text>
            <Text style={styles.subtitle}>
                {new Date(selectedGreenhouse.updated_at).toLocaleDateString('en-GB')}{" "}
                {new Date(new Date(selectedGreenhouse.updated_at).getTime() + 7 * 60 * 60 * 1000).toLocaleTimeString('en-GB')}
            </Text>
          </View>
        </Card>
      </View>

      {/* Các chỉ số */}
      <TouchableOpacity onPress={() => {router.push('/dashboard')}}>
        <Card style={styles.card}>
          <Card.Content style={{padding: 16}}>
            <Title style={{...styles.headingText, paddingTop:10, paddingBottom: 3}}>Chỉ số</Title>
            
            {/* Temperature sensors */}
            {selectedField.temperature_sensor.map((sensor, index) => (
              <View key={`temp-${index}`} style={styles.deviceItem}>
                <Ionicons name="thermometer-outline" size={24} color="orange" />
                <Text style={styles.DetailText}>Nhiệt độ</Text>
                <Text style={styles.DetailValue}>{sensor.value} {sensor.unit}</Text>
                <Animated.View 
                  style={[
                    styles.statusDot,
                    { 
                      opacity: opacityAnim,
                      backgroundColor: dataAgeState === 'fresh' ? "green" : "yellow"
                    }
                  ]} 
                />
              </View>
            ))}
            
            {/* Humidity sensors */}
            {selectedField.humidity_sensor.map((sensor, index) => (
              <View key={`humid-${index}`} style={styles.deviceItem}>
                <Ionicons name="water-outline" size={24} color="blue" />
                <Text style={styles.DetailText}>Độ ẩm không khí</Text>
                <Text style={styles.DetailValue}>{sensor.value} {sensor.unit}</Text>
                <Animated.View 
                  style={[
                    styles.statusDot,
                    { 
                      opacity: opacityAnim,
                      backgroundColor: dataAgeState === 'fresh' ? "green" : "yellow" 
                    }
                  ]} 
                />
              </View>
            ))}
            
            {/* Soil moisture sensors */}
            {selectedField.soil_moisture_sensor.map((sensor, index) => (
              <View key={`soil-${index}`} style={styles.deviceItem}>
                <Ionicons name="leaf-outline" size={24} color="green" />
                <Text style={styles.DetailText}>Độ ẩm đất</Text>
                <Text style={styles.DetailValue}>{sensor.value} {sensor.unit}</Text>
                <Animated.View 
                  style={[
                    styles.statusDot,
                    { 
                      opacity: opacityAnim,
                      backgroundColor: dataAgeState === 'fresh' ? "green" : "yellow"
                    }
                  ]} 
                />
              </View>
            ))}
            
            {/* Light sensors */}
            {selectedField.light_sensor.map((sensor, index) => (
              <View key={`light-${index}`} style={styles.deviceItem}>
                <Ionicons name="sunny-outline" size={24} color="yellow" />
                <Text style={styles.DetailText}>Ánh sáng</Text>
                <Text style={styles.DetailValue}>{sensor.value} {sensor.unit}</Text>
                <Animated.View 
                  style={[
                    styles.statusDot,
                    { 
                      opacity: opacityAnim,
                      backgroundColor: dataAgeState === 'fresh' ? "green" : "yellow"
                    }
                  ]} 
                />
              </View>
            ))}
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Thiết bị */}
      <TouchableOpacity onPress={() => {router.push('/setting')}}>
        <Card style={styles.card}>
          <Card.Content style={{padding: 16}}>
            <Title style={{...styles.headingText, paddingTop:10, paddingBottom: 3}}>Thiết bị</Title>
            {selectedField.fan_status.map((status, index) => (
              <View key={`fan-${index}`} style={styles.deviceItem}>
                <MaterialCommunityIcons name="fan" size={24} color="cyan" />
                <Text style={styles.DetailText}>Quạt</Text>
                <Text style={styles.DetailValue}>{status.value ? `Bật Mức ${status.value}` : "Tắt"}</Text>
                <Animated.View 
                  style={[
                    styles.statusDot,
                    { 
                      opacity: opacityAnim,
                      backgroundColor: dataAgeState === 'fresh' 
                        ? (status.value ? "green" : "red") 
                        : "yellow"
                    }
                  ]} 
                />
              </View>
            ))}
            
            {/* LED status */}
            {selectedField.led_status.map((status, index) => (
              <View key={`led-${index}`} style={styles.deviceItem}>
                <Ionicons name="bulb-outline" size={24} color="gold" />
                <Text style={styles.DetailText}>Đèn LED</Text>
                <Text style={styles.DetailValue}>{status.value ? `Bật Mức ${status.value}` : "Tắt"}</Text>
                <Animated.View 
                  style={[
                    styles.statusDot,
                    { 
                      opacity: opacityAnim,
                      backgroundColor: dataAgeState === 'fresh' 
                        ? (status.value ? "green" : "red") 
                        : "yellow"
                    }
                  ]} 
                />
              </View>
            ))}
            
            {/* Pump status */}
            {selectedField.pump_status.map((status, index) => (
              <View key={`pump-${index}`} style={styles.deviceItem}>
                <Ionicons name="water" size={24} color="blue" />
                <Text style={styles.DetailText}>Máy bơm</Text>
                <Text style={styles.DetailValue}>{status.value ? `Bật Mức ${status.value}` : "Tắt"}</Text>
                <Animated.View 
                  style={[
                    styles.statusDot,
                    { 
                      opacity: opacityAnim,
                      backgroundColor: dataAgeState === 'fresh' 
                        ? (status.value ? "green" : "red") 
                        : "yellow"
                    }
                  ]} 
                />
              </View>
            ))}
          </Card.Content>
        </Card>
      </TouchableOpacity>

    </ScrollView>
    <BottomSheetModal
      visible={modalVisible}
      onClose={() => {setModalVisible(false); showTabBar()}}
      notification={notifications}
      reminder={reminders}
    />
    </>
  );
};

export default HomeScreen;