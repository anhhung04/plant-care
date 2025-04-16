// Create a context for greenhouse and field state
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, SOCKET_URL } from '@/config';
import data from '../components/onboarding/data';
import { Client } from '@stomp/stompjs';


export type Greenhouse = {
    greenhouse_id: string;
    name: string;
    location: string;
    owner: string;
    fields: Field[];
    created_at: Date;
    updated_at: Date;
    metadata: { [key: string]: any };
};

export type Field = {
    temperature_sensor: Sensor[];
    humidity_sensor: Sensor[];
    soil_moisture_sensor: Sensor[];
    light_sensor: Sensor[];
    fan_status: SensorStatus[];
    led_status: SensorStatus[];
    pump_status: SensorStatus[];
};


export interface Sensor {
  value: number;
  unit: string;
  timestamp: Date;
}

export interface SensorStatus {
  value: number;
  unit: string;
  timestamp: Date;
}

type GardenContextType = {
  greenhouses: Greenhouse[];
  selectedGreenhouse: Greenhouse | null;
  selectedField: Field | null;
  selectedFieldIndex: number | null;
  isLoading: boolean;
  error: string | null;
  fetchGreenhouses: () => Promise<void>;
  selectGreenhouse: (greenhouse: Greenhouse) => void;
  selectField: (field: Field, index: number) => void;
  updateSensorData: (data: any) => void;
  clearSelectedOptions: () => void;
};

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export const GardenProvider = ({ children }: { children: ReactNode }) => {
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [selectedGreenhouse, setSelectedGreenhouse] = useState<Greenhouse | null>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const savedGreenhouseId = await SecureStore.getItem('selectedGreenhouseId');
        const savedFieldIndex = await SecureStore.getItem('selectedFieldIndex');
        
        if (savedGreenhouseId) {
          await fetchGreenhouses();
          
          // Find and select the saved greenhouse
          const greenhouse = greenhouses.find(g => g.greenhouse_id === savedGreenhouseId);
          if (greenhouse) {
            setSelectedGreenhouse(greenhouse);
            
            // Select saved field if it exists
            if (savedFieldIndex !== null) {
              const fieldIndex = parseInt(savedFieldIndex || '-1', 10);
              if (fieldIndex >= 0 && fieldIndex < greenhouse.fields.length) {
                setSelectedField(greenhouse.fields[fieldIndex]);
                setSelectedFieldIndex(fieldIndex);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load saved state', err);
      }
    };
    
    loadSavedState();
  }, []);

  // Socket connection effect
  // useEffect(() => {
  //   if (selectedGreenhouse) {
  //     // Connect to socket when greenhouse is selected
  //     connectToSocket(selectedGreenhouse.greenhouse_id);
      
  //     // Handle messages from socket
  //     const handleSocketMessage = (data: any) => {
  //       // If the message contains fields data for our greenhouse
  //       if (data && data.greenhouse_id === selectedGreenhouse.greenhouse_id && data.fields) {
  //         updateFieldsData(data.fields);
  //       }
  //     };
      
  //     // Handle socket errors
  //     const handleSocketError = (error: any) => {
  //       console.error('Socket error:', error);
  //       setError('Connection error. Reconnecting...');
        
  //       // Implement reconnection logic if needed
  //       setTimeout(() => {
  //         if (selectedGreenhouse) {
  //           connectToSocket(selectedGreenhouse.greenhouse_id);
  //         }
  //       }, 5000); // Reconnect after 5 seconds
  //     };
      
  //     // Add event listeners
  //     socketEvents.on('message', handleSocketMessage);
  //     socketEvents.on('error', handleSocketError);
      
  //     // Cleanup function
  //     return () => {
  //       disconnectFromSocket();
  //       socketEvents.removeListener('message', handleSocketMessage);
  //       socketEvents.removeListener('error', handleSocketError);
  //     };
  //   }
  // }, [selectedGreenhouse]);
  const fetchGreenhouses = async () => {
    setIsLoading(true);
    setError(null);
    try { 
      // Replace with your actual API call
      const response = await fetch(API_BASE_URL + '/greenhouses/ds-get?owner=&location=&offset=0&limit=10' ,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any other necessary headers here
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGreenhouses(data.data);
        
      }else {
        console.error('Failed request:', response);
      }
    } catch (err) {
      setError('Failed to fetch greenhouses');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectGreenhouse = async (greenhouse: Greenhouse | null) => {
    if (!greenhouse) {setSelectedGreenhouse(null); return}
    setSelectedGreenhouse(greenhouse);
    setSelectedField(null);
    setSelectedFieldIndex(null);
    await SecureStore.setItem('selectedGreenhouseId', greenhouse.greenhouse_id);
    await SecureStore.deleteItemAsync('selectedFieldIndex');
  };
  
  const selectField = async (field: Field, index: number) => {
    if (!field) {setSelectedField(null);setSelectedFieldIndex(null); return}
    setSelectedField(field);
    setSelectedFieldIndex(index);
    await SecureStore.setItemAsync('selectedFieldIndex', index.toString());
  };

  const updateFieldsData = (fields: Field[]) => {
    if (!selectedGreenhouse) return;
    
    // Create a deep copy of the current greenhouse
    const updatedGreenhouse = {
      ...selectedGreenhouse,
      fields: fields
    };
    
    // Update the selected field if we have a selected field index
    if (selectedFieldIndex !== null && fields[selectedFieldIndex]) {
      setSelectedField(fields[selectedFieldIndex]);
    }
    
    // Update the greenhouses array
    setGreenhouses(currentGreenhouses => {
      return currentGreenhouses.map(gh => {
        if (gh.greenhouse_id === selectedGreenhouse.greenhouse_id) {
          return updatedGreenhouse;
        }
        return gh;
      });
    });
    
    // Update the selected greenhouse
    setSelectedGreenhouse(updatedGreenhouse);
  };
  
  const clearSelectedOptions = async () => {
    setSelectedGreenhouse(null);
    setSelectedField(null);
    setSelectedFieldIndex(null);
    await SecureStore.deleteItemAsync('selectedGreenhouseId');
    await SecureStore.deleteItemAsync('selectedFieldId');
    await SecureStore.deleteItemAsync('selectedFieldIndex');
  };

  const updateSensorData = (data: any) => {
    if (!selectedGreenhouse || selectedFieldIndex === null) return;
    
    // Create a deep copy of the current greenhouse
    const updatedGreenhouse = JSON.parse(JSON.stringify(selectedGreenhouse));
    
    // Update the specific field with new sensor data
    if (data.field_index !== undefined && 
        data.field_index === selectedFieldIndex && 
        data.sensor_type && 
        data.sensor_data) {
      
      const sensorType = data.sensor_type as keyof Field;
      
      // Check if the sensor type exists in our field structure
      if (updatedGreenhouse.fields[selectedFieldIndex] && 
          updatedGreenhouse.fields[selectedFieldIndex][sensorType]) {
        
        // Update the sensor data
        updatedGreenhouse.fields[selectedFieldIndex][sensorType] = data.sensor_data;
        
        // Update the selected field directly as well
        setSelectedField(updatedGreenhouse.fields[selectedFieldIndex]);
        
        // Update the greenhouses array
        setGreenhouses(currentGreenhouses => {
          return currentGreenhouses.map(gh => {
            if (gh.greenhouse_id === updatedGreenhouse.greenhouse_id) {
              return updatedGreenhouse;
            }
            return gh;
          });
        });
        
        // Update the selected greenhouse
        setSelectedGreenhouse(updatedGreenhouse);
      }
    }
  };

  return (
    <GardenContext.Provider
      value={{
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
      }}
    >
      {children}
    </GardenContext.Provider>
  );
};

export const useGarden = () => {
  const context = useContext(GardenContext);
  if (context === undefined) {
    throw new Error('useGarden must be used within a GardenProvider');
  }
  return context;
};