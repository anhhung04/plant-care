import React from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { RadioButtonGroup, RadioButtonItem } from "expo-radio-button";
import { useMutation } from "@tanstack/react-query";
import { apiCall } from "@/src/utils/apiCall";
import { useRouter } from "expo-router";
import { useGarden } from "@/src/context/GreenHouse";
import { ImageBackground } from "react-native";

const AutomaticSetting: React.FC<{
  device_name: string;
  notifySave: boolean;
  setNotifySave: (notifySave: boolean) => void;
  currentSettings: string;
}> = ({ device_name, notifySave, setNotifySave, currentSettings }) => {
  const router = useRouter();
  const { selectedGreenhouse, selectedFieldIndex } = useGarden();

  const saveSettingsMutationStatus = useMutation({
    mutationFn: async () => {
      return apiCall({
        endpoint: `/${
          selectedGreenhouse?.greenhouse_id
        }/fields/${selectedFieldIndex}/control?device=${device_name}&value=${100}`,
        method: "POST",
      });
    },
    onSuccess: () => {
      setNotifySave(false);
      router.push("/setting");
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
            mode: "automatic",
          },
        },
      });
    },
    onSuccess: () => {
      setNotifySave(false);
      console.log("🔍 saveSettingsMutation.mutate");
      router.push("/setting");
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

  return (
    // <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    //   <View style={styles.section}>
    //     <Text style={styles.sectionTitle}>Tự động</Text>
    <ImageBackground
      source={require("@/assets/images/grdt-bg.jpg")}
      style={styles.aiImage}
    >
      <Text style={styles.aiDesc}>
        Thiết bị sẽ được điều khiển thông minh dựa trên dữ liệu cảm biến
      </Text>
    </ImageBackground>
    //   </View>
    // </TouchableWithoutFeedback>
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
    minHeight: 400,
  },
  radioButtonSection: {
    paddingHorizontal: 20,
    gap: 8,
  },
  aiCard: {
    flexDirection: "row",
    backgroundColor: "purple",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    marginHorizontal: 4,
    height: 100,
  },
  aiDesc: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  aiImage: {
    width: 354,
    height: 120,
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
});

export default AutomaticSetting;
