import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
  Easing
} from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Her Gün' },
  { id: 'weekly', label: 'Gerektiğinde' },
  { id: 'custom', label: 'Özel' }
];

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Pzt' },
  { id: 'tuesday', label: 'Sl' },
  { id: 'wednesday', label: 'Çar' },
  { id: 'thursday', label: 'Per' },
  { id: 'friday', label: 'Cum' },
  { id: 'saturday', label: 'Cmt' },
  { id: 'sunday', label: 'Pzr' }
];

const DOSAGE_OPTIONS = ['1 tablet', '2 tablet', '1 kapsül', '2 kapsül', '5ml', '10ml'];

const AddMedicineScheduleModal = ({ isOpen, onClose, onAddMedicine, onBack, medicineData }) => {
  const [frequency, setFrequency] = useState('daily');
  const [selectedDays, setSelectedDays] = useState([]);
  const [times, setTimes] = useState([{ time: '', dosage: '1 tablet' }]);
  
  // Time Picker State
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTimeIndex, setActiveTimeIndex] = useState(-1);
  const [tempDate, setTempDate] = useState(new Date());

  // Animation states
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      if (medicineData && medicineData.schedule) {
         // Existing logic adaptation could go here
      } else {
        // Default reset when opening
        setFrequency('daily');
        // We set selectedDays in the frequency effect, but to be sure:
        setSelectedDays(DAYS_OF_WEEK.map(day => day.id));
        setTimes([{ time: '', dosage: '1 tablet' }]);
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
  }, [isOpen]);

  const handleFrequencyChange = (newFreq) => {
    setFrequency(newFreq);
    if (newFreq === 'daily') {
      setSelectedDays(DAYS_OF_WEEK.map(day => day.id));
    } else if (newFreq === 'weekly') {
      setSelectedDays([]);
    } else if (newFreq === 'custom') {
      setSelectedDays([]);
    }
  };

  const handleDayToggle = (dayId) => {
    if (frequency === 'daily') {
      // First change frequency to custom, then update days
      // Note: We don't use handleFrequencyChange here because we want to keep other days selected
      setFrequency('custom');
      
      const allDays = DAYS_OF_WEEK.map(d => d.id);
      setSelectedDays(allDays.filter(d => d !== dayId));
    } else {
      setSelectedDays(prev =>
        prev.includes(dayId)
          ? prev.filter(day => day !== dayId)
          : [...prev, dayId]
      );
    }
  };

  const handleAddTime = () => {
    setTimes(prev => [...prev, { time: '', dosage: '1 tablet' }]);
  };

  const handleTimeChange = (index, field, value) => {
    setTimes(prev => prev.map((time, i) =>
      i === index ? { ...time, [field]: value } : time
    ));
  };

  const handleRemoveTime = (index) => {
    if (times.length > 1) {
      setTimes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleTimePress = (index) => {
    setActiveTimeIndex(index);
    const currentTimeStr = times[index].time;
    let date = new Date();
    
    if (currentTimeStr) {
      const [hours, minutes] = currentTimeStr.split(':');
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    } else {
      // Default to 08:00 if empty
      date.setHours(8, 0, 0, 0);
    }
    
    setTempDate(date);
    setShowTimePicker(true);
  };

  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (selectedDate) {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        handleTimeChange(activeTimeIndex, 'time', `${hours}:${minutes}`);
      }
    } else {
      // iOS just updates the temp date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleIOSConfirm = () => {
    const hours = tempDate.getHours().toString().padStart(2, '0');
    const minutes = tempDate.getMinutes().toString().padStart(2, '0');
    handleTimeChange(activeTimeIndex, 'time', `${hours}:${minutes}`);
    setShowTimePicker(false);
  };

  const isFormValid = () => {
    if (!frequency) return false;
    if (frequency === 'weekly') return true; // "Gerektiğinde" might not need times
    if (selectedDays.length === 0) return false;
    
    // For now, valid time check is simple length check
    const validTimes = times.filter(time => time.time.length >= 4); 
    if (validTimes.length === 0) return false;

    return true;
  };

  const handleAdd = () => {
    if (isFormValid()) {
      const scheduleData = {
        frequency,
        selectedDays: frequency === 'weekly' ? [] : selectedDays,
        times: frequency === 'weekly' ? [] : times
      };

      onAddMedicine({
        ...medicineData,
        schedule: scheduleData
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
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                   <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1e1f28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M19 12H5" />
                    <Path d="M12 19l-7-7 7-7" />
                  </Svg>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>İlaç Ekle</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1e1f28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <Line x1="18" y1="6" x2="6" y2="18" />
                    <Line x1="6" y1="6" x2="18" y2="18" />
                  </Svg>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                
                {/* Frequency */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Bunu Ne Zaman Alıyorsun?</Text>
                  <View style={styles.frequencyContainer}>
                     {FREQUENCY_OPTIONS.map(opt => (
                        <TouchableOpacity
                           key={opt.id}
                           style={[
                             styles.frequencyOption,
                             frequency === opt.id && styles.selectedFrequencyOption
                           ]}
                           onPress={() => handleFrequencyChange(opt.id)}
                        >
                           <Text style={[
                             styles.frequencyText,
                             frequency === opt.id && styles.selectedFrequencyText
                           ]}>{opt.label}</Text>
                        </TouchableOpacity>
                     ))}
                  </View>
                </View>

                {/* Days */}
                {frequency !== 'weekly' && (
                  <View style={styles.fieldContainer}>
                    <View style={styles.daysContainer}>
                      {DAYS_OF_WEEK.map((day) => (
                        <TouchableOpacity
                          key={day.id}
                          style={[
                            styles.dayButton,
                            selectedDays.includes(day.id) && styles.selectedDayButton
                          ]}
                          onPress={() => handleDayToggle(day.id)}
                        >
                          <Text style={[
                            styles.dayText,
                            selectedDays.includes(day.id) && styles.selectedDayText
                          ]}>
                            {day.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Times */}
                {frequency !== 'weekly' && (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Saat Kaçta?</Text>
                    {times.map((timeData, index) => (
                      <View key={index} style={styles.timeRow}>
                        <TouchableOpacity
                          style={styles.timeInput}
                          onPress={() => handleTimePress(index)}
                        >
                          <Text style={styles.timeInputText}>
                            {timeData.time || '08:00'}
                          </Text>
                        </TouchableOpacity>
                         {/* Simplified Dosage Selection for Native */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dosageScroll}>
                           {DOSAGE_OPTIONS.map(d => (
                              <TouchableOpacity 
                                key={d}
                                style={[
                                   styles.dosageChip,
                                   timeData.dosage === d && styles.selectedDosageChip
                                ]}
                                onPress={() => handleTimeChange(index, 'dosage', d)}
                              >
                                 <Text style={[
                                    styles.dosageChipText,
                                    timeData.dosage === d && styles.selectedDosageChipText
                                 ]}>{d}</Text>
                              </TouchableOpacity>
                           ))}
                        </ScrollView>
                        
                        {times.length > 1 && (
                          <TouchableOpacity onPress={() => handleRemoveTime(index)} style={styles.removeTimeButton}>
                             <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                               <Line x1="18" y1="6" x2="6" y2="18" />
                               <Line x1="6" y1="6" x2="18" y2="18" />
                             </Svg>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    
                    <TouchableOpacity style={styles.addTimeButton} onPress={handleAddTime}>
                       <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#0171E4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                         <Line x1="12" y1="5" x2="12" y2="19" />
                         <Line x1="5" y1="12" x2="19" y2="12" />
                       </Svg>
                       <Text style={styles.addTimeText}>Bir zaman ekle</Text>
                    </TouchableOpacity>
                  </View>
                )}

              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.addButton, !isFormValid() && styles.disabledButton]}
                  onPress={handleAdd}
                  disabled={!isFormValid()}
                >
                  <Text style={styles.addButtonText}>İlacı Ekle</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            </KeyboardAvoidingView>
           </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Android Picker */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* iOS Picker Modal */}
      {Platform.OS === 'ios' && showTimePicker && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.iosPickerOverlay}>
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.iosPickerCancel}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text style={styles.iosPickerDone}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={onTimeChange}
                style={styles.iosDatePicker}
                textColor="black"
              />
            </View>
          </View>
        </Modal>
      )}
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
  backButton: {
    padding: 4,
    backgroundColor: '#f1f3f5',
    borderRadius: 20,
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
  frequencyContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 4,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  selectedFrequencyOption: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  frequencyText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  selectedFrequencyText: {
    color: '#1e1f28',
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: (width - 40) / 7 - 6,
    height: (width - 40) / 7 - 6,
    borderRadius: ((width - 40) / 7 - 6) / 2,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedDayButton: {
    backgroundColor: '#0171E4',
    borderColor: '#0171E4',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  selectedDayText: {
    color: '#fff',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  timeInput: {
    width: 80,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeInputText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'PPNeueMontreal-Regular',
    textAlign: 'center',
  },
  iosPickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iosPickerContainer: {
    backgroundColor: 'white',
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center', // Center content horizontally
  },
  iosDatePicker: {
    width: '100%',
    height: 200,
    alignSelf: 'center', // Ensure picker itself is centered
  },
  iosPickerHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iosPickerCancel: {
    color: 'red',
    fontSize: 16,
  },
  iosPickerDone: {
    color: '#0171E4',
    fontSize: 16,
    fontWeight: '600',
  },
  dosageScroll: {
    flex: 1,
  },
  dosageChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedDosageChip: {
    backgroundColor: '#e3f2fd',
    borderColor: '#0171E4',
  },
  dosageChipText: {
    fontSize: 12,
    color: '#666',
  },
  selectedDosageChipText: {
    color: '#0171E4',
    fontWeight: '500',
  },
  removeTimeButton: {
    padding: 8,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  addTimeText: {
    color: '#0171E4',
    marginLeft: 8,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  footer: {
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#0171E4',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'pp-neue-medium',
  },
});

export default AddMedicineScheduleModal;