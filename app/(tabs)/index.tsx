import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Switch, Card, Title, Paragraph, Button } from "react-native-paper"; // Sử dụng react-native-paper cho giao diện đẹp hơn
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styles from "@/src/styles/PageStyle";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, router } from "expo-router";
import { BottomSheetModal } from "@/src/components/NotiModal";
import { NotificationItem, ReminderItem } from "@/src/utils/modal";
import { TabBarContext } from "./_layout";
import { getRandomImage } from "@/src/utils/farmpic";
import { useGarden } from "@/src/context/GreenHouse";
import GardenSetting from "./gsetting";
import { SOCKET_URL } from "@/config";
import { Client } from "@stomp/stompjs";
import { socketEvents } from "@/src/services/SocketService";

// Dữ liệu mẫu cho các thiết bị
type DeviceIcon =
  | "thermometer-outline"
  | "rainy-outline"
  | "earth-outline"
  | "sunny-outline"
  | "pie-chart-outline"; // Icon của thiết bị
type EquipIcon = "zap" | "wind" | "droplet"; // Icon của thiết bị

const devices: {
  id: number;
  icon: DeviceIcon;
  name: string;
  status: boolean;
  value: string;
}[] = [
  {
    id: 1,
    icon: "thermometer-outline",
    name: "Nhiệt độ",
    status: false,
    value: "37°C",
  },
  {
    id: 2,
    icon: "rainy-outline",
    name: "Độ ẩm không khí",
    status: false,
    value: "50 %",
  },
  {
    id: 3,
    icon: "earth-outline",
    name: "Độ ẩm đất",
    status: false,
    value: "50 %",
  },
  {
    id: 4,
    icon: "sunny-outline",
    name: "Cường độ ánh sáng",
    status: false,
    value: "300 lux",
  },
  //{ id: 5, icon:'pie-chart-outline',name: 'Độ pH', status: false, value: 'X xx' },
];

const equipments: {
  id: number;
  icon: EquipIcon;
  name: string;
  status: boolean;
}[] = [
  { id: 1, icon: "zap", name: "Đèn LED", status: false },
  { id: 2, icon: "wind", name: "Quạt", status: false },
  { id: 3, icon: "droplet", name: "Bơm nước", status: true },
];

const notifications: NotificationItem[] = [
  {
    id: "1",
    title: "Quạt được bật thủ công",
    message: "Cường độ 50%",
    time: "15:30, 06/01/2025",
  },
  {
    id: "2",
    title: "Quạt được tắt tự động",
    message: "Cường độ 0%",
    time: "12:30, 06/01/2025",
  },
  {
    id: "3",
    title: "Tưới nước được bật tự động",
    message: "Cường độ 100%",
    time: "10:30, 06/01/2025",
  },
  {
    id: "4",
    title: "Tưới nước được tắt tự động",
    message: "Cường độ 0%",
    time: "08:30, 06/01/2025",
  },
];

const reminders: ReminderItem[] = [
  // { id: '1', title: 'Họp nhóm lúc 14h00', dueDate: 'Hôm nay, 14:00', completed: false },
  // { id: '2', title: 'Kiểm tra phân bón', dueDate: 'Hôm nay, 17:00', completed: false },
];

