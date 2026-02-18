import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { smtiaApi } from '../../services/smtiaApi';
import { useToast } from '../../contexts/ToastContext';
import { setToken } from '../../services/auth';
import Svg, { Path, Polyline } from 'react-native-svg';

const { width } = Dimensions.get('window');

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5" />
    <Polyline points="12 19 5 12 12 5" />
  </Svg>
);

const IntroPage = () => {
  const navigation = useNavigation();
  const toast = useToast();
  const [loginStep, setLoginStep] = useState('start'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const [forgotPasswordStep, setForgotPasswordStep] = useState(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');
  const [codeSentMessage, setCodeSentMessage] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);

  const handleGetStartedClick = () => {
    navigation.navigate('UserRegistration'); // Assuming you have this route
  };

  const handleLoginClick = () => {
    setLoginStep('email');
  };

  const handleEmailNext = () => {
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Geçerli bir e-posta adresi giriniz');
        return;
      }
      
      setEmailError(''); 
      setLoginStep('password');
    }
  };

  const handlePasswordLogin = async () => {
    if (password.trim() && !isLoggingIn) {
      setIsLoggingIn(true);
      
      try {
        const loginData = await smtiaApi.auth.login(email, password);
        // TS.Result unwrap -> { token, refreshToken, refreshTokenExpires }
        if (!loginData || !loginData.token) {
          throw new Error('Giriş başarısız: token alınamadı');
        }

        await setToken(loginData.token);
        setIsLoggingIn(false);
        toast.success('Başarıyla giriş yapıldı!');
        navigation.replace('Dashboard');

      } catch (error) {
        console.error('Login API call failed:', error);
        setIsLoggingIn(false);
        
        const errorMessage = error?.message || 'Giriş başarısız oldu. Bilgilerinizi kontrol edin.';
        
        if (errorMessage.includes('onaylanmamış') || errorMessage.includes('onay linki')) {
          toast.warning(errorMessage);
        }
        else if (error?.status === 429 || errorMessage.includes('çok fazla') || errorMessage.includes('rate limit')) {
          toast.warning('Çok fazla deneme yaptınız. Lütfen 1 saat sonra tekrar deneyin.');
        }
        else if (errorMessage.includes('bloke') || errorMessage.includes('kilitlendi')) {
          toast.error(errorMessage);
        }
        else {
          toast.error(errorMessage);
        }
      }
    }
  };

  const handleBackToStart = () => {
    setLoginStep('start');
    setEmail('');
    setPassword('');
    setIsLoggingIn(false);
    setEmailError('');
    setForgotPasswordStep(null);
    setResetEmail('');
    setIsSendingCode(false);
    setResetEmailError('');
    setCodeSentMessage('');
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordStep('email');
    setResetEmail(email); 
  };

  const handleResetEmailSubmit = async () => {
    if (!resetEmail.trim()) {
      setResetEmailError('E-posta adresi gereklidir');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      setResetEmailError('Geçerli bir e-posta adresi giriniz');
      return;
    }
    
    setResetEmailError('');
    setIsSendingCode(true);
    
    try {
      await smtiaApi.auth.forgotPassword(resetEmail.trim());
      setIsSendingCode(false);
      setCodeSentMessage(`Şifre sıfırlama linki ${resetEmail} adresine gönderildi. Lütfen e-postanızı kontrol edin.`);
      setForgotPasswordStep('sent');
    } catch (error) {
      console.error('Reset code send failed:', error);
      setIsSendingCode(false);
      
      if (error?.status === 429 || error?.message?.includes('çok fazla') || error?.message?.includes('rate limit')) {
        setResetEmailError('Çok fazla deneme yaptınız. Lütfen 1 saat sonra tekrar deneyin.');
      } else {
        setResetEmailError(error?.message || 'İstek başarısız oldu. Lütfen tekrar deneyin.');
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {(loginStep !== 'start' || forgotPasswordStep) && (
        <TouchableOpacity style={styles.backButton} onPress={handleBackToStart}>
          <BackIcon />
        </TouchableOpacity>
      )}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          {!forgotPasswordStep && (
            <Image source={require('../../assets/images/intropage-2.png')} style={styles.mainImage} resizeMode="contain" />
          )}
          
          {loginStep === 'start' && !forgotPasswordStep && (
            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleGetStartedClick}>
                <Text style={styles.primaryButtonText}>Başla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={handleLoginClick}>
                <Text style={styles.secondaryButtonText}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          )}

          {loginStep === 'email' && !forgotPasswordStep && (
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                <TextInput
                  placeholder="E-posta adresinizi girin"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              
              <TouchableOpacity 
                style={[styles.primaryButton, !email.trim() && styles.disabledButton]} 
                onPress={handleEmailNext}
                disabled={!email.trim()}
              >
                <Text style={styles.primaryButtonText}>İleri</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleForgotPasswordClick} style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            </View>
          )}

          {forgotPasswordStep === 'email' && (
            <View style={styles.inputContainer}>
              <Text style={styles.title}>Şifremi Unuttum</Text>
              <Text style={styles.subtitle}>E-posta adresinize doğrulama kodu göndereceğiz</Text>
              
              <View style={[styles.inputWrapper, resetEmailError ? styles.inputError : null]}>
                <TextInput
                  placeholder="E-posta adresinizi girin"
                  placeholderTextColor="#999"
                  value={resetEmail}
                  onChangeText={(text) => {
                    setResetEmail(text);
                    setResetEmailError('');
                  }}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              
              {resetEmailError ? <Text style={styles.errorText}>{resetEmailError}</Text> : null}

              <TouchableOpacity 
                style={[styles.primaryButton, (!resetEmail.trim() || isSendingCode) && styles.disabledButton]} 
                onPress={handleResetEmailSubmit}
                disabled={!resetEmail.trim() || isSendingCode}
              >
                {isSendingCode ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Kod Gönder</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setForgotPasswordStep(null)}>
              </TouchableOpacity>
            </View>
          )}

          {forgotPasswordStep === 'sent' && (
            <View style={styles.inputContainer}>
              <Text style={styles.title}>Link Gönderildi</Text>
              <Text style={styles.subtitle}>{codeSentMessage || `Şifre sıfırlama linki ${resetEmail} adresine gönderildi`}</Text>

              <TouchableOpacity style={{ marginTop: 20 }} onPress={handleBackToStart}>
                <Text style={styles.linkText}>← Giriş ekranına dön</Text>
              </TouchableOpacity>
            </View>
          )}

          {loginStep === 'password' && forgotPasswordStep === null && (
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Şifrenizi girin"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.primaryButton, (!password.trim() || isLoggingIn) && styles.disabledButton]} 
                onPress={handlePasswordLogin}
                disabled={!password.trim() || isLoggingIn}
              >
                {isLoggingIn ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Giriş Yap</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center', // Added to center content vertically
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center', // Added to center content inside
  },
  mainImage: {
    width: width * 0.9,
    height: width * 0.9,
    marginBottom: 60,
  },
  actionContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#0171E4',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'pp-neue-medium',
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'pp-neue-medium',
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    fontFamily: 'pp-neue',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginLeft: 4,
    marginBottom: 16,
    marginTop: -10,
  },
  linkText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'pp-neue',
  },
  forgotPasswordContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#0171E4',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'pp-neue-medium',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'pp-neue-medium',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'pp-neue',
  },
});

export default IntroPage;
