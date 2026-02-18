import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const MedicineReminderModal = ({ visible, medicineName, onTaken, onSnooze }) => {
  const [showModal, setShowModal] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 100
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!showModal) return null;

  return (
    <Modal
      transparent
      visible={showModal}
      animationType="none"
      onRequestClose={onSnooze}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        
        <Animated.View 
          style={[
            styles.container,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }] 
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../assets/images/capsule-type-1.png')} 
              style={styles.medicineIcon}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>İlaç Vakti!</Text>
          <Text style={styles.message}>
            <Text style={styles.medicineName}>{medicineName}</Text> ilacını alma zamanı geldi.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.takenButton} onPress={onTaken}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
              <Text style={styles.takenButtonText}>İlacı Aldım</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.snoozeButton} onPress={onSnooze}>
              <Text style={styles.snoozeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  medicineIcon: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e1f28',
    marginBottom: 12,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  medicineName: {
    fontWeight: '700',
    color: '#0171E4',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  takenButton: {
    backgroundColor: '#0171E4',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  takenButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  snoozeButton: {
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  snoozeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'PPNeueMontreal-Medium',
  },
});

export default MedicineReminderModal;