const HomeScreen: React.FC = () => {
  const [noti, setNoti] = useState(false);
  const [deviceStates, setDeviceStates] = useState(devices);
  const [equipmentStates, setEquipmentStates] = useState(equipments);

  const [modalVisible, setModalVisible] = useState(false);

  const { hideTabBar, showTabBar } = useContext(TabBarContext);
  const [imageState, setImageState] = useState("");

  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Lấy dữ liệu từ context greenhouse
  const { selectedGreenhouse, selectedField, selectedFieldIndex } = useGarden();

  useEffect(() => {
    setImageState(getRandomImage());
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
  }, []);

  useEffect(() => {
    const handleMessage = (data: any) => {
      console.log("Received message from server:", data);
      // Handle the message (e.g., update state or UI)
    };

    // Listen for the "message" event
    socketEvents.on("message", handleMessage);

    // Cleanup the listener on unmount
    return () => {
      socketEvents.off("message", handleMessage);
    };
  }, []);

  // const userId: string = 'c670e06e-afa8-4d4f-8005-b7bea9b38054'; // Replace with actual user ID
  //   const greenhouseIds: string = 'gh_6e69294a8d1943819ff4f69933837bef'; // Replace with actual greenhouse IDs
  //   const wsUrl = SOCKET_URL
  //   const [messages, setMessages] = useState<string[]>([]);
  //   const [connected, setConnected] = useState(false);

  //   useEffect(() => {
  //     const stompClient = new Client({
  //       brokerURL: wsUrl,
  //       connectHeaders: {
  //         Authorization: `Bearer ${userId}`,
  //       },
  //       webSocketFactory: () => new WebSocket(wsUrl),
  //       debug: (str) => console.log("HERE",str),
  //       onConnect: () => {
  //         var c = stompClient.publish({
  //           destination: "/app/subscribe",
  //           headers: {
  //             Authorization: `Bearer ${userId}`,
  //           },
  //           body: JSON.stringify({ userId, greenhouseIds }),
  //         });
  //         var a = stompClient.subscribe(
  //           "/queue/greenhouse/c670e06e-afa8-4d4f-8005-b7bea9b38054",
  //           (message) => {
  //             console.log("Received message:", message.body);
  //             setMessages((prev) => [...prev, message.body]);
  //           }
  //         );

  //         console.log(a);
  //         console.log(c);
  //         console.log("✅ WebSocket connected successfully!");
  //         setConnected(true);
  //       },

  //       onDisconnect: () => {
  //         console.warn("⚠️ WebSocket disconnected.");
  //         setConnected(false);
  //         stompClient.publish({
  //           destination: "/app/unsubscribe",
  //           headers: {
  //             Authorization: `Bearer ${userId}`,
  //           },
  //           body: JSON.stringify({ userId, greenhouseIds }),
  //         });
  //       },

  //       onStompError: (frame) => {
  //         console.error("❌ STOMP error:", frame);
  //       },
  //       onWebSocketClose: () => {
  //         console.warn("⚠️ WebSocket connection closed.");
  //         setConnected(false);
  //       },
  //       onWebSocketError: (error) => {
  //         console.error("❌ WebSocket error:", error);
  //       },
  //     });

  //     stompClient.activate();

  //     return () => {
  //       stompClient.deactivate().catch((err) => {
  //         console.error("❌ Error during WebSocket deactivation:", err);
  //       });
  //     };
  //   }, [userId, greenhouseIds, wsUrl]);

  const toggleNotification = () => {
    setNoti(!noti);
    setModalVisible(true);
    hideTabBar();
  };

  const insets = useSafeAreaInsets();
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-GB");

  if (!selectedGreenhouse || !selectedField) {
    return <GardenSetting />;
  }

  return (
    <View
      style={{
        ...styles.container,
        paddingTop: insets.top + 6,
        paddingBottom: 70 + insets.bottom,
      }}
    >
      {/* Header */}
      <View style={{ ...styles.header, paddingBottom: 20 }}>
        <Text style={{ ...styles.headingText }}>Xin chao!</Text>
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
            <Text style={styles.subtitle}>{formattedDate}</Text>
          </View>
          <TouchableOpacity
            style={styles.overlayButton}
            onPress={() => {
              setImageState(getRandomImage());
            }}
          >
            <Feather name="refresh-ccw" size={30} color="orange" />
          </TouchableOpacity>
          {/* <Card.Actions style={styles.overlayButton}>
            <Button textColor='orange' icon="refresh" mode='outlined' onPress={() => {}}>
            
            </Button>
          </Card.Actions> */}
        </Card>
      </View>

      {/* Các chỉ số */}
      <TouchableOpacity
        onPress={() => {
          router.push("/dashboard");
        }}
      >
        <Card style={styles.card}>
          <Card.Content style={{ padding: 16 }}>
            <Title
              style={{
                ...styles.headingText,
                paddingTop: 10,
                paddingBottom: 3,
              }}
            >
              Chỉ số
            </Title>

            {/* Temperature sensors */}
            {selectedField.temperature_sensor.map((sensor, index) => (
              <View key={`temp-${index}`} style={styles.deviceItem}>
                <Ionicons name="thermometer-outline" size={24} color="orange" />
                <Text style={styles.DetailText}>Nhiệt độ</Text>
                <Text style={styles.DetailValue}>
                  {sensor.value} {sensor.unit}
                </Text>
                <Animated.View
                  style={[styles.statusDot, { opacity: opacityAnim }]}
                />
              </View>
            ))}

            {/* Humidity sensors */}
            {selectedField.humidity_sensor.map((sensor, index) => (
              <View key={`humid-${index}`} style={styles.deviceItem}>
                <Ionicons name="water-outline" size={24} color="blue" />
                <Text style={styles.DetailText}>Độ ẩm không khí</Text>
                <Text style={styles.DetailValue}>
                  {sensor.value} {sensor.unit}
                </Text>
                <Animated.View
                  style={[styles.statusDot, { opacity: opacityAnim }]}
                />
              </View>
            ))}

            {/* Soil moisture sensors */}
            {selectedField.soil_moisture_sensor.map((sensor, index) => (
              <View key={`soil-${index}`} style={styles.deviceItem}>
                <Ionicons name="leaf-outline" size={24} color="green" />
                <Text style={styles.DetailText}>Độ ẩm đất</Text>
                <Text style={styles.DetailValue}>
                  {sensor.value} {sensor.unit}
                </Text>
                <Animated.View
                  style={[styles.statusDot, { opacity: opacityAnim }]}
                />
              </View>
            ))}

            {/* Light sensors */}
            {selectedField.light_sensor.map((sensor, index) => (
              <View key={`light-${index}`} style={styles.deviceItem}>
                <Ionicons name="sunny-outline" size={24} color="yellow" />
                <Text style={styles.DetailText}>Ánh sáng</Text>
                <Text style={styles.DetailValue}>
                  {sensor.value} {sensor.unit}
                </Text>
                <Animated.View
                  style={[styles.statusDot, { opacity: opacityAnim }]}
                />
              </View>
            ))}
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Thiết bị */}
      <TouchableOpacity
        onPress={() => {
          router.push("/setting");
        }}
      >
        <Card style={styles.card}>
          <Card.Content style={{ padding: 16 }}>
            <Title
              style={{
                ...styles.headingText,
                paddingTop: 10,
                paddingBottom: 3,
              }}
            >
              Thiết bị
            </Title>
            {selectedField.fan_status.map((status, index) => (
              <View key={`fan-${index}`} style={styles.deviceItem}>
                <MaterialCommunityIcons name="fan" size={24} color="cyan" />
                <Text style={styles.DetailText}>Quạt</Text>
                <Text style={styles.DetailValue}>
                  {status.value ? "Bật" : "Tắt"}
                </Text>
                <Animated.View
                  style={[
                    styles.statusDot,
                    {
                      opacity: opacityAnim,
                      backgroundColor: status.value ? "green" : "red",
                    },
                  ]}
                />
              </View>
            ))}

            {/* LED status */}
            {selectedField.led_status.map((status, index) => (
              <View key={`led-${index}`} style={styles.deviceItem}>
                <Ionicons name="bulb-outline" size={24} color="gold" />
                <Text style={styles.DetailText}>Đèn LED</Text>
                <Text style={styles.DetailValue}>
                  {status.value ? "Bật" : "Tắt"}
                </Text>
                <Animated.View
                  style={[
                    styles.statusDot,
                    {
                      opacity: opacityAnim,
                      backgroundColor: status.value ? "green" : "red",
                    },
                  ]}
                />
              </View>
            ))}

            {/* Pump status */}
            {selectedField.pump_status.map((status, index) => (
              <View key={`pump-${index}`} style={styles.deviceItem}>
                <Ionicons name="water" size={24} color="blue" />
                <Text style={styles.DetailText}>Máy bơm</Text>
                <Text style={styles.DetailValue}>
                  {status.value ? "Bật" : "Tắt"}
                </Text>
                <Animated.View
                  style={[
                    styles.statusDot,
                    {
                      opacity: opacityAnim,
                      backgroundColor: status.value ? "green" : "red",
                    },
                  ]}
                />
              </View>
            ))}
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <BottomSheetModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          showTabBar();
        }}
        notification={notifications}
        reminder={reminders}
      />
    </View>
  );
};

export default HomeScreen;
