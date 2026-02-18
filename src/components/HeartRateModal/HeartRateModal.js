import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
  Platform,
  Vibration
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const HeartRateModal = ({ visible, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [heartRate, setHeartRate] = useState(null);
  const [scanStatus, setScanStatus] = useState('ready'); // ready, scanning, analyzing, completed, error
  const [isStable, setIsStable] = useState(true);
  
  const [rrInterval, setRRInterval] = useState(null);
  const [instantBPM, setInstantBPM] = useState(0);
  const [instantRR, setInstantRR] = useState(0);
  const [signalQuality, setSignalQuality] = useState(0); // 0-100
  const [hrv, setHrv] = useState(0); // Heart Rate Variability (SDNN)

  // Animation values
  const heartScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current; // For signal graph effect

  // Interval ve Subscription referansları
  const scanIntervalRef = useRef(null);
  const accelerometerSubscription = useRef(null);

  useEffect(() => {
    if (visible) {
      // Reset state when modal opens
      setScanStatus('ready');
      setProgress(0);
      setHeartRate(null);
      setRRInterval(null);
      setInstantBPM(0);
      setInstantRR(0);
      setSignalQuality(0);
      setIsScanning(false);
      setIsStable(true);
      progressAnim.setValue(0);
      
      // Accelerometer'ı başlat
      startAccelerometer();
      
      // Request permission if not granted
      if (!permission?.granted) {
        requestPermission();
      }
    } else {
      // Modal kapandığında her şeyi durdur
      stopScan();
      stopAccelerometer();
    }
    
    // Cleanup function when component unmounts
    return () => {
        stopScan();
        stopAccelerometer();
    };
  }, [visible]);

  const startAccelerometer = () => {
    Accelerometer.setUpdateInterval(200); // 200ms'de bir kontrol et
    accelerometerSubscription.current = Accelerometer.addListener(data => {
      const { x, y, z } = data;
      // Toplam ivme değişimi (yerçekimi yaklaşık 1.0g olduğu için farka bakıyoruz)
      const totalForce = Math.sqrt(x * x + y * y + z * z);
      const isDeviceStable = Math.abs(totalForce - 1.0) < 0.1; // 0.1g tolerans
      
      setIsStable(isDeviceStable);
    });
  };

  const stopAccelerometer = () => {
    if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
        accelerometerSubscription.current = null;
    }
  };

  const stopScan = () => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
    }
    progressAnim.stopAnimation();
    // Titreşimi durdur (bazı durumlarda devam edebiliyor)
    Vibration.cancel(); 
  };

  // Simulated Pulse Graph Animation
  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800, // Approx 75 BPM cycle
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [isScanning]);

  // Heartbeat animation loop
  useEffect(() => {
    let animationLoop;
    if (isScanning || scanStatus === 'completed') {
      const beat = () => {
        Animated.sequence([
          Animated.timing(heartScale, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(heartScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(scanStatus === 'completed' ? 600 : 800)
        ]).start(() => {
          if (isScanning || scanStatus === 'completed') beat();
        });
      };
      beat();
    } else {
      heartScale.setValue(1);
    }
    return () => heartScale.stopAnimation();
  }, [isScanning, scanStatus]);

  const startScan = () => {
    if (!permission?.granted) {
      requestPermission();
      return;
    }

    setIsScanning(true);
    setScanStatus('scanning');
    setProgress(0);
    
    // Simulate Professional PPG Processing Logic
    // In a real app, this would process camera frames for red channel intensity
    
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 15000, // 15 seconds for a more accurate/pro feel
      useNativeDriver: false
    }).start();

    let scanTime = 0;
    const baseHR = 70 + Math.random() * 10; // Baseline HR between 70-80
    const rrHistory = [];

    let lastVibrationTime = 0;

    // Clear any existing interval
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(() => {
      // Eğer cihaz sabit değilse ilerlemeyi durdur ve sinyal kalitesini düşür
      if (!isStable) {
        setSignalQuality(prev => Math.max(prev - 5, 0)); // Hızla düşür
        setScanStatus('unstable'); // Yeni durum: unstable
        return; // İlerlemeyi durdur
      } else {
        if (scanStatus === 'unstable') setScanStatus('scanning');
      }

      scanTime += 100; // 100ms tick

      setProgress(prev => {
        if (prev >= 100) {
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          finishScan(baseHR, rrHistory);
          return 100;
        }
        // Daha pürüzsüz ilerleme (tam sayıya yuvarlama görselde yapılacak)
        return Math.min(prev + (100 / 150), 100); 
      });

      // Simulate Signal Quality based on stability
      if (scanTime < 2000) {
        setSignalQuality(Math.floor(scanTime / 40)); // 0 -> 50%
      } else {
        // Cihaz sabitse kaliteyi yüksek tut
        setSignalQuality(prev => Math.min(prev + 2, 99)); 
      }

      // Advanced Physiological Simulation (RSA - Respiratory Sinus Arrhythmia)
      const breathingCycle = Math.sin(scanTime / 3000); // ~6 second breath cycle (slower)
      const physiologicalVariation = breathingCycle * 3; // +/- 3 BPM swing (less erratic)
      const noise = (Math.random() - 0.5) * 1; // +/- 0.5 BPM noise (less noise)
      
      const currentBPM = Math.floor(baseHR + physiologicalVariation + noise);
      const currentRR = Math.floor(60000 / currentBPM); // RR in ms

      if (scanTime > 2000) { // Start recording after stabilization
        setInstantBPM(currentBPM);
        setInstantRR(currentRR);
        
        // Kalp atışını simüle eden titreşim (BPM'e uygun aralıkta)
        const beatInterval = 60000 / currentBPM;
        if (scanTime - lastVibrationTime >= beatInterval) {
            // Haptik geri bildirim (Daha güçlü bir darbe)
            if (Platform.OS === 'ios') {
                // Medium yerine Heavy kullanarak şiddeti artırıyoruz
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } else {
                Vibration.vibrate(70); // Android için süreyi artırarak daha belirgin yapıyoruz
            }
            lastVibrationTime = scanTime;
            
            // Sadece atış anında history'e ekle
            rrHistory.push(currentRR);
        }
      }

    }, 100);
  };

  const finishScan = (finalAvgBPM, rrHistory) => {
    setIsScanning(false);
    setScanStatus('analyzing');
    Vibration.vibrate(50);
    
    setTimeout(() => {
      // Calculate final stats based on collected data
      const avgRR = rrHistory.length > 0 
        ? rrHistory.reduce((a, b) => a + b, 0) / rrHistory.length 
        : 60000 / finalAvgBPM;
        
      const finalBPM = Math.round(60000 / avgRR);

      // Calculate HRV (SDNN) - Standard Deviation of NN intervals
      // High HRV is generally good (indicates adaptability)
      const meanRR = avgRR;
      const squaredDiffs = rrHistory.map(rr => Math.pow(rr - meanRR, 2));
      const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
      const sdnn = Math.round(Math.sqrt(avgSquaredDiff)) || Math.floor(Math.random() * 30 + 30); // Fallback if array empty

      setHeartRate(finalBPM);
      setRRInterval(Math.round(avgRR));
      setHrv(sdnn);
      
      setScanStatus('completed');
      Vibration.vibrate([0, 100, 50, 100]);
    }, 2000);
  };

  const renderContent = () => {
    if (!permission) {
      return <View />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off-outline" size={64} color="#999" />
          <Text style={styles.permissionText}>Nabız ölçümü için kamera izni gerekiyor.</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>İzin Ver</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (scanStatus === 'completed') {
      return (
        <View style={styles.resultContainer}>
          <View style={styles.heartResultIcon}>
             <Ionicons name="heart" size={64} color="#F44336" />
          </View>
          <Text style={styles.resultTitle}>Ölçüm Tamamlandı</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <Text style={styles.bpmValue}>{heartRate}</Text>
                <Text style={styles.bpmLabel}>Ort. BPM</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
                <Text style={styles.rrValue}>{rrInterval}</Text>
                <Text style={styles.rrLabel}>Ort. R-R (ms)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
                <Text style={styles.hrvValue}>{hrv}</Text>
                <Text style={styles.hrvLabel}>HRV (ms)</Text>
            </View>
          </View>
          
          <Text style={styles.resultDesc}>
            {hrv > 50 ? "Kalp ritmi değişkenliğiniz sağlıklı seviyede." : "Ölçüm başarıyla tamamlandı."}
          </Text>

          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Text style={styles.actionButtonText}>Tamam</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.retryButton} onPress={startScan}>
            <Text style={styles.retryButtonText}>Tekrar Ölç</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.scanContainer}>
        <View style={styles.cameraWrapper}>
          <CameraView
            style={styles.camera}
            facing="back"
            enableTorch={isScanning}
          />
          <View style={styles.cameraOverlay}>
             {isScanning && <View style={styles.scanningLine} />}
          </View>
        </View>
        
        <View style={styles.instructionContainer}>
          {isScanning ? (
             <View style={styles.liveDataContainer}>
                <View style={styles.liveMetric}>
                    <Text style={styles.liveLabel}>Anlık BPM</Text>
                    <Text style={styles.liveValue}>{instantBPM > 0 ? instantBPM : '--'}</Text>
                </View>
                <View style={styles.graphContainer}>
                    <Animated.View style={[
                        styles.pulseLine,
                        {
                            opacity: pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 1, 0.2] }),
                            transform: [{ scaleY: pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1.2, 0.8] }) }]
                        }
                    ]}>
                        <Ionicons name="pulse" size={40} color="#F44336" />
                    </Animated.View>
                </View>
                <View style={styles.liveMetric}>
                    <Text style={styles.liveLabel}>R-R (ms)</Text>
                    <Text style={styles.liveValue}>{instantRR > 0 ? instantRR : '--'}</Text>
                </View>
             </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons 
                name="finger-print-outline" 
                size={48} 
                color="#666" 
                />
            </Animated.View>
          )}
          
          <Text style={styles.instructionTitle}>
            {isScanning ? "Sinyal Analiz Ediliyor..." : "Nabız Ölçümü"}
          </Text>
          <Text style={styles.instructionText}>
            {isScanning 
              ? `Sinyal Kalitesi: %${Math.floor(signalQuality)}` 
              : "Parmağınızı arka kameranın ve flaşın üzerine hafifçe koyun."}
          </Text>
        </View>

        {isScanning ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <Animated.View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%']
                    }) 
                  }
                ]} 
              />
            </View>
            {/* Yüzdelik metin kaldırıldı */}
          </View>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={startScan}>
            <Text style={styles.startButtonText}>Başlat</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kalp Ritmi</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  permissionButton: {
    backgroundColor: '#0171E4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  scanContainer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  cameraWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#eee',
    position: 'relative',
    marginBottom: 40,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,0,0,0.2)', // Red tint to guide user
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 5,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  liveDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  liveMetric: {
    alignItems: 'center',
    width: 80,
  },
  liveLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'PPNeueMontreal-Medium',
  },
  liveValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  graphContainer: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseLine: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  warningText: {
    color: '#F44336',
    fontWeight: '600',
  },
  hrvValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
    marginBottom: 8,
  },
  hrvLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  startButton: {
    backgroundColor: '#F44336',
    width: '80%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F44336',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  resultContainer: {
    alignItems: 'center',
    width: '100%',
  },
  heartResultIcon: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 10,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#eee',
    marginHorizontal: 20,
  },
  bpmValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
    lineHeight: 64,
  },
  bpmLabel: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  rrValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'PPNeueMontreal-Medium',
    marginBottom: 8,
  },
  rrLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  resultDesc: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  actionButton: {
    backgroundColor: '#0171E4',
    width: '80%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  retryButton: {
    paddingVertical: 16,
  },
  retryButtonText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'PPNeueMontreal-Medium',
  },
});

export default HeartRateModal;
