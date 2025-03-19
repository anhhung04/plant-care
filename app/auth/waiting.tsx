import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { colors } from "@/assets/fonts/colors";
import { fonts } from "@/assets/fonts/font";

import { useNavigation } from "@react-navigation/native";
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import {router} from 'expo-router';

export const LoadingScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      ...styles.container,
      paddingTop: insets.top + 40,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <LottieView source={require('@/assets/animation/loading.json')}
        style={styles.animationContainer}
                    autoPlay loop />

      <View style={styles.formContainer}>
        <Text style={styles.cautionText}>Vui lòng đợi trong giây lát!</Text>
      </View>
    </View>
  );
}

const WaitScreen = () => {
  const navigation = useNavigation();
  const [secureEntery, setSecureEntery] = useState(true);

  const insets = useSafeAreaInsets();
  const handleGoBack = () => {
    //navigation.navigate("(auth)/signin");
    router.replace('/auth/signin');
  };

  return (
    <View style={{
      ...styles.container,
      paddingTop: insets.top,

    }}>
      <View style={styles.textContainer}>
        <Text style={styles.headingText}>Chúc mừng,</Text>
        <Text style={styles.headingText}>Bạn đã đăng ký thành công</Text>
      </View>
      <View style={{ 
          justifyContent: "center",
          alignItems: "center",}}>
        <LottieView source={require('@/assets/animation/cat.json')}
          style={styles.animationContainer}
                      autoPlay loop />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.cautionText}>Vui lòng đợi hoặc liên hệ với admin để được phê duyệt!</Text>
        <TouchableOpacity style={styles.loginButtonWrapper} onPress={handleGoBack}>
          <Text style={styles.loginText}>Về trang đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WaitScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  backButtonWrapper: {
    height: 40,
    width: 40,
    backgroundColor: colors.gray,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    marginVertical: 20,
  },
  headingText: {
    fontSize: 42,
    color: colors.primary,
    fontFamily: 'Raleway-Bold',
  },
  cautionText: {
    flexDirection: 'row',
    textAlign: 'center',
    fontSize: 13,   
    color: '#a9a9a9',  
    fontFamily: 'Raleway-Bold',
  },
  formContainer: {
    marginTop: 20,
  },
  animationContainer: {
    width: 200,
    height: 200,
    opacity: 0.8,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: fonts.Light,
  },
  forgotPasswordText: {
    textAlign: "right",
    color: colors.primary,
    fontFamily: fonts.SemiBold,
    marginVertical: 10,
  },
  loginButtonWrapper: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    marginTop: 20,
  },
  loginText: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.SemiBold,
    textAlign: "center",
    padding: 10,
  },
  continueText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
    fontFamily: fonts.Regular,
    color: colors.primary,
  },
  googleButtonContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  googleImage: {
    height: 20,
    width: 20,
  },
  googleText: {
    fontSize: 20,
    fontFamily: fonts.SemiBold,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    gap: 5,
  },
  accountText: {
    color: colors.primary,
    fontFamily: fonts.Regular,
  },
  signupText: {
    color: colors.primary,
    fontFamily: fonts.Bold,
  },
});