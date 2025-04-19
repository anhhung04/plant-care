import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { RadioButtonGroup, RadioButtonItem } from "expo-radio-button";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "react-native-calendars";
import { useMutation } from "@tanstack/react-query";
import { apiCall } from "@/src/utils/apiCall";
import { useRouter } from "expo-router";
import { useGarden } from "@/src/context/GreenHouse";
interface ConfigType {
  mode: string;
  turn_off_after: number;
  turn_on_at: string;
  repeat: string;
  dates: string[];
}

interface Props {
  selectedDates: { [key: string]: any };
  option: string;
  setOption: (option: string) => void;
  setSelectedDates: (value: { [key: string]: any }) => void;
}

const RadioButtonSectionWithCombobox: React.FC<Props> = ({
  selectedDates,
  option,
  setOption,
  setSelectedDates,
}) => {
  const toggleDate = (date: string) => {
    const newDates = { ...selectedDates };
    if (newDates[date]) {
      delete newDates[date]; // Bỏ chọn
    } else {
      newDates[date] = {
        selected: true,
        selectedColor: "#FFA500", // Màu cam
      };
    }
    setSelectedDates(newDates);
  };
  return (
    <View>
      <RadioButtonGroup
        containerStyle={styles.radioButtonSection}
        selected={option}
        onSelected={(value: string) => setOption(value)}
        radioBackground="#FF9100"
        radioStyle={{ height: 20, width: 20, marginRight: 4 }}
      >
        <RadioButtonItem value="today" label={<Text>Ngày hôm nay</Text>} />
        <RadioButtonItem value="everyday" label={<Text>Mỗi ngày</Text>} />
        <RadioButtonItem value="custom" label={<Text>Lặp lại vào </Text>} />
      </RadioButtonGroup>
      {option === "custom" && (
        <View>
          <Calendar
            onDayPress={(day: any) => toggleDate(day.dateString)}
            markedDates={selectedDates}
            theme={{
              selectedDayBackgroundColor: "#FFA500",
              todayTextColor: "#FF6600",
            }}
            markingType={"multi-dot"}
          />
        </View>
      )}
    </View>
  );
};

const ScheduledSetting: React.FC<{
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
  const [intensity, setIntensity] = useState(deviceIntensity ?? 0);
  const [option, setOption] = useState(deviceConfig?.repeat ?? "today");
  const [OffTime, setOffTime] = useState(deviceConfig?.turn_off_after ?? 0);
  const [OnTime, setOnTime] = useState(
    deviceConfig?.turn_on_at ?? getTimePlus30Minutes()
  );
  const [show, setShow] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: any }>(
    deviceConfig?.dates ?? {}
  );

  const { selectedGreenhouse, selectedFieldIndex } = useGarden();

  useEffect(() => {
    if (deviceConfig) {
      setIntensity(deviceIntensity);
      setOption(deviceConfig.repeat);
      setOffTime(deviceConfig.turn_off_after);
      setOnTime(deviceConfig.turn_on_at);
      setSelectedDates(deviceConfig.dates);
    }
  }, [deviceConfig]);

  const saveSettingsMutationStatus = useMutation({
    mutationFn: async () => {
      return apiCall({
        endpoint: `/${selectedGreenhouse?.greenhouse_id}/fields/${selectedFieldIndex}/control?device=${device_name}&value=${intensity}`,
        method: "POST",
      });
    },
    onSuccess: () => {
      setNotifySave(false);
      router.back();
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
            mode: "scheduled",
            turn_off_after: OffTime,
            turn_on_at: OnTime,
            repeat: option,
            dates: selectedDates,
          },
        },
      });
    },
    onSuccess: () => {
      setNotifySave(false);
      console.log("🔍 saveSettingsMutation.mutate");
      router.back();
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
    },
  });

  useEffect(() => {
    if (notifySave) {
      saveSettingsMutationStatus.mutate();
      saveSettingsMutationConfig.mutate();
    }
  }, [notifySave]);

  const onChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === "ios");
    if (selectedDate) {
      setOnTime(selectedDate);
    }
  };

  const showTimepicker = () => {
    setShow(true);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleChangeIntensity = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    const number = Math.max(0, Math.min(100, Number(numericValue)));
    setIntensity(number);
  };

  const handleChangeOffTime = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    const number = Math.max(0, Math.min(100, Number(numericValue)));
    setOffTime(number);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{ borderRadius: 20 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hẹn giờ</Text>
          <View style={[styles.ButtonRow, { top: -16 }]}>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>Cường độ: </Text>
            <TextInput
              onChangeText={handleChangeIntensity}
              value={intensity.toString()}
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
          <View style={[{ gap: 12 }]}>
            <View style={[styles.ButtonRow, { top: -16 }]}>
              <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                Bật lúc:{" "}
              </Text>
              <TouchableOpacity
                onPress={showTimepicker}
                style={{
                  width: 50,
                  backgroundColor: "#FFE9CC",
                  borderRadius: 6,
                  marginHorizontal: 8,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>{formatTime(OnTime as Date)}</Text>
                {show && (
                  <DateTimePicker
                    value={OnTime as Date}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                  />
                )}
              </TouchableOpacity>
            </View>
            <RadioButtonSectionWithCombobox
              selectedDates={selectedDates}
              option={option}
              setOption={setOption}
              setSelectedDates={setSelectedDates}
            />
          </View>
          <View style={[styles.ButtonRow, { top: -12 }]}>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>Tắt sau: </Text>
            <TextInput
              onChangeText={handleChangeOffTime}
              value={OffTime.toString()}
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
            <Text style={{ fontSize: 14 }}>Phút</Text>
          </View>
        </View>
      </ScrollView>
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
    gap: 20,
  },
  radioButtonSection: {
    paddingHorizontal: 20,
    gap: 8,
    top: -12,
  },
});

const getTimePlus30Minutes = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return now;
};

export default ScheduledSetting;
