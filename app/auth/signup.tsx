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
import styles from "@/src/styles/AuthStyle";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";

const SignupScreen = () => {
  const navigation = useNavigation();
  const [secureEntery, setSecureEntery] = useState(true);
  const authContext = useAuth();
  const onSignup = authContext?.onRegister;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSignup = () => {
    if (onSignup) {
      const res = onSignup('email', 'password');
      router.replace('/auth/waiting'); 
    } else {
      console.error("onSignup function error");
    }
    router.replace('/auth/waiting'); 
  };

  const handleLogin = () => {
    //navigation.navigate("(auth)/login");
    router.replace('/auth/signin');
  };
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      ...styles.container,
      paddingTop: insets.top,
      }}>
      <TouchableOpacity style={styles.backButtonWrapper} onPress={handleGoBack}>
        <Feather
          name={"arrow-left"}
          color={colors.primary}
          size={25}
        />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.headingText}>Đăng ký</Text>
        <Text style={styles.headingText}>tài khoản</Text>
      </View>
      {/* form  */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Feather name={"mail"} size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Nhập email của bạn"
            placeholderTextColor={colors.secondary}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <Feather name={"lock"} size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Mật khẩu"
            placeholderTextColor={colors.secondary}
            secureTextEntry={secureEntery}
          />
          <TouchableOpacity
            onPress={() => {
              setSecureEntery((prev) => !prev);
            }}
          >
            <Feather name={"eye"} size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <Feather name={"lock"} size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor={colors.secondary}
            secureTextEntry={secureEntery}
          />
          <TouchableOpacity
            onPress={() => {
              setSecureEntery((prev) => !prev);
            }}
          >
            <Feather name={"eye"} size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Feather
            name={"phone"}
            size={30}
            color={colors.secondary}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Số điện thoại"
            placeholderTextColor={colors.secondary}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.loginButtonWrapper} onPress={handleSignup}>
          <Text style={styles.loginText}>Đăng ký</Text>
        </TouchableOpacity>
        
        <View style={styles.footerContainer}>
          <Text style={styles.accountText}>Đã có tài khoản?</Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.signupText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SignupScreen;