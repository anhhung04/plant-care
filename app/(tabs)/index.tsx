import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Switch, Card, Title, Paragraph, Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styles from "@/src/styles/PageStyle";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, router } from "expo-router";
import { BottomSheetModal } from "@/src/components/NotiModal";
import { NotificationItem, ReminderItem } from "@/src/utils/modal";
import { TabBarContext } from "./_layout";
import { getRandomImage, URL } from "@/src/utils/farmpic";
import { useGarden } from "@/src/context/GreenHouse";
import GardenSetting from "./gsetting";


const HomeScreen: React.FC = () => {
  const [noti, setNoti] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { hideTabBar, showTabBar } = useContext(TabBarContext);
  const [imageState, setImageState] = useState(URL[0]);

  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Lấy dữ liệu từ context greenhouse
  const {
    selectedGreenhouse,
    selectedField,
    selectedFieldIndex,
    startPolling,
    stopPolling,
  } = useGarden();

  // Start the blinking animation for active indicators
  useEffect(() => {
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

  // Check if selected field's sensor data has been updated
  useEffect(() => {
    if (!selectedField) return;

    // Function to check if sensor data has been updated
    const checkDataFreshness = () => {
      const now = Date.now();
      let isUpdated = false;

      // Get all sensor arrays as a group for easier checking
      const sensorGroups = [
        { key: "temperature", data: selectedField.temperature_sensor },
        { key: "humidity", data: selectedField.humidity_sensor },
        { key: "soil_moisture", data: selectedField.soil_moisture_sensor },
        { key: "light", data: selectedField.light_sensor },
      ];

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
  };

  if (!selectedGreenhouse || !selectedField) {
    return <GardenSetting />;
  }

  const insets = useSafeAreaInsets();

  return (
    <>
    <ScrollView style={{...styles.container}}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 100 }}>
      {/* Header */}

      <View style={{ ...styles.header, paddingBottom: 20 }}>
        <Text style={{ ...styles.headingText }}>Greenhouse 1</Text>
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
              {new Date(selectedGreenhouse.updated_at).toLocaleDateString(
                "en-GB"
              )}{" "}
              {new Date(
                new Date(selectedGreenhouse.updated_at).getTime() +
                  7 * 60 * 60 * 1000
              ).toLocaleTimeString("en-GB")}
            </Text>
          </View>
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
                  style={[
                    styles.statusDot,
                    {
                      opacity: opacityAnim,
                      backgroundColor:
                        "green" 
                    },
                  ]}
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
                  style={[
                    styles.statusDot,
                    {
                      opacity: opacityAnim,
                      backgroundColor:
                        "green"
                    },
                  ]}
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
                  style={[
                    styles.statusDot,
                    {
                      opacity: opacityAnim,
                      backgroundColor:
                        "green" 
                    },
                  ]}
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
                  style={[
                    styles.statusDot,
                    {
                      opacity: opacityAnim,
                      backgroundColor:
                       "green"
                    },
                  ]}
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
                  {status.value ? `Bật Mức ${status.value}` : "Tắt"}
                </Text>
                <Animated.View
                  style={[
                    styles.statusDot,
                    {
                      opacity: opacityAnim,
                      backgroundColor:status.value ? "green" : "red",
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
                  {status.value ? `Bật Mức ${status.value}` : "Tắt"}
                </Text>
                <Animated.View
                  style={[
                    styles.statusDot,
                    {
                      opacity: opacityAnim,
                      backgroundColor:status.value ? "green" : "red",
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
                <Text style={styles.DetailValue}>
                  {status.value ? `Bật Mức ${status.value}` : "Tắt"}
                </Text>
                <Animated.View
                  style={[
                    styles.statusDot,
                    {
                      opacity: opacityAnim,
                      backgroundColor: status.value ? "green" : "red"
                    },
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
    />
    </>
  );
};

export default HomeScreen;
