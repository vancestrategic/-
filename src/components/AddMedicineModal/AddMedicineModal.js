import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing
} from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AddMedicineModal = ({ isOpen, onClose, onNext, initialData = null }) => {
  const [medicineName, setMedicineName] = useState('');
  const [selectedType, setSelectedType] = useState('capsule');
  const [doseAmount, setDoseAmount] = useState('500');
  const [doseUnit, setDoseUnit] = useState('mg');
  
  // Animation states
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      if (initialData) {
        setMedicineName(initialData.name || '');
        setSelectedType(initialData.type || 'capsule');
        setDoseAmount(initialData.dose?.amount || '500');
        setDoseUnit(initialData.dose?.unit || 'mg');
      } else {
        setMedicineName('');
        setSelectedType('capsule');
        setDoseAmount('500');
        setDoseUnit('mg');
      }
      
      // Animate In
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          mass: 1,
          stiffness: 100,
        })
      ]).start();
    } else {
      // Animate Out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [isOpen, initialData]);

  const medicineTypes = [
    { id: 'capsule', label: 'Kapsül', image: require('../../assets/images/capsule-type-1.png') },
    { id: 'pill', label: 'Hap', image: require('../../assets/images/capsule-type-2.png') },
    { id: 'bottle', label: 'Şişe', image: require('../../assets/images/capsule-type-3.png') },
    { id: 'syringe', label: 'Şırınga', image: require('../../assets/images/capsule-type-4.png') }
  ];

  const doseUnits = ['mg', 'g', 'ml', 'adet'];

  const handleNextPress = () => {
    if (medicineName.trim()) {
      onNext({
        name: medicineName,
        type: selectedType,
        dose: {
          amount: doseAmount,
          unit: doseUnit
        }
      });
    }
  };

  if (!showModal) return null;

  return (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <Animated.View 
                style={[
                  styles.modalContainer, 
                  { transform: [{ translateY: slideAnim }] }
                ]}
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>İlaç Ekle</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1e1f28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Line x1="18" y1="6" x2="6" y2="18" />
                      <Line x1="6" y1="6" x2="18" y2="18" />
                    </Svg>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                  {/* Medicine Name Input */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>İlaç İsmi</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="İlaç adını girin"
                      placeholderTextColor="#999"
                      value={medicineName}
                      onChangeText={setMedicineName}
                    />
                  </View>

                  {/* Medicine Type Selection */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Kapsül Tipi</Text>
                    <View style={styles.typeContainer}>
                      {medicineTypes.map((type) => (
                        <TouchableOpacity
                          key={type.id}
                          style={[
                            styles.typeOption,
                            selectedType === type.id && styles.selectedTypeOption
                          ]}
                          onPress={() => setSelectedType(type.id)}
                        >
                          <Image source={type.image} style={styles.typeImage} resizeMode="contain" />
                          <Text style={[
                            styles.typeLabel,
                            selectedType === type.id && styles.selectedTypeLabel
                          ]}>
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Dose Input */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Doz Ekle</Text>
                    <View style={styles.doseContainer}>
                      <TextInput
                        style={styles.doseInput}
                        value={doseAmount}
                        onChangeText={setDoseAmount}
                        keyboardType="numeric"
                        placeholder="500"
                      />
                      <View style={styles.unitContainer}>
                        {doseUnits.map((unit) => (
                          <TouchableOpacity
                            key={unit}
                            style={[
                              styles.unitButton,
                              doseUnit === unit && styles.selectedUnitButton
                            ]}
                            onPress={() => setDoseUnit(unit)}
                          >
                            <Text style={[
                              styles.unitText,
                              doseUnit === unit && styles.selectedUnitText
                            ]}>
                              {unit}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </ScrollView>

                {/* Footer / Next Button */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.nextButton, !medicineName.trim() && styles.disabledButton]}
                    onPress={handleNextPress}
                    disabled={!medicineName.trim()}
                  >
                    <Text style={styles.nextButtonText}>Sonraki Sayfa</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: height * 0.9,
    minHeight: height * 0.6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#f1f3f5',
    borderRadius: 20,
  },
  content: {
    paddingBottom: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e1f28',
    marginBottom: 12,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    width: (width - 40 - 36) / 4, // Calculate width for 4 items with gap
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  selectedTypeOption: {
    borderColor: '#0171E4',
    // backgroundColor: '#f0f7ff', // Removed background change
    borderWidth: 2,
  },
  typeImage: {
    width: '60%',
    height: '60%',
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  selectedTypeLabel: {
    color: '#0171E4',
    fontWeight: '600',
  },
  doseContainer: {
    gap: 12,
  },
  doseInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  unitContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedUnitButton: {
    backgroundColor: '#0171E4',
    borderColor: '#0171E4',
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  selectedUnitText: {
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    marginTop: 20,
  },
  nextButton: {
    backgroundColor: '#0171E4',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'pp-neue-medium',
  },
});

export default AddMedicineModal;