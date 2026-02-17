import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 60;

const WeightSelectionPage = ({ navigation, route }) => {
  const { userRegistrationData = {} } = route.params || {};
  const userHeight = userRegistrationData.height || 170;
  
  const [selectedWeight, setSelectedWeight] = useState(70);
  const [showKVKKMessage, setShowKVKKMessage] = useState(false);
  
  // Generate weights 30-150
  const weights = Array.from({ length: 121 }, (_, i) => i + 30);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    // Initial scroll to selected weight
    const timer = setTimeout(() => {
        const index = weights.indexOf(selectedWeight);
        if (index !== -1 && flatListRef.current) {
            flatListRef.current.scrollToOffset({
                offset: index * ITEM_HEIGHT,
                animated: false
            });
        }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getWeightStatus = (weight, height) => {
    const bmi = calculateBMI(weight, height);
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  };

  const getWeightStatusColors = (status) => {
    switch (status) {
      case 'underweight':
        return {
          background: '#e3f2fd', 
          border: '#2196f3',     
          message: 'Zayıf (BMI < 18.5)',
          text: '#0d47a1'
        };
      case 'normal':
        return {
          background: '#e8f5e8', 
          border: '#4caf50',     
          message: 'Normal (BMI 18.5-24.9)',
          text: '#1b5e20'
        };
      case 'overweight':
        return {
          background: '#fff3e0', 
          border: '#ff9800',     
          message: 'Fazla Kilolu (BMI 25-29.9)',
          text: '#e65100'
        };
      case 'obese':
        return {
          background: '#ffebee', 
          border: '#f44336',     
          message: 'Obez (BMI ≥ 30)',
          text: '#b71c1c'
        };
      default:
        return {
          background: '#f0f0f0',
          border: '#0171e4',
          message: '',
          text: '#333'
        };
    }
  };

  const handleNext = () => {
    navigation.navigate('GenderSelection', {
      userRegistrationData: {
        ...userRegistrationData,
        weight: selectedWeight,
      },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 2) * ITEM_HEIGHT,
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
      (index + 2) * ITEM_HEIGHT,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.8, 0.9, 1.3, 0.9, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
        inputRange,
        outputRange: [0.3, 0.5, 1, 0.5, 0.3],
        extrapolate: 'clamp',
    });

    const color = scrollY.interpolate({
        inputRange,
        outputRange: ['#999', '#666', '#1e1f28', '#666', '#999'],
        extrapolate: 'clamp',
    });
    
    // Check if this item is selected to apply specific styling
    const isSelected = item === selectedWeight;
    const status = isSelected ? getWeightStatus(item, userHeight) : null;
    const colors = isSelected ? getWeightStatusColors(status) : null;

    return (
      <Animated.View
        style={[
          styles.itemContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Animated.View style={[
            styles.itemTextContainer,
            isSelected && colors ? {
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
            } : {}
        ]}>
            <Animated.Text style={[
                styles.itemText, 
                { color: isSelected && colors ? colors.text : color }
            ]}>
            {item} kg
            </Animated.Text>
        </Animated.View>
      </Animated.View>
    );
  };

  const currentStatus = getWeightStatus(selectedWeight, userHeight);
  const statusInfo = getWeightStatusColors(currentStatus);

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
          <Text style={styles.progressText}>4/6</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Kilonuzu Seçiniz</Text>
          <Text style={styles.subtitle}>
            Kilo bilginiz, ilaç dozajlarının vücut kitle indeksinize göre hesaplanmasına yardımcı olur.
          </Text>
        </View>

        <View style={styles.pickerContainer}>
          <View style={styles.centerLine} />
          <Animated.FlatList
            ref={flatListRef}
            data={weights}
            keyExtractor={(item) => item.toString()}
            renderItem={renderItem}
            getItemLayout={(data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            bounces={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingVertical: (350 - ITEM_HEIGHT) / 2,
            }}
            style={styles.flatList}
            onMomentumScrollEnd={(event) => {
                const offsetY = event.nativeEvent.contentOffset.y;
                const index = Math.round(offsetY / ITEM_HEIGHT);
                if (weights[index]) {
                    setSelectedWeight(weights[index]);
                }
            }}
          />
        </View>
        
        <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
                {statusInfo.message}
            </Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
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
  pickerContainer: {
    height: 350,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  centerLine: {
    position: 'absolute',
    top: '50%',
    left: '20%',
    right: '20%',
    height: 1,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  flatList: {
    flexGrow: 0,
    height: 350,
    width: '100%',
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  itemTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 24,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  statusContainer: {
    marginTop: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'PPNeueMontreal-Medium',
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

export default WeightSelectionPage;
