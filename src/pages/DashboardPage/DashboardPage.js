import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../contexts/ToastContext';

const { width } = Dimensions.get('window');

const DashboardPage = ({ navigation, route }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medicines, setMedicines] = useState([]);
  const [userName, setUserName] = useState('Kullanıcı');
  
  // Generate dates for the week
  const dates = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleAddMedicine = () => {
    navigation.navigate('AddCapsule');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Merhaba,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image 
            source={require('../../assets/icons/profile.png')} 
            style={styles.profileIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelectorContainer}>
        <FlatList
          horizontal
          data={dates}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.toISOString()}
          contentContainerStyle={styles.dateListContent}
          renderItem={({ item }) => {
            const isSelected = item.toDateString() === selectedDate.toDateString();
            const dayName = item.toLocaleDateString('tr-TR', { weekday: 'short' });
            const dayNumber = item.getDate();
            
            return (
              <TouchableOpacity 
                style={[styles.dateItem, isSelected && styles.selectedDateItem]}
                onPress={() => handleDateSelect(item)}
              >
                <Text style={[styles.dayName, isSelected && styles.selectedDateText]}>{dayName}</Text>
                <Text style={[styles.dayNumber, isSelected && styles.selectedDateText]}>{dayNumber}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        
        {/* Medicine Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>İlaçlarım</Text>
            <TouchableOpacity onPress={handleAddMedicine}>
              <Text style={styles.seeAllText}>Ekle</Text>
            </TouchableOpacity>
          </View>
          
          {medicines.length > 0 ? (
            <View>
              {/* Medicine List Here */}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>Bugün için ilaç bulunmuyor.</Text>
              <TouchableOpacity style={styles.addMedicineButton} onPress={handleAddMedicine}>
                <Text style={styles.addMedicineButtonText}>İlaç Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Health Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sağlık Durumu</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="fitness-outline" size={24} color="#2196f3" />
              </View>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>BMI</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#e8f5e8' }]}>
                <Ionicons name="water-outline" size={24} color="#4caf50" />
              </View>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Su</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddMedicine}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

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
  },
  headerLeft: {
    flex: 1,
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
    width: 40,
    height: 40,
  },
  dateSelectorContainer: {
    backgroundColor: '#fff',
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
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
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: 'transparent',
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
  contentContainer: {
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
  },
  seeAllText: {
    fontSize: 14,
    color: '#0171E4',
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
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0171E4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0171E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default DashboardPage;
