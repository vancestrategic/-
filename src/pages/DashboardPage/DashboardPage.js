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
  ScrollView,
  FlatList,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../../contexts/ToastContext';
import { smtiaApi } from '../../services/smtiaApi';
import { NotificationService } from '../../services/NotificationService';
import * as Notifications from 'expo-notifications';

// Components
import AddMedicineModal from '../../components/AddMedicineModal/AddMedicineModal';
import AddMedicineScheduleModal from '../../components/AddMedicineScheduleModal/AddMedicineScheduleModal';
import SideEffectModal from '../../components/SideEffectModal/SideEffectModal';
import AIChatModal from '../../components/AIChatModal/AIChatModal';
import HealthCardModal from '../../components/HealthCardModal/HealthCardModal';
import ManualHeartRateModal from '../../components/ManualHeartRateModal/ManualHeartRateModal';
import BloodPressureModal from '../../components/BloodPressureModal/BloodPressureModal';
import WaterTrackerModal from '../../components/WaterTrackerModal/WaterTrackerModal';
import SleepTrackerModal from '../../components/SleepTrackerModal/SleepTrackerModal';
// HeartRateModal removed for reliability reasons
// import HeartRateModal from '../../components/HeartRateModal/HeartRateModal';

// Assets
const profileIcon = require('../../assets/icons/profile.png');
const notificationIcon = require('../../assets/icons/natifications.png');
const healthyIcon = require('../../assets/images/capsule.png'); // Placeholder

const { width, height } = Dimensions.get('window');

