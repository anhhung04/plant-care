import React, { useState, useRef, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions, 
  Switch, 
  StatusBar,
  Alert
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withTiming,
  useAnimatedGestureHandler,
  runOnJS
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/assets/fonts/colors';
import {CreateReminder} from '@/src/components/CreateReminderModal';
import { TabBarContext } from './_layout';

export interface ReminderType {
  id: string;
  title: string;
  higherThan: number;
  lowerThan: number;
  repeatAfter: number;
  active?: boolean;
}

const SWIPE_THRESHOLD = -100;
const DELETE_BUTTON_WIDTH = 100;

const SwipeableItem = ({ 
  item, 
  onDelete, 
  onToggle 
}: { 
  item: ReminderType; 
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) => {
  const translateX = useSharedValue(0);

  const panGesture = useAnimatedGestureHandler({
    onActive: (event) => {
      if (event.translationX < 0) { // Only allow left swipe
        translateX.value = event.translationX;
      }
    },
    onEnd: (event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-DELETE_BUTTON_WIDTH);
      } else {
        translateX.value = withTiming(0);
      }
    },
  });

  const handleDelete = () => {
    // Reset the position when deleting
    translateX.value = withTiming(0);
    // Call the delete function passed from parent
    onDelete(item.id);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    const width = Math.min(DELETE_BUTTON_WIDTH, Math.abs(translateX.value));
    return {
      width: DELETE_BUTTON_WIDTH,
      opacity: width / DELETE_BUTTON_WIDTH,
      right: 0,
    };
  });

  return (
    <View style={styles.itemContainer}>
      <Animated.View style={[styles.deleteButtonContainer, deleteButtonStyle]}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              "Nhắc nhở",
              "Bạn có chắc chắn muốn xóa lời nhắc này?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => {
                    translateX.value = withTiming(0);
                  }
                },
                { 
                  text: "Delete", 
                  onPress: handleDelete,
                  style: "destructive"
                }
              ]
            );
          }}
        >
          <AntDesign name="delete" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
      
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View style={[styles.reminderItem, animatedStyle]}>
          <View style={styles.reminderInfo}>
            <Text style={styles.reminderTitle}>{item.title}</Text>
            <Text style={styles.reminderDetail}>
              Cao hơn: {item.higherThan}
            </Text>
            <Text style={styles.reminderDetail}>
              Thấp hơn: {item.lowerThan}
            </Text>
          </View>
          <Switch
            style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5}] }}
            value={item.active}
            onValueChange={() => onToggle(item.id)}
            trackColor={{ false: '#d3d3d3', true: '#fce5cd' }}
            thumbColor={item.active ? colors.orange100 : '#f4f3f4'}
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const ReminderListScreen: React.FC = () => {

  const [isVisible, setIsVisible] = useState(false);
  // Sample data - in a real app, this would come from a store/context
  const { hideTabBar, showTabBar } = useContext(TabBarContext);
  const [reminders, setReminders] = useState<ReminderType[]>([
    {
      id: '1',
      title: 'Nhiệt độ',
      higherThan: 40,
      lowerThan: 19,
      repeatAfter: 24,
      active: true
    },
    {
      id: '2',
      title: 'Độ ẩm không khí',
      higherThan: 80,
      lowerThan: 70,
      repeatAfter: 12,
      active: false
    }
  ]);

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id 
        ? { ...reminder, active: !reminder.active } 
        : reminder
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const navigateToCreateReminder = () => {
    // Navigation logic here
    hideTabBar();
    setIsVisible(true);
  };

  const handleCreate = () => {
    setIsVisible(false);
    showTabBar();

  }

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{...styles.container, paddingBottom: insets.bottom + 70, paddingTop: insets.top}}>
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        
        <View style={styles.reminderList}>
          {reminders.length > 0 ? (
            reminders.map((item) => (
              <SwipeableItem 
                key={item.id}
                item={item} 
                onDelete={deleteReminder}
                onToggle={toggleReminder}
              />
            ))
          ) : (
            <View style={{alignItems: 'center' , flex: 1, paddingTop:120}} >
               <Ionicons name="leaf-outline" size={100} color={colors.primary} />
               <Text style={styles.emptyText}>Không có lời nhắc nào</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={navigateToCreateReminder}
        >
          <AntDesign name="plus" size={34} color="white" />
        </TouchableOpacity>
      </SafeAreaView>  
    </GestureHandlerRootView>
    <CreateReminder visible={isVisible} onClose={handleCreate} />
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  reminderList: {
    flex: 1,
    paddingVertical: 8,
    paddingTop: 16,  // Increased padding at top
  },
  itemContainer: {
    position: 'relative',
    marginVertical: 10,  // Increased space between reminders
    marginHorizontal: 16,
  },
  deleteButtonContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,  // Added padding inside delete button
  },
  reminderItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,  // Increased padding inside reminders
    borderRadius: 20,
    elevation: 3,
  },
  reminderInfo: {
    flex: 1,
    paddingRight: 12,  // Added padding between text and switch
  },
  reminderTitle: {
    fontSize: 18,  // Increased font size
    fontWeight: 'bold',
    marginBottom: 8,  // More space after title
  },
  reminderDetail: {
    fontSize: 16,  // Increased font size
    color: '#555',
    marginBottom: 4,  // More space between details
    marginLeft: 14,  // Added margin to the left
  },
  deleteButton: {
    backgroundColor: 'rgb(206, 46, 46)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    height: '80%',
    borderRadius: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,  // Increased font size
  },
  addButton: {
    position: 'absolute',
    bottom: 30,  // Moved button higher from bottom
    right: 30,   // Moved button further from right edge
    backgroundColor: colors.primary,
    width: 70,   // Larger button
    height: 70,  // Larger button
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 20,
    color: '#8E8E93',
  },

});

export default ReminderListScreen;

function hideTabBar() {
  throw new Error('Function not implemented.');
}
