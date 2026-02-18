import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const AddMedicineScheduleModal = ({ isOpen, onClose, onAddMedicine, onBack, medicineData }) => {
  const [frequency, setFrequency] = useState('daily');
  const [selectedDays, setSelectedDays] = useState([]);
  const [times, setTimes] = useState([{ time: '', dosage: '1 tablet' }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  
  // Date Picker State
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTimeIndex, setActiveTimeIndex] = useState(null);

  const frequencyOptions = [
    { id: 'daily', label: 'Her Gün' },
    { id: 'weekly', label: 'Gerektiğinde' },
    { id: 'custom', label: 'Özel' }
  ];

  const daysOfWeek = [
    { id: 'monday', label: 'Pzt' },
    { id: 'tuesday', label: 'Sl' },
    { id: 'wednesday', label: 'Çar' },
    { id: 'thursday', label: 'Per' },
    { id: 'friday', label: 'Cum' },
    { id: 'saturday', label: 'Cmt' },
    { id: 'sunday', label: 'Pzr' }
  ];

  const dosageOptions = ['1 tablet', '2 tablet', '1 kapsül', '2 kapsül', '5ml', '10ml'];

  useEffect(() => {
    if (frequency === 'daily') {
      setSelectedDays(daysOfWeek.map(day => day.id));
    }
  }, [frequency]);

  const handleDayToggle = (dayId) => {
    if (frequency === 'daily') {
      setFrequency('custom');
    }

    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(day => day !== dayId)
        : [...prev, dayId]
    );
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

  const handleFrequencyChange = (newFrequency) => {
    setFrequency(newFrequency);
    setShowFrequencyDropdown(false);

    if (newFrequency === 'custom') {
      setSelectedDays([]);
    }
    else if (newFrequency === 'daily') {
      setSelectedDays(daysOfWeek.map(day => day.id));
    }
    else if (newFrequency === 'weekly') {
      setSelectedDays([]);
    }
  };

  const handleBackPress = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      onBack();
      setIsProcessing(false);
    }, 200);
  };

  const handleClose = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      onClose();
      setIsProcessing(false);
    }, 200);
  };

  const isFormValid = () => {
    if (!frequency) return false;
    if (frequency === 'weekly') return true;
    if (selectedDays.length === 0) return false;
    const validTimes = times.filter(time => time.time.trim());
    if (validTimes.length === 0) return false;
    return true;
  };

  const handleAddMedicinePress = () => {
    if (isProcessing || !isFormValid()) return;

    setIsProcessing(true);
    const scheduleData = {
      frequency,
      selectedDays: frequency === 'weekly' ? [] : selectedDays,
      times: frequency === 'weekly' ? [] : times.filter(time => time.time.trim())
    };

    const completeMedicineData = {
      ...medicineData,
      schedule: scheduleData
    };

    setTimeout(() => {
      onAddMedicine(completeMedicineData);
      setIsProcessing(false);
    }, 200);
  };

  useEffect(() => {
    if (isOpen) {
      if (medicineData && medicineData.schedule) {
        const sched = medicineData.schedule;
        if (sched.selectedDays && sched.selectedDays.length === 7) {
          setFrequency('daily');
          setSelectedDays(daysOfWeek.map(day => day.id));
        } else if (!sched.selectedDays || sched.selectedDays.length === 0) {
          setFrequency('weekly');
          setSelectedDays([]);
        } else {
          setFrequency('custom');
          setSelectedDays(sched.selectedDays);
        }

        if (sched.times && sched.times.length > 0) {
          setTimes(sched.times.map(t => ({
            time: t.time,
            dosage: t.dosage || '1 tablet'
          })));
        } else {
          setTimes([{ time: '', dosage: '1 tablet' }]);
        }
      } else {
        setFrequency('daily');
        setSelectedDays(daysOfWeek.map(day => day.id));
        setTimes([{ time: '', dosage: '1 tablet' }]);
      }
      setShowFrequencyDropdown(false);
    }
  }, [isOpen, medicineData]);

  const onTimeSelected = (event, selectedDate) => {
    if (Platform.OS === 'android') {
        setShowTimePicker(false);
    }
    
    if (selectedDate && activeTimeIndex !== null) {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        handleTimeChange(activeTimeIndex, 'time', timeString);
    }
    
    if (Platform.OS === 'ios' && event.type === 'dismissed') {
        setShowTimePicker(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>İlaç Ekle</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.fieldContainer}>
              <Text style={styles.question}>Bunu Ne Zaman Alıyorsun?</Text>
              <TouchableOpacity
                style={styles.frequencyButton}
                onPress={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
              >
                <Text style={styles.frequencyText}>
                  {frequencyOptions.find(f => f.id === frequency)?.label || 'Her Gün'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {showFrequencyDropdown && (
                <View style={styles.dropdown}>
                  {frequencyOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.dropdownOption,
                        frequency === option.id && styles.selectedDropdownOption
                      ]}
                      onPress={() => handleFrequencyChange(option.id)}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        frequency === option.id && styles.selectedDropdownOptionText
                      ]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {frequency !== 'weekly' && (
              <View style={styles.fieldContainer}>
                <View style={styles.daysContainer}>
                  {daysOfWeek.map((day) => (
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
                      ]}>{day.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {frequency !== 'weekly' && (
              <View style={styles.fieldContainer}>
                <Text style={styles.question}>Saat Kaçta?</Text>
                {times.map((timeData, index) => (
                  <View key={index} style={styles.timeRow}>
                    <TouchableOpacity
                      style={styles.timeInput}
                      onPress={() => {
                        setActiveTimeIndex(index);
                        setShowTimePicker(true);
                      }}
                    >
                      <Text style={styles.timeText}>
                        {timeData.time || '00:00'}
                      </Text>
                    </TouchableOpacity>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dosageScroll}>
                        {dosageOptions.map((dosage) => (
                            <TouchableOpacity
                                key={dosage}
                                style={[
                                    styles.dosageOption,
                                    timeData.dosage === dosage && styles.selectedDosageOption
                                ]}
                                onPress={() => handleTimeChange(index, 'dosage', dosage)}
                            >
                                <Text style={[
                                    styles.dosageText,
                                    timeData.dosage === dosage && styles.selectedDosageText
                                ]}>{dosage}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {times.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeTimeButton}
                        onPress={() => handleRemoveTime(index)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ff4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <TouchableOpacity style={styles.addTimeButton} onPress={handleAddTime}>
                  <Ionicons name="add" size={20} color="#0171E4" />
                  <Text style={styles.addTimeText}>Bir zaman ekle</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.addButton,
                (!isFormValid() || isProcessing) && styles.disabledButton
              ]}
              onPress={handleAddMedicinePress}
              disabled={!isFormValid() || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.addButtonText}>İlacı Ekle</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {showTimePicker && (
            <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeSelected}
            />
          )}

           {/* iOS Specific Modal for DateTimePicker if needed, but default modal works usually */}
           {Platform.OS === 'ios' && showTimePicker && (
                <Modal visible={true} transparent={true} animationType="slide">
                    <View style={styles.iosPickerOverlay}>
                        <View style={styles.iosPickerContent}>
                            <View style={styles.iosPickerHeader}>
                                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                    <Text style={{ color: '#0171E4', fontSize: 16 }}>Bitti</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={new Date()}
                                mode="time"
                                is24Hour={true}
                                display="spinner"
                                onChange={onTimeSelected}
                                style={{ height: 200 }}
                            />
                        </View>
                    </View>
                </Modal>
           )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  backButton: {
    padding: 5,
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  frequencyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  frequencyText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedDropdownOption: {
    backgroundColor: '#f0f7ff',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  selectedDropdownOptionText: {
    color: '#0171E4',
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 80,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  dosageScroll: {
      flexGrow: 0,
  },
  dosageOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      marginRight: 8,
  },
  selectedDosageOption: {
      backgroundColor: '#0171E4',
      borderColor: '#0171E4',
  },
  dosageText: {
      fontSize: 12,
      color: '#666',
  },
  selectedDosageText: {
      color: '#fff',
  },
  removeTimeButton: {
    padding: 8,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  addTimeText: {
    color: '#0171E4',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  addButton: {
    backgroundColor: '#0171E4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  iosPickerOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iosPickerContent: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 20,
  },
  iosPickerHeader: {
      padding: 16,
      alignItems: 'flex-end',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
  }
});

export default AddMedicineScheduleModal;
