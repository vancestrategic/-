import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const WaterTrackerModal = ({ visible, onClose, onSave, currentIntake = 0, goal = 2500 }) => {
  const [intake, setIntake] = useState(0);
  
  // Animation states
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      setIntake(currentIntake);
      
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
        }),
        Animated.timing(fillAnim, {
            toValue: Math.min(currentIntake / goal, 1),
            duration: 1000,
            useNativeDriver: false,
        })
      ]).start();
    } else {
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
  }, [visible, currentIntake]);

  const addWater = (amount) => {
    const newIntake = intake + amount;
    setIntake(newIntake);
    
    // Animate fill
    Animated.timing(fillAnim, {
        toValue: Math.min(newIntake / goal, 1),
        duration: 500,
        useNativeDriver: false,
    }).start();

    // Auto save after small delay or manual save button? 
    // Let's use manual save or auto-save on close?
    // User requested "Card", usually trackers update immediately. 
    // I will add a "Save/Update" button to confirm.
  };

  const handleSave = () => {
      onSave(intake);
      onClose();
  };

  const percentage = Math.min(Math.round((intake / goal) * 100), 100);

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
          <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.modalContainer, 
                  { transform: [{ translateY: slideAnim }] }
                ]}
              >
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Su Takibi</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#1e1f28" />
                  </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {/* Visualizer */}
                    <View style={styles.visualizerContainer}>
                        <View style={styles.circleBackground}>
                            <Animated.View 
                                style={[
                                    styles.circleFill, 
                                    { 
                                        height: fillAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', '100%']
                                        }) 
                                    }
                                ]} 
                            />
                            <View style={styles.circleContent}>
                                <Ionicons name="water" size={48} color={percentage > 50 ? "#fff" : "#2196f3"} />
                                <Text style={[styles.percentageText, percentage > 50 && { color: '#fff' }]}>%{percentage}</Text>
                                <Text style={[styles.intakeText, percentage > 50 && { color: '#fff' }]}>{intake} / {goal} ml</Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Add Buttons */}
                    <Text style={styles.sectionTitle}>Hızlı Ekle</Text>
                    <View style={styles.buttonsRow}>
                        <TouchableOpacity style={styles.addButton} onPress={() => addWater(200)}>
                            <Ionicons name="add" size={20} color="#0171E4" />
                            <Text style={styles.addButtonText}>200 ml</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addButton} onPress={() => addWater(500)}>
                            <Ionicons name="add" size={20} color="#0171E4" />
                            <Text style={styles.addButtonText}>500 ml</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addButton} onPress={() => addWater(1000)}>
                            <Ionicons name="add" size={20} color="#0171E4" />
                            <Text style={styles.addButtonText}>1 Lt</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Reset Option */}
                     <TouchableOpacity style={styles.resetButton} onPress={() => {
                         setIntake(0);
                         Animated.timing(fillAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();
                     }}>
                        <Text style={styles.resetButtonText}>Sıfırla</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                      >
                        <Text style={styles.saveButtonText}>Güncelle</Text>
                      </TouchableOpacity>
                    </View>
                </View>

              </Animated.View>
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
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    height: height * 0.7,
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
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
    flex: 1,
    alignItems: 'center',
  },
  visualizerContainer: {
      marginVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
  },
  circleBackground: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: '#e3f2fd',
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 4,
      borderColor: '#bbdefb',
  },
  circleFill: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#2196f3',
  },
  circleContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
  },
  percentageText: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#1565c0',
      marginTop: 8,
      fontFamily: 'PPNeueMontreal-Medium',
  },
  intakeText: {
      fontSize: 16,
      color: '#1976d2',
      fontFamily: 'PPNeueMontreal-Regular',
      marginTop: 4,
  },
  sectionTitle: {
      alignSelf: 'flex-start',
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 16,
      fontFamily: 'PPNeueMontreal-Medium',
  },
  buttonsRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
      justifyContent: 'space-between',
  },
  addButton: {
      flex: 1,
      backgroundColor: '#f0f7ff',
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#cce5ff',
      gap: 8,
  },
  addButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#0171E4',
      fontFamily: 'PPNeueMontreal-Medium',
  },
  resetButton: {
      marginTop: 20,
      padding: 10,
  },
  resetButtonText: {
      color: '#f44336',
      fontSize: 14,
      fontFamily: 'PPNeueMontreal-Regular',
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#0171E4',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PPNeueMontreal-Medium',
  },
});

export default WaterTrackerModal;