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
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
  Switch,
  Alert,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const HealthCardModal = ({ visible, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Health Data State
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [isOrganDonor, setIsOrganDonor] = useState(false);

  // Animation states
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];

  useEffect(() => {
    if (visible) {
      loadHealthData();
      setShowModal(true);
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
        setIsEditing(false); // Reset edit mode on close
      });
    }
  }, [visible]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const storedData = await AsyncStorage.getItem('userHealthCard');
      if (storedData) {
        const data = JSON.parse(storedData);
        setBloodType(data.bloodType || '');
        setAllergies(data.allergies || '');
        setChronicDiseases(data.chronicDiseases || '');
        setEmergencyContactName(data.emergencyContactName || '');
        setEmergencyContactPhone(data.emergencyContactPhone || '');
        setIsOrganDonor(data.isOrganDonor || false);
        setIsEditing(false);
      } else {
        // No data, start in edit mode
        setIsEditing(true);
        // Reset fields
        setBloodType('');
        setAllergies('');
        setChronicDiseases('');
        setEmergencyContactName('');
        setEmergencyContactPhone('');
        setIsOrganDonor(false);
      }
    } catch (error) {
      console.error('Error loading health card:', error);
      Alert.alert('Hata', 'Sağlık kartı bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveData = async () => {
    try {
      const data = {
        bloodType,
        allergies,
        chronicDiseases,
        emergencyContactName,
        emergencyContactPhone,
        isOrganDonor
      };
      
      await AsyncStorage.setItem('userHealthCard', JSON.stringify(data));
      
      if (onSave) {
        onSave(data);
      }
      
      setIsEditing(false);
      Alert.alert('Başarılı', 'Sağlık kartınız güncellendi.');
    } catch (error) {
      console.error('Error saving health card:', error);
      Alert.alert('Hata', 'Bilgiler kaydedilirken bir hata oluştu.');
    }
  };

  const handleShare = async () => {
    try {
      const message = `
Sağlık Kartım:
------------------
Kan Grubu: ${bloodType || 'Belirtilmedi'}
Alerjiler: ${allergies || 'Yok'}
Kronik Rahatsızlıklar: ${chronicDiseases || 'Yok'}
Acil Durum Kişisi: ${emergencyContactName || '-'} (${emergencyContactPhone || '-'})
Organ Bağışçısı: ${isOrganDonor ? 'Evet' : 'Hayır'}
      `.trim();

      await Share.share({
        message: message,
        title: 'Sağlık Kartım'
      });
    } catch (error) {
      console.error('Error sharing health card:', error);
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu.');
    }
  };

  const renderViewMode = () => (
    <View style={styles.viewContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.bloodTypeContainer}>
            <Text style={styles.bloodTypeLabel}>Kan Grubu</Text>
            <Text style={styles.bloodTypeValue}>{bloodType || '-'}</Text>
        </View>
        {isOrganDonor && (
            <View style={styles.donorBadge}>
                <Ionicons name="heart" size={16} color="#fff" />
                <Text style={styles.donorText}>Organ Bağışçısı</Text>
            </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Alerjiler</Text>
        <Text style={styles.infoText}>{allergies || 'Belirtilmedi'}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Kronik Rahatsızlıklar</Text>
        <Text style={styles.infoText}>{chronicDiseases || 'Belirtilmedi'}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Acil Durum Kişisi</Text>
        <View style={styles.contactRow}>
            <Ionicons name="person-outline" size={18} color="#666" />
            <Text style={styles.contactText}>{emergencyContactName || '-'}</Text>
        </View>
        <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={18} color="#666" />
            <Text style={styles.contactText}>{emergencyContactPhone || '-'}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#0171E4" />
            <Text style={styles.shareButtonText}>Paylaş</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Düzenle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEditMode = () => (
    <View style={styles.editContainer}>
      {/* Blood Type Selection */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Kan Grubu</Text>
        <View style={styles.bloodTypeSelector}>
            {bloodTypes.map(type => (
                <TouchableOpacity 
                    key={type} 
                    style={[
                        styles.bloodTypeOption, 
                        bloodType === type && styles.selectedBloodTypeOption
                    ]}
                    onPress={() => setBloodType(type)}
                >
                    <Text style={[
                        styles.bloodTypeOptionText,
                        bloodType === type && styles.selectedBloodTypeOptionText
                    ]}>{type}</Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Allergies */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Alerjiler</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Varsa alerjilerinizi yazın"
          placeholderTextColor="#999"
          value={allergies}
          onChangeText={setAllergies}
          multiline
        />
      </View>

      {/* Chronic Diseases */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Kronik Rahatsızlıklar</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Varsa kronik rahatsızlıklarınızı yazın"
          placeholderTextColor="#999"
          value={chronicDiseases}
          onChangeText={setChronicDiseases}
          multiline
        />
      </View>

      {/* Emergency Contact */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Acil Durum Kişisi</Text>
        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          placeholderTextColor="#999"
          value={emergencyContactName}
          onChangeText={setEmergencyContactName}
        />
        <TextInput
          style={[styles.input, { marginTop: 12 }]}
          placeholder="Telefon Numarası"
          placeholderTextColor="#999"
          value={emergencyContactPhone}
          onChangeText={setEmergencyContactPhone}
          keyboardType="phone-pad"
        />
      </View>

      {/* Organ Donor */}
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Organ Bağışçısıyım</Text>
        <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isOrganDonor ? "#0171E4" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setIsOrganDonor}
            value={isOrganDonor}
        />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => {
             // If we have data, go back to view mode, else close
             AsyncStorage.getItem('userHealthCard').then(data => {
                 if (data) setIsEditing(false);
                 else onClose();
             });
        }}>
            <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveData}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
                  <Text style={styles.headerTitle}>Sağlık Kartı</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#1e1f28" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                    {loading ? (
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>Yükleniyor...</Text>
                    ) : (
                        isEditing ? renderEditMode() : renderViewMode()
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
  viewContainer: {
      gap: 20,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      padding: 16,
      borderRadius: 16,
  },
  bloodTypeContainer: {
      alignItems: 'flex-start',
  },
  bloodTypeLabel: {
      fontSize: 12,
      color: '#666',
      marginBottom: 4,
  },
  bloodTypeValue: {
      fontSize: 28,
      fontWeight: '700',
      color: '#D32F2F',
  },
  donorBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#D32F2F',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      gap: 6,
  },
  donorText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
  },
  infoSection: {
      gap: 8,
  },
  sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
  },
  infoText: {
      fontSize: 16,
      color: '#1e1f28',
      backgroundColor: '#f8f9fa',
      padding: 12,
      borderRadius: 12,
      overflow: 'hidden',
  },
  contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: '#f8f9fa',
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
  },
  contactText: {
      fontSize: 16,
      color: '#1e1f28',
  },
  editButton: {
      flex: 1,
      backgroundColor: '#0171E4',
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
  },
  editButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
  },
  shareButton: {
      flex: 1,
      backgroundColor: '#E3F2FD',
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
  },
  shareButtonText: {
      color: '#0171E4',
      fontSize: 16,
      fontWeight: '600',
  },
  editContainer: {
      gap: 20,
  },
  fieldContainer: {
      gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e1f28',
    marginBottom: 4,
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
  textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
  },
  bloodTypeSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
  },
  bloodTypeOption: {
      width: (width - 80) / 4,
      aspectRatio: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#e9ecef',
      backgroundColor: '#fff',
  },
  selectedBloodTypeOption: {
      backgroundColor: '#ffebee',
      borderColor: '#D32F2F',
  },
  bloodTypeOptionText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#666',
  },
  selectedBloodTypeOptionText: {
      color: '#D32F2F',
  },
  switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
  },
  actionButtons: {
      flexDirection: 'row',
      gap: 15,
      marginTop: 10,
  },
  cancelButton: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      backgroundColor: '#f1f3f5',
  },
  cancelButtonText: {
      color: '#666',
      fontSize: 16,
      fontWeight: '600',
  },
  saveButton: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      backgroundColor: '#0171E4',
  },
  saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
  },
});

export default HealthCardModal;
