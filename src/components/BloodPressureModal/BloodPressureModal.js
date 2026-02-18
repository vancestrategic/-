import React, { useState, useEffect, useRef } from 'react';
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
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

const BloodPressureModal = ({ visible, onClose, onSave, initialDate = new Date(), initialHistory = [] }) => {
  const [systolic, setSystolic] = useState(''); // Büyük Tansiyon
  const [diastolic, setDiastolic] = useState(''); // Küçük Tansiyon
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTab, setActiveTab] = useState('add');
  
  // Animation states
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      setDate(initialDate || new Date());
      setSystolic('');
      setDiastolic('');
      setActiveTab('add');
      
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
  }, [visible]);

  const handleSave = () => {
    if (systolic.trim() && diastolic.trim()) {
      onSave({
        systolic: parseInt(systolic, 10),
        diastolic: parseInt(diastolic, 10),
        date: date,
      });
      onClose();
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    const newDate = new Date(currentDate);
    newDate.setHours(date.getHours());
    newDate.setMinutes(date.getMinutes());
    setDate(newDate);
    
    if (Platform.OS !== 'ios') {
        setShowDatePicker(false);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(Platform.OS === 'ios');
    
    const newDate = new Date(date);
    newDate.setHours(currentTime.getHours());
    newDate.setMinutes(currentTime.getMinutes());
    setDate(newDate);

    if (Platform.OS !== 'ios') {
        setShowTimePicker(false);
    }
  };

  const renderHistoryItem = ({ item }) => {
    const itemDate = new Date(item.date);
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyValue}>
            {item.systolic}/{item.diastolic} <Text style={styles.historyUnit}>mmHg</Text>
          </Text>
          <Text style={styles.historyDate}>
            {itemDate.toLocaleDateString('tr-TR')} • {itemDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.historyIconContainer, { backgroundColor: '#ffebee' }]}>
          <Ionicons name="heart-outline" size={20} color="#f44336" />
        </View>
      </View>
    );
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
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Tansiyon Takibi</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#1e1f28" />
                  </TouchableOpacity>
                </View>

                <View style={styles.tabContainer}>
                  <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'add' && styles.activeTabButton]} 
                    onPress={() => setActiveTab('add')}
                  >
                    <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>Yeni Ekle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]} 
                    onPress={() => setActiveTab('history')}
                  >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Geçmiş</Text>
                  </TouchableOpacity>
                </View>

                {activeTab === 'add' ? (
                  <View style={styles.content}>
                    <View style={styles.inputsRow}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Büyük (Sistolik)</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                              style={styles.input}
                              placeholder="120"
                              placeholderTextColor="#999"
                              value={systolic}
                              onChangeText={setSystolic}
                              keyboardType="numeric"
                              maxLength={3}
                            />
                            <Text style={styles.unit}>mmHg</Text>
                        </View>
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Küçük (Diastolik)</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                              style={styles.input}
                              placeholder="80"
                              placeholderTextColor="#999"
                              value={diastolic}
                              onChangeText={setDiastolic}
                              keyboardType="numeric"
                              maxLength={3}
                            />
                            <Text style={styles.unit}>mmHg</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.dateTimeContainer}>
                      <View style={styles.dateTimeField}>
                          <Text style={styles.label}>Tarih</Text>
                          <TouchableOpacity 
                              style={styles.dateButton}
                              onPress={() => setShowDatePicker(true)}
                          >
                              <Ionicons name="calendar-outline" size={20} color="#0171E4" />
                              <Text style={styles.dateText}>
                                  {date.toLocaleDateString('tr-TR')}
                              </Text>
                          </TouchableOpacity>
                          {showDatePicker && Platform.OS === 'ios' && (
                              <DateTimePicker
                                  value={date}
                                  mode="date"
                                  display="default"
                                  onChange={onDateChange}
                                  style={{ width: '100%', marginTop: 8 }}
                              />
                          )}
                      </View>

                      <View style={styles.dateTimeField}>
                          <Text style={styles.label}>Saat</Text>
                          <TouchableOpacity 
                              style={styles.dateButton}
                              onPress={() => setShowTimePicker(true)}
                          >
                              <Ionicons name="time-outline" size={20} color="#0171E4" />
                              <Text style={styles.dateText}>
                                  {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                          </TouchableOpacity>
                          {showTimePicker && Platform.OS === 'ios' && (
                              <DateTimePicker
                                  value={date}
                                  mode="time"
                                  display="default"
                                  onChange={onTimeChange}
                                  style={{ width: '100%', marginTop: 8 }}
                              />
                          )}
                      </View>
                    </View>

                    <View style={styles.footer}>
                      <TouchableOpacity
                        style={[styles.saveButton, (!systolic.trim() || !diastolic.trim()) && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={!systolic.trim() || !diastolic.trim()}
                      >
                        <Text style={styles.saveButtonText}>Kaydet</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.historyContainer}>
                    {initialHistory && initialHistory.length > 0 ? (
                      <FlatList
                        data={[...initialHistory].sort((a, b) => new Date(b.date) - new Date(a.date))}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderHistoryItem}
                        contentContainerStyle={styles.historyListContent}
                        showsVerticalScrollIndicator={false}
                      />
                    ) : (
                      <View style={styles.emptyHistoryState}>
                        <Ionicons name="heart-outline" size={48} color="#ddd" />
                        <Text style={styles.emptyHistoryText}>Henüz kayıtlı veri yok</Text>
                      </View>
                    )}
                  </View>
                )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  activeTabText: {
    color: '#1e1f28',
    fontWeight: '600',
  },
  content: {
    gap: 24,
    flex: 1,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'PPNeueMontreal-Medium',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  unit: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  dateTimeField: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cce5ff',
  },
  dateText: {
    fontSize: 14,
    color: '#0171E4',
    fontWeight: '500',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  footer: {
    marginTop: 'auto',
  },
  saveButton: {
    backgroundColor: '#0171E4',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  historyContainer: {
    flex: 1,
  },
  historyListContent: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyInfo: {
    gap: 4,
  },
  historyValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  historyUnit: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  historyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistoryState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'PPNeueMontreal-Regular',
  },
});

export default BloodPressureModal;