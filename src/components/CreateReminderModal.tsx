import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
  Platform,
  BackHandler
} from 'react-native';
import {colors} from '@/assets/fonts/colors';
import { CreateReminderModalProps, ReminderItem} from '@/src/utils/modal';
import { Switch, Card, Title, Paragraph, Button } from 'react-native-paper';
import ReminderCreateForm from './ReminerCreateForm';
import { ReminderCreate } from '../utils/reminderType';
const { height } = Dimensions.get('window');

// Định nghĩa props cho component

export const CreateReminder: React.FC<CreateReminderModalProps> = ({ visible, onClose }) => {
  // Animation values
  const translateY = useRef(new Animated.Value(height)).current;
  const modalHeight = height * 0.58; // Chừa lại 8% phía trên màn hình
  // Set up pan responder để xử lý gesture vuốt
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0; // Chỉ bắt gesture khi vuốt xuống
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Nếu vuốt xuống đủ xa, đóng modal
          hideModal();
        } else {
          // Nếu không, trả về vị trí ban đầu
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
      }, 200);
      showModal();
    } else {
      hideModal();
    }
    const handleBackPress = () => {
        if (visible) {
          hideModal(); // Close the modal when back button is pressed
          return true; // Prevent default navigation behavior
        }
        return false; // Allow default behavior if modal is not visible
      };
  
      // Add event listener for back button
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  
      // Cleanup listener on unmount or when visible changes
      return () => backHandler.remove();
    
  }, [visible]);


  const showModal = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setTimeout(() => {
      }, 50);
    });
  };

  const handleChange = (reminder : ReminderCreate) => {
    console.log("Create reminder: ",reminder);
    hideModal();
  }

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={() => {hideModal()}}
      />
      <Animated.View
              style={[
                styles.modalContainer,
                {
                  height: modalHeight,
                  transform: [
                    {
                      translateY: translateY.interpolate({
                        inputRange: [0, height],
                        outputRange: [0, height],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            >
              <View {...panResponder.panHandlers}>
                  <View style={styles.dragIndicator} />
                    <ReminderCreateForm onSave={function (reminder: { title: string; higherThan: number; lowerThan: number; repeatAfter: number; }): void {
                        handleChange(reminder);
                      } } onCancel={function (): void {
                        hideModal();
                      } } />
                  
              </View>
            </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    elevation: 6,
  },
  dragIndicator: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D3D3D3',
    marginBottom: 10,
  },

  title: {
    color: colors.nblack,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    paddingLeft: 6,
    color: colors.nblack,
    fontSize: 14,
    marginTop: 5,
  },
  currentAreaName: {
    backgroundColor: colors.orange100,
    color: colors.white,
    borderRadius:10,
    paddingHorizontal:5
  },
  cardContainer:{
    padding:5,
  },
  card:{
    flex:1,
    marginBottom:20,
    borderRadius:20
  },
  cardImage:{
    height: 100,
    borderRadius:20,

  },
  currentAreaCard:{
    borderWidth:4,
    borderColor: colors.orange100,
    borderRadius: 24
  },
  textOverlay:{
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 16,
  }
});
