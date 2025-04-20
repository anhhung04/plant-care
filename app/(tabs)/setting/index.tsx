import React, { useState, useEffect, useCallback } from "react";
import SettingsIcon from "@/assets/icons/setting-fill-22.svg";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiCall } from "@/src/utils/apiCall";
import settingsMockData from "@/src/data/settings.mock.json";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SettingStackParamList } from "../_layout";
import { colors } from "@/assets/fonts/colors";
import { useGarden } from "@/src/context/GreenHouse";
import { API_GREENHOUSE_URL } from "@/config";
import { Field } from "@/src/context/GreenHouse";

interface DeviceType {
  name: string;
  mode: string;
  status: boolean;
  intensity: number;
}

interface ConfigType {
  mode: string;
  turn_off_after: number;
  turn_on_at: string;
  repeat: string;
  dates: string[];
}

interface DeviceList {
  config_led: ConfigType;
  config_fan: ConfigType;
  config_pump: ConfigType;
}

const devicesImage = {
  led: require("@/assets/images/led.png"),
  fan: require("@/assets/images/fan.png"),
  pump: require("@/assets/images/pump.png"),
};

const deviceName = {
  led: "Đèn Led",
  fan: "Quạt",
  pump: "Bơm Nước",
};

const modeName = {
  manual: "Thủ công",
  automatic: "Tự động",
  scheduled: "Hẹn giờ",
};

const CardDevice: React.FC<DeviceType> = ({
  name,
  mode,
  status,
  intensity,
}) => {
  const router = useRouter();
  const [updateStatus, setUpdateStatus] = useState(status);
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingStackParamList>>();
  const { selectedGreenhouse, selectedFieldIndex } = useGarden();

  let toggledStatus = status ? 0 : 100;

  console.log("🔍 deviceStatus", status);

  const toggleSwitch = () => {
    setUpdateStatus((prev) => !prev);
    saveSettingsMutation.mutate();
  };

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      return apiCall({
        endpoint: `/${selectedGreenhouse?.greenhouse_id}/fields/${selectedFieldIndex}/control?device=${name}&value=${toggledStatus}`,
        method: "POST",
      });
    },
    onError: (error) => {
      setUpdateStatus((prev) => !prev);
      console.error("Error saving settings:", error);
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.LeftSection}>
        <Image
          source={devicesImage[name as keyof typeof devicesImage]}
          style={styles.icon}
        />
        <View style={styles.info}>
          <Text style={styles.name}>
            {deviceName[name as keyof typeof deviceName]}
          </Text>
          <View style={styles.ButtonRow}>
            <Text style={styles.label}>Trạng thái:</Text>
            <Switch
              value={updateStatus}
              onValueChange={toggleSwitch}
              trackColor={{ false: "#ccc", true: "#ffa500" }}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.label}>Cường độ: {intensity}%</Text>
        </View>
      </View>
      <View style={styles.ControlSection}>
        <Text style={styles.mode}>
          {modeName[mode as keyof typeof modeName]}
        </Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            navigation.navigate("ConfigScreen", { device_name: name })
          }
        >
          <SettingsIcon width={22} height={22} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function SettingTab() {
  const insets = useSafeAreaInsets();
  const [deviceList, setDeviceList] = useState<DeviceList | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<Field | null>(null);
  const { selectedGreenhouse, selectedField, selectedFieldIndex } = useGarden();

  console.log("greenhouse", selectedGreenhouse?.greenhouse_id);
  console.log("field", selectedFieldIndex);
  console.log(
    "🔍",
    `/${selectedGreenhouse?.greenhouse_id}/fields/${selectedFieldIndex}`
  );

  const { data, isSuccess, isError, refetch } = useQuery<any>({
    queryKey: [
      "settings",
      selectedGreenhouse?.greenhouse_id,
      selectedFieldIndex,
    ],
    queryFn: () =>
      apiCall({
        endpoint: `/${selectedGreenhouse?.greenhouse_id}/fields/${selectedFieldIndex}`,
      }),
    enabled:
      !!selectedGreenhouse?.greenhouse_id &&
      selectedFieldIndex !== null &&
      selectedFieldIndex !== undefined,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    if (data) {
      console.log("🔍 data", data);
      setDeviceList(data.metadata);
      setDeviceStatus(data.sensors);
    }
  }, [data]);

  return (
    <SafeAreaView
      style={{
        ...styles.container,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom,
      }}
    >
      <CardDevice
        name="led"
        mode={deviceList?.config_led?.mode ?? ""}
        status={(Number(deviceStatus?.led_status?.[0]?.value) ?? 0) > 0}
        intensity={deviceStatus?.led_status?.[0]?.value ?? 0}
      />
      <CardDevice
        name="fan"
        mode={deviceList?.config_fan?.mode ?? ""}
        status={(Number(deviceStatus?.fan_status?.[0]?.value) ?? 0) > 0}
        intensity={selectedField?.fan_status?.[0]?.value ?? 0}
      />
      <CardDevice
        name="pump"
        mode={deviceList?.config_pump?.mode ?? ""}
        status={(Number(deviceStatus?.pump_status?.[0]?.value) ?? 0) > 0}
        intensity={selectedField?.pump_status?.[0]?.value ?? 0}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    justifyContent: "space-between",
    elevation: 4,
    height: 152,
    width: "100%",
    gap: 12,
  },
  icon: {
    width: 82,
    height: 82,
    resizeMode: "contain",
  },
  info: {
    flexDirection: "column",
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  mode: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  ControlSection: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  label: {
    fontSize: 14,
    marginRight: 6,
  },
  LeftSection: {
    gap: 12,
    flexDirection: "row",
  },
  iconButton: {
    backgroundColor: "#00712D",
    padding: 4,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: 30,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
