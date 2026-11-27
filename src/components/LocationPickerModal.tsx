import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useResponsive } from '../hooks/useResponsive';
import { detectLiveGpsLocation } from '../utils/liveLocation';
import { showAppAlert } from '../utils/appAlert';

interface LocationPickerModalProps {
  visible: boolean;
  currentLocation: string;
  onClose: () => void;
  onSelectLocation: (loc: string) => void;
}

const PAN_INDIA_CITIES = [
  { name: 'दिल्ली (Delhi / NCR)', pincode: '110001', eta: '15-25 मिनट' },
  { name: 'मुंबई (Andheri / Bandra)', pincode: '400053', eta: '15-25 मिनट' },
  { name: 'बेंगलुरु (Indiranagar / Koramangala)', pincode: '560038', eta: '15-25 मिनट' },
  { name: 'पुणे (Kothrud / Baner)', pincode: '411038', eta: '15-20 मिनट' },
  { name: 'इंदौर (Vijay Nagar / Palasia)', pincode: '452010', eta: '12-18 मिनट' },
  { name: 'जयपुर (Vaishali Nagar / Malviya)', pincode: '302021', eta: '12-18 मिनट' },
  { name: 'लखनऊ (Gomti Nagar)', pincode: '226010', eta: '12-20 मिनट' },
  { name: 'हैदराबाद (Madhapur / Gachibowli)', pincode: '500081', eta: '15-25 मिनट' },
];

const POPULAR_LOCALITIES = [
  { name: 'एमपी नगर (ज़ोन 1 & 2), भोपाल', pincode: '462011', eta: '10-15 मिनट' },
  { name: 'कोलार रोड & मंदाकिनी, भोपाल', pincode: '462042', eta: '12-18 मिनट' },
  { name: 'अरेरा कॉलोनी (E-1 से E-7), भोपाल', pincode: '462016', eta: '10-15 मिनट' },
  { name: 'होशंगाबाद रोड & मिसरोद, भोपाल', pincode: '462026', eta: '15-20 मिनट' },
  { name: 'इंद्रपुरी & भेल (BHEL), भोपाल', pincode: '462022', eta: '12-18 मिनट' },
  { name: 'अयोध्या बाईपास & मिनाल, भोपाल', pincode: '462041', eta: '15-22 मिनट' },
  { name: 'बैरागढ़ / संत हिरदाराम नगर, भोपाल', pincode: '462030', eta: '15-20 मिनट' },
  { name: 'चूना भट्टी & शाहपुरा, भोपाल', pincode: '462016', eta: '10-15 मिनट' },
  { name: 'करोंद & लांबाखेड़ा, भोपाल', pincode: '462038', eta: '15-20 मिनट' },
  { name: 'न्यू मार्केट & टीटी नगर, भोपाल', pincode: '462003', eta: '10-14 मिनट' },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  currentLocation,
  onClose,
  onSelectLocation,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [customCityQuery, setCustomCityQuery] = useState('');

  const handleApplyCustomLocation = () => {
    const clean = customCityQuery.trim();
    if (!clean) return;
    onSelectLocation(clean);
    setCustomCityQuery('');
    onClose();
  };

  const handleDetectGps = async () => {
    setIsLocating(true);
    const res = await detectLiveGpsLocation();
    setIsLocating(false);
    if (res.ok && res.formattedLocation) {
      onSelectLocation(res.formattedLocation);
      onClose();
    } else {
      showAppAlert(
        '📍 लाइव GPS लोकेशन',
        res.error || 'कृपया नीचे से अपना शहर या क्षेत्र मैन्युअल चुनें।'
      );
    }
  };

  const { getModalStyles } = useResponsive();
  const { isDialog, overlayStyle, containerStyle } = getModalStyles({ maxWidth: 580 });

  return (
    <Modal visible={visible} animationType={isDialog ? 'fade' : 'slide'} transparent={true} onRequestClose={onClose}>
      <View style={overlayStyle}>
        <View style={[styles.container, containerStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="location" size={22} color={COLORS.secondary} />
              <Text style={styles.title}>अपनी कार्य स्थल लोकेशन चुनें</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtext}>
            आपके शहर के असली लेबर रेट व नजदीकी सप्लायर दिखाने के लिए लोकेशन चुनें या लिखें:
          </Text>

          {/* Custom City / Area Search */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="अपना शहर या कॉलोनी लिखें (उदा. इंदौर, विजय नगर)..."
              placeholderTextColor={COLORS.textMuted}
              value={customCityQuery}
              onChangeText={setCustomCityQuery}
              onSubmitEditing={handleApplyCustomLocation}
              returnKeyType="done"
            />
            {customCityQuery.trim() ? (
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCustomLocation}>
                <Text style={styles.applyBtnText}>सेट करें</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Pan-India City Quick Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {PAN_INDIA_CITIES.map((c, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.cityChip}
                  onPress={() => {
                    onSelectLocation(`${c.name} • ${c.pincode}`);
                    onClose();
                  }}
                >
                  <Text style={styles.cityChipText}>{c.name.split('(')[0].trim()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* GPS Auto Detect Button */}
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleDetectGps}
            activeOpacity={0.8}
            disabled={isLocating}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialIcons name="my-location" size={20} color="#FFFFFF" />
            )}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.gpsTitle}>लाइव GPS लोकेशन ऑन करें (Live Detect)</Text>
              <Text style={styles.gpsSub}>
                {isLocating ? 'सैटेलाइट GPS से आपका शहर खोजा जा रहा है...' : 'आपके वर्तमान पते और पिनकोड का स्वतः पता लगाएं'}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.popularHeader}>भोपाल के प्रमुख क्षेत्र (Popular Localities):</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {POPULAR_LOCALITIES.map((loc, idx) => {
              const isSelected = currentLocation.includes(loc.name.split(',')[0]);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.locItem, isSelected && styles.locItemActive]}
                  onPress={() => {
                    onSelectLocation(`${loc.name} • ${loc.pincode}`);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.locIcon}>
                    <MaterialIcons
                      name="location-on"
                      size={18}
                      color={isSelected ? COLORS.primary : COLORS.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.locName, isSelected && styles.locNameActive]}>
                      {loc.name}
                    </Text>
                    <Text style={styles.locSub}>पिनकोड: {loc.pincode}</Text>
                  </View>
                  <View style={styles.etaBadge}>
                    <Text style={styles.etaText}>⚡ {loc.eta}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  subtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  gpsButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  gpsTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  gpsSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  popularHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  list: {
    maxHeight: 350,
  },
  locItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  locItemActive: {
    backgroundColor: '#EFF6FF',
    borderBottomColor: 'transparent',
  },
  locIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  locNameActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  locSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  etaBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  etaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: COLORS.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cityChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  cityChipText: {
    color: COLORS.primary,
    fontSize: 11.5,
    fontWeight: '700',
  },
});
