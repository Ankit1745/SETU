import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Language } from '../i18n/translations';
import {
  parseCustomerProblem,
  analyzeConstructionQuery,
  CustomerProblemContext,
  SetuAIResponse,
} from '../services/constructionAI';

interface SetuAIAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  language: Language;
  initialQuery?: string;
  onSelectContractorCategory?: (category: string) => void;
}

interface ChatTurn {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  parsedContext?: CustomerProblemContext;
  aiResponse?: SetuAIResponse;
  clarificationOptions?: string[];
  actionButtonText?: string;
  actionCategory?: string;
  isSafetyHazard?: boolean;
}

export const SetuAIAssistantModal: React.FC<SetuAIAssistantModalProps> = ({
  visible,
  onClose,
  language,
  initialQuery = '',
  onSelectContractorCategory,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeContext, setActiveContext] = useState<CustomerProblemContext | null>(null);
  const [conversation, setConversation] = useState<ChatTurn[]>([]);

  const scrollViewRef = useRef<any>(null);

  // Trending Questions Preset
  const TRENDING_TOPICS = [
    {
      id: 't1',
      title: '🚰 किचन का नल टपक रहा है',
      query: 'Kitchen ka nal tapak raha hai',
    },
    {
      id: 't2',
      title: '🪚 किचन की अलमारी का हिंज टूट गया',
      query: 'Kitchen ki almari ka hinge toot gaya',
    },
    {
      id: 't3',
      title: '💧 बाथरूम में पानी आ रहा है',
      query: 'Bathroom me pani aa raha hai',
    },
    {
      id: 't4',
      title: '⚡ स्विचबोर्ड से चिंगारी आ रही है',
      query: 'Switchboard se chingari aa rahi hai',
    },
    {
      id: 't5',
      title: '🎨 3BHK पुट्टी & रॉयल पेंट',
      query: '3BHK फ्लैट में 2-कोट बिरला पुट्टी और रॉयल इमल्शन पेंटिंग की मानक दर और तकनीक क्या है?',
    },
    {
      id: 't6',
      title: '📐 विट्रीफाइड टाइल्स & स्पेसर',
      query: 'कमरे में 2x4 फीट विट्रीफाइड टाइल्स और केमिकल एडहेसिव लगाने का लेबर रेट और तरीका क्या है?',
    },
  ];

  // Auto-run when modal opens
  useEffect(() => {
    if (visible) {
      if (initialQuery) {
        handleSendMessage(initialQuery);
      } else if (conversation.length === 0) {
        // Welcome turn
        setConversation([
          {
            id: 'welcome',
            sender: 'assistant',
            text: 'नमस्ते! मैं SETU AI उस्ताद हूँ। अपने घर की समस्या या निर्माण कार्य बोलकर या लिखकर बताएं (उदा. "किचन का नल टपक रहा है" या "अलमारी का हिंज टूट गया")।',
          },
        ]);
      }
    }
  }, [visible, initialQuery]);

  // Voice Input Handler
  const handleStartVoice = () => {
    if (typeof window !== 'undefined' && ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      Alert.alert(
        'वॉइस इनपुट',
        'आपके ब्राउज़र में वॉइस इनपुट सक्रिय नहीं है। कृपया लिखकर पूछें या नीचे दिए आम सवालों पर टैप करें।'
      );
    }
  };

  const handleSendMessage = (messageText?: string) => {
    const textToSend = (messageText || inputText).trim();
    if (!textToSend) return;

    setInputText('');

    // 1. Add User Turn
    const userTurn: ChatTurn = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
    };

    setConversation((prev) => [...prev, userTurn]);
    setIsAnalyzing(true);

    // 2. Parse Context & Intent
    setTimeout(() => {
      const parsed = parseCustomerProblem(textToSend, activeContext);
      setActiveContext(parsed);

      let assistantText = '';
      let clarificationOptions: string[] | undefined = undefined;
      let actionButtonText: string | undefined = undefined;
      let actionCategory: string | undefined = undefined;
      let aiResponse: SetuAIResponse | undefined = undefined;

      if (parsed.isSafetyHazard) {
        // High-risk hazard: NO DIY steps, urgent safety alert
        assistantText = `${parsed.understoodSummary}\n\n${parsed.safetyMessage}\n\n👉 ${parsed.nextActionPrompt}`;
        actionButtonText = parsed.actionCategoryButton || 'आपातकालीन इलेक्ट्रीशियन देखें';
        actionCategory = parsed.category || 'electrician';
        aiResponse = analyzeConstructionQuery(textToSend);
      } else if (parsed.needsClarification) {
        // Incomplete info: ask single targeted question with chips
        assistantText = `${parsed.understoodSummary}\n\n👉 सवाल: ${parsed.clarificationQuestion}`;
        clarificationOptions = parsed.clarificationOptions;
      } else {
        // Clear intent identified: 1-line understood summary + next step prompt + category button
        assistantText = `${parsed.understoodSummary}\n\n👉 ${parsed.nextActionPrompt}`;
        actionButtonText = parsed.actionCategoryButton || 'उपलब्ध कारीगर देखें';
        actionCategory = parsed.category;
        aiResponse = analyzeConstructionQuery(textToSend);
      }

      const assistantTurn: ChatTurn = {
        id: 'assistant_' + Date.now(),
        sender: 'assistant',
        text: assistantText,
        parsedContext: parsed,
        clarificationOptions,
        actionButtonText,
        actionCategory,
        isSafetyHazard: parsed.isSafetyHazard,
        aiResponse,
      };

      setConversation((prev) => [...prev, assistantTurn]);
      setIsAnalyzing(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 400);
  };

  const handleSelectOption = (option: string) => {
    handleSendMessage(option);
  };

  const handleContractorAction = (category?: string) => {
    if (!category) {
      Alert.alert('सूचना', 'इस श्रेणी में अभी कोई सत्यापित कारीगर उपलब्ध नहीं है।');
      return;
    }
    if (onSelectContractorCategory) {
      onSelectContractorCategory(category);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleBox}>
              <View style={styles.aiGlowDot}>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>SETU AI उस्ताद (होम रिपेयर विशेषज्ञ)</Text>
                <Text style={styles.headerSubtitle}>सही समस्या की पहचान • सटीक कारीगर • नो-चीटिंग गारंटी</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Quick Trending / Common Problem Chips */}
          <View style={styles.trendingSection}>
            <Text style={styles.trendingLabel}>🔥 अक्सर पूछे जाने वाले सवाल (1-टैप):</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingScroll}
            >
              {TRENDING_TOPICS.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.trendingChip}
                  onPress={() => handleSendMessage(topic.query)}
                >
                  <Text style={styles.trendingChipText}>{topic.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages Body */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {conversation.map((turn) => (
              <View
                key={turn.id}
                style={[
                  styles.messageBubble,
                  turn.sender === 'user' ? styles.userBubble : styles.assistantBubble,
                  turn.isSafetyHazard && styles.hazardBubble,
                ]}
              >
                {turn.sender === 'assistant' && (
                  <View style={styles.assistantHeader}>
                    <Ionicons
                      name={turn.isSafetyHazard ? 'warning' : 'sparkles'}
                      size={14}
                      color={turn.isSafetyHazard ? '#DC2626' : '#4F46E5'}
                    />
                    <Text
                      style={[
                        styles.assistantTag,
                        turn.isSafetyHazard && { color: '#DC2626', fontWeight: '800' },
                      ]}
                    >
                      {turn.isSafetyHazard ? 'सुरक्षा चेतावनी' : 'AI उस्ताद'}
                    </Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.messageText,
                    turn.sender === 'user' ? styles.userMessageText : styles.assistantMessageText,
                    turn.isSafetyHazard && styles.hazardMessageText,
                  ]}
                >
                  {turn.text}
                </Text>

                {/* Clarification Options Chips */}
                {turn.clarificationOptions && turn.clarificationOptions.length > 0 && (
                  <View style={styles.optionsContainer}>
                    <Text style={styles.optionsPrompt}>कृपया सही स्थिति चुनें:</Text>
                    <View style={styles.optionsRow}>
                      {turn.clarificationOptions.map((opt, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.optionChip}
                          onPress={() => handleSelectOption(opt)}
                        >
                          <Text style={styles.optionChipText}>👉 {opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Direct Category Matching Button */}
                {turn.actionButtonText && turn.actionCategory && (
                  <TouchableOpacity
                    style={[
                      styles.actionCategoryBtn,
                      turn.isSafetyHazard && styles.hazardActionBtn,
                    ]}
                    onPress={() => handleContractorAction(turn.actionCategory)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={turn.isSafetyHazard ? 'alert-circle' : 'people'}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionCategoryBtnText}>
                      {turn.actionButtonText} ➔
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Standard Specs & Rate Breakdown (Non-Hazard) */}
                {turn.aiResponse && !turn.isSafetyHazard && (
                  <View style={styles.specsMiniBox}>
                    <View style={styles.specsHeader}>
                      <Ionicons name="shield-checkmark" size={14} color="#15803D" />
                      <Text style={styles.specsTitle}>मानक तकनीक & दर (CPWD/भोपाल):</Text>
                    </View>
                    <Text style={styles.specsFormula}>{turn.aiResponse.standardFormula}</Text>
                    <Text style={styles.specsEstimate}>{turn.aiResponse.sampleEstimate}</Text>
                  </View>
                )}
              </View>
            ))}

            {isAnalyzing && (
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>AI उस्ताद विश्लेषण कर रहा है...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input Box with Microphone & Send */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="समस्या लिखें... (उदा. 'Kitchen ka nal tapak raha hai')"
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSendMessage()}
              returnKeyType="send"
            />

            <View style={styles.inputButtonsRow}>
              {/* Mic Button */}
              <TouchableOpacity
                style={[styles.micBtn, isListening && styles.micBtnActive]}
                onPress={handleStartVoice}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isListening ? 'mic' : 'mic-outline'}
                  size={18}
                  color={isListening ? '#DC2626' : '#4F46E5'}
                />
              </TouchableOpacity>

              {/* Send Button */}
              <TouchableOpacity
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                onPress={() => handleSendMessage()}
                disabled={!inputText.trim()}
                activeOpacity={0.85}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiGlowDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  trendingSection: {
    marginBottom: 8,
  },
  trendingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  trendingScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  trendingChip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  trendingChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#3730A3',
  },
  chatScroll: {
    flex: 1,
    marginVertical: 4,
  },
  chatScrollContent: {
    paddingBottom: 16,
    gap: 10,
  },
  messageBubble: {
    borderRadius: 14,
    padding: 12,
    maxWidth: '92%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hazardBubble: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1.5,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  assistantTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  assistantMessageText: {
    color: '#0F172A',
    fontWeight: '500',
  },
  hazardMessageText: {
    color: '#991B1B',
    fontWeight: '600',
  },
  optionsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  optionsPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  optionsRow: {
    flexDirection: 'column',
    gap: 6,
  },
  optionChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  actionCategoryBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  hazardActionBtn: {
    backgroundColor: '#DC2626',
  },
  actionCategoryBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  specsMiniBox: {
    marginTop: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 8,
  },
  specsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  specsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  specsFormula: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
  },
  specsEstimate: {
    fontSize: 10.5,
    color: '#475569',
    marginTop: 2,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 11.5,
    color: '#64748B',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 4,
  },
  inputButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  micBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
});
