import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

interface LocationPickerModalProps {
  visible: boolean;
  currentLocation: string;
  onClose: () => void;
  onSelectLocation: (loc: string) => void;
}

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

  const handleDetectGps = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
            const res = await fetch(url);
            const geoData = await res.json();
            const addr = geoData.address || {};

            const area =
              addr.suburb ||
              addr.neighbourhood ||
              addr.road ||
              addr.residential ||
              'एमपी नगर';
            const city = addr.city || addr.town || addr.state_district || 'भोपाल';
            const pincode = addr.postcode || '462011';

            const detected = `${area}, ${city} • ${pincode}`;
            onSelectLocation(detected);
            onClose();
          } catch (e) {
            const fallbackLoc = `एमपी नगर (ज़ोन-1), भोपाल • 462011 (मैन्युअल चयनित)`;
            onSelectLocation(fallbackLoc);
            onClose();
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          setIsLocating(false);
          Alert.alert(
            'GPS अनुमति अस्वीकृत',
            'कृपया नीचे दी गई सूची से अपना इलाका मैन्युअल रूप से चुनें।'
          );
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      onSelectLocation('एमपी नगर (ज़ोन-1), भोपाल • 462011 (मैन्युअल चयनित)');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="location" size={22} color={COLORS.secondary} />
              <Text style={styles.title}>अपनी कार्य स्थल लोकेशन चुनें (भोपाल)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtext}>
            आपके सबसे नजदीकी उपलब्ध कारीगर और सप्लायर दिखाने के लिए आपकी लोकेशन आवश्यक है:
          </Text>

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
              <Text style={styles.gpsTitle}>वर्तमान GPS लोकेशन का उपयोग करें</Text>
              <Text style={styles.gpsSub}>
                {isLocating ? 'GPS लोकेशन खोजी जा रही है...' : 'ऑटोमैटिक पिनपॉइंट शुद्धता (भोपाल)'}
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
});
