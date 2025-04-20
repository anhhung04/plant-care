// app/SettingsScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useGarden } from '@/src/context/GreenHouse';
import { Card } from 'react-native-paper';
import {colors} from '@/assets/fonts/colors'; // assuming you have a color palette file
import {URL, URL_G} from '@/src/utils/farmpic'; // assuming you have a utility function to get random images
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingScreen } from '../auth/waiting';
export default function GardenSetting() {
  const {
        greenhouses,
        selectedGreenhouse,
        selectedField,
        selectedFieldIndex,
        isLoading,
        error,
        fetchGreenhouses,
        selectGreenhouse,
        selectField,
        updateSensorData,
        clearSelectedOptions,
  } = useGarden();

  useEffect(() => {
    fetchGreenhouses();
  }, []);
  
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 30 }]}>
      {isLoading && <LoadingScreen message={"Đang lấy thông tin về Greenhouse ..."}/>}
      {!isLoading && error && (
        <Text style={styles.error}>Không thể lấy được thông tin Greenhouse</Text>
      )}
      {!isLoading && !error && (
        <>
          <View style={styles.cardContainer}>
            {greenhouses.map((item, index) => {
              const isCurrent = selectedGreenhouse?.greenhouse_id === item.greenhouse_id;
              const GreenhouseName = `Greenhouse ${index + 1}`;
              return (
                <TouchableOpacity
                  key={item.greenhouse_id}
                  style={[styles.card, isCurrent && styles.currentAreaCard]}
                  onPress={() => {
                    if (!isCurrent) {
                      selectGreenhouse(item);
                    }
                  }}
                  disabled={isCurrent}
                >
                  <Card style={{ borderRadius: 20 }}>
                    <Card.Cover style={styles.cardImage} source={{ uri: URL_G[index] }} />
                    <View style={styles.textOverlay}>
                      <Text style={[styles.titleText, isCurrent && styles.currentAreaName]}>
                        {GreenhouseName}
                      </Text>
                      {isCurrent && <Text style={styles.subtitle}>(Currently selected)</Text>}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedGreenhouse && (
            <>
              <Text style={styles.title}>Chọn Vườn</Text>
              <View style={styles.cardContainer}>
                {selectedGreenhouse.fields.map((field, index) => {
                  const isCurrent = selectedFieldIndex === index;
                  const fieldName = `Field ${index}`;
                  return (
                    <TouchableOpacity
                      key={`field-${index}`}
                      style={[styles.card, isCurrent && styles.currentAreaCard]}
                      onPress={() => {
                        if (!isCurrent) {
                          selectField(field, index);
                        }
                      }}
                      disabled={isCurrent}
                    >
                      <Card style={{ borderRadius: 20 }}>
                        <Card.Cover
                          style={styles.cardImage}
                          source={{ uri: URL[index % URL.length] }}
                        />
                        <View style={styles.textOverlay}>
                          <Text style={[styles.titleText, isCurrent && styles.currentAreaName]}>
                            {fieldName}
                          </Text>
                          {isCurrent && <Text style={styles.subtitle}>(Currently selected)</Text>}
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.white,

  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.nblack,
    textAlign: 'center',
    marginBottom: 36,
  },
  loading: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',

  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 16,
    color: colors.nblack,
  },
  cardContainer: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    marginBottom: 10,
    borderRadius: 20,
  },
  cardImage: {
    height: 120,
    borderRadius: 20,
  },
  currentAreaCard: {
    borderWidth: 3,
    borderColor: colors.orange100,
    borderRadius: 24,
  },
  textOverlay: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.nblack,
  },
  subtitle: {
    paddingLeft: 6,
    color: colors.nblack,
    fontSize: 14,
    marginTop: 4,
  },
  currentAreaName: {
    backgroundColor: colors.orange100,
    color: colors.white,
    borderRadius: 10,
    paddingHorizontal: 6,
  },
});
