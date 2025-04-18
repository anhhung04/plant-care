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
import { useGarden } from '@/src/context/GreenHouse';
import { API_BASE_URL } from '@/config';


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

const Dashboard: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [date, setDate] = useState<Date>(new Date());


  const [tempState, setTempState] = useState<Data[]>(temperatureData);
  const [airState, setAirState] = useState<Data[]>(atmosphereData);
  const [soilState , setSoilState] = useState<Data[]>(soilData);
  const [lightState, setLightState] = useState<Data[]>(lightData);

  const { selectedGreenhouse } = useGarden();

  const [yAxisRanges, setYAxisRanges] = useState({
    temperature: { min: 0, max: 100 },
    atmosphere: { min: 0, max: 100 },
    soil: { min: 0, max: 100 },
    light: { min: 0, max: 100 },
  });

  const parseData = (rawData: { timestamp: string; unit: string; value: number }[], selectedDate: Date): Data[] => {
    const filteredData = rawData.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return (
        itemDate.getFullYear() === selectedDate.getFullYear() &&
        itemDate.getMonth() === selectedDate.getMonth() &&
        itemDate.getDate() === selectedDate.getDate()
      );
    }); // Filter data by the selected date

    const zoom = filteredData.length > 20 ? Math.floor(filteredData.length / 20) : 1; // Adjust the zoom level as needed
    console.log('Filtered data length:', filteredData.length);
    console.log('Zoom level:', zoom);

    return filteredData
      .filter((_, index) => index % zoom === 0) // Take every nth data point based on zoom
      .map((item) => {
        const date = new Date(item.timestamp);
        const hours = ((date.getHours() + 7) % 24).toString().padStart(2, '0'); // Adjust for GMT+7 and ensure 2-digit format
        const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure 2-digit format
        return {
          value: item.value,
          label: `${hours}:${minutes}`, // Format as "HH:mm"
        };
      });
  };

  const fetchData = async (selectedDate: Date) => {
    try {
      const response = await fetch(API_BASE_URL+'/greenhouses/ds-get-analyze/'+ selectedGreenhouse?.greenhouse_id,
        { method: 'GET',
          headers: {
          'Content-Type': 'application/json',
          // Add any other necessary headers here
        }}
      );
      if (response.ok) {
        const data = await response.json();
        const temperatureRaw = data.data.fields[0].temperature_sensor.reverse();
        const atmosphereRaw = data.data.fields[0].humidity_sensor.reverse();
        const soilRaw = data.data.fields[0].soil_moisture_sensor.reverse();
        const lightRaw = data.data.fields[0].light_sensor.reverse();

        // Parse raw data into the required format
        const parsedTemperatureData = parseData(temperatureRaw, selectedDate);
        setTempState(parsedTemperatureData);
        setAirState(parseData(atmosphereRaw,selectedDate));
        setSoilState(parseData(soilRaw,selectedDate));
        setLightState(parseData(lightRaw,selectedDate));
      } else {
        console.error('Failed request:', response);
      }

      // setTempState(data.temperature);
      // setAirState(data.atmosphere);
      // setSoilState(data.soil);
      // setLightState(data.light);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchData(date);
  }
  , []);

  useEffect(() => {
      const calculateRange = async (data: any[]) => {
          if (data.length > 0) {
              const min = Math.floor(Math.min(...data.map((item) => item.value)) / 5) * 5;
              const max = Math.ceil(Math.max(...data.map((item) => item.value)) / 5) * 5;
              return { min, max };
          }
          return { min: 0, max: 100 };
      };

      const updateYAxisRanges = async () => {
          setYAxisRanges({
              temperature: await calculateRange(tempState),
              atmosphere: await calculateRange(airState),
              soil: await calculateRange(soilState),
              light: await calculateRange(lightState),
          });
      };

      updateYAxisRanges();
  }, [tempState, airState, soilState, lightState]);

  const onChange = async (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const currentDate = selectedDate;
      setDate(currentDate);

      fetchData(currentDate);
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
          <TouchableOpacity onPress={() => showDatepicker() } style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="calendar-outline" size={34} color={colors.light} style={{paddingRight:5}}/>
            <Text style={stylesNew.HeaderText}>{date.toLocaleDateString("en-GB")}</Text>
          </TouchableOpacity>
          
        </View>

        {/*Nhiệt độ */}
        <View style={stylesNew.card}>
          <Text style={stylesNew.overlayRight}>Nhiệt độ (°C)</Text>
          <View style={stylesNew.chart}>
          <LineChart
            data={tempState}
            curved
            areaChart
            hideDataPoints
            color="#FF5733"
            startFillColor="rgba(255, 87, 51, 0.5)"
            endFillColor="rgba(255, 87, 51, 0.2)"
            startOpacity={0.8}
            endOpacity={0.3}
            xAxisLabelTextStyle={{ fontSize: 12, color: "gray" }}
            thickness={1}
            initialSpacing={18}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ fontSize: 14, color: "gray" }}
            yAxisOffset={yAxisRanges.temperature.min -10}
            noOfSections={3}
            hideRules
            maxValue={yAxisRanges.temperature.max - yAxisRanges.temperature.min + 10}
            width={300}
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
            color="#073763"
            startFillColor="rgba(74, 106, 170, 0.5)"
            endFillColor="rgba(17, 64, 133, 0.2)"
            startOpacity={0.8}
            endOpacity={0.3}
            xAxisLabelTextStyle={{ fontSize: 12, color: "gray" }}
            thickness={1}
            hideDataPoints
            initialSpacing={18}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ fontSize: 14, color: "gray" }}
            hideRules
            yAxisOffset={yAxisRanges.atmosphere.min-10}
            maxValue={yAxisRanges.atmosphere.max-yAxisRanges.atmosphere.min + 10}
            noOfSections={3}
            height={120}
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
            color="rgba(38, 255, 0, 0.82)"
            startFillColor="rgba(84, 196, 78, 0.5)"
            endFillColor="rgba(28, 208, 52, 0.72)"
            startOpacity={0.8}
            endOpacity={0.3}
            xAxisLabelTextStyle={{ fontSize: 12, color: "gray" }}
            thickness={1}
            hideDataPoints
            initialSpacing={18}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ fontSize: 14, color: "gray" }}
            hideRules
            yAxisOffset={yAxisRanges.soil.min-10}
            maxValue={yAxisRanges.soil.max-yAxisRanges.soil.min + 10}
            noOfSections={3}
            height={120}
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
            color="rgba(246, 255, 0, 0.75)"
            startFillColor="rgba(230, 235, 96, 0.5)"
            endFillColor="rgba(208, 198, 21, 0.58)" 
            startOpacity={0.8}
            endOpacity={0.3}
            xAxisLabelTextStyle={{ fontSize: 12, color: "gray" }}
            thickness={1}
            hideDataPoints
            initialSpacing={18}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ fontSize: 14, color: "gray" }}
            hideRules
            yAxisOffset={yAxisRanges.light.min-10}
            maxValue={yAxisRanges.light.max-yAxisRanges.light.min + 10}
            noOfSections={3}
            height={120}
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