import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';
import { smtiaApi } from '../../services/smtiaApi';

const { width } = Dimensions.get('window');

const UserRegistrationPage = ({ onRegistrationComplete, onBackToIntro, navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKVKKMessage, setShowKVKKMessage] = useState(false);
  // KVKKPage ve AgeSelectionPage navigation ile yönetilecek
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: ''
  });

  const steps = [
    { id: 1, title: 'Adınız', placeholder: 'Adınızı girin', field: 'name' },
    { id: 2, title: 'Soyadınız', placeholder: 'Soyadınızı girin', field: 'surname' },
    { id: 3, title: 'E-posta Adresiniz', placeholder: 'E-posta adresinizi girin', field: 'email' },
    { id: 4, title: 'Şifrenizi Oluşturun', placeholder: 'Şifrenizi oluşturun', field: 'password' }
  ];

  const getProgressIndicator = () => {
    return '1/6'; // Sabit değer, web ile aynı
  };

  const validateName = (name) => {
    if (!name.trim()) return 'Ad alanı boş olamaz';
    if (name.trim().length < 2) return 'Ad en az 2 karakter olmalıdır';
    if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(name.trim())) return 'Ad sadece harflerden oluşmalıdır';
    return null;
  };

  const validateSurname = (surname) => {
    if (!surname.trim()) return 'Soyad alanı boş olamaz';
    if (surname.trim().length < 2) return 'Soyad en az 2 karakter olmalıdır';
    if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(surname.trim())) return 'Soyad sadece harflerden oluşmalıdır';
    return null;
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'E-posta alanı boş olamaz';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Geçerli bir e-posta adresi giriniz';
    return null;
  };

  const validatePassword = (password) => {
    if (!password.trim()) return 'Şifre alanı boş olamaz';
    if (password.length < 8) return 'Şifre en az 8 karakter olmalıdır';
    if (!/(?=.*[a-z])/.test(password)) return 'Şifre en az 1 küçük harf içermelidir';
    if (!/(?=.*[A-Z])/.test(password)) return 'Şifre en az 1 büyük harf içermelidir';
    if (!/(?=.*\d)/.test(password)) return 'Şifre en az 1 sayı içermelidir';
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) return 'Şifre en az 1 özel karakter içermelidir';
    return null;
  };

  const currentStepData = steps.find(step => step.id === currentStep);
  const currentValue = formData[currentStepData.field];

  const handleNext = () => {
    if (!currentValue.trim()) {
      setErrorMessage('Bu alan boş olamaz');
      return;
    }

    let validationError = null;
    switch (currentStep) {
      case 1: validationError = validateName(currentValue); break;
      case 2: validationError = validateSurname(currentValue); break;
      case 3: validationError = validateEmail(currentValue); break;
      case 4: validationError = validatePassword(currentValue); break;
      default: break;
    }

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');

    if (currentStep === 3) {
      // API kontrolü bypass edildi
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 200);
      return;
    }

    if (currentStep < 4) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 200);
    } else {
      navigation.navigate('AgeSelection', { userRegistrationData: formData });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
        setErrorMessage('');
      }, 200);
    } else {
      if (navigation && navigation.canGoBack()) {
        navigation.goBack();
      } else if (onBackToIntro) {
        onBackToIntro();
      }
    }
  };

  const handleInputChange = (text) => {
    setFormData({
      ...formData,
      [currentStepData.field]: text
    });
    if (errorMessage) setErrorMessage('');
  };

  const getInputType = () => {
    if (currentStep === 3) return 'email-address';
    return 'default';
  };

  const getPasswordRequirements = () => {
    const password = currentValue;
    return [
      { text: 'En az 1 büyük harf', met: /(?=.*[A-Z])/.test(password) },
      { text: 'En az 1 küçük harf', met: /(?=.*[a-z])/.test(password) },
      { text: 'En az 1 sayı', met: /(?=.*\d)/.test(password) },
      { text: 'En az 1 özel karakter', met: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password) },
      { text: 'En az 8 karakter', met: password.length >= 8 }
    ];
  };

  const getCompletedRequirements = () => {
    const requirements = getPasswordRequirements();
    return requirements.filter(req => req.met);
  };

  const getCurrentRequirement = () => {
    const requirements = getPasswordRequirements();
    const nextUnmet = requirements.find(req => !req.met);
    // If all met, return null to signal success state
    return nextUnmet ? nextUnmet : null;
  };

  const isPasswordValid = () => {
    return validatePassword(currentValue) === null;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowKVKKMessage(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M19 12H5" />
              <Path d="M12 19l-7-7 7-7" />
            </Svg>
          </TouchableOpacity>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>{getProgressIndicator()}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.titleContainer, isTransitioning && styles.fadeOut]}>
            <Text style={styles.title}>{currentStepData.title}</Text>
          </View>

          <View style={[styles.inputContainer, isTransitioning && styles.fadeOut]}>
            <View style={[styles.inputWrapper, errorMessage ? styles.inputError : null]}>
              <TextInput
                style={styles.input}
                placeholder={currentStepData.placeholder}
                placeholderTextColor="#999"
                value={currentValue}
                onChangeText={handleInputChange}
                keyboardType={getInputType()}
                secureTextEntry={currentStep === 4 && !showPassword}
                autoCapitalize={currentStep === 3 ? 'none' : 'words'}
                autoCorrect={false}
              />
              
              {currentStep === 4 && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                  {showPassword ? (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <Line x1="1" y1="1" x2="23" y2="23" />
                    </Svg>
                  ) : (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M1 12s4-8 11-8 11 8 11 8 8-4 8-11 8-11-8-11-8z" />
                      <Circle cx="12" cy="12" r="3" />
                    </Svg>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Circle cx="12" cy="12" r="10" />
                  <Line x1="12" y1="8" x2="12" y2="12" />
                  <Line x1="12" y1="16" x2="12.01" y2="16" />
                </Svg>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {currentStep === 4 && currentValue.trim() !== '' && (
              <View style={styles.requirementsContainer}>
                {(() => {
                  const currentReq = getCurrentRequirement();
                  if (currentReq) {
                    return (
                      <View style={styles.requirementItem}>
                        <View style={styles.requirementDot} />
                        <Text style={styles.requirementText}>{currentReq.text}</Text>
                      </View>
                    );
                  } else {
                    return (
                      <View style={styles.requirementItem}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <Polyline points="20 6 9 17 4 12" />
                        </Svg>
                        <Text style={[styles.requirementText, { color: '#10b981', fontWeight: '500' }]}>Şifre güvenli</Text>
                      </View>
                    );
                  }
                })()}
              </View>
            )}

            <TouchableOpacity 
              style={[
                styles.primaryButton, 
                (!currentValue.trim() || isCheckingEmail || (currentStep === 4 && !isPasswordValid())) && styles.disabledButton
              ]} 
              onPress={handleNext}
              disabled={!currentValue.trim() || isCheckingEmail || (currentStep === 4 && !isPasswordValid())}
            >
              {isCheckingEmail ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {currentStep === 4 ? 'Sonraki Sayfa' : 'Devam Et'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {showKVKKMessage && (
          <View style={styles.kvkkContainer}>
            <View style={styles.kvkkContent}>
              <Text style={styles.kvkkText}>Gizliliğinizde önem veriyoruz. Daha fazla bilgi için Veri ve Çerez Politikasını ziyaret edebilirsiniz.</Text>
              <TouchableOpacity style={styles.kvkkButton} onPress={() => {
                setShowKVKKMessage(false);
                navigation.navigate('KVKK');
              }}>
                <Text style={styles.kvkkButtonText}>KVKK</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.kvkkClose} onPress={() => setShowKVKKMessage(false)}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Line x1="18" y1="6" x2="6" y2="18" />
                <Line x1="6" y1="6" x2="18" y2="18" />
              </Svg>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fefefe',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  progressIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  progressText: {
    color: '#666',
    fontFamily: 'pp-neue',
    fontSize: 14,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'pp-neue',
    color: '#1e1f28',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 0,
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'pp-neue',
    color: '#333',
    height: '100%',
  },
  primaryButton: {
    backgroundColor: '#0171E4',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'pp-neue-medium',
  },
  passwordToggle: {
    padding: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 8,
    gap: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontFamily: 'pp-neue',
    fontSize: 12,
  },
  requirementsContainer: {
    marginTop: 0,
    marginBottom: 20,
    paddingLeft: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  requirementText: {
    color: '#999',
    fontFamily: 'pp-neue',
    fontSize: 12,
  },
  requirementMet: {
    color: '#10b981',
    textDecorationLine: 'line-through',
  },
  requirementDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999',
    marginHorizontal: 4,
  },
  floatingNextButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30, // Higher on iOS for safe area
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0171e4',
    paddingVertical: 16, // Increased padding
    paddingHorizontal: 24, // Increased padding
    borderRadius: 30, // More rounded
    gap: 12, // More space between text and icon
    shadowColor: '#0171e4', // Re-added shadow for floating effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100, // Ensure it's above everything
  },
  floatingNextButtonText: {
    color: '#fff',
    fontFamily: 'pp-neue-medium', // Medium font weight
    fontSize: 16, // Larger font size
    fontWeight: '600',
  },
  kvkkContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#f4f4f4',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kvkkContent: {
    flex: 1,
    marginRight: 10,
  },
  kvkkText: {
    fontSize: 12,
    color: '#495057',
    fontFamily: 'pp-neue',
    marginBottom: 8,
  },
  kvkkButton: {
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  kvkkButtonText: {
    color: '#007bff',
    fontSize: 10,
    fontFamily: 'pp-neue',
    fontWeight: '500',
  },
  kvkkClose: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#7E7E7E',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fadeOut: {
    opacity: 0.5,
  },
});

export default UserRegistrationPage;
