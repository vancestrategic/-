import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, StatusBar, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getToken, getUserFromToken, clearToken } from '../../services/auth';
import funFacts from '../../data/ilac_funfacts.json';

const { width, height } = Dimensions.get('window');

const LoadingPage = () => {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [randomFact, setRandomFact] = useState('');
  const [dotOpacity] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const getRandomFact = () => {
      const randomIndex = Math.floor(Math.random() * funFacts.length);
      return funFacts[randomIndex];
    };
    
    setRandomFact(getRandomFact());

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const increment = prev < 20 ? 1.5 : prev < 60 ? 1.2 : 0.8;
        return Math.min(prev + increment, 100);
      });
    }, 60);

    const checkAuthAndNavigate = async () => {
        // Wait for minimum loading time (e.g., 4 seconds) to match web experience
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        setIsFadingOut(true);
        
        setTimeout(async () => {
            const token = await getToken();
            let destination = 'Intro';
            
            if (token) {
                const user = getUserFromToken(token);
                if (user && user.id) {
                    destination = 'Dashboard';
                } else {
                    await clearToken();
                }
            }
            
            navigation.replace(destination);
        }, 500); // Wait for fade out
    };

    checkAuthAndNavigate();

    // Simple dot animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      clearInterval(progressInterval);
    };
  }, [navigation]);

  return (
    <View style={[styles.container, isFadingOut && styles.fadeOut]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F3F3" />
      
      <View style={styles.header}>
        <Image source={require('../../assets/logos/logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.groupTextContainer}>
          <Text style={styles.byText}>by</Text>
          <Text style={styles.groupName}>Group X</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.sampleText}>{randomFact}</Text>
          <View style={styles.subtitleContainer}>
             {/* Use standard Text instead of Animated.Text to debug the boolean vs string error */}
             <Text style={styles.loadingDots}>. . .</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3', // Changed from blue to light gray/white match web design
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  fadeOut: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40, // Adjust for status bar
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 8,
  },
  groupTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  byText: {
    color: '#666',
    fontSize: 12,
    marginRight: 4,
    fontFamily: 'pp-neue',
    fontWeight: '300',
  },
  groupName: {
    color: '#171719',
    fontSize: 24,
    fontWeight: '300',
    fontFamily: 'pp-neue',
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Vertically centered
    alignItems: 'flex-start', // Left aligned
  },
  textContainer: {
    width: '100%',
    maxWidth: 600,
  },
  sampleText: {
    color: '#000000', // Black text
    fontSize: 32, // 2.2rem approx
    textAlign: 'left', // Left aligned
    lineHeight: 38,
    marginBottom: 20,
    fontFamily: 'pp-neue',
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    alignItems: 'flex-start',
    height: 24,
    marginTop: 8,
  },
  loadingDots: {
    color: '#666666',
    fontSize: 32,
    letterSpacing: 4,
    fontWeight: '300',
  },
  progressContainer: {
    width: '100%',
    paddingBottom: 40,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0171E4', // Blue progress bar
    borderRadius: 3,
  },
});

export default LoadingPage;
