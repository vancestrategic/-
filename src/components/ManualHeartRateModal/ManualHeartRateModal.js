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
  FlatList,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const ManualHeartRateModal = ({ visible, onClose, onSave, initialDate = new Date(), initialHistory = [] }) => {
  const [bpm, setBpm] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'history'
  
  // Animation states
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      setDate(initialDate || new Date());
      setBpm('');
      setActiveTab('add'); // Reset to add tab on open
      
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
  }, [visible, initialDate]);

  const handleSave = () => {
    if (bpm.trim()) {
      onSave({
        bpm: parseInt(bpm, 10),
        date: date,
      });
      onClose();
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    // Keep time part of original date
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
          <Text style={styles.historyBpm}>{item.bpm} <Text style={styles.historyBpmUnit}>BPM</Text></Text>
          <Text style={styles.historyDate}>
            {itemDate.toLocaleDateString('tr-TR')} • {itemDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.historyIconContainer}>
          <Ionicons name="heart" size={20} color="#F44336" />
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
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Kalp Atışı</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#1e1f28" />
                  </TouchableOpacity>
                </View>

                {/* Tabs */}
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

                {/* Content */}
                {activeTab === 'add' ? (
                  <View style={styles.content}>
                    {/* BPM Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Nabız (BPM)</Text>
                      <View style={styles.bpmInputWrapper}>
                          <TextInput
                          style={styles.bpmInput}
                          placeholder="Örn: 72"
                          placeholderTextColor="#999"
                          value={bpm}
                          onChangeText={setBpm}
                          keyboardType="numeric"
                          maxLength={3}
                          autoFocus={false}
                          />
                          <Text style={styles.bpmUnit}>BPM</Text>
                      </View>
                    </View>

                    {/* Date & Time Selection */}
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
                          {showDatePicker && Platform.OS !== 'ios' && (
                              <DateTimePicker
                                  value={date}
                                  mode="date"
                                  display="default"
                                  onChange={onDateChange}
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
                          {showTimePicker && Platform.OS !== 'ios' && (
                              <DateTimePicker
                                  value={date}
                                  mode="time"
                                  display="default"
                                  onChange={onTimeChange}
                              />
                          )}
                      </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                      <TouchableOpacity
                        style={[styles.saveButton, !bpm.trim() && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={!bpm.trim()}
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
                        <Ionicons name="fitness-outline" size={48} color="#ddd" />
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
    height: height * 0.7, // Fixed height for tab navigation
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
  inputContainer: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'PPNeueMontreal-Medium',
    marginBottom: 8,
  },
  bpmInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  bpmInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '600',
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  bpmUnit: {
    fontSize: 16,
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
    marginTop: 'auto', // Push to bottom
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
  historyBpm: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  historyBpmUnit: {
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
    backgroundColor: '#ffebee',
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

export default ManualHeartRateModal;