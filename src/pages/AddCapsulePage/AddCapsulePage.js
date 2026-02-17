import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  SafeAreaView,
  Alert,
  Animated,
  Easing
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import AddMedicineModal from '../../components/AddMedicineModal/AddMedicineModal';
import AddMedicineScheduleModal from '../../components/AddMedicineScheduleModal/AddMedicineScheduleModal';
import { useToast } from '../../contexts/ToastContext';

const AddCapsulePage = ({ navigation, route }) => {
  const { userRegistrationData = {} } = route.params || {};
  const [addedMedicines, setAddedMedicines] = useState([]);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  
  const [isAddMedicineModalVisible, setIsAddMedicineModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [tempMedicineData, setTempMedicineData] = useState(null);
  
  // Success Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  // useToast hook might be missing or causing issues if context is not wrapped.
  // Adding fallback to Alert if toast fails or context is missing.
  let showToast;
  try {
      const toastContext = useToast();
      showToast = toastContext?.showToast || ((msg) => Alert.alert('Bilgi', msg));
  } catch (e) {
      showToast = (msg) => Alert.alert('Bilgi', msg);
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddCapsule = () => {
    setIsAddMedicineModalVisible(true);
  };

  const handleMedicineNext = (data) => {
    setTempMedicineData(data);
    setIsAddMedicineModalVisible(false);
    setTimeout(() => {
        setIsScheduleModalVisible(true);
    }, 300); // Slight delay for smooth transition
  };

  const handleScheduleAdd = (data) => {
    setAddedMedicines([...addedMedicines, data]);
    setIsScheduleModalVisible(false);
    setTempMedicineData(null);
    showToast('İlaç başarıyla eklendi', 'success');
  };

  const handleScheduleBack = () => {
    setIsScheduleModalVisible(false);
    setTimeout(() => {
        setIsAddMedicineModalVisible(true);
    }, 300);
  };

  const handleRemoveMedicine = (index) => {
    const newMedicines = [...addedMedicines];
    newMedicines.splice(index, 1);
    setAddedMedicines(newMedicines);
  };

  const handleCompleteRegistration = () => {
    // Simulate API call
    setShowSuccessScreen(true);
    
    // Start animations
    Animated.parallel([
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        })
    ]).start();

    // Auto navigate after 2 seconds
    setTimeout(() => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
        });
    }, 2000);
  };

  if (showSuccessScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.successContainer}>
            <View style={styles.successContent}>
                <Animated.View style={[styles.successIconContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <Svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <Path d="M22 4L12 14.01l-3-3" />
                    </Svg>
                </Animated.View>
                
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }}>
                    <Text style={styles.successTitle}>Kayıt Başarılı!</Text>
                    <Text style={styles.successSubtitle}>
                        Hesabınız başarıyla oluşturuldu. Artık sağlığınızı takip etmeye başlayabilirsiniz.
                    </Text>
                </Animated.View>
            </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 12H5" />
            <Path d="M12 19l-7-7 7-7" />
          </Svg>
        </TouchableOpacity>
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>6/6</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>İlaç Ekle</Text>
          <Text style={styles.subtitle}>
            Yeni bir ilaç ekleyerek takip etmeye başlayabilirsiniz.
          </Text>
        </View>

        <View style={styles.medicinesContainer}>
            {addedMedicines.map((medicine, index) => (
                <View key={index} style={styles.medicineItem}>
                    <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleRemoveMedicine(index)}
                    >
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <Line x1="18" y1="6" x2="6" y2="18" />
                          <Line x1="6" y1="6" x2="18" y2="18" />
                        </Svg>
                    </TouchableOpacity>
                    <Image 
                        source={require('../../assets/images/capsule-type-1.png')} 
                        style={styles.medicineIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.medicineName}>{medicine.name}</Text>
                </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={handleAddCapsule}>
                <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
                  <Line x1="12" y1="5" x2="12" y2="19" />
                  <Line x1="5" y1="12" x2="19" y2="12" />
                </Svg>
            </TouchableOpacity>
        </View>

        {/* Complete Button */}
      {addedMedicines.length > 0 && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleCompleteRegistration}>
            <Text style={styles.primaryButtonText}>Kayıtı Tamamla</Text>
        </TouchableOpacity>
      )}
      </View>

      <AddMedicineModal
        isOpen={isAddMedicineModalVisible}
        onClose={() => setIsAddMedicineModalVisible(false)}
        onNext={handleMedicineNext}
        initialData={tempMedicineData}
      />

      <AddMedicineScheduleModal
        isOpen={isScheduleModalVisible}
        onClose={() => setIsScheduleModalVisible(false)}
        onBack={handleScheduleBack}
        onAddMedicine={handleScheduleAdd}
        medicineData={tempMedicineData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 10,
    zIndex: 10,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1e1f28',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'PPNeueMontreal-Regular',
    paddingHorizontal: 20,
  },
  medicinesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 20,
  },
  medicineItem: {
      width: 100,
      height: 120,
      backgroundColor: '#fff',
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e9ecef',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      position: 'relative',
  },
  medicineIcon: {
      width: 50,
      height: 50,
      marginBottom: 10,
  },
  medicineName: {
      fontSize: 12,
      color: '#333',
      textAlign: 'center',
      fontFamily: 'PPNeueMontreal-Medium',
  },
  removeButton: {
      position: 'absolute',
      top: 5,
      right: 5,
      padding: 5,
  },
  addButton: {
    width: 100,
    height: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  primaryButton: {
    backgroundColor: '#0171E4',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 'auto',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'pp-neue-medium',
  },
  successContainer: {
      flex: 1,
      backgroundColor: '#fefefe',
      justifyContent: 'center',
      alignItems: 'center',
  },
  successContent: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      width: '100%',
  },
  successIconContainer: {
      marginBottom: 32,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: '#f0fdf4', // Very light green bg
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#4caf50",
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
  },
  successTitle: {
      fontSize: 32,
      fontWeight: '600',
      color: '#1e1f28',
      marginBottom: 16,
      textAlign: 'center',
      fontFamily: 'PPNeueMontreal-Medium',
      letterSpacing: -0.5,
  },
  successSubtitle: {
      fontSize: 18,
      color: '#666',
      textAlign: 'center',
      lineHeight: 28,
      fontFamily: 'PPNeueMontreal-Regular',
      maxWidth: '80%',
  },
  infoBox: {
      backgroundColor: '#f8f6f3',
      padding: 20,
      borderRadius: 12,
      width: '100%',
      maxWidth: 400,
      marginBottom: 30,
  },
  infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#4a4a4a',
      marginBottom: 8,
      fontFamily: 'PPNeueMontreal-Medium',
  },
  infoText: {
      fontSize: 14,
      color: '#5a5a5a',
      lineHeight: 20,
      marginBottom: 12,
      fontFamily: 'PPNeueMontreal-Regular',
  },
  infoNote: {
      fontSize: 13,
      color: '#7a7a7a',
      fontStyle: 'italic',
      fontFamily: 'PPNeueMontreal-Regular',
  },
  homeButton: {
      backgroundColor: '#0466E0',
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 12,
      shadowColor: '#0466E0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
  },
  homeButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'PPNeueMontreal-Medium',
  },
});

export default AddCapsulePage;
