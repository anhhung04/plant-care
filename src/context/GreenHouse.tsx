// Create a context for greenhouse and field state
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

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
  startPolling: () => void;
  stopPolling: () => void;
};

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export const GardenProvider = ({ children }: { children: ReactNode }) => {
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [selectedGreenhouse, setSelectedGreenhouse] = useState<Greenhouse | null>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchGreenhouses = async () => {
    setIsLoading(true);
    setError(null);
    try { 
      // Replace with your actual API call
      const response = await fetch("http://104.214.177.9:8080/mobileBE/greenhouses/ds-get?owner=&location=&offset=0&limit=10" ,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any other necessary headers here
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched greenhouses:', data.data);
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

  const startPolling = () => {
    if (pollingInterval) {
      stopPolling(); // Clear any existing interval first
    }
    
    if (selectedGreenhouse?.greenhouse_id) {
      const interval = setInterval(() => {
        fetchGreenhouseById(selectedGreenhouse.greenhouse_id);
      }, 5000); // Poll every 5 seconds
      
      setPollingInterval(interval);
    }
  };

  // Stop polling function
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const fetchGreenhouseById = async (greenhouseId: string) => {
    if (!greenhouseId) {
      console.error('No greenhouse ID provided.');
      return;
    }
  
    try {
      const response = await fetch(`http://104.214.177.9:8080/mobileBE/greenhouses/ds-get/${greenhouseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch greenhouse data:', response.status, errorText);
        return;
      }
  
      const responseData = await response.json();
      if (responseData.success && responseData.data) {
        setGreenhouses(currentGreenhouses =>
          currentGreenhouses.map(gh =>
            gh.greenhouse_id === greenhouseId ? responseData.data : gh
          )
        );
        if (selectedGreenhouse?.greenhouse_id === greenhouseId) {
          setSelectedGreenhouse(responseData.data);
  
          if (selectedFieldIndex !== null && responseData.data.fields[selectedFieldIndex]) {
            setSelectedField(responseData.data.fields[selectedFieldIndex]);
          }
        }
      } else {
        console.error('Unexpected response structure:', responseData);
      }
    } catch (err) {
      console.error('Error fetching greenhouse:');
    }
  };

  const selectGreenhouse = async (greenhouse: Greenhouse | null) => {
    if (!greenhouse) {
      setSelectedGreenhouse(null);
      stopPolling();
      return;
    }
    setSelectedGreenhouse(greenhouse);
    setSelectedField(null);
    setSelectedFieldIndex(null);
    await SecureStore.setItem('selectedGreenhouseId', greenhouse.greenhouse_id);
    await SecureStore.deleteItemAsync('selectedFieldIndex');
    
    // Start polling when a greenhouse is selected
    if (greenhouse.greenhouse_id) {
      stopPolling(); // Stop any existing polling
      setTimeout(() => startPolling(), 0); // Start new polling in the next tick
    }
  };
  
  const selectField = async (field: Field, index: number) => {
    if (!field) {setSelectedField(null);setSelectedFieldIndex(null); return}
    setSelectedField(field);
    setSelectedFieldIndex(index);
    await SecureStore.setItemAsync('selectedFieldIndex', index.toString());
  };  

  const clearSelectedOptions = async () => {
    stopPolling();
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

  useEffect(() => {
    const loadSavedSelections = async () => {
      try {
        const savedGreenhouseId = await SecureStore.getItemAsync('selectedGreenhouseId');
        const savedFieldIndexStr = await SecureStore.getItemAsync('selectedFieldIndex');
        
        if (savedGreenhouseId && greenhouses.length > 0) {
          const greenhouse = greenhouses.find(gh => gh.greenhouse_id === savedGreenhouseId);
          if (greenhouse) {
            setSelectedGreenhouse(greenhouse);
            
            if (savedFieldIndexStr) {
              const fieldIndex = parseInt(savedFieldIndexStr, 10);
              if (!isNaN(fieldIndex) && greenhouse.fields[fieldIndex]) {
                setSelectedField(greenhouse.fields[fieldIndex]);
                setSelectedFieldIndex(fieldIndex);
                
                // Start polling for the saved greenhouse
                setTimeout(() => startPolling(), 0);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading saved selections:', err);
      }
    };
    
    if (greenhouses.length > 0) {
      loadSavedSelections();
    }
  }, [greenhouses]);

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
        startPolling,
        stopPolling,
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