const DashboardPage = ({ navigation }) => {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userName, setUserName] = useState('Kullanıcı');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Notification & Profile State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isBlurEnabled, setIsBlurEnabled] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'İlaç saatiniz yaklaşıyor: Parol', time: '10:00', read: false },
    { id: 2, message: 'Günlük su hedefinize ulaşmanıza az kaldı!', time: '09:30', read: true },
  ]);

  // Modals State
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSideEffectModal, setShowSideEffectModal] = useState(false);
  const [showAIChatModal, setShowAIChatModal] = useState(false);
  const [showHealthCardModal, setShowHealthCardModal] = useState(false);
  const [showManualHeartRateModal, setShowManualHeartRateModal] = useState(false);
  const [showBloodPressureModal, setShowBloodPressureModal] = useState(false);
  const [showWaterTrackerModal, setShowWaterTrackerModal] = useState(false);
  const [showSleepTrackerModal, setShowSleepTrackerModal] = useState(false);
  // const [showHeartRateModal, setShowHeartRateModal] = useState(false);
  const [currentMedicineData, setCurrentMedicineData] = useState(null);
  
  // Map State
  const [location, setLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);

  // Health Stats
  const [bmi, setBmi] = useState('--');
  const [bodyFat, setBodyFat] = useState('24.5');
  const [interactionRisk, setInteractionRisk] = useState(2);
  const [waterIntake, setWaterIntake] = useState(0);
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const [bloodPressureHistory, setBloodPressureHistory] = useState([]);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [dailyWaterIntake, setDailyWaterIntake] = useState(0);

  // Daily Checklist State
  const [takenMedicines, setTakenMedicines] = useState({});

  // Side Effect State
  const [sideEffects, setSideEffects] = useState([]);

  // FAB Animation
  const [isFabOpen, setIsFabOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleFab = () => {
    const toValue = isFabOpen ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    
    setIsFabOpen(!isFabOpen);
  };

  const fabAiStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
    opacity: animation,
  };

  /* Heart Rate FAB Style Removed
  const fabHeartStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
    opacity: animation,
  };
  */

  const fabRotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  useEffect(() => {
    loadUserData();
    loadMedicines();
    getLocation();
    loadTakenMedicines();
    loadSideEffects();
    loadHeartRateHistory();
    loadBloodPressureHistory();
    loadSleepHistory();
    loadWaterIntake();
    
    // Request notification permissions on mount
    NotificationService.requestPermissions();

    return () => {};
  }, []);

  const loadSideEffects = async () => {
    try {
      const storedEffects = await AsyncStorage.getItem('userSideEffects');
      if (storedEffects) {
        setSideEffects(JSON.parse(storedEffects));
      }
    } catch (error) {
      console.error('Error loading side effects:', error);
    }
  };

  const loadHeartRateHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('userHeartRateHistory');
      if (storedHistory) {
        setHeartRateHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Error loading heart rate history:', error);
    }
  };

  const loadBloodPressureHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('userBloodPressureHistory');
        if (storedHistory) {
          setBloodPressureHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Error loading BP history:', error);
      }
  };

  const loadSleepHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('userSleepHistory');
        if (storedHistory) {
          setSleepHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Error loading sleep history:', error);
      }
  };

  const loadWaterIntake = async () => {
      try {
        const todayKey = `waterIntake_${new Date().toDateString()}`;
        const storedIntake = await AsyncStorage.getItem(todayKey);
        if (storedIntake) {
          setDailyWaterIntake(parseInt(storedIntake, 10));
        } else {
            setDailyWaterIntake(0);
        }
      } catch (error) {
        console.error('Error loading water intake:', error);
      }
  };

  const loadTakenMedicines = async () => {
    try {
      const storedTaken = await AsyncStorage.getItem('takenMedicines');
      if (storedTaken) {
        setTakenMedicines(JSON.parse(storedTaken));
      }
    } catch (error) {
      console.error('Error loading taken medicines:', error);
    }
  };

  const toggleMedicineTaken = async (medicineId) => {
    const dateKey = selectedDate.toDateString();
    const currentTaken = takenMedicines[dateKey] || [];
    let newTakenForDate;

    if (currentTaken.includes(medicineId)) {
      newTakenForDate = currentTaken.filter(id => id !== medicineId);
    } else {
      newTakenForDate = [...currentTaken, medicineId];
    }

    const newTakenMedicines = {
      ...takenMedicines,
      [dateKey]: newTakenForDate
    };

    setTakenMedicines(newTakenMedicines);
    await AsyncStorage.setItem('takenMedicines', JSON.stringify(newTakenMedicines));
    
    if (newTakenForDate.includes(medicineId)) {
        showToast('İlaç alındı olarak işaretlendi', 'success');
    }
  };

  const toggleNotificationRead = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const loadUserData = async () => {
    try {
      // Simulate loading user data
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
      
      const storedBmi = await AsyncStorage.getItem('userBMI');
      if (storedBmi) setBmi(storedBmi);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const storedMedicines = await AsyncStorage.getItem('userMedicines');
      if (storedMedicines) {
        setMedicines(JSON.parse(storedMedicines));
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Konum izni reddedildi', 'error');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Mock finding pharmacies
      findPharmacies(location.coords);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const findPharmacies = async (coords) => {
    try {
      // Overpass API query for pharmacies around the location (5km radius)
      // [out:json];node(around:5000,${coords.latitude},${coords.longitude})["amenity"="pharmacy"];out;
      const query = `[out:json];node(around:5000,${coords.latitude},${coords.longitude})["amenity"="pharmacy"];out;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        const realPharmacies = data.elements.map(element => ({
          id: element.id,
          name: element.tags.name || 'Eczane',
          latitude: element.lat,
          longitude: element.lon,
        })).slice(0, 10); // Limit to 10 closest

        setPharmacies(realPharmacies);
      } else {
        // Fallback to mock data if no pharmacies found or API fails
        console.log('No pharmacies found via API, using mock data');
        setPharmacies([
          { id: 1, name: 'Merkez Eczanesi', latitude: coords.latitude + 0.002, longitude: coords.longitude + 0.002 },
          { id: 2, name: 'Şifa Eczanesi', latitude: coords.latitude - 0.002, longitude: coords.longitude - 0.001 },
          { id: 3, name: 'Hayat Eczanesi', latitude: coords.latitude + 0.001, longitude: coords.longitude - 0.003 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      // Fallback to mock data on error
       setPharmacies([
          { id: 1, name: 'Merkez Eczanesi', latitude: coords.latitude + 0.002, longitude: coords.longitude + 0.002 },
          { id: 2, name: 'Şifa Eczanesi', latitude: coords.latitude - 0.002, longitude: coords.longitude - 0.001 },
          { id: 3, name: 'Hayat Eczanesi', latitude: coords.latitude + 0.001, longitude: coords.longitude - 0.003 },
        ]);
    }
  };

  // Medicine Management
  const handleAddMedicineOpen = () => {
    setCurrentMedicineData(null);
    setShowAddMedicineModal(true);
  };

  const handleMedicineDataNext = (data) => {
    setCurrentMedicineData(data);
    setShowAddMedicineModal(false);
    // Add a small delay to allow the first modal to close/animate out before opening the second one
    setTimeout(() => {
      setShowScheduleModal(true);
    }, 300);
  };

  const handleScheduleBack = () => {
    setShowScheduleModal(false);
    setTimeout(() => {
      setShowAddMedicineModal(true);
    }, 300);
  };

  const handleAddMedicineComplete = async (finalData) => {
    try {
      // Schedule notifications if times are set
      let notificationIds = [];
      if (finalData.schedule && finalData.schedule.times) {
        for (const timeObj of finalData.schedule.times) {
          if (timeObj.time) {
            const id = await NotificationService.scheduleMedicineNotification(
              finalData.name,
              timeObj.time,
              finalData.id
            );
            notificationIds.push(id);
          }
        }
      }

      const medicineWithNotifications = {
        ...finalData,
        id: Date.now(),
        notificationIds // Save these to cancel later if needed
      };

      const newMedicines = [...medicines, medicineWithNotifications];
      setMedicines(newMedicines);
      await AsyncStorage.setItem('userMedicines', JSON.stringify(newMedicines));
      
      setShowScheduleModal(false);
      showToast('İlaç başarıyla eklendi ve hatırlatıcı kuruldu', 'success');
    } catch (error) {
      console.error(error);
      showToast('İlaç eklenirken hata oluştu', 'error');
    }
  };

  const handleRemoveMedicine = async (id) => {
      Alert.alert(
          "İlacı Sil",
          "Bu ilacı silmek istediğinize emin misiniz?",
          [
              { text: "İptal", style: "cancel" },
              { text: "Sil", style: "destructive", onPress: async () => {
                  const medicineToDelete = medicines.find(m => m.id === id);
                  
                  // Cancel notifications if any
                  if (medicineToDelete && medicineToDelete.notificationIds) {
                    for (const notifId of medicineToDelete.notificationIds) {
                      await NotificationService.cancelNotification(notifId);
                    }
                  }

                  const newMedicines = medicines.filter(m => m.id !== id);
                  setMedicines(newMedicines);
                  await AsyncStorage.setItem('userMedicines', JSON.stringify(newMedicines));
                  showToast('İlaç silindi', 'success');
              }}
          ]
      );
  };

  // Render Helpers
  const renderDateItem = ({ item }) => {
    const isSelected = item.toDateString() === selectedDate.toDateString();
    const dayName = item.toLocaleDateString('tr-TR', { weekday: 'short' });
    const dayNumber = item.getDate();
    
    return (
      <TouchableOpacity 
        style={[styles.dateItem, isSelected && styles.selectedDateItem]}
        onPress={() => setSelectedDate(item)}
      >
        <Text style={[styles.dayName, isSelected && styles.selectedDateText]}>{dayName}</Text>
        <Text style={[styles.dayNumber, isSelected && styles.selectedDateText]}>{dayNumber}</Text>
      </TouchableOpacity>
    );
  };

  // Generate dates
  const dates = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  // Filter medicines based on selected date
  const filteredMedicines = React.useMemo(() => {
    if (!medicines.length) return [];
    
    const getDayId = (date) => {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return days[date.getDay()];
    };
    
    const dayId = getDayId(selectedDate);
    
    return medicines.filter(medicine => {
      if (!medicine.schedule) return false;
      
      // Daily: Always show
      if (medicine.schedule.frequency === 'daily') return true;
      
      // Custom: Check if day is selected
      if (medicine.schedule.frequency === 'custom') {
        return medicine.schedule.selectedDays?.includes(dayId);
      }
      
      // Weekly (As needed): Usually PRN. 
      // User wants to see medicines that *must* be taken today.
      // PRN medicines are not mandatory for a specific day, so we exclude them from the schedule view.
      if (medicine.schedule.frequency === 'weekly') return false;
      
      return false;
    });
  }, [medicines, selectedDate]);

  const BlurOverlay = ({ children, style }) => (
    <View style={[style, { position: 'relative', overflow: 'hidden' }]}>
      {children}
      {isBlurEnabled && (
        <BlurView 
          intensity={60} 
          tint="light" 
          style={[
            StyleSheet.absoluteFill, 
            { 
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              zIndex: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }
          ]} 
        >
          <Ionicons name="eye-off-outline" size={16} color="#ccc" style={{ opacity: 0.6 }} />
        </BlurView>
      )}
    </View>
  );

  const handleSaveSideEffect = async (data) => {
    try {
      const newEffects = [data, ...sideEffects];
      setSideEffects(newEffects);
      await AsyncStorage.setItem('userSideEffects', JSON.stringify(newEffects));
      
      console.log('Side Effect Reported:', data);
      setShowSideEffectModal(false);
      showToast('Yan etki bildirimi alındı', 'success');
    } catch (error) {
      showToast('Yan etki kaydedilirken hata oluştu', 'error');
    }
  };

  const handleSaveHeartRate = async (data) => {
    try {
      // Save to AsyncStorage
      const existingData = await AsyncStorage.getItem('userHeartRateHistory');
      const history = existingData ? JSON.parse(existingData) : [];
      const newEntry = { ...data, id: Date.now() };
      history.push(newEntry);
      
      await AsyncStorage.setItem('userHeartRateHistory', JSON.stringify(history));
      setHeartRateHistory(history);
      
      setShowManualHeartRateModal(false);
      showToast(`Nabız kaydedildi: ${data.bpm} BPM`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Kaydedilirken hata oluştu', 'error');
    }
  };

  const handleSaveBloodPressure = async (data) => {
    try {
      const existingData = await AsyncStorage.getItem('userBloodPressureHistory');
      const history = existingData ? JSON.parse(existingData) : [];
      const newEntry = { ...data, id: Date.now() };
      history.push(newEntry);
      
      await AsyncStorage.setItem('userBloodPressureHistory', JSON.stringify(history));
      setBloodPressureHistory(history);
      
      setShowBloodPressureModal(false);
      showToast('Tansiyon kaydedildi', 'success');
    } catch (error) {
      console.error(error);
      showToast('Hata oluştu', 'error');
    }
  };

  const handleSaveWaterIntake = async (amount) => {
      try {
          const todayKey = `waterIntake_${new Date().toDateString()}`;
          await AsyncStorage.setItem(todayKey, amount.toString());
          setDailyWaterIntake(amount);
          // Don't close modal here, user might want to see update
          // setShowWaterTrackerModal(false); 
          showToast('Su tüketimi güncellendi', 'success');
      } catch (error) {
          console.error(error);
      }
  };

  const handleSaveSleep = async (data) => {
    try {
      const existingData = await AsyncStorage.getItem('userSleepHistory');
      const history = existingData ? JSON.parse(existingData) : [];
      const newEntry = { ...data, id: Date.now() };
      history.push(newEntry);
      
      await AsyncStorage.setItem('userSleepHistory', JSON.stringify(history));
      setSleepHistory(history);
      
      setShowSleepTrackerModal(false);
      showToast(`Uyku süresi kaydedildi: ${data.duration}`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Hata oluştu', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Merhaba,</Text>
          <BlurOverlay style={{ alignSelf: 'flex-start', borderRadius: 4 }}>
             <Text style={styles.userName}>{userName}</Text>
          </BlurOverlay>
        </View>
        
        <View style={styles.headerRight}>
          {/* Blur Button */}
          <View style={styles.headerIconWrapper}>
            <TouchableOpacity 
              style={[styles.headerButton, isBlurEnabled && styles.activeHeaderButton]} 
              onPress={() => setIsBlurEnabled(!isBlurEnabled)}
            >
              <Ionicons 
                name={isBlurEnabled ? "eye-off" : "eye-outline"} 
                size={20} 
                color={isBlurEnabled ? "#666" : "#666"} 
              />
            </TouchableOpacity>
          </View>

          {/* Notification Button */}
          <View style={styles.headerIconWrapper}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => {
                setShowNotifications(!showNotifications);
                setShowProfileDropdown(false);
              }}
            >
              <Image source={notificationIcon} style={styles.headerIcon} resizeMode="contain" />
              {notifications.some(n => !n.read) && <View style={styles.notificationBadge} />}
            </TouchableOpacity>

            {/* Notification Dropdown */}
            {showNotifications && (
              <View style={styles.dropdownContainer}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownTitle}>Bildirimler</Text>
                  <TouchableOpacity onPress={() => setShowNotifications(false)}>
                    <Ionicons name="close" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <TouchableOpacity 
                      key={notification.id} 
                      style={[styles.notificationItem, notification.read && { opacity: 0.6 }]}
                      onPress={() => toggleNotificationRead(notification.id)}
                    >
                      <View style={[styles.notificationDot, !notification.read && styles.notificationDotUnread]} />
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationMessage}>{notification.message}</Text>
                        <Text style={styles.notificationTime}>{notification.time}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyDropdownText}>Bildiriminiz yok</Text>
                )}
              </View>
            )}
          </View>

          {/* Profile Button */}
          <View style={styles.headerIconWrapper}>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifications(false);
              }}
            >
              <Image source={profileIcon} style={styles.profileIcon} resizeMode="contain" />
            </TouchableOpacity>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <View style={[styles.dropdownContainer, styles.profileDropdownContainer]}>
                <TouchableOpacity style={[styles.dropdownItem, styles.logoutItem]} onPress={() => navigation.replace('Intro')}>
                  <Ionicons name="log-out-outline" size={20} color="#F44336" />
                  <Text style={[styles.dropdownItemText, styles.logoutText]}>Çıkış Yap</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        
        {/* Date Selector - Separated from Navbar */}
        <View style={styles.dateSelectorContainer}>
          <FlatList
            horizontal
            data={dates}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.toISOString()}
            contentContainerStyle={styles.dateListContent}
            renderItem={renderDateItem}
          />
        </View>

        {/* Daily Checklist Section */}
        {filteredMedicines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Günlük Takip</Text>
            
            <View style={styles.checklistContainer}>
              {filteredMedicines.map((medicine) => {
                const dateKey = selectedDate.toDateString();
                const isTaken = (takenMedicines[dateKey] || []).includes(medicine.id);
                
                return (
                  <TouchableOpacity 
                    key={medicine.id} 
                    style={[styles.checklistItem, isTaken && styles.checklistItemTaken]}
                    onPress={() => toggleMedicineTaken(medicine.id)}
                  >
                    <View style={styles.checklistInfo}>
                      <View style={[styles.checklistIconContainer, isTaken && styles.checklistIconContainerTaken]}>
                        <Image 
                          source={require('../../assets/images/capsule-type-1.png')} 
                          style={[styles.checklistIcon, isTaken && { opacity: 0.5 }]} 
                          resizeMode="contain"
                        />
                      </View>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        {isBlurEnabled ? (
                           <BlurOverlay style={{ borderRadius: 8, padding: 8, marginHorizontal: -8 }}>
                             <Text style={[styles.checklistTitle, styles.blurredText]}>{medicine.name}</Text>
                             <Text style={[styles.checklistSubtitle, styles.blurredText, { marginTop: 4 }]}>
                               {medicine.dose?.amount} {medicine.dose?.unit} • {medicine.schedule?.times?.[0]?.time || 'Zaman belirtilmedi'}
                             </Text>
                           </BlurOverlay>
                        ) : (
                          <View>
                            <Text style={[styles.checklistTitle, isTaken && styles.checklistTextTaken]}>{medicine.name}</Text>
                            <Text style={styles.checklistSubtitle}>
                              {medicine.dose?.amount} {medicine.dose?.unit} • {medicine.schedule?.times?.[0]?.time || 'Zaman belirtilmedi'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <View style={[styles.checkbox, isTaken && styles.checkboxTaken]}>
                      {isTaken && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Medicines Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>İlaçlarım</Text>
            <TouchableOpacity onPress={handleAddMedicineOpen}>
              <Text style={styles.seeAllText}>+ Ekle</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
              <ActivityIndicator size="small" color="#0171E4" />
          ) : filteredMedicines.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicineList}>
              {filteredMedicines.map((medicine) => (
                <TouchableOpacity 
                    key={medicine.id} 
                    style={styles.medicineCard}
                    onLongPress={() => handleRemoveMedicine(medicine.id)}
                >
                  <View style={styles.medicineIconContainer}>
                      <Image 
                        source={require('../../assets/images/capsule-type-1.png')} 
                        style={styles.medicineCardIcon} 
                        resizeMode="contain"
                      />
                  </View>
                  
                  {isBlurEnabled ? (
                    <BlurOverlay style={{ borderRadius: 8, width: '100%', padding: 4 }}>
                      <Text style={[styles.medicineName, styles.blurredText]} numberOfLines={1}>{medicine.name}</Text>
                      <Text style={[styles.medicineDose, styles.blurredText, { marginTop: 4 }]}>
                        {medicine.dose?.amount} {medicine.dose?.unit}
                      </Text>
                      {medicine.schedule?.times?.[0]?.time && (
                         <Text style={[styles.medicineTime, styles.blurredText, { marginTop: 4 }]}>{medicine.schedule.times[0].time}</Text>
                      )}
                    </BlurOverlay>
                  ) : (
                    <>
                      <Text style={styles.medicineName} numberOfLines={1}>{medicine.name}</Text>
                      <Text style={styles.medicineDose}>{medicine.dose?.amount} {medicine.dose?.unit}</Text>
                      {/* Show time if available for today */}
                      {medicine.schedule?.times?.[0]?.time && (
                         <Text style={styles.medicineTime}>{medicine.schedule.times[0].time}</Text>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={32} color="#ccc" />
              <Text style={styles.emptyStateText}>
                 {medicines.length > 0 
                   ? "Bu gün için ilaç bulunmuyor" 
                   : "Henüz ilaç eklemediniz."}
              </Text>
              <TouchableOpacity style={styles.addMedicineButton} onPress={handleAddMedicineOpen}>
                <Text style={styles.addMedicineButtonText}>İlaç Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Map Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yakındaki Eczaneler</Text>
          <View style={styles.mapContainer}>
            {location ? (
                <MapView
                    style={styles.map}
                    region={mapRegion}
                    showsUserLocation={true}
                >
                    {pharmacies.map(pharmacy => (
                        <Marker
                            key={pharmacy.id}
                            coordinate={{ latitude: pharmacy.latitude, longitude: pharmacy.longitude }}
                            title={pharmacy.name}
                        />
                    ))}
                </MapView>
            ) : (
                <View style={styles.mapPlaceholder}>
                    <ActivityIndicator size="large" color="#0171E4" />
                    <Text style={styles.mapLoadingText}>Konum alınıyor...</Text>
                </View>
            )}
          </View>
        </View>

        {/* Health Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sağlık Durumu</Text>
          
          {/* New Stats Cards */}
          <View style={styles.newStatsRow}>
            {/* Body Fat Card */}
            <View style={styles.newStatCard}>
              <View style={styles.newStatHeader}>
                <View>
                  <Text style={styles.newStatTitle}>Vücut Yağ</Text>
                  <Text style={styles.newStatTitle}>İndeksin</Text>
                </View>
                <BlurOverlay style={{ borderRadius: 4 }}>
                  <Text style={styles.newStatBigValue}>{bodyFat}</Text>
                </BlurOverlay>
              </View>
              
              <View style={styles.bodyFatBarContainer}>
                <View style={[styles.bodyFatSegment, { backgroundColor: '#64B5F6', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
                <View style={[styles.bodyFatSegment, { backgroundColor: '#81C784' }]} />
                <View style={[styles.bodyFatSegment, { backgroundColor: '#FFB74D' }]} />
                <View style={[styles.bodyFatSegment, { backgroundColor: '#E57373', borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
                
                {/* Indicator Line */}
                <View style={[styles.bodyFatIndicator, { left: '35%' }]} />
              </View>
              
              <Text style={styles.bodyFatStatus}>
                İdeal <Text style={{ color: '#4CAF50', fontWeight: '600' }}>Kilodasın</Text>
              </Text>
            </View>

            {/* Interaction Risk Card */}
            <View style={[styles.newStatCard, { backgroundColor: '#F1F8E9' }]}>
              <View style={styles.newStatHeader}>
                <View>
                  <Text style={styles.newStatTitle}>Etkileşim</Text>
                  <Text style={styles.newStatTitle}>Riski</Text>
                </View>
                <BlurOverlay style={{ borderRadius: 4 }}>
                  <Text style={[styles.newStatBigValue, { color: '#558B2F' }]}>%{interactionRisk}</Text>
                </BlurOverlay>
              </View>
              
              <View style={styles.interactionGraphContainer}>
                {/* Simulated Wave Graph */}
                <View style={styles.graphBarsContainer}>
                  {[30, 45, 35, 60, 50, 75, 65, 80, 55, 40, 60, 45, 30, 50, 40].map((height, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.graphBar, 
                        { 
                          height: `${height}%`,
                          backgroundColor: height > 70 ? '#FF7043' : height > 50 ? '#9CCC65' : '#DCEDC8',
                          opacity: 0.8
                        }
                      ]} 
                    />
                  ))}
                </View>
                {/* Base Line */}
                <View style={styles.graphBaseLine} />
              </View>
              
              <Text style={styles.interactionStatus}>
                Risk Seviyesi: <Text style={{ color: '#558B2F', fontWeight: '600' }}>Düşük</Text>
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard} onPress={() => setShowSideEffectModal(true)}>
              <View style={[styles.statIconContainer, { backgroundColor: '#ffebee' }]}>
                <Ionicons name="warning-outline" size={24} color="#f44336" />
              </View>
              <Text style={styles.statValue}>Yan Etki</Text>
              <Text style={styles.statLabel}>Bildir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statCard} onPress={() => setShowHealthCardModal(true)}>
              <View style={[styles.statIconContainer, { backgroundColor: '#e0f2f1' }]}>
                <Ionicons name="card-outline" size={24} color="#009688" />
              </View>
              <Text style={styles.statValue}>Kart</Text>
              <Text style={styles.statLabel}>Sağlık Kartı</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} onPress={() => setShowManualHeartRateModal(true)}>
              <View style={[styles.statIconContainer, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="fitness-outline" size={24} color="#2196f3" />
              </View>
              <BlurOverlay style={{ borderRadius: 4, marginBottom: 4 }}>
                <Text style={styles.statValue}>{bmi}</Text>
              </BlurOverlay>
              <Text style={styles.statLabel}>BMI</Text>
            </TouchableOpacity>
          </View>

          {/* Second Row of Stats */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard} onPress={() => setShowBloodPressureModal(true)}>
              <View style={[styles.statIconContainer, { backgroundColor: '#ffebee' }]}>
                <Ionicons name="heart-outline" size={24} color="#f44336" />
              </View>
              <Text style={styles.statValue}>Tansiyon</Text>
              <Text style={styles.statLabel}>Takibi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statCard} onPress={() => setShowWaterTrackerModal(true)}>
              <View style={[styles.statIconContainer, { backgroundColor: '#e1f5fe' }]}>
                <Ionicons name="water" size={24} color="#039be5" />
              </View>
              <Text style={styles.statValue}>{Math.round((dailyWaterIntake / 2500) * 100)}%</Text>
              <Text style={styles.statLabel}>Su</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} onPress={() => setShowSleepTrackerModal(true)}>
              <View style={[styles.statIconContainer, { backgroundColor: '#f3e5f5' }]}>
                <Ionicons name="moon-outline" size={24} color="#9c27b0" />
              </View>
              <Text style={styles.statValue}>Uyku</Text>
              <Text style={styles.statLabel}>Takibi</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Modals */}
      <AddMedicineModal 
        isOpen={showAddMedicineModal}
        onClose={() => setShowAddMedicineModal(false)}
        onNext={handleMedicineDataNext}
        initialData={currentMedicineData}
      />
      
      <AddMedicineScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onBack={handleScheduleBack}
        onAddMedicine={handleAddMedicineComplete}
        medicineData={currentMedicineData}
      />

      <AIChatModal
        visible={showAIChatModal}
        onClose={() => setShowAIChatModal(false)}
      />

      <SideEffectModal
        isOpen={showSideEffectModal}
        onClose={() => setShowSideEffectModal(false)}
        onSave={handleSaveSideEffect}
        pastSideEffects={sideEffects}
      />

      <HealthCardModal
        visible={showHealthCardModal}
        onClose={() => setShowHealthCardModal(false)}
        onSave={() => showToast('Sağlık kartı güncellendi', 'success')}
      />

      <ManualHeartRateModal
        visible={showManualHeartRateModal}
        onClose={() => setShowManualHeartRateModal(false)}
        onSave={handleSaveHeartRate}
        initialDate={selectedDate}
        initialHistory={heartRateHistory}
      />

      <BloodPressureModal
        visible={showBloodPressureModal}
        onClose={() => setShowBloodPressureModal(false)}
        onSave={handleSaveBloodPressure}
        initialHistory={bloodPressureHistory}
      />

      <WaterTrackerModal
        visible={showWaterTrackerModal}
        onClose={() => setShowWaterTrackerModal(false)}
        onSave={handleSaveWaterIntake}
        currentIntake={dailyWaterIntake}
      />

      <SleepTrackerModal
        visible={showSleepTrackerModal}
        onClose={() => setShowSleepTrackerModal(false)}
        onSave={handleSaveSleep}
        initialHistory={sleepHistory}
      />

      {/* Heart Rate Modal Removed */}
      {/* <HeartRateModal
        visible={showHeartRateModal}
        onClose={() => setShowHeartRateModal(false)}
      /> */}

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        {/* AI Button */}
        <Animated.View style={[styles.fabSubButtonContainer, fabAiStyle]}>
          <View style={styles.fabLabelContainer}>
             <Text style={styles.fabLabel}>AI Asistan</Text>
          </View>
          <TouchableOpacity 
            style={[styles.fabSubButton, { backgroundColor: '#E1F5FE' }]} 
            onPress={() => {
              toggleFab();
              setTimeout(() => setShowAIChatModal(true), 200);
            }}
          >
            <Ionicons name="chatbubbles-outline" size={24} color="#0288D1" />
          </TouchableOpacity>
        </Animated.View>

        {/* Heart Rate Button Removed */}
        {/* <Animated.View style={[styles.fabSubButtonContainer, fabHeartStyle]}>
          <View style={styles.fabLabelContainer}>
             <Text style={styles.fabLabel}>Nabız Ölç</Text>
          </View>
          <TouchableOpacity 
            style={[styles.fabSubButton, { backgroundColor: '#FFEBEE' }]}
            onPress={() => {
              toggleFab();
              setTimeout(() => setShowHeartRateModal(true), 200);
            }}
          >
            <Ionicons name="heart-outline" size={24} color="#D32F2F" />
          </TouchableOpacity>
        </Animated.View> */}

        {/* Main Button */}
        <TouchableOpacity 
          style={styles.fabMainButton} 
          onPress={toggleFab}
          activeOpacity={0.8}
        >
          <Animated.View style={fabRotation}>
            <Ionicons name="add" size={32} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
    zIndex: 100,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa', // Lighter background
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 20,
    height: 20,
    opacity: 0.8, // Slightly transparent
  },
  activeHeaderButton: {
    backgroundColor: '#eee', // Darker when active but still minimal
  },
  blurredTextContainer: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  blurredStatContainer: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  blurredText: {
    color: 'transparent',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    borderWidth: 1,
    borderColor: '#fff',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.98)', // Slightly transparent background
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  profileDropdownContainer: {
    width: 200,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginTop: 6,
    marginRight: 8,
  },
  notificationDotUnread: {
    backgroundColor: '#0171E4',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  emptyDropdownText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
    fontSize: 13,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
  logoutItem: {
    marginTop: 4,
  },
  logoutText: {
    color: '#F44336',
    fontWeight: '500',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileIcon: {
    width: 20,
    height: 20,
    opacity: 0.8,
  },
  dateSelectorContainer: {
    backgroundColor: 'transparent',
    paddingBottom: 15,
    marginTop: 5, // Add separation from header
    zIndex: 1,
  },
  dateListContent: {
    paddingHorizontal: 15,
  },
  dateItem: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 24, // Rounder corners
    backgroundColor: '#fff', // White background for floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDateItem: {
    backgroundColor: '#0171E4',
    borderColor: '#0171E4',
    shadowColor: '#0171E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dayName: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  selectedDateText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Medium',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#0171E4',
    fontWeight: '500',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    fontFamily: 'PPNeueMontreal-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  addMedicineButton: {
    backgroundColor: '#0171E4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addMedicineButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  medicineList: {
    flexDirection: 'row',
  },
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  medicineIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
  },
  medicineCardIcon: {
      width: 40,
      height: 40,
  },
  medicineName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
      fontFamily: 'PPNeueMontreal-Medium',
      textAlign: 'center',
  },
  medicineDose: {
      fontSize: 12,
      color: '#666',
      fontFamily: 'PPNeueMontreal-Regular',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'PPNeueMontreal-Regular',
    marginTop: -8,
    marginBottom: 12,
  },
  checklistContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    overflow: 'hidden', // Prevent overflow
  },
  checklistItemTaken: {
    opacity: 0.6,
  },
  checklistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checklistIconContainerTaken: {
    backgroundColor: '#e8f5e9',
  },
  checklistIcon: {
    width: 24,
    height: 24,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  checklistTextTaken: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  checklistSubtitle: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTaken: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  mapContainer: {
      height: 200,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#eee',
  },
  map: {
      width: '100%',
      height: '100%',
  },
  mapPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  mapLoadingText: {
      marginTop: 8,
      color: '#666',
      fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 15,
  },
  newStatsRow: {
    flexDirection: 'column', // Changed from row to column
    gap: 15,
    marginBottom: 0,
  },
  newStatCard: {
    width: '100%', // Full width
    backgroundColor: '#E3F2FD', 
    borderRadius: 20,
    padding: 16,
    height: 140,
    justifyContent: 'space-between',
  },
  newStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  newStatTitle: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
    lineHeight: 18,
  },
  newStatBigValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
    lineHeight: 38,
  },
  bodyFatBarContainer: {
    flexDirection: 'row',
    height: 8,
    width: '100%',
    position: 'relative',
    marginVertical: 10,
  },
  bodyFatSegment: {
    flex: 1,
    height: '100%',
  },
  bodyFatIndicator: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 16,
    backgroundColor: '#333',
    borderRadius: 1,
  },
  bodyFatStatus: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  interactionGraphContainer: {
    height: 50, // Reduced height slightly to make room for text
    justifyContent: 'flex-end',
    marginVertical: 10,
  },
  graphBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 4,
  },
  graphBar: {
    width: 6,
    borderRadius: 3,
  },
  graphBaseLine: {
    height: 1,
    backgroundColor: '#C5E1A5',
    width: '100%',
    marginTop: -1, // Overlap with bottom of bars slightly
  },
  interactionStatus: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  fabSubButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  fabLabelContainer: {
    marginRight: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  fabLabel: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  fabSubButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginRight: 6,
  },
  fabMainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0171E4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default DashboardPage;
