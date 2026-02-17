import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

const GenderSelectionPage = ({ navigation, route }) => {
  const { userRegistrationData = {} } = route.params || {};
  const [selectedGender, setSelectedGender] = useState(null);
  const [showKVKKMessage, setShowKVKKMessage] = useState(false);
  
  const genderOptions = [
    { id: 'male', label: 'Erkek', icon: 'male' },
    { id: 'female', label: 'Kadın', icon: 'female' }
  ];

  const handleNext = () => {
    if (!selectedGender) return;
    
    // Normally goes to AddCapsule, but for now let's go to Dashboard or similar
    // Since AddCapsule is complex, maybe we can skip it or stub it?
    // The user asked to implement "other screens", so I should probably implement AddCapsule too or at least a placeholder.
    // For now, let's navigate to 'AddCapsule' (which I will create as a stub if not full)
    navigation.navigate('AddCapsule', {
      userRegistrationData: {
        ...userRegistrationData,
        gender: selectedGender,
      },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 12H5" />
            <Path d="M12 19l-7-7 7-7" />
          </Svg>
        </TouchableOpacity>
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>5/6</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Cinsiyetinizi Seçiniz</Text>
          <Text style={styles.subtitle}>
            Cinsiyet bilginiz, ilaç dozajlarının vücut yapınıza göre hesaplanmasına yardımcı olur.
          </Text>
        </View>

        <View style={styles.optionsContainer}>
            {genderOptions.map((option) => {
                const isSelected = selectedGender === option.id;
                const isFemale = option.id === 'female';
                const activeColor = isFemale ? '#E91E63' : '#0171E4'; // Pink for female, Blue for male
                
                return (
                <TouchableOpacity
                    key={option.id}
                    style={[
                        styles.optionButton,
                        isSelected && {
                            borderColor: activeColor,
                            backgroundColor: isFemale ? '#FFF0F5' : '#f0f7ff', // Light pink or light blue bg
                            borderWidth: 2
                        }
                    ]}
                    onPress={() => setSelectedGender(option.id)}
                >
                    <Svg 
                        width={32} 
                        height={32} 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke={isSelected ? activeColor : '#666'} 
                        strokeWidth={2} 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        {option.id === 'male' ? (
                            <>
                                <Path d="M16 3h5v5" />
                                <Path d="M21 3L13.5 10.5" />
                                <Path d="M16.5 13.5A6 6 0 1 1 13.5 10.5" />
                            </>
                        ) : (
                            <>
                                <Path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                                <Path d="M12 15v7" />
                                <Path d="M9 19h6" />
                            </>
                        )}
                    </Svg>
                    <Text style={[
                        styles.optionLabel,
                        isSelected && { color: activeColor, fontWeight: '600' }
                    ]}>
                        {option.label}
                    </Text>
                </TouchableOpacity>
                );
            })}
        </View>

        {/* Next Button */}
        <TouchableOpacity 
            style={[styles.primaryButton, !selectedGender && styles.disabledButton]} 
            onPress={handleNext}
            disabled={!selectedGender}
        >
          <Text style={styles.primaryButtonText}>Sonraki Sayfa</Text>
        </TouchableOpacity>
      </View>


      {/* KVKK Message */}
      {showKVKKMessage && (
        <View style={styles.kvkkContainer}>
          <View style={styles.kvkkContent}>
            <Text style={styles.kvkkText}>
              Gizliliğinizde önem veriyoruz. Daha fazla bilgi için Veri ve Çerez Politikasını ziyaret edebilirsiniz.
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('KVKK')}>
              <Text style={styles.kvkkLink}>KVKK</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.kvkkClose} 
            onPress={() => setShowKVKKMessage(false)}
          >
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Line x1="18" y1="6" x2="6" y2="18" />
              <Line x1="6" y1="6" x2="18" y2="18" />
            </Svg>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  progressIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  progressText: {
    color: '#666',
    fontFamily: 'pp-neue',
    fontSize: 14,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1e1f28',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'PPNeueMontreal-Regular',
    paddingHorizontal: 20,
  },
  optionsContainer: {
      flexDirection: 'column',
      gap: 16,
      width: '100%',
  },
  optionButton: {
      width: '100%',
      height: 72,
      backgroundColor: '#fff',
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: '#e9ecef',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
  },
  selectedOption: {
      // Handled inline for dynamic colors
  },
  optionLabel: {
      fontSize: 18,
      color: '#666',
      fontFamily: 'PPNeueMontreal-Medium',
      marginLeft: 16,
  },
  selectedOptionLabel: {
      // Handled inline
  },
  primaryButton: {
    backgroundColor: '#0171E4',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 'auto',
  },
  disabledButton: {
      backgroundColor: '#ccc',
      shadowOpacity: 0,
      elevation: 0,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'pp-neue-medium',
  },
  kvkkContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#f4f4f4',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kvkkContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  kvkkText: {
    fontSize: 12,
    color: '#495057',
    fontFamily: 'PPNeueMontreal-Regular',
    lineHeight: 18,
  },
  kvkkLink: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
    marginLeft: 4,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  kvkkClose: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#7E7E7E',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GenderSelectionPage;
