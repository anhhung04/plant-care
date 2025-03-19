import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../../src/styles/PageStyle';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '@/assets/fonts/colors';
import { useEffect, useState } from 'react';
import {DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { LineChart, yAxisSides } from "react-native-gifted-charts";
import { fonts } from "@/assets/fonts/font";


interface Data {
  value: number; // Giá trị nhiệt độ
  label: string; // Nhãn thời gian
}
interface AllData {
  name : string;
  data : Data;
  color: string;
}
const temperatureData : Data[] = [
    { value: 24, label: "04:00" }, // 24-hour format
    { value: 27, label: "08:00" },
    { value: 34, label: "12:00" },
    { value: 30, label: "16:00" },
    { value: 28, label: "20:00" },
    { value: 22, label: "00:00" },
];
const atmosphereData : Data[] = [
  { value: 70, label: "04:00" }, // 24-hour format
  { value: 74, label: "08:00" },
  { value: 60, label: "12:00" },
  { value: 75, label: "16:00" },
  { value: 78, label: "20:00" },
  { value: 82, label: "00:00" },
];

const soilData : Data[] = [
  { value: 80, label: "04:00" }, // 24-hour format
  { value: 74, label: "08:00" },
  { value: 60, label: "12:00" },
  { value: 55, label: "16:00" },
  { value: 78, label: "20:00" },
  { value: 92, label: "00:00" },
];

const lightData : Data[] = [
  { value: 600, label: "04:00" }, // 24-hour format
  { value: 744, label: "08:00" },
  { value: 800, label: "12:00" },
  { value: 755, label: "16:00" },
  { value: 670, label: "20:00" },
  { value: 600, label: "00:00" },
];

const temperatureData_1 : Data[] = [
  { value: 22, label: "04:00" }, // 24-hour format
  { value: 23, label: "08:00" },
  { value: 30, label: "12:00" },
  { value: 30, label: "16:00" },
  { value: 28, label: "20:00" },
  { value: 22, label: "00:00" },
];

const atmosphereData_1 : Data[] = [
{ value: 80, label: "04:00" }, // 24-hour format
{ value: 84, label: "08:00" },
{ value: 70, label: "12:00" },
{ value: 75, label: "16:00" },
{ value: 78, label: "20:00" },
{ value: 89, label: "00:00" },
];

const soilData_1 : Data[] = [
{ value: 70, label: "04:00" }, // 24-hour format
{ value: 64, label: "08:00" },
{ value: 60, label: "12:00" },
{ value: 55, label: "16:00" },
{ value: 78, label: "20:00" },
{ value: 70, label: "00:00" },
];

const lightData_1 : Data[] = [
{ value: 660, label: "04:00" }, // 24-hour format
{ value: 834, label: "08:00" },
{ value: 1000, label: "12:00" },
{ value: 955, label: "16:00" },
{ value: 770, label: "20:00" },
{ value: 600, label: "00:00" },
];

const Dashboard: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [date, setDate] = useState(new Date());

  const [tempState, setTempState] = useState(temperatureData);
  const [airState, setAirState] = useState(atmosphereData);
  const [soilState , setSoilState] = useState(soilData);
  const [lightState, setLightState] = useState(lightData);

  const [yAxisRanges, setYAxisRanges] = useState({
    temperature: { min: 0, max: 100 },
    atmosphere: { min: 0, max: 100 },
    soil: { min: 0, max: 100 },
    light: { min: 0, max: 100 },
});

  useEffect(() => {
      const calculateRange = (data: any[]) => {
          if (data.length > 0) {
              const min = Math.floor(Math.min(...data.map((item) => item.value)) / 5) * 5;
              const max = Math.ceil(Math.max(...data.map((item) => item.value)) / 5) * 5;
              console.log({min,max})
              return { min, max };
          }
          return { min: 0, max: 100 };
      };

      setYAxisRanges({
          temperature: calculateRange(tempState),
          atmosphere: calculateRange(airState),
          soil: calculateRange(soilState),
          light: calculateRange(lightState),
      });
  }, [tempState, airState, soilState, lightState]);

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const currentDate = selectedDate;
      setDate(currentDate);

      setTempState(temperatureData_1);
      setAirState(atmosphereData_1);
      setSoilState(soilData_1);
      setLightState(lightData_1);
    }
  };

  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: 'date',
      is24Hour: true,
      maximumDate: new Date(),
      minimumDate: new Date(2025, 0, 1),
      display: 'spinner'
    });
  };

    return (
      <ScrollView 
      style={{...stylesNew.container }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 70 }}
      
      >  
        {/* Header */}
        <View style={{...stylesNew.header, paddingBottom: 20}}> 
          <TouchableOpacity onPress={() => showDatepicker() }>
            <Ionicons name="calendar-outline" size={34} color={colors.light} style={{paddingRight:5}}/>
          </TouchableOpacity>
          <Text style={stylesNew.HeaderText}>{date.toLocaleDateString("en-GB")}</Text>
          
        </View>

        {/*Nhiệt độ */}
        <View style={stylesNew.card}>
          <Text style={stylesNew.overlayRight}>Nhiệt độ (°C)</Text>
          <View style={stylesNew.chart}>
          <LineChart
            data={tempState}
            curved
            areaChart
            animateOnDataChange
            animationDuration={1000}
            onDataChangeAnimationDuration={1000}
            isAnimated= {true}
            hideDataPoints
            color="#FF5733"
            startFillColor="rgba(255, 87, 51, 0.5)"
            endFillColor="rgba(255, 87, 51, 0.2)"
            startOpacity={0.8}
            endOpacity={0.3}
            xAxisLabelTextStyle={{ fontSize: 12, color: "gray" }}
            thickness={3}
            initialSpacing={12}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ fontSize: 14, color: "gray" }}
            yAxisOffset={yAxisRanges.temperature.min -10}
            noOfSections={3}
            hideRules
            maxValue={yAxisRanges.temperature.max - yAxisRanges.temperature.min + 10}
            width={300} // 
            adjustToWidth= {true}
            height={120} //
            yAxisColor={colors.axis}
            xAxisColor={colors.axis} 
          />
          </View>
        </View>

        <View style={stylesNew.card}>
          <Text style={stylesNew.overlayRight}>Độ ẩm không khí (%)</Text>
          <View style={stylesNew.chart}>
          <LineChart
            data={airState}
            curved
            areaChart
            animateOnDataChange
            animationDuration={1000}
            onDataChangeAnimationDuration={1000}
            isAnimated= {true}
            color="#073763"
            startFillColor="rgba(74, 106, 170, 0.5)"
            endFillColor="rgba(17, 64, 133, 0.2)"
            startOpacity={0.8}
            endOpacity={0.3}
            xAxisLabelTextStyle={{ fontSize: 12, color: "gray" }}
            thickness={3}
            hideDataPoints
            initialSpacing={12}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ fontSize: 14, color: "gray" }}
            hideRules
            yAxisOffset={yAxisRanges.atmosphere.min-10}
            maxValue={yAxisRanges.atmosphere.max-yAxisRanges.atmosphere.min + 10}
            noOfSections={3}
            height={120}
            adjustToWidth={true}
            width={300}
            yAxisColor={colors.axis}
            xAxisColor={colors.axis}
          />
          </View>
        </View>

        <View style={stylesNew.card}>
          <Text style={stylesNew.overlayRight}>Độ ẩm đất (%)</Text>
          <View style={stylesNew.chart}>
          <LineChart
            data={soilState}
            curved
            areaChart
            animateOnDataChange
            animationDuration={1000}
            onDataChangeAnimationDuration={1000}
            isAnimated= {true}
            color="rgba(38, 255, 0, 0.82)"
            startFillColor="rgba(84, 196, 78, 0.5)"
            endFillColor="rgba(28, 208, 52, 0.72)"
            startOpacity={0.8}
            endOpacity={0.3}
            xAxisLabelTextStyle={{ fontSize: 12, color: "gray" }}
            thickness={3}
            hideDataPoints
            initialSpacing={12}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ fontSize: 14, color: "gray" }}
            hideRules
            yAxisOffset={yAxisRanges.soil.min-10}
            maxValue={yAxisRanges.soil.max-yAxisRanges.soil.min + 10}
            noOfSections={3}
            height={120}
            adjustToWidth={true}
            width={300}
            yAxisColor={colors.axis}
            xAxisColor={colors.axis}
          />
          </View>
        </View>

        <View style={stylesNew.card}>
          <Text style={stylesNew.overlayRight}>CĐ ánh sáng (lux)</Text>
          <View style={stylesNew.chart}>
          <LineChart
            data={lightState}
            curved
            areaChart
            animateOnDataChange
            animationDuration={1000}
            onDataChangeAnimationDuration={1000}
            isAnimated= {true}
            color="rgba(246, 255, 0, 0.75)"
            startFillColor="rgba(230, 235, 96, 0.5)"
            endFillColor="rgba(208, 198, 21, 0.58)" 
            startOpacity={0.8}
            endOpacity={0.3}
            xAxisLabelTextStyle={{ fontSize: 12, color: "gray" }}
            thickness={3}
            hideDataPoints
            initialSpacing={12}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ fontSize: 14, color: "gray" }}
            hideRules
            yAxisOffset={yAxisRanges.light.min-10}
            maxValue={yAxisRanges.light.max-yAxisRanges.light.min + 10}
            noOfSections={3}
            height={120}
            adjustToWidth={true}
            width={300} 
            yAxisColor={colors.axis}
            xAxisColor={colors.axis}
          />
          </View>
        </View>
      </ScrollView>
    );
}

const stylesNew = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f7f1',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",  // Arrange items in a row
    alignItems: 'center',  // Vertically center items
      // Horizontally center items
    padding: 10,
  },
  HeaderText: {
    fontSize: 18,
    padding : 5,
    fontFamily: fonts.Bold,
    color: colors.white,
    backgroundColor: colors.light,
    borderRadius: 10
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 30,
    elevation: 0,
    marginBottom: 16,
   // alignItems: "center", // ✅ Centers everything inside the card
  },
  chart:{
    padding: 0,
    paddingTop:25,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  overlayRight:{
    position: 'absolute',
    top: 0,
    right: 0,
    paddingTop: 10,
    paddingRight: 20,
    color: colors.nblack,
    fontSize: 20,
    fontFamily: fonts.Bold,
    fontStyle: 'italic'
  },
  titleLeft:{
    top: 0,
    left: 0,
  }
});

export default Dashboard;