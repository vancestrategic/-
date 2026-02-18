import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Assets
const logoAI = require('../../assets/logos/logo.png');

const AIChatModal = ({ visible, onClose }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (visible) {
      loadChatHistory();
    }
  }, [visible]);

  const loadChatHistory = () => {
    // Initial welcome message
    if (chatMessages.length === 0) {
      setChatMessages([
        { 
          id: 1, 
          type: 'ai', 
          text: 'Merhaba! Ben sağlık asistanın. İlaçların, yan etkiler veya genel sağlık konularında sana nasıl yardımcı olabilirim?', 
          timestamp: new Date() 
        }
      ]);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMsg = { 
      id: Date.now(), 
      type: 'user', 
      text: chatInput, 
      timestamp: new Date() 
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Auto scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Mock AI Response
    setTimeout(() => {
      const aiResponses = [
        "İlaçlarını düzenli alman tedavinin başarısı için çok önemli.",
        "Bu ilacın yan etkileri arasında baş ağrısı olabilir. Eğer şiddetlenirse doktoruna danışmalısın.",
        "Su içmeyi ihmal etme, günde en az 2 litre su içmelisin.",
        "Yürüyüş yapmak kalp sağlığın için faydalıdır.",
        "Sorduğun konuda daha detaylı bilgi için doktoruna başvurmanı öneririm."
      ];
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const aiMsg = { 
        id: Date.now() + 1, 
        type: 'ai', 
        text: randomResponse, 
        timestamp: new Date() 
      };
      
      setChatMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      
      // Auto scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.type === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      {item.type === 'ai' && (
        <View style={styles.aiIconContainer}>
          <Image source={logoAI} style={styles.aiIcon} resizeMode="contain" />
        </View>
      )}
      <View style={[
        styles.messageContent,
        item.type === 'user' ? styles.userMessageContent : styles.aiMessageContent
      ]}>
        <Text style={[
          styles.messageText,
          item.type === 'user' ? styles.userMessageText : styles.aiMessageText
        ]}>{item.text}</Text>
        <Text style={[
          styles.timestamp,
          item.type === 'user' ? styles.userTimestamp : styles.aiTimestamp
        ]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Image source={logoAI} style={styles.headerLogo} resizeMode="contain" />
            <View>
              <Text style={styles.headerTitle}>Sağlık Asistanı</Text>
              <Text style={styles.headerSubtitle}>AI Powered</Text>
            </View>
          </View>
          <View style={{ width: 40 }} /> 
        </View>

        {/* Chat Area */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              isTyping ? (
                <View style={styles.typingContainer}>
                  <View style={styles.aiIconContainer}>
                    <Image source={logoAI} style={styles.aiIcon} resizeMode="contain" />
                  </View>
                  <View style={styles.typingBubble}>
                    <ActivityIndicator size="small" color="#0171E4" />
                  </View>
                </View>
              ) : null
            }
          />

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Bir şeyler sor..."
              value={chatInput}
              onChangeText={setChatInput}
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !chatInput.trim() && styles.sendButtonDisabled]} 
              onPress={handleChatSubmit}
              disabled={!chatInput.trim()}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e1f28',
    fontFamily: 'PPNeueMontreal-Medium',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#0171E4',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    padding: 20,
    paddingBottom: 40,
  },
  messageBubble: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  aiIcon: {
    width: 20,
    height: 20,
  },
  messageContent: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
  },
  userMessageContent: {
    backgroundColor: '#0171E4',
    borderBottomRightRadius: 4,
  },
  aiMessageContent: {
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    fontFamily: 'PPNeueMontreal-Regular',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  aiTimestamp: {
    color: '#999',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  typingBubble: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
    marginRight: 12,
    fontFamily: 'PPNeueMontreal-Regular',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0171E4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0171E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
});

export default AIChatModal;
