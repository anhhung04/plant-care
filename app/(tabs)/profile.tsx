import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
} from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/assets/fonts/colors';
import { Redirect, router } from 'expo-router';
import ReportModal from '@/src/components/ReportModal';
import { useContext } from 'react';
import { TabBarContext } from './_layout';
import { ChangeAreaModal } from '@/src/components/ChangeAreaModal';
import { useAuth } from '@/src/context/AuthContext';
import { Field, Greenhouse, useGarden } from '@/src/context/GreenHouse';
import GardenSetting from './gsetting';

export default function Profile() {
  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
  });
  const [isModalVisible, setModalVisible] = useState(false);
  const [isChangeAreaVisible, setChangeAreaVisible] = useState(false)
  const [isChangeGreenhouseVisible, setChangeGreenhouseVisible] = useState(false)

  const { hideTabBar, showTabBar } = useContext(TabBarContext);

  const authContext = useAuth();
  const onLogout = authContext?.onLogout;
  const insets = useSafeAreaInsets();


  const {
      selectedGreenhouse,
      selectedFieldIndex,
      selectedField, 
      selectField,
      clearSelectedOptions
    } = useGarden();
  
  if (!selectedGreenhouse || !selectedField) {
      return (
          <GardenSetting/>
      );
  }

  const handleSendFeedback = (feedback: string) => {
    // Handle feedback logic
    console.log("Feeback ",Date(),": ",feedback);

  };

  const handleLogout = () => {  
    if (onLogout) {
      onLogout();  
    } else {
      console.error("onLogout function error");
    }
    router.push("/auth/signin")
  }

  const pressLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          onPress: () => {
            // Place your logout logic here
            handleLogout();
          },
          style: 'destructive',
        },
      ]
    );
  }

  const setArea = () =>  {
    setChangeAreaVisible(true);
    hideTabBar();
  }

  const handleChangeArea = (area ?: number) => {
    setChangeAreaVisible(false);
    showTabBar();
    if (area) {
      selectField(selectedGreenhouse.fields[area], selectedFieldIndex || 0);
    } else {
      // Handle the case when no field is selected (null)
      console.log("No Field selected");
    }
  }

  const setGreenhouse = () =>  {
    setChangeGreenhouseVisible(true);
    clearSelectedOptions();
    hideTabBar();
  }

  useEffect(() => {
    // console.log("Current: ",form.emailNotifications, " and ", form.pushNotifications)
  }, [form]);

  return (
    <>
    <SafeAreaView style={{flex:1, backgroundColor: colors.bg}}>
      { isChangeGreenhouseVisible && <GardenSetting/> }
      {!isChangeGreenhouseVisible && (
        <ScrollView 
        style={{paddingTop: insets.top }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
        >
  
          <View style={styles.profile}>
            <TouchableOpacity
                  onPress={() => {
                    setGreenhouse()
                  }}
                  style={[styles.row, { width: '60%' , backgroundColor: colors.bg}]}>
                  <View style={[styles.rowIcon, { marginRight: 6}]}>
                    <FontAwesome name="leaf" size={24} color="green" />
                  </View>
  
                  <Text style={[styles.rowLabel , {fontWeight: '600'}]}>Đổi Greenhouse</Text>
  
                  <View style={styles.rowSpacer} />
  
                  <FeatherIcon
                    color="#C6C6C6"
                    name="chevron-right"
                    size={28} />
            </TouchableOpacity>
  
            <TouchableOpacity
              onPress={() => {
                // handle onPress
              }}>
              <View style={styles.profileAvatarWrapper}>
                <Image
                  alt=""
                  source={{
                    uri: 'https://i.imgflip.com/36kwyk.jpg?a483600',
                  }}
                  style={styles.profileAvatar} />
  
                <TouchableOpacity
                  onPress={() => {
                    // handle onPress
                  }}>
                  <View style={styles.profileAction}>
                    <FeatherIcon color="#fff" name="edit-3" size={15} />
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
  
            <View>
              <Text style={styles.profileName}>Trịnh Phương Tuấn</Text>
  
              <Text style={styles.profileAddress}>
                Quản lý
              </Text>
            </View>
          </View>
  
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chung</Text>
  
              <TouchableOpacity
                onPress={() => {
                  setArea()
                }}
                style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: '#fe9400' }]}>
                  <FeatherIcon color="#fff" name="globe" size={24} />
                </View>
  
                <Text style={styles.rowLabel}>Đổi khu đất</Text>
  
                <View style={styles.rowSpacer} />
  
                <FeatherIcon
                  color="#C6C6C6"
                  name="chevron-right"
                  size={28} />
              </TouchableOpacity>
  
  
              <View style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: '#38C959' }]}>
                  <FeatherIcon color="#fff" name="bell" size={24} />
                </View>
  
                <Text style={styles.rowLabel}>Thông báo điện thoại</Text>
  
                <View style={styles.rowSpacer} />
  
                <Switch
                  onValueChange={pushNotifications =>
                    setForm({ ...form, pushNotifications })
                  }
                  trackColor={{ false: '#f4f4f4', true: '#b6d7a8' }}
                  thumbColor={form.pushNotifications ? '#38C959' : '#fff'}
                  value={form.pushNotifications} />
              </View>
  
              <TouchableOpacity
                onPress={() => {
                  pressLogout();
                }}
                style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: 'red' }]}>
                  <FeatherIcon color="#fff" name="log-out" size={24} />
                </View>
  
                <Text style={styles.rowLabel}>Đăng xuất</Text>
  
                <View style={styles.rowSpacer} />
  
                <FeatherIcon
                  color="#C6C6C6"
                  name="chevron-right"
                  size={28} />
              </TouchableOpacity>
            </View>
  
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tiện ích</Text>
  
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                }}
                style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: '#8e8d91' }]}>
                  <FeatherIcon color="#fff" name="flag" size={24} />
                </View>
  
                <Text style={styles.rowLabel}>Báo cáo Bug</Text>
  
                <View style={styles.rowSpacer} />
  
                <FeatherIcon
                  color="#C6C6C6"
                  name="chevron-right"
                  size={28} />
              </TouchableOpacity>
  
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: '#007afe' }]}>
                  <FeatherIcon color="#fff" name="mail" size={24} />
                </View>
  
                <Text style={styles.rowLabel}>Liên hệ admin</Text>
  
                <View style={styles.rowSpacer} />
  
                <FeatherIcon
                  color="#C6C6C6"
                  name="chevron-right"
                  size={28} />
              </TouchableOpacity>
            </View>
          </ScrollView>
          
        </ScrollView>
      )}

      <ReportModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSendFeedback={handleSendFeedback}
      />
      <ChangeAreaModal
        visible={isChangeAreaVisible}
        onClose={(area?: number) => { handleChangeArea(area); }}
        current={selectedFieldIndex ?? 0}
        areas={selectedGreenhouse.fields}
      />
      
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  /** Profile */
  container: {
    flex:1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  profile: {
    padding: 24,
    backgroundColor: colors.bg,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarWrapper: {
    position: 'relative',
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 9999,
  },
  profileAction: {
    position: 'absolute',
    right: -4,
    bottom: -10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: colors.light,
  },
  profileName: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: '600',
    color: '#414d63',
    textAlign: 'center',
  },
  profileAddress: {
    marginTop: 5,
    fontSize: 16,
    color: '#989898',
    textAlign: 'center',
  },
  /** Section */
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#9e9e9e',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  /** Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 9999,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: '#0c0c0c',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
});