import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AlertButton,
  AlertTone,
  AppAlertPayload,
  AppToastPayload,
  subscribeAppAlerts,
} from '../utils/appAlert';

const TONE_THEME: Record<
  AlertTone,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string; accent: string; border: string }
> = {
  success: {
    icon: 'checkmark-circle',
    bg: '#ECFDF5',
    color: '#059669',
    accent: '#10B981',
    border: '#A7F3D0',
  },
  warning: {
    icon: 'shield-half',
    bg: '#FFFBEB',
    color: '#D97706',
    accent: '#F59E0B',
    border: '#FDE68A',
  },
  error: {
    icon: 'alert-circle',
    bg: '#FEF2F2',
    color: '#DC2626',
    accent: '#EF4444',
    border: '#FECACA',
  },
  info: {
    icon: 'sparkles',
    bg: '#EFF6FF',
    color: '#2563EB',
    accent: '#3B82F6',
    border: '#BFDBFE',
  },
};

export const AppAlertHost: React.FC = () => {
  const [alertQueue, setAlertQueue] = useState<AppAlertPayload[]>([]);
  const [activeToast, setActiveToast] = useState<AppToastPayload | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = subscribeAppAlerts({
      onAlert: (payload) => {
        setAlertQueue((prev) => [...prev, payload]);
      },
      onToast: (toast) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setActiveToast(toast);
        toastTimerRef.current = setTimeout(() => {
          setActiveToast(null);
        }, 4200);
      },
    });
    return () => {
      unsub();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const currentAlert = alertQueue[0] || null;
  const toneStyle = currentAlert ? TONE_THEME[currentAlert.tone] : TONE_THEME.info;
  const toastTheme = activeToast ? TONE_THEME[activeToast.tone] : TONE_THEME.info;

  const dismissCurrentAlert = (btn?: AlertButton) => {
    setAlertQueue((prev) => prev.slice(1));
    if (btn?.onPress) {
      setTimeout(() => {
        try {
          btn.onPress?.();
        } catch (err) {
          console.warn('Alert action error:', err);
        }
      }, 30);
    }
  };

  return (
    <>
      {/* 1. Branded Sliding Top Notification Toast */}
      {activeToast && (
        <View style={styles.toastWrapper} pointerEvents="box-none">
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => setActiveToast(null)}
            style={[styles.toastCard, { borderLeftColor: toastTheme.accent }]}
          >
            <View style={[styles.toastIconCircle, { backgroundColor: toastTheme.bg }]}>
              <Ionicons name={toastTheme.icon} size={18} color={toastTheme.color} />
            </View>
            <View style={styles.toastTextWrap}>
              <Text style={styles.toastTitle} numberOfLines={1}>
                {activeToast.title}
              </Text>
              {activeToast.message ? (
                <Text style={styles.toastMessage} numberOfLines={2}>
                  {activeToast.message}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => setActiveToast(null)}
              style={styles.toastCloseBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. Branded Custom SETU Dialog / Confirmation Modal */}
      <Modal
        visible={Boolean(currentAlert)}
        transparent
        animationType="fade"
        onRequestClose={() => dismissCurrentAlert(currentAlert?.buttons.find((b) => b.style === 'cancel'))}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => {
            if (currentAlert && currentAlert.buttons.length <= 1) {
              dismissCurrentAlert(currentAlert.buttons[0]);
            }
          }}
        >
          <Pressable style={styles.dialogCard} onPress={() => {}}>
            {/* Top Brand Accent Header */}
            <View style={styles.dialogHeaderRow}>
              <View style={styles.brandChip}>
                <View style={styles.brandDot} />
                <Text style={styles.brandChipText}>SETU</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  dismissCurrentAlert(currentAlert?.buttons.find((b) => b.style === 'cancel') || currentAlert?.buttons[0])
                }
                style={styles.closeIconBtn}
              >
                <Ionicons name="close" size={17} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Tone Icon + Title + Message */}
            <View style={styles.bodyCenter}>
              <View style={[styles.heroIconWrap, { backgroundColor: toneStyle.bg, borderColor: toneStyle.border }]}>
                <Ionicons name={toneStyle.icon} size={28} color={toneStyle.color} />
              </View>
              <Text style={styles.dialogTitle}>{currentAlert?.title}</Text>
              {currentAlert?.message ? (
                <Text style={styles.dialogMessage}>{currentAlert.message}</Text>
              ) : null}
            </View>

            {/* Action Buttons */}
            <View
              style={[
                styles.buttonRow,
                (currentAlert?.buttons.length || 0) > 2 && styles.buttonColumn,
              ]}
            >
              {(currentAlert?.buttons || []).map((btn, idx) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';
                const isSingle = (currentAlert?.buttons.length || 0) === 1;
                return (
                  <TouchableOpacity
                    key={`${idx}_${btn.text || 'ok'}`}
                    activeOpacity={0.86}
                    onPress={() => dismissCurrentAlert(btn)}
                    style={[
                      styles.actionBtn,
                      !isSingle && (currentAlert?.buttons.length || 0) <= 2 && { flex: 1 },
                      isCancel
                        ? styles.cancelBtn
                        : isDestructive
                        ? styles.destructiveBtn
                        : [styles.primaryBtn, { backgroundColor: currentAlert?.tone === 'error' ? '#DC2626' : '#0F172A' }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        isCancel ? styles.cancelBtnText : styles.primaryBtnText,
                      ]}
                    >
                      {btn.text || (isCancel ? 'रद्द करें' : 'ठीक है')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    top: Platform.OS === 'web' ? 14 : 44,
    left: 12,
    right: 12,
    alignItems: 'center',
    zIndex: 99999,
  },
  toastCard: {
    width: '100%',
    maxWidth: 460,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderLeftWidth: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 14px 32px rgba(2, 6, 23, 0.45)',
        backdropFilter: 'blur(12px)',
      },
      default: {
        elevation: 10,
      },
    }),
  },
  toastIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastTextWrap: {
    flex: 1,
  },
  toastTitle: {
    color: '#F8FAFC',
    fontSize: 12.5,
    fontWeight: '800',
  },
  toastMessage: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  toastCloseBtn: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(6px)',
      },
    }),
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 24px 48px rgba(2, 6, 23, 0.32)',
      },
      default: {
        elevation: 14,
      },
    }),
  },
  dialogHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0F172A',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 99,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  brandChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  closeIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyCenter: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 22,
  },
  dialogMessage: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  buttonColumn: {
    flexDirection: 'column',
  },
  actionBtn: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0F172A',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  destructiveBtn: {
    backgroundColor: '#DC2626',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  primaryBtnText: {
    color: '#FFFFFF',
  },
  cancelBtnText: {
    color: '#334155',
  },
});
