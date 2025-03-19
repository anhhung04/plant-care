import { View, Text, StyleSheet } from 'react-native';
import Button from '../../src/components/Button';
import { router } from 'expo-router';

export default function Setting() {
  return (
    <View style={styles.container}>
      <Text>Welcome to Home</Text>
      <Button title="Go to Dashboard" onPress={() => router.push('/dashboard')} />
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