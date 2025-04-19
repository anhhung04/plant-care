import React, { useLayoutEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useContext } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RadioButtonGroup, RadioButtonItem } from "expo-radio-button";
import ManualSetting from "@/src/components/setting/ManualSetting";
import ScheduledSetting from "@/src/components/setting/ScheduledSetting";
import AutomaticSetting from "@/src/components/setting/AutomaticSetting";
import { TabBarContext } from "../_layout";
import { Field, useGarden } from "@/src/context/GreenHouse";
import { useQuery } from "@tanstack/react-query";
import { API_GREENHOUSE_URL } from "@/config";
import { apiCall } from "@/src/utils/apiCall";

const deviceNameConst = {
  led: "Đèn Led",
  fan: "Quạt",
  pump: "Bơm Nước",
};

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

const RadioButtonSection: React.FC<{
  initialValue: string;
  option: string;
  setOption: (option: string) => void;
}> = ({ initialValue, option, setOption }) => {
  return (
    <View>
      <RadioButtonGroup
        containerStyle={styles.radioButtonSection}
        selected={option}
        onSelected={(value: string) => setOption(value)}
        radioBackground="#FF9100"
        radioStyle={{ height: 20, width: 20, marginRight: 4 }}
      >
        <RadioButtonItem
          value="manual"
          label={
            <Text>
              Thủ công {"manual" === initialValue ? "(Hiện tại)" : ""}
            </Text>
          }
        />
        <RadioButtonItem
          value="schedule"
          label={
            <Text>
              Hẹn giờ {"schedule" === initialValue ? "(Hiện tại)" : ""}
            </Text>
          }
        />
        <RadioButtonItem
          value="automatic"
          label={
            <Text>
              Tự động {"automatic" === initialValue ? "(Hiện tại)" : ""}
            </Text>
          }
        />
      </RadioButtonGroup>
    </View>
  );
};

export default function ConfigScreen() {
  const route = useRoute();
  const { device_name } = route.params as { device_name: string };
  const deviceName = device_name as string;
  const [deviceConfig, setDeviceConfig] = useState<ConfigType | null>(null);
  const initialValue = deviceConfig?.mode ?? "manual";
  const router = useRouter();
  const [option, setOption] = useState(initialValue);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [notifySave, setNotifySave] = useState(false);
  const { hideTabBar, showTabBar } = useContext(TabBarContext);
  const { selectedGreenhouse, selectedField, selectedFieldIndex } = useGarden();
  const [deviceStatus, setDeviceStatus] = useState<Field | null>(null);

  const { data, isSuccess, isError } = useQuery<any>({
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
  });

  useEffect(() => {
    if (data) {
      console.log("settings", data.metadata);
      if (deviceName === "led") {
        setDeviceConfig(data.metadata.config_led);
      } else if (deviceName === "fan") {
        setDeviceConfig(data.metadata.config_fan);
      } else if (deviceName === "pump") {
        setDeviceConfig(data.metadata.config_pump);
      }
      setDeviceStatus(data.sensors);
      setOption(initialValue);
    }
  }, [data]);

  useEffect(() => {
    hideTabBar();

    return () => {
      showTabBar();
    };
  }, []);

  console.log("deviceName:", deviceName);

  let initialSettings;

  switch (option) {
    case "manual":
      initialSettings = (
        <ManualSetting
          currentSettings={initialValue}
          device_name={deviceName}
          notifySave={notifySave}
          setNotifySave={setNotifySave}
          deviceConfig={deviceConfig}
          deviceIntensity={
            deviceStatus?.[`${deviceName}_status` as keyof Field]?.[0]?.value ??
            0
          }
        />
      );
      break;
    case "schedule":
      initialSettings = (
        <ScheduledSetting
          currentSettings={initialValue}
          device_name={deviceName}
          notifySave={notifySave}
          setNotifySave={setNotifySave}
        />
      );
      break;
    case "automatic":
      initialSettings = (
        <AutomaticSetting
          currentSettings={initialValue}
          device_name={deviceName}
          notifySave={notifySave}
          setNotifySave={setNotifySave}
        />
      );
      break;
    default:
      initialSettings = (
        <ManualSetting
          currentSettings={initialValue}
          device_name={deviceName}
          notifySave={notifySave}
          setNotifySave={setNotifySave}
          deviceConfig={deviceConfig}
          deviceIntensity={
            deviceStatus?.[`${deviceName}_status` as keyof Field]?.[0]?.value ??
            0
          }
        />
      );
  }

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  return (
    <SafeAreaView
      style={{
        ...styles.container,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {`Cài đặt ${
            deviceNameConst[device_name as keyof typeof deviceNameConst]
          }`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chế độ điều khiển</Text>
        <RadioButtonSection
          initialValue={initialValue}
          option={option}
          setOption={setOption}
        />
      </View>

      {initialSettings}

      <View style={styles.buttons}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#FF7F00", fontWeight: "bold" }}>Huỷ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => setNotifySave(true)}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f7f1",
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 20,
  },
  ButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    top: -10,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    alignItems: "center",
    marginTop: "auto",
  },
  saveButton: {
    backgroundColor: "#FF7F00",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  radioButtonSection: {
    paddingHorizontal: 20,
    gap: 8,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});
