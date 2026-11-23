import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

interface AdminSecurityModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [loginId, setLoginId] = useState('admin');
  const [passcode, setPasscode] = useState('SETU@Admin2026#Bhopal');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = async () => {
    if (!passcode.trim()) {
      setErrorMessage('कृपया मास्टर एडमिन सुरक्षा पासवर्ड दर्ज करें।');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const origin =
        Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin
          ? window.location.origin
          : 'https://setu-1-nine.vercel.app';

      const res = await fetch(`${origin}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: loginId.trim(),
          password: passcode.trim(),
          passcode: passcode.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.token) {
        onSuccess(data.token);
        onClose();
        Alert.alert('✅ एडमिन प्रमाणीकरण सफल', 'SETU केंद्रीय नियंत्रण कक्ष में आपका स्वागत है।');
      } else {
        setErrorMessage(data.error || 'अमान्य लॉगिन आईडी या पासवर्ड! प्रवेश अस्वीकृत।');
      }
    } catch (err: any) {
      setErrorMessage('सर्वर से संपर्क नहीं हो सका। केवल अधिकृत सुपर एडमिन ही प्रवेश कर सकते हैं।');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.shieldIconBox}>
              <Ionicons name="shield-checkmark" size={26} color="#DC2626" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>SETU सुपर एडमिन नियंत्रण कक्ष</Text>
          <Text style={styles.subtitle}>
            ⛔ उच्च सुरक्षा क्षेत्र (Restricted Area) — केवल अधिकृत सुपरवाइजर व एडमिन के लिए आरक्षित है।
          </Text>

          {/* Login ID Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>एडमिन लॉगिन आईडी (Admin ID / Username):</Text>
            <View style={styles.pinRow}>
              <MaterialIcons name="person" size={20} color="#64748B" style={styles.lockIcon} />
              <TextInput
                style={styles.pinInput}
                placeholder="उदा. admin"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                value={loginId}
                onChangeText={(val) => {
                  setLoginId(val);
                  setErrorMessage('');
                }}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>मास्टर सिक्योरिटी पासवर्ड (Admin Password):</Text>
            <View style={styles.pinRow}>
              <MaterialIcons name="lock" size={20} color="#64748B" style={styles.lockIcon} />
              <TextInput
                style={styles.pinInput}
                placeholder="प्रशासकीय पासवर्ड दर्ज करें"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={passcode}
                onChangeText={(val) => {
                  setPasscode(val);
                  setErrorMessage('');
                }}
              />
            </View>

            {/* Quick credentials hint */}
            <View style={styles.credentialsHint}>
              <Ionicons name="key" size={13} color="#D97706" />
              <Text style={styles.credentialsHintText}>
                डिफ़ॉल्ट क्रेडेंशियल्स: ID: <Text style={{fontWeight: '700'}}>admin</Text> | Pass: <Text style={{fontWeight: '700'}}>SETU@Admin2026#Bhopal</Text>
              </Text>
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={14} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>रद्द करें</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={handleVerify}
              activeOpacity={0.85}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyBtnText}>सत्यापित करें & खोलें ➔</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Safe Demo Read-Only Access */}
          <TouchableOpacity
            style={styles.demoReadonlyBtn}
            onPress={() => {
              onSuccess('demo_readonly_token');
              onClose();
              Alert.alert(
                '👀 एडमिन डेमो मोड सक्रिय',
                'आप केवल सैंपल रिकॉर्ड्स (KYC, बुकिंग, मेट्रिक्स) सुरक्षित रूप से पढ़ सकते हैं।'
              );
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="eye-outline" size={16} color="#4F46E5" />
            <Text style={styles.demoReadonlyBtnText}>Admin Demo देखें (Read-Only Sample Records)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shieldIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 16,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
  },
  lockIcon: {
    marginRight: 6,
  },
  pinInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 2,
  },
  credentialsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  credentialsHintText: {
    fontSize: 10.5,
    color: '#92400E',
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hintText: {
    fontSize: 10.5,
    color: '#DC2626',
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  verifyBtn: {
    flex: 2,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifyBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  demoReadonlyBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderRadius: 10,
    paddingVertical: 10,
  },
  demoReadonlyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3730A3',
  },
});
