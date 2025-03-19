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
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from "@/src/context/AuthContext";

const LoginScreen = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const authContext = useAuth();
  const onLogin = authContext?.onLogin;
  
  const [secureEntery, setSecureEntery] = useState(true);

  const handleGoBack = () => {
    router.push('/auth/onboarding');
  };

  const handleSignup = () => {
    router.push('/auth/signup');
    //navigation.navigate("(auth)/signup");
  };
  
  const handleSignin = () => {
    const res = signIn();
    router.push('/(tabs)');
  };

  const signIn = async () => {
    if (onLogin) {
      const response = await onLogin(email, password);  
      if (response.error) {
        alert(response.msg);
      }
      else return response
    } else {
      console.error("onLogin function error");
    }
  }



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
        <Text style={styles.headingText}>Chào Mừng,</Text>
        <Text style={styles.headingText}>Bạn</Text>
      </View>
      {/* form  */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Feather name={"mail"} size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor={colors.secondary}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            value={email}
          />
        </View>
        <View style={styles.inputContainer}>
          <Feather name={"lock"} size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Mật khẩu"
            placeholderTextColor={colors.secondary}
            secureTextEntry={secureEntery}
            onChangeText={(text) => setPassword(text)}
            value={password}
          />
          <TouchableOpacity
            onPress={() => {
              setSecureEntery((prev) => !prev);
            }}
          >
            <Feather name={"eye"} size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{alignSelf: 'flex-end' , paddingRight:20 }} onPress={() => router.push("/auth/forgot")}>
          <Text style={styles.forgotPasswordText}>
            Quên mật khẩu?
            </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButtonWrapper} onPress={handleSignin}>
          <Text style={styles.loginText}>Đăng nhập</Text>
        </TouchableOpacity>
        <View style={styles.footerContainer}>
          <Text style={styles.accountText}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={styles.signupText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

