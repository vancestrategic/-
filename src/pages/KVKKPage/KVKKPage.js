import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const KVKKPage = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.pageTitle}>KVKK</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.mainTitle}>KİŞİSEL VERİLERİN KORUNMASI HAKKINDA AYDINLATMA METNİ (KVKK)</Text>
        
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            Group X - İlaç Takip Uygulaması olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verilerinizin güvenliğine ve gizliliğine azami özeni göstermekteyiz.
          </Text>
          <Text style={styles.paragraph}>
            Bu metin, hangi kişisel verilerin toplandığı, bunların hangi amaçlarla işlendiği, saklama süresi ile haklarınıza ilişkin bilgileri içermektedir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Veri Sorumlusu</Text>
          <Text style={styles.paragraph}>
            Bu uygulama kapsamında toplanan kişisel verilerinizden Group X veri sorumlusu olarak sorumludur.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>İletişim:</Text> support@groupx.com
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Toplanan Kişisel Veriler</Text>
          <Text style={styles.paragraph}>
            Uygulamamız kapsamında aşağıdaki veriler toplanabilmektedir:
          </Text>
          
          <Text style={styles.subSectionTitle}>Kimlik ve iletişim verileri</Text>
          <Text style={styles.listItem}>• Ad ve soyad</Text>
          <Text style={styles.listItem}>• E-posta adresi</Text>

          <Text style={styles.subSectionTitle}>Hesap güvenliği verileri</Text>
          <Text style={styles.listItem}>• Parola (şifrelenmiş/hashing ile saklanır)</Text>

          <Text style={styles.subSectionTitle}>Sağlık ve fiziksel veriler (hassas nitelikli veriler)</Text>
          <Text style={styles.listItem}>• Yaş / doğum tarihi</Text>
          <Text style={styles.listItem}>• Cinsiyet</Text>
          <Text style={styles.listItem}>• Boy, kilo</Text>
          <Text style={styles.listItem}>• Kullanılan ilaçlar, ilaç alerjileri ve ilaç tüketim bilgileri</Text>
          <Text style={styles.listItem}>• Sağlıkla ilişkili tercih ve bildirimler</Text>

          <Text style={styles.subSectionTitle}>Teknik veriler</Text>
          <Text style={styles.listItem}>• Uygulama kullanım verileri (oturum süresi, hatırlatma tercihleri, cihaz bilgileri vb.)</Text>
          
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              <Text style={styles.bold}>Not:</Text> Sağlıkla ilgili bilgiler özel nitelikli kişisel veriler kapsamında değerlendirildiğinden, bu verilerin işlenmesi için açık ve özgül rızanız alınmakta ve ek güvenlik önlemleri uygulanmaktadır.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Kişisel Verilerin İşlenme Amaçları</Text>
          <Text style={styles.paragraph}>Toplanan veriler aşağıdaki amaçlarla işlenmektedir:</Text>
          <Text style={styles.listItem}>• Kullanıcı hesabı oluşturma ve kimlik doğrulama, oturum yönetimi</Text>
          <Text style={styles.listItem}>• Kullanıcıya özel ilaç hatırlatmaları, uyarılar ve sağlıkla ilgili bildirimler sunma</Text>
          <Text style={styles.listItem}>• İlaç etkileşimleri ve kullanıcıya özel içerik önerileri için veri analizi</Text>
          <Text style={styles.listItem}>• Hesap güvenliğinin sağlanması, kötüye kullanımın tespiti ve önlenmesi</Text>
          <Text style={styles.listItem}>• Uygulama performansının izlenmesi ve kullanıcı deneyiminin iyileştirilmesi</Text>
          <Text style={styles.listItem}>• KVKK ve ilgili mevzuat gereği yerine getirilmesi gereken hukuki yükümlülüklerin sağlanması</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. İşleme Hukuki Sebebi ve Rıza</Text>
          <Text style={styles.paragraph}>
            Sağlıkla ilgili hassas verilerin işlenmesi için açık rızanız alınmaktadır. Kayıt sürecinde ve ilgili formlarda bu rızaya uygun onay mekanizması yer almaktadır.
          </Text>
          <Text style={styles.paragraph}>
            Diğer verilerin işlenmesi ise hizmet sözleşmesinin kurulması ve yürütülmesi, hukuki yükümlülüklerin yerine getirilmesi ve kullanıcı onayı gibi hukuki sebeplere dayanmaktadır.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Kişisel Verilerin Aktarımı</Text>
          <Text style={styles.paragraph}>
            Toplanan veriler, açık rızanız olmadığı sürece üçüncü kişilere veya kuruluşlara aktarılmaz.
          </Text>
          <Text style={styles.paragraph}>
            Yalnızca hizmetin sağlanması için gerekli olması halinde sözleşmeye dayalı olarak yetkilendirilmiş hizmet sağlayıcılarla paylaşım yapılabilir.
          </Text>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
    backgroundColor: '#fefefe',
  },
  headerLeft: {
    width: 32, // Matches backButton width to balance the center title
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
    textAlign: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e1f28',
    marginBottom: 20,
    fontFamily: 'PPNeueMontreal-Medium',
    lineHeight: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  listItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 4,
    paddingLeft: 8,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  bold: {
    fontWeight: '600',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  noteContainer: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  noteText: {
    fontSize: 13,
    color: '#e65100',
    lineHeight: 20,
    fontFamily: 'PPNeueMontreal-Regular',
  },
});

export default KVKKPage;
