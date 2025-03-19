import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Switch, Card, Title, Paragraph, Button } from 'react-native-paper'; // Sử dụng react-native-paper cho giao diện đẹp hơn
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '@/src/styles/PageStyle';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { BottomSheetModal } from '@/src/components/NotiModal';
import { NotificationItem, ReminderItem } from '@/src/utils/modal';
import { TabBarContext } from './_layout';
import { getRandomImage } from '@/src/utils/farmpic';
// Dữ liệu mẫu cho các thiết bị
type DeviceIcon = "thermometer-outline" | "rainy-outline" | "earth-outline" | "sunny-outline" | "pie-chart-outline" ;// Icon của thiết bị
type EquipIcon = "zap" | "wind" | "droplet"; // Icon của thiết bị

const devices: { id: number; icon: DeviceIcon; name: string; status: boolean; value: string }[] = [
  { id: 1, icon:'thermometer-outline', name: 'Nhiệt độ', status: false, value: '37°C' },
  { id: 2, icon:'rainy-outline',name: 'Độ ẩm không khí', status: false, value: '50 %' },
  { id: 3, icon:'earth-outline',name: 'Độ ẩm đất', status: false, value: '50 %' },
  { id: 4, icon:'sunny-outline',name: 'Cường độ ánh sáng', status: false, value: '300 lux' },
  //{ id: 5, icon:'pie-chart-outline',name: 'Độ pH', status: false, value: 'X xx' },
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

const HomeScreen: React.FC = () => {
  const [noti, setNoti] = useState(false);
  const [deviceStates, setDeviceStates] = useState(devices);
  const [equipmentStates, setEquipmentStates] = useState(equipments);
  const [modalVisible, setModalVisible] = useState(false);
  const { hideTabBar, showTabBar } = useContext(TabBarContext);
  const [imageState, setImageState] = useState('');

  useEffect(() => {
      setImageState(getRandomImage())
  },[])

  const toggleNotification = () => {
    setNoti(!noti);
    setModalVisible(true);
    hideTabBar();
    //router.push('/modal');
  }

  const insets = useSafeAreaInsets();
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-GB'); 

  return (
    <View style={{...styles.container, paddingTop: insets.top + 6, paddingBottom:70+ insets.bottom}}>  
      {/* Header */}
      <View style={{...styles.header, paddingBottom: 20}}> 
        <Text style={{...styles.headingText}}>Xin chào bạn!</Text>
        <TouchableOpacity onPress={toggleNotification}>
          <Feather name="bell" size={28} color="orange" />
        </TouchableOpacity>
      </View>

      {/* Khu vực ABC */}
      <View style={styles.card}>
        <Card>
          <Card.Cover source={{ uri: imageState }} />
          <View style={styles.overlay}>
            <Text style={styles.title}>NorthEast_1</Text>
            <Text style={styles.subtitle}>{formattedDate}</Text>
          </View>
          <TouchableOpacity style={styles.overlayButton} onPress={() => {setImageState(getRandomImage())}}>
            <Feather name="refresh-ccw" size={30} color="orange" />
          </TouchableOpacity>
          {/* <Card.Actions style={styles.overlayButton}>
            <Button textColor='orange' icon="refresh" mode='outlined' onPress={() => {}}>
            
            </Button>
          </Card.Actions> */}
        </Card>
      </View>

      {/* Các chỉ số */}
      <TouchableOpacity onPress={() => {router.push('/dashboard')}}>
      <Card style={styles.card}>
        <Card.Content style={{padding: 16}}>
          <Title style={{...styles.headingText, paddingTop:10, paddingBottom: 3}}>Chỉ số</Title>
          {deviceStates.map(device => (
            <View key={device.id} style={styles.deviceItem}>
              <Ionicons name={device.icon} size={24} color="orange" />
              <Text style={styles.DetailText}>{device.name}</Text>
              <Text style={styles.DetailValue}>{device.value}</Text>
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
            {equipmentStates.map(device => (
              <View key={device.id} style={styles.deviceItem}>
                <Feather name={device.icon} size={24} color="orange" />
                <Text style={styles.DetailText}>{device.name}</Text>
                <Text style={styles.DetailValue}>{device.status? "Bật":"Tắt"}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <BottomSheetModal
        visible={modalVisible}
        onClose={() => {setModalVisible(false); showTabBar()}}
        notification={notifications}
        reminder={reminders}
      />
    </View>
    
  );
};

export default HomeScreen;