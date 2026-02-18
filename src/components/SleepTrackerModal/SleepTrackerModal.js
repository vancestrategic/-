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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

const SleepTrackerModal = ({ visible, onClose, onSave, initialHistory = [] }) => {
  const [bedTime, setBedTime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [activeTab, setActiveTab] = useState('add');

  // Set default times (Bed: 23:00 yesterday, Wake: 07:00 today)
  useEffect(() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 0, 0, 0);
      setBedTime(yesterday);

      const today = new Date();
      today.setHours(7, 0, 0, 0);
      setWakeTime(today);
  }, []);

  // Animation states
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
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

  const calculateDuration = () => {
      let diff = wakeTime - bedTime;
      if (diff < 0) {
          // If wake time is "before" bed time, assume next day
           diff += 24 * 60 * 60 * 1000;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return { hours, minutes, totalMs: diff };
  };

  const handleSave = () => {
    const duration = calculateDuration();
    onSave({
        bedTime,
        wakeTime,
        duration: `${duration.hours}s ${duration.minutes}dk`,
        date: new Date(), // Date of entry
    });
    onClose();
  };

  const onBedTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || bedTime;
    setShowBedTimePicker(Platform.OS === 'ios');
    setBedTime(currentDate);
    if (Platform.OS !== 'ios') setShowBedTimePicker(false);
  };

  const onWakeTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || wakeTime;
    setShowWakeTimePicker(Platform.OS === 'ios');
    setWakeTime(currentDate);
    if (Platform.OS !== 'ios') setShowWakeTimePicker(false);
  };

  const renderHistoryItem = ({ item }) => {
    const date = new Date(item.date);
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyDuration}>{item.duration}</Text>
          <Text style={styles.historyDate}>
            {date.toLocaleDateString('tr-TR')}
          </Text>
        </View>
        <View style={[styles.historyIconContainer, { backgroundColor: '#f3e5f5' }]}>
          <Ionicons name="moon" size={20} color="#9c27b0" />
        </View>
      </View>
    );
  };

  const duration = calculateDuration();

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
                  <Text style={styles.headerTitle}>Uyku Takibi</Text>
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
                     {/* Duration Display */}
                     <View style={styles.durationContainer}>
                         <Text style={styles.durationLabel}>Toplam Uyku</Text>
                         <Text style={styles.durationValue}>
                             {duration.hours}<Text style={styles.durationUnit}>sa</Text> {duration.minutes}<Text style={styles.durationUnit}>dk</Text>
                         </Text>
                     </View>

                    <View style={styles.timeInputsContainer}>
                      <View style={styles.timeField}>
                          <Text style={styles.label}>Yatış Saati</Text>
                          <TouchableOpacity 
                              style={styles.timeButton}
                              onPress={() => setShowBedTimePicker(true)}
                          >
                              <Ionicons name="moon-outline" size={24} color="#5e35b1" />
                              <Text style={styles.timeText}>
                                  {bedTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                          </TouchableOpacity>
                          {showBedTimePicker && (
                              <DateTimePicker
                                  value={bedTime}
                                  mode="time"
                                  display="default"
                                  onChange={onBedTimeChange}
                              />
                          )}
                      </View>

                      <View style={styles.divider}>
                          <Ionicons name="arrow-forward" size={20} color="#ccc" />
                      </View>

                      <View style={styles.timeField}>
                          <Text style={styles.label}>Uyanış Saati</Text>
                          <TouchableOpacity 
                              style={styles.timeButton}
                              onPress={() => setShowWakeTimePicker(true)}
                          >
                              <Ionicons name="sunny-outline" size={24} color="#f9a825" />
                              <Text style={styles.timeText}>
                                  {wakeTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                          </TouchableOpacity>
                          {showWakeTimePicker && (
                              <DateTimePicker
                                  value={wakeTime}
                                  mode="time"
                                  display="default"
                                  onChange={onWakeTimeChange}
                              />
                          )}
                      </View>
                    </View>

                    <View style={styles.footer}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
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
                        <Ionicons name="moon-outline" size={48} color="#ddd" />
                        <Text style={styles.emptyHistoryText}>Henüz uyku kaydı yok</Text>
                      </View>
                    )}
                  </View>
                )}
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
    flex: 1,
    gap: 20,
  },
  durationContainer: {
      alignItems: 'center',
      paddingVertical: 20,
      backgroundColor: '#f3e5f5',
      borderRadius: 20,
      marginBottom: 10,
  },
  durationLabel: {
      fontSize: 14,
      color: '#7b1fa2',
      fontFamily: 'PPNeueMontreal-Medium',
      marginBottom: 4,
  },
  durationValue: {
      fontSize: 36,
      fontWeight: '600',
      color: '#4a148c',
      fontFamily: 'PPNeueMontreal-Medium',
  },
  durationUnit: {
      fontSize: 20,
      fontWeight: '500',
  },
  timeInputsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  timeField: {
      flex: 1,
      alignItems: 'center',
  },
  label: {
      fontSize: 14,
      color: '#666',
      marginBottom: 8,
      fontFamily: 'PPNeueMontreal-Medium',
  },
  timeButton: {
      width: '100%',
      backgroundColor: '#f8f9fa',
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#eee',
      gap: 8,
  },
  timeText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      fontFamily: 'PPNeueMontreal-Medium',
  },
  divider: {
      paddingHorizontal: 10,
      paddingTop: 24,
  },
  footer: {
    marginTop: 'auto',
  },
  saveButton: {
    backgroundColor: '#9c27b0',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
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
  historyDuration: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Medium',
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

export default SleepTrackerModal;