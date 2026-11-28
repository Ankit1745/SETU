import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Language } from '../i18n/translations';
import { useResponsive } from '../hooks/useResponsive';

export interface SetuNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  targetRole?: string;
  createdAt: string;
  read?: boolean;
  meta?: Record<string, any>;
}

interface NotificationCenterModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: SetuNotificationItem[];
  onMarkRead: (id?: string) => void;
  onRefresh?: () => void;
  language?: Language;
}

function getNotifVisual(type: string) {
  const t = String(type || '').toUpperCase();
  if (t.includes('BOOKING')) return { icon: 'briefcase' as const, bg: '#DBEAFE', color: '#1D4ED8' };
  if (t.includes('KYC') || t.includes('APPROV')) return { icon: 'shield-checkmark' as const, bg: '#DCFCE7', color: '#15803D' };
  if (t.includes('MATERIAL')) return { icon: 'cube' as const, bg: '#FEF3C7', color: '#B45309' };
  if (t.includes('CONTRACTOR') || t.includes('MATCH')) return { icon: 'construct' as const, bg: '#E0E7FF', color: '#4338CA' };
  if (t.includes('ADMIN') || t.includes('BROADCAST')) return { icon: 'megaphone' as const, bg: '#FCE7F3', color: '#BE185D' };
  return { icon: 'notifications' as const, bg: '#F1F5F9', color: '#0F172A' };
}

function formatTimeLabel(iso: string): string {
  try {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return 'अभी';
    return dt.toLocaleString('hi-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'अभी';
  }
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  visible,
  onClose,
  notifications,
  onMarkRead,
  onRefresh,
  language = 'hi',
}) => {
  const isEn = language === 'en';
  const { getModalStyles } = useResponsive();
  const responsiveModal = getModalStyles({ maxWidth: 520 });
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, responsiveModal.overlayStyle]}>
        <View style={[styles.card, responsiveModal.containerStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.bellBadge}>
                <Ionicons name="notifications" size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {isEn ? 'SETU Notifications' : 'SETU नोटिफिकेशन व अलर्ट'}
                </Text>
                <Text style={styles.headerSub}>
                  {unreadCount > 0
                    ? isEn
                      ? `${unreadCount} unread updates`
                      : `${unreadCount} नए अपडेट प्रतीक्षारत`
                    : isEn
                    ? 'All caught up'
                    : 'सभी सूचनाएं पढ़ ली गई हैं'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={19} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Action Bar */}
          <View style={styles.toolbar}>
            {onRefresh ? (
              <TouchableOpacity style={styles.toolBtn} onPress={onRefresh} activeOpacity={0.8}>
                <Ionicons name="refresh" size={14} color="#2563EB" />
                <Text style={styles.toolBtnText}>{isEn ? 'Refresh' : 'रिफ्रेश'}</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.markAllBtn} onPress={() => onMarkRead()} activeOpacity={0.85}>
                <Ionicons name="checkmark-done" size={14} color="#FFFFFF" />
                <Text style={styles.markAllText}>
                  {isEn ? 'Mark all read' : 'सभी पढ़ा हुआ मानें'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="notifications-off-outline" size={38} color="#94A3B8" />
                <Text style={styles.emptyTitle}>
                  {isEn ? 'No notifications yet' : 'अभी कोई नया नोटिफिकेशन नहीं है'}
                </Text>
                <Text style={styles.emptySub}>
                  {isEn
                    ? 'Booking updates, verified pro matches, new supplier stock & KYC alerts will appear here.'
                    : 'नई बुकिंग, पास के नए कारीगर, सप्लायर माल और KYC से जुड़े सभी लाइव अलर्ट यहाँ दिखेंगे।'}
                </Text>
              </View>
            ) : (
              notifications.map((item) => {
                const vis = getNotifVisual(item.type);
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.88}
                    onPress={() => onMarkRead(item.id)}
                    style={[styles.notifCard, !item.read && styles.notifCardUnread]}
                  >
                    <View style={[styles.notifIconBox, { backgroundColor: vis.bg }]}>
                      <Ionicons name={vis.icon} size={18} color={vis.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.notifTopRow}>
                        <Text style={styles.notifTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        {!item.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notifBody}>{item.message}</Text>
                      <Text style={styles.notifTime}>{formatTimeLabel(item.createdAt)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxHeight: '84%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 22px 44px rgba(15, 23, 42, 0.35)',
      },
    }),
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bellBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  toolBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  list: {
    padding: 14,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 34,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 10,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 17,
  },
  notifCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  notifCardUnread: {
    backgroundColor: '#F8FAFF',
    borderColor: '#BFDBFE',
  },
  notifIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  notifTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginTop: 4,
  },
  notifBody: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 3,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 5,
  },
});
