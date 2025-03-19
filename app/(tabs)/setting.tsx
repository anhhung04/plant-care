import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Setting() {
  return (
    <View style={styles.container}>
      <Text>THIẾT BỊ</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});