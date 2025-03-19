import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Pressable
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/assets/fonts/colors';

interface ReminderFormProps {
  onSave: (reminder: {
    title: string;
    higherThan: number;
    lowerThan: number;
    repeatAfter: number;
  }) => void;
  onCancel: () => void;
}

const ReminderCreateForm: React.FC<ReminderFormProps> = ({ onSave, onCancel }) => {
  const [selectedType, setSelectedType] = useState('Nhiệt độ');
  const [higherThan, setHigherThan] = useState('');
  const [lowerThan, setLowerThan] = useState('');
  const [repeatAfter, setRepeatAfter] = useState('60');
  const [showPicker, setShowPicker] = useState(false);

  const sensorTypes = [
    'Nhiệt độ',
    'Độ ẩm không khí',
    'Độ ẩm đất',
    'CĐ ánh sáng'
  ];

  const handleSave = () => {
    const reminder = {
      title: selectedType,
      higherThan: parseFloat(higherThan) || 0,
      lowerThan: parseFloat(lowerThan) || 0,
      repeatAfter: parseInt(repeatAfter) || 60,
    };
    onSave(reminder);
  };

  // Values for the minute picker
  const minuteOptions = [];
  for (let i = 1; i <= 1440; i++) {
    if (i <= 60 && i % 5 === 0) {
      minuteOptions.push(i.toString());
    } else if (i > 60 && i <= 120 && i % 10 === 0) {
      minuteOptions.push(i.toString());
    } else if (i > 120 && i % 30 === 0) {
      minuteOptions.push(i.toString());
    }
  }

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.formContainer} >
      <View style={{...styles.formSection }}>
        <Text style={styles.sectionTitle}>Loại cảm biến</Text>
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedType}
            onValueChange={(itemValue) => setSelectedType(itemValue)}
            style={styles.picker}
            mode='dropdown'
          >
            {sensorTypes.map((type) => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={{marginBottom: 10}}>
        <Text style={styles.sectionTitle}>Cấu hình điều kiện</Text>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Cao hơn:</Text>
          <TextInput
            style={styles.numberInput}
            value={higherThan}
            selectionColor={colors.primary}
            onChangeText={setHigherThan}
            keyboardType="numeric"
            placeholder="0"
          />
          <Text style={styles.unitText}>
            {selectedType === 'Nhiệt độ' ? '°C' : 
             selectedType === 'Độ ẩm không khí' ? '%' : 
             selectedType === 'Độ ẩm đất' ? '%' : 'lux'}
          </Text>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Thấp hơn:</Text>
          <TextInput
            style={styles.numberInput}
            value={lowerThan}
            onChangeText={setLowerThan}
            selectionColor={colors.primary}
            keyboardType="numeric"
            placeholder="0"
          />
          <Text style={styles.unitText}>
            {selectedType === 'Nhiệt độ' ? '°C' : 
             selectedType === 'Độ ẩm không khí' ? '%' : 
             selectedType === 'Độ ẩm đất' ? '%' : 'lux'}
          </Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Lặp lại sau</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Thời gian:</Text>
                <TextInput
                style={styles.numberInput}
                value={repeatAfter}
                onChangeText={setRepeatAfter}
                selectionColor={colors.primary}
                keyboardType="numeric"
                placeholder="0"
            />
            <Text style={styles.unitText}>phút</Text>
          </View>

      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: 'white',
    paddingVertical:5,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 60,
    justifyContent: 'center',
  },
  picker: {
    height: 60,
    width: '100%',
    borderRadius: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical:5
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    width: 80,
    fontSize: 16,
    marginLeft: 20
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: 100,
    marginRight: 10,
    fontSize: 16,
  },
  unitText: {
    fontSize: 16,
    color: '#666',
  },
  pickerText: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: 100,
    marginRight: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: colors.primary,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReminderCreateForm;