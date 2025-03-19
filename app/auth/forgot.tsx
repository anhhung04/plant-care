import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {colors} from '@/assets/fonts/colors';
import styles from '@/src/styles/AuthStyle';
import {router} from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ForgotPasswordProps {
  onVerificationSuccess: () => void;
  navigation?: any;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({}) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();
  useEffect(() => {
    // Cleanup timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleSendVerificationCode = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ');
      return;
    }

    try {
      // Here would make an API call to send verification code
      // Replace with actual API call
      // const response = await api.sendVerificationCode(email);
      
  
      setIsCodeSent(true);
      startTimer();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi mã xác thực. Vui lòng thử lại sau.');
      console.error(error);
    }
  };

  const handleResendCode = () => {
    if (canResend) {
      handleSendVerificationCode();
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã xác thực hợp lệ');
      return;
    }

    try {
      // Here would make an API call to verify the code
      // Replace with your actual API call
      // const response = await api.verifyCode(email, verificationCode);
      
      router.replace('/auth/signin');
    } catch (error) {
      Alert.alert('Lỗi', 'Mã xác thực không chính xác. Vui lòng thử lại.');
      console.error(error);
    }
  };

  const goBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{
      ...styles.container,
      paddingTop: insets.top,
      }}>
      <TouchableOpacity style={styles.backButtonWrapper} onPress={goBack}>
        <Feather name="arrow-left" size={20} color={colors.primary} />
      </TouchableOpacity>
      
      <View style={styles.textContainer}>
        <Text style={styles.headingText}>Quên mật khẩu</Text>
        <Text style={styles.subHeadingText}>Nhập email của bạn để lấy lại mật khẩu</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Feather name="mail" size={24} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Nhập email của bạn"
            placeholderTextColor={colors.secondary}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {isCodeSent && (
          <View style={styles.inputContainer}>
            <Feather name="key" size={24} color={colors.secondary} />
            <TextInput
              style={styles.textInput}
              placeholder="Nhập mã xác thực"
              placeholderTextColor={colors.secondary}
              keyboardType="number-pad"
              value={verificationCode}
              onChangeText={setVerificationCode}
              maxLength={6}
            />
            <TouchableOpacity 
              onPress={handleResendCode}
              disabled={!canResend}
              style={styles.resendButton}
            >
              <Text style={[
                styles.resendText,
                !canResend && styles.resendTextDisabled
              ]}>
                {canResend ? 'Gửi lại' : `${timer}s`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={styles.loginButtonWrapper} 
          onPress={isCodeSent ? handleVerifyCode : handleSendVerificationCode}
        >
          <Text style={styles.loginText}>
            {isCodeSent ? 'Xác thực' : 'Gửi mã xác thực'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.accountText}>Đã nhớ mật khẩu?</Text>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.signupText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPassword;