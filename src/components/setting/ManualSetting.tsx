import React from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from "react-native";
import { useState, useEffect } from "react";
import { RadioButtonGroup, RadioButtonItem } from "expo-radio-button";
import { apiCall } from "@/src/utils/apiCall";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import settingsDeviceNameMockData from "@/src/data/settings.device_name.json";
import { useGarden } from "@/src/context/GreenHouse";
interface ConfigType {
  mode: string;
  turn_off_after: number;
  turn_on_at: string;
  repeat: string;
  dates: string[];
}

interface Props {
  time: number;
  option: string;
  setOption: (option: string) => void;
  setTime: (value: number) => void;
}

const RadioButtonSection: React.FC<Props> = ({
  time,
  option,
  setOption,
  setTime,
}) => {
  const handleChangeTimeValue = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    const value = Math.max(0, Math.min(100, Number(numericValue)));
    setTime(value);
  };

  console.log("🔍 time:", time);

  return (
    <View>
      <RadioButtonGroup
        containerStyle={styles.radioButtonSection}
        selected={option}
        onSelected={(value: string) => setOption(value)}
        radioBackground="#FF9100"
        radioStyle={{ height: 20, width: 20, marginRight: 4 }}
      >
        <RadioButtonItem value="never" label={<Text>Không bao giờ</Text>} />
        <RadioButtonItem
          value="custom"
          label={
            <>
              <TextInput
                onChangeText={handleChangeTimeValue}
                value={option === "custom" ? time.toString() : "0"}
                keyboardType="numeric"
                placeholder="Enter numbers only"
                placeholderTextColor="#999"
                style={{
                  width: 40,
                  textAlign: "center",
                  backgroundColor: option === "custom" ? "#FFE9CC" : "#f0f0f0",
                  borderRadius: 6,
                  marginHorizontal: 8,
                  height: 40,
                }}
                editable={option === "custom"}
              />
              <Text style={{ fontSize: 14 }}>Phút</Text>
            </>
          }
        />
      </RadioButtonGroup>
    </View>
  );
};

const ManualSetting: React.FC<{
  device_name: string;
  notifySave: boolean;
  setNotifySave: (notifySave: boolean) => void;
  currentSettings: string;
  deviceConfig: ConfigType | null;
  deviceIntensity: number;
}> = ({
  device_name,
  notifySave,
  setNotifySave,
  currentSettings,
  deviceConfig,
  deviceIntensity,
}) => {
  const router = useRouter();
  const { selectedGreenhouse, selectedFieldIndex } = useGarden();

  // const { data: settings } = useQuery<any>({
  //   queryKey: ["settings", device_name],
  //   queryFn: () => apiCall({ endpoint: `/settings/${device_name}` }),
  //   enabled: currentSettings === "manual",
  // });

  const [states, setState] = useState({
    status: deviceIntensity > 0 ? true : false,
    intensity: deviceIntensity ?? 0,
  });
  const [option, setOption] = useState(
    deviceConfig?.turn_off_after === 0 ? "never" : "custom"
  );

  const [time, setTime] = useState(deviceConfig?.turn_off_after ?? 0);

  useEffect(() => {
    if (deviceConfig) {
      setOption(deviceConfig.turn_off_after === 0 ? "never" : "custom");
      setTime(deviceConfig.turn_off_after);
    }
  }, [deviceConfig]);

  const updatedStatus = states.status ? states.intensity : 0;

  // useEffect(() => {
  //   if (settings && currentSettings === "manual") {
  //     setState({ status: settings.status, intensity: settings.intensity });
  //     setOption(settings.option);
  //     setTime(settings.time);
  //   }
  // }, [settings, currentSettings]);

  const saveSettingsMutationStatus = useMutation({
    mutationFn: async () => {
      return apiCall({
        endpoint: `/${selectedGreenhouse?.greenhouse_id}/fields/${selectedFieldIndex}/control?device=${device_name}&value=${updatedStatus}`,
        method: "POST",
      });
    },
    onSuccess: () => {
      setNotifySave(false);
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
    },
  });

  const saveSettingsMutationConfig = useMutation({
    mutationFn: async () => {
      return apiCall({
        endpoint: `/${selectedGreenhouse?.greenhouse_id}/fields/${selectedFieldIndex}`,
        method: "PATCH",
        body: {
          [`config_${device_name}`]: {
            mode: "manual",
            turn_off_after: option === "never" ? 0 : time,
          },
        },
      });
    },
    onSuccess: () => {
      setNotifySave(false);
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
    },
  });

  useEffect(() => {
    if (notifySave) {
      Promise.all([
        saveSettingsMutationStatus.mutateAsync(),
        saveSettingsMutationConfig.mutateAsync(),
      ])
        .then(() => {
          setNotifySave(false);
          router.back(); // Navigate back only once after both succeed
        })
        .catch((error) => {
          console.error("Error saving settings:", error);
        });
    }
  }, [notifySave]);

  const toggleSwitch = () => {
    setState((prev) => ({
      ...prev,
      status: !prev.status,
    }));
  };

  const handleChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    const number = Math.max(0, Math.min(100, Number(numericValue)));
    setState((prev) => ({
      ...prev,
      intensity: number,
    }));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thủ công</Text>
        <View style={styles.ButtonRow}>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>Trạng thái:</Text>
          <Switch
            value={states.status}
            onValueChange={toggleSwitch}
            trackColor={{ true: "#ffa500", false: "#ccc" }}
            thumbColor="#fff"
          />
        </View>
        <View style={[styles.ButtonRow, { top: -16 }]}>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>Cường độ: </Text>
          <TextInput
            onChangeText={handleChange}
            value={states.intensity.toString()}
            keyboardType="numeric"
            placeholder="Enter numbers only"
            placeholderTextColor="#999"
            style={{
              width: 40,
              textAlign: "center",
              backgroundColor: "#FFE9CC",
              borderRadius: 6,
              marginHorizontal: 8,
              height: 40,
            }}
          />
          <Text style={{ fontSize: 14 }}>% </Text>
        </View>
        <View style={[{ top: -20, gap: 12 }]}>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>Tắt sau:</Text>
          <RadioButtonSection
            time={time}
            option={option}
            setOption={setOption}
            setTime={setTime}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
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
});

export default ManualSetting;
