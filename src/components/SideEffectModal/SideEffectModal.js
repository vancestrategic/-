import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
  ScrollView
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SideEffectModal = ({ isOpen, onClose, onSave, pastSideEffects = [] }) => {
  const [medicineName, setMedicineName] = useState('');
  const [sideEffect, setSideEffect] = useState('');
  const [severity, setSeverity] = useState('mild'); // mild, moderate, severe
  
  // Animation states
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setMedicineName('');
      setSideEffect('');
      setSeverity('mild');
      
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
  }, [isOpen]);

  const handleSave = () => {
    if (sideEffect.trim() && medicineName.trim()) {
      onSave({
        medicine: medicineName,
        effect: sideEffect,
        severity: severity,
        date: new Date()
      });
      setMedicineName('');
      setSideEffect('');
    }
  };

  const severityOptions = [
    { id: 'mild', label: 'Hafif', color: '#81C784' },
    { id: 'moderate', label: 'Orta', color: '#FFB74D' },
    { id: 'severe', label: 'Şiddetli', color: '#E57373' }
  ];

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
                  <Text style={styles.headerTitle}>Yan Etki Bildir</Text>
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
                    <Text style={styles.label}>İlaç Adı</Text>
                    <TextInput
                      style={styles.inputSingle}
                      placeholder="Hangi ilaç yan etki yaptı?"
                      placeholderTextColor="#999"
                      value={medicineName}
                      onChangeText={setMedicineName}
                    />
                  </View>

                  {/* Side Effect Input */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Yan Etki Nedir?</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Örn: Baş ağrısı, Mide bulantısı..."
                      placeholderTextColor="#999"
                      value={sideEffect}
                      onChangeText={setSideEffect}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {/* Severity Selection */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Şiddeti</Text>
                    <View style={styles.severityContainer}>
                      {severityOptions.map((option) => (
                        <TouchableOpacity
                          key={option.id}
                          style={[
                            styles.severityOption,
                            severity === option.id && { borderColor: option.color, backgroundColor: option.color + '15' }
                          ]}
                          onPress={() => setSeverity(option.id)}
                        >
                          <View style={[styles.severityDot, { backgroundColor: option.color }]} />
                          <Text style={[
                            styles.severityLabel,
                            severity === option.id && { color: '#333', fontWeight: '600' }
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Save Button */}
                  <TouchableOpacity
                    style={[styles.saveButton, (!sideEffect.trim() || !medicineName.trim()) && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={!sideEffect.trim() || !medicineName.trim()}
                  >
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                  </TouchableOpacity>

                  {/* Past Reports Section */}
                  {pastSideEffects.length > 0 && (
                    <View style={styles.historySection}>
                      <Text style={styles.historyTitle}>Geçmiş Bildirimler</Text>
                      {pastSideEffects.map((report, index) => (
                        <View key={index} style={styles.historyItem}>
                          <View style={styles.historyHeader}>
                            <Text style={styles.historyMedicine}>{report.medicine}</Text>
                            <Text style={styles.historyDate}>
                              {new Date(report.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            </Text>
                          </View>
                          <Text style={styles.historyEffect}>{report.effect}</Text>
                          <View style={[
                            styles.historySeverityBadge, 
                            { backgroundColor: severityOptions.find(s => s.id === report.severity)?.color + '20' }
                          ]}>
                            <Text style={[
                              styles.historySeverityText,
                              { color: severityOptions.find(s => s.id === report.severity)?.color }
                            ]}>
                              {severityOptions.find(s => s.id === report.severity)?.label}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>
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
    height: height * 0.85, // Fixed height to ensure it fits but leaves space at top
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
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
    paddingBottom: 10,
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputSingle: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  historySection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e1f28',
    marginBottom: 16,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyMedicine: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  historyEffect: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  historySeverityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historySeverityText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  severityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    gap: 8,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  severityLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  footer: {
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#F44336', // Red for side effects/warnings
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#ffcdd2',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'PPNeueMontreal-Medium',
  },
});

export default SideEffectModal;