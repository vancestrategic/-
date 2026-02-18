import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { smtiaApi } from '../../services/smtiaApi';

const capsuleType1 = require('../../assets/images/capsule-type-1.png');
const capsuleType2 = require('../../assets/images/capsule-type-2.png');
const capsuleType3 = require('../../assets/images/capsule-type-3.png');
const capsuleType4 = require('../../assets/images/capsule-type-4.png');

const AddMedicineModal = ({ isOpen, onClose, onNext, initialData = null }) => {
  const [medicineName, setMedicineName] = useState('');
  const [selectedType, setSelectedType] = useState('capsule');
  const [doseAmount, setDoseAmount] = useState('500');
  const [doseUnit, setDoseUnit] = useState('mg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef(null);

  const medicineTypes = [
    { id: 'capsule', label: 'Kapsül', image: capsuleType1 },
    { id: 'pill', label: 'Hap', image: capsuleType2 },
    { id: 'bottle', label: 'Şişe', image: capsuleType3 },
    { id: 'syringe', label: 'Şırınga', image: capsuleType4 }
  ];

  const doseUnits = ['mg', 'g', 'ml', 'adet'];

  const mapDosageFormToType = (dosageForm) => {
    const v = (dosageForm || '').toLowerCase();
    if (v.includes('tablet') || v.includes('pill')) return 'pill';
    if (v.includes('capsule') || v.includes('kaps')) return 'capsule';
    if (v.includes('syr') || v.includes('inject')) return 'syringe';
    if (v.includes('susp') || v.includes('bottle') || v.includes('şiş')) return 'bottle';
    return 'capsule';
  };

  const handleSelectFromSearch = (item) => {
    setMedicineName(item.name);
    setSelectedType(mapDosageFormToType(item.dosageForm));
    setSearchResults([]);
  };

  const handleNext = () => {
    if (medicineName.trim() && !isProcessing) {
      setIsProcessing(true);
      setTimeout(() => {
        onNext({
          name: medicineName,
          type: selectedType,
          dose: {
            amount: doseAmount,
            unit: doseUnit
          }
        });
        setIsProcessing(false);
      }, 200);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!initialData) {
        setMedicineName('');
        setSelectedType('capsule');
        setDoseAmount('500');
        setDoseUnit('mg');
        setSearchResults([]);
      } else {
        setMedicineName(initialData.name || '');
        setSelectedType(initialData.type || 'capsule');
        setDoseAmount(initialData.dose?.amount || '500');
        setDoseUnit(initialData.dose?.unit || 'mg');
        setSearchResults([]);
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const q = medicineName.trim();

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (q.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await smtiaApi.public.searchMedicines(q, 8);
        const items = data?.medicines || [];
        setSearchResults(items.map(x => ({
          id: x.id,
          name: x.name,
          dosageForm: x.dosageForm
        })));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [medicineName, isOpen]);

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>İlaç Ekle</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>İlaç İsmi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="İlaç adını girin"
                  value={medicineName}
                  onChangeText={setMedicineName}
                  autoCorrect={false}
                />
                {(isSearching || searchResults.length > 0) && (
                  <View style={styles.searchResults}>
                    {isSearching && (
                      <Text style={styles.searchingText}>Aranıyor...</Text>
                    )}
                    {!isSearching && searchResults.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.searchResultItem}
                        onPress={() => handleSelectFromSearch(item)}
                      >
                        <Text style={styles.searchResultText}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Kapsül Tipi</Text>
                <View style={styles.typeOptions}>
                  {medicineTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        selectedType === type.id && styles.selectedTypeOption
                      ]}
                      onPress={() => setSelectedType(type.id)}
                    >
                      <Image source={type.image} style={styles.typeImage} resizeMode="contain" />
                      {selectedType === type.id && (
                          <View style={styles.checkIcon}>
                              <Ionicons name="checkmark-circle" size={20} color="#0171E4" />
                          </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Doz Ekle</Text>
                <View style={styles.doseContainer}>
                  <TextInput
                    style={styles.doseInput}
                    value={doseAmount}
                    onChangeText={setDoseAmount}
                    keyboardType="numeric"
                    placeholder="500"
                  />
                  <View style={styles.doseUnitContainer}>
                    {doseUnits.map((unit) => (
                        <TouchableOpacity 
                            key={unit} 
                            style={[
                                styles.unitButton, 
                                doseUnit === unit && styles.selectedUnitButton
                            ]}
                            onPress={() => setDoseUnit(unit)}
                        >
                            <Text style={[
                                styles.unitText,
                                doseUnit === unit && styles.selectedUnitText
                            ]}>{unit}</Text>
                        </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!medicineName.trim() || isProcessing) && styles.disabledButton
                ]}
                onPress={handleNext}
                disabled={!medicineName.trim() || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.nextButtonText}>Sonraki Sayfa</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    width: '100%',
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxHeight: '100%',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Medium',
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  searchResults: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e8e3d9',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  searchingText: {
    padding: 10,
    color: '#7a7a7a',
    fontSize: 13,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  searchResultItem: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1ede7',
  },
  searchResultText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedTypeOption: {
    borderColor: '#0171E4',
    backgroundColor: '#f0f7ff',
  },
  typeImage: {
    width: '60%',
    height: '60%',
  },
  checkIcon: {
      position: 'absolute',
      top: 4,
      right: 4,
  },
  doseContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  doseInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  doseUnitContainer: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: '#f8f9fa',
      borderWidth: 1,
      borderColor: '#e2e8f0',
  },
  selectedUnitButton: {
      backgroundColor: '#0171E4',
      borderColor: '#0171E4',
  },
  unitText: {
      fontSize: 12,
      color: '#666',
      fontFamily: 'PPNeueMontreal-Medium',
  },
  selectedUnitText: {
      color: '#fff',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  nextButton: {
    backgroundColor: '#0171E4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PPNeueMontreal-Medium',
  },
});

export default AddMedicineModal;
