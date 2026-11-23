import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { WorkVideo } from '../data/mockData';
import { COLORS } from '../theme/colors';

interface VideoPlayerModalProps {
  visible: boolean;
  video: WorkVideo | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  video,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  if (!video) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.badgeWrapper}>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: video.type === 'CUSTOMER_TESTIMONIAL' ? '#15803D' : COLORS.primary },
                ]}
              >
                <Text style={styles.typeBadgeText}>
                  {video.type === 'CUSTOMER_TESTIMONIAL' ? '🗣️ ग्राहक वीडियो रिव्यू' : '🎥 कार्य वॉकथ्रू'}
                </Text>
              </View>
              <Text style={styles.videoDate}>📅 {video.date}</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Video Player Display Screen */}
          <View style={styles.videoScreen}>
            <Image source={{ uri: video.thumbnail }} style={styles.videoImage} resizeMode="cover" />

            {/* Play/Pause Overlay */}
            <TouchableOpacity
              style={styles.playPauseOverlay}
              activeOpacity={0.8}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <View style={styles.playCircle}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#FFFFFF"
                  style={{ marginLeft: isPlaying ? 0 : 4 }}
                />
              </View>
            </TouchableOpacity>

            {/* Player Controls Bar */}
            <View style={styles.controlsBar}>
              <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Progress Bar */}
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarFill} />
              </View>

              <Text style={styles.timeText}>{video.duration}</Text>

              <TouchableOpacity onPress={() => setIsMuted(!isMuted)}>
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Video Metadata & Verified Badge */}
          <View style={styles.metaSection}>
            <Text style={styles.videoTitle}>{video.title}</Text>
            <View style={styles.authorRow}>
              <View style={styles.authorBadge}>
                <MaterialIcons name="verified" size={14} color="#0284C7" />
                <Text style={styles.authorText}>प्रमाणित: {video.author}</Text>
              </View>
              <Text style={styles.setuVerifiedTag}>🛡️ 100% SETU वेरिफाइड वीडियो</Text>
            </View>
            <Text style={styles.videoNotice}>
              यह वीडियो कार्य स्थल से सीधे रिकॉर्ड किया गया है, किसी भी प्रकार के संपादन (editing) के बिना वास्तविक गुणवत्ता को दर्शाता है।
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#0F172A',
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  videoDate: {
    color: '#94A3B8',
    fontSize: 10,
  },
  closeBtn: {
    padding: 2,
  },
  videoScreen: {
    width: '100%',
    height: 240,
    position: 'relative',
    backgroundColor: '#000000',
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  playPauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  controlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  progressBarWrapper: {
    flex: 1,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '45%',
    height: '100%',
    backgroundColor: '#EF4444',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  metaSection: {
    padding: 14,
    backgroundColor: '#0F172A',
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  setuVerifiedTag: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  videoNotice: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 14,
  },
});
